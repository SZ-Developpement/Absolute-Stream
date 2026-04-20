export default function MatchPage() {
  return (
    <div className="pt-22 flex flex-col flex-1 items-center relative">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-4xl font-extrabold uppercase bg-clip-text text-transparent bg-linear-to-r from-red-200 via-white to-red-200">
          Absolute Match
        </h1>
        <p className="text-sm text-center max-w-3xl text-foreground/70">
          Marre de passer deux heures à choisir un film ? Créez une session,
          invitez un ami et swipez parmi des milliers d&apos;œuvres. Dès que
          vous aimez le même film, c&apos;est un Match !
        </p>
      </div>

      <div className="flex flex-col gap-2 absolute top-1/2 -translate-y-1/2">
        <button
          className="flex items-center justify-center py-2.5 px-9 w-[320px] font-bold text-foreground rounded-lg bg-(--hover-color) hover:bg-(--page-main) transition-colors duration-300 cursor-pointer"
          style={
            {
              "--hover-color":
                "color-mix(in srgb, var(--page-main), transparent 40%)",
            } as React.CSSProperties
          }
        >
          Nouveau Match
        </button>
        <button className="flex items-center justify-center py-2.5 px-9 w-[320px] font-bold text-foreground rounded-lg bg-[#474747]/30 hover:bg-[#474747]/50 transition-colors duration-300 cursor-pointer">
          Rejoindre un Match
        </button>
      </div>
    </div>
  );
}
