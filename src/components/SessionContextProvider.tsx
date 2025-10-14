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

  // Function to fetch user profile based on a given session
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
      // If no profile found, create a basic user object from auth.user
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

  // Centralized handler for auth state changes
  const handleAuthChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log('SessionContext: handleAuthChange - event:', event, 'Session:', currentSession);
    setIsLoading(true); // Start loading for any auth state change

    if (currentSession) {
      setSession(currentSession);
      await fetchUserProfile(currentSession);
    } else {
      setSession(null);
      setUser(null);
    }
    setIsLoading(false);
  }, [fetchUserProfile]);

  useEffect(() => {
    // 1. Check for hash parameters on initial load (e.g., from email confirmation redirect)
    const hash = window.location.hash;
    if (hash) {
      console.log('SessionContext: Hash encontrado na URL:', hash);
      const hashParams = parseHashParams(hash);
      if (hashParams.access_token && hashParams.refresh_token) {
        console.log('SessionContext: Encontrado access_token e refresh_token no hash. Tentando definir a sessão.');
        supabase.auth.setSession({
          access_token: hashParams.access_token,
          refresh_token: hashParams.refresh_token,
        }).then(({ error }) => {
          if (error) {
            console.error('SessionContext: Erro ao definir a sessão a partir do hash:', error);
          } else {
            console.log('SessionContext: Sessão definida com sucesso a partir do hash.');
            // Clear the hash from the URL to prevent it from being displayed
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
        }).catch(e => {
          console.error('SessionContext: Exceção ao definir a sessão a partir do hash:', e);
        });
        // The setSession call above should trigger onAuthStateChange, which will then update state.
        // We don't set isLoading to false here to avoid race conditions.
      }
    }

    // 2. Set up the auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    // 3. Also fetch initial session if no hash was present or setSession didn't immediately trigger a change.
    // This covers cases where the user is already logged in on page load without a hash.
    // We use a timeout to ensure the onAuthStateChange listener has a chance to process first,
    // especially if setSession from hash was called.
    const initialSessionCheckTimeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session: initialSession }, error: sessionError }) => {
        if (sessionError) {
          console.error('SessionContext: Erro ao obter sessão inicial:', sessionError);
          handleAuthChange('INITIAL_SESSION_ERROR', null);
        } else {
          // Only process if handleAuthChange hasn't already been triggered by a hash-based setSession
          if (!session && !user) { // Check current state to avoid overwriting a valid session from hash
            handleAuthChange('INITIAL_SESSION', initialSession);
          } else if (initialSession && session?.user.id !== initialSession.user.id) {
            // If a session was set by hash, but it's different, update
            handleAuthChange('INITIAL_SESSION_MISMATCH', initialSession);
          } else if (!initialSession && session) {
            // If we have a session but initial getSession says no, something is wrong, clear it
            handleAuthChange('INITIAL_SESSION_CLEANUP', null);
          }
        }
      });
    }, 100); // Small delay to let onAuthStateChange potentially fire first

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(initialSessionCheckTimeout);
    };
  }, [handleAuthChange, session, user]); // Added session and user to dependencies to react to internal state changes for initial check

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