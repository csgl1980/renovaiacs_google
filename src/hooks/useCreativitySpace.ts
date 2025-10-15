import { useState, useCallback } from 'react';
import { generateImageFromText } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';

interface UseCreativitySpaceProps {
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
}

interface UseCreativitySpaceResult {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedImage: string | null;
  isLoading: boolean;
  generationError: string | null;
  handleGenerateImage: () => Promise<void>;
  clearResults: () => void;
  cost: number;
}

export const useCreativitySpace = ({
  setBuyCreditsModalOpen,
  setError,
}: UseCreativitySpaceProps): UseCreativitySpaceResult => {
  const { user, refreshUser } = useSession();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const cost = 5; // 5 créditos por geração de imagem

  const clearResults = useCallback(() => {
    setGeneratedImage(null);
    setGenerationError(null);
    setError(null);
  }, [setError]);

  const handleGenerateImage = useCallback(async () => {
    if (!user) return;

    if (user.credits < cost) {
      setGenerationError("Créditos insuficientes para gerar a imagem.");
      setBuyCreditsModalOpen(true);
      return;
    }

    if (!prompt.trim()) {
      setGenerationError("Por favor, descreva o que você quer criar.");
      return;
    }

    setIsLoading(true);
    clearResults();

    try {
      const resultImage = await generateImageFromText(prompt);
      setGeneratedImage(resultImage);

      // Deduct credits from Supabase
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ credits: user.credits - cost })
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
    }
  }, [user, prompt, cost, setBuyCreditsModalOpen, clearResults, refreshUser]);

  return {
    prompt,
    setPrompt,
    generatedImage,
    isLoading,
    generationError,
    handleGenerateImage,
    clearResults,
    cost,
  };
};