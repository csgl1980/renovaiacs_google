import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useSession } from './SessionContextProvider';

const AuthRedirector: React.FC = () => {
  const navigate = useNavigate();
  const { session, isLoading: isSessionLoading } = useSession();

  useEffect(() => {
    if (!isSessionLoading) {
      if (session) {
        // User is authenticated, redirect to the main app route
        navigate('/app', { replace: true });
      } else {
        // User is not authenticated, redirect to login
        navigate('/login', { replace: true });
      }
    }
  }, [session, isSessionLoading, navigate]);

  // Render a hidden Auth component to process URL hash parameters (e.g., from email confirmation)
  // This component needs to be mounted on the target redirect URL (which is '/')
  // for the Supabase Auth UI to pick up the session from the URL hash.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {isSessionLoading ? (
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      ) : (
        // This Auth component is hidden but crucial for processing the URL hash
        // when the user is redirected back to the root after email confirmation.
        <div style={{ display: 'none' }}>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            redirectTo={window.location.origin + '/app'} // Redirect to /app after auth
          />
        </div>
      )}
    </div>
  );
};

export default AuthRedirector;