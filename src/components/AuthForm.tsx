import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { showSuccess, showError } from '../utils/toast';

const AuthForm: React.FC = () => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthForm: Auth state change event:', event, 'session:', session);
      if (event === 'SIGNED_IN') {
        showSuccess('Login realizado com sucesso!');
      } else if (event === 'SIGNED_OUT') {
        showSuccess('Você foi desconectado.');
      } else if (event === 'PASSWORD_RECOVERY') {
        showSuccess('Verifique seu e-mail para o link de recuperação de senha.');
      } else if (event === 'USER_UPDATED') {
        showSuccess('Sua senha foi atualizada com sucesso!');
      } else if (event === 'MFA_CHALLENGE') {
        showError('Autenticação de múltiplos fatores necessária.');
      } else if (event === 'USER_DELETED') {
        showSuccess('Sua conta foi excluída com sucesso.');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const redirectToUrl = window.location.origin + '/login'; 

  return (
    <div className="w-full max-w-md">
      <Auth
        key="supabase-auth-form" // Mantido para forçar a re-renderização
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#1A4370', // Azul Veleiro Oceânico
                brandAccent: '#1A4370', // Cor de destaque para hover, etc.
              },
            },
          },
        }}
        theme="light"
        providers={[]} // Desabilitar provedores sociais
        magic_link={false} // Desabilitar magic link
        redirectTo={redirectToUrl}
        show_confirm_password={true} // Garante que o campo de confirmação de senha apareça
        extraFields={[ // Garante que os campos adicionais apareçam no formulário de cadastro
          {
            name: 'first_name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Seu primeiro nome',
          },
          {
            name: 'last_name',
            label: 'Sobrenome',
            type: 'text',
            required: true,
            placeholder: 'Seu sobrenome',
          },
        ]}
        defaultView="sign_up" // Força o componente a iniciar na tela de cadastro
        localization={{
          variables: {
            sign_in: {
              email_label: 'E-mail',
              password_label: 'Senha',
              email_input_placeholder: 'seu@email.com',
              password_input_placeholder: '••••••••',
              button_label: 'Entrar',
              social_provider_text: 'Entrar com {{provider}}',
              link_text: 'Já tem uma conta? Entrar',
              forgot_password_link_text: 'Esqueceu sua senha?',
            },
            sign_up: {
              email_label: 'E-mail',
              password_label: 'Criar Senha',
              email_input_placeholder: 'seu@email.com',
              password_input_placeholder: 'Sua senha',
              button_label: 'Cadastre-se',
              social_provider_text: 'Cadastre-se com {{provider}}',
              link_text: 'Já tem uma conta? Entrar', // Corrigido para "Já tem uma conta? Entrar"
              confirm_password_label: 'Confirme a Senha',
              confirm_password_input_placeholder: 'Confirme sua senha',
            },
            forgot_password: {
              email_label: 'E-mail',
              email_input_placeholder: 'seu@email.com',
              button_label: 'Enviar instruções de recuperação',
              link_text: 'Esqueceu sua senha?',
              confirmation_text: 'Verifique seu e-mail para o link de recuperação de senha.',
            },
            update_password: {
              password_label: 'Nova Senha',
              password_input_placeholder: 'Sua nova senha',
              button_label: 'Atualizar Senha',
              link_text: 'Atualizar senha',
              confirmation_text: 'Sua senha foi atualizada com sucesso!',
            },
            magic_link: {
              email_input_placeholder: 'seu@email.com',
              button_label: 'Enviar link mágico',
              link_text: 'Enviar um link mágico',
              confirmation_text: 'Verifique seu e-mail para o link mágico.',
            },
          },
        }}
      />
    </div>
  );
};

export default AuthForm;