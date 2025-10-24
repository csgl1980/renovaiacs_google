import { useState, useCallback, useEffect } from 'react';
import { generateImageFromText } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import { showError } from '../utils/toast'; // Importar showError

interface UseCreativitySpaceProps {
  prompt: string; // Agora recebido como prop
  setPrompt: (prompt: string) => void; // Agora recebido como prop
  generatedImage: string | null; // Agora recebido como prop
  setGeneratedImage: (image: string | null) => void; // Agora recebido como prop
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
}

interface UseCreativitySpaceResult {
  // prompt e setPrompt não são mais retornados, pois são passados como props
  // generatedImage não é mais retornado, pois é passado como prop
  isLoading: boolean;
  generationError: string | null;
  handleGenerateImage: () => Promise<void>;
  clearResults: () => void;
  cost: number;
}

export const useCreativitySpace = ({
  prompt,
  setPrompt,
  generatedImage,
  setGeneratedImage,
  setBuyCreditsModalOpen,
  setError,
}: UseCreativitySpaceProps): UseCreativitySpaceResult => {
  const { user, refreshUser } = useSession();
  // prompt e generatedImage não são mais estados internos aqui
  const [isLoading, setIsLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const cost = 5;

  const clearResults = useCallback(() => {
    setGenerationError(null);
    setError(null);
    setGeneratedImage(null); // Limpa a imagem gerada também
    setPrompt(''); // Limpa o prompt
  }, [setError, setGeneratedImage, setPrompt]);

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
    console.log('useCreativitySpace: Iniciando geração de imagem no Espaço Criatividade. generatedImage set to null.');

    try {
      const resultImage = await generateImageFromText(prompt);
      setGeneratedImage(resultImage);
      console.log('useCreativitySpace: Imagem gerada e setada. generatedImage agora é:', resultImage ? 'present' : 'null');

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
          // Usa toast para notificar sobre o erro de crédito, mas mantém a imagem gerada
          showError('Erro ao deduzir créditos. A imagem foi gerada, mas houve um problema ao atualizar seus créditos. Por favor, entre em contato com o suporte.');
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
      console.log('useCreativitySpace: Geração de imagem no Espaço Criatividade finalizada. isLoading set to false.');
    }
  }, [user, prompt, cost, setBuyCreditsModalOpen, refreshUser, setError, setGeneratedImage]);

  // Adiciona um useEffect para logar mudanças no estado generatedImage
  useEffect(() => {
    console.log('useCreativitySpace (useEffect): generatedImage state changed to:', generatedImage ? 'present' : 'null');
  }, [generatedImage]);

  return {
    // prompt e setPrompt não são mais retornados
    // generatedImage não é mais retornado
    isLoading,
    generationError,
    handleGenerateImage,
    clearResults,
    cost,
  };
};