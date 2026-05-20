// ============================================================================
// /login — page de connexion
// ----------------------------------------------------------------------------
// Page client (formulaire contrôlé). Le vrai login est délégué au hook
// useAuth (qui appelle better-auth en interne). Ici on gère seulement :
//   - les champs email / password
//   - le submit + redirection vers "/" si succès
//   - l'affichage d'une erreur si la connexion échoue
//
// Note : si l'utilisateur est DÉJÀ connecté, on le pousse direct vers "/".
// ============================================================================

"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading, error } = useAuth();
  // États contrôlés du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      // Succès → on redirige vers la home
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Le contexte d'auth est encore en train de vérifier la session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  // Si déjà connecté → on ne montre pas le formulaire, on redirige
  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

        {/* Message d'erreur renvoyé par le contexte si signIn a échoué */}
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

        {/* Liens secondaires : inscription + retour home */}
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
