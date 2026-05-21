import { Search } from "lucide-react";

export default function InputSearch({ className }: { className?: string }) {
  return (
    // Champ de recherche avec icône et styles adaptés pour les différentes tailles d'écran
    <div
      className={`flex flex-row items-center bg-foreground/5 border border-foreground/10 rounded-lg py-1.5 px-3 w-70 focus-within:border-foreground/30 transition-colors duration-300 ${className}`}
    >
      <Search size={14} className="text-foreground/50" />
      <input
        type="text"
        placeholder="Rechercher un film, une série..."
        className="ml-2 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground/50 w-full"
      />
    </div>
  );
}
