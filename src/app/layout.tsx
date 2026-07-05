import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteScope — AI Website Audit",
  description: "AI-powered website security, frontend design, and legal compliance audit",
  alternates: {
    canonical: "https://sitescope.vercel.app",
  },
  openGraph: {
    title: "SiteScope — AI Website Audit",
    description: "AI-powered website security, frontend design, and legal compliance audit",
    url: "https://sitescope.vercel.app",
    siteName: "SiteScope",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteScope — AI Website Audit",
    description: "AI-powered website security, frontend design, and legal compliance audit",
  },
  other: {
    "theme-color": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#fff', background: '#0a0a0a' }}>
            <h1>SiteScope</h1>
            <p>JavaScript is required to use this application. Please enable JavaScript in your browser settings.</p>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
