"use client";

import Link from "next/link";
import { navItems } from "@/data/navBar";

// Filtrage des liens pour les différentes sections du footer
const catalogueLinks = navItems.filter((item) =>
  ["/movies", "/series", "/animes", "/collections", "/top10"].includes(
    item.href,
  ),
);

// Les liens communautaires sont ceux qui ne font pas partie du catalogue
const communityLinks = navItems.filter((item) =>
  ["/match", "/tournoi"].includes(item.href),
);

// Liens de compte statiques
const accountLinks = [
  { name: "Se connecter", href: "/login" },
  { name: "S'inscrire", href: "/register" },
  { name: "Support", href: "/support" },
];

function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-foreground/5 bg-background/70 backdrop-blur-xl">
      <div className="max-w-360 mx-auto px-4 2xl:px-10 py-12 flex flex-col gap-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Marque + description */}
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

          {/* Catalogue */}
          <FooterColumn title="Catalogue">
            {catalogueLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.name}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Communauté + Compte */}
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

        {/* Barre inférieure */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-foreground/5">
          <p className="text-sm text-foreground/60">
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

export { Footer };
