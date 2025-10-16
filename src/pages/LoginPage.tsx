import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import SparklesIcon from '../components/icons/SparklesIcon';
import { useSession } from '../components/SessionContextProvider';
import { useNavigate } from 'react-router-dom';
import LogoBranco from '/LOGO BRANCO.jpg'; // Caminho atualizado para a pasta public

const LoginPage: React.FC = () => {
  const { session, user, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LoginPage: useEffect - isLoading:', isLoading, 'session:', session, 'user:', user);
    if (!isLoading && session && user) {
      console.log('LoginPage: Sessão e usuário encontrados, navegando para /app');
      navigate('/app', { replace: true });
    }
  }, [session, user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LogoBranco} alt="Logo C&S Construção" className="h-16 mx-auto mb-4" /> {/* Logo aqui */}
          <h2 className="text-3xl font-bold text-gray-800">Bem-vindo ao Renova IA C&S</h2>
          <p className="text-gray-600 mt-2">Entre ou cadastre-se para começar a transformar seus espaços.</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={window.location.origin + '/app'}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu e-mail',
                password_label: 'Sua senha',
                email_input_placeholder: 'exemplo@email.com',
                password_input_placeholder: '••••••••',
                button_label: 'Entrar',
                social_provider_text: 'Ou entre com',
                link_text: 'Já tem uma conta? Entrar',
                no_account_text: 'Não tem uma conta?',
                forgotten_password_text: 'Esqueceu sua senha?',
                password_reset_link_text: 'Enviar instruções de redefinição de senha',
                confirmation_text: 'Verifique seu e-mail para o link de confirmação',
              },
              sign_up: {
                email_label: 'Seu e-mail',
                password_label: 'Crie uma senha',
                email_input_placeholder: 'exemplo@email.com',
                password_input_placeholder: '••••••••',
                button_label: 'Cadastre-se',
                social_provider_text: 'Ou cadastre-se com',
                link_text: 'Não tem uma conta? Cadastre-se',
                no_account_text: 'Já tem uma conta?',
                confirmation_text: 'Verifique seu e-mail para o link de confirmação',
              },
              forgotten_password: {
                email_label: 'Seu e-mail',
                password_label: 'Sua nova senha',
                email_input_placeholder: 'exemplo@email.com',
                button_label: 'Redefinir senha',
                link_text: 'Esqueceu sua senha?',
                confirmation_text: 'Verifique seu e-mail para o link de redefinição de senha',
              },
              update_password: {
                password_label: 'Sua nova senha',
                password_input_placeholder: '••••••••',
                button_label: 'Atualizar senha',
                confirmation_text: 'Sua senha foi atualizada',
              },
            },
          }}
          form_fields={{
            sign_up: {
              email: { // Definindo explicitamente o campo de e-mail
                label: 'Seu e-mail',
                placeholder: 'exemplo@email.com',
                type: 'email',
                required: true,
              },
              first_name: {
                label: 'Nome',
                placeholder: 'Seu primeiro nome',
                type: 'text',
                required: true,
              },
              last_name: {
                label: 'Sobrenome',
                placeholder: 'Seu sobrenome',
                type: 'text',
                required: false,
              },
              password: { // Definindo explicitamente o campo de senha
                label: 'Crie uma senha',
                placeholder: '••••••••',
                type: 'password',
                required: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;