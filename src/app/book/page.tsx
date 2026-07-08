"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BookingProvider, useBooking, PatientType } from '@/context/BookingContext';
import {
    Calendar,
    Clock,
    User,
    CreditCard,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Upload,
    Loader2,
    Stethoscope,
    Globe,
    IndianRupee,
    ExternalLink,
    Copy,
    X,
    Smartphone,
    MessageCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { db, auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, query, where, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import styles from './book.module.css';

// --- Sub-components (Steps) ---

const StepHeader = ({ step, title }: { step: number; title: string }) => (
    <div className={styles.stepHeader}>
        <div className={styles.stepperContainer}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                <span className={styles.stepNumber}>1. Slot</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                <span className={styles.stepNumber}>2. Details</span>
            </div>
            <div className={styles.stepDivider} />
            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                <span className={styles.stepNumber}>3. Payment</span>
            </div>
        </div>
        <h1 className={styles.pageTitle}>{title}</h1>
    </div>
);

const SlotSelection = () => {
    const { booking, updateBooking, nextStep } = useBooking();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
    };

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const standardSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

    const formatDateString = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (!booking.date) return;
            setIsLoadingSlots(true);
            try {
                const q = query(
                    collection(db, "appointments"),
                    where("date", "==", booking.date),
                    where("status", "==", "confirmed")
                );
                const querySnapshot = await getDocs(q);
                const booked = querySnapshot.docs.map(doc => doc.data().slot);
                setBookedSlots(booked);
            } catch (error) {
                console.error("Error fetching booked slots:", error);
            } finally {
                setIsLoadingSlots(false);
            }
        };
        fetchBookedSlots();
    }, [booking.date]);

    const getAvailableSlots = (dateStr: string) => {
        if (!dateStr) return [];
        const selectedDate = new Date(dateStr);
        const now = new Date();

        // Ensure comparison is local
        const isToday = selectedDate.getFullYear() === now.getFullYear() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getDate() === now.getDate();

        let available = standardSlots;

        if (isToday) {
            available = standardSlots.filter((s: string) => {
                const [time, period] = s.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                const slotTime = new Date();
                slotTime.setHours(hours, minutes, 0, 0);
                return slotTime > now;
            });
        }

        // Filter out already booked slots
        return available.filter((s: string) => !bookedSlots.includes(s));
    };

    const handleContinue = () => {
        if (booking.date && booking.slot) {
            nextStep();
        }
    };

    const changeMonth = (offset: number) => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
        setCurrentMonth(newMonth);
    };

    return (
        <div className={styles.card}>
            <div className={styles.typeSelector}>
                <button
                    className={`${styles.typeBtn} ${booking.patientType === 'India' ? styles.active : ''}`}
                    onClick={() => updateBooking({ patientType: 'India' })}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
                        <div style={{ padding: '8px', background: 'rgba(13, 148, 136, 0.1)', borderRadius: '10px', display: 'flex' }}>
                            <IndianRupee size={20} />
                        </div>
                        <span>Patient in India</span>
                    </div>
                    <div className={styles.priceContainer}>
                        <div className={styles.originalPrice}>₹1500</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <div className={styles.discountBadge}>Starting Discount</div>
                            <div className={styles.discountBadge}>New Patient Offer</div>
                        </div>
                        <div className={styles.finalPrice}>₹999</div>
                    </div>
                    {booking.patientType === 'India' && (
                        <div style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--primary)' }}>
                            <CheckCircle size={24} />
                        </div>
                    )}
                </button>
                <button
                    className={`${styles.typeBtn} ${booking.patientType === 'International' ? styles.active : ''}`}
                    onClick={() => updateBooking({ patientType: 'International' })}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', display: 'flex', color: '#3b82f6' }}>
                            <Globe size={20} />
                        </div>
                        <span>International Patient</span>
                    </div>
                    <div className={styles.priceContainer}>
                        <div className={styles.originalPrice}>$60</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <div className={styles.discountBadge}>Starting Discount</div>
                            <div className={styles.discountBadge}>New Patient Offer</div>
                        </div>
                        <div className={styles.finalPrice}>$40</div>
                    </div>
                    {booking.patientType === 'International' && (
                        <div style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--primary)' }}>
                            <CheckCircle size={24} />
                        </div>
                    )}
                </button>
            </div>

            <div className={styles.calendarContainer}>
                <div className={styles.calendarHeader}>
                    <button className={styles.navBtn} onClick={() => changeMonth(-1)}><ChevronLeft /></button>
                    <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button className={styles.navBtn} onClick={() => changeMonth(1)}><ChevronRight /></button>
                </div>
                <div className={styles.calendarGrid}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className={styles.dayName}>{d}</div>)}
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                        const isPast = dateObj < today;
                        const dateStr = formatDateString(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);

                        return (
                            <button
                                key={dayNum}
                                className={`${styles.day} ${booking.date === dateStr ? styles.selectedDay : ''}`}
                                disabled={isPast}
                                onClick={() => updateBooking({ date: dateStr, slot: '' })}
                            >
                                {dayNum}
                            </button>
                        );
                    })}
                </div>
            </div>

            {booking.date && (
                <div className={styles.slotsSection}>
                    <p className={styles.slotsTitle}>Available Slots for {booking.date}</p>
                    {isLoadingSlots ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <Loader2 size={24} className="spinner" />
                        </div>
                    ) : getAvailableSlots(booking.date).length > 0 ? (
                        <div className={styles.slotsGrid}>
                            {getAvailableSlots(booking.date).map((s: string) => (
                                <button
                                    key={s}
                                    className={`${styles.slotBtn} ${booking.slot === s ? styles.selectedSlot : ''}`}
                                    onClick={() => updateBooking({ slot: s })}
                                >
                                    <Clock size={16} /> {s}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noSlotsMessage}>
                            <p>No slots available for this date. Please try another date!</p>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.footer}>
                <button
                    className={styles.continueBtn}
                    disabled={!booking.date || !booking.slot}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};




const PatientDetails = () => {
    const { booking, updateBooking, nextStep, prevStep } = useBooking();
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);

    // OTP State variables
    const [otpPhone, setOtpPhone] = useState('');
    const [otpName, setOtpName] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpToken, setOtpToken] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

    // Auto-fill from user profile
    useEffect(() => {
        if (user && !booking.details.name) {
            updateBooking({
                details: {
                    ...booking.details,
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                }
            });
        }
    }, [user, updateBooking, booking.details.name]);

    const handleSendOtp = async () => {
        if (!otpPhone || !otpName) {
            setOtpError('Name and Phone number are required.');
            return;
        }
        setSendingOtp(true);
        setOtpError(null);
        setDevOtpHint(null);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: otpPhone, name: otpName }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setOtpSent(true);
                if (data.token) {
                    setOtpToken(data.token);
                }
                if (data.otp) {
                    setDevOtpHint(`Development mode OTP: ${data.otp}`);
                }
            } else {
                setOtpError(data.error || 'Failed to send OTP. Please try again.');
            }
        } catch (err: any) {
            setOtpError(err.message || 'An error occurred while sending OTP.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode) {
            setOtpError('Please enter the verification code.');
            return;
        }
        setVerifyingOtp(true);
        setOtpError(null);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: otpPhone, otp: otpCode, token: otpToken }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setOtpError(data.error || 'Verification failed. Please check the OTP.');
                setVerifyingOtp(false);
                return;
            }

            const { firebaseEmail, firebasePassword, name, phone } = data;

            try {
                // 1. Try signing in
                await signInWithEmailAndPassword(auth, firebaseEmail, firebasePassword);
            } catch (signInError: any) {
                // 2. Create new user account if it doesn't exist
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, firebaseEmail, firebasePassword);
                    await setDoc(doc(db, "users", userCredential.user.uid), {
                        id: userCredential.user.uid,
                        name: name,
                        email: firebaseEmail,
                        phone: phone,
                        role: 'patient',
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                    });
                } catch (signUpError: any) {
                    console.error("Sign up failed after OTP verification:", signUpError);
                    setOtpError(signUpError.message || "Failed to create user account.");
                    setVerifyingOtp(false);
                    return;
                }
            }

            // Sync booking details
            updateBooking({
                details: {
                    ...booking.details,
                    name: name,
                    phone: phone,
                    email: firebaseEmail
                }
            });
        } catch (err: any) {
            setOtpError(err.message || 'An error occurred during verification.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const compressImage = (file: File): Promise<{ url: string, name: string }> => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target?.result as string;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 1000;
                            const MAX_HEIGHT = 1000;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);

                            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                            resolve({ url: dataUrl, name: file.name });
                        };
                    };
                });
            };

            const compressedPhotos = await Promise.all(files.map(compressImage));

            const totalSize = [...booking.details.photos, ...compressedPhotos].reduce((acc, p) => acc + p.url.length, 0);
            const MAX_FIRESTORE_PAYLOAD = 800000;

            if (totalSize > MAX_FIRESTORE_PAYLOAD) {
                alert('Total image size too large. Please upload fewer or smaller images.');
                return;
            }

            updateBooking({
                details: {
                    ...booking.details,
                    photos: [...booking.details.photos, ...compressedPhotos]
                }
            });
        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`Failed: ${error.message}`);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const clearPhotos = () => {
        updateBooking({
            details: {
                ...booking.details,
                photos: []
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (booking.appointmentId) {
            nextStep();
            return;
        }

        if (!user) return;

        setUploading(true);
        try {
            const doctorPhone = process.env.NEXT_PUBLIC_DOCTOR_PHONE || '917696888114';
            const meetLink = `https://wa.me/${doctorPhone}`;

            const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const aptRef = await addDoc(collection(db, "appointments"), {
                patientId: user.id,
                patientName: booking.details.name,
                patientEmail: booking.details.email,
                patientPhone: booking.details.phone,
                date: booking.date,
                slot: booking.slot,
                amount: booking.amount,
                meetLink,
                status: 'pending',
                paymentStatus: 'pending',
                verificationStatus: 'waiting',
                paymentReference: paymentReference,
                paymentMethod: 'Cashfree PG',
                photos: JSON.stringify(booking.details.photos),
                createdAt: serverTimestamp()
            });

            updateBooking({
                appointmentId: aptRef.id,
                paymentReference: paymentReference,
                details: { ...booking.details, meetLink }
            });

            nextStep();
        } catch (error: any) {
            console.error('Error creating appointment:', error);
            alert(error.message || 'Something went wrong. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Verification Required</h2>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    To continue booking your appointment, please enter your name and verify your phone number. You can complete your profile later from the profile section.
                </p>
                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={otpName}
                            disabled={otpSent || sendingOtp || verifyingOtp}
                            onChange={e => setOtpName(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>WhatsApp Phone Number</label>
                        <input
                            type="tel"
                            required
                            placeholder="e.g. +919876543210"
                            value={otpPhone}
                            disabled={otpSent || sendingOtp || verifyingOtp}
                            onChange={e => setOtpPhone(e.target.value)}
                        />
                    </div>

                    {otpSent && (
                        <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>Enter 6-digit OTP Code Sent on Whatsapp</label>
                                <button
                                    type="button"
                                    className={styles.backBtn}
                                    style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.85rem', textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer' }}
                                    onClick={() => { setOtpSent(false); setOtpCode(''); }}
                                    disabled={verifyingOtp}
                                >
                                    Change Number
                                </button>
                            </div>
                            <input
                                type="text"
                                maxLength={6}
                                required
                                placeholder="Enter 6-digit OTP"
                                value={otpCode}
                                disabled={verifyingOtp}
                                onChange={e => setOtpCode(e.target.value)}
                                style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                            {devOtpHint && (
                                <p style={{ color: '#0d9488', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '600' }}>
                                    {devOtpHint}
                                </p>
                            )}
                        </div>
                    )}

                    {otpError && (
                        <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '600' }}>
                            {otpError}
                        </p>
                    )}

                    <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                        <button type="button" onClick={prevStep} className={styles.backBtn} disabled={sendingOtp || verifyingOtp}>
                            Back
                        </button>
                        {!otpSent ? (
                            <button
                                type="button"
                                className={styles.continueBtn}
                                onClick={handleSendOtp}
                                disabled={sendingOtp || !otpName || !otpPhone}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                            >
                                {sendingOtp ? (
                                    <>
                                        <Loader2 size={16} className="spinner" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        <Smartphone size={16} />
                                        Send OTP
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={styles.continueBtn}
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp || otpCode.length < 6}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                            >
                                {verifyingOtp ? (
                                    <>
                                        <Loader2 size={16} className="spinner" />
                                        Verifying OTP...
                                    </>
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Patient Details</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        required
                        value={booking.details.name}
                        onChange={e => updateBooking({ details: { ...booking.details, name: e.target.value } })}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>WhatsApp Phone Number</label>
                    <input
                        type="tel"
                        required
                        value={booking.details.phone}
                        onChange={e => updateBooking({ details: { ...booking.details, phone: e.target.value } })}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        required
                        value={booking.details.email}
                        onChange={e => updateBooking({ details: { ...booking.details, email: e.target.value } })}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label>Describe your concern (Optional)</label>
                    <textarea
                        rows={3}
                        value={booking.details.concern}
                        onChange={e => updateBooking({ details: { ...booking.details, concern: e.target.value } })}
                        placeholder="e.g. acne, rash, hairfall..."
                    />
                </div>

                <div className={styles.fileUpload}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label className={styles.uploadBox} style={{ cursor: 'pointer', flex: 1, marginRight: booking.details.photos.length > 0 ? '10px' : '0' }}>
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            {uploading ? <Loader2 size={24} className="spinner" /> : <Upload size={24} />}
                            <p>{booking.details.photos.length > 0 ? `${booking.details.photos.length} Photo(s) Added!` : 'Click to select multiple photos of affected area'}</p>
                            <span>JPG, PNG (Auto-compressed)</span>
                        </label>
                        {booking.details.photos.length > 0 && (
                            <button
                                type="button"
                                onClick={clearPhotos}
                                className={styles.clearBtn}
                                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className={styles.photoContainer}>
                        {booking.details.photos.map((p, idx) => (
                            <div key={idx} className={styles.photoTag}>
                                <div style={{ width: '30px', height: '30px', overflow: 'hidden', borderRadius: '4px', background: '#eee' }}>
                                    <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumb" />
                                </div>
                                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={prevStep} className={styles.backBtn}>Back</button>
                    <button type="submit" className={styles.continueBtn} disabled={uploading}>
                        Proceed to Pay
                    </button>
                </div>
            </form>
        </div>
    );
};

const PaymentStep = () => {
    const { booking, updateBooking, nextStep, prevStep } = useBooking();
    const { user } = useAuth();
    const [loadingSession, setLoadingSession] = useState(false);

    // Dynamic Script loading for Cashfree JS SDK
    useEffect(() => {
        if (typeof window !== 'undefined' && !(window as any).Cashfree) {
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleCashfreePayment = async () => {
        if (!booking.appointmentId) {
            alert('No appointment reference found. Please go back and submit details again.');
            return;
        }

        if (!(window as any).Cashfree) {
            alert('Payment SDK is loading. Please wait a moment and try again.');
            return;
        }

        setLoadingSession(true);
        try {
            // Create order session on backend (pass details directly to bypass backend permission issues)
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId: booking.appointmentId,
                    amount: booking.amount,
                    patientId: user?.id || 'guest_patient',
                    patientName: booking.details.name,
                    patientEmail: booking.details.email,
                    patientPhone: booking.details.phone
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to initialize payment session.');
            }

            // Update Firestore document with cfOrderId and paymentSessionId from authenticated client
            await updateDoc(doc(db, "appointments", booking.appointmentId), {
                cfOrderId: data.cf_order_id,
                paymentSessionId: data.payment_session_id,
                paymentMethod: 'Cashfree PG'
            });

            // Initialize Cashfree SDK and trigger checkout
            const env = process.env.NEXT_PUBLIC_CASHFREE_ENV || 'TEST';
            const mode = env === 'PROD' || env === 'PRODUCTION' ? 'production' : 'sandbox';

            const cashfree = (window as any).Cashfree({ mode });

            cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                redirectTarget: '_self'
            });

        } catch (error: any) {
            console.error('Payment initialization failed:', error);
            alert(error.message || 'Payment service is temporarily unavailable. Please try again.');
            setLoadingSession(false);
        }
    };

    return (
        <div className={styles.card}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
                <div className={styles.paymentSummary} style={{ width: '100%', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '5px' }}>Secure Checkout</h2>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '20px' }}>
                        Pay securely using UPI, Card, Netbanking or Wallet.
                    </p>

                    <div className={`${styles.dateTime} ${styles.amountBadge}`} style={{ margin: '0 auto 24px', fontSize: '1.8rem', padding: '12px 30px' }}>
                        {booking.patientType === 'India' ? <IndianRupee size={28} style={{ marginRight: '6px' }} /> : '$'}
                        {booking.patientType === 'India' ? booking.amount : '40'}
                    </div>

                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px', margin: '0 auto 25px', textAlign: 'left', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Patient:</span>
                            <span style={{ fontWeight: '700' }}>{booking.details.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Slot:</span>
                            <span style={{ fontWeight: '700' }}>{booking.date} at {booking.slot}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Consultant:</span>
                            <span style={{ fontWeight: '700' }}>Dr. Reetika Pal</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCashfreePayment}
                    className={styles.continueBtn}
                    disabled={loadingSession}
                    style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', height: '50px' }}
                >
                    {loadingSession ? (
                        <>
                            <Loader2 size={18} className="spinner" />
                            Initializing Secure Portal...
                        </>
                    ) : (
                        <>
                            <CreditCard size={18} />
                            Pay Now via Cashfree
                        </>
                    )}
                </button>

                <button
                    onClick={prevStep}
                    className={styles.backBtn}
                    disabled={loadingSession}
                    style={{ marginTop: '15px', alignSelf: 'center', border: 'none', background: 'transparent', color: 'var(--muted-foreground)', fontWeight: '600', cursor: 'pointer' }}
                >
                    Back to Details
                </button>
            </div>
        </div>
    );
};



const SuccessStep = () => {
    const { booking } = useBooking();
    const router = useRouter();

    const doctorPhone = process.env.NEXT_PUBLIC_DOCTOR_PHONE || '917696888114';
    const messageText = encodeURIComponent(`Hello Dr. Reetika Pal, I have successfully booked an appointment for ${booking.date} at ${booking.slot}. Looking forward to the consultation.`);
    const waUrl = `https://wa.me/${doctorPhone}?text=${messageText}`;

    return (
        <div className={styles.card} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)' }}>
                    <CheckCircle size={44} />
                </div>
            </div>
            <h1 className={styles.successTitle} style={{ color: 'var(--primary)', fontSize: '2.2rem', fontWeight: 800 }}>Appointment Confirmed!</h1>
            <p className={styles.successSubtitle} style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)' }}>
                Your appointment has been successfully scheduled for:
            </p>
            <div className={styles.dateTime}>
                <Calendar size={20} style={{ marginRight: '10px' }} />
                {booking.date} at {booking.slot}
            </div>

            <div style={{ background: 'rgba(13, 148, 136, 0.05)', border: '1px solid rgba(13, 148, 136, 0.2)', color: 'var(--primary)', padding: '20px', borderRadius: '16px', margin: '25px auto', maxWidth: '600px', textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <span style={{ fontWeight: '800', display: 'block', marginBottom: '5px', fontSize: '1rem' }}>Payment Successful</span>
                We have verified your payment via Cashfree PG. Dr. Reetika Pal will initiate a WhatsApp video call to your phone number at the scheduled time. A confirmation email with the details has been sent to you.
            </div>

            <div className={styles.meetSection} style={{ borderStyle: 'solid', borderColor: 'var(--border)', background: '#f8fafc' }}>
                <p style={{ fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.05em', fontSize: '0.8rem' }}>WHATSAPP CONSULTATION</p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
                    <p style={{ fontSize: '0.95rem', margin: 0, color: 'var(--foreground)', fontWeight: '600' }}>
                        Need to share more details or send a message?
                    </p>
                    <button
                        className={styles.continueBtn}
                        onClick={() => window.open(waUrl, '_blank')}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', fontSize: '1rem', width: 'auto' }}
                    >
                        <MessageCircle size={18} />
                        Message Doctor on WhatsApp
                    </button>
                </div>
                <span className={styles.saveNote} style={{ color: 'var(--muted-foreground)' }}>The doctor will call you directly. You can message the doctor in advance if you want.</span>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={() => router.push('/')} className={styles.backBtn}>Back to Home</button>
                <button onClick={() => router.push('/profile')} className={styles.continueBtn}>View Profile</button>
            </div>
        </div>
    );
};


// --- Main Page Component ---

function BookingContent() {
    const { booking, updateBooking, resetBooking } = useBooking();
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const isVerifyingInProgress = useRef(false);

    // Verify Cashfree Payment status on redirect return
    useEffect(() => {
        const verifyPayment = async () => {
            const orderId = searchParams.get('order_id');
            const appointmentId = searchParams.get('appointment_id');

            if (orderId && appointmentId && !isVerifyingInProgress.current) {
                isVerifyingInProgress.current = true;
                setIsVerifying(true);
                try {
                    const res = await fetch('/api/payment/verify-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ orderId, appointmentId }),
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        // Securely read from Firestore to fetch slot & client details on redirect return
                        const aptRef = doc(db, 'appointments', appointmentId);
                        const aptSnap = await getDoc(aptRef);

                        if (aptSnap.exists()) {
                            const appointmentData = aptSnap.data();

                            // 1. Perform database update client-side where authentication permissions allow it
                            if (appointmentData.status !== 'confirmed') {
                                await updateDoc(aptRef, {
                                    status: 'confirmed',
                                    paymentStatus: 'paid',
                                    verificationStatus: 'verified',
                                    cfOrderId: orderId
                                });

                                // 2. Trigger confirmation email
                                try {
                                    await fetch('/api/emails/send-confirmation', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            name: appointmentData.patientName,
                                            email: appointmentData.patientEmail,
                                            date: appointmentData.date,
                                            slot: appointmentData.slot,
                                            meetLink: appointmentData.meetLink
                                        }),
                                    });
                                } catch (emailErr) {
                                    console.error('Failed to trigger confirmation email on redirect:', emailErr);
                                }
                            }

                            // 3. Update React context to show step 4 (Success) with data filled out
                            updateBooking({
                                step: 4,
                                appointmentId: appointmentId,
                                date: appointmentData.date,
                                slot: appointmentData.slot,
                                paymentReference: orderId,
                                paymentMethod: 'Cashfree PG',
                                details: {
                                    name: appointmentData.patientName,
                                    email: appointmentData.patientEmail,
                                    phone: appointmentData.patientPhone || '',
                                    concern: '',
                                    photos: [],
                                    meetLink: appointmentData.meetLink
                                }
                            });
                        } else {
                            throw new Error('Appointment details could not be found.');
                        }
                    } else {
                        setVerificationError(data.error || 'Payment verification failed. Please check your transaction status.');
                    }
                } catch (err: any) {
                    console.error('Verification error:', err);
                    setVerificationError(err.message || 'An error occurred while verifying your payment status.');
                } finally {
                    setIsVerifying(false);
                }
            }
        };
        verifyPayment();
    }, [searchParams, updateBooking]);

    // Pre-select patient type from query parameter (?type=India or ?type=International)
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'India' || typeParam === 'International') {
            if (booking.patientType !== typeParam) {
                updateBooking({ patientType: typeParam });
            }
        }
    }, [searchParams, booking.patientType, updateBooking]);

    if (loading || isVerifying) {
        return (
            <div className="page-loader">
                <LoadingSpinner size={64} />
                <p style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: '600' }}>
                    {isVerifying ? "Verifying your payment and finalizing booking..." : "Checking authentication..."}
                </p>
            </div>
        );
    }

    if (verificationError) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center', borderColor: '#ef4444' }}>
                    <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
                        <X size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <h2 style={{ color: '#ef4444' }}>Payment Failed</h2>
                    <p style={{ marginBottom: '1.5rem' }}>{verificationError}</p>
                    <button
                        onClick={() => {
                            setVerificationError(null);
                            resetBooking();
                            router.replace('/book');
                        }}
                        className={styles.continueBtn}
                    >
                        Book Again
                    </button>
                </div>
            </div>
        );
    }

    const renderStep = () => {
        switch (booking.step) {
            case 1: return <SlotSelection />;
            case 2: return <PatientDetails />;
            case 3: return <PaymentStep />;
            case 4: return <SuccessStep />;
            default: return <SlotSelection />;
        }
    };

    const getTitle = () => {
        if (booking.step === 4) return "";
        return "Book Your Appointment";
    };

    return (
        <div className={styles.container}>
            {booking.step < 4 && <StepHeader step={booking.step} title={getTitle()} />}
            <div className={styles.content}>
                {renderStep()}
            </div>
        </div>
    );
}

export default function BookPage() {
    return (
        <BookingProvider>
            <Suspense fallback={
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <LoadingSpinner size={48} />
                </div>
            }>
                <BookingContent />
            </Suspense>
        </BookingProvider>
    );
}
