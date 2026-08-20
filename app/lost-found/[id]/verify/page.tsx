"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Camera, CheckCircle2, Copy, QrCode, ShieldCheck } from "lucide-react";
import { useState } from "react";

const reports: Record<string, { title: string; type: "lost" | "found" }> = {
  "1": { title: "Black AirPods case", type: "lost" },
  "2": { title: "Blue water bottle", type: "found" },
  "3": { title: "Student ID card", type: "lost" },
  "4": { title: "Scientific calculator", type: "found" },
  "5": { title: "Grey hoodie", type: "lost" },
  "6": { title: "USB drive", type: "found" },
};

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const report = reports[id];
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const verificationCode = `CL-${id.padStart(2, "0")}-7K4P`;
  const qrData = encodeURIComponent(`CAMPUSLOOP|${id}|${verificationCode}`);

  function copyCode() {
    navigator.clipboard?.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function verify() {
    if (code.trim().toUpperCase() === verificationCode) setVerified(true);
  }

  if (verified) {
    return (
      <main className="min-h-screen bg-[#EEECE5] px-4 py-5 text-[#172044]">
        <div className="mx-auto min-h-[calc(100vh-40px)] max-w-[520px] bg-[#FBF9F4] px-5 py-6 sm:px-8">
          <Link href={`/lost-found/${id}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#555C70]"><ArrowLeft size={16} /> Back to item</Link>
          <div className="mt-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E4F0E8] text-[#2E7650]"><CheckCircle2 size={31} /></div>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6952D7]">Verified</p>
            <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.05em]">Handover approved.</h1>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-[#6D7184]">The verification code matches <span className="font-bold text-[#30364E]">{report.title}</span>. You can now complete the handover safely on campus.</p>
            <Link href="/lost-found" className="mt-7 flex h-11 items-center justify-center rounded-[14px] bg-[#23265B] text-[12px] font-extrabold text-white">Back to Lost &amp; Found</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEECE5] text-[#172044]">
      <div className="mx-auto min-h-screen max-w-[1280px] bg-[#FBF9F4] px-5 py-5 sm:px-8 sm:py-7">
        <div className="mx-auto max-w-xl">
          <Link href={`/lost-found/${id}`} className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#555C70]"><ArrowLeft size={16} /> Back to item</Link>

          <div className="mt-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6952D7]">Safe handover</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-[1.08] tracking-[-0.055em]">Verify this item.</h1>
            <p className="mt-2.5 text-[13px] leading-5 text-[#6D7184]">Both students should verify the same code before the item changes hands.</p>
          </div>

          <div className="mt-6 rounded-[20px] border border-[#E2DED5] bg-[#FFFDF9] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8A8D99]">Report</p>
                <h2 className="mt-1 text-[16px] font-extrabold">{report.title}</h2>
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] ${report.type === "lost" ? "bg-[#EEE9FF] text-[#5A45C5]" : "bg-[#E5F1EA] text-[#32704F]"}`}>{report.type}</span>
              </div>
              <QrCode size={24} className="text-[#5D48D2]" />
            </div>

            <div className="mt-5 flex justify-center rounded-[16px] bg-white p-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${qrData}`}
                alt="CampusLoop verification QR code"
                width={220}
                height={220}
                className="h-[190px] w-[190px] sm:h-[220px] sm:w-[220px]"
              />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[12px] bg-[#F2EFFA] px-3.5 py-3">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#85889A]">Verification code</p><p className="mt-0.5 font-mono text-[14px] font-bold tracking-[0.12em] text-[#292F49]">{verificationCode}</p></div>
              <button onClick={copyCode} className="flex items-center gap-1.5 text-[10px] font-bold text-[#5D48D2]"><Copy size={13} /> {copied ? "Copied" : "Copy"}</button>
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-[#E3DFD7] bg-[#FFFDF9] p-4">
            <div className="flex items-start gap-3"><Camera size={18} className="mt-0.5 shrink-0 text-[#5D48D2]" /><div><h2 className="text-[12px] font-extrabold">Scan or enter the code</h2><p className="mt-1 text-[11px] leading-5 text-[#73788A]">Camera scanning will be connected to the live verification record when Supabase is added. For this prototype, enter the code shown above.</p></div></div>
            <div className="mt-4 flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CL-01-7K4P" className="h-11 min-w-0 flex-1 rounded-[13px] border border-[#DEDAD1] bg-[#FFFDF9] px-3.5 font-mono text-[12px] uppercase outline-none focus:border-[#8C7BDD]" />
              <button onClick={verify} className="h-11 rounded-[13px] bg-[#23265B] px-4 text-[11px] font-extrabold text-white">Verify</button>
            </div>
          </div>

          <div className="mt-5 flex gap-2.5 rounded-[16px] border border-[#E1DDD4] bg-[#F7F4EC] p-3.5"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#5D48D2]" /><p className="text-[10px] leading-5 text-[#74798A]">Only complete the handover in a safe campus location. Never share your verification code publicly.</p></div>
        </div>
      </div>
    </main>
  );
}
