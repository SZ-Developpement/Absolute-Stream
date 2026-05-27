// ============================================================================
// GET /api/movies/popularMovies
// ----------------------------------------------------------------------------
// Cette route fait office de proxy entre notre front et l'API TMDB.
// Pourquoi un proxy plutôt que d'appeler TMDB directement depuis le navigateur ?
//   1. On garde la clé API côté serveur (TMDB_API_KEY n'est JAMAIS envoyée
//      au client → impossible à voler dans le DevTools).
//   2. On peut typer, filtrer ou transformer la réponse avant de l'envoyer.
//   3. Next gère un cache HTTP automatique → on évite de spammer TMDB.
//
// Convention App Router : ce fichier s'appelle "route.ts" et exporte un GET
// (ou POST, PUT, ...). Next mappe automatiquement le chemin du dossier sur l'URL.
// ============================================================================

// NextResponse est la version "améliorée" de Response (web standard).
// Elle ajoute notamment .json() qui sérialise + met le bon header Content-Type.
import { NextResponse } from "next/server";

// Type importé depuis nos définitions maison. Sert juste à TypeScript pour
// vérifier qu'on lit bien les bons champs sur l'objet renvoyé.
import { PopularMediaResponse } from "@/types/tmdb";

// `export async function GET()` = handler de la méthode HTTP GET.
// Async parce qu'on va faire un await fetch() à l'intérieur.
export async function GET() {
  // process.env = variables d'environnement (fichier .env). Côté serveur
  // uniquement → impossible d'y accéder depuis un composant client.
  const apiKey = process.env.TMDB_API_KEY;

  // Garde-fou : sans clé d'API on ne peut rien faire → 500 explicite.
  // Mieux qu'un crash silencieux : le front saura que c'est un problème serveur.
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY manquante" },
      { status: 500 }, // 2e argument de NextResponse.json = options (status, headers...)
    );
  }

  // Concaténation classique en template string. La clé est en query param car
  // c'est ce qu'attend TMDB (et c'est plus pratique que les headers).
  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${apiKey}`;

  // Options du fetch : on précise GET (par défaut mais explicite = mieux)
  // et un header Accept pour dire "renvoyez-moi du JSON SVP".
  const options = { method: "GET", headers: { accept: "application/json" } };

  // try/catch : indispensable car fetch() peut throw si le réseau plante,
  // si TMDB met du temps à répondre, ou si le JSON est mal formé.
  try {
    const res = await fetch(url, options);

    // res.ok = true si status HTTP entre 200 et 299. Un 401 (clé invalide)
    // ou 429 (rate limit) tomberont ici.
    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur TMDB" },
        { status: res.status }, // on propage le code HTTP de TMDB
      );
    }

    // Annotation de type : on dit à TS "fais-moi confiance, c'est cette forme".
    // C'est une assertion : TS ne valide PAS au runtime, donc si TMDB change
    // sa réponse, on aura un bug silencieux. Pour aller plus loin → Zod.
    const data: PopularMediaResponse = await res.json();

    // On renvoie l'objet TMDB tel quel au client (le composant DiscoverMedia
    // ne lira que data.results de toute façon).
    return NextResponse.json(data);
  } catch {
    // catch sans paramètre = on ignore l'erreur (lint ESLint propre).
    // Pour debug on pourrait écrire `catch (e) { console.error(e); }`.
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
