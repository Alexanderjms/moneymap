import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import QueryProvider from "@/src/components/QueryProvider";
import { ThemeProvider } from "@/src/contexts/ThemeContext";
import ServiceWorkerRegister from "@/src/components/ServiceWorkerRegister";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "MoneyMap",
  description: "Control de finanzas personales",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
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
    <html lang="es" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem("moneymap_theme");
                if (t === "onyx" || t === "obsidian" || t === "esmeralda" || t === "rubi" || t === "grafito") {
                  document.documentElement.setAttribute("data-theme", t);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-neutral-950 font-sans text-neutral-100">
        <ServiceWorkerRegister />
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
