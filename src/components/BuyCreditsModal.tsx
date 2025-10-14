import React from 'react';
import XCircleIcon from './icons/XCircleIcon';
import CoinIcon from './icons/CoinIcon';

interface BuyCreditsModalProps {
  onClose: () => void;
  onSelectPlan: (url: string) => void;
}

const creditPlans = [
  {
    name: 'Pacote Básico',
    credits: 20,
    price: 'R$ 19,90',
    description: 'Ideal para experimentar.',
    hotmartUrl: 'https://pay.hotmart.com/K101885102O',
    popular: false,
  },
  {
    name: 'Pacote Padrão',
    credits: 50,
    price: 'R$ 39,90',
    description: 'O mais popular para projetos.',
    hotmartUrl: 'https://pay.hotmart.com/F101885804K',
    popular: true,
  },
  {
    name: 'Pacote Profissional',
    credits: 150,
    price: 'R$ 99,90',
    description: 'Melhor custo-benefício.',
    hotmartUrl: 'https://pay.hotmart.com/D101885891B',
    popular: false,
  },
];

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ onClose, onSelectPlan }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar modal"
        >
          <XCircleIcon className="w-7 h-7" />
        </button>

        <div className="text-center mb-8">
          <CoinIcon className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Comprar Créditos</h2>
          <p className="text-gray-500 text-sm">Escolha um pacote para continuar criando.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPlans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-lg p-6 flex flex-col text-center transition-all relative ${
                plan.popular ? 'border-indigo-500 border-2 shadow-lg -translate-y-2' : 'border-gray-300'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-gray-900">{plan.credits}</span>
                <span className="text-gray-500 ml-1">créditos</span>
              </div>
              <p className="text-gray-600 flex-grow">{plan.description}</p>
              <div className="text-2xl font-semibold my-4">{plan.price}</div>
              <button
                onClick={() => onSelectPlan(plan.hotmartUrl)}
                className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Comprar Agora
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-8">
          Você será redirecionado para a plataforma de pagamento segura da Hotmart.
        </p>
      </div>
    </div>
  );
};

export default BuyCreditsModal;