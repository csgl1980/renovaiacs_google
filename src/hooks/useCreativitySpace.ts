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

  const cost = 5;

  const clearResults = useCallback(() => {
    // Limpa apenas o erro, a imagem deve permanecer até uma nova geração ou ação do usuário
    setGenerationError(null);
    setError(null);
  }, [setError]);

  const handleGenerateImage = useCallback(async () => {
    if (!user) {
      setGenerationError('Usuário não autenticado para gerar a imagem.');
      console.error('useCreativitySpace: Usuário não autenticado para gerar a imagem.');
      return;
    }

    console.log(`useCreativitySpace: Tentando gerar imagem. Custo: ${cost} créditos. Créditos atuais do usuário: ${user.credits}`);
    
    // Ignorar verificação de créditos e débito para usuários administradores
    if (!user.is_admin) {
      if (user.credits < cost) {
        setGenerationError(`Créditos insuficientes para gerar a imagem. Você precisa de ${cost} créditos.`);
        setBuyCreditsModalOpen(true);
        console.warn(`useCreativitySpace: Créditos insuficientes. Necessário: ${cost}, Disponível: ${user.credits}`);
        return;
      }
    }

    if (!prompt.trim()) {
      setGenerationError("Por favor, descreva o que você quer criar.");
      console.warn('useCreativitySpace: Prompt vazio.');
      return;
    }

    setIsLoading(true);
    setGenerationError(null); // Limpa o erro anterior
    setGeneratedImage(null); // Limpa a imagem anterior ao iniciar uma nova geração
    console.log('useCreativitySpace: Iniciando geração de imagem no Espaço Criatividade...');

    try {
      const resultImage = await generateImageFromText(prompt);
      setGeneratedImage(resultImage);
      console.log('useCreativitySpace: Imagem gerada com sucesso.');

      // Deduct credits from Supabase ONLY if not admin
      if (!user.is_admin) {
        const newCredits = user.credits - cost;
        console.log(`useCreativitySpace: Deduzindo ${cost} créditos. Novos créditos: ${newCredits}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', user.id);

        if (updateError) {
          console.error('useCreativitySpace: Erro ao deduzir créditos no Supabase:', updateError);
          setGenerationError('Erro ao deduzir créditos. Tente novamente.');
        } else {
          console.log('useCreativitySpace: Créditos deduzidos com sucesso no Supabase. Atualizando sessão do usuário...');
          await refreshUser();
          console.log('useCreativitySpace: Sessão do usuário atualizada.');
        }
      } else {
        console.log('useCreativitySpace: Usuário é admin, créditos não foram debitados.');
      }

    } catch (err) {
      console.error('useCreativitySpace: Erro na geração de imagem do Espaço Criatividade:', err);
      setGenerationError((err as Error).message || "Ocorreu um erro desconhecido ao gerar a imagem.");
    } finally {
      setIsLoading(false);
      console.log('useCreativitySpace: Geração de imagem no Espaço Criatividade finalizada.');
    }
  }, [user, prompt, cost, setBuyCreditsModalOpen, refreshUser, setError]);

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