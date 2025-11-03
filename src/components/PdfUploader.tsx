import React, { useRef, useState, useEffect } from 'react';
import FileTextIcon from './icons/FileTextIcon';
import XCircleIcon from './icons/XCircleIcon';
import CameraIcon from './icons/CameraIcon';
import { showError } from '../utils/toast';

interface PdfUploaderProps {
  onPdfChange: (file: File | null) => void;
  pdfPreview: string | null;
  isProcessingPdf: boolean;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onPdfChange, pdfPreview, isProcessingPdf }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showOptions, setShowOptions] = useState(false); // Novo estado para controlar o menu de opções

  const isMobile = window.matchMedia('(pointer: coarse)').matches; // Detecta dispositivos de toque (geralmente mobile)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onPdfChange(file || null);
  };

  const handleClear = () => {
    onPdfChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAreaClick = () => {
    if (!isProcessingPdf && !isCameraActive) {
      if (isMobile) {
        fileInputRef.current?.click(); // No mobile, o input nativo já oferece opções de câmera
      } else {
        setShowOptions(true); // No desktop, mostra o menu de opções customizado
      }
    }
  };

  const handleUploadFromFile = () => {
    fileInputRef.current?.click();
    setShowOptions(false);
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
      // handleClear(); // REMOVIDO: Não limpar o PDF/imagem original ao iniciar a câmera
      setShowOptions(false); // Fecha as opções após iniciar a câmera
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      showError("Não foi possível acessar a câmera. Verifique as permissões.");
      setIsCameraActive(false);
      setShowOptions(false); // Fecha as opções em caso de erro
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
            const file = new File([blob], "camera_photo_floorplan.png", { type: "image/png" });
            // Simula um evento de mudança de arquivo para o onPdfChange
            onPdfChange(file); 
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

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Envie a Planta Baixa</h2>
      <div
        className={`relative w-full aspect-video bg-white rounded-lg border-2 border-dashed flex items-center justify-center p-2 transition-colors duration-300 ${
          !isProcessingPdf && !isCameraActive && 'hover:border-cs-blue cursor-pointer'
        }`}
        onClick={handleAreaClick}
      >
        {isCameraActive ? (
          <div className="relative w-full h-full bg-black rounded-lg flex flex-col items-center justify-center">
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
        ) : isProcessingPdf ? (
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-semibold">Processando PDF...</p>
          </div>
        ) : pdfPreview ? (
          <>
            <img src={pdfPreview} alt="Pré-visualização da planta" className="max-h-full max-w-full object-contain rounded-md" />
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              aria-label="Limpar PDF"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <FileTextIcon className="w-10 h-10 mb-2 mx-auto" />
            <p className="font-semibold">Clique para enviar um PDF</p>
            <p className="text-sm">A primeira página será usada como base</p>
            {/* O botão "Tirar Foto" foi removido daqui, pois a lógica agora está no menu de opções ou no input nativo */}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessingPdf || isCameraActive}
        />

        {showOptions && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10" onClick={() => setShowOptions(false)}>
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col gap-4 w-64" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleUploadFromFile}
                className="bg-cs-blue text-white font-bold py-2 rounded-lg hover:bg-cs-blue/90 transition-colors"
              >
                Enviar do Arquivo
              </button>
              <button
                onClick={startCamera}
                className="bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tirar Foto
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="text-gray-600 hover:text-gray-800 mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfUploader;