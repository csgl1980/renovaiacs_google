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
      console.error('useInternalViews: Imagem gerada ou usuário não autenticado não disponível para gerar vistas internas.');
      return;
    }

    console.log(`useInternalViews: Tentando gerar vistas internas. Custo: ${internalViewsCost} créditos. Créditos atuais do usuário: ${user.credits}`);
    
    // Ignorar verificação de créditos e débito para usuários administradores
    if (!user.is_admin) {
      if (user.credits < internalViewsCost) {
        setInternalViewsError(`Créditos insuficientes para gerar as vistas internas. Você precisa de ${internalViewsCost} créditos.`);
        setBuyCreditsModalOpen(true);
        console.warn(`useInternalViews: Créditos insuficientes. Necessário: ${internalViewsCost}, Disponível: ${user.credits}`);
        return;
      }
    }

    const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
    if (!fullPrompt) {
      setInternalViewsError("Por favor, descreva o estilo de design para as vistas internas.");
      console.warn('useInternalViews: Prompt vazio para vistas internas.');
      return;
    }

    setIsInternalViewsLoading(true);
    setInternalViewsError(null);
    setInternalViews(null);
    console.log('useInternalViews: Iniciando geração de vistas internas...');

    try {
      const conceptImageFile = await dataUrlToFile(generatedImage, 'concept-3d.png');
      console.log('useInternalViews: Imagem de conceito convertida para File.');
      const views = await generateInternalViews(conceptImageFile, fullPrompt);
      
      if (views.length === 0) {
        setInternalViewsError("A IA não conseguiu gerar nenhuma vista interna. Tente novamente com um prompt diferente.");
        console.warn('useInternalViews: Nenhuma vista interna gerada pela IA.');
      } else {
        setInternalViews(views);
        console.log(`useInternalViews: ${views.length} vistas internas geradas com sucesso.`);
      }

      // Deduct credits from Supabase ONLY if not admin
      if (!user.is_admin) {
        const newCredits = user.credits - internalViewsCost;
        console.log(`useInternalViews: Deduzindo ${internalViewsCost} créditos. Novos créditos: ${newCredits}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', user.id);

        if (updateError) {
          console.error('useInternalViews: Erro ao deduzir créditos no Supabase:', updateError);
          setInternalViewsError('Erro ao deduzir créditos. Tente novamente.');
        } else {
          console.log('useInternalViews: Créditos deduzidos com sucesso no Supabase. Atualizando sessão do usuário...');
          await refreshUser();
          console.log('useInternalViews: Sessão do usuário atualizada.');
        }
      } else {
        console.log('useInternalViews: Usuário é admin, créditos não foram debitados.');
      }

    } catch (err) {
      console.error('useInternalViews: Erro na geração de vistas internas:', err);
      setInternalViewsError((err as Error).message || "Ocorreu um erro ao gerar as vistas internas.");
    } finally {
      setIsInternalViewsLoading(false);
      console.log('useInternalViews: Geração de vistas internas finalizada.');
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