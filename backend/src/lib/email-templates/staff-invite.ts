export interface StaffInviteEmailParams {
  staffName: string;
  businessName: string;
  role?: string;
  inviteUrl: string;
  inviterName?: string;
}

export function generateStaffInviteEmail({
  staffName,
  businessName,
  role,
  inviteUrl,
  inviterName,
}: StaffInviteEmailParams): { subject: string; html: string; text: string } {
  const subject = `You've been invited to join ${businessName} on GlamBooking`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation - ${businessName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #9333ea 0%, #c026d3 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .role-badge {
      display: inline-block;
      background: #f3e8ff;
      color: #9333ea;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin: 10px 0 20px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #9333ea 0%, #c026d3 100%);
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .features {
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .features h3 {
      margin-top: 0;
      color: #1f2937;
      font-size: 16px;
    }
    .features ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #6b7280;
    }
    .features li {
      margin: 8px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      color: #6b7280;
      font-size: 14px;
    }
    .expiry-notice {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Welcome to the Team!</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${staffName},</p>
      
      <p class="message">
        ${inviterName ? `${inviterName} has invited` : 'You have been invited'} you to join <strong>${businessName}</strong> on GlamBooking.
        ${role ? `<br><br>You will be joining as:<br><span class="role-badge">${role}</span>` : ''}
      </p>

      <div style="text-align: center;">
        <a href="${inviteUrl}" class="cta-button">Accept Invitation & Join Team</a>
      </div>

      <div class="expiry-notice">
        ⚠️ <strong>Important:</strong> This invitation link expires in 24 hours. Please accept it soon to get started!
      </div>

      <div class="features">
        <h3>What you'll be able to do:</h3>
        <ul>
          <li>Manage your bookings and schedule</li>
          <li>View and update client information</li>
          <li>Access your personal calendar</li>
          <li>Collaborate with your team</li>
          <li>Track your performance and analytics</li>
        </ul>
      </div>

      <p class="message">
        GlamBooking is a powerful scheduling and booking platform designed to help beauty professionals manage their business efficiently.
      </p>

      <p class="message">
        If you have any questions, feel free to reach out to your team administrator or contact our support team.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>GlamBooking</strong></p>
      <p>Professional Beauty Business Management</p>
      <p style="margin-top: 15px; font-size: 12px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hi ${staffName},

${inviterName ? `${inviterName} has invited` : 'You have been invited'} you to join ${businessName} on GlamBooking.
${role ? `\nYou will be joining as: ${role}` : ''}

Accept your invitation by clicking this link:
${inviteUrl}

⚠️ IMPORTANT: This invitation link expires in 24 hours.

What you'll be able to do:
- Manage your bookings and schedule
- View and update client information
- Access your personal calendar
- Collaborate with your team
- Track your performance and analytics

GlamBooking is a powerful scheduling and booking platform designed to help beauty professionals manage their business efficiently.

If you have any questions, feel free to reach out to your team administrator or contact our support team.

---
GlamBooking
Professional Beauty Business Management

If you didn't expect this invitation, you can safely ignore this email.
  `;

  return { subject, html, text };
}
