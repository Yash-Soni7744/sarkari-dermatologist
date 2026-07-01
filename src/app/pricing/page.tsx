"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ChevronDown, 
  ShieldCheck, 
  Globe, 
  Clock, 
  Sparkles, 
  BadgePercent, 
  UserCheck, 
  MessageSquare,
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import styles from './pricing.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

export default function PricingPage() {
  // FAQ state to toggle open/close
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: "What does the consultation fee cover?",
      answer: "The consultation fee covers your scheduled video/audio call with Dr. Reetika Pal, a detailed digital prescription (or PDF care plan for international patients), and a free follow-up period during which you can text the doctor with questions."
    },
    {
      question: "How long is the follow-up period active, and is it really free?",
      answer: "Yes, it is 100% free. For patients in India, you get 7 days of free follow-up access. For international patients, the follow-up access is active for 10 days. You can access the follow-up chat directly from your dashboard."
    },
    {
      question: "What payment methods are supported?",
      answer: "For domestic patients in India, we support payments via any UPI app (GPay, PhonePe, Paytm, BHIM, etc.) or scanning our official QR code. For international patients, we accept global bank card payments or equivalent UPI/transfer methods, valued at $40 USD (internally mapped to ₹3400 INR)."
    },
    {
      question: "Are there any hidden charges or GST added at checkout?",
      answer: "No. The price you see is the absolute final price. All applicable local taxes, GST, transaction charges, and prescription generation fees are fully absorbed by us. There are no additional charges."
    },
    {
      question: "What is your rescheduling or cancellation policy?",
      answer: "You can reschedule your appointment up to 4 hours before the scheduled slot directly from your profile dashboard for free. In case of cancellation, please reach out to our support team."
    },
    {
      question: "What if I experience technical issues during the meeting?",
      answer: "If there is any connection issue, the doctor will attempt to call you directly on your phone number (or via WhatsApp call for international patients). You will not lose your slot or fee due to technical difficulties."
    }
  ];

  return (
    <div className="container">
      <div className={styles.pricingContainer}>
        {/* Header Intro */}
        <header className={styles.headerSection}>
          <span className={styles.planCategory} style={{ fontSize: '1rem' }}>
            <Sparkles size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Complete Transparency
          </span>
          <h1 className={styles.title} id="pricing-page-title">
            Simple, <span className={styles.titleHighlight}>Fair Pricing</span>
          </h1>
          <p className={styles.subtitle}>
            Premium online dermatological consultations. We promise no hidden costs, no surprise charges, and complete billing transparency.
          </p>
        </header>

        {/* Pricing Cards */}
        <section className={styles.cardsGrid} id="pricing-plans-grid">
          {/* Patients in India */}
          <div className={`${styles.pricingCard} ${styles.popularCard}`} id="domestic-pricing-card">
            <span className={styles.planCategory}>Domestic Consultations</span>
            <h2 className={styles.planTitle}>Patients in India</h2>
            
            <div className={styles.priceWrapper}>
              <span className={styles.price}>₹999</span>
              <span className={styles.period}>/ consult</span>
            </div>

            <div className={styles.originalPriceLine}>
              <span className={styles.originalPrice}>₹1,500</span>
              <span className={styles.discountBadge}>Save 33% Off</span>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span><strong>15 mins</strong> Video / Audio Consult (WhatsApp Video Call)</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span><strong>7 Days</strong> of free text-based follow-up</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span>Digitally signed legal prescription (PDF)</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span>Secure storage of your medical history</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span>Direct WhatsApp notifications</span>
              </li>
            </ul>

            <Link href="/book?type=India" className={`${styles.cardButton} ${styles.primaryBtn}`} id="btn-book-domestic">
              Book Appointment (India)
            </Link>
          </div>

          {/* International Patients */}
          <div className={`${styles.pricingCard} ${styles.darkCard}`} id="international-pricing-card">
            <div className={styles.ribbon}>Global</div>
            <span className={styles.planCategory}>International Consultations</span>
            <h2 className={styles.planTitle}>Global Patients</h2>
            
            <div className={styles.priceWrapper}>
              <span className={styles.price}>$40</span>
              <span className={styles.period}>/ consult</span>
            </div>

            <div className={styles.originalPriceLine}>
              <span className={styles.originalPrice} style={{ color: '#94a3b8' }}>$60</span>
              <span className={styles.discountBadge}>Save 33% Off</span>
            </div>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span><strong>20 mins</strong> Priority Video Consult (WhatsApp Video Call)</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span><strong>10 Days</strong> of free text-based follow-up</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span>Custom PDF Care Plan & prescription guidance</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span>Time-zone matching booking slots</span>
              </li>
              <li className={styles.featureItem}>
                <Check className={styles.checkIcon} size={18} />
                <span>Priority support email channel</span>
              </li>
            </ul>

            <Link href="/book?type=International" className={`${styles.cardButton} ${styles.darkCardBtn}`} id="btn-book-international">
              Book Appointment (Global)
            </Link>
          </div>
        </section>

        {/* 100% Transparency Guarantee - Cost Breakdown Table */}
        <section className={styles.transparencySection} id="pricing-transparency-details">
          <h2 className={styles.sectionHeading}>
            <Info size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary)' }} />
            100% Billing Transparency
          </h2>
          <p className={styles.sectionSubtitle}>
            What you see is exactly what you pay. Here is the absolute fee breakdown.
          </p>

          <table className={styles.breakdownTable}>
            <thead>
              <tr>
                <th>Service Item</th>
                <th>India Charge</th>
                <th>International Charge</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Doctor's Consultation Fee</td>
                <td>₹999</td>
                <td>$40 (equivalent to ₹3,400)</td>
              </tr>
              <tr>
                <td>Digital Signed Prescription & PDF Care Plan</td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹0 (FREE)</td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>$0 (FREE)</td>
              </tr>
              <tr>
                <td>Follow-up Window Chat Access</td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹0 (7 Days FREE)</td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>$0 (10 Days FREE)</td>
              </tr>
              <tr>
                <td>GST (18%) & Payment Gateway Charges</td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹0 (Absorbed by Us)</td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>$0 (Absorbed by Us)</td>
              </tr>
              <tr className={styles.highlightRow}>
                <td><strong>Final Amount Billed</strong></td>
                <td><strong>₹999 only</strong></td>
                <td><strong>$40 (₹3,400) only</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Value Grid: Offline vs Online */}
        <section className={styles.valueSection} id="value-comparison">
          <h2 className={styles.sectionHeading}>Smart Savings: Offline vs. Online</h2>
          <p className={styles.sectionSubtitle}>
            Online consultations are not only safer and faster, they are also significantly lighter on your wallet.
          </p>

          <div className={styles.valueGrid}>
            <div className={`${styles.valueCard} ${styles.negativeCard}`}>
              <h3 className={`${styles.valueCardTitle} ${styles.negativeTitle}`}>
                <TrendingDown size={20} /> Traditional Clinic Visit
              </h3>
              <ul className={styles.valueList}>
                <li className={styles.valueItem}>
                  <strong>Consultation Fee:</strong> ₹1,500 – ₹2,000 average for board-certified specialists.
                </li>
                <li className={styles.valueItem}>
                  <strong>Travel & Commute:</strong> ₹200 – ₹500 in gas/cabs, plus traffic stress.
                </li>
                <li className={styles.valueItem}>
                  <strong>Waiting Time:</strong> 1 to 2 hours in crowded, infectious waiting rooms.
                </li>
                <li className={styles.valueItem}>
                  <strong>Follow-ups:</strong> Full fee charged for follow-ups after 3-5 days.
                </li>
              </ul>
            </div>

            <div className={`${styles.valueCard} ${styles.positiveCard}`}>
              <h3 className={`${styles.valueCardTitle} ${styles.positiveTitle}`}>
                <UserCheck size={20} /> Sarkari Dermatologist (Online)
              </h3>
              <ul className={styles.valueList}>
                <li className={styles.valueItem}>
                  <strong>Consultation Fee:</strong> Just <strong>₹999 / $40</strong> for verified top board-certified care.
                </li>
                <li className={styles.valueItem}>
                  <strong>Travel & Commute:</strong> <strong>₹0</strong>. Conduct from the absolute comfort of home.
                </li>
                <li className={styles.valueItem}>
                  <strong>Waiting Time:</strong> <strong>0 minutes</strong>. The doctor connects at your designated slot.
                </li>
                <li className={styles.valueItem}>
                  <strong>Follow-ups:</strong> <strong>100% Free</strong> follow-up window (7 days India / 10 days Global).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security & Trust Badges */}
        <section className={styles.trustBanner} id="trust-banner">
          <div className={styles.trustBadge}>
            <ShieldCheck className={styles.trustIcon} size={24} />
            <span>Secure 256-bit Encrypted Payments</span>
          </div>
          <div className={styles.trustBadge}>
            <Globe className={styles.trustIcon} size={24} />
            <span>100% HIPAA-Compliant Medical Records</span>
          </div>
          <div className={styles.trustBadge}>
            <Clock className={styles.trustIcon} size={24} />
            <span>No-questions Rescheduling</span>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.faqSection} id="pricing-faqs">
          <h2 className={styles.sectionHeading}>Pricing & Billing FAQs</h2>
          <p className={styles.sectionSubtitle}>
            Have questions about billing, payments, or services? We've got you covered.
          </p>

          <div className={styles.accordion}>
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={styles.accordionItem} id={`faq-item-${index}`}>
                  <button 
                    className={styles.accordionHeader} 
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`${styles.accordionIcon} ${isOpen ? styles.activeIcon : ''}`} size={18} />
                  </button>
                  <div className={`${styles.accordionContent} ${isOpen ? styles.activeContent : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
