import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Lakshmi Steels AI | Automated Data Cleaning, ETL, & Business Intelligence Dashboards",
  description: "Lakshmi Steels AI is a premium, AI-powered platform that automatically cleans Excel/CSV datasets, builds visual dashboards, forecasts predictions, and generates downloadable reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${outfit.variable} h-full antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
