import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/lib/authService";

interface AuthCtx {
  user: any;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGithub: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sess = await authService.getSession();
        setSession(sess);
        setUser(sess?.user ?? null);
      } finally {
        setLoading(false);
      }
    })();
    const { data: { subscription } } = authService.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const value: AuthCtx = {
    user,
    session,
    loading,
    signUp: async (email, password, userData) => authService.signUp(email, password, userData),
    signIn: async (email, password) => authService.signIn(email, password),
    signOut: async () => authService.signOut(),
    signInWithGithub: async () => authService.signInWithGithub(),
    resetPassword: async (email) => authService.resetPassword(email),
    updatePassword: async (pwd) => authService.updatePassword(pwd),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
