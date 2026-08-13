"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, BadgeCheck, Star } from "lucide-react";
import { Item } from "@/lib/types";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <Link href={`/marketplace/${item.id}`} className="group block">
      <div className="relative aspect-[4/4.35] overflow-hidden rounded-xl bg-[#F1F2F4]">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted((value) => !value);
          }}
          aria-label="Add to wishlist"
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur"
        >
          <Heart
            size={15}
            className={isWishlisted ? "fill-[#E5484D] text-[#E5484D]" : "text-[#17233D]"}
          />
        </button>

        <span className="absolute left-2.5 bottom-2.5 rounded-md bg-[#17233D]/90 px-2 py-1 text-[10px] font-semibold text-white">
          {item.categoryLabel}
        </span>
      </div>

      <div className="pt-3 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold leading-5 text-[#17233D] line-clamp-2">
            {item.title}
          </h3>
          <span className="shrink-0 text-sm font-bold text-[#6546D9]">₹{item.price}</span>
        </div>

        <p className="mt-1 text-xs text-[#7B8394]">{item.condition}</p>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#697286]">
          <span className="truncate">{item.sellerName}</span>
          {item.sellerVerified && <BadgeCheck size={13} className="shrink-0 text-[#6546D9]" />}
          <span className="text-[#C8CCD4]">·</span>
          <Star size={11} className="shrink-0 fill-[#F2B01E] text-[#F2B01E]" />
          <span className="shrink-0">{item.sellerRating}</span>
        </div>
      </div>
    </Link>
  );
}