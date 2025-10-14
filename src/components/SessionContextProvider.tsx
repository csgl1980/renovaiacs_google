import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User } from '../types'; // Importe a interface User

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

  const fetchUserAndSession = async () => {
    console.log('SessionContext: Iniciando fetchUserAndSession...');
    setIsLoading(true);

    // --- Step 1: Check and handle URL hash for auth tokens ---
    if (window.location.hash) {
      console.log('SessionContext: Hash encontrado na URL:', window.location.hash);
      const hashParams = parseHashParams(window.location.hash);

      if (hashParams.access_token && hashParams.refresh_token) {
        console.log('SessionContext: Encontrado access_token e refresh_token no hash. Tentando definir a sessão.');
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token,
          });

          if (error) {
            console.error('SessionContext: Erro ao definir a sessão a partir do hash:', error);
          } else {
            console.log('SessionContext: Sessão definida com sucesso a partir do hash:', data.session);
            // Clear the hash from the URL to prevent it from being displayed
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
        } catch (e) {
          console.error('SessionContext: Exceção ao definir a sessão a partir do hash:', e);
        }
      }
    }
    // --- End Step 1 ---

    // --- Step 2: Get the current session and user profile ---
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('SessionContext: Erro ao obter sessão:', sessionError);
      setSession(null);
      setUser(null);
    } else {
      console.log('SessionContext: Sessão obtida:', currentSession);
      setSession(currentSession);
      if (currentSession) {
        console.log('SessionContext: Tentando buscar perfil para user ID:', currentSession.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, credits, is_admin') // Adicionado 'is_admin'
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
      } else {
        console.log('SessionContext: Nenhuma sessão ativa.');
        setUser(null);
      }
    }
    console.log('SessionContext: fetchUserAndSession concluído. isLoading = false');
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserAndSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('SessionContext: onAuthStateChange event:', _event, 'Session:', session);
      // When auth state changes, re-fetch everything to ensure consistency
      fetchUserAndSession(); 
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    console.log('SessionContext: refreshUser chamado.');
    await fetchUserAndSession();
  };

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