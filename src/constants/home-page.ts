import { Users, Search, Star } from "lucide-react";

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
