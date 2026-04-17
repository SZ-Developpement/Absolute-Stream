"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { createAuthClient } from "better-auth/client";

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 }, // seul vrai changement
  },
});

type User = typeof client.$Infer.Session.user;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string, name: string) => Promise<unknown>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialise depuis localStorage directement — pas de flash
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Charge depuis localStorage en premier, instantané
    const cached = localStorage.getItem("auth_user");
    if (cached) {
      setUser(JSON.parse(cached));
      setLoading(false); // ← plus de flash car on a déjà l'user
    }

    // Puis valide avec le serveur en arrière-plan
    async function init() {
      try {
        const res = await client.getSession();
        if (res?.data?.user) {
          const u = res.data.user as User;
          setUser(u);
          localStorage.setItem("auth_user", JSON.stringify(u));
        } else {
          setUser(null);
          localStorage.removeItem("auth_user");
        }
      } catch (e) {
        console.error("Session init error", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const signOut = async () => {
    try {
      await client.signOut();
      setUser(null);
      localStorage.removeItem("auth_user"); // nettoyage
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  const signIn = async (email: string, password: string): Promise<unknown> => {
    const res = await client.signIn.email({ email, password });
    if (res?.data?.user) {
      const u = res.data.user as User;
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
    } else {
      setError(res?.error?.message ?? "Erreur de connexion");
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
      const u = res.data.user as User;
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u)); // sauvegarde
    } else {
      setError(res?.error?.message ?? "Erreur d'inscription");
    }

    return res;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
