import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { Project, Generation } from '../types';

interface UseProjectManagementProps {
  originalImagePreview: string | null;
  pdfPreview: string | null;
  generatedImage: string | null;
  prompt: string;
  selectedStyle: string;
  mode: 'image' | 'floorplan' | 'dualite';
  setError: (error: string | null) => void;
}

interface UseProjectManagementResult {
  projects: Project[];
  handleSaveToProject: (projectId: string | null, newProjectName: string) => Promise<void>;
  handleDeleteProject: (projectId: string) => Promise<void>;
  handleDeleteGeneration: (projectId: string, generationId: string) => Promise<void>;
}

export const useProjectManagement = ({
  originalImagePreview,
  pdfPreview,
  generatedImage,
  prompt,
  selectedStyle,
  mode,
  setError,
}: UseProjectManagementProps): UseProjectManagementResult => {
  const { user } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch projects when user is available
  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('projects')
          .select('*, generations(*)') // Fetch generations along with projects
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('useProjectManagement: Erro ao buscar projetos:', error);
          setError('Erro ao carregar projetos.');
        } else {
          setProjects(data as Project[]);
        }
      } else {
        setProjects([]);
      }
    };
    fetchProjects();
  }, [user, setError]);

  const handleSaveToProject = useCallback(async (projectId: string | null, newProjectName: string) => {
    const originalPreviewForProject = mode === 'image' ? originalImagePreview : pdfPreview;
    
    if (!originalPreviewForProject || !generatedImage || !user) {
      setError('Dados insuficientes para salvar o projeto.');
      return;
    }

    const newGeneration: Omit<Generation, 'id' | 'project_id'> = {
      generatedImage,
      prompt: selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt,
      createdAt: new Date().toISOString(),
    };

    let currentProjectId = projectId;

    if (!currentProjectId) { // Create new project
      const newProject: Omit<Project, 'id' | 'generations'> = {
        name: newProjectName,
        originalImage: originalPreviewForProject,
        createdAt: new Date().toISOString(),
        user_id: user.id,
      };
      const { data, error } = await supabase.from('projects').insert(newProject).select().single();
      if (error) {
        console.error('Erro ao criar novo projeto:', error);
        setError('Erro ao criar novo projeto. Tente novamente.');
        return;
      }
      currentProjectId = data.id;
    }

    // Add generation to project
    const { error: genError } = await supabase.from('generations').insert({
      ...newGeneration,
      project_id: currentProjectId,
    });

    if (genError) {
      console.error('Erro ao salvar geração:', genError);
      setError('Erro ao salvar imagem gerada. Tente novamente.');
      return;
    }
    
    // Refresh projects after saving
    const { data: updatedProjects, error: fetchError } = await supabase
      .from('projects')
      .select('*, generations(*)') // Fetch generations along with projects
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Erro ao recarregar projetos:', fetchError);
      setError('Erro ao recarregar projetos após salvar.');
    } else {
      setProjects(updatedProjects as Project[]);
    }
  }, [originalImagePreview, pdfPreview, generatedImage, prompt, selectedStyle, mode, user, setError]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!user) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
    if (error) {
      console.error('Erro ao deletar projeto:', error);
      setError('Erro ao deletar projeto. Tente novamente.');
    } else {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  }, [user, projects, setError]);
  
  const handleDeleteGeneration = useCallback(async (projectId: string, generationId: string) => {
    if (!user) return;
    const { error } = await supabase.from('generations').delete().eq('id', generationId).eq('project_id', projectId);
    if (error) {
      console.error('Erro ao deletar geração:', error);
      setError('Erro ao deletar imagem gerada. Tente novamente.');
    } else {
      setProjects(prevProjects => prevProjects.map(p =>
        p.id === projectId
          ? { ...p, generations: p.generations.filter(g => g.id !== generationId) }
          : p
      ));
    }
  }, [user, projects, setError]);

  return {
    projects,
    handleSaveToProject,
    handleDeleteProject,
    handleDeleteGeneration,
  };
};