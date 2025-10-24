import React, { useRef, useState, useEffect, useCallback } from 'react';
import { STYLE_OPTIONS } from '@/src/constants';
import type { StyleOption } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import CoinIcon from './icons/CoinIcon';
import VoiceInputButton from './VoiceInputButton'; // Importar o novo componente

interface PromptControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
  isImageUploaded: boolean;
  cost: number;
  credits: number;
}

const PromptControls: React.FC<PromptControlsProps> = ({
  prompt,
  setPrompt,
  selectedStyle,
  setSelectedStyle,
  handleGenerate,
  isLoading,
  isImageUploaded,
  cost,
  credits
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const hasEnoughCredits = credits >= cost;

  const checkForScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(isScrollable && el.scrollLeft > 0);
      setCanScrollRight(isScrollable && el.scrollLeft < el.scrollWidth - el.clientWidth - 1); // -1 for precision
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    checkForScroll();
    const el = scrollContainerRef.current;
    el?.addEventListener('scroll', checkForScroll);
    window.addEventListener('resize', checkForScroll);

    return () => {
      el?.removeEventListener('scroll', checkForScroll);
      window.removeEventListener('resize', checkForScroll);
    };
  }, [checkForScroll]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.8; // Scroll 80% of the visible width
      el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleVoiceResult = (text: string) => {
    setPrompt(prevPrompt => (prevPrompt ? `${prevPrompt} ${text}` : text));
  };

  const selectedStyleDetails = STYLE_OPTIONS.find(s => s.prompt === selectedStyle);

  return (
    <div className="w-full flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">2. Descreva a Mudança</h2>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Mude a cor da parede para azul, adicione um sofá de couro..."
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue transition-shadow duration-200"
            rows={3}
            disabled={!isImageUploaded}
          />
          <div className="absolute top-2 right-2">
            <VoiceInputButton onResult={handleVoiceResult} disabled={!isImageUploaded} />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-600 mb-2">Ou escolha um estilo:</h3>
        <div className="relative">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-0 disabled:cursor-default transition-all"
              aria-label="Rolar para esquerda"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600"/>
            </button>
            <div ref={scrollContainerRef} className="flex overflow-x-auto pb-2 -mx-1 px-1 gap-2 custom-scrollbar flex-grow">
              {STYLE_OPTIONS.map((style: StyleOption) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(selectedStyle === style.prompt ? '' : style.prompt)}
                  disabled={!isImageUploaded}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex-shrink-0 ${
                    selectedStyle === style.prompt
                      ? 'bg-cs-blue text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {style.name}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-0 disabled:cursor-default transition-all"
              aria-label="Rolar para direita"
            >
              <ArrowRightIcon className="w-5 h-5 text-gray-600"/>
            </button>
          </div>
        </div>
        {selectedStyleDetails && (
          <div className="mt-3 p-3 bg-cs-blue/10 border border-cs-blue/30 rounded-lg transition-all duration-300">
            <h4 className="font-bold text-cs-blue">{selectedStyleDetails.name}</h4>
            <p className="text-sm text-gray-700 mt-1">{selectedStyleDetails.prompt}</p>
          </div>
        )}
      </div>
      <button
        onClick={handleGenerate}
        disabled={isLoading || !isImageUploaded || (!prompt && !selectedStyle) || !hasEnoughCredits}
        className={`w-full flex flex-col items-center justify-center gap-1 bg-cs-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-cs-blue/90 transition-colors duration-300 disabled:bg-cs-blue/50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
      >
        <div className="flex items-center gap-2">
            {isLoading ? (
            <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processando...
            </>
            ) : (
            <>
                <SparklesIcon className="w-6 h-6" />
                Gerar Transformação
            </>
            )}
        </div>
        {!isLoading && isImageUploaded && (
             <span className={`text-xs flex items-center gap-1 ${hasEnoughCredits ? 'text-cs-blue/80' : 'text-white font-bold'}`}>
                {hasEnoughCredits ? `(Custa ${cost} ${cost === 1 ? 'crédito' : 'créditos'})` : 'Créditos insuficientes'}
             </span>
        )}
      </button>
    </div>
  );
};

export default PromptControls;