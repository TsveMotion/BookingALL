import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GlamBooking - Beauty & Wellness Booking Platform",
  description: "The ultimate booking platform for beauty professionals, hairdressers, barbers, and wellness businesses. Streamline your appointments, grow your business.",
  keywords: "beauty booking, salon software, appointment booking, hairdresser booking, barber booking, wellness booking",
  authors: [{ name: "GlamBooking" }],
  openGraph: {
    title: "GlamBooking - Beauty & Wellness Booking Platform",
    description: "Streamline your beauty business with our powerful booking platform",
    url: "https://glambooking.co.uk",
    siteName: "GlamBooking",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlamBooking - Beauty & Wellness Booking Platform",
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
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
