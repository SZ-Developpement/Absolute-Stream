"use client";

import { useCallback, useEffect, useState } from "react";
import { createAuthClient } from "better-auth/client";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
});

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await client.getSession();
        if (session.data?.user) {
          setUser(session.data.user as User);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        setError(null);
        const response = await client.signUp.email({
          email,
          password,
          name: name || "",
        });

        if (response.error) {
          throw new Error(response.error.message || "Sign up failed");
        }

        setUser(response.data?.user as User);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign up failed";
        setError(message);
        throw err;
      }
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const response = await client.signIn.email({
        email,
        password,
      });

      if (response.error) {
        throw new Error(response.error.message || "Sign in failed");
      }

      setUser(response.data?.user as User);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await client.signOut();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed";
      setError(message);
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
