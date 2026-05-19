import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#6366f1',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://appassets.androidplatform.net'),
  title: "知识小勇士 - 闯关答题，快乐成长",
  description: "专为小朋友设计的趣味学习应用，包含数学、语文、英语三大科目练习。养宠物、赚金币、解锁成就，让学习变得更有趣！",
  keywords: ["知识小勇士", "儿童学习", "数学练习", "语文学习", "英语学习", "闯关答题", "宠物养成"],
  authors: [{ name: "知识小勇士" }],
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "知识小勇士 - 闯关答题，快乐成长",
    description: "专为小朋友设计的趣味学习应用，包含数学、语文、英语三大科目练习。",
    type: "website",
    images: ['/app-icon-1024.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "知识小勇士 - 闯关答题，快乐成长",
    description: "专为小朋友设计的趣味学习应用，包含数学、语文、英语三大科目练习。",
    images: ['/app-icon-1024.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '知识小勇士',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
