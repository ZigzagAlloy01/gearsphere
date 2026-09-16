import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "../components/ui/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GearSphere",
  description: "Equipment rental marketplace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-gearsphere" content="GearSphere" />
        <title>GearSphere</title>
      </head>
      <body className={inter.className}>

        {children}
      </body>
      <Footer />
    </html>
  );
}
