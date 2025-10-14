import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface AuthPlaceholderProps {
    onLogin: () => void;
    onSignup: () => void;
}

const AuthPlaceholder: React.FC<AuthPlaceholderProps> = ({ onLogin, onSignup }) => {
    return (
        <div className="text-center bg-white rounded-xl shadow-lg p-8 md:p-12 mt-8 max-w-2xl mx-auto">
            <SparklesIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Desbloqueie todo o potencial
            </h2>
            <p className="text-gray-600 mb-6">
                Faça login ou crie uma conta para começar a transformar seus espaços com o poder da Inteligência Artificial.
            </p>
            <div className="flex justify-center gap-4">
                 <button
                    onClick={onLogin}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                    Entrar
                </button>
                <button
                    onClick={onSignup}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                    Criar Conta
                </button>
            </div>
        </div>
    );
};

export default AuthPlaceholder;
