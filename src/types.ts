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
  id: string; // Adicionado para o ID do Supabase
  first_name: string; // Adicionado para o primeiro nome
  last_name: string; // Adicionado para o sobrenome
  email: string;
  credits: number;
  is_admin: boolean; // Adicionado para identificar administradores
}

export interface Generation {
  id: string;
  generatedImage: string;
  prompt: string;
  createdAt: string;
  project_id: string; // Adicionado para vincular gerações a projetos
}

export interface Project {
  id: string;
  name: string;
  originalImage: string;
  createdAt: string;
  generations: Generation[];
  user_id: string; // Adicionado para vincular projetos a usuários
}