import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import QueryProvider from "@/src/components/QueryProvider";
import TitleBar from "@/src/components/TitleBar";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "MoneyMap",
  description: "Control de finanzas personales",
  icons: { icon: "/favicon.svg", apple: "/logo-header.svg" },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-screen bg-neutral-950 font-sans text-neutral-100">
        <TitleBar />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
