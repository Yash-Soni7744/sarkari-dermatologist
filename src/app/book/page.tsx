"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
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
  X
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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

    const formatDateString = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const standardSlots = ['10:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
    
    const getAvailableSlots = (dateStr: string) => {
        if (!dateStr) return [];
        const selectedDate = new Date(dateStr);
        const now = new Date();
        
        // Ensure comparison is local
        const isToday = selectedDate.getFullYear() === now.getFullYear() && 
                        selectedDate.getMonth() === now.getMonth() && 
                        selectedDate.getDate() === now.getDate();

        if (isToday) {
            return standardSlots.filter(s => {
                const [time, period] = s.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                const slotTime = new Date();
                slotTime.setHours(hours, minutes, 0, 0);
                return slotTime > now;
            });
        }
        return standardSlots;
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
                    <IndianRupee size={18} />
                    Patient in India (₹800)
                </button>
                <button 
                    className={`${styles.typeBtn} ${booking.patientType === 'International' ? styles.active : ''}`}
                    onClick={() => updateBooking({ patientType: 'International' })}
                >
                    <Globe size={18} />
                    International Patient ($40)
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
                    <div className={styles.slotsGrid}>
                        {getAvailableSlots(booking.date).map(s => (
                            <button 
                                key={s} 
                                className={`${styles.slotBtn} ${booking.slot === s ? styles.selectedSlot : ''}`}
                                onClick={() => updateBooking({ slot: s })}
                            >
                                <Clock size={16} /> {s}
                            </button>
                        ))}
                    </div>
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const compressImage = (file: File): Promise<{url: string, name: string}> => {
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
                            
                            // Compress as JPEG with 0.6 quality for small footprint
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                            resolve({ url: dataUrl, name: file.name });
                        };
                    };
                });
            };

            const compressedPhotos = await Promise.all(files.map(compressImage));
            
            // Safety check: Total size of all photos in Base64
            const totalSize = [...booking.details.photos, ...compressedPhotos].reduce((acc, p) => acc + p.url.length, 0);
            const MAX_FIRESTORE_PAYLOAD = 800000; // ~800KB safety limit (Firestore limit is 1MB total)

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
            // alert('Photos compressed and added!');
        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`Failed: ${error.message}`);
        } finally {
            setUploading(false);
            if (e.target) e.target.value = ''; // Reset input
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        nextStep();
    };

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
                    <label>Phone Number</label>
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
    const { booking, nextStep, prevStep, updateBooking } = useBooking();
    const [isPaying, setIsPaying] = useState(false);
    const { user } = useAuth();

    const handlePayment = async () => {
        if (!user) return;
        setIsPaying(true);
        try {
            // 1. Generate a REAL Google Meet link via our new API
            let meetLink = 'https://meet.google.com/pzl-fjpa-oxe'; // Default/Fallback link
            try {
                const meetRes = await fetch('/api/meetings/create-meeting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: booking.date,
                        slot: booking.slot,
                        patientEmail: booking.details.email,
                        patientName: booking.details.name
                    })
                });

                const meetData = await meetRes.json();
                if (meetRes.ok && meetData.meetLink) {
                    meetLink = meetData.meetLink;
                } else {
                    console.warn('Meeting API failed, using fallback link:', meetData.error);
                }
            } catch (meetErr) {
                console.warn('Could not create meet link, using fallback:', meetErr);
            }
            
            // 2. Create Pending Appointment in Firestore
            const aptRef = await addDoc(collection(db, "appointments"), {
                patientId: user.id,
                patientName: booking.details.name,
                patientEmail: booking.details.email,
                date: booking.date,
                slot: booking.slot,
                amount: booking.amount,
                meetLink,
                status: 'pending',
                photos: JSON.stringify(booking.details.photos), // Bulletproof JSON serialization
                createdAt: serverTimestamp()
            });

            // 2. Create Order via Backend
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: aptRef.id,
                    orderAmount: booking.amount,
                    orderCurrency: booking.patientType === 'India' ? 'INR' : 'USD',
                    customerDetails: {
                        id: user.id,
                        email: booking.details.email,
                        phone: booking.details.phone,
                    }
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create payment session');

            updateBooking({ details: { ...booking.details, meetLink } });

            // 3. Open Cashfree Checkout
            const { load } = await import('@cashfreepayments/cashfree-js');
            const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox';
            const cashfree = await load({ mode });
            
            await cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                redirectTarget: "_self", 
            });

        } catch (error: any) {
            console.error('Payment Error:', error.message);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.paymentSummary}>
                <div className={styles.summaryCard}>
                    <CreditCard size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>Payment Summary</h2>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                        You are booking a {booking.patientType === 'International' ? 'International' : 'Standard'} Consultation
                    </p>
                    
                    <div className={styles.priceBadgeContainer}>
                         <div className={`${styles.dateTime} ${styles.amountBadge}`}>
                            <IndianRupee size={24} style={{ marginRight: '10px' }} />
                            {booking.patientType === 'India' ? `₹${booking.amount}` : `$${booking.amount / 85}`}
                        </div>
                    </div>
                    <p className={styles.taxNote}>Secure payment processed via Cashfree</p>
                </div>
            </div>
            
            <div className={styles.actions}>
                <button onClick={prevStep} className={styles.backBtn} disabled={isPaying}>Back</button>
                <button onClick={handlePayment} className={styles.continueBtn} disabled={isPaying}>
                    {isPaying ? <Loader2 size={20} className="spinner" /> : 'Pay Now'}
                </button>
            </div>
        </div>
    );
};



