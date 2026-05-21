import { NoteGroupProps } from "@/types/medias";

const ABS_ACCENT = "#155DFC";
const ABS_BG = "#09276A";
const TMDB_ACCENT = "#ffc107";
const TMDB_BG = "#6B5103";

function NoteButton({
  score,
  label,
  accent,
  bg,
}: {
  score: number;
  label: string;
  accent: string;
  bg: string;
}) {
  const pct = (score / 10) * 100;

  return (
    <button
      className="relative h-10 flex items-center justify-center rounded-full text-xs font-medium"
      style={{
        background: `conic-gradient(from -90deg at 18px 50%, ${accent} ${pct}%, ${bg} ${pct}%)`,
        padding: "3px",
      }}
    >
      <div
        className="flex items-center gap-2 rounded-full py-2 px-3 h-full"
        style={{ background: bg }}
      >
        <span className="min-w-[10px]">{score}</span>
        {label}
      </div>
    </button>
  );
}

export default function NoteGroup({ count_abs, count_tmdb }: NoteGroupProps) {
  return (
    <div className="flex items-center gap-2.5">
      <NoteButton
        score={count_abs}
        label="Absolute"
        accent={ABS_ACCENT}
        bg={ABS_BG}
      />
      <NoteButton
        score={count_tmdb}
        label="TMDB"
        accent={TMDB_ACCENT}
        bg={TMDB_BG}
      />
    </div>
  );
}
