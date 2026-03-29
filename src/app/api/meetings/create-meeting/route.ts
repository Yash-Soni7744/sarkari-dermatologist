import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { date, slot, patientEmail, patientName } = await request.json();

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Google API credentials missing');
      return NextResponse.json({ error: 'Meeting service not configured' }, { status: 500 });
    }

    // Initialize Google Auth with safety check
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!privateKey) {
        console.error('Google Private Key format is invalid or missing');
        return NextResponse.json({ error: 'Meeting service configuration error' }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Format Start and End times
    // Date format expected: "yyyy-MM-dd"
    // Slot format expected: "HH:mm"
    const startDateTime = new Date(`${date}T${slot}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 min duration

    const event = {
      summary: `Dermatology Consultation: ${patientName}`,
      description: `Consultation with Sarkari Dermatologist for ${patientName}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [{ email: patientEmail }],
      conferenceData: {
        createRequest: {
          requestId: `consult-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary', // Service account's primary calendar (must be shared with doctor)
      requestBody: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || '';

    return NextResponse.json({ 
      success: true, 
      meetLink,
      eventId: response.data.id 
    });

  } catch (error: any) {
    console.error('Google Calendar Error:', error.message);
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}
