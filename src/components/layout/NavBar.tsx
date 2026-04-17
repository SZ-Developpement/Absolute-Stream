"use client";

import { useState } from "react";
import { navItems } from "@/data/navBar";
import { LucideIcon, Search, Menu, X } from "lucide-react";
import Link from "next/link";
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
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    // Conteneur principal de la barre de navigation avec styles pour le positionnement et l'apparence
    <div className="fixed top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-foreground/5">
      {/* Menu Desktop — visible uniquement au dessus de xl */}
      <div className="py-3 px-4 2xl:px-10 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          {/* Logo Lien Accueil */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold whitespace-nowrap"
          >
            Absolute Stream
          </Link>

          {/* Nav items — visibles uniquement en 2xl */}
          <nav className="hidden 2xl:flex flex-row items-center gap-1">
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

        {/* Boutons de recherche et d'authentification */}
        <div className="flex flex-row items-center gap-3">
          <InputSearch className="hidden 2xl:flex" />

          {user ? (
            <ButtonConnected
              id={user.id}
              name={user.name || "User"}
              image={user.image}
            />
          ) : loading ? (
            <div className="w-8 h-8 rounded-full bg-foreground/10 animate-pulse hidden 2xl:block" />
          ) : (
            <div className="hidden 2xl:flex flex-row items-center gap-1.5">
              <ButtonUnConnected />
            </div>
          )}

          <ToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>

      {/* Menu mobile — visible uniquement en dessous de xl */}
      {isOpen && (
        <div className="2xl:hidden flex flex-col gap-1 w-full px-4 pb-4 pt-2 border-t border-foreground/5">
          {/* Recherche mobile */}
          <InputSearch className="2xl:hidden py-2 px-3 gap-1 w-full" />

          {/* Nav items */}
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
    </div>
  );
}

function NavItem({
  icon: Icon,
  name,
  href,
}: {
  icon: LucideIcon;
  name: string;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    // Lien de navigation avec styles conditionnels pour l'état actif/inactif
    <Link
      href={href}
      className={`w-full 2xl:w-fit flex flex-row items-center gap-2 text-sm rounded-lg py-2 px-3 transition-all duration-200 ${
        isActive
          ? "text-foreground bg-foreground/10"
          : "text-foreground/50 hover:text-foreground hover:bg-foreground/8"
      }`}
    >
      <Icon size={14} />
      {name}
    </Link>
  );
}

function ButtonUnConnected() {
  return (
    <>
      {/* Lien vers la page de connexion */}
      <Link
        href="/login"
        className="flex-1 2xl:flex-none whitespace-nowrap text-center text-sm bg-foreground text-background hover:bg-foreground/80 py-1.5 px-4 rounded-lg transition-colors duration-200"
      >
        Se connecter
      </Link>
      {/* Lien vers la page d'inscription */}
      <Link
        href="/register"
        className="flex-1 2xl:flex-none whitespace-nowrap text-center text-sm bg-foreground/8 text-foreground hover:bg-foreground/15 py-1.5 px-4 rounded-lg border border-foreground/10 transition-colors duration-200"
      >
        S&apos;inscrire
      </Link>
    </>
  );
}

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
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    // Lien vers le profil utilisateur avec avatar
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-8 aspect-square relative rounded-full overflow-hidden cursor-pointer">
          {/* Fallback toujours présent en dessous */}
          <p className="text-sm font-bold text-foreground bg-pink-400 rounded-full w-full h-full flex items-center justify-center">
            {name[0].toUpperCase()}
          </p>
          {image && (
            <Image
              src={image}
              alt={`Profil ${name}`}
              fill
              className={`object-cover absolute rounded-full transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem>
          <Link className="w-full" href={`/profile/${id}`}>
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link className="w-full" href="/support">
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="bg-[#E50914]/10 text-[#E50914] focus:bg-[#E50914]/20 focus:text-[#E50914] transition-colors duration-200 ">
          <button onClick={() => signOut()}>Déconnexion</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InputSearch({ className }: { className?: string }) {
  return (
    // Champ de recherche avec icône et styles adaptés pour les différentes tailles d'écran
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

function ToggleButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    // Bouton de bascule pour le menu mobile avec icônes conditionnelles pour l'état ouvert/fermé
    <button
      className="2xl:hidden p-1.5 text-foreground/70 hover:text-foreground transition-colors"
      onClick={onClick}
    >
      {isOpen ? <X size={16} /> : <Menu size={16} />}
    </button>
  );
}

export { NavBar };
