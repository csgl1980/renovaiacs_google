import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { CostEstimate, CostEstimateItem } from '../types';

// ATENÇÃO: Em um aplicativo de produção, a chave de API NUNCA deve ser exposta no frontend.
// Ela é mantida aqui para fins de prototipagem e demonstração neste ambiente.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Alterado para usar import.meta.env
if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY do Google não encontrada. Verifique as variáveis de ambiente.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const redesignImage = async (imageFile: File, prompt: string): Promise<string> => {
    const fullPrompt = `Edite a imagem para aplicar as seguintes instruções. Gere apenas a imagem resultante, sem nenhum texto, comentário ou explicação: "${prompt}"`;
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: fullPrompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error(response.text || "A IA não retornou uma imagem.");
};

export const generateConceptFromPlan = async (imageFile: File, prompt: string): Promise<string> => {
    const fullPrompt = `A partir desta planta baixa, crie uma renderização 3D fotorrealista de alta definição com vista isométrica. A renderização deve ter um aspecto de maquete profissional. Incorpore as seguintes instruções de design. Gere apenas a imagem resultante, sem nenhum texto ou explicação: "${prompt}"`;
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: fullPrompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error(response.text || "A IA não retornou uma imagem de conceito.");
};

export const generateImageFromText = async (prompt: string): Promise<string> => {
    const fullPrompt = `Crie uma imagem fotorrealista de alta qualidade com base na seguinte descrição: "${prompt}". Gere APENAS a imagem resultante, sem nenhum texto, comentário ou explicação.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: fullPrompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error(response.text || "A IA não retornou uma imagem.");
};


export const generateInternalViews = async (imageFile: File, designPrompt: string): Promise<string[]> => {
    const viewTypes = [
        "da sala de estar, mostrando o sofá e a área de TV",
        "da cozinha, com foco na bancada e nos armários",
        "do quarto principal, mostrando a cama e a janela",
        "do banheiro principal, com foco no chuveiro e na pia",
        "de um ângulo amplo da área de jantar, mostrando a mesa e as cadeiras"
    ];

    const imagePart = await fileToGenerativePart(imageFile);
    const generatedUrls: string[] = [];

    // Use um loop sequencial para evitar limites de taxa e permitir sucesso parcial
    for (const view of viewTypes) {
        try {
            const fullPrompt = `A partir desta maquete 3D, gere uma única imagem fotorrealista de uma vista interna (ao nível dos olhos) ${view}. A imagem deve parecer que uma pessoa está dentro do espaço. Incorpore as seguintes instruções de design: "${designPrompt}". Gere APENAS a imagem, sem nenhum texto ou explicação.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: fullPrompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });

            let imageFound = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    imageFound = true;
                    break; // Imagem encontrada, prossiga para a próxima vista
                }
            }

            if (!imageFound) {
                 console.warn(`A IA não retornou uma imagem para a vista: ${view}. Resposta: ${response.text}`);
            }

        } catch (error) {
            console.error(`Erro ao gerar a vista interna para: ${view}`, error);
            // Continue para a próxima vista mesmo que uma falhe
        }
    }

    if (generatedUrls.length === 0) {
        throw new Error("A IA não conseguiu gerar nenhuma das vistas internas. Isso pode ser um problema temporário ou a maquete 3D não foi clara o suficiente. Tente gerar uma variação da maquete ou tente novamente mais tarde.");
    }
    
    return generatedUrls;
};


export const estimateCost = async (prompt: string): Promise<CostEstimate> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                item: { type: Type.STRING, description: "Nome do item ou serviço da reforma." },
                                materialCost: { type: Type.NUMBER, description: "Custo estimado do material em BRL." },
                                laborCost: { type: Type.NUMBER, description: "Custo estimado da mão de obra em BRL." },
                            },
                            required: ["item", "materialCost", "laborCost"]
                        }
                    },
                    totalMaterialCost: { type: Type.NUMBER, description: "Soma de todos os custos de material." },
                    totalLaborCost: { type: Type.NUMBER, description: "Soma de todos os custos de mão de obra." },
                    totalCost: { type: Type.NUMBER, description: "Custo total da reforma (material + mão de obra)." }
                },
                required: ["items", "totalMaterialCost", "totalLaborCost", "totalCost"]
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        // A API pode retornar o JSON dentro de um bloco de código markdown
        const sanitizedJson = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(sanitizedJson);

        // Validação extra para garantir que o objeto tem a estrutura esperada
        if (parsed && Array.isArray(parsed.items) && typeof parsed.totalCost === 'number') {
           return parsed;
        } else {
           throw new Error("A resposta da IA não corresponde ao formato esperado.");
        }
    } catch (e) {
        console.error("Erro ao analisar a estimativa de custo:", e);
        throw new Error("Não foi possível processar a estimativa de custo retornada pela IA.");
    }
};