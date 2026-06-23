import type { Metadata } from "next";
import {
  Geist,
  Chakra_Petch,
  Zen_Old_Mincho,
  Azeret_Mono,
} from "next/font/google";
import "./globals.css";

// Body / UI — neutral grotesque for readable data and effect text.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

// Display — condensed techno headline face (the neo-mirai signature).
const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Serif accent — Japanese-roman serif for editorial italic taglines + card names.
const zen = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
});

// Mono — technical labels, coordinates, meta.
const azeret = Azeret_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcana — Yu-Gi-Oh! Card Gallery",
  description:
    "A cinematic, neo-Japanese gallery for the entire Yu-Gi-Oh! card pool — browse, filter, and admire the art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${chakra.variable} ${zen.variable} ${azeret.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
