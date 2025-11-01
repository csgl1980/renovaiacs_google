import React, { useState, useEffect, useCallback } from 'react';
import type { User, Project } from '../types';
import ImageUploader from '../components/ImageUploader';
import PromptControls from '../components/PromptControls';
import ResultDisplay from '../components/ResultDisplay';
import { useImageUpload } from '../hooks/useImageUpload';
import { useGeneration } from '../hooks/useGeneration';
import { useCostEstimation } from '../hooks/useCostEstimation';
import { useInternalViews } from '../hooks/useInternalViews'; // Pode ser útil para futuras expansões
import { showSuccess, showError } from '../utils/toast';
import { EXTERIOR_STYLE_OPTIONS } from '../constants'; // Nova importação

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
    mode: 'image', // Para design exterior, tratamos como 'image'
    setBuyCreditsModalOpen,
    setError,
  });

  // Para Design Exterior, não usaremos estimativa de custo ou vistas internas inicialmente,
  // mas os hooks estão aqui para referência ou futura expansão.
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

  useEffect(() => {
    // Limpar estados ao montar/desmontar ou mudar de modo
    return () => {
      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      setError(null);
    };
  }, [clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews, setError]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
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
          cost={generationCost} // Custo de 2 créditos
          credits={user.credits}
          styleOptions={EXTERIOR_STYLE_OPTIONS} // Usar os novos estilos
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
          onEstimateCost={handleEstimateCost} // Mantido para consistência, mas não será usado
          isEstimatingCost={isEstimatingCost}
          costEstimate={costEstimate}
          costError={costError}
          onGenerateInternalViews={handleGenerateInternalViews} // Mantido para consistência, mas não será usado
          isInternalViewsLoading={isInternalViewsLoading}
          internalViews={internalViews}
          internalViewsError={internalViewsError}
          onSaveToProject={onSaveToProject}
          credits={user.credits}
          variationCost={2}
          internalViewsCost={internalViewsCost}
        />
      </div>
    </div>
  );
};

export default ExteriorDesignView;