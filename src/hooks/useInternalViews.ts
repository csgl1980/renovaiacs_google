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
    if (!generatedImage || !user) {
      setInternalViewsError('Imagem gerada ou usuário não autenticado não disponível para gerar vistas internas.');
      return;
    }

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
    setInternalViewsError(null); // Limpar erros anteriores
    setInternalViews(null);
    try {
      const conceptImageFile = await dataUrlToFile(generatedImage, 'concept-3d.png');
      const views = await generateInternalViews(conceptImageFile, fullPrompt);
      
      if (views.length === 0) {
        setInternalViewsError("A IA não conseguiu gerar nenhuma vista interna. Tente novamente com um prompt diferente.");
      } else {
        setInternalViews(views);
      }

      // Deduct credits from Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: user.credits - internalViewsCost })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao deduzir créditos em useInternalViews:', updateError);
        setInternalViewsError('Erro ao deduzir créditos. Tente novamente.');
      } else {
        await refreshUser(); // Refresh user context to show updated credits
      }

    } catch (err) {
      console.error('Erro na geração de vistas internas:', err);
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