import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AuthContextType {
  user: any; // Replace 'any' with your user type from NextAuth/MongoDB
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';

  const value = {
    user: session?.user || null,
    status,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 