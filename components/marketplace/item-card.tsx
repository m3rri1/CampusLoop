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
      <div className="relative aspect-[4/4.25] overflow-hidden rounded-[18px] bg-[#F0F1F4]">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.035]"
        />

        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted((value) => !value);
          }}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(23,35,61,0.12)]"
        >
          <Heart
            size={16}
            strokeWidth={2}
            className={isWishlisted ? "fill-[#E5484D] text-[#E5484D]" : "text-[#17233D]"}
          />
        </button>

        <span className="absolute left-3 bottom-3 rounded-md bg-[#17233D] px-2.5 py-1 text-[10px] font-bold tracking-wide text-white">
          {item.categoryLabel}
        </span>
      </div>

      <div className="pt-3 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[13px] font-bold leading-[18px] text-[#17233D] line-clamp-2">
            {item.title}
          </h3>
          <span className="shrink-0 text-[14px] font-extrabold tracking-tight text-[#6546D9]">
            ₹{item.price}
          </span>
        </div>

        <p className="mt-1 text-[11px] font-medium text-[#7B8394]">{item.condition}</p>

        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-[#697286]">
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
