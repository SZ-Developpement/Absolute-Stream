"use client";

import MediaContainer from "@/components/medias/MediaContainer";
import LikeDislikeGroup from "@/components/view-medias/LikeDislikeGroup";
import SubMenu from "@/components/view-medias/SubMenu";
import Image from "next/image";
import Link from "next/link";

export default function AnimesPage() {
  return (
    <>
      <Image
        src="https://image.tmdb.org/t/p/original/qO55CD8tgVL1T4WKn6zYFFiD6lL.jpg"
        alt="Background Image"
        fill
        className="object-cover object-center bg-black/50 opacity-20"
        loading="eager"
      />
      <MediaContainer>
        <div className="w-full min-h-screen flex flex-row gap-6 xl:gap-12 mt-12 z-10">
          {/* Bloc de gauche */}
          <div className="flex flex-col gap-4 max-w-[16rem] w-full">
            {/* Poster Media */}
            <div className="aspect-2/3 relative rounded-md transition overflow-hidden ">
              <Image
                src={
                  "https://image.tmdb.org/t/p/w600_and_h900_face/srq0MYdQRzdnW6OGfUti7oVbu32.jpg"
                  // || "No-Image/no-image.png"
                }
                alt="Media Poster"
                fill
                className="object-cover object-top hover:scale-102 transition-transform duration-300"
              />
            </div>
            <Link
              href="/media/1"
              className="px-6 py-3.5 text-sm rounded-md bg-[#262626] hover:bg-[#262626]/80 transition text-white text-center"
            >
              Voir la bande annonce
            </Link>
          </div>

          {/* Bloc de droite */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Titre */}
            <h1 className="text-3xl tracking-tighter font-semibold text-gray-100 line-clamp-1">
              The Punisher : One Last Kill
            </h1>

            {/* Informations rapides */}
            {/* <div className="flex items-center gap-4 text-[#A3A3A3] text-xs">
              <span>51 minutes</span>
              <span>2024</span>
              <span>Etats-Unis</span>
            </div> */}

            {/* Like Actions */}
            <div className="flex items-center gap-6">
              {/* Groupe de boutons Like/Dislike */}
              <LikeDislikeGroup />
            </div>

            {/* Synopsis */}
            <p className="text-[#a3a3a3] line-clamp-3">
              Alors que Frank Castle cherche un sens à sa vie au-delà de la
              vengeance, il replonge contre toute attente au cœur du combat.
            </p>

            <SubMenu />
          </div>
        </div>
      </MediaContainer>
    </>
  );
}
