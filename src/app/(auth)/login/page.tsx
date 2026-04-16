"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      // Rediriger vers l'accueil après connexion réussie
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  if (user) {
    // Si déjà connecté, rediriger vers l'accueil
    router.push("/");
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {String(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border text-black border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border text-black border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center mt-4">
          Pas de compte?
          <Link href="/register" className="ml-2 text-blue-500 hover:underline">
            S&apos;inscrire
          </Link>
        </p>

        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
