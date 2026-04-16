"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { createAuthClient } from "better-auth/client";

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
});

// Extraction propre des types
type User = typeof client.$Infer.Session.user;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // On remplace "any" par "unknown" pour satisfaire ESLint
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string, name: string) => Promise<unknown>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await client.getSession();
        if (res?.data?.user) {
          setUser(res.data.user as User);
        }
      } catch (e) {
        console.error("Session init error", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const signIn = async (email: string, password: string): Promise<unknown> => {
    const res = await client.signIn.email({ email, password });
    if (res?.data?.user) {
      setUser(res.data.user as User);
    }
    return res;
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<unknown> => {
    const res = await client.signUp.email({ email, password, name });
    if (res?.data?.user) {
      setUser(res.data.user as User);
    }
    return res;
  };

  const signOut = async () => {
    try {
      await client.signOut();
      setUser(null);
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
