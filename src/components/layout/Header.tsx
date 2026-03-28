"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Stethoscope, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
            <li><Link href="/patient-information" onClick={() => setIsMenuOpen(false)}>Patient Information</Link></li>
            <li><Link href="/book" onClick={() => setIsMenuOpen(false)}>Book Appointment</Link></li>
            {/* Chat disabled per user request */}
            {user && (
              <li className={styles.disabledLink}>
                <span title="Chat currently disabled">Chat</span>
              </li>
            )}
          </ul>
        </nav>

        <div className={styles.actions}>
          {!user ? (
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
                  {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name[0]}
                </div>
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
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


