import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Transparent Pricing</h1>
            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', marginBottom: '4rem' }}>
                Affordable dermatological care for everyone. No hidden fees.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                {/* India Plan */}
                <div style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '350px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Patients in India</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>₹800 <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--muted-foreground)' }}>/ consult</span></div>

                    <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
                        {[
                            '15 min Video / Audio Call',
                            'Digital Prescription',
                            '7 Days Free Follow-up',
                            'Secure Medical Records'
                        ].map(item => (
                            <li key={item} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Check size={20} color="var(--primary)" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Link href="/book" style={{
                        display: 'block',
                        textAlign: 'center',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600
                    }}>Book Now</Link>
                </div>

                {/* International Plan */}
                <div style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    borderRadius: 'var(--radius)',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '-2rem',
                        backgroundColor: 'var(--warning)',
                        color: 'black',
                        padding: '0.25rem 3rem',
                        transform: 'rotate(45deg)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>Global</div>

                    <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>International Patients</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>$40 <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#94a3b8' }}>/ consult</span></div>

                    <ul style={{ listStyle: 'none', marginBottom: '2rem', flex: 1 }}>
                        {[
                            '20 min Video Call',
                            'Detailed Care Plan (PDF)',
                            '10 Days Free Follow-up',
                            'Time-zone Friendly Slots',
                            'Priority Support'
                        ].map(item => (
                            <li key={item} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Check size={20} color="var(--secondary)" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Link href="/book" style={{
                        display: 'block',
                        textAlign: 'center',
                        backgroundColor: 'white',
                        color: 'var(--accent)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600
                    }}>Book International Slot</Link>
                </div>
            </div>
        </div>
    );
}
