import React, { useRef, useState, useEffect } from 'react';
import UploadIcon from './icons/UploadIcon';
import XCircleIcon from './icons/XCircleIcon';
import CameraIcon from './icons/CameraIcon';
import { showError } from '../utils/toast';

interface ImageUploaderProps {
  originalImagePreview: string | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  fileInputKey: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ originalImagePreview, onImageChange, onClearImage, fileInputKey }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showOptions, setShowOptions] = useState(false); // Novo estado para controlar o menu de opções

  const isMobile = window.matchMedia('(pointer: coarse)').matches; // Detecta dispositivos de toque (geralmente mobile)

  const handleAreaClick = () => {
    if (!isCameraActive) {
      if (isMobile) {
        setShowOptions(true); // No mobile, mostra o menu de opções customizado
      } else {
        fileInputRef.current?.click(); // No desktop, abre diretamente o seletor de arquivos
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
        videoRef.current.play(); // Garante que o vídeo comece a tocar
      }
      setStream(mediaStream);
      setIsCameraActive(true);
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
            const file = new File([blob], "camera_photo.png", { type: "image/png" });
            onImageChange({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
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
      <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Envie uma Imagem</h2>
      <div className="relative w-full aspect-video bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-cs-blue transition-colors duration-300 p-2">
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
        ) : originalImagePreview ? (
          <>
            <img src={originalImagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
            <button
              onClick={onClearImage}
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              aria-label="Limpar imagem"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </>
        ) : (
          <div
            className="text-center text-gray-500 cursor-pointer p-4 w-full h-full flex flex-col items-center justify-center"
            onClick={handleAreaClick}
          >
            <UploadIcon className="w-10 h-10 mb-2" />
            <p className="font-semibold">Clique para enviar</p>
            <p className="text-sm">ou arraste e solte uma imagem</p>
            <span className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP</span>
          </div>
        )}
        <input
          key={fileInputKey}
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={onImageChange}
          className="hidden"
        />

        {isMobile && showOptions && (
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

export default ImageUploader;