const SuccessStep = () => {
    const { booking } = useBooking();
    const router = useRouter();

    const currentMeetLink = booking.details.meetLink || 'https://meet.google.com/pzl-fjpa-oxe';

    return (
        <div className={styles.card} style={{ textAlign: 'center' }}>
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h1 className={styles.successTitle}>Booking Confirmed!</h1>
            <p className={styles.successSubtitle}>Your appointment is scheduled for:</p>
            <div className={styles.dateTime}>
                <Calendar size={20} style={{ marginRight: '10px' }} />
                {booking.date} at {booking.slot}
            </div>
            <p className={styles.emailNote}>A confirmation email has been sent to {booking.details.email}.</p>

            <div className={styles.meetSection}>
                <p>YOUR CONSULTATION LINK</p>
                <div className={styles.linkBox}>
                    <code>{currentMeetLink}</code>
                    <button 
                        className={styles.joinBtn} 
                        onClick={() => window.open(currentMeetLink.startsWith('http') ? currentMeetLink : `https://${currentMeetLink}`, '_blank')}
                    >
                        Join Meet
                    </button>
                </div>
                <span className={styles.saveNote}>Please save this link. You can also find it in your dashboard.</span>
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
    const { booking, updateBooking } = useBooking();
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    // Handle Cashfree Callback & State Recovery
    useEffect(() => {
        const orderId = searchParams.get('order_id');
        if (orderId && booking.step !== 4) {
            setIsVerifying(true);
            setVerificationError(null);

            const verifyAndRecover = async () => {
                try {
                    // 1. Verify Payment status with our backend first!
                    const verifyRes = await fetch(`/api/payments/verify?orderId=${orderId}`);
                    const verifyData = await verifyRes.json();

                    if (!verifyRes.ok || verifyData.order_status !== 'PAID') {
                        setVerificationError("Payment was not successful. Please try again.");
                        return; // Stop here if not paid
                    }

                    // 2. Fetch data from Firestore to recover state
                    const aptRef = doc(db, "appointments", orderId);
                    const aptSnap = await getDoc(aptRef);
                    
                    if (aptSnap.exists()) {
                        const data = aptSnap.data();
                        
                        // 3. Update status if needed
                        if (data.status === 'pending') {
                            await updateDoc(aptRef, { status: 'confirmed' });
    
                            // 4. Send Confirmation Email via Resend
                            try {
                                await fetch('/api/emails/send-confirmation', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        name: data.patientName,
                                        email: data.patientEmail,
                                        date: data.date,
                                        slot: data.slot,
                                        meetLink: data.meetLink
                                    })
                                });
                            } catch (emailErr) {
                                console.error("Failed to send email:", emailErr);
                            }
                        }
                        
                        // 5. Populate Booking State and move to Success
                        let restoredPhotos = [];
                        try {
                            restoredPhotos = typeof data.photos === 'string' ? JSON.parse(data.photos) : (data.photos || []);
                        } catch (e) {
                            console.error("Failed to parse photos:", e);
                        }

                        updateBooking({
                            step: 4,
                            date: data.date,
                            slot: data.slot,
                            details: {
                                ...booking.details,
                                email: data.patientEmail,
                                name: data.patientName,
                                photos: restoredPhotos,
                                meetLink: data.meetLink
                            }
                        });
                    }
                } catch (err) {
                    console.error("Verification failed:", err);
                    setVerificationError("Something went wrong while verifying your payment.");
                } finally {
                    setIsVerifying(false);
                }
            };
            verifyAndRecover();
        }
    }, [searchParams, updateBooking, booking.step]);

    // Auth Guard
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?redirect=/book');
        }
    }, [user, loading, router]);

    if (loading || !user || isVerifying) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 size={48} className="spinner" />
                <p>{isVerifying ? "Verifying your payment and finalizing booking..." : "Checking authentication..."}</p>
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
                            updateBooking({ step: 3 });
                        }} 
                        className={styles.continueBtn}
                    >
                        Try Again
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
                    <Loader2 size={48} className="spinner" />
                </div>
            }>
                <BookingContent />
            </Suspense>
        </BookingProvider>
    );
}
