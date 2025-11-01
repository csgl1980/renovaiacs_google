import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { User, Project } from '../types';
import ImageUploader from '../components/ImageUploader';
import DrawingCanvas from '../components/DrawingCanvas';
import VoiceInputButton from '../components/VoiceInputButton';
import DownloadIcon from '../components/icons/DownloadIcon';
import ShareIcon from '../components/icons/ShareIcon';
import CameraIcon from '../components/icons/CameraIcon';
import SaveIcon from '../components/icons/SaveIcon';
import SparklesIcon from '../components/icons/SparklesIcon'; // Importação adicionada
import { useImageUpload } from '../hooks/useImageUpload';
import { useObjectManipulation } from '../hooks/useObjectManipulation';
import { showError } from '../utils/toast';

type ObjectManipulationFunction = 'none' | 'clean' | 'replace';

interface ObjectManipulationViewProps {
  user: User;
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  onSaveToProject: () => void;
  projects: Project[];
  saveProject: (projectId: string | null, newProjectName: string) => Promise<void>;
}

const ObjectManipulationView: React.FC<ObjectManipulationViewProps> = ({
  user,
  setBuyCreditsModalOpen,
  setError,
  onSaveToProject,
  projects,
  saveProject,
}) => {
  const [selectedFunction, setSelectedFunction] = useState<ObjectManipulationFunction>('none');
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const {
    originalImageFile, originalImagePreview,
    fileInputKey,
    handleImageChange, handleClearImage,
    clearUploadState, setUploadError,
  } = useImageUpload(setError);

  const {
    prompt, setPrompt,
    generatedImage,
    isLoading, generationError,
    handleCleanObject, handleReplaceObject,
    clearResults,
    cleanCost, replaceCost,
  } = useObjectManipulation({
    originalImageFile,
    maskDataUrl,
    setBuyCreditsModalOpen,
    setError,
  });

  const isImageUploaded = originalImagePreview !== null;
  const hasMask = maskDataUrl !== null;
  const hasEnoughCreditsForClean = user ? user.credits >= cleanCost : false;
  const hasEnoughCreditsForReplace = user ? user.credits >= replaceCost : false;

  const handleFunctionSelect = (func: ObjectManipulationFunction) => {
    setSelectedFunction(func);
    clearUploadState();
    clearResults();
    setMaskDataUrl(null);
    setPrompt('');
    setError(null);
    stopCamera();
  };

  const handleVoiceResult = (text: string) => {
    setPrompt(prevPrompt => (prevPrompt ? `${prevPrompt} ${text}` : text));
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // Prefer back camera
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      showError("Não foi possível acessar a câmera. Verifique as permissões.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && photoCanvasRef.current) {
      const video = videoRef.current;
      const canvas = photoCanvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_photo.png", { type: "image/png" });
            handleImageChange({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
            stopCamera();
          } else {
            showError("Falha ao capturar a foto.");
          }
        }, 'image/png');
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera(); // Stop camera when component unmounts
    };
  }, []);

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `renova-ia-ces-manipulacao.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
      showError("Não foi possível baixar a imagem. Tente novamente.");
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `renova-ia-ces-manipulacao.png`, { type: blob.type });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Minha Transformação IA C&S',
                text: 'Veja a manipulação de objeto que criei com o Renova IA da C&S Construção!',
                files: [file],
            });
        } else {
           showError("Seu navegador não suporta o compartilhamento de arquivos.");
        }
    } catch(e) {
        console.error("Share failed:", e);
        showError("O compartilhamento falhou.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800">Substituição / Limpeza de Objetos</h2>
        <p className="text-gray-600 text-sm">
          Selecione uma função para começar.
        </p>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => handleFunctionSelect('clean')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
              selectedFunction === 'clean' ? 'bg-cs-blue text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Limpeza de Objeto
          </button>
          <button
            onClick={() => handleFunctionSelect('replace')}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
              selectedFunction === 'replace' ? 'bg-cs-blue text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Substituição de Objeto
          </button>
        </div>

        {selectedFunction !== 'none' && (
          <>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">1. Envie a Imagem Base</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <ImageUploader
                  originalImagePreview={originalImagePreview}
                  onImageChange={handleImageChange}
                  onClearImage={handleClearImage}
                  fileInputKey={fileInputKey}
                />
              </div>
              <div className="flex-shrink-0">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="w-full sm:w-auto h-full flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-cs-blue transition-colors duration-300"
                    aria-label="Tirar foto com a câmera"
                  >
                    <CameraIcon className="w-10 h-10 mb-2" />
                    <p className="font-semibold">Tirar Foto</p>
                  </button>
                ) : (
                  <div className="relative w-full sm:w-auto aspect-video bg-black rounded-lg flex flex-col items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover rounded-lg"></video>
                    <button
                      onClick={takePhoto}
                      className="absolute bottom-4 bg-cs-blue text-white p-3 rounded-full shadow-lg hover:bg-cs-blue/90 transition-colors"
                      aria-label="Capturar foto"
                    >
                      <CameraIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="absolute top-4 right-4 bg-white/30 text-white p-2 rounded-full hover:bg-white/50 transition-colors"
                      aria-label="Fechar câmera"
                    >
                      X
                    </button>
                    <canvas ref={photoCanvasRef} style={{ display: 'none' }}></canvas>
                  </div>
                )}
              </div>
            </div>

            {isImageUploaded && (
              <>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">2. Marque o Objeto</h3>
                <DrawingCanvas
                  imageSrc={originalImagePreview}
                  onDrawingChange={setMaskDataUrl}
                  disabled={isLoading}
                />
              </>
            )}

            {selectedFunction === 'replace' && isImageUploaded && hasMask && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">3. Descreva a Substituição</h3>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Substitua por um vaso de plantas grande e moderno."
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue transition-shadow duration-200"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="absolute top-2 right-2">
                    <VoiceInputButton onResult={handleVoiceResult} disabled={isLoading} />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={selectedFunction === 'clean' ? handleCleanObject : handleReplaceObject}
              disabled={
                isLoading ||
                !isImageUploaded ||
                !hasMask ||
                (selectedFunction === 'replace' && !prompt.trim()) ||
                (selectedFunction === 'clean' && !hasEnoughCreditsForClean && !user?.is_admin) ||
                (selectedFunction === 'replace' && !hasEnoughCreditsForReplace && !user?.is_admin)
              }
              className={`w-full flex flex-col items-center justify-center gap-1 bg-cs-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-cs-blue/90 transition-colors duration-300 disabled:bg-cs-blue/50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    {selectedFunction === 'clean' ? 'Limpar Objeto' : 'Substituir Objeto'}
                  </>
                )}
              </div>
              {!isLoading && isImageUploaded && hasMask && (
                <span className={`text-xs flex items-center gap-1 ${
                  (selectedFunction === 'clean' && hasEnoughCreditsForClean) ||
                  (selectedFunction === 'replace' && hasEnoughCreditsForReplace) ||
                  user?.is_admin
                    ? 'text-cs-blue/80'
                    : 'text-white font-bold'
                }`}>
                  {selectedFunction === 'clean' && !user?.is_admin && (hasEnoughCreditsForClean ? `(Custa ${cleanCost} créditos)` : 'Créditos insuficientes')}
                  {selectedFunction === 'replace' && !user?.is_admin && (hasEnoughCreditsForReplace ? `(Custa ${replaceCost} créditos)` : 'Créditos insuficientes')}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Resultado</h2>
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
          {isLoading && (
            <div className="text-center text-gray-600">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-semibold text-lg">Gerando transformação...</p>
              <p className="text-sm text-gray-500">Isso pode levar alguns segundos.</p>
            </div>
          )}
          {generationError && !isLoading && (
            <div className="text-center text-red-600 p-4">
              <h3 className="font-bold text-lg mb-2">Ocorreu um Erro</h3>
              <p className="text-sm bg-red-50 p-3 rounded-md">{generationError}</p>
            </div>
          )}
          {!isLoading && !generationError && !generatedImage && (
            <div className="text-center text-gray-500 p-4">
              <h3 className="text-lg font-semibold text-gray-700">O resultado aparecerá aqui</h3>
              <p className="text-sm">Selecione uma função e gere a transformação.</p>
            </div>
          )}
          {generatedImage && (
            <>
              <img src={generatedImage} alt="Generated result" className="max-h-full max-w-full object-contain" />
              <div className="absolute bottom-4 flex items-center justify-center gap-4 bg-gray-50 p-2 rounded-full">
                <button onClick={handleDownload} className="relative group bg-white rounded-full p-3 text-gray-600 hover:bg-gray-100 hover:text-cs-blue transition-all duration-200 shadow-md" aria-label="Baixar Imagem">
                  <DownloadIcon className="w-5 h-5" />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Baixar Imagem
                  </div>
                </button>
                {navigator.share && (
                  <button onClick={handleShare} className="relative group bg-white rounded-full p-3 text-gray-600 hover:bg-gray-100 hover:text-cs-blue transition-all duration-200 shadow-md" aria-label="Compartilhar">
                    <ShareIcon className="w-5 h-5" />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Compartilhar
                    </div>
                  </button>
                )}
                <button onClick={onSaveToProject} className="relative group bg-white rounded-full p-3 text-gray-600 hover:bg-gray-100 hover:text-cs-blue transition-all duration-200 shadow-md" aria-label="Salvar no Projeto">
                  <SaveIcon className="w-5 h-5" />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Salvar no Projeto
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectManipulationView;