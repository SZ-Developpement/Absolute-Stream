import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import MediaContainer from "@/components/medias/MediaContainer";
import ProfileMenu from "@/components/profile/ProfileMenu";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          library: true,
          favorites: true,
          lists: true,
        },
      },
    },
  });

  if (!user) notFound();
  return (
    <MediaContainer className="min-h-screen">
      <div className="flex flex-col w-full rounded-xl aspect-6/1 relative bg-blue-600">
        <div className="absolute -bottom-17.5 px-6 w-full flex flex-row gap-6">
          <Image
            src={user.image || "/No-Image/UserIcon.jpg"}
            alt="AvatarProfile"
            width={140}
            height={140}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, (max-width: 1536px) 16vw, 12.5vw"
            className="object-cover rounded-full border-6 border-background"
          />
          <div className="grid grid-rows-2 flex-1">
            <div />

            <div className="flex items-center font-medium text-lg">
              {user.name}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full pt-8">
        <ProfileMenu />
      </div>
    </MediaContainer>
  );
}
