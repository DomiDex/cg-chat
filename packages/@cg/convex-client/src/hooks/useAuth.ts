import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState, useCallback, useEffect } from 'react';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

interface AuthActions {
  login: (email: string) => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Convex queries and mutations
  const currentUser = useQuery(api.users.getCurrentUser);
  const loginMutation = useMutation(api.auth.sendVerificationCode);
  const verifyMutation = useMutation(api.auth.verifyCode);
  const logoutMutation = useMutation(api.auth.logout);

  // Update auth state when user changes
  useEffect(() => {
    setAuthState({
      user: currentUser || null,
      isLoading: currentUser === undefined,
      isAuthenticated: !!currentUser,
      error: null,
    });
  }, [currentUser]);

  const login = useCallback(async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await loginMutation({ email });
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
      throw error;
    }
  }, [loginMutation]);

  const verify = useCallback(async (email: string, code: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await verifyMutation({ email, code });
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
      throw error;
    }
  }, [verifyMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: error as Error 
      }));
      throw error;
    }
  }, [logoutMutation]);

  const refreshSession = useCallback(async () => {
    // Session refresh handled by Convex automatically
    // This is a placeholder for any custom logic
  }, []);

  return {
    ...authState,
    login,
    verify,
    logout,
    refreshSession,
  };
}