import { useState, useCallback } from 'react';
import { estimateCost } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { CostEstimate } from '../types';

interface UseCostEstimationProps {
  generatedImage: string | null;
  prompt: string;
  selectedStyle: string;
  setBuyCreditsModalOpen: (isOpen: boolean) => void;
}

interface UseCostEstimationResult {
  isEstimatingCost: boolean;
  costEstimate: CostEstimate | null;
  costError: string | null;
  handleEstimateCost: () => Promise<void>;
  clearCostEstimation: () => void;
  estimationCost: number;
}

export const useCostEstimation = ({
  generatedImage,
  prompt,
  selectedStyle,
  setBuyCreditsModalOpen,
}: UseCostEstimationProps): UseCostEstimationResult => {
  const { user, refreshUser } = useSession();
  const [isEstimatingCost, setIsEstimatingCost] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [costError, setCostError] = useState<string | null>(null);

  const estimationCost = 1;

  const clearCostEstimation = useCallback(() => {
    setCostEstimate(null);
    setCostError(null);
  }, []);

  const handleEstimateCost = useCallback(async () => {
    if (!generatedImage || !user) {
      setCostError('Imagem gerada ou usuário não autenticado não disponível para estimar custo.');
      console.error('useCostEstimation: Imagem gerada ou usuário não autenticado não disponível para estimar custo.');
      return;
    }

    console.log(`useCostEstimation: Tentando estimar custo. Custo: ${estimationCost} crédito. Créditos atuais do usuário: ${user.credits}`);
    
    // Ignorar verificação de créditos e débito para usuários administradores
    if (!user.is_admin) {
      if (user.credits < estimationCost) {
        setCostError(`Créditos insuficientes para estimar o custo. Você precisa de ${estimationCost} crédito.`);
        setBuyCreditsModalOpen(true);
        console.warn(`useCostEstimation: Créditos insuficientes. Necessário: ${estimationCost}, Disponível: ${user.credits}`);
        return;
      }
    }

    const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
    if (!fullPrompt) {
      setCostError("É necessário um prompt para estimar o custo.");
      console.warn('useCostEstimation: Prompt vazio para estimativa de custo.');
      return;
    }

    setIsEstimatingCost(true);
    setCostError(null);
    setCostEstimate(null);
    console.log('useCostEstimation: Iniciando estimativa de custo...');

    const estimationPrompt = `Com base na seguinte descrição de uma reforma: "${fullPrompt}", e considerando a imagem gerada, crie uma estimativa de custo detalhada em BRL para uma cidade de médio porte no Brasil. Separe os custos de material e mão de obra para cada item. Forneça o resultado em JSON.`;
    console.log('useCostEstimation: Prompt enviado para IA:', estimationPrompt);

    try {
      const estimate = await estimateCost(estimationPrompt);
      setCostEstimate(estimate);
      console.log('useCostEstimation: Estimativa de custo recebida com sucesso.');

      // Deduct credits from Supabase ONLY if not admin
      if (!user.is_admin) {
        const newCredits = user.credits - estimationCost;
        console.log(`useCostEstimation: Deduzindo ${estimationCost} créditos. Novos créditos: ${newCredits}`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', user.id);

        if (updateError) {
          console.error('useCostEstimation: Erro ao deduzir créditos no Supabase:', updateError);
          setCostError('Erro ao deduzir créditos para estimativa de custo. Tente novamente.');
        } else {
          console.log('useCostEstimation: Créditos deduzidos com sucesso no Supabase. Atualizando sessão do usuário...');
          await refreshUser();
          console.log('useCostEstimation: Sessão do usuário atualizada.');
        }
      } else {
        console.log('useCostEstimation: Usuário é admin, créditos não foram debitados.');
      }

    } catch (err) {
      console.error('useCostEstimation: Erro na estimativa de custo:', err);
      setCostError((err as Error).message || "Falha ao estimar o custo.");
    } finally {
      setIsEstimatingCost(false);
      console.log('useCostEstimation: Estimativa de custo finalizada.');
    }
  }, [generatedImage, prompt, selectedStyle, user, estimationCost, setBuyCreditsModalOpen, refreshUser]);

  return {
    isEstimatingCost,
    costEstimate,
    costError,
    handleEstimateCost,
    clearCostEstimation,
    estimationCost,
  };
};