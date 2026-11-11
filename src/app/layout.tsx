import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Nunito } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
const sans = Nunito({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = { title: "A Little Surprise For My Ammu 💗", description: "A little world, made with care.", robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#23152F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${serif.variable} ${script.variable} ${sans.variable}`}><body>{children}</body></html>);
}
