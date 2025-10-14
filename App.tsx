import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from './src/components/SessionContextProvider';

import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptControls from './components/PromptControls';
import ResultDisplay from './components/ResultDisplay';
import SaveToProjectModal from './components/SaveToProjectModal';
import ProjectsView from './components/ProjectsView';
import BuyCreditsModal from './components/BuyCreditsModal';
import HotmartRedirectModal from './components/HotmartRedirectModal';
import PdfUploader from './components/PdfUploader';
import DualiteView from './components/DualiteView';

// Importar os novos hooks
import { useImageUpload } from './src/hooks/useImageUpload';
import { useGeneration } from './src/hooks/useGeneration';
import { useCostEstimation } from './src/hooks/useCostEstimation';
import { useInternalViews } from './src/hooks/useInternalViews';
import { useProjectManagement } from './src/hooks/useProjectManagement';
import { useModals } from './src/hooks/useModals';

function App() {
  type Mode = 'image' | 'floorplan' | 'dualite';
  const navigate = useNavigate();
  const { session, user, isLoading: isSessionLoading, refreshUser } = useSession();

  // Estado global de erro para a aplicação principal
  const [appError, setAppError] = useState<string | null>(null);

  // Hooks personalizados
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
    mode,
    setBuyCreditsModalOpen,
    setError: setAppError,
  });

  const {
    isEstimatingCost, costEstimate, costError,
    handleEstimateCost, clearCostEstimation,
  } = useCostEstimation({
    generatedImage,
    prompt,
    selectedStyle,
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
    mode,
    setError: setAppError,
  });

  // Efeito para redirecionar usuários não autenticados
  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate('/login', { replace: true });
    }
  }, [session, isSessionLoading, navigate]);

  // Limpar resultados e uploads ao mudar de modo
  const handleModeChange = useCallback((newMode: Mode) => {
    if (mode !== newMode) {
      setMode(newMode);
      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      setAppError(null); // Clear any general app errors
    }
  }, [mode, clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews]);

  // Auth Handlers (usando Supabase)
  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      setAppError('Erro ao fazer logout. Tente novamente.');
    } else {
      navigate('/login');
      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      closeAllModals();
      setAppError(null);
    }
  }, [navigate, clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews, closeAllModals]);

  // Modal Triggers
  const openLoginModal = useCallback(() => navigate('/login'), [navigate]);
  const openSignupModal = useCallback(() => navigate('/login'), [navigate]);

  const isImageUploaded = originalImagePreview !== null || pdfPreview !== null;

  // Se a sessão estiver carregando, mostre um spinner
  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-gray-700 ml-4">Carregando sessão...</p>
      </div>
    );
  }

  // Se não houver sessão ou usuário, este componente não deve ser renderizado.
  // O useEffect acima lidará com o redirecionamento para /login.
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
          {/* Left Column: Controls */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('image')}
                className={`w-1/3 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'image' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Redesenhar Imagem
              </button>
              <button
                onClick={() => handleModeChange('floorplan')}
                className={`w-1/3 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'floorplan' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Gerar de Planta Baixa
              </button>
              <button
                onClick={() => handleModeChange('dualite')}
                className={`w-1/3 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'dualite' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                Dualite AI
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
            {mode === 'dualite' && (
              <DualiteView />
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

          {/* Right Column: Results */}
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
                variationCost={1}
                internalViewsCost={internalViewsCost}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
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