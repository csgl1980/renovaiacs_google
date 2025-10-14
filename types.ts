export interface StyleOption {
  id: string;
  name: string;
  prompt: string;
}

export interface CostEstimateItem {
  item: string;
  materialCost: number;
  laborCost: number;
}

export interface CostEstimate {
  items: CostEstimateItem[];
  totalMaterialCost: number;
  totalLaborCost: number;
  totalCost: number;
}

export interface User {
  name: string;
  email: string;
  token: string;
  credits: number;
}

export interface Generation {
  id: string;
  generatedImage: string;
  prompt: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  originalImage: string;
  createdAt: string;
  generations: Generation[];
}