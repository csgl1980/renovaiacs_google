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

  // Novos estados para o fluxo de recuperação de senha
  const [isPasswordRecoveryFlow, setIsPasswordRecoveryFlow] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

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
        // Após a atualização da senha, sair do fluxo de recuperação
        setIsPasswordRecoveryFlow(false);
        setNewPassword('');
        setConfirmNewPassword('');
      } else if (event === 'MFA_CHALLENGE') {
        showError('Autenticação de múltiplos fatores necessária.');
      } else if (event === 'USER_DELETED') {
        showSuccess('Sua conta foi excluída com sucesso.');
      }
    });

    // Detectar o fluxo de recuperação de senha a partir do hash da URL
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsPasswordRecoveryFlow(true);
      setIsSignUp(false); // Garante que não estamos na tela de cadastro
      console.log('AuthForm: Detected password recovery flow.');
    } else {
      setIsPasswordRecoveryFlow(false);
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
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setIsSignUp(false); // Mudar para login após o início do cadastro
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
      // Sucesso tratado por onAuthStateChange
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login', // Redireciona de volta para a página de login após o envio do e-mail
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Verifique seu e-mail para o link de recuperação de senha.');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmNewPassword) {
      showError('As novas senhas não coincidem.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Sua senha foi atualizada com sucesso!');
      // Limpar o hash da URL para sair do modo de recuperação
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      // Redirecionar para a página principal ou login
      // O useEffect já deve lidar com o USER_UPDATED e limpar os estados
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      {isPasswordRecoveryFlow ? (
        // Formulário de atualização de senha
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Definir Nova Senha</h2>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <div className="relative mt-1">
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cs-blue focus:border-cs-blue sm:text-sm"
                placeholder="Sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
              >
                {showNewPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700">Confirme a Nova Senha</label>
            <div className="relative mt-1">
              <input
                id="confirm-new-password"
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cs-blue focus:border-cs-blue sm:text-sm"
                placeholder="Confirme sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={showConfirmNewPassword ? 'Ocultar confirmação de nova senha' : 'Mostrar confirmação de nova senha'}
              >
                {showConfirmNewPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cs-blue hover:bg-cs-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cs-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Atualizar Senha'
            )}
          </button>
        </form>
      ) : (
        // Formulário de login/cadastro
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
      )}

      {!isPasswordRecoveryFlow && (
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
      )}
    </div>
  );
};

export default AuthForm;