"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, PackagePlus } from "lucide-react";
import { ReportForm } from "@/components/lost-found/report-form";

function ReportPageContent() {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type");

  if (requestedType !== "lost" && requestedType !== "found") {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/lost-found"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075] hover:text-[#5141A9]"
            >
              <ArrowLeft size={16} />
              Back to Lost &amp; Found
            </Link>

            <div className="mt-14">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">
                Lost &amp; Found
              </p>

              <h1 className="mt-2 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">
                What happened to the item?
              </h1>

              <p className="mt-2 max-w-lg text-[13px] leading-5 text-[#6D7184]">
                Choose the type of report you want to create.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href="/lost-found/report?type=lost"
                className="group rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(23,32,68,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#EEE9FF] text-[#5D48D2]">
                  <Search size={20} />
                </div>
                <h2 className="mt-5 text-[16px] font-bold">I lost something</h2>
                <p className="mt-1.5 text-[12px] leading-5 text-[#6D7184]">
                  Tell other students what you lost and where you last had it.
                </p>
                <span className="mt-5 inline-flex text-[11px] font-bold text-[#5D48D2]">
                  Report lost item →
                </span>
              </Link>

              <Link
                href="/lost-found/report?type=found"
                className="group rounded-[20px] border border-[#E3DFD7] bg-[#FFFDF9] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(23,32,68,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#E7F4EA] text-[#287A47]">
                  <PackagePlus size={20} />
                </div>
                <h2 className="mt-5 text-[16px] font-bold">I found something</h2>
                <p className="mt-1.5 text-[12px] leading-5 text-[#6D7184]">
                  Help the owner find their item by reporting where you found it.
                </p>
                <span className="mt-5 inline-flex text-[11px] font-bold text-[#287A47]">
                  Report found item →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <ReportForm type={requestedType} />;
}

export default function ReportItemPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
          <div className="mx-auto flex min-h-screen max-w-[1280px] items-center justify-center bg-[#FBF9F4]">
            <p className="text-sm font-semibold text-[#6D7184]">Loading...</p>
          </div>
        </main>
      }
    >
      <ReportPageContent />
    </Suspense>
  );
}
