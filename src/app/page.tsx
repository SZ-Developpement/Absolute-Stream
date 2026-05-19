import { Users, Check, X, Search, Star, LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// const stepsMatch = [
//   {
//     step: "01",
//     title: "Lancez un duo",
//     desc: "Créez une session en un clic et partagez le lien d'invitation unique.",
//   },
//   {
//     step: "02",
//     title: "Swipez à deux",
//     desc: "À droite si ça vous tente, à gauche si vous passez votre tour.",
//   },
//   {
//     step: "03",
//     title: "Notification live",
//     desc: "Notre système synchronise vos choix instantanément en arrière-plan.",
//   },
//   {
//     step: "04",
//     title: "C'est un Match !",
//     desc: "Alerte immédiate dès qu'un coup de cœur commun est trouvé.",
//   },
// ];

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
    name: "Système de Match en temps réel ⚡",
    visitor: false,
    member: true,
    highlight: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background/30 text-zinc-50">
      <section className="relative h-screen flex flex-col gap-6 items-center justify-center text-center px-4">
        {/* Titre principal */}
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-black">
            Bienvenue sur{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">
              Absolute Stream
            </span>
          </h1>
          <p className="text-xl text-zinc-400">
            Le réseau social ciné & séries. Swipez. Matchez. Regardez.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-row items-center justify-center gap-4">
          <Link
            href="/movies"
            className="h-11 px-6 rounded-lg flex flex-row items-center justify-center bg-zinc-50 text-zinc-950 font-medium hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
          >
            Découvrir le catalogue
          </Link>
          <Link
            href="/register"
            className="h-11 px-6 rounded-lg flex flex-row items-center justify-center bg-black text-white font-medium hover:bg-black/90 hover:text-zinc-50 transition-all cursor-pointer"
          >
            Créer un compte gratuit
          </Link>
        </div>
      </section>

      {/* Container Principal */}
      <main className=" bg-background">
        <div className="max-w-360 mx-auto px-6 py-24 flex flex-col gap-32">
          {/* À PROPOS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tight">
                Le réseau social des amoureux de pop-culture.
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Absolute Stream est une plateforme communautaire pensée pour les
                passionnés de cinéma et de séries. Connecté en temps réel à
                l&apos;immense catalogue mondial de{" "}
                <span className="text-zinc-200 font-medium">TMDB</span>, notre
                outil vous permet de centraliser vos visionnages, de partager
                vos avis et de vous connecter avec vos proches.
              </p>
            </div>
            {/* Placeholder visuel (Mockup ou Image de l'app) */}
            <div className="aspect-video rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-6 text-zinc-500 relative overflow-hidden group">
              <Image
                src="https://image.tmdb.org/t/p/original/pzyYJJ0CuM1rBoIqh2DLs73k7JX.jpg"
                alt="Visual placeholder"
                fill
              />
            </div>
          </section>

          {/* FEATURE : LE MATCH */}
          {/* <section className="flex flex-col gap-10 relative overflow-hidden">
            <div className="flex flex-col gap-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-cyan-400 border border-blue-500/20 w-fit">
                Fonctionnalité phare
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Mode Match : Swipez. Matchez. Regardez.
              </h2>
              <p className="text-zinc-400">
                Trouver un film en duo n'a jamais été aussi simple (et fun).
                Plus besoin de débattre pendant des heures devant l'écran.
              </p>
            </div>
            Grille des étapes du Match
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
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
          </section> */}

          {/* 4. LES AUTRES FONCTIONNALITÉS (Bento Grid / Cartes) */}
          <section className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Tout ce dont vous avez besoin
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Carte 1 : Catalogue */}
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

          {/* TABLEAU COMPARATIF */}
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
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {featuresTable.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-zinc-900/20 transition-colors"
                    >
                      <td
                        className={`p-4 font-medium ${row.highlight ? "text-zinc-150" : ""}`}
                      >
                        {row.name}
                      </td>
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

          {/* FINAL CTA PANEL */}
          <section className="text-center py-12 flex flex-col items-center gap-6">
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
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-zinc-100 mb-1">{Title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{Description}</p>
      </div>
    </div>
  );
}
