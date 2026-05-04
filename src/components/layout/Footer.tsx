"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    const { user } = useAuth();
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerContainer}`}>
                <div className={styles.grid}>
                    {/* Brand Column */}
                    <div className={styles.brand}>
                        <h3>Sarkari Dermatologist</h3>
                        <p>
                            Premium online dermatology consultations for patients in India and worldwide.
                            Compassionate care, clinical excellence.
                        </p>
                        <div className={styles.socials}>
                            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.links}>
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/services">Services</Link></li>
                            {user?.role !== 'doctor' && (
                                <li><Link href="/book">Book Appointment</Link></li>
                            )}
                            <li><Link href="/patient-information">Patient Information</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className={styles.links}>
                        <h4>Legal</h4>
                        <ul>
                            <li><Link href="/legal#privacy">Privacy Policy</Link></li>
                            <li><Link href="/legal#terms">Terms of Service</Link></li>
                            <li><Link href="/legal#refunds">Refund Policy</Link></li>
                            <li><Link href="/legal#telemedicine">Telemedicine Consent</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className={styles.contact}>
                        <h4>Contact Us</h4>
                        <ul>
                            <li>
                                <Mail size={16} />
                                <span>drreetikapal@gmail.com </span>
                            </li>
                            <li>
                                <Phone size={16} />
                                <span>+91 7696888114</span>
                            </li>

                        </ul>
                        <div className={styles.emergency}>
                            <p>For medical emergencies, please visit your nearest hospital.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.copyright}>
                    <p>&copy; {new Date().getFullYear()} Sarkari Dermatologist. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
