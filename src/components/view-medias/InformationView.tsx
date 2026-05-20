import ActionButton from "@/components/view-medias/ActionButton";
import { ListChecks, NotebookPen, Star, TicketCheck } from "lucide-react";
import TableInfos from "./TableInfos";
import Warning from "./Warning";

export default function InformationView() {
  return (
    <>
      {/* Informations supplémentaires */}
      <div className="grid grid-cols-3 gap-3 my-1">
        <TableInfos name="Réalisateur">David Ayer</TableInfos>
        <TableInfos name="Durée">51 minutes</TableInfos>
        <TableInfos name="Date de sortie">12 mai 2026</TableInfos>
        <TableInfos name="Classification">16 ans et plus</TableInfos>
        <TableInfos name="Genres">Action, Thriller</TableInfos>
      </div>

      {/* Avertissement sur les données TMDB */}
      <Warning />

      <div className="flex items-center gap-1">
        {/* Ajouter une note */}
        <ActionButton Icon={NotebookPen} text="Note" />

        {/* Ajouter au favori */}
        <ActionButton Icon={Star} text="Favori" />

        {/* Ajouter à une liste */}
        <ActionButton Icon={ListChecks} text="Liste" />

        {/* Ajouter à la liste deja vue */}
        <ActionButton Icon={TicketCheck} text="Déjà vu" />
      </div>
    </>
  );
}
