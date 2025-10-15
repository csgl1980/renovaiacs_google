import { useState, useCallback } from 'react';
import { generateInternalViews } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { User } from '../types';

// Helper to convert a data URL string to a File object
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

interface UseInternalViewsProps {
  generatedImage: string | null;
  prompt: string;
  selectedStyle: string;
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
}

interface UseInternalViewsResult {
  isInternalViewsLoading: boolean;
  internalViews: string[] | null;
  internalViewsError: string | null;
  handleGenerateInternalViews: () => Promise<void>;
  clearInternalViews: () => void;
  internalViewsCost: number;
}

export const useInternalViews = ({
  generatedImage,
  prompt,
  selectedStyle,
  setBuyCreditsModalOpen,
}: UseInternalViewsProps): UseInternalViewsResult => {
  const { user, refreshUser } = useSession();
  const [isInternalViewsLoading, setIsInternalViewsLoading] = useState(false);
  const [internalViews, setInternalViews] = useState<string[] | null>(null);
  const [internalViewsError, setInternalViewsError] = useState<string | null>(null);

  const internalViewsCost = 5;

  const clearInternalViews = useCallback(() => {
    setInternalViews(null);
    setInternalViewsError(null);
  }, []);

  const handleGenerateInternalViews = useCallback(async () => {
    if (!generatedImage || !user) return;

    if (user.credits < internalViewsCost) {
      setInternalViewsError(`Créditos insuficientes para gerar as vistas internas. Você precisa de ${internalViewsCost} créditos.`);
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
  }, [generatedImage, user, prompt, selectedStyle, setBuyCreditsModalOpen, refreshUser]);

  return {
    isInternalViewsLoading,
    internalViews,
    internalViewsError,
    handleGenerateInternalViews,
    clearInternalViews,
    internalViewsCost,
  };
};