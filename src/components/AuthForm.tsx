import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { showSuccess, showError } from '../utils/toast';
import { EyeIcon, EyeOffIcon } from 'lucide-react'; // Importar ícones do lucide-react

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Handle password recovery from URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsSignUp(false); // Switch to sign-in view, where forgot password link is
      // The Auth component from Supabase UI would handle the update_password view
      // For a custom form, we'd need a dedicated UpdatePasswordForm component
      // For now, we'll rely on the user clicking 'Forgot Password' to trigger the email flow
      // and then manually navigating to the update password page if we had one.
      // Since we are replacing the Auth component, the update_password view needs to be handled separately.
      // For simplicity, we'll just show the sign-in form and expect the user to use the email link.
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      showError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Verifique seu e-mail para confirmar sua conta!');
      // Optionally clear form or redirect
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setIsSignUp(false); // Switch to login after successful sign-up initiation
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showError(error.message);
    } else {
      // Success handled by onAuthStateChange
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login', // Redirect back to login page after reset email sent
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Verifique seu e-mail para o link de recuperação de senha.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cs-blue focus:border-cs-blue sm:text-sm"
                placeholder="Seu primeiro nome"
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Sobrenome</label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cs-blue focus:border-cs-blue sm:text-sm"
                placeholder="Seu sobrenome"
              />
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cs-blue focus:border-cs-blue sm:text-sm"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cs-blue focus:border-cs-blue sm:text-sm"
              placeholder="Sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {isSignUp && (
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirme a Senha</label>
            <div className="relative mt-1">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cs-blue focus:border-cs-blue sm:text-sm"
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cs-blue hover:bg-cs-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cs-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            isSignUp ? 'Cadastre-se' : 'Entrar'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="font-medium text-cs-blue hover:text-cs-blue/90"
        >
          {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Cadastre-se'}
        </button>
        {!isSignUp && (
          <button
            onClick={handleForgotPassword}
            className="block mt-2 font-medium text-gray-600 hover:text-gray-800 text-sm"
          >
            Esqueceu sua senha?
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthForm;