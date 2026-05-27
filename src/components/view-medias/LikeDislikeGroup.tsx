"use client";

import React, { useState } from "react";
import { Thumbs, ThumbsDown } from "../Icons/Thumbs";
import { LikesButtonProps } from "@/types/medias";

// 1. Un sous-composant pour le bouton unique
const RatingButton = ({
  isActive,
  activeBgColor,
  onClick,
  Icon,
  count = 0,
}: LikesButtonProps) => {
  const baseClass =
    "px-4 h-10 flex items-center gap-2 transition rounded-full text-sm";
  const activeClass = `${activeBgColor} text-white`;
  const inactiveClass =
    "bg-[#262626] hover:bg-[#262626]/80 text-[#a3a3a3] hover:text-white";

  return (
    <button
      className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
      onClick={onClick}
    >
      <Icon size={16} color={isActive ? "#ffffff" : "#a3a3a3"} />
      <span className="text-xs min-w-2.5">{count}</span>
    </button>
  );
};

// 2. Le composant principal
export default function LikeDislikeGroup({
  initialLikes = 0,
  initialDislikes = 0,
}) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    if (!liked) setDisliked(false);
  };

  const toggleDislike = () => {
    setDisliked((prev) => !prev);
    if (!disliked) setLiked(false);
  };

  const likeCount = liked ? initialLikes + 1 : initialLikes;
  const dislikeCount = disliked ? initialDislikes + 1 : initialDislikes;

  return (
    <div className="flex items-center gap-2">
      {/* Bouton Like */}
      <RatingButton
        isActive={liked}
        activeBgColor="bg-[#16a34a]"
        onClick={toggleLike}
        Icon={Thumbs}
        count={likeCount}
      />

      {/* Bouton Dislike */}
      <RatingButton
        isActive={disliked}
        activeBgColor="bg-[#dc2626]"
        onClick={toggleDislike}
        Icon={ThumbsDown}
        count={dislikeCount}
      />
    </div>
  );
}
