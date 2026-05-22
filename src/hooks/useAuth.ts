// ============================================================================
// useAuth — hook d'accès à l'utilisateur connecté
// ----------------------------------------------------------------------------
// Sucre syntaxique au-dessus de useContext(AuthContext) :
//   const { user, signIn, signOut } = useAuth();
//
// Avantage : on jette une erreur claire si le hook est appelé hors du
// AuthProvider (ex: oubli de l'envelopper dans layout.tsx).
// ============================================================================

"use client";

import { useContext } from "react";
import { AuthContext } from "@/providers/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  // Garde-fou : on force le wrapping par AuthProvider
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider",
    );
  }

  return context;
}
