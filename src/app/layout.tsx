// ============================================================================
// Root layout — fichier le plus important du projet Next App Router
// ----------------------------------------------------------------------------
// app/layout.tsx s'applique automatiquement à TOUTES les pages. C'est notre
// "template HTML maître". Tout ce qui doit être présent partout va ici :
//   - <html> et <body> (Next NE les génère PAS automatiquement, c'est à nous)
//   - Les balises <head> via l'export `metadata` (SEO)
//   - Les composants présents sur toutes les pages (NavBar, Footer, fond)
//   - Les Providers React qui doivent englober toute l'app (AuthProvider...)
//
// Comportement de Next : il prend le layout, remplace `{children}` par le
// contenu de la page demandée, et sert le tout au navigateur.
// ============================================================================

// `import type` = on importe SEULEMENT le type, pas la valeur. Optimisation
// au build : TypeScript supprime l'import du JS final.
import type { Metadata } from "next";
// next/font/google/geist télécharge la police au build et la sert en local
// → aucun appel à Google Fonts à l'exécution + zéro CLS (Cumulative Layout Shift)
import { GeistSans } from "geist/font/sans";
// Import des styles globaux (Tailwind + nos custom CSS). Pas de syntaxe React,
// juste un effet de bord à l'import → Next inclut le CSS dans le bundle.
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageBackground } from "@/components/layout/PageBackground";
import { AuthProvider } from "@/providers/AuthContext";

// Metadata globales lues par Next pour générer <title> et <meta> dans <head>.
// On peut surcharger ces valeurs dans n'importe quelle page (ex: une page de
// film exporterait sa propre metadata avec le titre du film).
export const metadata: Metadata = {
  title: "Absolute Stream",
  description:
    "Plateforme communautaire de gestion et découverte de films et séries",
};

// `Readonly<>` = on rend les props immuables. Bonne pratique pour le typage
// des composants : on n'a pas le droit de modifier `children` à l'intérieur.
// `React.ReactNode` = type fourre-tout pour TOUT ce qui peut être rendu en
// JSX (string, number, élément, tableau, null, undefined...).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `<html lang="fr">` important pour l'accessibilité + le SEO.
    // `GeistSans.variable` = nom de la CSS variable créée par next/font.
    // On l'expose sur <html> pour que toute la page utilise la police.
    <html lang="fr" className={`${GeistSans.variable} h-full antialiased`}>
      {/* min-h-screen + flex flex-col = le body fait AU MOINS la hauteur
          de la fenêtre, en colonne flex. Ça permet au footer de coller en
          bas même quand le contenu est court (sticky footer pattern). */}
      <body className="min-h-screen flex flex-col relative">
        {/* AuthProvider DOIT envelopper TOUT ce qui pourrait avoir besoin
            de useAuth() — c'est-à-dire NavBar, pages, etc. */}
        <AuthProvider>
          <NavBar />
          {/* Fond d'écran dynamique selon la route (cf. usePageBackground) */}
          <PageBackground />
          {/* `{children}` = remplacé par le contenu de la page courante */}
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
