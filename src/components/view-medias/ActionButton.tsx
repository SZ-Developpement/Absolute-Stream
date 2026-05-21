import { cn } from "@/lib/utils";
import { ActionsButtonProps } from "@/types/medias";

export default function ActionButton({
  onclick,
  Icon,
  className,
  text,
}: ActionsButtonProps) {
  return (
    <button
      onClick={onclick}
      className={cn(
        `h-10 rounded-full text-[#a3a3a3] text-sm bg-white/5 hover:bg-[#262626] hover:text-white cursor-pointer flex items-center justify-center transition-all duration-300 ${text ? "px-4 gap-2" : "aspect-square"}`,
        className,
      )}
    >
      <Icon size={18} />
      {text && <p>{text}</p>}
    </button>
  );
}
