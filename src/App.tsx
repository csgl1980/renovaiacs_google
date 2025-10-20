import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './components/SessionContextProvider';
import { supabase } from './integrations/supabase/client';

import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptControls from './components/PromptControls';
import ResultDisplay from './components/ResultDisplay';
import SaveToProjectModal from './components/SaveToProjectModal';
import ProjectsView from './components/ProjectsView';
import BuyCreditsModal from './components/BuyCreditsModal';
import HotmartRedirectModal from './components/HotmartRedirectModal';
import PdfUploader from './components/PdfUploader';
import CreativitySpaceView from './components/CreativitySpaceView';

// Importar os novos hooks
import { useImageUpload } from './hooks/useImageUpload';
import { useGeneration } from './hooks/useGeneration';
import { useCostEstimation } from './hooks/useCostEstimation';
import { useInternalViews } from './hooks/useInternalViews';
import { useProjectManagement } from './hooks/useProjectManagement';
import { useModals } from './hooks/useModals';

function App() {
  type Mode = 'image' | 'floorplan' | 'dualite' | 'creativity';
  const navigate = useNavigate();
  const { session, user, isLoading: isSessionLoading, refreshUser } = useSession();

  console.log('App.tsx: Render - isSessionLoading:', isSessionLoading, 'session:', session, 'user:', user);

  const [appError, setAppError] = useState<string | null>(null);

  const {
    isProjectsViewOpen, setProjectsViewOpen,
    isSaveModalOpen, setSaveModalOpen,
    isBuyCreditsModalOpen, setBuyCreditsModalOpen,
    isHotmartRedirectModalOpen, setHotmartRedirectModalOpen,
    redirectUrl, setRedirectUrl,
    closeAllModals,
  } = useModals();

  const {
    originalImageFile, originalImagePreview,
    pdfFile, pdfPreview, isProcessingPdf, fileInputKey,
    handleImageChange, handlePdfChange, handleClearImage,
    clearUploadState, setUploadError,
  } = useImageUpload(setAppError);

  const [mode, setMode] = useState<Mode>('image');

  const {
    prompt, setPrompt, selectedStyle, setSelectedStyle,
    generatedImage, isLoading, isVariationLoading, generationError,
    handleGenerate, clearGenerationResults, generationCost,
  } = useGeneration({
    originalImageFile,
    mode: mode === 'creativity' ? 'image' : mode, // Passa 'image' para criatividade, pois não usa imagem original
    setBuyCreditsModalOpen,
    setError: setAppError,
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

  const {
    projects,
    handleSaveToProject: saveProject,
    handleDeleteProject,
    handleDeleteGeneration,
  } = useProjectManagement({
    originalImagePreview,
    pdfPreview,
    generatedImage,
    prompt,
    selectedStyle,
    mode: mode === 'creativity' ? 'image' : mode, // Passa 'image' para criatividade
    setError: setAppError,
  });

  useEffect(() => {
    console.log('App.tsx: useEffect for redirection - isSessionLoading:', isSessionLoading, 'session:', session, 'user:', user);
    if (!isSessionLoading && !session) {
      console.log('App.tsx: Redirecting to /login due to no session.');
      navigate('/login', { replace: true });
    }
  }, [session, isSessionLoading, navigate]);

  const handleModeChange = useCallback((newMode: Mode) => {
    if (mode !== newMode) {
      setMode(newMode);
      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      setAppError(null);
    }
  }, [mode, clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews]);

  const handleLogout = useCallback(async () => {
    console.log('App.tsx: [handleLogout] Iniciando logout...');
    setAppError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('App.tsx: [handleLogout] Erro ao fazer logout:', error);
        if (!error.message.includes('Auth session missing!')) {
          setAppError(`Erro ao fazer logout: ${error.message}.`);
        }
      } else {
        console.log('App.tsx: [handleLogout] Logout realizado com sucesso.');
      }

      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      closeAllModals();
      setAppError(null);
      navigate('/login', { replace: true });

    } catch (e) {
      console.error('App.tsx: [handleLogout] Erro inesperado durante o logout:', e);
      setAppError(`Ocorreu um erro inesperado durante o logout: ${(e as Error).message}.`);
      navigate('/login', { replace: true });
    }
  }, [navigate, clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews, closeAllModals, setAppError]);

  const openLoginModal = useCallback(() => navigate('/login'), [navigate]);
  const openSignupModal = useCallback(() => navigate('/login'), [navigate]);

  const isImageUploaded = originalImagePreview !== null || pdfPreview !== null;

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-gray-700 ml-4">Carregando sessão...</p>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header
        user={user}
        onLogin={openLoginModal}
        onSignup={openSignupModal}
        onLogout={handleLogout}
        onOpenProjects={() => setProjectsViewOpen(true)}
        onBuyCredits={() => setBuyCreditsModalOpen(true)}
      />
      <main className="max-w-7xl mx-auto p-4 md:p-6 mt-4">
        {appError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {appError}</span>
            <button onClick={() => setAppError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.15a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('image')}
                className={`w-1/3 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'image' ? 'bg-white text-cs-blue shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Renovar Ambiente
              </button>
              <button
                onClick={() => handleModeChange('floorplan')}
                className={`w-1/3 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'floorplan' ? 'bg-white text-cs-blue shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Renderizar Planta Baixa
              </button>
              <button
                onClick={() => handleModeChange('creativity')}
                className={`w-1/3 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'creativity' ? 'bg-white text-cs-blue shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Espaço Criatividade
              </button>
            </div>

            {mode === 'image' && (
              <ImageUploader
                originalImagePreview={originalImagePreview}
                onImageChange={handleImageChange}
                onClearImage={handleClearImage}
                fileInputKey={fileInputKey}
              />
            )}
            {mode === 'floorplan' && (
              <PdfUploader
                onPdfChange={handlePdfChange}
                pdfPreview={pdfPreview}
                isProcessingPdf={isProcessingPdf}
              />
            )}
            {mode === 'creativity' && (
              <CreativitySpaceView setBuyCreditsModalOpen={setBuyCreditsModalOpen} setError={setAppError} />
            )}

            {(mode === 'image' || mode === 'floorplan') && (
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
              />
            )}
          </div>

          {(mode === 'image' || mode === 'floorplan') && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <ResultDisplay
                mode={mode}
                originalPreview={originalImagePreview || pdfPreview}
                generatedImage={generatedImage}
                isLoading={isLoading}
                isVariationLoading={isVariationLoading}
                error={generationError || appError}
                onGenerateVariation={() => handleGenerate(true)}
                onEstimateCost={handleEstimateCost}
                isEstimatingCost={isEstimatingCost}
                costEstimate={costEstimate}
                costError={costError}
                onGenerateInternalViews={handleGenerateInternalViews}
                isInternalViewsLoading={isInternalViewsLoading}
                internalViews={internalViews}
                internalViewsError={internalViewsError}
                onSaveToProject={() => setSaveModalOpen(true)}
                credits={user.credits}
                variationCost={2}
                internalViewsCost={internalViewsCost}
              />
            </div>
          )}
        </div>
      </main>

      {isProjectsViewOpen && user && (
        <ProjectsView
          projects={projects}
          onClose={() => setProjectsViewOpen(false)}
          onDeleteProject={handleDeleteProject}
          onDeleteGeneration={handleDeleteGeneration}
        />
      )}
      {isSaveModalOpen && user && generatedImage && (
        <SaveToProjectModal
          projects={projects}
          onClose={() => setSaveModalOpen(false)}
          onSave={(projectId, newProjectName) => {
            saveProject(projectId, newProjectName);
            setSaveModalOpen(false);
          }}
        />
      )}
      {isBuyCreditsModalOpen && user && (
        <BuyCreditsModal
          onClose={() => setBuyCreditsModalOpen(false)}
          onSelectPlan={(url: string) => {
            setRedirectUrl(url);
            setBuyCreditsModalOpen(false);
            setHotmartRedirectModalOpen(true);
          }}
        />
      )}
      {isHotmartRedirectModalOpen && (
        <HotmartRedirectModal
          onClose={() => setHotmartRedirectModalOpen(false)}
          redirectUrl={redirectUrl}
        />
      )}
    </div>
  );
}

export default App;