import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProviderWrap from "@/components/ThemeProviderWrap";

export const metadata: Metadata = {
  title: "PYL84Y",
  description: "Chat, Voice & Video Calls — Real-time communication platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProviderWrap>{children}</ThemeProviderWrap>
      </body>
    </html>
  );
}
