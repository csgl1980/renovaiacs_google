import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import UserIcon from './icons/UserIcon';
import LogOutIcon from './icons/LogOutIcon';
import FolderIcon from './icons/FolderIcon';
import CoinIcon from './icons/CoinIcon';
import SettingsIcon from './icons/SettingsIcon';
import type { User } from '../types';
import { Link } from 'react-router-dom';
import LogoBranco from '/LOGO BRANCO.jpg';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onOpenProjects: () => void;
  onBuyCredits: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onSignup, onLogout, onOpenProjects, onBuyCredits }) => {
  const displayName = user ? (user.first_name || user.email) : '';

  return (
    <header className="bg-white shadow-sm p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo e Título */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src={LogoBranco} alt="Logo C&S Construção" className="h-10 md:h-12" />
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-cs-blue" /> {/* Usando a nova cor */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Renova IA C&S
            </h1>
          </div>
        </div>

        {/* Seção de Usuário/Autenticação */}
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center md:items-start gap-3 mt-4 md:mt-0">
          {user ? (
            <div className="flex flex-col items-center md:items-end gap-2 w-full">
              {/* Créditos e Nome do Usuário */}
              <div className="flex flex-col sm:flex-row items-center gap-2 text-gray-700 mb-1">
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                  <CoinIcon className="w-5 h-5 text-cs-orange" /> {/* Usando a nova cor */}
                  <span className="font-bold text-gray-800">{user.credits}</span>
                  <span className="text-sm text-gray-500">créditos</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Olá, {displayName}</span>
                </div>
              </div>
              {/* Botões de Ação */}
              <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full">
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
                  to="/about"
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  aria-label="Sobre a C&S"
                >
                  <SparklesIcon className="w-5 h-5 text-cs-blue" /> {/* Usando a nova cor */}
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
                <button
                  onClick={onBuyCredits}
                  className="w-full md:w-auto bg-cs-orange text-white font-bold px-3 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors" {/* Usando a nova cor */}
                  aria-label="Comprar Créditos"
                >
                  Comprar Créditos
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full justify-center md:justify-end">
              <button
                onClick={onLogin}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={onSignup}
                className="bg-cs-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors" {/* Usando a nova cor */}
              >
                Cadastre-se
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-md md:text-lg text-gray-600 text-center">
        Visualize a transformação do seu espaço com Inteligência Artificial.
      </p>
    </header>
  );
};

export default Header;