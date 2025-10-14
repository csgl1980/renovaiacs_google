import React, { useState } from 'react';
import type { Project } from '../types'; // Caminho corrigido
import XCircleIcon from './icons/XCircleIcon';
import FolderIcon from './icons/FolderIcon';

interface SaveToProjectModalProps {
  projects: Project[];
  onClose: () => void;
  onSave: (projectId: string | null, newProjectName: string) => void;
}

const SaveToProjectModal: React.FC<SaveToProjectModalProps> = ({ projects, onClose, onSave }) => {
  const [selectedProject, setSelectedProject] = useState<string>('new');
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (selectedProject === 'new' && !newProjectName.trim()) {
      setError('Por favor, dê um nome ao novo projeto.');
      return;
    }
    setError('');
    onSave(selectedProject === 'new' ? null : selectedProject, newProjectName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
          <XCircleIcon className="w-7 h-7" />
        </button>
        <div className="text-center mb-6">
          <FolderIcon className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Salvar no Projeto</h2>
          <p className="text-gray-500 text-sm">Organize suas ideias em projetos.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="project-select" className="block text-sm font-medium text-gray-700">Selecione um Projeto</label>
            <select
              id="project-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="new">-- Criar Novo Projeto --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProject === 'new' && (
            <div>
              <label htmlFor="new-project-name" className="block text-sm font-medium text-gray-700">Nome do Novo Projeto</label>
              <input
                id="new-project-name"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ex: Renovação da Cozinha"
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Salvar Imagem
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveToProjectModal;