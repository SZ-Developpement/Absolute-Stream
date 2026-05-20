import { tabs } from "@/constants/nav-view";
import { useState } from "react";
import InformationView from "./InformationView";
import CommentsView from "./CommentsView";
import CastingView from "./CastingView";

export default function SubMenu() {
  const [activeTab, setActiveTab] = useState("informations");

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Sémantique : On utilise <nav> pour un menu */}
      <nav className="flex flex-row items-center justify-start gap-3 border-b border-[#262626] pb-2 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`text-[13px] py-1.5 px-3 rounded-md transition select-none cursor-pointer
                ${
                  isActive
                    ? "bg-[#262626] text-white"
                    : "text-[#d4d4d4cc] hover:bg-[#262626]/40 hover:text-white"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 2. On affiche le contenu dynamiquement selon l'onglet actif */}
      <div className="flex flex-col gap-4 w-full ">
        {activeTab === "informations" && <InformationView />}
        {activeTab === "casting" && <CastingView />}
        {activeTab === "commentaires" && <CommentsView />}
      </div>
    </div>
  );
}
