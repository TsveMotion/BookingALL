import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans - GlamBooking for Beauticians | Simple, Transparent Pricing",
  description: "Choose the perfect plan for your beauty business. Start free with up to 50 bookings/month. Upgrade to Starter (£29/month) or Pro (£59/month) as you grow. No hidden fees, cancel anytime.",
  keywords: "beautician pricing, beauty salon software pricing, salon booking costs, beauty appointment software, affordable salon software, beauty business pricing, GlamBooking pricing",
  authors: [{ name: "GlamBooking" }],
  openGraph: {
    title: "Simple, Transparent Pricing for Beauticians",
    description: "Start free, upgrade as you grow. No commission fees. Plans from £0 to £59/month for beauty professionals.",
    url: "https://beauticians.glambooking.co.uk/pricing",
    siteName: "GlamBooking for Beauticians",
    type: "website",
    images: [
      {
        url: "/og-pricing.png",
        width: 1200,
        height: 630,
        alt: "GlamBooking Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Simple Pricing for Beauty Professionals",
    description: "Start free, upgrade as you grow. No commission on bookings.",
    images: ["/og-pricing.png"],
  },
  alternates: {
    canonical: "https://beauticians.glambooking.co.uk/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "GlamBooking for Beauticians",
            "applicationCategory": "BusinessApplication",
            "offers": [
              {
                "@type": "Offer",
                "name": "Free Plan",
                "price": "0",
                "priceCurrency": "GBP",
                "description": "Perfect for getting started with up to 50 bookings per month",
              },
              {
                "@type": "Offer",
                "name": "Starter Plan",
                "price": "29.00",
                "priceCurrency": "GBP",
                "billingIncrement": "P1M",
                "description": "For growing beauty businesses with unlimited bookings",
              },
              {
                "@type": "Offer",
                "name": "Pro Plan",
                "price": "59.00",
                "priceCurrency": "GBP",
                "billingIncrement": "P1M",
                "description": "For established beauty professionals with advanced features",
              },
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2847",
            },
          }),
        }}
      />
      {children}
    </>
  );
}
