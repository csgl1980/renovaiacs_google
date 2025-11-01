import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { User, Project } from '../types';
import ImageUploader from '../components/ImageUploader';
import PromptControls from '../components/PromptControls';
import ResultDisplay from '../components/ResultDisplay';
import { useImageUpload } from '../hooks/useImageUpload';
import { useGeneration } from '../hooks/useGeneration';
import { useCostEstimation } from '../hooks/useCostEstimation';
import { useInternalViews } from '../hooks/useInternalViews';
import { showSuccess, showError } from '../utils/toast';
import { EXTERIOR_STYLE_OPTIONS } from '../constants';
import CameraIcon from '../components/icons/CameraIcon'; // Importar CameraIcon

interface ExteriorDesignViewProps {
  user: User;
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  onSaveToProject: () => void;
  projects: Project[];
  saveProject: (projectId: string | null, newProjectName: string) => Promise<void>;
}

const ExteriorDesignView: React.FC<ExteriorDesignViewProps> = ({
  user,
  setBuyCreditsModalOpen,
  setError,
  onSaveToProject,
  projects,
  saveProject,
}) => {
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
    prompt, setPrompt, selectedStyle, setSelectedStyle,
    generatedImage, setGeneratedImage,
    isLoading, isVariationLoading, generationError,
    handleGenerate, clearGenerationResults, generationCost,
  } = useGeneration({
    originalImageFile,
    mode: 'exteriorDesign', // Modo correto para este hook
    setBuyCreditsModalOpen,
    setError,
  });

  const {
    isEstimatingCost, costEstimate, costError,
    handleEstimateCost, clearCostEstimation, estimationCost,
  } = useCostEstimation({
    generatedImage,
    prompt,
    selectedStyle,
    setBuyCreditsModalOpen,
  });

  const {
    isInternalViewsLoading, internalViews, internalViewsError,
    handleGenerateInternalViews, clearInternalViews, internalViewsCost,
  } = useInternalViews({
    generatedImage,
    prompt,
    selectedStyle,
    setBuyCreditsModalOpen,
  });

  const isImageUploaded = originalImagePreview !== null;

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
    // Limpar estados ao montar/desmontar ou mudar de modo
    return () => {
      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      setError(null);
      stopCamera(); // Garante que a câmera seja desligada
    };
  }, [clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews, setError]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800">Design Exterior</h2>
        <p className="text-gray-600 text-sm">
          Transforme a fachada e o paisagismo do seu imóvel.
        </p>
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
        <PromptControls
          prompt={prompt}
          setPrompt={setPrompt}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          handleGenerate={() => handleGenerate(false)}
          isLoading={isLoading}
          isImageUploaded={isImageUploaded}
          cost={generationCost}
          credits={user.credits}
          styleOptions={EXTERIOR_STYLE_OPTIONS}
        />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <ResultDisplay
          mode="image" // Tratamos como modo imagem para o ResultDisplay
          originalPreview={originalImagePreview}
          generatedImage={generatedImage}
          isLoading={isLoading}
          isVariationLoading={isVariationLoading}
          error={generationError}
          onGenerateVariation={() => handleGenerate(true)}
          onEstimateCost={handleEstimateCost}
          isEstimatingCost={isEstimatingCost}
          costEstimate={costEstimate}
          costError={costError}
          onGenerateInternalViews={handleGenerateInternalViews}
          isInternalViewsLoading={isInternalViewsLoading}
          internalViews={internalViews}
          internalViewsError={internalViewsError}
          onSaveToProject={onSaveToProject} // Passa a função onSaveToProject
          credits={user.credits}
          variationCost={2}
          internalViewsCost={internalViewsCost}
        />
      </div>
    </div>
  );
};

export default ExteriorDesignView;