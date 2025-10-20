import React, { useRef } from 'react';
import UploadIcon from './icons/UploadIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ImageUploaderProps {
  originalImagePreview: string | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  fileInputKey: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ originalImagePreview, onImageChange, onClearImage, fileInputKey }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Envie uma Imagem</h2>
      <div className="relative w-full aspect-video bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-cs-blue transition-colors duration-300 p-2">
        {originalImagePreview ? (
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
      </div>
    </div>
  );
};

export default ImageUploader;