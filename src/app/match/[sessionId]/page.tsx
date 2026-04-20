"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play } from "lucide-react";
import Image from "next/image";
import { RadioCards, RadioCardsItem } from "@/components/ui/radio-group";

export default function MatchPage() {
  const [value, setValue] = React.useState([1970, 2026]);

  return (
    <div className="pt-22 flex flex-col flex-1 items-center relative">
      <div className="grid grid-cols-3 w-full flex-1 items-center justify-center ">
        <UserCard />

        <div className="bg-background/30 backdrop-blur-xl flex flex-col gap-6 w-full rounded-xl p-6">
          <h2 className="text-2xl font-extrabold text-center uppercase">
            Absolute Match
          </h2>

          <form action="" className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-2 w-full">
              <Label className="text-base">Type de média</Label>
              <RadioCards
                defaultValue="movie"
                className="flex flex-row flex-wrap gap-2"
              >
                <CardChoice value="movie" name="Films" />
                <CardChoice value="tv" name="Séries" />
                <CardChoice value="anime" name="Animé" />
                <CardChoice value="all" name="Tous" />
              </RadioCards>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row items-center justify-between">
                <Label className="text-base">Année</Label>
                <span className="text-sm text-muted-foreground">
                  {value.join(" - ")}
                </span>
              </div>
              <Slider
                id="slider-date"
                value={value}
                onValueChange={setValue}
                min={1970}
                max={2026}
                step={1}
                color="var(--page-main)"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Label className="text-base">Genre</Label>
              <RadioCards
                defaultValue="movie"
                className="flex flex-row flex-wrap gap-2"
              >
                <CardChoice value="action" name="Action" />
                <CardChoice value="drame" name="Drame" />
                <CardChoice value="policier" name="Policier" />
                <CardChoice value="comedy" name="Comédie" />
                <CardChoice value="horror" name="Horreur" />
                <CardChoice value="sci-fi" name="Sci-Fi" />
                <CardChoice value="fantasy" name="Fantasy" />
                <CardChoice value="animation" name="Animation" />
                <CardChoice value="documentary" name="Documentaire" />
                <CardChoice value="romance" name="Romance" />
                <CardChoice value="thriller" name="Thriller" />
                <CardChoice value="mystery" name="Mystère" />
                <CardChoice value="all" name="Tous" />
              </RadioCards>
            </div>
          </form>

          <button className="bg-(--page-main) text-white flex flex-row gap-2 items-center justify-center font-semibold py-2 px-4 rounded-sm cursor-pointer hover:bg-(--page-main)/60 transition-colors duration-300">
            <Play size={16} />
            Lancer le Match
          </button>
        </div>

        <UserCard />
      </div>
    </div>
  );
}

function CardChoice({ value, name }: { value: string; name: string }) {
  return (
    <RadioCardsItem
      value={value}
      className="data-[state=checked]:bg-(--page-main)/70"
    >
      <span>{name}</span>
    </RadioCardsItem>
  );
}

function UserCard({ image, username }: { image?: string; username?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-45 h-45 border-4 border-(--page-main) rounded-full relative">
        <Image
          src={image || "/No-Image/UserIcon.jpg"}
          alt="User"
          fill
          className="object-cover rounded-full absolute"
        />
      </div>
      <h2 className="text-xl font-semibold">{username || "Username"}</h2>
    </div>
  );
}
