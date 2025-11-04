import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types.ts';

// Helper for API calls
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const response = await fetch(`/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API call to ${endpoint} failed with status ${response.status}`);
    }
    if (response.status === 204) {
        return {} as T;
    }
    return response.json();
}


type AuthStage = 'loading' | 'signup' | 'login' | 'loggedIn' | 'forgotPassword' | 'resetPassword';

interface AuthContextType {
  isLoggedIn: boolean;
  isDemoUser: boolean;
  authStage: AuthStage;
  userEmail: string | null;
  createAdmin: (user: Omit<User, 'id' | 'passwordHash'> & { password: string }) => Promise<boolean>;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: () => void;
  logout: () => void;
  updateCredentials: (currentPassword: string, newUsername: string, newPassword: string) => Promise<boolean>;
  goToForgotPassword: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  backToLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string; email: string; isDemo: boolean } | null>(null);
  const [authStage, setAuthStage] = useState<AuthStage>('loading');

  const checkAuthStatus = useCallback(async () => {
    try {
        const data = await apiCall<{ isLoggedIn: boolean; adminExists?: boolean; user?: any }>('/auth/status');
        if (data.isLoggedIn && data.user) {
            setUser(data.user);
            setAuthStage('loggedIn');
        } else if (data.adminExists) {
            setAuthStage('login');
        } else {
            setAuthStage('signup');
        }
    } catch (error) {
        console.error("Failed to check auth status:", error);
        setAuthStage('login'); // Fallback to login on error
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const createAdmin = async (userData: Omit<User, 'id' | 'passwordHash'> & { password: string }): Promise<boolean> => {
    try {
        await apiCall('/auth', 'POST', { action: 'signup', ...userData });
        setAuthStage('login');
        return true;
    } catch (error) {
        console.error("Failed to create admin:", error);
        return false;
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const { user: loggedInUser } = await apiCall<{ user: any }>('/auth', 'POST', { action: 'login', username, password });
        setUser(loggedInUser);
        setAuthStage('loggedIn');
        return { success: true };
    } catch (error: any) {
        console.error("Login failed:", error);
        return { success: false, message: error.message };
    }
  };

  const loginAsDemo = async () => {
    try {
        const { user: demoUser } = await apiCall<{ user: any }>('/auth', 'POST', { action: 'login', isDemo: true });
        setUser(demoUser);
        setAuthStage('loggedIn');
    } catch (error) {
        console.error("Demo login failed:", error);
    }
  };

  const logout = async () => {
    try {
        await apiCall('/auth', 'POST', { action: 'logout' });
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        setUser(null);
        setAuthStage('login');
        // Force reload to clear all state, including DataContext
        window.location.reload(); 
    }
  };
  
  const updateCredentials = async (currentPassword: string, newUsername: string, newPassword: string): Promise<boolean> => {
    try {
        const { user: updatedUser } = await apiCall<{ user: any }>('/auth', 'PUT', { action: 'update_credentials', currentPassword, newUsername, newPassword });
        setUser(updatedUser);
        return true;
    } catch (error) {
        console.error("Failed to update credentials:", error);
        return false;
    }
  };

  const goToForgotPassword = () => setAuthStage('forgotPassword');
  const backToLogin = () => setAuthStage('login');

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
        await apiCall('/auth', 'POST', { action: 'request_password_reset', email });
        setAuthStage('resetPassword');
        return true;
    } catch (error) {
        console.error("Password reset request failed:", error);
        return false;
    }
  };

  const resetPassword = async (newPassword: string): Promise<boolean> => {
     try {
        await apiCall('/auth', 'PUT', { action: 'reset_password', newPassword });
        setAuthStage('login'); // On success, go to login
        return true;
    } catch (error) {
        console.error("Password reset failed:", error);
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
        isLoggedIn: authStage === 'loggedIn', 
        isDemoUser: user?.isDemo ?? false,
        authStage,
        userEmail: user?.email || null,
        createAdmin,
        login, 
        loginAsDemo,
        logout, 
        updateCredentials,
        goToForgotPassword,
        requestPasswordReset,
        resetPassword,
        backToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};