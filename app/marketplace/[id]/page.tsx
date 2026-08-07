import { mockItems } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, BadgeCheck } from "lucide-react";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = mockItems.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-md md:max-w-2xl mx-auto bg-white min-h-screen md:shadow-sm">
        {/* Back button */}
        <div className="p-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600"
          >
            <ArrowLeft size={18} />
            Back to Marketplace
          </Link>
        </div>

        {/* Image */}
        <div className="relative w-full h-72 bg-gray-100">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
          <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {item.categoryLabel}
          </span>
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900">{item.title}</h1>
            <p className="text-xl font-bold text-[#6759FF] shrink-0">₹{item.price}</p>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <MapPin size={13} className="text-gray-400" />
            <p className="text-sm text-gray-500">{item.location}</p>
            <span className="text-gray-300 mx-1">·</span>
            <p className="text-sm text-gray-500">{item.postedAgo}</p>
          </div>

          <span className="inline-block mt-3 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
            {item.condition}
          </span>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-1.5">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          {/* Seller card */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Seller</h2>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#6759FF] text-white flex items-center justify-center text-sm font-semibold">
                  {item.sellerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-gray-900">{item.sellerName}</p>
                    {item.sellerVerified && (
                      <BadgeCheck size={14} className="text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <p className="text-xs text-gray-500">{item.sellerRating}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <button className="w-full mt-5 bg-[#6759FF] text-white font-semibold py-3.5 rounded-xl">
            Chat with Seller
          </button>
        </div>
      </div>
    </div>
  );
}