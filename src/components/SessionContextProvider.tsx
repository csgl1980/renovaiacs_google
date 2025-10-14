import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User } from '../types';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Helper function to parse URL hash parameters
const parseHashParams = (hash: string) => {
  const params: { [key: string]: string } = {};
  hash.substring(1).split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });
  return params;
};

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (currentSession: Session) => {
    console.log('SessionContext: [fetchUserProfile] Tentando buscar perfil para user ID:', currentSession.user.id);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, credits, is_admin')
      .eq('id', currentSession.user.id)
      .single();

    if (profileData) {
      console.log('SessionContext: [fetchUserProfile] Perfil do usuário encontrado:', profileData);
      setUser(profileData as User);
    } else {
      // Se nenhum perfil for encontrado (PGRST116) ou qualquer outro erro,
      // crie um objeto de usuário básico. Isso garante que 'user' nunca seja null
      // se uma sessão válida existir, prevenindo problemas de redirecionamento.
      console.warn('SessionContext: [fetchUserProfile] Nenhum perfil encontrado ou erro ao buscar perfil. Criando objeto de usuário básico. Erro:', profileError);
      setUser({
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || '',
        last_name: currentSession.user.user_metadata?.last_name || '',
        email: currentSession.user.email || '',
        credits: 20, // Créditos padrão para novos usuários
        is_admin: false, // Padrão para novos usuários sem perfil ainda
      });
    }
    console.log('SessionContext: [fetchUserProfile] Finalizado. User state after fetch/create:', user);
  }, []);

  const handleAuthChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log('SessionContext: [handleAuthChange] Evento:', event, 'Sessão:', currentSession);
    setIsLoading(true); // Sempre defina loading como true no início de uma mudança de autenticação

    if (currentSession) {
      setSession(currentSession);
      await fetchUserProfile(currentSession);
    } else {
      setSession(null);
      setUser(null);
    }
    setIsLoading(false); // Sempre defina loading como false no final
    console.log('SessionContext: [handleAuthChange] Finalizado. isLoading:', false, 'Current user state:', user);
  }, [fetchUserProfile]);

  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações de estado em componente desmontado

    const setupAuth = async () => {
      console.log('SessionContext: [setupAuth] Iniciando...');
      setIsLoading(true); // Iniciar carregamento imediatamente

      // 1. Lidar com parâmetros de hash primeiro
      const hash = window.location.hash;
      if (hash) {
        console.log('SessionContext: [setupAuth] Hash encontrado na URL:', hash);
        const hashParams = parseHashParams(hash);
        if (hashParams.access_token && hashParams.refresh_token) {
          console.log('SessionContext: [setupAuth] Encontrado access_token e refresh_token no hash. Tentando definir a sessão.');
          const { error } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token,
          });
          if (error) {
            console.error('SessionContext: [setupAuth] Erro ao definir a sessão a partir do hash:', error);
          } else {
            console.log('SessionContext: [setupAuth] Sessão definida com sucesso a partir do hash.');
            // Limpar hash da URL para evitar reprocessamento no refresh
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            // Atualizar explicitamente a sessão para garantir que o estado interno esteja totalmente sincronizado
            await supabase.auth.refreshSession();
            console.log('SessionContext: [setupAuth] Sessão atualizada após definir do hash.');
          }
        }
      }

      // 2. Obter a sessão atual (isso também refletirá qualquer sessão definida por hash)
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (isMounted) { // Apenas atualize o estado se o componente ainda estiver montado
        if (sessionError) {
          console.error('SessionContext: [setupAuth] Erro ao obter sessão inicial:', sessionError);
          setSession(null);
          setUser(null);
        } else if (initialSession) {
          console.log('SessionContext: [setupAuth] Sessão inicial encontrada:', initialSession);
          setSession(initialSession);
          await fetchUserProfile(initialSession);
        } else {
          console.log('SessionContext: [setupAuth] Nenhuma sessão inicial encontrada.');
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
        console.log('SessionContext: [setupAuth] Finalizado. isLoading:', false);
      }
    };

    setupAuth();

    // 3. Configurar o listener de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isMounted) {
        handleAuthChange(event, currentSession);
      }
    });

    return () => {
      isMounted = false; // Flag de limpeza
      authListener.subscription.unsubscribe();
    };
  }, [handleAuthChange, fetchUserProfile]); // Dependências para useEffect

  const refreshUser = useCallback(async () => {
    console.log('SessionContext: [refreshUser] chamado.');
    setIsLoading(true);
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('SessionContext: [refreshUser] Erro ao obter sessão para refresh:', sessionError);
      setSession(null);
      setUser(null);
    } else if (currentSession) {
      setSession(currentSession);
      await fetchUserProfile(currentSession);
    } else {
      setSession(null);
      setUser(null);
    }
    setIsLoading(false);
    console.log('SessionContext: [refreshUser] Finalizado. isLoading:', false, 'Current user state:', user);
  }, [fetchUserProfile]);

  return (
    <SessionContext.Provider value={{ session, user, isLoading, refreshUser }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};