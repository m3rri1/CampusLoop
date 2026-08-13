"use client";

import Link from "next/link";
import { ArrowLeft, ImagePlus, MapPin, Upload } from "lucide-react";
import { useState } from "react";

type ReportType = "lost" | "found";

interface ReportFormProps {
  type: ReportType;
}

const categories = ["Electronics", "Documents", "Study", "Personal", "Clothing", "Other"];

export function ReportForm({ type }: ReportFormProps) {
  const isLost = type === "lost";
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
        <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-2xl">
            <Link href="/lost-found" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075] hover:text-[#5141A9]">
              <ArrowLeft size={16} /> Back to Lost &amp; Found
            </Link>
            <div className="mt-16 rounded-[24px] border border-[#E3DFD7] bg-[#FFFDF9] p-7 text-center shadow-[0_8px_30px_rgba(23,32,68,0.05)] sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEE9FF] text-[#5D48D2]">
                <ImagePlus size={25} strokeWidth={1.8} />
              </div>
              <h1 className="mt-5 text-[25px] font-bold tracking-[-0.045em]">Report submitted</h1>
              <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-[#6D7184]">
                Your {type} report is ready. Once Supabase is connected, this form will save it to your campus reports.
              </p>
              <Link href="/lost-found" className="mt-6 inline-flex h-11 items-center justify-center rounded-[14px] bg-[#23265B] px-5 text-[12px] font-bold text-white">
                View Lost &amp; Found
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 pb-14 pt-5 sm:px-8 sm:pt-7">
        <div className="mx-auto max-w-3xl">
          <Link href="/lost-found" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#596075] hover:text-[#5141A9]">
            <ArrowLeft size={16} /> Back to Lost &amp; Found
          </Link>

          <div className="mt-7 border-b border-[#E3DFD7] pb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6952D7]">Lost &amp; Found</p>
            <h1 className="mt-1 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">
              {isLost ? "Report something you lost." : "Report something you found."}
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-[#6D7184]">
              Add the details students need to identify the item and get it back to the right person.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-7">
            <section>
              <h2 className="text-[15px] font-bold">Item details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Item name</span>
                  <input required name="title" placeholder={isLost ? "e.g. Black AirPods case" : "e.g. Blue water bottle"} className="h-11 w-full rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 text-[13px] outline-none transition focus:border-[#8C7BDD]" />
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Category</span>
                  <select required name="category" defaultValue="" className="h-11 w-full rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 text-[13px] text-[#343A56] outline-none focus:border-[#8C7BDD]">
                    <option value="" disabled>Select category</option>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Date</span>
                  <input required type="date" name="date" className="h-11 w-full rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 text-[13px] text-[#343A56] outline-none focus:border-[#8C7BDD]" />
                </label>
              </div>
            </section>

            <section className="border-t border-[#E8E4DB] pt-7">
              <h2 className="text-[15px] font-bold">{isLost ? "Where did you lose it?" : "Where did you find it?"}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Location</span>
                  <div className="flex h-11 items-center gap-2 rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 focus-within:border-[#8C7BDD]">
                    <MapPin size={15} className="text-[#858796]" />
                    <input required name="location" placeholder="e.g. Central Library, Block B" className="w-full bg-transparent text-[13px] outline-none placeholder:text-[#A0A0A8]" />
                  </div>
                </label>
                <label>
                  <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Approx. time</span>
                  <input type="time" name="time" className="h-11 w-full rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 text-[13px] text-[#343A56] outline-none focus:border-[#8C7BDD]" />
                </label>
                <label>
                  <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Specific area <span className="font-medium text-[#9698A3]">(optional)</span></span>
                  <input name="area" placeholder="e.g. 2nd floor, near entrance" className="h-11 w-full rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 text-[13px] outline-none focus:border-[#8C7BDD]" />
                </label>
              </div>
            </section>

            <section className="border-t border-[#E8E4DB] pt-7">
              <h2 className="text-[15px] font-bold">Help identify it</h2>
              <label className="mt-4 block">
                <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Description</span>
                <textarea required name="description" rows={4} placeholder={isLost ? "Mention colour, brand, case, stickers, marks or anything else that can help someone identify it." : "Mention colour, brand, condition or any details that can help the owner identify it."} className="w-full resize-none rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 py-3 text-[13px] leading-5 outline-none focus:border-[#8C7BDD]" />
              </label>

              <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-[#CFC9E3] bg-[#F7F4FC] px-5 text-center hover:bg-[#F3EFFB]">
                <Upload size={19} className="text-[#6952D7]" />
                <span className="mt-2 text-[12px] font-bold text-[#343A56]">Add a photo</span>
                <span className="mt-1 text-[10px] text-[#858796]">A clear photo makes the item easier to identify.</span>
                <input type="file" accept="image/*" className="sr-only" />
              </label>
            </section>

            <section className="border-t border-[#E8E4DB] pt-7">
              <h2 className="text-[15px] font-bold">Contact</h2>
              <p className="mt-1 text-[11px] text-[#858796]">Your campus account will be used once authentication is connected.</p>
              <label className="mt-4 block">
                <span className="mb-2 block text-[11px] font-bold text-[#343A56]">Contact note <span className="font-medium text-[#9698A3]">(optional)</span></span>
                <input name="contact" placeholder="e.g. Message me through CampusLoop" className="h-11 w-full rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 text-[13px] outline-none focus:border-[#8C7BDD]" />
              </label>
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E8E4DB] pt-6 sm:flex-row sm:justify-end">
              <Link href="/lost-found" className="flex h-11 items-center justify-center rounded-[14px] border border-[#DEDAD1] bg-[#FFFDF9] px-5 text-[12px] font-bold text-[#4F5366]">Cancel</Link>
              <button type="submit" className="flex h-11 items-center justify-center rounded-[14px] bg-[#23265B] px-6 text-[12px] font-bold text-white hover:bg-[#1D204F]">
                Submit {isLost ? "lost" : "found"} report
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
