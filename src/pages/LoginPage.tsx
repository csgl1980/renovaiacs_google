import React, { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useSession, parseHashParams } from '../components/SessionContextProvider'; // Importar parseHashParams
import { useNavigate } from 'react-router-dom';
import LogoBranco from '/LOGO BRANCO.jpg';
import AuthForm from '../components/AuthForm';

const LoginPage: React.FC = () => {
  const { session, user, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const hashParams = parseHashParams(hash); // Usar a função exportada
    const isPasswordRecovery = hashParams.type === 'recovery';

    console.log('LoginPage: useEffect - isLoading:', isLoading, 'session:', session, 'user:', user, 'isPasswordRecovery:', isPasswordRecovery);
    
    // Only redirect if NOT in a password recovery flow AND session/user exist
    if (!isLoading && session && user && !isPasswordRecovery) {
      console.log('LoginPage: Sessão e usuário encontrados, navegando para /app');
      navigate('/app', { replace: true });
    }
  }, [session, user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LogoBranco} alt="Logo C&S Construção" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Bem-vindo ao Renova IA C&S</h2>
          <p className="text-gray-600 mt-2">Entre ou cadastre-se para começar a transformar seus espaços.</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default LoginPage;