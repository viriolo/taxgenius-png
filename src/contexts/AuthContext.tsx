
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/AuthService';
import { UserProfile, LoginPayload, RegisterUserPayload, UserRole } from '../models/User';
import { useToast } from '@/hooks/use-toast';
import { EventBus } from '../services/EventBus';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterUserPayload) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authService = AuthService.getInstance();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize auth state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
    
    // Set up event listeners
    const authEvents = [
      { event: 'user.loggedin', handler: handleUserChange },
      { event: 'user.loggedout', handler: handleUserChange },
      { event: 'user.registered', handler: handleUserChange },
      { event: 'user.profile.updated', handler: handleUserChange },
      { event: 'auth.token.refreshed', handler: handleUserChange },
    ];
    
    const unsubscribes = authEvents.map(({ event, handler }) => 
      EventBus.getInstance().on(event, handler)
    );
    
    // Clean up listeners on unmount
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, []);
  
  const handleUserChange = () => {
    setUser(authService.getCurrentUser());
  };
  
  const login = async (payload: LoginPayload): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.login(payload);
      setUser(authService.getCurrentUser());
      toast({
        title: "Login successful",
        description: "Welcome back to Wantok.ai!"
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: (error as Error).message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (payload: RegisterUserPayload): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.register(payload);
      setUser(authService.getCurrentUser());
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please check your email for verification."
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: (error as Error).message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = (): void => {
    authService.logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };
  
  const hasRole = (role: UserRole): boolean => {
    return authService.hasRole(role);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: authService.isAuthenticated(),
        login,
        register,
        logout,
        hasRole
      }}
    >
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
