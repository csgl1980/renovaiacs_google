import React, { useEffect } from 'react';
import XCircleIcon from './icons/XCircleIcon';

interface HotmartRedirectModalProps {
  onClose: () => void;
  redirectUrl: string;
}

const HotmartRedirectModal: React.FC<HotmartRedirectModalProps> = ({ onClose, redirectUrl }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (redirectUrl) {
        window.open(redirectUrl, '_blank');
        onClose(); // Close modal after opening the new tab
      }
    }, 1500); // Wait 1.5 seconds before redirecting

    return () => clearTimeout(timer);
  }, [redirectUrl, onClose]);

  const handleRedirect = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar modal"
        >
          <XCircleIcon className="w-7 h-7" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Redirecionando para Pagamento</h2>
        
        <div className="w-10 h-10 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin mx-auto my-6"></div>

        <p className="text-gray-600 text-sm mb-6">
          Você está sendo redirecionado para um ambiente de pagamento seguro. Se a página não abrir automaticamente, clique no botão abaixo.
        </p>

        <button
          onClick={handleRedirect}
          className="w-full bg-cs-blue text-white font-bold py-3 rounded-lg hover:bg-cs-blue/90 transition-colors"
        >
          Ir para Pagamento
        </button>
      </div>
    </div>
  );
};

export default HotmartRedirectModal;