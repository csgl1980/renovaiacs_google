import { useState, useCallback } from 'react';
import { estimateCost } from '../services/geminiService'; // Caminho corrigido
import type { CostEstimate } from '../types'; // Caminho corrigido

interface UseCostEstimationProps {
  generatedImage: string | null;
  prompt: string;
  selectedStyle: string;
}

interface UseCostEstimationResult {
  isEstimatingCost: boolean;
  costEstimate: CostEstimate | null;
  costError: string | null;
  handleEstimateCost: () => Promise<void>;
  clearCostEstimation: () => void;
}

export const useCostEstimation = ({
  generatedImage,
  prompt,
  selectedStyle,
}: UseCostEstimationProps): UseCostEstimationResult => {
  const [isEstimatingCost, setIsEstimatingCost] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [costError, setCostError] = useState<string | null>(null);

  const clearCostEstimation = useCallback(() => {
    setCostEstimate(null);
    setCostError(null);
  }, []);

  const handleEstimateCost = useCallback(async () => {
    if (!generatedImage) return;
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
    } catch (err) {
      setCostError((err as Error).message || "Falha ao estimar o custo.");
    } finally {
      setIsEstimatingCost(false);
    }
  }, [generatedImage, prompt, selectedStyle]);

  return {
    isEstimatingCost,
    costEstimate,
    costError,
    handleEstimateCost,
    clearCostEstimation,
  };
};