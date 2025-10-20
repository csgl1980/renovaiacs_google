import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../integrations/supabase/client';
import SparklesIcon from './icons/SparklesIcon';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';

// Esquemas de validação com Zod
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('E-mail inválido'),
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type LoginFormInputs = z.infer<typeof loginSchema>;
type SignupFormInputs = z.infer<typeof signupSchema>;

const AuthForm: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const handleLogin = async (data: LoginFormInputs) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Login realizado com sucesso! Redirecionando...');
      resetLoginForm();
    }
    setLoading(false);
  };

  const handleSignup = async (data: SignupFormInputs) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Verifique seu e-mail para confirmar sua conta!');
      resetSignupForm();
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  return (
    <div className="w-full max-w-md">
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => { setIsLoginView(true); resetSignupForm(); setMessage(null); }}
          className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${isLoginView ? 'bg-white text-cs-blue shadow' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          Entrar
        </button>
        <button
          onClick={() => { setIsLoginView(false); resetLoginForm(); setMessage(null); }}
          className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${!isLoginView ? 'bg-white text-cs-blue shadow' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          Cadastre-se
        </button>
      </div>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm ${message.includes('sucesso') || message.includes('Verifique') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {isLoginView ? (
        <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="login-email"
              type="email"
              {...registerLogin('email')}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue"
              placeholder="seu@email.com"
            />
            {loginErrors.email && <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative mt-1">
              <input
                id="login-password"
                type={isPasswordVisible ? 'text' : 'password'}
                {...registerLogin('password')}
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={isPasswordVisible ? 'Esconder senha' : 'Mostrar senha'}
              >
                {isPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {loginErrors.password && <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-cs-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-cs-blue/90 transition-colors duration-300 disabled:bg-cs-blue/50 disabled:cursor-not-allowed text-lg shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignupSubmit(handleSignup)} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="signup-email"
              type="email"
              {...registerSignup('email')}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue"
              placeholder="seu@email.com"
            />
            {signupErrors.email && <p className="mt-1 text-sm text-red-600">{signupErrors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="signup-firstName" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              id="signup-firstName"
              type="text"
              {...registerSignup('firstName')}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue"
              placeholder="Seu primeiro nome"
            />
            {signupErrors.firstName && <p className="mt-1 text-sm text-red-600">{signupErrors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="signup-lastName" className="block text-sm font-medium text-gray-700">Sobrenome (Opcional)</label>
            <input
              id="signup-lastName"
              type="text"
              {...registerSignup('lastName')}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue"
              placeholder="Seu sobrenome"
            />
            {signupErrors.lastName && <p className="mt-1 text-sm text-red-600">{signupErrors.lastName.message}</p>}
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative mt-1">
              <input
                id="signup-password"
                type={isPasswordVisible ? 'text' : 'password'}
                {...registerSignup('password')}
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={isPasswordVisible ? 'Esconder senha' : 'Mostrar senha'}
              >
                {isPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {signupErrors.password && <p className="mt-1 text-sm text-red-600">{signupErrors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="signup-confirmPassword" className="block text-sm font-medium text-gray-700">Confirme a Senha</label>
            <div className="relative mt-1">
              <input
                id="signup-confirmPassword"
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                {...registerSignup('confirmPassword')}
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-cs-blue focus:border-cs-blue pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                aria-label={isConfirmPasswordVisible ? 'Esconder senha' : 'Mostrar senha'}
              >
                {isConfirmPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {signupErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{signupErrors.confirmPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-cs-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-cs-blue/90 transition-colors duration-300 disabled:bg-cs-blue/50 disabled:cursor-not-allowed text-lg shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Cadastrando...
              </>
            ) : (
              'Cadastre-se'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthForm;