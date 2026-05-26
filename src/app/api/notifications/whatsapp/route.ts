import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { phone, name } = await request.json();
        
        // WhatsApp API Provider Configuration
        // We'll use a generic implementation that can be easily swapped.
        // Popular Indian providers: Interakt, Wati, Twilio.
        
        const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
        
        if (!WHATSAPP_API_KEY) {
            console.warn("WhatsApp API key (WHATSAPP_API_KEY) is missing in .env. Skipping message.");
            return NextResponse.json({ 
                success: false, 
                message: "WhatsApp API key missing. Please configure WHATSAPP_API_KEY in .env.local" 
            });
        }

        // --- Example: Interakt API Implementation ---
        // This is a common provider for Indian healthcare apps.
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullPhoneNumber: phone.replace(/\+/g, '').replace(/\s+/g, ''), // Format: 919876543210
                type: "Template",
                template: {
                    name: "welcome_patient",
                    languageCode: "en",
                    bodyValues: [name]
                }
            })
        });

        // --- Example: Twilio Implementation (Uncomment to use) ---
        /*
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);
        
        await client.messages.create({
            body: `Hello ${name}, Welcome to Sarkari Dermatologist! Your account has been successfully created.`,
            from: 'whatsapp:+14155238886', // Twilio Sandbox or approved number
            to: `whatsapp:${phone.replace(/\s+/g, '')}`
        });
        */

        const data = await response.json();
        
        if (!response.ok) {
            console.error("WhatsApp Provider Error:", data);
            return NextResponse.json({ success: false, error: data }, { status: response.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("WhatsApp Integration Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
