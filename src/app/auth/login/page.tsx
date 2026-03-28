"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, Stethoscope } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
    const { login } = useAuth();
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

            setError(err.message || 'Login failed. Please check your credentials.');
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
                    <h1 className={styles.title}>Patient Login</h1>
                    <p className={styles.subtitle}>Welcome back! Please enter your details.</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={18} />
                            <input
                                name="email"
                                type="email"
                                placeholder="name@company.com"
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
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="spinner" size={20} /> : 'Login'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account? <Link href="/auth/signup" className={styles.link}>Sign up</Link>
                </div>

            </div>
        </div>
    );
}
