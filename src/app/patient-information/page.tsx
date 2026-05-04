"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
    Camera,
    Wifi,
    FileText,
    Clock,
    Video,
    CheckCircle,
    HelpCircle,
    Stethoscope,
    ChevronDown,
    ChevronUp,
    ArrowRight
} from 'lucide-react';
import styles from './patient-info.module.css';

export default function PatientInformation() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "Is tele-dermatology as effective as an in-person visit?",
            answer: "Yes, for the majority of skin conditions, clear photos and video consultations are just as effective as in-person visits. Our dermatologist can diagnose and treat conditions like acne, rashes, eczema, and hair loss accurately via tele-dermatology."
        },
        {
            question: "What if the doctor needs a closer look?",
            answer: "If the doctor determines that your condition cannot be fully addressed through a virtual consultation, they will advise you to seek an in-person examination. In many cases, initial tele-consultations help filter and manage conditions before a physical visit is truly necessary."
        },
        {
            question: "How do I get my prescription?",
            answer: "After your consultation, a digital, digitally signed prescription will be generated and available in your patient dashboard immediately. You can download and use this at any local pharmacy."
        },
        {
            question: "Is my medical data secure?",
            answer: "Absolutely. Our platform is fully HIPAA-compliant. All your photos, medical history, and consultation details are encrypted and stored securely."
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>Patient Information</h1>
                    <p className={styles.heroSubtitle}>
                        Everything you need to know to prepare for your tele-dermatology consultation. Follow these guidelines to ensure the best possible care from our expert.
                    </p>
                </div>
            </section>

            {/* How to Prepare */}
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>How to Prepare for Your Consultation</h2>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <Wifi size={32} />
                            </div>
                            <h3>1. Check Your Connection</h3>
                            <p>Ensure you have a stable internet connection. A Wi-Fi connection is usually more stable than mobile data for video calls.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <FileText size={32} />
                            </div>
                            <h3>2. Medical History</h3>
                            <p>Have information about your current medications, past medical history, and any previous treatments for your skin condition ready.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <Clock size={32} />
                            </div>
                            <h3>3. Be on Time</h3>
                            <p>Log in 5-10 minutes before your scheduled appointment time to test your camera and microphone setup.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Photo Guidelines */}
            <section className={styles.section} style={{ backgroundColor: "var(--muted)" }}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Image Upload Guidelines</h2>
                    <div className={styles.grid}>
                        <div className={styles.card} style={{ border: 'none' }}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: 'white' }}>
                                <Camera size={32} />
                            </div>
                            <h3>Taking the Right Photos</h3>
                            <p>Clear photos are crucial for an accurate diagnosis. Please follow these simple rules:</p>
                            <ul>
                                <li>Use natural daylight if possible.</li>
                                <li>Avoid using flash or filters.</li>
                                <li>Take one photo from far away to show the overall area.</li>
                                <li>Take a close-up picture in sharp focus.</li>
                                <li>Ensure the affected area is clean (no makeup or creams).</li>
                            </ul>
                        </div>
                        <div className={styles.card} style={{ border: 'none' }}>
                            <div className={styles.iconWrapper} style={{ backgroundColor: 'white' }}>
                                <CheckCircle size={32} />
                            </div>
                            <h3>Importance of Good Photos</h3>
                            <p>Good photos provide the dermatologist with the clarity needed to make a confident assessment. The images should accurately represent the redness, texture, and size of the problem area.</p>
                            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--primary)' }}>
                                <strong>Tip:</strong> If you're photographing a spot on your back or a hard-to-reach area, ask a family member or friend to help take the picture.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What to Expect */}
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>What to Expect</h2>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <Video size={32} />
                            </div>
                            <h3>During the Video Call</h3>
                            <p>The doctor will review the photos you uploaded and ask questions about your symptoms, medical history, and lifestyle. They may ask you to show the affected area on camera.</p>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <Stethoscope size={32} />
                            </div>
                            <h3>Diagnosis & Treatment</h3>
                            <p>Based on the visual assessment and your history, the doctor will provide a diagnosis and discuss a personalized treatment plan with you.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className={styles.section} style={{ backgroundColor: "var(--muted)" }}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                    <div className={styles.accordion}>
                        {faqs.map((faq, index) => (
                            <div key={index} className={styles.accordionItem}>
                                <button
                                    className={styles.accordionHeader}
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={openFaq === index}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <HelpCircle size={20} color="var(--primary)" />
                                        {faq.question}
                                    </span>
                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openFaq === index && (
                                    <div className={styles.accordionContent}>
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.ctaSection}>
                <div className="container">
                    <h2 className={styles.ctaTitle}>Ready to begin?</h2>
                    <p className={styles.ctaSubtitle}>
                        Now that you know how to prepare, book your consultation and take the first step towards healthier skin.
                    </p>
                    <Link href="/book" className={styles.ctaBtn}>
                        Book Appointment <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </>
    );
}
