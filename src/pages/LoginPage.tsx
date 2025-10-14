import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import SparklesIcon from '../components/icons/SparklesIcon';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <SparklesIcon className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-gray-800">Bem-vindo ao Renova IA C&S</h2>
          <p className="text-gray-600 mt-2">Entre ou cadastre-se para começar a transformar seus espaços.</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]} // Removendo provedores de terceiros para simplificar
          redirectTo={window.location.origin} // Redireciona para a raiz após login/cadastro
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
        />
      </div>
    </div>
  );
};

export default LoginPage;