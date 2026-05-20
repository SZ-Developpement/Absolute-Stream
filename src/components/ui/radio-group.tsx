// ============================================================================
// Composant UI : RadioCards (basé sur Radix UI)
// ----------------------------------------------------------------------------
// Variante "cartes" du Radio classique : au lieu d'avoir des petits points
// ronds, chaque option est une carte cliquable plus visible. Construit
// au-dessus de @radix-ui/react-radio-group → on récupère la gestion des
// flèches clavier, le state contrôlé et l'accessibilité ARIA gratuitement.
//
// Utilisé pour : choisir un mode (Match en duo / Tournoi etc).
// ============================================================================

"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

function RadioCards({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-cards"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

function RadioCardsItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-cards-item"
      className={cn(
        // Base : une carte avec bordure
        "relative flex flex-col items-center justify-between rounded-md bg-primary/5 px-6 py-2 text-sm shadow-sm transition-all outline-none cursor-pointer font-medium",
        // États Hover & Focus
        "hover:bg-primary/10",
        // État sélectionné (Checked) : On change la bordure et on peut ajouter un fond
        "data-[state=checked]:bg-primary/10",
        // État désactivé
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}

export { RadioCards, RadioCardsItem };
