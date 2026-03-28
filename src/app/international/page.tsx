import Link from 'next/link';
import { Globe, Clock, CreditCard } from 'lucide-react';

export default function InternationalPage() {
    return (
        <div>
            <section style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)', padding: '6rem 0' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>International Patients</h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px' }}>
                        World-class dermatology care from India to your home.
                        USA, UK, UAE, Canada, Australia & more.
                    </p>
                </div>
            </section>

            <section className="container" style={{ padding: '4rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--secondary)', borderRadius: '50%', color: 'var(--primary)' }}>
                                <Clock size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Time-Zone Friendly</h3>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                            We dedicate specific slots for international time zones.
                            Our booking system automatically detects your local time and shows available slots accordingly.
                        </p>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--secondary)', borderRadius: '50%', color: 'var(--primary)' }}>
                                <CreditCard size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Easy Payments</h3>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                            Pay securely via International Cards (Visa/Mastercard) or PayPal.
                            Pricing is transparent at $40 USD per consultation.
                        </p>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: 'var(--secondary)', borderRadius: '50%', color: 'var(--primary)' }}>
                                <Globe size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Prescriptions</h3>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                            We provide valid medical prescriptions. <br />
                            <em>Note: Please check local pharmacy regulations for accepting foreign prescriptions, although many OTC equivalents are suggested.</em>
                        </p>
                    </div>
                </div>
            </section>

            <section style={{ backgroundColor: 'var(--muted)', padding: '4rem 0', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ marginBottom: '2rem' }}>Ready to consult?</h2>
                    <Link href="/book" style={{
                        display: 'inline-block',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                        fontSize: '1.1rem'
                    }}>
                        Book International Consultation
                    </Link>
                </div>
            </section>
        </div>
    );
}
