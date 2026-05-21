import Link from "next/link";

export default function ButtonUnConnected() {
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
