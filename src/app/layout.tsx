import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteScope — AI Website Audit",
  description: "AI-powered website security, frontend design, and legal compliance audit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
