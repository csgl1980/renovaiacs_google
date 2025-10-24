import { useState, useCallback } from 'react';
import { redesignImage, generateConceptFromPlan } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { User } from '../types';

interface UseGenerationProps {
  originalImageFile: File | null;
  mode: 'image' | 'floorplan' | 'dualite';
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
}

interface UseGenerationResult {
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  generatedImage: string | null;
  setGeneratedImage: (image: string | null) => void; // EXPOSTO
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
}: UseGenerationProps): UseGenerationResult => {
  const { user, refreshUser } = useSession();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVariationLoading, setIsVariationLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const baseGenerationCost = mode === 'image' ? 2 : 3;
  const variationCost = 2;

  const clearGenerationResults = useCallback(() => {
    setGeneratedImage(null);
    setGenerationError(null);
    setError(null);
  }, [setError]);

  const handleGenerate = useCallback(async (isVariation = false) => {
    if (!originalImageFile || !user) {
      setError('Dados insuficientes para gerar a imagem ou usuário não autenticado.');
      console.error('useGeneration: Dados insuficientes para gerar a imagem ou usuário não autenticado.');
      return;
    }

    const currentGenerationCost = isVariation ? variationCost : baseGenerationCost;
    console.log(`useGeneration: Tentando gerar imagem. Custo: ${currentGenerationCost} créditos. Créditos atuais do usuário: ${user.credits}`);

    // Ignorar verificação de créditos e débito para usuários administradores
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
      if (mode === 'image') {
        resultImage = await redesignImage(originalImageFile, fullPrompt);
      } else { // floorplan
        resultImage = await generateConceptFromPlan(originalImageFile, fullPrompt);
      }
      setGeneratedImage(resultImage);
      console.log('useGeneration: Imagem gerada com sucesso.');

      // Deduct credits from Supabase ONLY if not admin
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
  }, [originalImageFile, user, baseGenerationCost, variationCost, selectedStyle, prompt, mode, setBuyCreditsModalOpen, clearGenerationResults, refreshUser, setError]);

  return {
    prompt,
    setPrompt,
    selectedStyle,
    setSelectedStyle,
    generatedImage,
    setGeneratedImage, // EXPOSTO
    isLoading,
    isVariationLoading,
    generationError,
    handleGenerate,
    clearGenerationResults,
    generationCost: baseGenerationCost,
  };
};