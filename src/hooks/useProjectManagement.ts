import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useSession } from '../components/SessionContextProvider';
import type { Project, Generation } from '../types';
import { showSuccess, showError } from '../utils/toast'; // Importar showSuccess e showError

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
        console.log('useProjectManagement: Buscando projetos para o usuário:', user.id);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, original_image, created_at, user_id, generations(id, generated_image, prompt, created_at, project_id)') // Explicitly select columns
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('useProjectManagement: Erro ao buscar projetos:', error);
          setError('Erro ao carregar projetos.');
          showError('Erro ao carregar projetos.');
        } else {
          // Map snake_case from DB to camelCase for frontend types
          const mappedProjects = data.map(p => ({
            ...p,
            originalImage: p.original_image,
            generations: p.generations.map((g: any) => ({
              ...g,
              generatedImage: g.generated_image,
            }))
          })) as Project[];
          setProjects(mappedProjects);
          console.log('useProjectManagement: Projetos carregados:', mappedProjects);
        }
      } else {
        setProjects([]);
        console.log('useProjectManagement: Usuário não autenticado, limpando projetos.');
      }
    };
    fetchProjects();
  }, [user, setError]);

  const handleSaveToProject = useCallback(async (projectId: string | null, newProjectName: string) => {
    const originalPreviewForProject = mode === 'image' ? originalImagePreview : pdfPreview;
    
    if (!originalPreviewForProject || !generatedImage || !user) {
      setError('Dados insuficientes para salvar o projeto.');
      showError('Dados insuficientes para salvar o projeto.');
      console.error('useProjectManagement: Dados insuficientes para salvar o projeto. originalPreviewForProject:', originalPreviewForProject, 'generatedImage:', generatedImage, 'user:', user);
      return;
    }

    const newGeneration: Omit<Generation, 'id' | 'project_id'> = {
      generated_image: generatedImage,
      prompt: selectedStyle ? `${prompt} ${selectedStyle}`.trim() : prompt,
      created_at: new Date().toISOString(),
    };
    console.log('useProjectManagement: Nova geração a ser salva:', newGeneration);

    let currentProjectId = projectId;
    let isNewProject = false;

    if (!currentProjectId) { // Create new project
      isNewProject = true;
      const newProject: Omit<Project, 'id' | 'generations'> = {
        name: newProjectName,
        original_image: originalPreviewForProject,
        created_at: new Date().toISOString(),
        user_id: user.id,
      };
      console.log('useProjectManagement: Criando novo projeto:', newProject);
      const { data, error } = await supabase.from('projects').insert(newProject).select().single();
      if (error) {
        console.error('useProjectManagement: Erro ao criar novo projeto:', error);
        setError('Erro ao criar novo projeto. Tente novamente.');
        showError('Erro ao criar novo projeto.');
        return;
      }
      currentProjectId = data.id;
      console.log('useProjectManagement: Novo projeto criado com ID:', currentProjectId);
    }

    // Add generation to project
    console.log('useProjectManagement: Adicionando geração ao projeto ID:', currentProjectId);
    const { error: genError } = await supabase.from('generations').insert({
      ...newGeneration,
      project_id: currentProjectId,
    });

    if (genError) {
      console.error('useProjectManagement: Erro ao salvar geração:', genError);
      setError('Erro ao salvar imagem gerada. Tente novamente.');
      showError('Erro ao salvar imagem gerada.');
      return;
    }
    console.log('useProjectManagement: Geração salva com sucesso.');
    
    // Refresh projects after saving
    console.log('useProjectManagement: Recarregando projetos após salvar...');
    const { data: updatedProjects, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, original_image, created_at, user_id, generations(id, generated_image, prompt, created_at, project_id)') // Explicitly select columns
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('useProjectManagement: Erro ao recarregar projetos:', fetchError);
      setError('Erro ao recarregar projetos após salvar.');
      showError('Erro ao recarregar projetos após salvar.');
    } else {
      const mappedProjects = updatedProjects.map(p => ({
        ...p,
        originalImage: p.original_image,
        generations: p.generations.map((g: any) => ({
          ...g,
          generatedImage: g.generated_image,
        }))
      })) as Project[];
      setProjects(mappedProjects);
      showSuccess(isNewProject ? 'Novo projeto criado e imagem salva!' : 'Imagem salva no projeto existente!');
      console.log('useProjectManagement: Projetos recarregados:', mappedProjects);
    }
  }, [originalImagePreview, pdfPreview, generatedImage, prompt, selectedStyle, mode, user, setError]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!user) return;
    console.log('useProjectManagement: Deletando projeto ID:', projectId, 'para usuário:', user.id);
    const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
    if (error) {
      console.error('useProjectManagement: Erro ao deletar projeto:', error);
      setError('Erro ao deletar projeto. Tente novamente.');
      showError('Erro ao deletar projeto.');
    } else {
      setProjects(projects.filter(p => p.id !== projectId));
      showSuccess('Projeto deletado com sucesso!');
      console.log('useProjectManagement: Projeto deletado com sucesso.');
    }
  }, [user, projects, setError]);
  
  const handleDeleteGeneration = useCallback(async (projectId: string, generationId: string) => {
    if (!user) return;
    console.log('useProjectManagement: Deletando geração ID:', generationId, 'do projeto ID:', projectId);
    const { error } = await supabase.from('generations').delete().eq('id', generationId).eq('project_id', projectId);
    if (error) {
      console.error('useProjectManagement: Erro ao deletar geração:', error);
      setError('Erro ao deletar imagem gerada. Tente novamente.');
      showError('Erro ao deletar imagem gerada.');
    } else {
      setProjects(prevProjects => prevProjects.map(p =>
        p.id === projectId
          ? { ...p, generations: p.generations.filter(g => g.id !== generationId) }
          : p
      ));
      showSuccess('Imagem gerada deletada com sucesso!');
      console.log('useProjectManagement: Geração deletada com sucesso.');
    }
  }, [user, projects, setError]);

  return {
    projects,
    handleSaveToProject,
    handleDeleteProject,
    handleDeleteGeneration,
  };
};