import type { Metadata, Viewport } from "next";
import { Archivo, Atkinson_Hyperlegible } from "next/font/google";
import { brand } from "@/config/brand";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-archivo",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: { default: `${brand.name} · ${brand.slogan}`, template: `%s · ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: brand.colors.white,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${archivo.variable} ${atkinson.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
