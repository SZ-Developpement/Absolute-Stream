// ============================================================================
// Footer — pied de page commun à toutes les pages
// ----------------------------------------------------------------------------
// Composant client (besoin de "use client" car on instancie new Date()).
//
// Architecture : 4 colonnes en grid responsive :
//   - Colonne 1+2 (col-span-2) : marque + baseline
//   - Colonne 3 : Catalogue (5 liens)
//   - Colonne 4 : Communauté + Compte (5 liens)
// Puis une barre du bas avec copyright + mentions légales.
//
// Astuce DRY : plutôt que retaper la liste des routes, on FILTRE `navItems`
// (la source unique de vérité) pour en extraire des sous-ensembles. Si on
// ajoute une route dans nav-bar.ts, elle apparaîtra automatiquement ici si
// elle matche le filtre.
// ============================================================================

"use client";

import Link from "next/link";
import { navItems } from "@/constants/nav-bar";

// .filter() = méthode standard de Array. Renvoie un nouveau tableau ne
// contenant que les éléments pour lesquels la callback renvoie true.
//
// `.includes(item.href)` = vérifie si item.href est dans le tableau dur.
// On garde donc UNIQUEMENT les routes qui appartiennent au "Catalogue".
const catalogueLinks = navItems.filter((item) =>
  ["/movies", "/series", "/animes", "/collections", "/top10"].includes(
    item.href,
  ),
);

// Même technique pour les liens "Communauté"
const communityLinks = navItems.filter((item) =>
  ["/match", "/tournoi"].includes(item.href),
);

// Liens "Compte" → pas dans navItems (la NavBar ne les montre pas), donc on
// les déclare ici en dur. Type implicite : { name: string; href: string }[]
const accountLinks = [
  { name: "Se connecter", href: "/login" },
  { name: "S'inscrire", href: "/register" },
  { name: "Support", href: "/support" },
];

function Footer() {
  return (
    // `mt-auto` = pousse le footer en bas grâce au flex flex-col du body.
    // Si le contenu est court, le footer reste collé en bas (sticky footer).
    <footer className="w-full mt-auto border-t border-foreground/5 bg-background/70 backdrop-blur-xl">
      <div className="max-w-360 mx-auto px-4 2xl:px-10 py-12 flex flex-col gap-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Bloc marque + pitch : occupe 2 colonnes via col-span-2 */}
          <div className="col-span-2 flex flex-col gap-3">
            <Link
              href="/"
              className="text-lg font-bold whitespace-nowrap text-transparent bg-clip-text bg-blue-500 w-fit"
            >
              Absolute Stream
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-sm">
              La plateforme communautaire des passionnés de films, séries et
              animes. Centralisez vos visionnages, partagez vos avis et trouvez
              votre prochain coup de cœur.
            </p>
          </div>

          {/* Colonne Catalogue.
              On compose deux sous-composants pour DRY le markup (FooterColumn
              + FooterLink définis en bas du fichier). */}
          <FooterColumn title="Catalogue">
            {catalogueLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.name}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Colonne Communauté + Compte (deux .map enchaînés dans la même col) */}
          <FooterColumn title="Communauté">
            {communityLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.name}
              </FooterLink>
            ))}
            {accountLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.name}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        {/* Barre du bas : copyright à gauche, liens légaux à droite */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-foreground/5">
          <p className="text-sm text-foreground/60">
            {/* `new Date().getFullYear()` = année courante (2026 actuellement).
                Dynamique → on n'aura pas à mettre à jour ce footer manuellement
                au passage à la nouvelle année. */}
            &copy; {new Date().getFullYear()} Absolute Stream. Tous droits
            réservés.
          </p>
          <div className="flex flex-row items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
            >
              Conditions d&apos;utilisation
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ----------------------------------------------------------------------------
// Sous-composant interne : une colonne du footer (titre + enfants en column).
// Pas exporté → utilisé uniquement dans ce fichier.
//
// `children: React.ReactNode` = type pour "tout ce qui peut être rendu dans
// du JSX" (string, élément, tableau d'éléments, null, undefined, ...).
// ----------------------------------------------------------------------------
function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <nav className="flex flex-col gap-2">{children}</nav>
    </div>
  );
}

// Sous-composant interne : un lien stylé (couleur grise → blanc au hover).
// Factorise la classe `text-sm text-foreground/60 hover:text-foreground...`
// → si demain on veut changer le style des liens, on touche ICI uniquement.
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200 w-fit"
    >
      {children}
    </Link>
  );
}

// Export nommé en bas du fichier (= convention du projet : on regroupe les
// déclarations en haut et on exporte explicitement en bas).
export { Footer };
