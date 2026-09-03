"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function ReportItemForm() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "found" ? "found" : "lost";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <CheckCircle2
            size={48}
            className="text-emerald-500 mx-auto mb-4"
          />

          <h1 className="text-lg font-bold text-gray-900 mb-2">
            Report submitted
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            Your {type} item report has been recorded. Once Supabase is
            connected, this will save to the database and appear in the live
            feed.
          </p>

          <Link
            href="/lost-found"
            className="inline-block bg-[#6759FF] text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
          >
            Back to Lost &amp; Found
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen md:shadow-sm">
        <div className="p-4">
          <Link
            href="/lost-found"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>

        <div className="px-4 pb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Report {type === "lost" ? "a Lost" : "a Found"} Item
          </h1>

          <p className="text-sm text-gray-500 mb-5">
            Fill in the details below so other students can identify it.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Item title
              </label>

              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Black wallet"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#6759FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>

              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item, where it was lost/found, any identifying details..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#6759FF] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Location
              </label>

              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Library"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#6759FF]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#6759FF] text-white font-semibold py-3.5 rounded-xl mt-2"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ReportItemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }
    >
      <ReportItemForm />
    </Suspense>
  );
}