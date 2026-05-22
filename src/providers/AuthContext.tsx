// ============================================================================
// AuthProvider — gestion globale de la session utilisateur côté client
// ----------------------------------------------------------------------------
// Stratégie :
//  1. Au montage, on lit l'utilisateur depuis localStorage → affichage
//     INSTANTANÉ (évite le "flash" non connecté → connecté au chargement).
//  2. En parallèle, on demande au serveur via better-auth si la session est
//     toujours valide. Si oui → on rafraîchit le cache. Si non → on déconnecte.
//
// On expose 4 actions via le Context : signIn / signUp / signOut + l'état user.
// N'importe quel composant client peut y accéder avec useAuth() (cf. hooks/).
// ============================================================================

"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { createAuthClient } from "better-auth/client";

// Client better-auth : pointe vers nos routes API d'auth.
// Le cookieCache de 5min évite de re-fetcher la session à chaque navigation.
const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 }, // seul vrai changement
  },
});

// On dérive le type User directement depuis better-auth (source de vérité)
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
    // 1) On lit le cache local pour afficher l'UI connectée tout de suite
    const cached = localStorage.getItem("auth_user");
    if (cached) {
      setUser(JSON.parse(cached));
      setLoading(false); // ← plus de flash car on a déjà l'user
    }

    // 2) Validation côté serveur en arrière-plan
    async function init() {
      try {
        const res = await client.getSession();
        if (res?.data?.user) {
          // Session valide → on rafraîchit le cache local
          const u = res.data.user as User;
          setUser(u);
          localStorage.setItem("auth_user", JSON.stringify(u));
        } else {
          // Plus de session → on nettoie pour éviter d'afficher un faux user
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

  // Déconnexion : on demande à better-auth + on vide le cache local
  const signOut = async () => {
    try {
      await client.signOut();
      setUser(null);
      localStorage.removeItem("auth_user"); // nettoyage
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  // Connexion par email/password — utilisée par la page /login
  const signIn = async (email: string, password: string): Promise<unknown> => {
    const res = await client.signIn.email({ email, password });
    if (res?.data?.user) {
      const u = res.data.user as User;
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
    } else {
      // On stocke le message d'erreur pour affichage dans le formulaire
      // et on throw pour que l'appelant (page /login) puisse réagir
      const message = res?.error?.message ?? "Erreur de connexion";
      setError(message);
      throw new Error(message);
    }
    return res;
  };

  // Inscription — utilisée par /register, connecte automatiquement après
  const signUp = async (
    email: string,
    password: string,
    name: string,
  ): Promise<unknown> => {
    const res = await client.signUp.email({ email, password, name });
    if (res?.data?.user) {
      const u = res.data.user as User;
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
    } else {
      const message = res?.error?.message ?? "Erreur d'inscription";
      setError(message);
      throw new Error(message);
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
