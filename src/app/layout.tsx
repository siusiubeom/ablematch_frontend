import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});





export const metadata: Metadata = {
    title: "AbleMatch",
    description: "AbleMatch",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" className="light">
        <body className="bg-gray-50 text-gray-900">
        {children}

        <Script
            src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=qq057qny2t&submodules=geocoder`}
            strategy="afterInteractive"
        />
        </body>
        </html>
    );
}

