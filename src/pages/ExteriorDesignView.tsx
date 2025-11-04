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

interface ExteriorDesignViewProps {
  user: User;
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  onSaveToProject: () => void;
  projects: Project[];
  saveProject: (projectId: string | null, newProjectName: string) => Promise<void>;
  // Recebendo generatedImage e originalImagePreview como props do App.tsx
  generatedImage: string | null;
  originalImagePreview: string | null;
}

const ExteriorDesignView: React.FC<ExteriorDesignViewProps> = ({
  user,
  setBuyCreditsModalOpen,
  setError,
  onSaveToProject,
  projects,
  saveProject,
  // Desestruturando as props
  generatedImage,
  originalImagePreview,
}) => {
  const {
    originalImageFile, 
    // originalImagePreview, // REMOVIDO: Agora vem como prop
    fileInputKey,
    handleImageChange, handleClearImage,
    clearUploadState, setUploadError,
  } = useImageUpload(setError);

  const {
    prompt, setPrompt, selectedStyle, setSelectedStyle,
    // generatedImage, // REMOVIDO: Agora vem como prop
    setGeneratedImage, // Mantido para que o hook possa atualizar o estado no App.tsx
    isLoading, isVariationLoading, generationError,
    handleGenerate, clearGenerationResults, generationCost,
  } = useGeneration({
    originalImageFile,
    mode: 'exteriorDesign',
    setBuyCreditsModalOpen,
    setError,
    // Passando o setGeneratedImage para o hook para que ele possa atualizar o estado no App.tsx
    setGeneratedImage: setGeneratedImage, 
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

  // Adicionando logs para depuração
  useEffect(() => {
    console.log('ExteriorDesignView: Render - originalImagePreview (prop):', originalImagePreview ? 'present' : 'null', 'generatedImage (prop):', generatedImage ? 'present' : 'null');
  }, [originalImagePreview, generatedImage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800">Paisagismo</h2>
        <p className="text-gray-600 text-sm">
          Transforme a fachada e o paisagismo do seu imóvel.
        </p>
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
          mode="image"
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