import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { VT323 } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const pixelFont = VT323({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });

export const metadata: Metadata = {
  title: "Text2Form.ai — AI-Powered Form & Quiz Builder",
  description:
    "Create professional forms and quizzes in seconds using AI. Describe what you need in plain English, share with anyone, and track responses with live analytics.",
  keywords: [
    "AI form builder",
    "quiz generator",
    "AI quiz",
    "form creator",
    "survey builder",
  ],
  openGraph: {
    title: "Text2Form.ai — AI-Powered Form & Quiz Builder",
    description:
      "Create professional forms and quizzes in seconds using AI.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans antialiased", geist.variable, pixelFont.variable)}>
      <body className="bg-background text-foreground min-h-screen flex flex-col selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
