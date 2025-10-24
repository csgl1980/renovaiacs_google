import React, { useState } from 'react';
import type { Project, Generation } from '../types';
import XCircleIcon from './icons/XCircleIcon';
import FolderIcon from './icons/FolderIcon';
import TrashIcon from './icons/TrashIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import EyeIcon from './icons/EyeIcon'; // Importar EyeIcon

interface ProjectsViewProps {
  projects: Project[];
  onClose: () => void;
  onDeleteProject: (projectId: string) => void;
  onDeleteGeneration: (projectId: string, generationId: string) => void;
  onLoadGeneration: (generatedImage: string, prompt: string) => void; // Nova prop
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onClose, onDeleteProject, onDeleteGeneration, onLoadGeneration }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <div 
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
        onClick={() => setSelectedProject(project)}
    >
      <div className="aspect-video overflow-hidden rounded-t-lg">
        <img src={project.originalImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 truncate">{project.name}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {project.generations.length} {project.generations.length === 1 ? 'imagem' : 'imagens'}
        </span>
      </div>
    </div>
  );
  
  const ProjectDetailView: React.FC<{ project: Project }> = ({ project }) => (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedProject(null)} className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
          </div>
          <button onClick={() => onDeleteProject(project.id)} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition-colors">
            <TrashIcon className="w-4 h-4" />
            Excluir Projeto
          </button>
      </header>
      <div className="flex-grow p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-700 mb-2">Imagem Original</h3>
            <img src={project.originalImage} alt="Original" className="rounded-lg w-full aspect-video object-cover shadow-md" />
        </div>
        <div className="md:col-span-2">
            <h3 className="font-semibold text-gray-700 mb-2">Imagens Geradas ({project.generations.length})</h3>
            {project.generations.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {project.generations.map(gen => (
                    <div key={gen.id} className="relative group aspect-square">
                        <img src={gen.generatedImage} alt={`Geração ${gen.id}`} className="w-full h-full object-cover rounded-lg shadow-sm" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white text-xs">
                            <button onClick={() => onDeleteGeneration(project.id, gen.id)} className="absolute top-1 right-1 p-1.5 bg-white/20 hover:bg-red-500 rounded-full">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                            <p className="line-clamp-4 overflow-hidden">{gen.prompt}</p>
                            <button 
                                onClick={() => {
                                    onLoadGeneration(gen.generatedImage, gen.prompt);
                                    onClose(); // Fecha o modal de projetos após carregar
                                }} 
                                className="mt-2 flex items-center justify-center gap-1 bg-cs-blue text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-cs-blue/90 transition-colors"
                            >
                                <EyeIcon className="w-4 h-4" />
                                Ver no App
                            </button>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg text-gray-500">
                    Nenhuma imagem gerada neste projeto.
                </div>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col" role="dialog" aria-modal="true">
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <FolderIcon className="w-7 h-7 text-cs-blue" />
                <h2 className="text-2xl font-bold text-gray-800">Meus Projetos</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" aria-label="Fechar">
                <XCircleIcon className="w-7 h-7 text-gray-500" />
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            {selectedProject ? (
                <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{height: 'calc(100vh - 120px)'}}>
                    <ProjectDetailView project={selectedProject} />
                </div>
            ) : (
                <>
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700">Nenhum projeto encontrado</h3>
                        <p className="text-gray-500 mt-2">Gere uma imagem e salve-a para criar seu primeiro projeto.</p>
                    </div>
                )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;