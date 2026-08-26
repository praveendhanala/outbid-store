import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-0STHERHKP9";

export const metadata: Metadata = {
  title: "outbid.store",
  description:
    "No ads, no revenue share. Just outbid your competitors to rank #1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
          `}
        </Script>

      </body>
    </html>
  );
}
