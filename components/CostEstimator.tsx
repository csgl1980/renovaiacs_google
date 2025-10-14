import React from 'react';
import DollarSignIcon from './icons/DollarSignIcon';
import ShareIcon from './icons/ShareIcon';
import type { CostEstimate } from '../types';

interface CostEstimatorProps {
  isLoading: boolean;
  estimate: CostEstimate | null;
  error: string | null;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({ isLoading, estimate, error }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleShare = async () => {
    if (!estimate) return;

    let shareText = 'Estimativa de Custo da Transformação - Renova IA C&S\n\n';
    
    estimate.items.forEach(item => {
        shareText += `Item: ${item.item}\n`;
        shareText += ` • Custo Material: ${formatCurrency(item.materialCost)}\n`;
        shareText += ` • Custo Mão de Obra: ${formatCurrency(item.laborCost)}\n\n`;
    });

    shareText += '------------------------------------\n';
    shareText += `Subtotal Material: ${formatCurrency(estimate.totalMaterialCost)}\n`;
    shareText += `Subtotal Mão de Obra: ${formatCurrency(estimate.totalLaborCost)}\n\n`;
    shareText += `TOTAL GERAL ESTIMADO: ${formatCurrency(estimate.totalCost)}\n\n`;
    shareText += '*Valores são estimativas e podem variar.\n';
    shareText += 'https://cesconstrucao.com.br/';

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Estimativa de Custo - Renova IA C&S',
                text: shareText,
            });
        } catch (e) {
            console.error('Erro ao compartilhar:', e);
            // Silently fail is ok for share cancellation
        }
    } else {
        alert('Seu navegador não suporta a função de compartilhamento.');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-gray-500 flex items-center justify-center p-6">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin mr-3"></div>
          <p className="font-semibold">Estimando custos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 p-4">
          <p className="font-bold mb-2">Erro ao estimar custo</p>
          <p className="text-sm bg-red-50 p-2 rounded-md">{error}</p>
        </div>
      );
    }

    if (estimate) {
      return (
        <div className="w-full text-left pt-4">
          <div className="flex justify-between items-center mb-3 px-4">
            <h3 className="text-lg font-bold text-gray-800">Estimativa de Custo</h3>
             {navigator.share && (
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                  aria-label="Compartilhar estimativa"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-left">Item</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-right">Custo Material</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 text-right">Custo Mão de Obra</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-3 text-sm text-gray-700">{item.item}</td>
                    <td className="p-3 text-sm text-gray-700 text-right">{formatCurrency(item.materialCost)}</td>
                    <td className="p-3 text-sm text-gray-700 text-right">{formatCurrency(item.laborCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-bold">
                <tr className="border-b border-gray-300">
                   <td className="p-3 text-gray-800">Subtotal</td>
                   <td className="p-3 text-gray-800 text-right">{formatCurrency(estimate.totalMaterialCost)}</td>
                   <td className="p-3 text-gray-800 text-right">{formatCurrency(estimate.totalLaborCost)}</td>
                </tr>
                <tr>
                   <td colSpan={2} className="p-4 text-xl text-indigo-700">Total Geral Estimado</td>
                   <td className="p-4 text-xl text-indigo-700 text-right">{formatCurrency(estimate.totalCost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
           <p className="text-xs text-gray-400 mt-3 px-4 pb-4 italic">*Todos os valores são estimativas e podem variar.</p>
        </div>
      );
    }

    return null; // Don't render anything if there's no action
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {renderContent()}
    </div>
  );
};

export default CostEstimator;