import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import App from './src/App';
import LoginPage from "./src/pages/LoginPage";
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider';
import AdminPage from './src/pages/AdminPage';

// Um componente simples para lidar com o redirecionamento inicial da raiz
const RootRedirector: React.FC = () => {
  const navigate = useNavigate();
  const { session, user, isLoading } = useSession(); // Obter o objeto 'user' também

  useEffect(() => {
    console.log('RootRedirector: isLoading:', isLoading, 'session:', session, 'user:', user);
    if (!isLoading) {
      if (session && user) { // Redirecionar para /app somente se a sessão E o usuário estiverem carregados
        console.log('RootRedirector: Sessão e usuário encontrados, redirecionando para /app');
        navigate('/app', { replace: true });
      } else if (!session) { // Se não houver sessão, redirecionar para /login
        console.log('RootRedirector: Nenhuma sessão, redirecionando para /login');
        navigate('/login', { replace: true });
      }
      // Se a sessão existe mas o usuário ainda não foi carregado (session && !user),
      // o componente continuará mostrando o spinner de carregamento.
    }
  }, [session, user, isLoading, navigate]); // Adicionar 'user' às dependências

  if (isLoading || (session && !user)) { // Mostrar carregando se a sessão está carregando OU se a sessão existe mas o perfil do usuário ainda não
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
        </Routes>
      </Router>
    </SessionContextProvider>
  </React.StrictMode>
);