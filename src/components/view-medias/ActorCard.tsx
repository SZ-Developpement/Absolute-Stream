import { ActorCardProps } from "@/types/medias";
import Image from "next/image";

export default function ActorCard({
  actorName,
  actorRole,
  imageUrl,
}: ActorCardProps) {
  return (
    <div className="flex flex-row items-center gap-3 p-2 rounded-lg hover:bg-[#262626]/40 transition-all duration-300 cursor-pointer">
      <Image
        src={imageUrl || "/No-image/UserIcon.jpg"}
        alt={`Actor ${actorName}`}
        width={48}
        height={48}
        className="rounded-full object-cover"
      />

      <div>
        <p className="font-medium">{actorName}</p>
        <p className="text-sm text-[#a3a3a3]">{actorRole}</p>
      </div>
    </div>
  );
}
