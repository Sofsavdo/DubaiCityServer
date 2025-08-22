import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '@/lib/api';

export type User = {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: 'admin' | 'partner';
};

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch current user session
  const { data: user, isLoading } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        console.log('🔍 Checking user session...');
        const userData = await getCurrentUser();
        console.log('✅ Current user:', userData);
        return userData;
      } catch (error) {
        console.error('Session fetch error:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🚀 Starting login for:', username);
      
      const { response, data } = await apiLogin(username, password);

      if (response.ok && data.success && data.user) {
        console.log('✅ Login successful, updating cache...');
        
        // Wait for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Update cache with new user data
        queryClient.setQueryData(['/api/auth/user'], data.user);
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "Muvaffaqiyat",
          description: `Xush kelibsiz, ${data.user.firstName || data.user.username}!`,
        });
        
        return { success: true };
      } else {
        const errorMessage = data.message || 'Login yoki parol noto\'g\'ri';
        console.log('❌ Login failed:', errorMessage);
        
        toast({
          title: "Kirish xatosi",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = 'Serverga ulanish xatosi';
      
      toast({
        title: "Tarmoq xatosi", 
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      await apiLogout();
      
      // Clear cache
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "Chiqish",
        description: "Muvaffaqiyatli chiqildi",
      });
      
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}