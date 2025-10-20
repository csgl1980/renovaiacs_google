import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import DownloadIcon from './icons/DownloadIcon';
import ShareIcon from './icons/ShareIcon';
import { useCreativitySpace } from '../hooks/useCreativitySpace';
import { useSession } from '../components/SessionContextProvider';

interface CreativitySpaceViewProps {
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
}

const CreativitySpaceView: React.FC<CreativitySpaceViewProps> = ({ setBuyCreditsModalOpen, setError }) => {
  const { user } = useSession();
  const {
    prompt,
    setPrompt,
    generatedImage,
    isLoading,
    generationError,
    handleGenerateImage,
    clearResults, // Mantido para uso futuro se necessário, mas não chamado aqui
    cost,
  } = useCreativitySpace({ setBuyCreditsModalOpen, setError });

  console.log('CreativitySpaceView render: generatedImage from hook =', generatedImage ? 'data:...' : 'null', 'isLoading:', isLoading);

  const hasEnoughCredits = user ? user.credits >= cost : false;

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `renova-ia-ces-criatividade.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    if (!generatedImage) return;
    try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `renova-ia-ces-criatividade.png`, { type: blob.type });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Minha Criação IA C&S',
                text: 'Veja a imagem que criei com o Espaço Criatividade do Renova IA C&S!',
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">1. Inspire-se na Criatividade</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Um quarto minimalista com vista para o oceano ao pôr do sol, em tons de azul e branco."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue transition-shadow duration-200"
          rows={6}
        />
      </div>
      <button
        onClick={handleGenerateImage}
        disabled={isLoading || !prompt.trim() || !hasEnoughCredits}
        className={`w-full flex flex-col items-center justify-center gap-1 bg-cs-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300 disabled:bg-cs-blue/50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Gerando...
            </>
          ) : (
            <>
              <SparklesIcon className="w-6 h-6" />
              Gerar Imagem
            </>
          )}
        </div>
        {!isLoading && (
          <span className={`text-xs flex items-center gap-1 ${hasEnoughCredits ? 'text-cs-blue/80' : 'text-white font-bold'}`}>
            {hasEnoughCredits ? `(Custa ${cost} créditos)` : 'Créditos insuficientes'}
          </span>
        )}
      </button>

      <div className="relative w-full aspect-video bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm mt-4">
        {isLoading && (
          <div className="text-center text-gray-600">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-semibold text-lg">Criando sua imagem...</p>
            <p className="text-sm text-gray-500">Isso pode levar alguns segundos.</p>
          </div>
        )}
        {generationError && !isLoading && (
          <div className="text-center text-red-600 p-4">
            <h3 className="font-bold text-lg mb-2">Ocorreu um Erro</h3>
            <p className="text-sm bg-red-50 p-3 rounded-md">{generationError}</p>
          </div>
        )}
        {!isLoading && !generationError && !generatedImage && (
          <div className="text-center text-gray-500 p-4">
             <h3 className="text-lg font-semibold text-gray-700">Sua criação aparecerá aqui</h3>
             <p className="text-sm">Descreva sua ideia e clique em "Gerar Imagem".</p>
          </div>
        )}
        {generatedImage && (
          <>
            <img src={generatedImage} alt="Generated result" className="max-h-full max-w-full object-contain" />
            {console.log('CreativitySpaceView: Image element rendered with src:', generatedImage ? 'data:...' : 'null')}
            <div className="absolute bottom-4 flex items-center justify-center gap-4 bg-gray-50 p-2 rounded-full">
              <button onClick={handleDownload} className="relative group bg-white rounded-full p-3 text-gray-600 hover:bg-gray-100 hover:text-cs-blue transition-all duration-200 shadow-md" aria-label="Baixar Imagem">
                <DownloadIcon className="w-5 h-5" />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Baixar Imagem
                </div>
              </button>
              {navigator.share && (
                <button onClick={handleShare} className="relative group bg-white rounded-full p-3 text-gray-600 hover:bg-gray-100 hover:text-cs-blue transition-all duration-200 shadow-md" aria-label="Compartilhar">
                  <ShareIcon className="w-5 h-5" />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Compartilhar
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreativitySpaceView;