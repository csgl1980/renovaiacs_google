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
    console.log('SessionContext: [fetchUserProfile] Attempting to fetch profile for user ID:', currentSession.user.id);
    const { data: profileDataArray, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, credits, is_admin')
      .eq('id', currentSession.user.id)
      .limit(1);

    if (profileError) {
      console.error('SessionContext: [fetchUserProfile] Error fetching profile:', profileError);
      // Fallback to a basic user object in case of error
      return {
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || '',
        last_name: currentSession.user.user_metadata?.last_name || '',
        email: currentSession.user.email || '',
        credits: 10, // Default credits
        is_admin: false,
      };
    }

    if (profileDataArray && profileDataArray.length > 0) {
      const profileData = profileDataArray[0];
      console.log('SessionContext: [fetchUserProfile] User profile found:', profileData);
      return profileData as User;
    } else {
      console.warn('SessionContext: [fetchUserProfile] No profile found for user ID:', currentSession.user.id, '. Creating basic user object.');
      // Fallback if no profile exists (e.g., new user before trigger runs or trigger failed)
      return {
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || '',
        last_name: currentSession.user.user_metadata?.last_name || '',
        email: currentSession.user.email || '',
        credits: 10, // Default credits
        is_admin: false,
      };
    }
  }, []);

  const handleAuthChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log('SessionContext: [handleAuthChange] Event:', event, 'Current Session:', currentSession ? 'present' : 'null');
    setIsLoading(true);

    if (currentSession) {
      setSession(currentSession);
      const fetchedUser = await fetchUserProfile(currentSession);
      setUser(fetchedUser);
      console.log('SessionContext: [handleAuthChange] User state set:', fetchedUser);
    } else {
      setSession(null);
      setUser(null);
      console.log('SessionContext: [handleAuthChange] Session and User set to null.');
    }
    setIsLoading(false);
    console.log('SessionContext: [handleAuthChange] Finished. isLoading:', false, 'Current user state:', user ? 'present' : 'null');
  }, [fetchUserProfile]);

  useEffect(() => {
    let isMounted = true;

    const setupAuth = async () => {
      console.log('SessionContext: [setupAuth] Initializing auth setup...');
      setIsLoading(true);

      const hash = window.location.hash;
      if (hash) {
        console.log('SessionContext: [setupAuth] Hash found in URL:', hash);
        const hashParams = parseHashParams(hash);
        if (hashParams.access_token && hashParams.refresh_token) {
          console.log('SessionContext: [setupAuth] Found access_token and refresh_token in hash. Attempting to set session.');
          const { error } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token,
          });
          if (error) {
            console.error('SessionContext: [setupAuth] Error setting session from hash:', error);
          } else {
            console.log('SessionContext: [setupAuth] Session successfully set from hash. Clearing URL hash.');
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          }
        }
      }

      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (isMounted) {
        if (sessionError) {
          console.error('SessionContext: [setupAuth] Error getting initial session:', sessionError);
          setSession(null);
          setUser(null);
        } else if (initialSession) {
          console.log('SessionContext: [setupAuth] Initial session found:', initialSession);
          setSession(initialSession);
          const fetchedUser = await fetchUserProfile(initialSession);
          setUser(fetchedUser);
          console.log('SessionContext: [setupAuth] Initial user state set:', fetchedUser);
        } else {
          console.log('SessionContext: [setupAuth] No initial session found.');
          setSession(null);
          setUser(null);
          console.log('SessionContext: [setupAuth] Initial user state set to null.');
        }
        setIsLoading(false);
        console.log('SessionContext: [setupAuth] Initial setup finished. isLoading:', false, 'Current user state:', user ? 'present' : 'null');
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
  }, [handleAuthChange, fetchUserProfile]);

  const refreshUser = useCallback(async () => {
    console.log('SessionContext: [refreshUser] called.');
    setIsLoading(true);
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('SessionContext: [refreshUser] Error getting session for refresh:', sessionError);
      setSession(null);
      setUser(null);
    } else if (currentSession) {
      setSession(currentSession);
      const fetchedUser = await fetchUserProfile(currentSession);
      setUser(fetchedUser);
      console.log('SessionContext: [refreshUser] User state updated:', fetchedUser);
    } else {
      setSession(null);
      setUser(null);
      console.log('SessionContext: [refreshUser] User state set to null after refresh.');
    }
    setIsLoading(false);
    console.log('SessionContext: [refreshUser] Finished. isLoading:', false, 'Current user state:', user ? 'present' : 'null');
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