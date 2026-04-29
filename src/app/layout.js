import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
