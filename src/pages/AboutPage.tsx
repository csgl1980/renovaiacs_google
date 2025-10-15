import React from 'react';
import { useNavigate } from 'react-router-dom';
import XCircleIcon from '../components/icons/XCircleIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import LogoBranco from '/LOGO BRANCO.jpg'; // Importar o logo

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={LogoBranco} alt="Logo C&S Construção" className="h-10 md:h-12" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sobre a C&S Construção</h1>
        </div>
        <button
          onClick={() => navigate('/app')}
          className="p-2 rounded-full hover:bg-gray-200"
          aria-label="Voltar para o aplicativo"
        >
          <XCircleIcon className="w-7 h-7 text-gray-500" />
        </button>
      </header>

      <main className="flex-grow max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-indigo-500" />
            Nossa História e Missão
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A C&S Construção é uma empresa com mais de 20 anos de experiência no mercado, dedicada a transformar sonhos em realidade através de projetos de construção e reforma. Fundada com a visão de oferecer soluções completas e inovadoras, a C&S se destaca pela excelência em cada etapa do processo, desde o planejamento inicial até a entrega final.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Nossa missão é construir e renovar com qualidade, segurança e sustentabilidade, superando as expectativas de nossos clientes. Acreditamos que cada projeto é único e merece atenção personalizada, combinando funcionalidade, estética e as mais recentes tecnologias.
          </p>

          <h3 className="text-lg md:text-xl font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-500" />
            O que nos diferencia
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>**Experiência Comprovada:** Mais de duas décadas de atuação no setor.</li>
            <li>**Equipe Qualificada:** Profissionais experientes e dedicados.</li>
            <li>**Inovação:** Utilização de tecnologias avançadas, como a IA, para visualização de projetos.</li>
            <li>**Compromisso com a Qualidade:** Materiais de primeira linha e acabamento impecável.</li>
            <li>**Atendimento Personalizado:** Foco total nas necessidades e desejos de cada cliente.</li>
          </ul>

          <h3 className="text-lg md:text-xl font-bold text-indigo-700 mb-3 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-500" />
            Visite nosso site
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Para saber mais sobre nossos serviços, portfólio e como podemos ajudar no seu próximo projeto, visite nosso site oficial:
          </p>
          <a
            href="https://cesconstrucao.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Acessar Site da C&S Construção
          </a>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;