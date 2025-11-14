import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GlamBooking for Beauticians - Beauty Booking Software",
  description: "The ultimate booking platform designed specifically for beauticians. Manage your beauty appointments, clients, and grow your business with ease.",
  keywords: "beautician booking, beauty salon software, beauty appointments, salon management, beauty business",
  authors: [{ name: "GlamBooking" }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "GlamBooking for Beauticians",
    description: "Streamline your beauty business with our powerful booking platform",
    url: "https://beauticians.glambooking.co.uk",
    siteName: "GlamBooking for Beauticians",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlamBooking for Beauticians",
    description: "Streamline your beauty business with our powerful booking platform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
