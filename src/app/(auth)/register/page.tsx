"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signUp(email, password, name);
      // Rediriger vers login après inscription réussie
      router.push("/login");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {String(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border text-black border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />

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
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        <p className="text-center mt-4">
          Vous avez déjà un compte?
          <Link href="/login" className="ml-2 text-blue-500 hover:underline">
            Se connecter
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
