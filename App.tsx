import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';

import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptControls from './components/PromptControls';
import ResultDisplay from './components/ResultDisplay';
import AuthModal from './components/AuthModal';
import AuthPlaceholder from './components/AuthPlaceholder';
import SaveToProjectModal from './components/SaveToProjectModal';
import ProjectsView from './components/ProjectsView';
import BuyCreditsModal from './components/BuyCreditsModal';
import HotmartRedirectModal from './components/HotmartRedirectModal';
import PdfUploader from './components/PdfUploader';

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

        // FIX: The RenderParameters type for this version of pdfjs-dist seems to require the 'canvas' property.
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
  type Mode = 'image' | 'floorplan';

  // App State
  const [mode, setMode] = useState<Mode>('image');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

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

  // Mocked Auth & Data persistence using localStorage
  useEffect(() => {
    const loggedInUser = localStorage.getItem('renova-ia-user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      
      const userProjects = localStorage.getItem(`renova-ia-projects-${parsedUser.email}`);
      if (userProjects) {
        setProjects(JSON.parse(userProjects));
      }
    }
  }, []);

  const saveUserAndProjects = (updatedUser: User | null, updatedProjects: Project[]) => {
    if (updatedUser) {
      localStorage.setItem('renova-ia-user', JSON.stringify(updatedUser));
      localStorage.setItem(`renova-ia-projects-${updatedUser.email}`, JSON.stringify(updatedProjects));
    } else {
      localStorage.removeItem('renova-ia-user');
    }
  };


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
      const updatedUser = { ...user, credits: user.credits - generationCost };
      setUser(updatedUser);
      saveUserAndProjects(updatedUser, projects);
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
        const updatedUser = { ...user, credits: user.credits - internalViewsCost };
        setUser(updatedUser);
        saveUserAndProjects(updatedUser, projects);
    } catch (err) {
        setInternalViewsError((err as Error).message || "Ocorreu um erro ao gerar as vistas internas.");
    } finally {
        setIsInternalViewsLoading(false);
    }
  };

  // Auth Handlers (Simulated Backend)
  const handleLogin = async (email: string, password: string): Promise<void> => {
    setAuthError(null);
    const storedUsers = JSON.parse(localStorage.getItem('renova-ia-users') || '{}');
    if (storedUsers[email] && storedUsers[email].password === password) {
      setUser(storedUsers[email]);
      const userProjects = localStorage.getItem(`renova-ia-projects-${email}`);
      setProjects(userProjects ? JSON.parse(userProjects) : []);
      setAuthModalOpen(false);
    } else {
      setAuthError("E-mail ou senha inválidos.");
      throw new Error("Login failed");
    }
  };
  const handleSignup = async (name: string, email: string, password: string): Promise<void> => {
    setAuthError(null);
    const storedUsers = JSON.parse(localStorage.getItem('renova-ia-users') || '{}');
    if (storedUsers[email]) {
      setAuthError("Este e-mail já está em uso.");
      throw new Error("Signup failed");
    } else {
      const newUser: User = { name, email, credits: 20, token: `fake-token-${email}` };
      const newUsers = { ...storedUsers, [email]: { ...newUser, password } }; // Store password only in this "db"
      localStorage.setItem('renova-ia-users', JSON.stringify(newUsers));
      setUser(newUser);
      setProjects([]);
      setAuthModalOpen(false);
    }
  };
  const handleLogout = () => {
    saveUserAndProjects(user, projects); // Save before logging out
    localStorage.removeItem('renova-ia-user');
    setUser(null);
    setProjects([]);
    clearInputs();
    clearResults();
  };


  // Modal Triggers
  const openLoginModal = () => { setAuthModalView('login'); setAuthModalOpen(true); };
  const openSignupModal = () => { setAuthModalView('signup'); setAuthModalOpen(true); };

  // Project Handlers
  const handleSaveToProject = (projectId: string | null, newProjectName: string) => {
    const originalPreviewForProject = mode === 'image' ? originalImagePreview : pdfPreview;
    
    if (!originalPreviewForProject || !generatedImage || !user) return;

    const newGeneration: Generation = {
      id: `gen_${Date.now()}`,
      generatedImage,
      prompt: selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt,
      createdAt: new Date().toISOString(),
    };

    let updatedProjects: Project[];
    if (projectId) { // Add to existing project
      updatedProjects = projects.map(p =>
        p.id === projectId
          ? { ...p, generations: [...p.generations, newGeneration] }
          : p
      );
    } else { // Create new project
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: newProjectName,
        originalImage: originalPreviewForProject,
        createdAt: new Date().toISOString(),
        generations: [newGeneration],
      };
      updatedProjects = [newProject, ...projects];
    }
    setProjects(updatedProjects);
    saveUserAndProjects(user, updatedProjects);
    setSaveModalOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!user) return;
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    saveUserAndProjects(user, updatedProjects);
  };
  
  const handleDeleteGeneration = (projectId: string, generationId: string) => {
    if (!user) return;
    const updatedProjects = projects.map(p =>
      p.id === projectId
        ? { ...p, generations: p.generations.filter(g => g.id !== generationId) }
        : p
    );
    setProjects(updatedProjects);
    saveUserAndProjects(user, updatedProjects);
  };

  const isImageUploaded = originalImagePreview !== null || pdfPreview !== null;
  const generationCost = mode === 'image' ? 2 : 3;

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
        {!user ? (
          <AuthPlaceholder onLogin={openLoginModal} onSignup={openSignupModal} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Controls */}
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
               <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => handleModeChange('image')} 
                    className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'image' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Redesenhar Imagem
                  </button>
                  <button 
                    onClick={() => handleModeChange('floorplan')} 
                    className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'floorplan' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Gerar de Planta Baixa
                  </button>
              </div>

              {mode === 'image' ? (
                <ImageUploader 
                  originalImagePreview={originalImagePreview}
                  onImageChange={handleImageChange}
                  onClearImage={handleClearImage}
                  fileInputKey={fileInputKey}
                />
              ) : (
                <PdfUploader 
                  onPdfChange={handlePdfChange}
                  pdfPreview={pdfPreview}
                  isProcessingPdf={isProcessingPdf}
                />
              )}

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

            {/* Right Column: Results */}
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
          </div>
        )}
      </main>

      {/* Modals */}
      {isAuthModalOpen && (
        <AuthModal 
          initialView={authModalView}
          onClose={() => { setAuthModalOpen(false); setAuthError(null); }}
          onLogin={handleLogin}
          onSignup={handleSignup}
          authError={authError}
        />
      )}
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