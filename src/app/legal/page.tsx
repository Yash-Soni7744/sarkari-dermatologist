export default function LegalPage() {
    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Legal & Compliance</h1>

            <section style={{ marginBottom: '3rem' }} id="terms">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Terms of Service</h2>
                <p style={{ lineHeight: '1.6', color: 'var(--muted-foreground)' }}>
                    By accessing and using this telemedicine platform, you agree to bound by these terms.
                    Consultations provided are for non-emergency dermatological conditions only.
                    In case of medical emergencies, please visit the nearest hospital immediately.
                </p>
            </section>

            <section style={{ marginBottom: '3rem' }} id="privacy">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Privacy Policy (HIPAA/GDPR)</h2>
                <p style={{ lineHeight: '1.6', color: 'var(--muted-foreground)' }}>
                    We take your privacy seriously. All medical records and images are encrypted and stored securely.
                    We do not share your personal health information with third parties without your explicit consent, except as required by law.
                </p>
            </section>

            <section style={{ marginBottom: '3rem' }} id="telemedicine">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Telemedicine Consent</h2>
                <div style={{ backgroundColor: 'var(--muted)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                        I understand that telemedicine involves the delivery of healthcare services using electronic communications.
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', color: 'var(--muted-foreground)' }}>
                        <li>I understand that the laws that protect privacy and the confidentiality of medical information also apply to telemedicine.</li>
                        <li>I understand that I have the right to withhold or withdraw my consent to the use of telemedicine in the course of my care at any time.</li>
                        <li>I understand the alternatives to telemedicine consultation.</li>
                    </ul>
                </div>
            </section>

            <section style={{ marginBottom: '3rem' }} id="refunds">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Cancellation & Refund Policy</h2>
                <p style={{ lineHeight: '1.6', color: 'var(--muted-foreground)' }}>
                    Cancellations made 24 hours prior to the appointment time are eligible for a full refund.
                    No-shows or cancellations within 24 hours are non-refundable.
                    If technical issues on our end prevent the consultation, a full refund or reschedule will be provided.
                </p>
            </section>
        </div>
    );
}
