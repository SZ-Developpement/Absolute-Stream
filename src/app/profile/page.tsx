import { Bell, Film, Heart, List, LucideIcon } from "lucide-react";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MyProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          library: true,
          favorites: true,
          lists: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen pt-18 w-360 mx-auto">
      <div className="w-full h-62.5 rounded-3xl flex flex-col items-center justify-center p-4 relative">
        <Image
          src="https://image.tmdb.org/t/p/original/pcw4m5WjuQvZZDvVG8UDIp2uWeR.jpg"
          alt="BannerProfile"
          fill
          className="object-cover rounded-3xl"
        />

        <div className="absolute flex flex-row gap-6 -bottom-20 px-25 w-full ">
          <Image
            src={user.image || "/No-Image/UserIcon.jpg"}
            alt="AvatarProfile"
            width={160}
            height={160}
            className="object-cover rounded-full border-4 border-background"
          />
          <div className="grid grid-rows-2 w-full">
            <div className="w-full row-span-1 row-end-3 h-full flex flex-row items-center justify-between">
              <h4 className="text-white font-bold text-2xl">
                {user.username || user.name}
              </h4>

              <div className="flex flex-row gap-2.5">
                <button className="h-8 flex items-center justify-center aspect-square bg-transparent text-white rounded-md cursor-pointer hover:bg-white/10 transition-colors duration-300">
                  <Bell size={16} />
                </button>
                <button className="px-4 py-1.5 text-sm bg-white text-black rounded-md cursor-pointer hover:bg-gray-200 transition-colors duration-300">
                  {user._count.followers} followers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-full pt-26">
        <div className="border-b border-[#1A1A1A]">
          <nav className="flex flex-row gap-3 p-2">
            <NavItem
              label="Watchlist"
              icon={Film}
              badge={user._count.library}
              isActive={true}
            />
            <NavItem
              label="Favoris"
              icon={Heart}
              badge={user._count.favorites}
            />
            <NavItem label="Listes" icon={List} badge={user._count.lists} />
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  label,
  badge,
  icon,
  isActive = false,
}: {
  label: string;
  badge: number;
  icon: LucideIcon;
  isActive?: boolean;
}) {
  const IconComponent = icon;
  return (
    <button
      className={`px-4 py-1.5 gap-2 flex flex-row items-center text-sm rounded-lg cursor-pointer transition-colors duration-300 ${isActive ? "bg-white/10 text-white" : "text-white hover:bg-white/10"}`}
    >
      <IconComponent size={14} />
      {label}
      <span className="bg-white/10 text-white text-[10px] h-4 aspect-square rounded-full flex items-center justify-center">
        {badge}
      </span>
    </button>
  );
}
