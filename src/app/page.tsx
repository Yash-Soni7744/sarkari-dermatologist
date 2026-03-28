import Link from "next/link";
import {
  CalendarCheck,
  Video,
  FileText,
  Star,
  ArrowRight,
  ShieldCheck,
  Globe
} from "lucide-react";
import styles from "./home.module.css";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Expert Dermatology Care, <br />
              <span style={{ color: "var(--primary)" }}>Anytime, Anywhere.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Consult India's leading dermatologist online. FDA-approved treatments for acne, hair loss, and skin conditions. Accessible for patients globally.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/book" className={styles.primaryBtn}>
                Book Appointment <ArrowRight size={20} style={{ marginLeft: "0.5rem" }} />
              </Link>
              <Link href="/services" className={styles.secondaryBtn}>
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className="container" id="how-it-works">
          <h2 className={styles.sectionTitle}>How Tele-Dermatology Works</h2>
          <p className={styles.sectionSubtitle}>
            Get professional skin care advice in 3 simple steps.
          </p>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepIconWrapper}>
                <CalendarCheck size={32} />
              </div>
              <h3>1. Choose Slot</h3>
              <p>Pick a time that works for you from our real-time calendar and pay securely.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIconWrapper}>
                <Video size={32} />
              </div>
              <h3>2. Consult Doctor</h3>
              <p>Connect with our expert dermatologist via a secure video call link sent to your email.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIconWrapper}>
                <FileText size={32} />
              </div>
              <h3>3. Get Prescription</h3>
              <p>Receive your digital prescription and care plan instantly after the consultation.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className={styles.section} style={{ backgroundColor: "var(--muted)" }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose Sarkari Dermatologist?</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className={styles.stepIconWrapper} style={{ backgroundColor: "white" }}>
                <ShieldCheck size={32} />
              </div>
              <h3>Verified Experts</h3>
              <p>All doctors are board-certified and medically registered.</p>
            </div>
            <div className={styles.stepCard} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className={styles.stepIconWrapper} style={{ backgroundColor: "white" }}>
                <Globe size={32} />
              </div>
              <h3>Global Access</h3>
              <p>Specialized slots and pricing for international patients.</p>
            </div>
            <div className={styles.stepCard} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className={styles.stepIconWrapper} style={{ backgroundColor: "white" }}>
                <FileText size={32} />
              </div>
              <h3>Secure Records</h3>
              <p>HIPAA-compliant encrypted digital health records.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Testimonials */}
      <section className={styles.section} style={{ backgroundColor: "var(--secondary)" }}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Patient Stories</h2>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p>"The online consultation was so smooth. Dr. Sharma understood my skin issue immediately over video call."</p>
              <h4 style={{ marginTop: "1rem" }}>- Anjali P.</h4>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p>"Currently in the USA, and it's hard to find good Indian dermatologist here. This platform is a lifesaver."</p>
              <h4 style={{ marginTop: "1rem" }}>- Rahul M.</h4>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
              </div>
              <p>"Very professional and affordable compared to clinic visits. The prescription was detailed and effective."</p>
              <h4 style={{ marginTop: "1rem" }}>- Sarah K.</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`${styles.section} ${styles.ctaSection}`}>
        <div className="container">
          <h2>Ready to clear up your skin concerns?</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>
            Book your consultation today and take the first step towards healthy skin.
          </p>
          <Link href="/book" className={styles.ctaBtnInverse}>
            Book Appointment Now
          </Link>
        </div>
      </section>
    </>
  );
}
