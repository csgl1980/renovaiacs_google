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
    console.log('SessionContext: Tentando buscar perfil para user ID:', currentSession.user.id);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, credits, is_admin')
      .eq('id', currentSession.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found (new user)
      console.error('SessionContext: Erro ao obter perfil do usuário:', profileError);
      setUser(null);
    } else if (profileData) {
      console.log('SessionContext: Perfil do usuário encontrado:', profileData);
      setUser(profileData as User);
    } else {
      console.log('SessionContext: Nenhum perfil encontrado, criando objeto de usuário básico.');
      setUser({
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || '',
        last_name: currentSession.user.user_metadata?.last_name || '',
        email: currentSession.user.email || '',
        credits: 20, // Default credits for new users
        is_admin: false, // Default for new users without a profile yet
      });
    }
  }, []);

  const handleAuthChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log('SessionContext: handleAuthChange - event:', event, 'Session:', currentSession);
    setIsLoading(true); // Always set loading true at the start of an auth change

    if (currentSession) {
      setSession(currentSession);
      await fetchUserProfile(currentSession);
    } else {
      setSession(null);
      setUser(null);
    }
    setIsLoading(false); // Always set loading false at the end
  }, [fetchUserProfile]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const setupAuth = async () => {
      setIsLoading(true); // Start loading immediately

      // 1. Handle hash parameters first
      const hash = window.location.hash;
      if (hash) {
        console.log('SessionContext: Hash encontrado na URL:', hash);
        const hashParams = parseHashParams(hash);
        if (hashParams.access_token && hashParams.refresh_token) {
          console.log('SessionContext: Encontrado access_token e refresh_token no hash. Tentando definir a sessão.');
          const { error } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token,
          });
          if (error) {
            console.error('SessionContext: Erro ao definir a sessão a partir do hash:', error);
          } else {
            console.log('SessionContext: Sessão definida com sucesso a partir do hash.');
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
        }
      }

      // 2. Get the current session (this will also reflect any session set by hash)
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (isMounted) { // Only update state if component is still mounted
        if (sessionError) {
          console.error('SessionContext: Erro ao obter sessão inicial:', sessionError);
          setSession(null);
          setUser(null);
        } else if (initialSession) {
          setSession(initialSession);
          await fetchUserProfile(initialSession);
        } else {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    setupAuth();

    // 3. Set up the auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isMounted) {
        handleAuthChange(event, currentSession);
      }
    });

    return () => {
      isMounted = false; // Cleanup flag
      authListener.subscription.unsubscribe();
    };
  }, [handleAuthChange, fetchUserProfile]); // Dependencies for useEffect

  const refreshUser = useCallback(async () => {
    console.log('SessionContext: refreshUser chamado.');
    setIsLoading(true);
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('SessionContext: Erro ao obter sessão para refresh:', sessionError);
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