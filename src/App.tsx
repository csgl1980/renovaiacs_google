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
// import ObjectManipulationView from './pages/ObjectManipulationView'; // Removido
import ExteriorDesignView from './pages/ExteriorDesignView';

import { useImageUpload } from './hooks/useImageUpload';
import { useGeneration } from './hooks/useGeneration';
import { useCostEstimation } from './hooks/useCostEstimation';
import { useInternalViews } from './hooks/useInternalViews';
import { useProjectManagement } from './hooks/useProjectManagement';
import { useModals } from './hooks/useModals';
// import { useObjectManipulation } from './hooks/useObjectManipulation'; // Removido

function App() {
  type Mode = 'image' | 'floorplan' | 'dualite' | 'creativity' | 'exteriorDesign'; // Tipo de modo atualizado
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

  const [creativityPrompt, setCreativityPrompt] = useState('');
  const [creativityGeneratedImage, setCreativityGeneratedImage] = useState<string | null>(null);

  // Estados e funções para ObjectManipulationView - REMOVIDOS
  // const [objectManipulationMaskDataUrl, setObjectManipulationMaskDataUrl] = useState<string | null>(null);

  // useGeneration é chamado incondicionalmente, mas sua lógica interna é protegida por 'mode'
  const {
    prompt, setPrompt, selectedStyle, setSelectedStyle,
    generatedImage, setGeneratedImage,
    isLoading, isVariationLoading, generationError,
    handleGenerate, clearGenerationResults, generationCost,
  } = useGeneration({
    originalImageFile: originalImageFile, // Passa o originalImageFile do useImageUpload
    mode: mode,
    setBuyCreditsModalOpen,
    setError: setAppError,
  });

  const {
    isEstimatingCost, costEstimate, costError,
    handleEstimateCost, clearCostEstimation, estimationCost,
  } = useCostEstimation({
    generatedImage: generatedImage, // Não há mais objectManipulationGeneratedImage
    prompt,
    selectedStyle,
    setBuyCreditsModalOpen,
  });

  const {
    isInternalViewsLoading, internalViews, internalViewsError,
    handleGenerateInternalViews, clearInternalViews, internalViewsCost,
  } = useInternalViews({
    generatedImage: generatedImage, // Não há mais objectManipulationGeneratedImage
    prompt,
    selectedStyle,
    setBuyCreditsModalOpen,
  });

  // useObjectManipulation hook e estados relacionados - REMOVIDOS
  // const {
  //   prompt: objectManipulationPrompt,
  //   setPrompt: setObjectManipulationPrompt,
  //   generatedImage: objectManipulationGeneratedImage,
  //   isLoading: isObjectManipulationLoading,
  //   generationError: objectManipulationGenerationError,
  //   handleCleanObject,
  //   handleReplaceObject,
  //   clearResults: clearObjectManipulationResults,
  //   cleanCost,
  //   replaceCost,
  // } = useObjectManipulation({
  //   originalImageFile: originalImageFile,
  //   maskDataUrl: objectManipulationMaskDataUrl,
  //   setBuyCreditsModalOpen,
  //   setError: setAppError,
  // });

  const {
    projects,
    handleSaveToProject: saveProject,
    handleDeleteProject,
    handleDeleteGeneration,
  } = useProjectManagement({
    originalImagePreview: 
      mode === 'creativity' ? creativityGeneratedImage : 
      originalImagePreview, // Simplificado
    pdfPreview,
    generatedImage: 
      mode === 'creativity' ? creativityGeneratedImage : 
      generatedImage, // Simplificado
    prompt: 
      mode === 'creativity' ? creativityPrompt : 
      prompt, // Simplificado
    selectedStyle,
    mode: mode === 'creativity' ? 'image' : mode, // Passa o modo real para useProjectManagement
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
      // Limpa estados de todos os modos ao mudar, exceto se for para o próprio modo
      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      // clearObjectManipulationResults(); // Removido
      setCreativityPrompt('');
      setCreativityGeneratedImage(null);
      // setObjectManipulationMaskDataUrl(null); // Removido
      // setObjectManipulationPrompt(''); // Removido
      setAppError(null);
    }
  }, [mode, clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews, setCreativityPrompt, setCreativityGeneratedImage]); // Dependências atualizadas

  const handleLogout = useCallback(async () => {
    console.log('App.tsx: [handleLogout] Iniciando logout...');
    setAppError(null);

    try {
      console.log('App.tsx: [handleLogout] Session from useSession hook:', session);

      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('App.tsx: [handleLogout] Erro ao tentar refrescar a sessão antes do logout:', refreshError.message);
      } else if (refreshedSession) {
        console.log('App.tsx: [handleLogout] Sessão refrescada com sucesso antes do logout.');
      } else {
        console.warn('App.tsx: [handleLogout] Nenhuma sessão para refrescar antes do logout.');
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('App.tsx: [handleLogout] Erro ao fazer logout:', error);
        if (error.message.includes('Auth session missing!')) {
          console.warn('App.tsx: [handleLogout] Auth session missing error. Attempting to clear local storage manually.');
          await supabase.auth.setSession({ access_token: '', refresh_token: '' });
        } else {
          setAppError(`Erro ao fazer logout: ${error.message}.`);
        }
      } else {
        console.log('App.tsx: [handleLogout] Logout realizado com sucesso.');
      }

      clearUploadState();
      clearGenerationResults();
      clearCostEstimation();
      clearInternalViews();
      // clearObjectManipulationResults(); // Removido
      setCreativityPrompt('');
      setCreativityGeneratedImage(null);
      // setObjectManipulationMaskDataUrl(null); // Removido
      // setObjectManipulationPrompt(''); // Removido
      closeAllModals();
      setAppError(null);

    } catch (e) {
      console.error('App.tsx: [handleLogout] Erro inesperado durante o logout:', e);
      setAppError(`Ocorreu um erro inesperado durante o logout: ${(e as Error).message}.`);
    }
  }, [session, clearUploadState, clearGenerationResults, clearCostEstimation, clearInternalViews, closeAllModals, setAppError, setCreativityPrompt, setCreativityGeneratedImage]); // Dependências atualizadas

  const openLoginModal = useCallback(() => navigate('/login'), [navigate]);
  const openSignupModal = useCallback(() => navigate('/login'), [navigate]);

  const handleLoadGeneration = useCallback((genImage: string, genPrompt: string) => {
    setGeneratedImage(genImage);
    setPrompt(genPrompt);
    setSelectedStyle('');
    clearCostEstimation();
    clearInternalViews();
    setAppError(null);
    setProjectsViewOpen(false);
  }, [setGeneratedImage, setPrompt, setSelectedStyle, clearCostEstimation, clearInternalViews, setAppError, setProjectsViewOpen]);

  const isImageUploaded = originalImagePreview !== null || pdfPreview !== null;

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-gray-700 ml-4">Carregando sessão...</p>
      </div>
    );
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
        onModeChange={handleModeChange}
        currentMode={mode}
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
        {mode === 'image' && (
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
                cost={generationCost}
                credits={user.credits}
              />
            </div>
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
          </div>
        )}

        {mode === 'floorplan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
              <PdfUploader
                onPdfChange={handlePdfChange}
                pdfPreview={pdfPreview}
                isProcessingPdf={isProcessingPdf}
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
              />
            </div>
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
          </div>
        )}

        {mode === 'creativity' && (
          <CreativitySpaceView 
            setBuyCreditsModalOpen={setBuyCreditsModalOpen} 
            setError={setAppError} 
            prompt={creativityPrompt}
            setPrompt={setCreativityPrompt}
            generatedImage={creativityGeneratedImage}
            setGeneratedImage={setCreativityGeneratedImage}
          />
        )}

        {/* ObjectManipulationView foi removido */}

        {mode === 'exteriorDesign' && (
          <ExteriorDesignView
            user={user}
            setBuyCreditsModalOpen={setBuyCreditsModalOpen}
            setError={setAppError}
            onSaveToProject={() => setSaveModalOpen(true)}
            projects={projects}
            saveProject={saveProject}
          />
        )}
      </main>

      {isProjectsViewOpen && user && (
        <ProjectsView
          projects={projects}
          onClose={() => setProjectsViewOpen(false)}
          onDeleteProject={handleDeleteProject}
          onDeleteGeneration={handleDeleteGeneration}
          onLoadGeneration={handleLoadGeneration}
        />
      )}
      {isSaveModalOpen && user && (generatedImage || creativityGeneratedImage) && ( // Condição atualizada
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
          onClose={() => setBuyCreditsModal(false)}
          onSelectPlan={(url: string) => {
            setRedirectUrl(url);
            setBuyCreditsModal(false);
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