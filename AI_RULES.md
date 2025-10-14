# Regras de Desenvolvimento para Renova IA C&S

Este documento descreve as diretrizes e o stack tecnológico para o desenvolvimento do aplicativo Renova IA C&S.

## Stack Tecnológico

*   **Frontend Framework:** React.js
*   **Linguagem:** TypeScript
*   **Estilização:** Tailwind CSS para todos os estilos de componentes e layout.
*   **Inteligência Artificial:** Google Gemini API (`@google/genai`) para todas as interações com modelos de IA, incluindo geração de imagens, explicação de código e estimativa de custos.
*   **Processamento de PDF:** `pdfjs-dist` para manipulação e conversão de arquivos PDF.
*   **Build Tool:** Vite para o ambiente de desenvolvimento e build de produção.
*   **Roteamento:** React Router para gerenciar as rotas da aplicação (manter as rotas em `src/App.tsx`).
*   **Componentes UI:** Utilizar `shadcn/ui` e `Radix UI` para componentes pré-construídos sempre que possível.
*   **Ícones:** `lucide-react` para a inclusão de novos ícones.
*   **Gerenciamento de Estado:** `useState` e `useEffect` do React para o gerenciamento de estado local dos componentes.

## Regras de Uso de Bibliotecas

Para garantir consistência e manutenibilidade, siga as seguintes regras ao utilizar bibliotecas:

*   **AI (Inteligência Artificial):** Todas as chamadas e interações com modelos de IA devem ser feitas através do pacote `@google/genai` e encapsuladas nos serviços `geminiService.ts` e `dualiteService.ts`. Não introduza outras bibliotecas de IA.
*   **PDF:** Para qualquer funcionalidade relacionada a PDF (leitura, renderização, conversão), utilize exclusivamente `pdfjs-dist`.
*   **Estilização:** Use apenas classes utilitárias do Tailwind CSS para estilizar componentes. Evite CSS customizado ou outras bibliotecas de estilo.
*   **Componentes UI:**
    *   Sempre que precisar de um componente de UI comum (botões, modais, inputs, etc.), verifique se existe uma opção adequada em `shadcn/ui` ou `Radix UI`.
    *   Se um componente não estiver disponível ou precisar de personalização significativa, crie um novo componente em `src/components/`.
*   **Ícones:** Para novos ícones, importe-os do pacote `lucide-react`. Se um ícone específico não estiver disponível, crie um componente SVG personalizado em `src/components/icons/`.
*   **Roteamento:** Mantenha a configuração de rotas centralizada em `src/App.tsx` usando React Router.
*   **Requisições HTTP:** Utilize a API `fetch` nativa do navegador, preferencialmente com o utilitário `fetchWithTimeout` para requisições com tempo limite.
*   **Estrutura de Arquivos:**
    *   Componentes devem ser colocados em `src/components/`.
    *   Páginas devem ser colocadas em `src/pages/`.
    *   Serviços de API devem ser colocados em `src/services/`.
    *   Utilitários devem ser colocados em `src/utils/`.
    *   Nomes de diretórios devem ser em minúsculas.
    *   Cada novo componente ou hook deve ter seu próprio arquivo.
*   **Não Overengineer:** Mantenha o código simples e focado na funcionalidade solicitada. Evite adicionar complexidade desnecessária (ex: gerenciamento de estado global complexo se `useState` for suficiente, tratamento de erros excessivo sem solicitação).