import { mockItems } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MapPin,
  Share2,
  Star,
} from "lucide-react";

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
    <main className="min-h-screen bg-[#F7F7F4] text-[#17233D]">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-[#F7F7F4] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#E1E2E6] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#4D5870] transition-colors hover:border-[#CFC5F4] hover:text-[#6546D9]"
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            Marketplace
          </Link>

          <div className="flex items-center gap-2">
            <button
              aria-label="Share listing"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1E2E6] bg-white text-[#4D5870] transition-colors hover:border-[#CFC5F4] hover:text-[#6546D9]"
            >
              <Share2 size={16} strokeWidth={1.8} />
            </button>
            <button
              aria-label="Save listing"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E1E2E6] bg-white text-[#4D5870] transition-colors hover:border-[#CFC5F4] hover:text-[#6546D9]"
            >
              <Heart size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[26px] border border-[#E7E5E0] bg-white shadow-[0_8px_35px_rgba(23,35,61,0.06)] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
          {/* Product image */}
          <div className="relative aspect-[1/0.92] min-h-[300px] overflow-hidden bg-[#EDEBF0] sm:aspect-[1.25/1] lg:aspect-auto lg:min-h-[650px]">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
              priority
            />

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#17233D]/20 to-transparent" />

            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#17233D] shadow-sm backdrop-blur-sm">
              {item.categoryLabel}
            </span>
          </div>

          {/* Listing information */}
          <div className="flex flex-col p-5 sm:p-7 lg:p-9">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#6546D9]">
                  Campus marketplace
                </p>
                <h1 className="text-[24px] font-extrabold leading-[1.12] tracking-[-0.035em] text-[#17233D] sm:text-[29px]">
                  {item.title}
                </h1>
              </div>
              <p className="shrink-0 pt-5 text-[20px] font-extrabold tracking-[-0.03em] text-[#6546D9] sm:text-[23px]">
                ₹{item.price}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-[#737C8F]">
              <MapPin size={14} className="text-[#6546D9]" strokeWidth={1.8} />
              <span>{item.location}</span>
              <span className="text-[#D2D4D9]">•</span>
              <span>{item.postedAgo}</span>
            </div>

            <span className="mt-4 w-fit rounded-full border border-[#D9E7DF] bg-[#F0F8F4] px-3 py-1.5 text-[11px] font-bold capitalize text-[#39735A]">
              {item.condition}
            </span>

            <div className="my-6 h-px bg-[#ECECE8]" />

            <section>
              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#17233D]">
                Description
              </h2>
              <p className="mt-2.5 text-[13px] leading-6 text-[#697286]">
                {item.description}
              </p>
            </section>

            <div className="my-6 h-px bg-[#ECECE8]" />

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#17233D]">
                  Seller
                </h2>
                <span className="text-[10px] font-semibold text-[#9298A4]">
                  Campus member
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8E8E5] bg-[#FAFAF8] p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8E3FF] text-[14px] font-extrabold text-[#6546D9]">
                    {item.sellerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[13px] font-bold text-[#17233D]">
                        {item.sellerName}
                      </p>
                      {item.sellerVerified && (
                        <BadgeCheck
                          size={14}
                          className="shrink-0 text-[#6546D9]"
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Star
                        size={11}
                        className="fill-[#F2B01E] text-[#F2B01E]"
                      />
                      <span className="text-[11px] font-semibold text-[#697286]">
                        {item.sellerRating}
                      </span>
                      <span className="text-[10px] text-[#B4B8C0]">
                        seller rating
                      </span>
                    </div>
                  </div>
                </div>

                <span className="hidden shrink-0 rounded-full bg-[#EDE9FF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#6546D9] sm:block">
                  Verified
                </span>
              </div>
            </section>

            <div className="mt-auto pt-6">
              <button className="w-full rounded-2xl bg-[#6546D9] py-3.5 text-[13px] font-extrabold text-white shadow-[0_8px_22px_rgba(101,70,217,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#5839C8]">
                Chat with Seller
              </button>
              <p className="mt-2.5 text-center text-[10px] font-medium text-[#969BA6]">
                Keep conversations and exchanges within your campus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
