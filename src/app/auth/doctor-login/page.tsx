"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/login.module.css';

export default function DoctorLoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(formData.email, formData.password);
        } catch (err: any) {
            setError('Account not found or password incorrect.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoIcon}>
                        <Stethoscope size={32} />
                    </div>
                    <h1 className={styles.title}>Doctor Login</h1>
                    <p className={styles.subtitle} style={{ color: '#0d9488', fontWeight: '600' }}>Healthcare Provider Access</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Professional Email</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={18} />
                            <input
                                name="email"
                                type="email"
                                placeholder="dr.name@hospital.com"
                                className={styles.input}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={18} />
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className={styles.input}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        style={{ backgroundColor: '#0f766e' }}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="spinner" size={20} /> : 'Login as Doctor'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Contact administration if you don't have access.
                </div>

            </div>
        </div>
    );
}
