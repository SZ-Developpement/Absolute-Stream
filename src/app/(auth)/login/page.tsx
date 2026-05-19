"use client";

import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  InputGroup,
  InputGroupInput,
  InputGroupLabel,
} from "@/components/ui/MyInput";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/"); // s'exécute seulement si signIn n'a pas throw
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex flex-col gap-12 items-center justify-center min-h-screen bg-black">
      {/* titre */}
      <div className="flex flex-col items-center justify-center gap-1">
        <h2 className="text-2xl font-bold">Bienvenue sur Absolute Stream</h2>
        <p className="text-sm text-[#A1A1A1]">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="underline underline-offset-2 hover:text-[#A1A1A1]/60 transition-all duration-300"
          >
            Inscrivez-vous
          </Link>
        </p>
      </div>

      <div className="max-w-lg flex flex-col gap-8 items-center justify-center w-full">
        <form
          id="login-form"
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6"
        >
          <InputGroup>
            <InputGroupLabel htmlFor="email">
              Email <span className="text-red-500">*</span>
            </InputGroupLabel>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="nom.prénom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputGroupLabel htmlFor="password">
              Mot de passe <span className="text-red-500">*</span>
            </InputGroupLabel>
            <InputGroupInput
              id="password"
              type="password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </InputGroup>
        </form>

        <div className="flex flex-col w-full gap-2">
          <button
            type="submit"
            form="login-form"
            disabled={isLoading}
            className="w-full bg-blue-500 text-sm text-white py-1.5 rounded-lg hover:bg-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>

          {(localError || error) && (
            <p className="text-red-500 text-sm mt-1">
              {localError || String(error)}
            </p>
          )}
        </div>

        <p className="text-center text-sm text-[#A1A1A1]">
          En cliquant sur Continuer, vous acceptez nos{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-[#A1A1A1]/60 transition-all duration-300"
          >
            Conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-[#A1A1A1]/60 transition-all duration-300"
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
