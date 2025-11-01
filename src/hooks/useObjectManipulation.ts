import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import { cleanObject, replaceObject } from '../services/geminiService'; // Importar as novas funções
import { showError } from '../utils/toast';

interface UseObjectManipulationProps {
  originalImageFile: File | null;
  maskDataUrl: string | null;
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
}

interface UseObjectManipulationResult {
  prompt: string;
  setPrompt: (prompt: string) => void;
  generatedImage: string | null;
  isLoading: boolean;
  generationError: string | null;
  handleCleanObject: () => Promise<void>;
  handleReplaceObject: () => Promise<void>;
  clearResults: () => void;
  cleanCost: number;
  replaceCost: number;
}

export const useObjectManipulation = ({
  originalImageFile,
  maskDataUrl,
  setBuyCreditsModalOpen,
  setError,
}: UseObjectManipulationProps): UseObjectManipulationResult => {
  const { user, refreshUser } = useSession();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const cleanCost = 3; // Custo para limpeza de objeto
  const replaceCost = 4; // Custo para substituição de objeto

  const clearResults = useCallback(() => {
    setGeneratedImage(null);
    setGenerationError(null);
    setError(null);
  }, [setError]);

  const checkCreditsAndGenerate = useCallback(async (operation: 'clean' | 'replace', currentPrompt?: string) => {
    if (!originalImageFile || !maskDataUrl || !user) {
      setError('Imagem original, máscara ou usuário não autenticado não disponível.');
      console.error('useObjectManipulation: Dados insuficientes para a operação.');
      return;
    }

    const cost = operation === 'clean' ? cleanCost : replaceCost;
    console.log(`useObjectManipulation: Tentando ${operation}. Custo: ${cost} créditos. Créditos atuais do usuário: ${user.credits}`);

    if (!user.is_admin) {
      if (user.credits < cost) {
        setGenerationError(`Créditos insuficientes para realizar esta operação. Você precisa de ${cost} créditos.`);
        setBuyCreditsModalOpen(true);
        console.warn(`useObjectManipulation: Créditos insuficientes. Necessário: ${cost}, Disponível: ${user.credits}`);
        return;
      }
    }

    if (operation === 'replace' && !currentPrompt?.trim()) {
      setGenerationError("Por favor, descreva o que você quer substituir.");
      console.warn('useObjectManipulation: Prompt vazio para substituição.');
      return;
    }

    setIsLoading(true);
    clearResults();
    console.log(`useObjectManipulation: Iniciando operação de ${operation}...`);

    try {
      const maskFile = await (await fetch(maskDataUrl)).blob();
      const maskImageFile = new File([maskFile], 'mask.png', { type: 'image/png' });

      let resultImage: string;
      if (operation === 'clean') {
        resultImage = await cleanObject(originalImageFile, maskImageFile);
      } else {
        resultImage = await replaceObject(originalImageFile, maskImageFile, currentPrompt || '');
      }
      setGeneratedImage(resultImage);
      console.log(`useObjectManipulation: Imagem de ${operation} gerada com sucesso.`);

      if (!user.is_admin) {
        const newCredits = user.credits - cost;
        console.log(`useObjectManipulation: Deduzindo ${cost} créditos. Novos créditos: ${newCredits}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', user.id);

        if (updateError) {
          console.error('useObjectManipulation: Erro ao deduzir créditos no Supabase:', updateError);
          showError('Erro ao deduzir créditos. A imagem foi gerada, mas houve um problema ao atualizar seus créditos. Por favor, entre em contato com o suporte.');
        } else {
          console.log('useObjectManipulation: Créditos deduzidos com sucesso no Supabase. Atualizando sessão do usuário...');
          await refreshUser();
          console.log('useObjectManipulation: Sessão do usuário atualizada.');
        }
      } else {
        console.log('useObjectManipulation: Usuário é admin, créditos não foram debitados.');
      }

    } catch (err) {
      console.error(`useObjectManipulation: Erro na operação de ${operation}:`, err);
      setGenerationError((err as Error).message || `Ocorreu um erro desconhecido ao ${operation === 'clean' ? 'limpar' : 'substituir'} o objeto.`);
    } finally {
      setIsLoading(false);
      console.log(`useObjectManipulation: Operação de ${operation} finalizada.`);
    }
  }, [originalImageFile, maskDataUrl, user, cleanCost, replaceCost, setBuyCreditsModalOpen, clearResults, refreshUser, setError]);

  const handleCleanObject = useCallback(() => checkCreditsAndGenerate('clean'), [checkCreditsAndGenerate]);
  const handleReplaceObject = useCallback(() => checkCreditsAndGenerate('replace', prompt), [checkCreditsAndGenerate, prompt]);

  return {
    prompt,
    setPrompt,
    generatedImage,
    isLoading,
    generationError,
    handleCleanObject,
    handleReplaceObject,
    clearResults,
    cleanCost,
    replaceCost,
  };
};