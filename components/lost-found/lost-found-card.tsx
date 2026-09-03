"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { LostFoundItem } from "@/lib/types";

interface LostFoundCardProps {
  item: LostFoundItem;
}

export function LostFoundCard({ item }: LostFoundCardProps) {
  const isClaimed = item.status === "claimed";
  const hasImage = Boolean(item.imageUrl);

  return (
    <Link
      href={`/lost-found/${item.id}`}
      className={`group block overflow-hidden rounded-2xl border border-[#E3DFD7] bg-[#FFFDF9] transition hover:-translate-y-0.5 hover:shadow-md ${
        isClaimed ? "opacity-60" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden bg-[#EEE9FF]">
        {hasImage ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 300px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EEE9FF] via-[#DCCFFF] to-[#F3D6E9]">
            <span className="text-xs font-semibold text-[#6952D7]">
              No photo
            </span>
          </div>
        )}

        {/* Lost / Found badge */}
        <span
          className={`absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
            item.type === "lost"
              ? "text-[#6952D7]"
              : "text-emerald-600"
          }`}
        >
          {item.type}
        </span>

        {/* Claimed badge */}
        {isClaimed && (
          <span className="absolute right-2 top-2 rounded-full bg-[#23265B]/90 px-2 py-1 text-[9px] font-semibold text-white">
            Claimed
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-[13px] font-bold text-[#172044]">
          {item.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-1">
          <MapPin size={11} className="shrink-0 text-[#858796]" />

          <p className="line-clamp-1 text-[10px] text-[#6D7184]">
            {item.location}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#EEEAE2] pt-2">
          <span className="line-clamp-1 text-[10px] font-medium text-[#596075]">
            {item.category}
          </span>

          <span className="shrink-0 text-[9px] text-[#858796]">
            {item.postedAgo}
          </span>
        </div>
      </div>
    </Link>
  );
}