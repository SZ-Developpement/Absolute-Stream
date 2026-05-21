"use client";

import { useState } from "react";
import { navItems } from "@/constants/nav-bar";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

import InputSearch from "./Search";
import NavItem from "./Navtem";
import ButtonConnected from "./ButtonConnected";
import ButtonUnConnected from "./ButtonUnConnected";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    // Conteneur principal de la barre de navigation avec styles pour le positionnement et l'apparence
    <header className="sticky top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-foreground/5">
      {/* Menu Desktop — visible uniquement au dessus de xl */}
      <div className="py-3 px-4 2xl:px-10 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          {/* Logo Lien Accueil */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold whitespace-nowrap text-transparent bg-clip-text bg-blue-500"
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
    </header>
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
