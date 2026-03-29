"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Calendar, Droplets, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getFriendlyErrorMessage } from '@/lib/utils';
import styles from './signup.module.css';

export default function SignupPage() {
    const { signup } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'O+'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await signup(formData.password, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: 'patient',
                age: formData.age,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup
            });
        } catch (err: any) {
            const firebaseErrorCode = err.code || '';
            const friendlyMsg = getFriendlyErrorMessage(firebaseErrorCode);
            setError(friendlyMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <User size={24} />
                    </div>
                    <h1 className={styles.title}>Create Patient Account</h1>
                    <p className={styles.subtitle}>Join Sarkari Dermatologist for online consultations</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <div className={styles.inputWrapper}>
                            <User className={styles.inputIcon} size={18} />
                            <input
                                name="name"
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                className={styles.input}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={18} />
                            <input
                                name="email"
                                type="email"
                                placeholder="rahul@example.com"
                                className={styles.input}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Phone Number</label>
                        <div className={styles.inputWrapper}>
                            <Phone className={styles.inputIcon} size={18} />
                            <input
                                name="phone"
                                type="tel"
                                placeholder="+91 98765 43210"
                                className={styles.input}
                                value={formData.phone}
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

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Age</label>
                            <div className={styles.inputWrapper}>
                                <Calendar className={styles.inputIcon} size={18} />
                                <input
                                    name="age"
                                    type="number"
                                    placeholder="28"
                                    className={styles.input}
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Gender</label>
                            <select
                                name="gender"
                                className={styles.input}
                                style={{ paddingLeft: '1rem' }}
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Blood Group</label>
                        <div className={styles.inputWrapper}>
                            <Droplets className={styles.inputIcon} size={18} />
                            <select
                                name="bloodGroup"
                                className={styles.input}
                                value={formData.bloodGroup}
                                onChange={handleChange}
                            >
                                <option>O+</option>
                                <option>O-</option>
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="spinner" size={20} /> : 'Create Account'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link href="/auth/login" className={styles.loginLink}>Login here</Link>
                </div>
            </div>
        </div>
    );
}
