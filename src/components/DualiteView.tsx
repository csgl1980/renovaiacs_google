import React, { useState } from 'react';
import { explainCode, generateCode } from '../services/dualiteService'; // Caminho corrigido
import SparklesIcon from './icons/SparklesIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CodeIcon from './icons/CodeIcon';

type DualiteViewMode = 'explain' | 'generate';

const DualiteView: React.FC = () => {
  const [mode, setMode] = useState<DualiteViewMode>('generate');
  
  // State for 'explain' mode
  const [codeToExplain, setCodeToExplain] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // State for 'generate' mode
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleExplain = async () => {
    if (!codeToExplain.trim()) return;
    setIsExplaining(true);
    setExplanation('');
    setExplainError(null);
    try {
      const result = await explainCode(codeToExplain);
      setExplanation(result);
    } catch (err: any) {
      setExplainError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleGenerate = async () => {
    if (!generationPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedCode('');
    setGenerateError(null);
    try {
      const result = await generateCode(generationPrompt);
      setGeneratedCode(result);
    } catch (err: any) {
      setGenerateError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    // Extracts code from markdown block if present
    const codeMatch = generatedCode.match(/```(?:\w+)?\n([\s\S]+)```/);
    const codeToCopy = codeMatch ? codeMatch[1] : generatedCode;
    
    navigator.clipboard.writeText(codeToCopy).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const ResultDisplay: React.FC<{
    isLoading: boolean;
    error: string | null;
    content: string;
    isCode?: boolean;
    placeholder: string;
  }> = ({ isLoading, error, content, isCode = false, placeholder }) => (
    <div className="relative w-full min-h-[300px] bg-gray-900 text-white rounded-lg border border-gray-700 flex flex-col overflow-hidden shadow-inner">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center text-gray-300">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="font-semibold">Processando...</p>
          </div>
        </div>
      )}
      {error && !isLoading && (
        <div className="p-4 text-center text-red-400">
          <h3 className="font-bold mb-1">Ocorreu um Erro</h3>
          <p className="text-sm bg-red-900/50 p-2 rounded-md">{error}</p>
        </div>
      )}
      {!isLoading && !error && !content && (
        <div className="m-auto text-center text-gray-500 p-4">
          <p>{placeholder}</p>
        </div>
      )}
      {!isLoading && content && (
        <>
            {isCode && (
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-indigo-600 text-gray-200 font-semibold px-3 py-1.5 rounded-md text-xs transition-colors"
                    >
                        <ClipboardIcon className="w-4 h-4" />
                        {copySuccess ? 'Copiado!' : 'Copiar'}
                    </button>
                </div>
            )}
            <pre className="p-4 overflow-auto h-full flex-grow">
                <code className={`whitespace-pre-wrap ${isCode ? 'font-mono' : ''}`}>
                    {content}
                </code>
            </pre>
        </>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Controls */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('generate')}
            className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'generate' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Gerar Código
          </button>
          <button
            onClick={() => setMode('explain')}
            className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'explain' ? 'bg-white text-indigo-600 shadow' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Explicar Código
          </button>
        </div>

        {mode === 'generate' && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="generate-prompt" className="text-lg font-semibold text-gray-700 mb-2 block">1. Descreva o que você precisa</label>
              <textarea
                id="generate-prompt"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="Ex: Crie um componente React com um botão que busca e exibe uma piada de uma API pública."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 font-mono text-sm"
                rows={6}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !generationPrompt.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Gerar Código
                </>
              )}
            </button>
          </div>
        )}

        {mode === 'explain' && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="explain-code" className="text-lg font-semibold text-gray-700 mb-2 block">1. Cole seu código aqui</label>
              <textarea
                id="explain-code"
                value={codeToExplain}
                onChange={(e) => setCodeToExplain(e.target.value)}
                placeholder="function helloWorld() { console.log('Hello, World!'); }"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 font-mono text-sm"
                rows={6}
              />
            </div>
            <button
              onClick={handleExplain}
              disabled={isExplaining || !codeToExplain.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-300 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
            >
              {isExplaining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analisando...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Explicar Código
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Results */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {mode === 'generate' && (
          <ResultDisplay
            isLoading={isGenerating}
            error={generateError}
            content={generatedCode}
            isCode={true}
            placeholder="O código gerado aparecerá aqui"
          />
        )}
        {mode === 'explain' && (
          <ResultDisplay
            isLoading={isExplaining}
            error={explainError}
            content={explanation}
            isCode={false}
            placeholder="A explicação do código aparecerá aqui"
          />
        )}
      </div>
    </div>
  );
};

export default DualiteView;