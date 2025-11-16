import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BookingPageClient from './BookingPageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Server-side data fetching
async function getBusinessData(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const response = await fetch(
      `${apiUrl}/booking-page/public/${slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch business data:', error);
    return null;
  }
}

// Dynamic metadata generation for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBusinessData(slug);

  if (!data || !data.business) {
    return {
      title: 'Business Not Found',
      description: 'The booking page you are looking for does not exist.',
    };
  }

  const { business, bookingPage } = data;

  return {
    title: bookingPage?.metaTitle || `${business.name} - Book an Appointment`,
    description:
      bookingPage?.metaDescription ||
      business.description ||
      `Book an appointment with ${business.name}. Professional ${business.category.toLowerCase()} services.`,
    openGraph: {
      title: bookingPage?.metaTitle || `${business.name} - Book an Appointment`,
      description:
        bookingPage?.metaDescription ||
        business.description ||
        `Book an appointment with ${business.name}`,
      images: bookingPage?.coverImage
        ? [{ url: bookingPage.coverImage }]
        : undefined,
    },
  };
}

// Server component - initial load is fast
export default async function BusinessBookingPage({ params }: Props) {
  const { slug } = await params;
  const data = await getBusinessData(slug);

  if (!data || !data.business) {
    notFound();
  }

  if (data.bookingPage?.enabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Unavailable
          </h1>
          <p className="text-gray-600">
            This business is not currently accepting online bookings.
          </p>
        </div>
      </div>
    );
  }

  // Pass data to client component for interactivity
  return (
    <BookingPageClient
      initialBusiness={data.business}
      initialServices={data.services}
      initialBookingPage={data.bookingPage}
      initialStaff={data.staff || []}
    />
  );
}
