import { Send } from "lucide-react";

export default function CommentsInput() {
  return (
    <div className="group relative rounded-xl border border-[#262626] bg-[#0d0d0d] p-2 transition-all duration-300 focus-within:border-[#404040] focus-within:ring-1 focus-within:ring-[#404040]">
      {/* Zone de texte */}
      <textarea
        className="w-full bg-transparent px-3 py-2 text-sm text-[#f5f5f5] placeholder-[#737373] resize-none outline-none border-0 focus:ring-0"
        name="comment"
        placeholder="Écrire un commentaire..."
        rows={2}
      />

      {/* Barre d'outils / Actions en bas */}
      <div className="flex items-center justify-end border-t border-[#1f1f1f] pt-2 mt-1 ">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 h-8 px-3 rounded-lg text-xs font-medium bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#e5e5e5] active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <span>Envoyer</span>
          <Send size={12} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
