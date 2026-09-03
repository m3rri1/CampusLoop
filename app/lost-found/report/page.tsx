"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ReportForm } from "@/components/lost-found/report-form";

function ReportPageContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "found" ? "found" : "lost";

  return <ReportForm type={type} />;
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
