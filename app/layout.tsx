import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISO Exercise Calculator",
  description: "Estimate AMT implications when exercising incentive stock options.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
