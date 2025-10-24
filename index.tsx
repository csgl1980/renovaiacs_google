import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import App from './src/App';
import LoginPage from "./src/pages/LoginPage";
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider';
import AdminPage from './src/pages/AdminPage';
import AboutPage from './src/pages/AboutPage';
import ToastProvider from './src/components/ToastProvider'; // Importar ToastProvider
import './index.css'; // Importar o CSS aqui

// Um componente simples para lidar com o redirecionamento inicial da raiz
const RootRedirector: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession(); // Removido 'user'

  useEffect(() => {
    console.log('RootRedirector: isLoading:', isLoading, 'session:', session); // Removido user do log
    if (!isLoading) {
      if (session) { // Apenas verifica a sessão, não o user
        console.log('RootRedirector: Sessão encontrada, redirecionando para /app');
        navigate('/app', { replace: true });
      } else {
        console.log('RootRedirector: Nenhuma sessão, redirecionando para /login');
        navigate('/login', { replace: true });
      }
    }
  }, [session, isLoading, navigate]); // Removido user da lista de dependências

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-cs-blue rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-gray-700 ml-4">Carregando...</p>
      </div>
    );
  }
  return null;
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
        <ToastProvider /> {/* Adicionar ToastProvider aqui */}
        <Routes>
          <Route path="/" element={<RootRedirector />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app/*" element={<App />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Router>
    </SessionContextProvider>
  </React.StrictMode>
);