import React from 'react';
import DownloadIcon from './icons/DownloadIcon';
import ShareIcon from './icons/ShareIcon';
import RefreshCwIcon from './icons/RefreshCwIcon';
import DollarSignIcon from './icons/DollarSignIcon';
import CameraIcon from './icons/CameraIcon';
import SaveIcon from './icons/SaveIcon';
import CostEstimator from './CostEstimator';
import type { CostEstimate } from '../types';

interface ResultDisplayProps {
  mode: 'image' | 'floorplan';
  originalPreview: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  isVariationLoading: boolean;
  error: string | null;
  onGenerateVariation: () => void;
  onEstimateCost: () => void;
  isEstimatingCost: boolean;
  costEstimate: CostEstimate | null;
  costError: string | null;
  onGenerateInternalViews: () => void;
  isInternalViewsLoading: boolean;
  internalViews: string[] | null;
  internalViewsError: string | null;
  onSaveToProject: () => void;
  credits: number;
  variationCost: number;
  internalViewsCost: number;
}

const ActionButton: React.FC<{ onClick: () => void; disabled?: boolean; label: string; cost?: number; children: React.ReactNode }> = ({ onClick, disabled, label, cost, children }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-white rounded-full p-3 text-gray-600 hover:bg-gray-100 hover:text-cs-blue transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-600"
      aria-label={label}
    >
      {children}
    </button>
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {label}
      {cost !== undefined && <span className="text-cs-orange ml-1">({cost} {cost === 1 ? 'crédito' : 'créditos'})</span>}
    </div>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = (props) => {
  const {
    mode, originalPreview, generatedImage, isLoading, isVariationLoading, error,
    onGenerateVariation, onEstimateCost, isEstimatingCost, costEstimate, costError,
    onGenerateInternalViews, isInternalViewsLoading, internalViews, internalViewsError,
    onSaveToProject, credits, variationCost, internalViewsCost
  } = props;

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `renova-ia-ces-${mode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    if (!generatedImage) return;
    try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `renova-ia-ces-${mode}.png`, { type: blob.type });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Minha Renovação IA C&S',
                text: 'Veja a transformação que criei com o Renova IA da C&S Construção!',
                files: [file],
            });
        } else {
           alert("Seu navegador não suporta o compartilhamento de arquivos.");
        }
    } catch(e) {
        console.error("Share failed:", e);
        alert("O compartilhamento falhou.");
    }
  };

  const handleDownloadInternalView = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `renova-ia-ces-vista-interna-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareInternalView = async (imageUrl: string, index: number) => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `renova-ia-ces-vista-interna-${index + 1}.png`, { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `Vista Interna ${index + 1} - Minha Renovação IA C&S`,
                text: 'Veja esta vista interna que criei com o Renova IA da C&S Construção!',
                files: [file],
            });
        } else {
           alert("Seu navegador não suporta o compartilhamento de arquivos.");
        }
    } catch(e) {
        console.error("Share failed:", e);
        alert("O compartilhamento falhou.");
    }
  };
  
  const hasResult = !isLoading && generatedImage;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full aspect-video bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
        {isLoading && (
          <div className="text-center text-gray-600">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-semibold text-lg">Gerando sua transformação...</p>
            <p className="text-sm text-gray-500">Isso pode levar alguns segundos.</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="text-center text-red-600 p-4">
            <h3 className="font-bold text-lg mb-2">Ocorreu um Erro</h3>
            <p className="text-sm bg-red-50 p-3 rounded-md">{error}</p>
          </div>
        )}
        {!isLoading && !error && !generatedImage && (
          <div className="text-center text-gray-500 p-4">
             <h3 className="text-lg font-semibold text-gray-700">O resultado aparecerá aqui</h3>
             <p className="text-sm">Envie um arquivo e descreva sua ideia para começar.</p>
          </div>
        )}
        {hasResult && (
          <>
            <img src={generatedImage} alt="Generated result" className="max-h-full max-w-full object-contain" />
            {(isVariationLoading) && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>

      {hasResult && (
        <div className="flex items-center justify-center gap-4 bg-gray-50 p-2 rounded-full">
          <ActionButton onClick={handleDownload} label="Baixar Imagem">
            <DownloadIcon className="w-5 h-5" />
          </ActionButton>
          <ActionButton onClick={onGenerateVariation} disabled={isVariationLoading || credits < variationCost} label="Gerar Variação" cost={variationCost}>
            <RefreshCwIcon className="w-5 h-5" />
          </ActionButton>
          {navigator.share && (
            <ActionButton onClick={handleShare} label="Compartilhar">
              <ShareIcon className="w-5 h-5" />
            </ActionButton>
          )}
           <ActionButton onClick={onSaveToProject} label="Salvar no Projeto">
              <SaveIcon className="w-5 h-5" />
            </ActionButton>
          {mode === 'image' && (
            <ActionButton onClick={onEstimateCost} disabled={isEstimatingCost || credits < 1} label="Estimar Custo" cost={1}>
              <DollarSignIcon className="w-5 h-5" />
            </ActionButton>
          )}
          {mode === 'floorplan' && (
            <ActionButton onClick={onGenerateInternalViews} disabled={isInternalViewsLoading || credits < internalViewsCost} label="Vistas Internas" cost={internalViewsCost}>
              <CameraIcon className="w-5 h-5" />
            </ActionButton>
          )}
        </div>
      )}

      {(isEstimatingCost || costEstimate || costError) && mode === 'image' && (
        <CostEstimator isLoading={isEstimatingCost} estimate={costEstimate} error={costError} />
      )}
      
      {(isInternalViewsLoading || internalViewsError || internalViews) && mode === 'floorplan' && (
        <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-4 mt-4">
           <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Vistas Internas do Ambiente</h3>
          {isInternalViewsLoading && (
            <div className="text-center text-gray-600 p-6">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-semibold">Gerando vistas internas...</p>
              <p className="text-sm text-gray-500 mt-2">Isso pode levar um momento.</p>
            </div>
          )}
          {internalViewsError && !isInternalViewsLoading && (
            <div className="text-center text-red-600">
              <p className="font-bold mb-2">Erro ao gerar as vistas</p>
              <p className="text-sm bg-red-50 p-2 rounded-md">{internalViewsError}</p>
            </div>
          )}
          {internalViews && internalViews.length > 0 && !isInternalViewsLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {internalViews.map((view, index) => (
                    <div key={index} className="relative group aspect-video">
                        <img 
                            src={view} 
                            alt={`Vista interna ${index + 1}`} 
                            className="w-full h-full object-cover rounded-md" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                onClick={() => handleDownloadInternalView(view, index)}
                                className="p-2 bg-white/80 rounded-full text-gray-800 hover:bg-white transition-colors"
                                aria-label="Baixar vista interna"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                            {navigator.share && (
                                <button
                                    onClick={() => handleShareInternalView(view, index)}
                                    className="p-2 bg-white/80 rounded-full text-gray-800 hover:bg-white transition-colors"
                                    aria-label="Compartilhar vista interna"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;