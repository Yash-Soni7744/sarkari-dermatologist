import { Award, BookOpen, GraduationCap } from 'lucide-react';
import styles from './about.module.css';

export default function AboutPage() {
    return (
        <>
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <div className={styles.heroImage}>
                            <img src="/images/reetika-pal.jpg" alt="Dr. Reetika Pal" />
                        </div>
                        <div className={styles.heroText}>
                            <h1 className={styles.name}>Dr. Reetika Pal</h1>
                            <p className={styles.credentials}>M.B.B.S, M.D. (Dermatology, Venereology & Leprosy)</p>

                            <div className={styles.badge}>
                                <Award size={18} />
                                <span>Army Veteran • Physician • Dermatology Consultant</span>
                            </div>

                            <p className={styles.tagline}>
                                Personalized Dermatology for Healthy, Confident Skin — Accessible From Anywhere.
                            </p>

                            <div className={styles.bio}>
                                <p>Hello, and welcome.</p>
                                <p>
                                    I'm Dr. (Lt Col ) Reetika Pal (Retd) with a deep interest in overall skin health and patient-centred care.
                                    My goal is simple — to make reliable dermatological guidance accessible, convenient, and personalized for people wherever they are.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className="container">
                    <div className={styles.bio}>
                        <p>
                            Through this platform, I offer professional online consultations for skin, hair, and nail concerns, combining medical knowledge with a practical, patient-friendly approach.
                            I believe that good dermatology care should not only focus on treating conditions, but also on helping patients understand their skin and maintain long-term skin health.
                        </p>

                        <p>
                            Before dedicating my practice to dermatology, I had the honour of serving as a <strong>dermatologist in the Indian Army</strong>.
                            The experience instilled in me a lifelong commitment to discipline, integrity, compassion, and service—principles that continue to shape the way I care for my patients today.
                        </p>

                        <p>
                            This practice has been built around the belief that excellent dermatological care should be accessible beyond clinic walls.
                            I aim to provide safe, confidential, and evidence-based consultations for individuals seeking guidance from the comfort of their homes.
                        </p>

                        <p>
                            Whether it is acne, pigmentation, hair concerns, skincare routines, general dermatological advice, or more serious dermatological ailments, my focus is on providing clear explanations and effective treatment plans tailored to each individual.
                        </p>

                        <p>
                            This platform has been designed to make the consultation process simple, transparent, and accessible for both Indian and international patients.
                        </p>

                        <p>Thank you for trusting me with your skin health.</p>
                    </div>
                </div>
            </section>
        </>
    );
}
