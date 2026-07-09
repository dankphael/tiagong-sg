import { Geist, Geist_Mono, Cormorant_Garamond, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: "tiagong.sg",
  description: "Connect with Sin Sehs and learn Chinese dialects",
  icons: {
    icon: { url: "/logo/08-app-icon-large.png", type: "image/png" },
    apple: { url: "/logo/08-app-icon-large.png", type: "image/png" },
  },
  openGraph: {
    title: "tiagong.sg",
    description: "Preserve Singapore's Chinese dialect heritage",
    images: [{ url: "/logo/01-vertical-dark-bg.png", width: 800, height: 600, alt: "tiagong.sg" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${notoSerifSC.variable}`}
    >
      <body className="app-shell">{children}</body>
    </html>
  );
}
