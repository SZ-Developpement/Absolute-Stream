import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItem({
  icon: Icon,
  name,
  href,
}: {
  icon: LucideIcon;
  name: string;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    // Lien de navigation avec styles conditionnels pour l'état actif/inactif
    <Link
      href={href}
      className={`w-full 2xl:w-fit flex flex-row items-center gap-2 text-sm rounded-lg py-2 px-3 transition-all duration-200 ${
        isActive
          ? "text-foreground bg-foreground/10"
          : "text-foreground/50 hover:text-foreground hover:bg-foreground/8"
      }`}
    >
      <Icon size={14} />
      {name}
    </Link>
  );
}
