import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const meetLink = process.env.DOCTOR_MEET_LINK || 'https://meet.google.com/qgu-apbi-nkz';

    return NextResponse.json({ 
      success: true, 
      meetLink 
    });

  } catch (error: any) {
    console.error('Meeting API Error:', error.message);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
