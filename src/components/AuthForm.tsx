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
        // Este evento é disparado após login bem-sucedido, cadastro (se auto-confirmado) ou confirmação de e-mail
        showSuccess('Login realizado com sucesso!');
        // O redirecionamento para /app será tratado por LoginPage/RootRedirector
      } else if (event === 'SIGNED_OUT') {
        showSuccess('Você foi desconectado.');
      } else if (event === 'PASSWORD_RECOVERY') {
        showSuccess('Verifique seu e-mail para o link de recuperação de senha.');
        // O componente Auth irá automaticamente para a visualização 'update_password' se o usuário clicar no link
      } else if (event === 'USER_UPDATED') {
        // Este evento é disparado após a redefinição de senha
        showSuccess('Sua senha foi atualizada com sucesso!');
        // O componente Auth irá automaticamente voltar para a visualização 'sign_in'
      } else if (event === 'MFA_CHALLENGE') {
        // Handle MFA challenge if implemented
        showError('Autenticação de múltiplos fatores necessária.');
      } else if (event === 'USER_DELETED') {
        showSuccess('Sua conta foi excluída com sucesso.');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const redirectToUrl = "https://renovaiacs-google.vercel.app/app"; // URL pública do seu aplicativo

  return (
    <div className="w-full max-w-md">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="light"
        providers={[]} // Sem provedores de terceiros solicitados
        redirectTo={redirectToUrl}
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
              link_text: 'Não tem uma conta? Cadastre-se',
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