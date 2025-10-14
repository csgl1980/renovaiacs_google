import React, { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';

// PDF.js Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@5.4.149/build/pdf.worker.mjs`;

// Helper to convert PDF to an image-like file for preview and processing
const processPdfToImageFile = async (pdfFile: File): Promise<{ previewUrl: string, imageFile: File }> => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error("Falha ao ler o arquivo PDF."));
      }

      try {
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        const page = await pdf.getPage(1); // Get the first page

        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          return reject(new Error("Não foi possível obter o contexto do canvas."));
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport, canvas }).promise;

        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error("Falha ao converter o canvas para blob."));
          }
          const imageFile = new File([blob], pdfFile.name.replace(/\.pdf$/i, '.png'), { type: 'image/png' });
          const previewUrl = URL.createObjectURL(blob);
          resolve({ previewUrl, imageFile });
        }, 'image/png', 0.95); // High quality PNG
      } catch (error) {
         console.error("Erro no processamento do PDF.js:", error);
         reject(new Error("Ocorreu um erro ao processar o arquivo PDF. Pode estar corrompido ou em um formato não suportado."));
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo PDF."));
    };
    
    fileReader.readAsArrayBuffer(pdfFile);
  });
};

interface UseImageUploadResult {
  originalImageFile: File | null;
  originalImagePreview: string | null;
  pdfFile: File | null;
  pdfPreview: string | null;
  isProcessingPdf: boolean;
  fileInputKey: number;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePdfChange: (file: File | null) => Promise<void>;
  handleClearImage: () => void;
  clearUploadState: () => void;
  setUploadError: (error: string | null) => void;
}

export const useImageUpload = (setError: (error: string | null) => void): UseImageUploadResult => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // To reset file input

  const clearUploadState = useCallback(() => {
    setOriginalImageFile(null);
    setOriginalImagePreview(null);
    setPdfFile(null);
    setPdfPreview(null);
    setFileInputKey(Date.now());
    setError(null); // Clear any upload-related errors
  }, [setError]);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      clearUploadState();
      setOriginalImageFile(file);
      setOriginalImagePreview(URL.createObjectURL(file));
    }
  }, [clearUploadState]);

  const handlePdfChange = useCallback(async (file: File | null) => {
    if (file) {
      clearUploadState();
      setPdfFile(file);
      setIsProcessingPdf(true);
      try {
        const { previewUrl, imageFile } = await processPdfToImageFile(file);
        setPdfPreview(previewUrl);
        setOriginalImageFile(imageFile); // Use this converted image for generation
      } catch (err) {
        setError((err as Error).message || "Não foi possível processar o PDF.");
        setPdfFile(null);
        setOriginalImageFile(null);
        setPdfPreview(null);
      } finally {
        setIsProcessingPdf(false);
      }
    } else { // Clearing the PDF
      clearUploadState();
    }
  }, [clearUploadState, setError]);

  const handleClearImage = useCallback(() => {
    clearUploadState();
  }, [clearUploadState]);

  const setUploadError = useCallback((err: string | null) => {
    setError(err);
  }, [setError]);

  return {
    originalImageFile,
    originalImagePreview,
    pdfFile,
    pdfPreview,
    isProcessingPdf,
    fileInputKey,
    handleImageChange,
    handlePdfChange,
    handleClearImage,
    clearUploadState,
    setUploadError,
  };
};