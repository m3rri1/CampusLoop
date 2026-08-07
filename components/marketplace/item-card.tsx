"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MapPin, BadgeCheck, Star } from "lucide-react";
import { Item } from "@/lib/types";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image with badges */}
      <div className="relative w-full h-36 bg-gray-100">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
        />

        {/* Category badge - top left */}
        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full">
          {item.categoryLabel}
        </span>

        {/* Price badge - top right */}
        <span className="absolute top-2 right-2 bg-[#6759FF] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          ₹{item.price}
        </span>

        {/* Wishlist heart - bottom right of image */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full"
        >
          <Heart
            size={14}
            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}
          />
        </button>
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
          {item.title}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          <MapPin size={11} className="text-gray-400 shrink-0" />
          <p className="text-[11px] text-gray-500 line-clamp-1">{item.location}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-700 font-medium">{item.sellerName}</span>
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-[11px] text-gray-500">{item.sellerRating}</span>
          </div>

          {item.sellerVerified && (
            <BadgeCheck size={15} className="text-green-500 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}