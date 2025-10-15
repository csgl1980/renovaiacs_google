import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import App from './src/App';
import LoginPage from "./src/pages/LoginPage";
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider';
import AdminPage from './src/pages/AdminPage';
import AboutPage from './src/pages/AboutPage'; // Importar a nova página

// Um componente simples para lidar com o redirecionamento inicial da raiz
const RootRedirector: React.FC = () => {
  const navigate = useNavigate();
  const { session, user, isLoading } = useSession(); // Obter o objeto 'user' também

  useEffect(() => {
    console.log('RootRedirector: isLoading:', isLoading, 'session:', session, 'user:', user);
    if (!isLoading) { // Uma vez que o SessionContextProvider terminou de carregar
      if (session && user) { // Se a sessão e o perfil do usuário estiverem carregados
        console.log('RootRedirector: Sessão e usuário encontrados, redirecionando para /app');
        navigate('/app', { replace: true });
      } else { // Se não houver sessão ou o perfil do usuário não foi carregado
        console.log('RootRedirector: Nenhuma sessão ou perfil de usuário, redirecionando para /login');
        navigate('/login', { replace: true });
      }
    }
  }, [session, user, isLoading, navigate]); // Adicionar 'user' às dependências

  if (isLoading) { // Mostrar carregando APENAS se o SessionContextProvider ainda estiver processando
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-gray-700 ml-4">Carregando...</p>
      </div>
    );
  }
  return null; // Deve redirecionar antes de renderizar qualquer coisa
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SessionContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirector />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app/*" element={<App />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} /> {/* Nova rota */}
        </Routes>
      </Router>
    </SessionContextProvider>
  </React.StrictMode>
);