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
        <Script id="naver-init" strategy="beforeInteractive">
            {`
        window.__naverLoaded = false;
        window.initNaver = function () {
          window.__naverLoaded = true;
          console.log("NAVER SDK LOADED");
        };
      `}
        </Script>

        <Script
            src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=qq057qny2t&libraries=services&callback=initNaver`}
            strategy="afterInteractive"
        />
        {children}
        </body>
        </html>
    );
}

