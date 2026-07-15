import type { Metadata, Viewport } from "next";
import { Castoro, Mulish } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

// Meta (Facebook) Pixel — the clinic's existing pixel, overridable per deploy.
const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1309943261329384";

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
  title: "Free AI Skin Analysis · LaseMD Ultra · MEDfacials, Truro",
  description:
    "Take a 30-second AI skin scan and discover what LaseMD Ultra laser skin rejuvenation could do for your skin — with a personalised report and a £100 welcome voucher, doctor-led at MEDfacials, Truro.",
  openGraph: {
    title: "Reveal your skin's natural brilliance · MEDfacials",
    description:
      "A free 30-second AI skin analysis for LaseMD Ultra — personalised suitability report, plus a £100 welcome voucher on a course of 3 treatments at your free in-clinic consultation.",
    url: SITE_URL,
    siteName: "MEDfacials",
    locale: "en_GB",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff8ee",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${castoro.variable} ${mulish.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Meta Pixel base code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
