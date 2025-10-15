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
  const variationCost = 2; // Custo de variação ajustado para 2 créditos

  const clearGenerationResults = useCallback(() => {
    setGeneratedImage(null);
    setGenerationError(null);
    setError(null); // Clear main app error
  }, [setError]);

  const handleGenerate = useCallback(async (isVariation = false) => {
    if (!originalImageFile || !user) return;

    const currentGenerationCost = isVariation ? variationCost : baseGenerationCost;
    if (user.credits < currentGenerationCost) {
      setGenerationError(`Créditos insuficientes para realizar esta operação. Você precisa de ${currentGenerationCost} créditos.`);
      setBuyCreditsModalOpen(true);
      return;
    }

    const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
    if (!fullPrompt) {
      setGenerationError("Por favor, descreva a mudança ou escolha um estilo.");
      return;
    }

    if (isVariation) {
      setIsVariationLoading(true);
    } else {
      setIsLoading(true);
      clearGenerationResults();
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
        .update({ credits: user.credits - currentGenerationCost })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao deduzir créditos:', updateError);
        setGenerationError('Erro ao deduzir créditos. Tente novamente.');
      } else if (updatedProfile) {
        refreshUser(); // Refresh user context to show updated credits
      }

    } catch (err) {
      setGenerationError((err as Error).message || "Ocorreu um erro desconhecido ao gerar a imagem.");
    } finally {
      setIsLoading(false);
      setIsVariationLoading(false);
    }
  }, [originalImageFile, user, baseGenerationCost, variationCost, selectedStyle, prompt, mode, setBuyCreditsModalOpen, clearGenerationResults, refreshUser]);

  return {
    prompt,
    setPrompt,
    selectedStyle,
    setSelectedStyle,
    generatedImage,
    isLoading,
    isVariationLoading,
    generationError,
    handleGenerate,
    clearGenerationResults,
    generationCost: baseGenerationCost, // Retorna o custo base para a primeira geração
  };
};