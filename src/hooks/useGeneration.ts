import { useState, useCallback } from 'react';
import { redesignImage, generateConceptFromPlan } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { User } from '../types';

interface UseGenerationProps {
  originalImageFile: File | null;
  mode: 'image' | 'floorplan' | 'dualite' | 'creativity' | 'exteriorDesign';
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  setGeneratedImage: (image: string | null) => void; // Adicionado para permitir que o App.tsx controle o estado
}

interface UseGenerationResult {
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  generatedImage: string | null; // Mantido para uso interno do hook, mas o App.tsx é o mestre
  // setGeneratedImage: (image: string | null) => void; // Removido daqui, pois já é uma prop
  isLoading: boolean;
  isVariationLoading: boolean;
  generationError: string | null;
  handleGenerate: (isVariation?: boolean) => Promise<void>;
  clearGenerationResults: () => void;
  generationCost: number;
}

export const useGeneration = ({
  originalImageFile,
  mode,
  setBuyCreditsModalOpen,
  setError,
  setGeneratedImage, // Recebido como prop
}: UseGenerationProps): UseGenerationResult => {
  const { user, refreshUser } = useSession();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [internalGeneratedImage, setInternalGeneratedImage] = useState<string | null>(null); // Estado interno para o hook

  const [isLoading, setIsLoading] = useState(false);
  const [isVariationLoading, setIsVariationLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Define o custo base de geração com base no modo
  let baseGenerationCost: number;
  switch (mode) {
    case 'image':
    case 'exteriorDesign':
      baseGenerationCost = 2;
      break;
    case 'floorplan':
      baseGenerationCost = 3;
      break;
    case 'creativity':
    case 'dualite':
      baseGenerationCost = 0; // Estes modos não usam este hook para geração principal
      break;
    default:
      baseGenerationCost = 0;
  }
  
  const variationCost = 2;

  const clearGenerationResults = useCallback(() => {
    setInternalGeneratedImage(null); // Limpa o estado interno
    setGeneratedImage(null); // Limpa o estado no App.tsx
    setGenerationError(null);
    setError(null);
  }, [setError, setGeneratedImage]);

  const handleGenerate = useCallback(async (isVariation = false) => {
    if (!['image', 'floorplan', 'exteriorDesign'].includes(mode)) {
      setGenerationError(`A geração de imagem não é suportada no modo '${mode}' por este componente.`);
      setIsLoading(false);
      setIsVariationLoading(false);
      return;
    }

    if (!originalImageFile || !user) {
      setError('Dados insuficientes para gerar a imagem ou usuário não autenticado.');
      console.error('useGeneration: Dados insuficientes para gerar a imagem ou usuário não autenticado.');
      return;
    }

    const currentGenerationCost = isVariation ? variationCost : baseGenerationCost;
    console.log(`useGeneration: Tentando gerar imagem. Custo: ${currentGenerationCost} créditos. Créditos atuais do usuário: ${user.credits}`);

    if (!user.is_admin) {
      if (user.credits < currentGenerationCost) {
        setGenerationError(`Créditos insuficientes para realizar esta operação. Você precisa de ${currentGenerationCost} créditos.`);
        setBuyCreditsModalOpen(true);
        console.warn(`useGeneration: Créditos insuficientes. Necessário: ${currentGenerationCost}, Disponível: ${user.credits}`);
        return;
      }
    }

    const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
    if (!fullPrompt) {
      setGenerationError("Por favor, descreva a mudança ou escolha um estilo.");
      console.warn('useGeneration: Prompt vazio.');
      return;
    }

    if (isVariation) {
      setIsVariationLoading(true);
      console.log('useGeneration: Iniciando geração de variação...');
    } else {
      setIsLoading(true);
      clearGenerationResults();
      console.log('useGeneration: Iniciando nova geração...');
    }

    try {
      let resultImage: string;
      if (mode === 'image' || mode === 'exteriorDesign') {
        resultImage = await redesignImage(originalImageFile, fullPrompt);
      } else if (mode === 'floorplan') {
        resultImage = await generateConceptFromPlan(originalImageFile, fullPrompt);
      } else {
        throw new Error(`Modo de geração '${mode}' não suportado por este hook.`);
      }
      console.log('useGeneration: Imagem recebida da IA. Tamanho:', resultImage ? resultImage.length : 'null');
      setInternalGeneratedImage(resultImage); // Atualiza o estado interno
      setGeneratedImage(resultImage); // Atualiza o estado no App.tsx
      console.log('useGeneration: Imagem gerada com sucesso e definida no estado.');

      if (!user.is_admin) {
        const newCredits = user.credits - currentGenerationCost;
        console.log(`useGeneration: Deduzindo ${currentGenerationCost} créditos. Novos créditos: ${newCredits}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', user.id);

        if (updateError) {
          console.error('useGeneration: Erro ao deduzir créditos no Supabase:', updateError);
          setGenerationError('Erro ao deduzir créditos. Tente novamente.');
        } else {
          console.log('useGeneration: Créditos deduzidos com sucesso no Supabase. Atualizando sessão do usuário...');
          await refreshUser();
          console.log('useGeneration: Sessão do usuário atualizada.');
        }
      } else {
        console.log('useGeneration: Usuário é admin, créditos não foram debitados.');
      }

    } catch (err) {
      console.error('useGeneration: Erro na geração da imagem:', err);
      setGenerationError((err as Error).message || "Ocorreu um erro desconhecido ao gerar a imagem.");
    } finally {
      setIsLoading(false);
      setIsVariationLoading(false);
      console.log('useGeneration: Geração finalizada.');
    }
  }, [originalImageFile, user, baseGenerationCost, variationCost, selectedStyle, prompt, mode, setBuyCreditsModalOpen, clearGenerationResults, refreshUser, setError, setGeneratedImage]);

  return {
    prompt,
    setPrompt,
    selectedStyle,
    setSelectedStyle,
    generatedImage: internalGeneratedImage, // Retorna o estado interno
    setGeneratedImage, // Mantido para compatibilidade, mas o App.tsx é o mestre
    isLoading,
    isVariationLoading,
    generationError,
    handleGenerate,
    clearGenerationResults,
    generationCost: baseGenerationCost,
  };
};