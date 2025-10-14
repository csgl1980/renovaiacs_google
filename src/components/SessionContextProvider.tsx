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

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserAndSession = async () => {
    console.log('SessionContext: Iniciando fetchUserAndSession...');
    setIsLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('SessionContext: Erro ao obter sessão:', sessionError);
      setSession(null);
      setUser(null);
    } else {
      console.log('SessionContext: Sessão obtida:', session);
      setSession(session);
      if (session) {
        console.log('SessionContext: Tentando buscar perfil para user ID:', session.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, credits, is_admin') // Adicionado 'is_admin'
          .eq('id', session.user.id)
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
            id: session.user.id,
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            email: session.user.email || '',
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
      setSession(session);
      if (session) {
        fetchUserAndSession(); // Re-fetch user profile on auth state change
      } else {
        setUser(null);
      }
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