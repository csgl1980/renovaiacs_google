import { useState, useCallback } from 'react';
import { estimateCost } from '../services/geminiService';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { CostEstimate } from '../types';

interface UseCostEstimationProps {
  generatedImage: string | null;
  prompt: string;
  selectedStyle: string;
  setBuyCreditsModalOpen: (isOpen: boolean) => void; // Adicionado
}

interface UseCostEstimationResult {
  isEstimatingCost: boolean;
  costEstimate: CostEstimate | null;
  costError: string | null;
  handleEstimateCost: () => Promise<void>;
  clearCostEstimation: () => void;
  estimationCost: number; // Adicionado
}

export const useCostEstimation = ({
  generatedImage,
  prompt,
  selectedStyle,
  setBuyCreditsModalOpen, // Adicionado
}: UseCostEstimationProps): UseCostEstimationResult => {
  const { user, refreshUser } = useSession(); // Adicionado
  const [isEstimatingCost, setIsEstimatingCost] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [costError, setCostError] = useState<string | null>(null);

  const estimationCost = 1; // Custo para estimativa de custo

  const clearCostEstimation = useCallback(() => {
    setCostEstimate(null);
    setCostError(null);
  }, []);

  const handleEstimateCost = useCallback(async () => {
    if (!generatedImage || !user) { // Adicionado verificação de usuário
      setCostError('Imagem gerada ou usuário não autenticado não disponível para estimar custo.');
      return;
    }

    if (user.credits < estimationCost) { // Verificação de créditos
      setCostError(`Créditos insuficientes para estimar o custo. Você precisa de ${estimationCost} crédito.`);
      setBuyCreditsModalOpen(true);
      return;
    }

    const fullPrompt = selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt;
    if (!fullPrompt) {
      setCostError("É necessário um prompt para estimar o custo.");
      return;
    }

    setIsEstimatingCost(true);
    setCostError(null);
    setCostEstimate(null);

    const estimationPrompt = `Com base na seguinte descrição de uma reforma: "${fullPrompt}", e considerando a imagem gerada, crie uma estimativa de custo detalhada em BRL para uma cidade de médio porte no Brasil. Separe os custos de material e mão de obra para cada item. Forneça o resultado em JSON.`;

    try {
      const estimate = await estimateCost(estimationPrompt);
      setCostEstimate(estimate);

      // Deduct credits from Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: user.credits - estimationCost })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao deduzir créditos para estimativa de custo:', updateError);
        setCostError('Erro ao deduzir créditos para estimativa de custo. Tente novamente.');
      } else {
        await refreshUser(); // Refresh user context to show updated credits
      }

    } catch (err) {
      console.error('Erro na estimativa de custo:', err);
      setCostError((err as Error).message || "Falha ao estimar o custo.");
    } finally {
      setIsEstimatingCost(false);
    }
  }, [generatedImage, prompt, selectedStyle, user, estimationCost, setBuyCreditsModalOpen, refreshUser]);

  return {
    isEstimatingCost,
    costEstimate,
    costError,
    handleEstimateCost,
    clearCostEstimation,
    estimationCost, // Retorna o custo
  };
};