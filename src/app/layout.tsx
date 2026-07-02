import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteScope — AI 网站审查",
  description: "AI 驱动的网站安全、前端设计、法务合规全面审查服务",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
