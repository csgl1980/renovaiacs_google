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
        key="supabase-auth-form" 
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
        providers={[]}
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
        // A propriedade 'localization' foi removida temporariamente para depuração.
        // Se os campos aparecerem, ela poderá ser reintroduzida com cuidado.
      />
    </div>
  );
};

export default AuthForm;