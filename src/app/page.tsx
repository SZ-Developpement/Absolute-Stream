// ============================================================================
// app/page.tsx — landing page (route "/")
// ----------------------------------------------------------------------------
// Page d'accueil publique. Server Component statique (pas de hook, pas de
// fetch) → Next la PRÉ-RENDRE au build : HTML servi en quelques millisecondes.
//
// Architecture en 5 sections empilées verticalement :
//   1. Hero plein écran (h-screen)        → titre + 2 CTA
//   2. À propos en 2 colonnes              → texte + visuel
//   3. Feature Match (4 étapes)            → grid 1/2/4 cols selon écran
//   4. Bento Grid des autres features      → 3 cartes
//   5. Tableau comparatif Visiteur/Membre  → <table> classique
//   6. CTA final                           → rappel d'inscription
//
// Les données viennent de constants/home-page.ts → si on veut ajouter une
// étape ou une feature, on modifie le tableau, pas le JSX.
// ============================================================================

// Destructuration d'import : on extrait 3 named exports d'un même fichier
import { features, featuresTable, stepsMatch } from "@/constants/home-page";
// LucideIcon = TYPE TS générique pour un composant icône de la lib lucide.
// On l'utilise pour typer une prop `Icon` qu'on passera ensuite à <Icon />.
import { Check, X, LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background/30 text-zinc-50">
      {/* === SECTION 1 : HERO === plein écran, centré, contient titre + CTA */}
      <section className="relative h-screen flex flex-col gap-6 items-center justify-center text-center px-4">
        <div className="flex flex-col mb-6 gap-4">
          {/* Astuce CSS dégradé sur texte :
                text-transparent      → cache le noir d'origine
                bg-clip-text          → utilise le texte comme masque pour le bg
                bg-blue-500           → la couleur appliquée derrière le texte
              Résultat : le texte est colorisé par le bg. Ici un aplat,
              mais on pourrait mettre un dégradé (bg-linear-to-r...). */}
          <h1 className="text-5xl font-black">
            Bienvenue sur{" "}
            <span className="whitespace-nowrap text-transparent bg-clip-text bg-blue-500">
              Absolute Stream
            </span>
          </h1>
        </div>

        {/* Boutons d'appel à l'action — un vers le catalogue, l'autre vers
            l'inscription. On utilise <Link> de next/link pour la navigation
            client-side (= pas de full reload). */}
        <div className="flex flex-row items-center justify-center gap-4">
          <Link
            href="/movies"
            className="h-11 px-6 rounded-lg flex flex-row items-center justify-center bg-zinc-50 text-zinc-950 font-medium hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
          >
            Découvrir le catalogue
          </Link>
          <Link
            href="/register"
            className="h-11 px-6 rounded-lg flex flex-row items-center justify-center bg-zinc-50 text-zinc-950 font-medium hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>

      {/* === Container principal des sections "marketing" sous le hero === */}
      <main>
        {/* max-w-360 = largeur max ~1440px (360 × 4px = nombre Tailwind).
            mx-auto = marges horizontales auto = centrage.
            gap-42 = espacement vertical entre les sections (généreux). */}
        <div className="max-w-360 mx-auto px-6 py-24 flex flex-col gap-42">
          {/* === SECTION 2 : À PROPOS === grille 1 col mobile / 2 cols desktop */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tight">
                Le réseau social des amoureux de pop-culture.
              </h2>
              {/* &apos; = entité HTML pour l'apostrophe (sinon ESLint râle
                  car ' casse le JSX). On peut aussi utiliser {`l'app`}. */}
              <p className="text-zinc-400 leading-relaxed">
                Absolute Stream est une plateforme communautaire pensée pour les
                passionnés de cinéma et de séries. Connecté en temps réel à
                l&apos;immense catalogue mondial de{" "}
                <span className="text-zinc-200 font-medium">TMDB</span>, notre
                outil vous permet de centraliser vos visionnages, de partager
                vos avis et de vous connecter avec vos proches.
              </p>
            </div>
            {/* Visuel d'illustration. `aspect-video` = ratio 16:9.
                `relative + overflow-hidden` + Image fill = image qui prend
                toute la box parent. */}
            <div className="aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-6 text-zinc-500 relative overflow-hidden group">
              <Image
                src="https://image.tmdb.org/t/p/original/pzyYJJ0CuM1rBoIqh2DLs73k7JX.jpg"
                alt="Visual placeholder"
                fill
              />
            </div>
          </section>

          {/* === SECTION 3 : FEATURE MATCH === 4 étapes en grid responsive */}
          <section className="flex flex-col gap-10 relative overflow-hidden">
            <div className="flex flex-col gap-2 max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight">
                Mode Match : Swipez. Matchez. Regardez.
              </h2>
              <p className="text-zinc-400">
                Trouver un film en duo n&apos;a jamais été aussi simple (et
                fun). Plus besoin de débattre pendant des heures devant
                l&apos;écran.
              </p>
            </div>
            {/* Grid responsive :
                  grid-cols-1            → 1 col par défaut (mobile)
                  sm:grid-cols-2         → 2 cols dès 640px
                  lg:grid-cols-4         → 4 cols dès 1024px
                C'est la beauté de Tailwind : les breakpoints sont des préfixes. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* .map() sur le tableau stepsMatch — généré une carte par étape.
                  key={idx} (l'index) est acceptable ici car la liste est statique
                  et l'ordre ne change pas. Pour une liste dynamique on prend l'id. */}
              {stepsMatch.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-xs"
                >
                  <span className="text-xs font-bold text-blue-500 tracking-wider">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-zinc-100">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-normal">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* === SECTION 4 : BENTO GRID des features === */}
          <section className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Tout ce dont vous avez besoin
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* On délègue à un sous-composant CardSubject pour ne pas
                  surcharger le JSX et garder le map() lisible.
                  Note : `Icon` est un composant React passé en prop, pas un string.
                  C'est ce qui permet de l'utiliser comme <Icon /> dans CardSubject. */}
              {features.map((feature, idx) => (
                <CardSubject
                  key={idx}
                  Icon={feature.Icon}
                  Title={feature.Title}
                  Description={feature.Description}
                />
              ))}
            </div>
          </section>

          {/* === SECTION 5 : TABLEAU COMPARATIF === */}
          <section className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
            <div className="text-center flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Choisissez votre expérience
              </h2>
              <p className="text-sm text-zinc-400">
                Pas de carte bancaire, l&apos;inscription est 100% gratuite.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-xs">
              {/* Vraie balise <table> HTML — c'est sémantiquement correct
                  pour un tableau de données (vs flex/grid qui sont pour la mise en page). */}
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 font-medium">
                    <th className="p-4">Fonctionnalités</th>
                    <th className="p-4 text-center w-32">Visiteur</th>
                    <th className="p-4 text-center w-32 text-blue-400">
                      Membre
                    </th>
                  </tr>
                </thead>
                {/* divide-y = ajoute une bordure entre chaque <tr> sœur.
                    Plus court qu'écrire border-b sur chaque ligne. */}
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {featuresTable.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-zinc-900/20 transition-colors"
                    >
                      <td
                        // Backtick + interpolation : on injecte une classe
                        // conditionnelle si row.highlight est true.
                        className={`p-4 font-medium ${row.highlight ? "text-zinc-150" : ""}`}
                      >
                        {row.name}
                      </td>
                      {/* Ternaire qui choisit l'icône Check ou X selon le booléen. */}
                      <td className="p-4 text-center">
                        {row.visitor ? (
                          <Check className="w-4 h-4 mx-auto text-zinc-400" />
                        ) : (
                          <X className="w-4 h-4 mx-auto text-zinc-600" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.member ? (
                          <Check
                            className={`w-4 h-4 mx-auto ${row.highlight ? "text-cyan-400" : "text-blue-500"}`}
                          />
                        ) : (
                          <X className="w-4 h-4 mx-auto text-zinc-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* === SECTION 6 : CTA FINAL === relance d'inscription en pied de page */}
          <section className="text-center py-12 flex flex-col items-center gap-6">
            {/* Séparateur visuel : un trait dégradé blanc transparent au centre */}
            <div className="h-px w-[80%] bg-linear-65 from-white/10 via-white/80 to-white/10 mb-6" />

            <h2 className="text-3xl font-bold tracking-tight ">
              Prêt à trouver votre prochain coup de cœur ?
            </h2>
            <button className="h-11 px-8 rounded-lg bg-zinc-50 text-zinc-950 font-medium hover:bg-zinc-200 transition-colors">
              S&apos;inscrire gratuitement
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sous-composant local : une carte de feature dans la bento grid (section 4).
// Pourquoi local ? Il n'est utilisé qu'ici → pas de raison de l'extraire dans
// un fichier séparé. On gagne en lisibilité.
//
// Détail typage : `Icon: LucideIcon` accepte un COMPOSANT React (les icônes
// Lucide sont des composants). Du coup on peut écrire <Icon className=... />
// directement comme n'importe quel composant React.
// ----------------------------------------------------------------------------
function CardSubject({
  Icon,
  Title,
  Description,
}: {
  Icon: LucideIcon;
  Title: string;
  Description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-4">
      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 w-fit text-zinc-300">
        {/* L'icône passée en prop est rendue comme un composant React */}
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-zinc-100 mb-1">{Title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{Description}</p>
      </div>
    </div>
  );
}
