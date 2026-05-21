"use client";

import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";

export default function ButtonConnected({
  id,
  name,
  image,
}: {
  id: string;
  name: string;
  image: string | null | undefined;
}) {
  const { signOut } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    // Lien vers le profil utilisateur avec avatar
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-8 aspect-square relative rounded-full overflow-hidden cursor-pointer">
          {/* Fallback toujours présent en dessous */}
          <p className="text-sm font-bold text-foreground bg-pink-400 rounded-full w-full h-full flex items-center justify-center">
            {name[0].toUpperCase()}
          </p>
          {image && (
            <Image
              src={image}
              alt={`Profil ${name}`}
              fill
              className={`object-cover absolute rounded-full transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem>
          <Link className="w-full" href={`/profile/${id}`}>
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link className="w-full" href="/support">
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="bg-[#E50914]/10 text-[#E50914] focus:bg-[#E50914]/20 focus:text-[#E50914] transition-colors duration-200 ">
          <button onClick={() => signOut()}>Déconnexion</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
