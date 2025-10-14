import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';
import { useNavigate, Routes, Route } from 'react-router-dom'; // Importar Routes e Route
import { supabase } from './integrations/supabase/client';
import { useSession } from './components/SessionContextProvider';

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
import AdminPage from './pages/AdminPage'; // Importar AdminPage

import { redesignImage, generateConceptFromPlan, generateInternalViews, estimateCost } from './services/geminiService';
import type { User, CostEstimate, Project, Generation } from './types';

// PDF.js Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^5.4.149/build/pdf.worker.mjs`;

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

// Helper to convert a data URL string to a File object
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

function App() {
  type Mode = 'image' | 'floorplan' | 'dualite';
  const navigate = useNavigate();
  const { session, user, isLoading: isSessionLoading, refreshUser } = useSession();

  // App State
  const [mode, setMode] = useState<Mode>('image');

  // Image & File State
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // To reset file input

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVariationLoading, setIsVariationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cost Estimation State
  const [isEstimatingCost, setIsEstimatingCost] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [costError, setCostError] = useState<string | null>(null);

  // Internal Views State
  const [isInternalViewsLoading, setIsInternalViewsLoading] = useState(false);
  const [internalViews, setInternalViews] = useState<string[] | null>(null);
  const [internalViewsError, setInternalViewsError] = useState<string | null>(null);

  // Project Management State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsViewOpen, setProjectsViewOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);

  // Credits & Monetization State
  const [isBuyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  const [isHotmartRedirectModalOpen, setHotmartRedirectModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  // Redirect unauthenticated users to login page
  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate('/login');
    } else if (!isSessionLoading && session && window.location.pathname === '/login') {
      navigate('/'); // Redirect to home if already logged in and on login page
    }
  }, [session, isSessionLoading, navigate]);

  // Fetch projects when user is available
  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('projects')
          .select('*, generations(*)') // Fetch generations along with projects
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar projetos:', error);
        } else {
          setProjects(data as Project[]);
        }
      } else {
        setProjects([]);
      }
    };
    fetchProjects();
  }, [user]);


  const clearInputs = () => {
    setOriginalImageFile(null);
    setOriginalImagePreview(null);
    setPdfFile(null);
    setPdfPreview(null);
    setFileInputKey(Date.now());
    setPrompt('');
    setSelectedStyle('');
  };

  const clearResults = () => {
    setGeneratedImage(null);
    setError(null);
    setCostEstimate(null);
    setCostError(null);
    setInternalViews(null);
    setInternalViewsError(null);
  };
  
  const handleModeChange = (newMode: Mode) => {
    if (mode !== newMode) {
      setMode(newMode);
      clearInputs();
      clearResults();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      clearResults();
      setOriginalImageFile(file);
      setOriginalImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = async (file: File | null) => {
    if (file) {
      clearResults();
      setPdfFile(file);
      setIsProcessingPdf(true);
      setError(null);
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
      clearInputs();
    }
  };

  const handleClearImage = () => {
    clearInputs();
    clearResults();
  };
  
  const handleGenerate = async (isVariation = false) => {
    if (!originalImageFile || !user) return;
    
    const generationCost = isVariation ? 1 : (mode === 'image' ? 2 : 3);
    if (user.credits < generationCost) {
        setError("Créditos insuficientes para realizar esta operação.");
        setBuyCreditsModalOpen(true);
        return;
    }
    
    const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
    if (!fullPrompt) {
        setError("Por favor, descreva a mudança ou escolha um estilo.");
        return;
    }
    
    if (isVariation) {
      setIsVariationLoading(true);
    } else {
      setIsLoading(true);
      clearResults();
    }
    
    try {
      let resultImage: string;
      if (mode === 'image') {
        resultImage = await redesignImage(originalImageFile, fullPrompt);
      } else { // floorplan
        resultImage = await generateConceptFromPlan(originalImageFile, fullPrompt);
      }
      setGeneratedImage(resultImage);
      
      // Deduct credits from Supabase
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ credits: user.credits - generationCost })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao deduzir créditos:', updateError);
        setError('Erro ao deduzir créditos. Tente novamente.');
      } else if (updatedProfile) {
        refreshUser(); // Refresh user context to show updated credits
      }

    } catch (err) {
      setError((err as Error).message || "Ocorreu um erro desconhecido ao gerar a imagem.");
    } finally {
      setIsLoading(false);
      setIsVariationLoading(false);
    }
  };
  
  const handleEstimateCost = async () => {
      if (!generatedImage) return;
      const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
      if (!fullPrompt) {
        setCostError("É necessário um prompt para estimar o custo.");
        return;
      }

      setIsEstimatingCost(true);
      setCostError(null);
      setCostEstimate(null);
      
      const estimationPrompt = `Com base na seguinte descrição de uma reforma: "${fullPrompt}", e considerando a imagem gerada, crie uma estimativa de custo detalhada em BRL para uma cidade de médio porte no Brasil. Separe os custos de material e mão de obra para cada item. Forneça o resultado em JSON.`;

      try {
        const estimate = await estimateCost(estimationPrompt);
        setCostEstimate(estimate);
      } catch (err) {
        setCostError((err as Error).message || "Falha ao estimar o custo.");
      } finally {
        setIsEstimatingCost(false);
      }
  };

  const handleGenerateInternalViews = async () => {
    if (!generatedImage || !user) return;
    
    const internalViewsCost = 5;
    if (user.credits < internalViewsCost) {
        setInternalViewsError("Créditos insuficientes para gerar as vistas internas.");
        setBuyCreditsModalOpen(true);
        return;
    }

    const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
    if (!fullPrompt) {
        setInternalViewsError("Por favor, descreva o estilo de design para as vistas internas.");
        return;
    }
    
    setIsInternalViewsLoading(true);
    setInternalViewsError(null);
    setInternalViews(null);
    try {
        const conceptImageFile = await dataUrlToFile(generatedImage, 'concept-3d.png');
        const views = await generateInternalViews(conceptImageFile, fullPrompt);
        setInternalViews(views);
        
        // Deduct credits from Supabase
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ credits: user.credits - internalViewsCost })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Erro ao deduzir créditos:', updateError);
          setInternalViewsError('Erro ao deduzir créditos. Tente novamente.');
        } else if (updatedProfile) {
          refreshUser(); // Refresh user context to show updated credits
        }

    } catch (err) {
        setInternalViewsError((err as Error).message || "Ocorreu um erro ao gerar as vistas internas.");
    } finally {
        setIsInternalViewsLoading(false);
    }
  };

  // Auth Handlers (using Supabase)
  const handleLogin = async () => { /* No longer needed, AuthModal handles it */ };
  const handleSignup = async () => { /* No longer needed, AuthModal handles it */ };
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout. Tente novamente.');
    } else {
      navigate('/login');
      clearInputs();
      clearResults();
    }
  };


  // Modal Triggers
  const openLoginModal = () => navigate('/login');
  const openSignupModal = () => navigate('/login');

  // Project Handlers
  const handleSaveToProject = async (projectId: string | null, newProjectName: string) => {
    const originalPreviewForProject = mode === 'image' ? originalImagePreview : pdfPreview;
    
    if (!originalPreviewForProject || !generatedImage || !user) return;

    const newGeneration: Omit<Generation, 'id'> = {
      generatedImage,
      prompt: selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt,
      createdAt: new Date().toISOString(),
    };

    let currentProjectId = projectId;

    if (!currentProjectId) { // Create new project
      const newProject: Omit<Project, 'id' | 'generations'> = {
        name: newProjectName,
        originalImage: originalPreviewForProject,
        createdAt: new Date().toISOString(),
        user_id: user.id,
      };
      const { data, error } = await supabase.from('projects').insert(newProject).select().single();
      if (error) {
        console.error('Erro ao criar novo projeto:', error);
        setError('Erro ao criar novo projeto. Tente novamente.');
        return;
      }
      currentProjectId = data.id;
    }

    // Add generation to project
    const { error: genError } = await supabase.from('generations').insert({
      ...newGeneration,
      project_id: currentProjectId,
    });

    if (genError) {
      console.error('Erro ao salvar geração:', genError);
      setError('Erro ao salvar imagem gerada. Tente novamente.');
      return;
    }
    
    // Refresh projects after saving
    const { data: updatedProjects, error: fetchError } = await supabase
      .from('projects')
      .select('*, generations(*)') // Fetch generations along with projects
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Erro ao recarregar projetos:', fetchError);
    } else {
      setProjects(updatedProjects as Project[]);
    }

    setSaveModalOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
    if (error) {
      console.error('Erro ao deletar projeto:', error);
      setError('Erro ao deletar projeto. Tente novamente.');
    } else {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };
  
  const handleDeleteGeneration = async (projectId: string, generationId: string) => {
    if (!user) return;
    const { error } = await supabase.from('generations').delete().eq('id', generationId).eq('project_id', projectId);
    if (error) {
      console.error('Erro ao deletar geração:', error);
      setError('Erro ao deletar imagem gerada. Tente novamente.');
    } else {
      setProjects(prevProjects => prevProjects.map(p =>
        p.id === projectId
          ? { ...p, generations: p.generations.filter(g => g.id !== generationId) }
          : p
      ));
    }
  };

  const isImageUploaded = originalImagePreview !== null || pdfPreview !== null;
  const generationCost = mode === 'image' ? 2 : 3;

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session || !user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header 
        user={{ ...user, name: `${user.first_name} ${user.last_name}`.trim() }}
        onLogin={openLoginModal}
        onSignup={openSignupModal}
        onLogout={handleLogout}
        onOpenProjects={() => setProjectsViewOpen(true)}
        onBuyCredits={() => setBuyCreditsModalOpen(true)}
      />
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/*" element={
          <main className="max-w-7xl mx-auto p-4 md:p-6 mt-4">
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
                      error={error}
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
                      internalViewsCost={5}
                    />
                  </div>
                )}
              </div>
          </main>
        } />
      </Routes>

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
          onSave={handleSaveToProject}
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