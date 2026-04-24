import { notFound } from "next/navigation";
import { Bell, Film, Heart, List, LucideIcon } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      image: true,
      _count: {
        select: {
          library: true,
          favorites: true,
          lists: true,
          followers: true,
        },
      },
    },
  });

  if (!user) notFound();
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
              <h4 className="text-white font-bold text-2xl">{user.name}</h4>

              <div className="flex flex-row gap-2.5">
                <div className="flex flex-row items-center gap-1.5">
                  <span className="text-white text-xs">
                    Suivi par{" "}
                    <a href="#" className=" hover:underline">
                      @thomas-montout
                    </a>{" "}
                    et 10 autres personnes
                  </span>
                  <div className="flex flex-row -gap-4 items-center">
                    <a
                      href="#"
                      className="relative h-6 aspect-square rounded-full bg-pink-500 text-white text-[10px] border border-background flex items-center justify-center"
                      style={{ marginRight: "-8px", zIndex: 1 }}
                    >
                      C
                    </a>
                    <a
                      href="#"
                      className="relative h-6 aspect-square rounded-full bg-blue-500 text-white text-[10px] border border-background flex items-center justify-center"
                      style={{ marginRight: "-8px", zIndex: 1 }}
                    >
                      T
                    </a>

                    <a
                      href="#"
                      className="relative h-6 aspect-square rounded-full bg-red-500 text-white text-[10px] border border-background flex items-center justify-center"
                      style={{ marginRight: "0px", zIndex: 2 }}
                    >
                      A
                    </a>
                  </div>
                </div>

                <button className="h-8 flex items-center justify-center aspect-square bg-transparent text-white rounded-md cursor-pointer hover:bg-white/10 transition-colors duration-300">
                  <Bell size={16} />
                </button>
                <button className="px-4 py-1.5 text-sm bg-white text-black rounded-md cursor-pointer hover:bg-gray-200 transition-colors duration-300">
                  Follow
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
