import React, { useState } from 'react';
import XCircleIcon from './icons/XCircleIcon';
import SparklesIcon from './icons/SparklesIcon';

type AuthView = 'login' | 'signup';

interface AuthModalProps {
  initialView?: AuthView;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  authError: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({
  initialView = 'login',
  onClose,
  onLogin,
  onSignup,
  authError,
}) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); 

    if (view === 'signup' && password !== confirmPassword) {
      setLocalError("As senhas não coincidem.");
      return; 
    }
    if (password.length < 6) {
        setLocalError("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    setIsLoading(true);
    try {
      if (view === 'login') {
        await onLogin(email, password);
      } else {
        await onSignup(name, email, password);
      }
      // On success, the parent component will close the modal by changing state
    } catch (error) {
      // Error is handled by parent component and passed via authError prop
      // No need to do anything here, the parent will update the prop
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar modal"
        >
          <XCircleIcon className="w-7 h-7" />
        </button>
        
        <div className="text-center mb-6">
            <SparklesIcon className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">
                {view === 'login' ? 'Bem-vindo de volta!' : 'Crie sua Conta'}
            </h2>
            <p className="text-gray-500 text-sm">
                {view === 'login' ? 'Entre para continuar' : 'Rápido e fácil'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
            />
          </div>
          {view === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirmar Senha</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
              />
            </div>
          )}
          
          {(authError || localError) && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{authError || localError}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-300"
          >
             {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
             {view === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <p className="text-gray-600">
            {view === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
              className="font-semibold text-indigo-600 hover:text-indigo-500 ml-1"
            >
              {view === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;