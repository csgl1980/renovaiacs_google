import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { showError } from '../utils/toast';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onResult, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showError('Seu navegador não suporta reconhecimento de voz.');
      console.error('VoiceInputButton: Navegador não suporta SpeechRecognition.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Captura uma única frase
    recognitionRef.current.interimResults = false; // Não mostra resultados intermediários
    recognitionRef.current.lang = 'pt-BR'; // Define o idioma para Português do Brasil

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      console.log('VoiceInputButton: Começou a ouvir...');
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      console.log('VoiceInputButton: Resultado da fala:', transcript);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('VoiceInputButton: Erro no reconhecimento de voz:', event.error, event.message);
      let errorMessage = `Erro no reconhecimento de voz: ${event.error}`;
      if (event.error === 'not-allowed') {
        errorMessage = 'Permissão de microfone negada. Por favor, permita o acesso ao microfone nas configurações do seu navegador.';
      } else if (event.error === 'network') {
        errorMessage = 'Erro de rede no reconhecimento de voz. Verifique sua conexão ou tente novamente.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'Nenhuma fala detectada. Tente novamente.';
      }
      showError(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      console.log('VoiceInputButton: Parou de ouvir.');
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('VoiceInputButton: Erro ao iniciar reconhecimento:', e);
      showError('Não foi possível iniciar o reconhecimento de voz. Verifique as permissões do microfone.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={toggleListening}
      disabled={disabled}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isListening ? 'Parar de ouvir' : 'Iniciar reconhecimento de voz'}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
};

export default VoiceInputButton;