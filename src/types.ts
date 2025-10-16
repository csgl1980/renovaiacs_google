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
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  credits: number;
  is_admin: boolean;
}

export interface Generation {
  id: string;
  generatedImage: string; // Revertido para 'generatedImage' (camelCase)
  prompt: string;
  created_at: string;
  project_id: string;
}

export interface Project {
  id: string;
  name: string;
  originalImage: string; // Revertido para 'originalImage' (camelCase)
  created_at: string;
  generations: Generation[];
  user_id: string;
}