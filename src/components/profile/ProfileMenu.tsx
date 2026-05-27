"use client";

import { Film, Heart, LayoutDashboard, List } from "lucide-react";
import { useState } from "react";
import OverviewProfile from "./OverviewProfile";
import WatchlistProfile from "./WatchlistProfile";
import FavorisProfile from "./FavorisProfile";
import ListesProfile from "./ListesProfile";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "watchlist", label: "Watchlist", icon: Film },
  { id: "favoris", label: "Favoris", icon: Heart },
  { id: "listes", label: "Listes", icon: List },
];

export default function ProfileMenu() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Sémantique : On utilise <nav> pour un menu */}
      <nav className="flex flex-row gap-3 p-2 border-b border-[#262626]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 gap-2 flex flex-row items-center text-sm rounded-lg cursor-pointer transition-colors duration-300 ${isActive ? "bg-white/10 text-white" : "text-white hover:bg-white/10"}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 2. On affiche le contenu dynamiquement selon l'onglet actif */}
      <div className="flex flex-col gap-4 w-full ">
        {activeTab === "overview" && <OverviewProfile />}
        {activeTab === "watchlist" && <WatchlistProfile />}
        {activeTab === "favoris" && <FavorisProfile />}
        {activeTab === "listes" && <ListesProfile />}
      </div>
    </div>
  );
}
