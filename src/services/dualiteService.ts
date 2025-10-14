import { GoogleGenAI } from '@google/genai';

// ATENÇÃO: Em um aplicativo de produção, a chave de API NUNCA deve ser exposta no frontend.
// Ela é mantida aqui para fins de prototipagem e demonstração neste ambiente.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Alterado para usar import.meta.env
if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY do Google não encontrada. Verifique as variáveis de ambiente.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Explica um trecho de código usando a IA.
 * @param code O código a ser explicado.
 * @returns Uma explicação em texto.
 */
export const explainCode = async (code: string): Promise<string> => {
  const prompt = `Você é um especialista em programação sênior que explica código de forma clara, concisa e em português para um desenvolvedor júnior. Explique o seguinte código:\n\n---\n\n${code}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao explicar o código:", error);
    throw new Error("A IA não conseguiu processar a explicação do código.");
  }
};

/**
 * Gera um trecho de código full-stack com base em um prompt.
 * @param userPrompt A descrição do que o código deve fazer.
 * @returns O código gerado, formatado em markdown.
 */
export const generateCode = async (userPrompt: string): Promise<string> => {
  const prompt = `Você é um assistente de IA especialista em gerar código full-stack. Com base na solicitação a seguir, gere o código correspondente. Forneça apenas o código em um bloco de código formatado (usando markdown), sem nenhuma introdução, resumo ou explicação adicional. Seja completo e forneça um exemplo funcional.\n\nSolicitação: "${userPrompt}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Erro ao gerar o código:", error);
    throw new Error("A IA não conseguiu gerar o código solicitado.");
  }
};