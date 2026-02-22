import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeArena - Master algorithms and compete globally",
  description: "Real-Time Competitive Programming Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
