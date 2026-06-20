import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { name, email, date, slot, meetLink } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is missing');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'Sarkari Dermatologist <appointments@sarkaridermatologist.com>',
      to: [email],
      subject: 'Appointment Confirmed - Sarkari Dermatologist',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #000000;
              color: #ffffff;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              border-radius: 16px;
              overflow: hidden;
            }
            .header {
              background-color: #2563eb;
              padding: 40px 20px;
              text-align: center;
            }
            .header img {
              width: 80px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 800;
              letter-spacing: -0.02em;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 25px;
              color: #e2e8f0;
            }
            .main-text {
              line-height: 1.6;
              color: #94a3b8;
              margin-bottom: 30px;
            }
            .details-card {
              background-color: #1a1a1a;
              border-radius: 12px;
              padding: 25px;
              margin-bottom: 30px;
              border: 1px solid #333;
            }
            .detail-row {
              display: flex;
              margin-bottom: 12px;
            }
            .detail-label {
              width: 100px;
              color: #64748b;
              font-weight: 600;
            }
            .detail-value {
              color: #f1f5f9;
            }
            .instruction-header {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 15px;
              color: #f8fafc;
            }
            .instruction-text {
              font-size: 14px;
              color: #94a3b8;
              margin-bottom: 25px;
            }
            .cta-button {
              display: inline-block;
              background-color: #0d9488;
              color: #ffffff !important;
              padding: 14px 30px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 700;
              font-size: 16px;
              margin-bottom: 25px;
            }
            .link-display {
              font-size: 13px;
              color: #64748b;
              word-break: break-all;
              margin-bottom: 25px;
            }
            .cancel-note {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 30px;
            }
            .footer {
              padding: 30px;
              text-align: center;
              border-top: 1px solid #333;
              color: #475569;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 15px;">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"></path>
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
                <circle cx="20" cy="10" r="2"></circle>
              </svg>
              <h1>Appointment<br/>Confirmed</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hello ${name},</p>
              <p class="main-text">Your appointment with <b>Sarkari Dermatologist</b> has been successfully booked. We're looking forward to helping you with your skin health.</p>
              
              <div class="details-card">
                <table width="100%">
                  <tr>
                    <td width="100" style="color: #64748b; font-weight: 600; padding: 5px 0;">Date:</td>
                    <td style="color: #f1f5f9; padding: 5px 0;">${date}</td>
                  </tr>
                  <tr>
                    <td width="100" style="color: #64748b; font-weight: 600; padding: 5px 0;">Time:</td>
                    <td style="color: #f1f5f9; padding: 5px 0;">${slot}</td>
                  </tr>
                  <tr>
                    <td width="100" style="color: #64748b; font-weight: 600; padding: 5px 0;">Mode:</td>
                    <td style="color: #f1f5f9; padding: 5px 0;">Video Consultation</td>
                  </tr>
                </table>
              </div>

              <h2 class="instruction-header">How to join your consultation:</h2>
              <p class="instruction-text">At the scheduled time, click the button below to join the Google Meet session. Please ensure your camera and microphone are working correctly.</p>

              <center>
                <a href="${meetLink}" class="cta-button">Join Google Meet</a>
              </center>

              <p class="link-display">Meeting Link:<br/>${meetLink}</p>

              <p class="cancel-note">If you need to reschedule or cancel, please visit your dashboard at least 2 hours before the appointment.</p>

              <p style="color: #f1f5f9; margin-bottom: 5px;">Stay healthy,</p>
              <p style="color: #f1f5f9; font-weight: 700; margin: 0;">The Sarkari Dermatologist Team</p>
            </div>

            <div class="footer">
              &copy; 2026 Sarkari Dermatologist. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Notify the doctor via a custom formatted email
    try {
      await resend.emails.send({
        from: 'Sarkari Dermatologist <appointments@sarkaridermatologist.com>',
        to: ['sarkaridermatologist@gmail.com'],
        subject: `New Appointment Scheduled - ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #000000;
                color: #ffffff;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                border-radius: 16px;
                overflow: hidden;
              }
              .header {
                background-color: #0f766e;
                padding: 40px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -0.02em;
              }
              .content {
                padding: 40px 30px;
              }
              .greeting {
                font-size: 18px;
                margin-bottom: 25px;
                color: #e2e8f0;
              }
              .main-text {
                line-height: 1.6;
                color: #94a3b8;
                margin-bottom: 30px;
              }
              .details-card {
                background-color: #1a1a1a;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
                border: 1px solid #333;
              }
              .cta-button {
                display: inline-block;
                background-color: #0d9488;
                color: #ffffff !important;
                padding: 14px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
                font-size: 16px;
                margin-bottom: 25px;
              }
              .link-display {
                font-size: 13px;
                color: #64748b;
                word-break: break-all;
                margin-bottom: 25px;
              }
              .footer {
                padding: 30px;
                text-align: center;
                border-top: 1px solid #333;
                color: #475569;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>New Appointment<br/>Scheduled</h1>
              </div>
              
              <div class="content">
                <p class="greeting">Hello Dr. Reetika Pal,</p>
                <p class="main-text">A new patient has scheduled a teleconsultation with you. Here are the details:</p>
                
                <div class="details-card">
                  <table width="100%">
                    <tr>
                      <td width="120" style="color: #64748b; font-weight: 600; padding: 5px 0;">Patient Name:</td>
                      <td style="color: #f1f5f9; padding: 5px 0;">${name}</td>
                    </tr>
                    <tr>
                      <td width="120" style="color: #64748b; font-weight: 600; padding: 5px 0;">Patient Email:</td>
                      <td style="color: #f1f5f9; padding: 5px 0;">${email}</td>
                    </tr>
                    <tr>
                      <td width="120" style="color: #64748b; font-weight: 600; padding: 5px 0;">Date:</td>
                      <td style="color: #f1f5f9; padding: 5px 0;">${date}</td>
                    </tr>
                    <tr>
                      <td width="120" style="color: #64748b; font-weight: 600; padding: 5px 0;">Time Slot:</td>
                      <td style="color: #f1f5f9; padding: 5px 0;">${slot}</td>
                    </tr>
                  </table>
                </div>

                <p class="main-text">Click the button below to join the Google Meet session at the scheduled time:</p>

                <center>
                  <a href="${meetLink}" class="cta-button">Join Google Meet</a>
                </center>

                <p class="link-display">Meeting Link:<br/>${meetLink}</p>

                <p class="main-text">You can manage this appointment, view patient records, or write an E-prescription on your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://sarkaridermatologist.com'}/doctor/dashboard" style="color: #0d9488; text-decoration: underline;">Doctor Dashboard</a>.</p>
              </div>

              <div class="footer">
                &copy; 2026 Sarkari Dermatologist. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `
      });
    } catch (docEmailErr: any) {
      console.error('Failed to send notification email to doctor:', docEmailErr.message);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email Error:', error.message);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
