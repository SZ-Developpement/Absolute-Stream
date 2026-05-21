"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    // Lien vers le profil utilisateur avec avatar
    <Link
      href={`/profile/${id}`}
      className="w-8 aspect-square relative rounded-full overflow-hidden cursor-pointer"
    >
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
    </Link>
  );
}
