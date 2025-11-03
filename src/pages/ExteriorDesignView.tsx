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
// CameraIcon não é mais necessário aqui, pois está no ImageUploader
// import CameraIcon from '../components/icons/CameraIcon'; 

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
  // videoRef, photoCanvasRef, isCameraActive, stream não são mais necessários aqui
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const photoCanvasRef = useRef<HTMLCanvasElement>(null);
  // const [isCameraActive, setIsCameraActive] = useState(false);
  // const [stream, setStream] = useState<MediaStream | null>(null);

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

  // startCamera, stopCamera, takePhoto não são mais necessários aqui
  // const startCamera = async () => { /* ... */ };
  // const stopCamera = () => { /* ... */ };
  // const takePhoto = () => { /* ... */ };

  useEffect(() => {
    // Limpar estados ao montar/desmontar ou mudar de modo
    return () => {
      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      setError(null);
      // stopCamera(); // Garante que a câmera seja desligada - removido pois a câmera está no ImageUploader
    };
  }, [clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews, setError]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800">Design Exterior</h2>
        <p className="text-gray-600 text-sm">
          Transforme a fachada e o paisagismo do seu imóvel.
        </p>
        {/* O ImageUploader agora contém a funcionalidade de câmera */}
        <ImageUploader
          originalImagePreview={originalImagePreview}
          onImageChange={handleImageChange}
          onClearImage={handleClearImage}
          fileInputKey={fileInputKey}
        />
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