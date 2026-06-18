"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Stethoscope, User, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <Stethoscope className={styles.logoIcon} />
          <span>Sarkari Dermatologist</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.open : ''}`}>
          <ul className={styles.navList}>
            <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link href="/about" onClick={() => setIsMenuOpen(false)}>About</Link></li>
            <li><Link href="/services" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
            <li><Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link></li>
            <li><Link href="/patient-information" onClick={() => setIsMenuOpen(false)}>Patient Information</Link></li>
            {user?.role !== 'doctor' && (
              <li><Link href="/book" onClick={() => setIsMenuOpen(false)}>Book Appointment</Link></li>
            )}
            {/* Chat link removed per user request */}
          </ul>
        </nav>

        <div className={styles.actions}>
          {loading ? (
            <div style={{ padding: '8px 24px' }}>
              <Loader2 className="spinner" size={20} color="var(--primary)" />
            </div>
          ) : !user ? (
            <Link href="/auth/login" className={styles.ctaBtn} onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
          ) : (
            <div className={styles.userSection}>
              <Link 
                href={user.role === 'doctor' ? "/doctor/dashboard" : "/profile"} 
                className={styles.profileBadge} 
                onClick={() => setIsMenuOpen(false)}
              >
                <div className={styles.avatarSmall}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    user.role === 'doctor' ? 'DR' : user.name[0]
                  )}
                </div>
                <span className={styles.userName}>
                  {user.role === 'doctor' ? 'Dr. Reetika' : user.name.split(' ')[0]}
                </span>
              </Link>
              <button onClick={logout} className={styles.logoutBtn} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}

          
          {/* Mobile Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}


