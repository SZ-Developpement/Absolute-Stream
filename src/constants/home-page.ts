// ============================================================================
// Constantes affichées sur la page d'accueil (src/app/page.tsx)
// ----------------------------------------------------------------------------
// On externalise les données statiques pour garder la page focus sur la mise
// en page. Si demain on veut ajouter une étape au Match ou une ligne au
// tableau comparatif, c'est ici qu'on touche → aucune modif de JSX.
// ============================================================================

import { Users, Search, Star } from "lucide-react";

// Les 4 étapes expliquant le mode Match (cartes numérotées 01 → 04)
const stepsMatch = [
  {
    step: "01",
    title: "Lancez un duo",
    desc: "Créez une session en un clic et partagez le lien d'invitation unique.",
  },
  {
    step: "02",
    title: "Swipez à deux",
    desc: "À droite si ça vous tente, à gauche si vous passez votre tour.",
  },
  {
    step: "03",
    title: "Notification live",
    desc: "Notre système synchronise vos choix instantanément en arrière-plan.",
  },
  {
    step: "04",
    title: "C'est un Match !",
    desc: "Alerte immédiate dès qu'un coup de cœur commun est trouvé.",
  },
];

// Bento grid "Tout ce dont vous avez besoin" — 3 fonctionnalités phares
// Icon = composant Lucide, pas une string : on passe directement le composant
const features = [
  {
    Icon: Search,
    Title: "Explorez le catalogue",
    Description:
      "Recherche dynamique instantanée via TMDB. Accédez aux fiches complètes (casting, synopsis) et découvrez le Top Communauté.",
  },
  {
    Icon: Star,
    Title: "Votre bibliothèque perso",
    Description:
      "Pilotez vos visionnages selon vos statuts (Vu, À voir, En cours). Notez de 1 à 5 étoiles et rédigez vos propres critiques.",
  },
  {
    Icon: Users,
    Title: "Une expérience sociale",
    Description:
      "Abonnez-vous à vos amis, analysez leurs profils publics et profitez d'un moteur de recommandations basé sur votre réseau.",
  },
];

// Tableau comparatif Visiteur vs Membre.
// `highlight: true` → ligne mise en avant visuellement (cyan au lieu de bleu).
const featuresTable = [
  {
    name: "Recherche & Fiches TMDB",
    visitor: true,
    member: true,
  },
  {
    name: "Consulter le Top Communauté",
    visitor: true,
    member: true,
  },
  {
    name: "Bibliothèque (Vu, À voir, En cours)",
    visitor: false,
    member: true,
  },
  {
    name: "Laisser des notes & critiques",
    visitor: false,
    member: true,
  },
  {
    name: "Système de Followers / Following",
    visitor: false,
    member: true,
  },
  {
    name: "Système de Match en temps réel",
    visitor: false,
    member: true,
    highlight: true,
  },
  {
    name: "Tournoi de la communauté",
    visitor: false,
    member: true,
    highlight: true,
  },
];

export { stepsMatch, features, featuresTable };
