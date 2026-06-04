import type { Metadata } from "next";
import { Castoro, Mulish } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

const castoro = Castoro({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-castoro",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Is Endolift right for you? · MEDfacials, Truro",
  description:
    "A 60-second suitability guide for Endolift — Cornwall's certified non-surgical skin-tightening treatment with Dr Joe Stolte at MEDfacials, Truro.",
  openGraph: {
    title: "Discover if Endolift is right for you · MEDfacials",
    description:
      "Take the 60-second Endolift suitability analysis with Cornwall's only certified Endolift provider.",
    url: SITE_URL,
    siteName: "MEDfacials",
    locale: "en_GB",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${castoro.variable} ${mulish.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
