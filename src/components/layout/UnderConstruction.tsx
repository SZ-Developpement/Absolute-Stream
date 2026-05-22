import { Construction } from "lucide-react";

export default function UnderConstruction({
  title = "Page en construction",
  message = "Cette section arrive bientôt. Repassez dans quelques jours.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="p-5 rounded-full bg-foreground/5 border border-foreground/10">
        <Construction size={48} className="text-foreground/60" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-sm text-foreground/60 max-w-md">{message}</p>
    </div>
  );
}
