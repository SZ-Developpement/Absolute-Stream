import { TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function Warning() {
  return (
    <div className="flex flex-row gap-2 items-center justify-start text-blue-600 bg-blue-600/20 border border-blue-600/30 rounded-lg px-4 py-3">
      <TriangleAlert size={20} />
      <span className="text-sm text-white ml-2">
        Les infos proviennent de la base de données publique{" "}
        <Link
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 text-blue-600"
        >
          TMDB
        </Link>
        . <br />
        Il peut y avoir des erreurs ou des différences de dates de sortie selon
        le pays (ex: pas la même date en France qu&apos;en Amérique).
      </span>
    </div>
  );
}
