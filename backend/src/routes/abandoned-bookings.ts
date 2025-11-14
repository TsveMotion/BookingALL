import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { sendAbandonedBookingEmail } from '../lib/email';

const router = Router();

// Check for abandoned bookings and send reminder emails
// This endpoint should be called by a cron job every 15-30 minutes
router.post('/check', async (req, res: Response) => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find bookings created 10+ minutes ago but not paid, and not older than 1 hour
    const abandonedBookings = await prisma.booking.findMany({
      where: {
        paymentStatus: 'PENDING',
        status: 'PENDING',
        createdAt: {
          gte: oneHourAgo,
          lte: tenMinutesAgo,
        },
        // Check if we haven't already sent an abandoned email
        // You could add an 'abandonedEmailSent' field to track this
      },
      include: {
        client: true,
        service: true,
        business: true,
      },
      take: 50, // Process in batches
    });

    const emailsSent: string[] = [];
    const emailsFailed: string[] = [];

    for (const booking of abandonedBookings) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BOOKING_URL || 'http://localhost:3002';
        const bookingUrl = `${baseUrl}/business/${booking.business.slug}/checkout?bookingId=${booking.id}`;

        await sendAbandonedBookingEmail(booking.client.email, {
          clientName: booking.client.name,
          serviceName: booking.service.name,
          startTime: booking.startTime,
          businessName: booking.business.name,
          bookingUrl,
        });

        emailsSent.push(booking.id);
        
        // Optional: Mark that we sent the email
        // await prisma.booking.update({
        //   where: { id: booking.id },
        //   data: { abandonedEmailSent: true }
        // });
      } catch (emailError) {
        console.error(`Failed to send abandoned email for booking ${booking.id}:`, emailError);
        emailsFailed.push(booking.id);
      }
    }

    res.json({
      success: true,
      checked: abandonedBookings.length,
      emailsSent: emailsSent.length,
      emailsFailed: emailsFailed.length,
      sentTo: emailsSent,
    });
  } catch (error) {
    console.error('Check abandoned bookings error:', error);
    res.status(500).json({ error: 'Failed to check abandoned bookings' });
  }
});

export default router;
