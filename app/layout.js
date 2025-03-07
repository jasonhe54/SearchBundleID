import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BundleSearch",
  description: "Search for App Store apps by Bundle ID, App ID, or get a list of apps by Developer ID.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: 'BundleSearch',
    description: 'Search for App Store apps by Bundle ID, App ID, or get a list of apps by Developer ID.',
    url: 'https://bundlesearch.he54.me',
    siteName: 'BundleSearch',
    images: [
      {
        url: 'https://bundlesearch.he54.me/og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};


// TOAST DOCS: https://sonner.emilkowal.ski
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
