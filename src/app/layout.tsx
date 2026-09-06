import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ganpati Metals",
  description: "Ganpati Metals — shop management",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="no-print border-b border-border bg-surface">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-copper-dark">
              <span className="inline-block h-8 w-8 rounded-full bg-copper text-white grid place-items-center text-sm font-bold">
                GM
              </span>
              Ganpati Metals
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link href="/billing" className="px-3 py-2 rounded-lg hover:bg-background">
                New Bill
              </Link>
              <Link href="/catalog" className="px-3 py-2 rounded-lg hover:bg-background">
                Item Catalog
              </Link>
              <Link href="/sales" className="px-3 py-2 rounded-lg hover:bg-background">
                Sales History
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
