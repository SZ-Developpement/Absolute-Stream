import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import MediaContainer from "@/components/medias/MediaContainer";

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
    <MediaContainer>
      <Image
        src={user.image || "/No-Image/UserIcon.jpg"}
        alt="AvatarProfile"
        width={160}
        height={160}
        className="object-cover rounded-full border-4 border-background"
      />
    </MediaContainer>
  );
}
