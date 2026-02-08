import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SilentRide - Xem phim miễn phí",
    template: "%s | SilentRide",
  },
  description: "Website xem phim miễn phí với chất lượng cao. Phim lẻ, phim bộ, hoạt hình mới nhất.",
  keywords: ["xem phim", "phim online", "phim miễn phí", "phim hay", "phim bộ", "phim lẻ"],
  authors: [{ name: "SilentRide" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "SilentRide",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 pt-16 md:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
