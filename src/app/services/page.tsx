import Link from 'next/link';
import { 
    Stethoscope, 
    Sparkles, 
    Scissors, 
    Activity, 
    Sun, 
    Shield, 
    Search, 
    HeartPulse, 
    GraduationCap,
    Clock
} from 'lucide-react';
import styles from './services.module.css';

export default function ServicesPage() {
    const services = [
        {
            title: "Acne & Acne Scars",
            icon: <Sparkles size={24} />,
            desc: "Specialized treatment for active acne and scar management for all age groups.",
            items: [
                "Acne consultation (teen + adult)",
                "Customized skincare routines (AM/PM)",
                "Prescription-based management",
                "Hormonal acne guidance"
            ]
        },
        {
            title: "Hair Loss & Scalp",
            icon: <Scissors size={24} />,
            desc: "Scientific approach to hair regrowth and scalp condition management.",
            items: [
                "Male/female pattern baldness",
                "Telogen effluvium",
                "Dandruff / seborrheic dermatitis",
                "Scalp psoriasis",
                "Hair routine & supplement plans"
            ]
        },
        {
            title: "Pigmentation & Tone",
            icon: <Sun size={24} />,
            desc: "Advanced protocols for clearing pigmentation and restoring even skin tone.",
            items: [
                "Melasma & PIH management",
                "Tanning / uneven tone",
                "Dark circles",
                "Sun spots & Lentigines"
            ]
        },
        {
            title: "General Skin Care",
            icon: <Stethoscope size={24} />,
            desc: "Expert diagnosis and treatment for all common and complex skin ailments.",
            items: [
                "Eczema / dermatitis",
                "Fungal & Bacterial infections",
                "Psoriasis & Urticaria",
                "Viral Infections & Allergies"
            ]
        },
        {
            title: "Skincare Programs",
            icon: <Clock size={24} />,
            desc: "4–12 week full transformation journeys with continuous monitoring.",
            items: [
                "Detailed skin analysis",
                "Routine curation & product lists",
                "Monthly follow-ups",
                "Progress tracking"
            ]
        },
        {
            title: "Aesthetic Guidance",
            icon: <HeartPulse size={24} />,
            desc: "Professional advice on anti-aging and safe procedure planning.",
            items: [
                "Anti-aging for all decades",
                "Pre/post procedure guidance",
                "Guided home chemical peels",
                "Botox/filler/Laser planning"
            ]
        }
    ];

    return (
        <div>
            <div className={styles.header}>
                <div className="container">
                    <h1 className={styles.title}>Dermatological Services</h1>
                    <p className={styles.subtitle}>
                        Evidence-based clinical care and personalized skin journeys 
                        designed to restore and maintain your skin's health.
                    </p>
                </div>
            </div>

            <div className="container">
                <section className={styles.categorySection}>
                    <div className={styles.servicesGrid}>
                        {services.map((service, idx) => (
                            <div key={idx} className={styles.serviceCard}>
                                <div className={styles.serviceTitle}>
                                    {service.icon}
                                    <h3>{service.title}</h3>
                                </div>
                                <p className={styles.description}>{service.desc}</p>
                                <ul className={styles.conditionsList}>
                                    {service.items.map((item, iIdx) => (
                                        <li key={iIdx}>{item}</li>
                                    ))}
                                </ul>
                                <Link href="/book" className={styles.bookBtn}>Book Consultation</Link>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.categorySection}>
                    <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <Search size={48} />
                        </div>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Second Opinions</h2>
                        <p style={{ maxWidth: '700px', margin: '0 auto 2rem', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>
                            Comprehensive review for patients treated elsewhere, complex recurrent cases, or those awaiting procedures. 
                            Get clarity on your diagnosis and treatment plan.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem', textAlign: 'left', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
                            {[
                                "Patients already treated elsewhere",
                                "Complex / recurrent cases",
                                "Misdiagnosed cases",
                                "Awaiting initial appointments"
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                    <Shield size={16} style={{ color: 'var(--primary)' }} />
                                    {item}
                                </div>
                            ))}
                        </div>
                        <Link href="/book" style={{
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            padding: '1rem 3rem',
                            borderRadius: 'var(--radius)',
                            fontWeight: 600,
                            display: 'inline-block',
                            transition: 'opacity 0.2s'
                        }}>
                            Request Second Opinion
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
