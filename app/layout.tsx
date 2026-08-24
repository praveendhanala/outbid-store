import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
