import { Resend } from 'resend';
import { config } from '../config';

const resend = new Resend(config.email.resendApiKey);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || config.email.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Email templates
export function getVerificationEmailTemplate(verificationUrl: string, name?: string) {
  return {
    subject: 'Verify your email - GlamBooking',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #EC4899 0%, #9333EA 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">GlamBooking</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
            <p>Hi ${name || 'there'}!</p>
            <p>Thank you for signing up with GlamBooking. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #EC4899 0%, #9333EA 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you didn't create an account with GlamBooking, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name || 'there'}! Thank you for signing up with GlamBooking. Please verify your email by visiting: ${verificationUrl}`,
  };
}

export function getPasswordResetEmailTemplate(resetUrl: string, name?: string) {
  return {
    subject: 'Reset your password - GlamBooking',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #EC4899 0%, #9333EA 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">GlamBooking</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p>Hi ${name || 'there'}!</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #EC4899 0%, #9333EA 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name || 'there'}! Reset your password by visiting: ${resetUrl}. This link will expire in 1 hour.`,
  };
}

export function getBookingConfirmationEmailTemplate(booking: {
  clientName: string;
  serviceName: string;
  startTime: Date;
  businessName: string;
  location?: string;
}) {
  const dateStr = booking.startTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = booking.startTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    subject: `Booking Confirmed - ${booking.serviceName} at ${booking.businessName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #EC4899 0%, #9333EA 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✓ Booking Confirmed</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${booking.clientName}!</h2>
            <p>Your booking has been confirmed. We look forward to seeing you!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #EC4899;">Booking Details</h3>
              <p><strong>Service:</strong> ${booking.serviceName}</p>
              <p><strong>Business:</strong> ${booking.businessName}</p>
              ${booking.location ? `<p><strong>Location:</strong> ${booking.location}</p>` : ''}
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Time:</strong> ${timeStr}</p>
            </div>
            <p style="color: #666; font-size: 14px;">Please arrive 5 minutes before your appointment time.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">Need to reschedule or cancel? Contact us directly.</p>
          </div>
        </body>
      </html>
    `,
    text: `Booking confirmed! Service: ${booking.serviceName} at ${booking.businessName} on ${dateStr} at ${timeStr}`,
  };
}

export async function sendVerificationEmail(to: string, verificationUrl: string, name?: string) {
  const template = getVerificationEmailTemplate(verificationUrl, name);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, name?: string) {
  const template = getPasswordResetEmailTemplate(resetUrl, name);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendBookingConfirmationEmail(to: string, booking: Parameters<typeof getBookingConfirmationEmailTemplate>[0]) {
  const template = getBookingConfirmationEmailTemplate(booking);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export function getAbandonedBookingEmailTemplate(booking: {
  clientName: string;
  serviceName: string;
  startTime: Date;
  businessName: string;
  bookingUrl: string;
}) {
  const dateStr = booking.startTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = booking.startTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    subject: `Complete Your Booking - ${booking.serviceName} at ${booking.businessName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Booking</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #EC4899 0%, #9333EA 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">⏰ Complete Your Booking</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${booking.clientName}!</h2>
            <p>You recently started booking an appointment but didn't complete the payment.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #EC4899;">Your Pending Booking</h3>
              <p><strong>Service:</strong> ${booking.serviceName}</p>
              <p><strong>Business:</strong> ${booking.businessName}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Time:</strong> ${timeStr}</p>
            </div>
            <p>This time slot is still available! Complete your booking now to secure your appointment.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${booking.bookingUrl}" style="background: linear-gradient(135deg, #EC4899 0%, #9333EA 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Complete Booking</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you no longer wish to book this appointment, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${booking.clientName}! Complete your booking for ${booking.serviceName} at ${booking.businessName} on ${dateStr} at ${timeStr}. Visit: ${booking.bookingUrl}`,
  };
}

export async function sendAbandonedBookingEmail(to: string, booking: Parameters<typeof getAbandonedBookingEmailTemplate>[0]) {
  const template = getAbandonedBookingEmailTemplate(booking);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendStaffInviteEmail(to: string, params: {
  staffName: string;
  businessName: string;
  role?: string;
  inviteUrl: string;
  inviterName?: string;
}) {
  const { generateStaffInviteEmail } = await import('./email-templates/staff-invite');
  const template = generateStaffInviteEmail(params);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendBookingConfirmationEmail, sendAbandonedBookingEmail, sendStaffInviteEmail };
