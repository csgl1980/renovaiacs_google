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
    const { data: profileDataArray, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, credits, is_admin')
      .eq('id', currentSession.user.id)
      .limit(1);

    if (profileError) {
      console.error('SessionContext: [fetchUserProfile] Erro ao buscar perfil:', profileError);
      // Em caso de erro na busca, retorna um objeto de usuário básico com is_admin: false
      return {
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || '',
        last_name: currentSession.user.user_metadata?.last_name || '',
        email: currentSession.user.email || '',
        credits: 10,
        is_admin: false,
      };
    }

    if (profileDataArray && profileDataArray.length > 0) {
      const profileData = profileDataArray[0];
      console.log('SessionContext: [fetchUserProfile] Perfil do usuário encontrado:', profileData);
      return profileData as User;
    } else {
      console.warn('SessionContext: [fetchUserProfile] Nenhum perfil encontrado para user ID:', currentSession.user.id, '. Criando objeto de usuário básico.');
      return {
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || '',
        last_name: currentSession.user.user_metadata?.last_name || '',
        email: currentSession.user.email || '',
        credits: 10,
        is_admin: false,
      };
    }
  }, []);

  const handleAuthChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log('SessionContext: [handleAuthChange] Evento:', event, 'Sessão:', currentSession);
    setIsLoading(true);

    if (currentSession) {
      setSession(currentSession);
      const fetchedUser = await fetchUserProfile(currentSession);
      setUser(fetchedUser);
      console.log('SessionContext: [handleAuthChange] Usuário definido no estado:', fetchedUser); // Log adicional
    } else {
      setSession(null);
      setUser(null);
      console.log('SessionContext: [handleAuthChange] Usuário definido como null.'); // Log adicional
    }
    setIsLoading(false);
    console.log('SessionContext: [handleAuthChange] Finalizado. isLoading:', false, 'Current user state:', user);
  }, [fetchUserProfile]); // Removido 'user'

  useEffect(() => {
    let isMounted = true;

    const setupAuth = async () => {
      console.log('SessionContext: [setupAuth] Iniciando...');
      setIsLoading(true);

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
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
        }
      }

      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (isMounted) {
        if (sessionError) {
          console.error('SessionContext: [setupAuth] Erro ao obter sessão inicial:', sessionError);
          setSession(null);
          setUser(null);
        } else if (initialSession) {
          console.log('SessionContext: [setupAuth] Sessão inicial encontrada:', initialSession);
          setSession(initialSession);
          const fetchedUser = await fetchUserProfile(initialSession);
          setUser(fetchedUser);
          console.log('SessionContext: [setupAuth] Usuário inicial definido no estado:', fetchedUser); // Log adicional
        } else {
          console.log('SessionContext: [setupAuth] Nenhuma sessão inicial encontrada.');
          setSession(null);
          setUser(null);
          console.log('SessionContext: [setupAuth] Usuário inicial definido como null.'); // Log adicional
        }
        setIsLoading(false);
        console.log('SessionContext: [setupAuth] Finalizado. isLoading:', false, 'Current user state:', user);
      }
    };

    setupAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isMounted) {
        handleAuthChange(event, currentSession);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [handleAuthChange, fetchUserProfile]); // Removido 'user'

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
      const fetchedUser = await fetchUserProfile(currentSession);
      setUser(fetchedUser);
      console.log('SessionContext: [refreshUser] Usuário atualizado no estado:', fetchedUser); // Log adicional
    } else {
      setSession(null);
      setUser(null);
      console.log('SessionContext: [refreshUser] Usuário definido como null após refresh.'); // Log adicional
    }
    setIsLoading(false);
    console.log('SessionContext: [refreshUser] Finalizado. isLoading:', false, 'Current user state:', user);
  }, [fetchUserProfile]); // Removido 'user'

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