// ============================================================================
// NavBar — barre de navigation principale (sticky en haut de toutes les pages)
// ----------------------------------------------------------------------------
// Composant client : on a besoin de useState (menu burger ouvert/fermé),
// usePathname (highlight de la route active) et useAuth (état de connexion).
//
// Structure visuelle adaptative :
//   - Desktop (≥ 2xl = 1536px) : tout en ligne (logo + liens + search + auth)
//   - Mobile / tablette         : menu burger qui déplie un panneau vertical
//
// Découpage interne en 4 sous-composants pour ne pas avoir un gros JSX :
//   - NavItem            : un lien de la nav avec son icône
//   - ButtonUnConnected  : les boutons "Se connecter / S'inscrire"
//   - ButtonConnected    : l'avatar + le menu déroulant utilisateur
//   - InputSearch        : le champ de recherche
//   - ToggleButton       : bouton burger qui ouvre/ferme le menu mobile
// ============================================================================

"use client";

import { useState } from "react";
import { navItems } from "@/constants/nav-bar";
// LucideIcon = type d'un composant icône Lucide. Permet de passer un Icon en prop.
import { LucideIcon, Search, Menu, X } from "lucide-react";
import Link from "next/link";
// usePathname = hook Next pour récupérer l'URL courante (ex: "/movies").
// Sert à savoir quelle route est active pour styliser le lien correspondant.
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function NavBar() {
  // État du menu mobile : false = fermé, true = ouvert.
  // useState() renvoie [valeur, setter] → on les nomme via destructuration.
  const [isOpen, setIsOpen] = useState(false);

  // Récupération de l'état d'auth depuis le Context global.
  //   - user    : l'utilisateur connecté (objet) ou null
  //   - loading : true tant qu'on n'a pas vérifié la session côté serveur
  const { user, loading } = useAuth();

  return (
    // sticky + top-0 = la barre reste collée en haut au scroll.
    // z-50 = couche élevée pour passer au-dessus du contenu.
    // backdrop-blur-xl = floute ce qu'il y a derrière (effet "verre dépoli").
    <header className="sticky top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-foreground/5">
      {/* === BARRE DESKTOP === toujours visible, layout horizontal */}
      <div className="py-3 px-4 2xl:px-10 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          {/* Logo cliquable qui ramène à la home */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold whitespace-nowrap text-transparent bg-clip-text bg-blue-500"
          >
            Absolute Stream
          </Link>

          {/* Liens horizontaux : `hidden 2xl:flex` = invisible jusqu'à 2xl,
              puis affichés en flex. Sur mobile/tablette, ils apparaîtront
              dans le menu burger en dessous. */}
          <nav className="hidden 2xl:flex flex-row items-center gap-1">
            {/* .map() pour générer un NavItem par item.
                key={item.name} doit être UNIQUE. On utilise le nom (unique
                dans nav-bar.ts), à défaut on aurait pris item.href. */}
            {navItems.map((item) => (
              <NavItem
                key={item.name}
                icon={item.icon}
                name={item.name}
                href={item.href}
              />
            ))}
          </nav>
        </div>

        {/* Bloc droite : champ de recherche + boutons d'auth + burger */}
        <div className="flex flex-row items-center gap-3">
          <InputSearch className="hidden 2xl:flex" />

          {/* Rendu conditionnel à 3 branches via une cascade de ternaires.
              `user ? ... : loading ? ... : ...`
              C'est l'équivalent d'un switch sur l'état d'auth :
                - user défini      → avatar + dropdown
                - en chargement    → placeholder pulse
                - sinon (déconnecté) → boutons Login/Register */}
          {user ? (
            <ButtonConnected
              id={user.id}
              name={user.name || "User"}
              image={user.image}
            />
          ) : loading ? (
            // Skeleton : un rond gris pulsant qui sert de placeholder.
            // Évite que la barre "saute" quand l'état d'auth est résolu.
            <div className="w-8 h-8 rounded-full bg-foreground/10 animate-pulse hidden 2xl:block" />
          ) : (
            <div className="hidden 2xl:flex flex-row items-center gap-1.5">
              <ButtonUnConnected />
            </div>
          )}

          {/* Bouton burger — visible UNIQUEMENT en dessous de 2xl */}
          <ToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>

      {/* === MENU MOBILE === affiché si isOpen est true.
          Rendu conditionnel via `&&` : si isOpen=true, on rend le JSX. Sinon
          l'expression évalue à false et React ne rend rien. */}
      {isOpen && (
        <div className="2xl:hidden flex flex-col gap-1 w-full px-4 pb-4 pt-2 border-t border-foreground/5">
          {/* Search bar pleine largeur en mobile */}
          <InputSearch className="2xl:hidden py-2 px-3 gap-1 w-full" />

          {/* Liens du menu en column (un par ligne) */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavItem
                key={item.name}
                icon={item.icon}
                name={item.name}
                href={item.href}
              />
            ))}
          </nav>

          {/* Fragment <></> = utile quand on veut grouper du JSX sans wrapper div.
              Affiché uniquement si pas connecté. */}
          {!user && (
            <>
              <div className="h-px bg-foreground/5 my-2" />
              <div className="flex flex-row gap-2 w-full">
                <ButtonUnConnected />
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}

// ----------------------------------------------------------------------------
// NavItem : un lien de la nav avec un highlight si on est sur la page active.
//
// Astuce destructuration : `icon: Icon` renomme la prop `icon` en `Icon` à
// l'intérieur de la fonction. Indispensable car JSX a besoin d'une majuscule
// pour reconnaître un composant : <icon /> serait considéré comme une balise
// HTML inconnue, <Icon /> comme un composant React.
// ----------------------------------------------------------------------------
function NavItem({
  icon: Icon,
  name,
  href,
}: {
  icon: LucideIcon;
  name: string;
  href: string;
}) {
  // usePathname renvoie l'URL courante en string (ex: "/movies")
  const pathname = usePathname();
  // Comparaison stricte : true si on est exactement sur cette route
  const isActive = pathname === href;

  return (
    // Template string + ternaire pour appliquer des classes différentes
    // selon que la route est active ou non.
    <Link
      href={href}
      className={`w-full 2xl:w-fit flex flex-row items-center gap-2 text-sm rounded-lg py-2 px-3 transition-all duration-200 ${
        isActive
          ? "text-foreground bg-foreground/10" // actif : surligné
          : "text-foreground/50 hover:text-foreground hover:bg-foreground/8" // inactif : grisé
      }`}
    >
      <Icon size={14} />
      {name}
    </Link>
  );
}

// ----------------------------------------------------------------------------
// Boutons "Se connecter" + "S'inscrire" — affichés quand pas connecté.
// Fragment <> en racine pour renvoyer 2 éléments sœurs sans wrapper.
// ----------------------------------------------------------------------------
function ButtonUnConnected() {
  return (
    <>
      <Link
        href="/login"
        className="flex-1 2xl:flex-none whitespace-nowrap text-center text-sm bg-foreground text-background hover:bg-foreground/80 py-1.5 px-4 rounded-lg transition-colors duration-200"
      >
        Se connecter
      </Link>
      <Link
        href="/register"
        className="flex-1 2xl:flex-none whitespace-nowrap text-center text-sm bg-foreground/8 text-foreground hover:bg-foreground/15 py-1.5 px-4 rounded-lg border border-foreground/10 transition-colors duration-200"
      >
        S&apos;inscrire
      </Link>
    </>
  );
}

// ----------------------------------------------------------------------------
// ButtonConnected : avatar + menu déroulant (Profil / Support / Déconnexion).
//
// Astuce UX importante : on AFFICHE TOUJOURS la lettre initiale en background
// (rond rose) puis on superpose l'image quand elle est chargée. Comme ça :
//   - Avant chargement de l'image : on voit l'initiale (pas de zone vide)
//   - Pendant chargement : transition d'opacité douce
//   - Image cassée : on garde la lettre comme fallback
// ----------------------------------------------------------------------------
function ButtonConnected({
  id,
  name,
  image,
}: {
  id: string;
  name: string;
  image: string | null | undefined;
}) {
  const { signOut } = useAuth();
  // imageLoaded passe à true quand le navigateur a fini de DL l'image.
  // Sert à déclencher la transition d'opacité.
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <DropdownMenu>
      {/* `asChild` = au lieu de wrapper le bouton dans un <button> Radix,
          Radix applique ses props (event handlers, ARIA) sur l'enfant direct. */}
      <DropdownMenuTrigger asChild>
        <div className="w-8 aspect-square relative rounded-full overflow-hidden cursor-pointer">
          {/* Fallback : initiale dans un rond rose, toujours rendue en-dessous.
              name[0] = première lettre du pseudo. .toUpperCase() pour la mise en forme. */}
          <p className="text-sm font-bold text-foreground bg-pink-400 rounded-full w-full h-full flex items-center justify-center">
            {name[0].toUpperCase()}
          </p>
          {/* L'image n'est rendue que si elle existe (image && ...) */}
          {image && (
            <Image
              src={image}
              alt={`Profil ${name}`}
              fill
              // Classes conditionnelles : opacity-100 quand chargée, opacity-0 sinon
              className={`object-cover absolute rounded-full transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              // Callback déclenchée quand l'image finit son DL
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>
      </DropdownMenuTrigger>
      {/* align="end" = aligne le menu sur le bord droit du trigger */}
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem>
          {/* Template string `/profile/${id}` pour construire l'URL dynamique */}
          <Link className="w-full" href={`/profile/${id}`}>
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link className="w-full" href="/support">
            Support
          </Link>
        </DropdownMenuItem>
        {/* Item "Déconnexion" en rouge — convention UX pour les actions destructives.
            #E50914 = le rouge Netflix (référence intentionnelle au domaine d'app). */}
        <DropdownMenuItem className="bg-[#E50914]/10 text-[#E50914] focus:bg-[#E50914]/20 focus:text-[#E50914] transition-colors duration-200 ">
          <button onClick={() => signOut()}>Déconnexion</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ----------------------------------------------------------------------------
// InputSearch : champ de recherche purement UI pour l'instant (pas branché).
// Le `?` sur className le rend optionnel — utile car ce composant est utilisé
// à deux endroits avec des classes additionnelles différentes (desktop vs mobile).
// ----------------------------------------------------------------------------
function InputSearch({ className }: { className?: string }) {
  return (
    // focus-within: appliqué quand un descendant a le focus (= input cliqué)
    <div
      className={`flex flex-row items-center bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-3 w-70 focus-within:border-foreground/30 transition-colors duration-300 ${className}`}
    >
      <Search size={14} className="text-foreground/50" />
      <input
        type="text"
        placeholder="Rechercher un film, une série..."
        className="ml-2 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground/50 w-full"
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// ToggleButton : bouton burger / croix qui ouvre-ferme le menu mobile.
// Reçoit `isOpen` et `onClick` du parent → composant 100% contrôlé (pas de
// state interne, le state est dans NavBar).
// ----------------------------------------------------------------------------
function ToggleButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="2xl:hidden p-1.5 text-foreground/70 hover:text-foreground transition-colors"
      onClick={onClick}
    >
      {/* Ternaire pour switcher entre l'icône X (ouvert) et Menu (fermé) */}
      {isOpen ? <X size={16} /> : <Menu size={16} />}
    </button>
  );
}

export { NavBar };
