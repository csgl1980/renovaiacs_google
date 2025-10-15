import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import UserIcon from './icons/UserIcon';
import LogOutIcon from './icons/LogOutIcon';
import FolderIcon from './icons/FolderIcon';
import CoinIcon from './icons/CoinIcon';
import SettingsIcon from './icons/SettingsIcon';
import type { User } from '../types';
import { Link } from 'react-router-dom';
import LogoBranco from '/LOGO BRANCO.jpg'; // Importar o logo

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onOpenProjects: () => void;
  onBuyCredits: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onSignup, onLogout, onOpenProjects, onBuyCredits }) => {
  const displayName = user ? (user.first_name || user.email) : ''; // Prioriza o primeiro nome, senão usa o email

  return (
    <header className="text-center p-4 md:p-6 relative bg-white shadow-sm"> {/* Fundo branco para o header */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <img src={LogoBranco} alt="Logo C&S Construção" className="h-10 md:h-12" />
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
             {user ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4 text-gray-700 mb-1">
                      <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                        <CoinIcon className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-gray-800">{user.credits}</span>
                        <span className="text-sm text-gray-500">créditos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        <span className="font-medium">Olá, {displayName}</span>
                      </div>
                    </div>
                    {/* Container for action buttons */}
                    <div>
                      <div className="flex items-center gap-2">
                          {user.is_admin && (
                            <Link
                              to="/admin"
                              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                              aria-label="Painel de Administração"
                            >
                              <SettingsIcon className="w-5 h-5" />
                              <span>Admin</span>
                            </Link>
                          )}
                          <Link
                            to="/about" // Novo botão para a página "Sobre a C&S"
                            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                            aria-label="Sobre a C&S"
                          >
                            <SparklesIcon className="w-5 h-5" /> {/* Usando SparklesIcon temporariamente */}
                            <span>Sobre C&S</span>
                          </Link>
                          <button
                              onClick={onOpenProjects}
                              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                              aria-label="Meus Projetos"
                          >
                              <FolderIcon className="w-5 h-5" />
                              <span>Projetos</span>
                          </button>
                          <button
                            onClick={onLogout}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                            aria-label="Sair"
                          >
                            <LogOutIcon className="w-5 h-5" />
                            <span>Sair</span>
                          </button>
                      </div>
                      <button
                          onClick={onBuyCredits}
                          className="w-full mt-2 bg-amber-400 text-amber-900 font-bold px-3 py-2 rounded-lg text-sm hover:bg-amber-500 transition-colors"
                          aria-label="Comprar Créditos"
                      >
                          Comprar Créditos
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onLogin}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={onSignup}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Cadastre-se
                    </button>
                  </div>
                )}
        </div>
      <div className="flex items-center justify-center gap-3">
        <SparklesIcon className="w-8 h-8 text-indigo-500" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Renova IA C&S
        </h1>
      </div>
      <p className="mt-2 text-md md:text-lg text-gray-600">
        Visualize a transformação do seu espaço com Inteligência Artificial.
      </p>
    </header>
  );
};

export default Header;