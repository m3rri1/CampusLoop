import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/app-header";
import AppNavigation from "@/components/app-navigation";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusLoop",
  description: "Everything happening around your campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#EEECE5] text-[#17151C] font-sans">

        <AppHeader />

        {children}

        <AppNavigation />

      </body>
    </html>
  );
}