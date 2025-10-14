import React, { useRef } from 'react';
import FileTextIcon from './icons/FileTextIcon';
import XCircleIcon from './icons/XCircleIcon';

interface PdfUploaderProps {
  onPdfChange: (file: File | null) => void;
  pdfPreview: string | null;
  isProcessingPdf: boolean;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onPdfChange, pdfPreview, isProcessingPdf }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!isProcessingPdf) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Envie a Planta Baixa</h2>
      <div
        className={`relative w-full aspect-video bg-white rounded-lg border-2 border-dashed flex items-center justify-center p-2 transition-colors duration-300 ${
          !isProcessingPdf && 'hover:border-indigo-400 cursor-pointer'
        }`}
        onClick={handleAreaClick}
      >
        {isProcessingPdf ? (
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
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
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessingPdf}
        />
      </div>
    </div>
  );
};

export default PdfUploader;