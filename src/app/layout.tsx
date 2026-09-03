import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CopyCodeEnhancer from "@/components/CopyCodeEnhancer";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edimar Gabriel — Security & Dev",
  description: "Estudante de Sistemas de Informação, desenvolvedor back-end e entusiasta de segurança ofensiva. CTF, pentest, writeups e projetos técnicos.",
  keywords: ["pentest", "CTF", "segurança ofensiva", "web hacking", "OWASP", "HackTheBox", "writeup", "Edimar Gabriel"],
  authors: [{ name: "Edimar Gabriel" }],
  openGraph: {
    title: "Edimar Gabriel — Security & Dev",
    description: "Estudante de Sistemas de Informação, desenvolvedor back-end e entusiasta de segurança ofensiva.",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/img/avatar.png",
        width: 400,
        height: 400,
        alt: "Edimar Gabriel",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Edimar Gabriel — Security & Dev",
    description: "Estudante de Sistemas de Informação, desenvolvedor back-end e entusiasta de segurança ofensiva.",
    images: ["/img/avatar.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <CopyCodeEnhancer />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
