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
  email: string; // Adicionado
  credits: number;
  is_admin: boolean; // Adicionado
}

export interface Generation {
  id: string;
  generatedImage: string;
  prompt: string;
  created_at: string;
  project_id: string;
}

export interface Project {
  id: string;
  name: string;
  originalImage: string;
  created_at: string;
  generations: Generation[];
  user_id: string;
}