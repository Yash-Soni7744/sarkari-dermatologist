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
  Smartphone
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp, query, where, getDocs, onSnapshot } from 'firebase/firestore';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (booking.appointmentId) {
            nextStep();
            return;
        }

        if (!user) return;

        setUploading(true);
        try {
            // Generate meeting link early
            let meetLink = 'https://meet.google.com/pzl-fjpa-oxe';
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
                }
            } catch (meetErr) {
                console.warn('Could not create meet link, using fallback:', meetErr);
            }

            const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const aptRef = await addDoc(collection(db, "appointments"), {
                patientId: user.id,
                patientName: booking.details.name,
                patientEmail: booking.details.email,
                date: booking.date,
                slot: booking.slot,
                amount: booking.amount,
                meetLink,
                status: 'pending',
                paymentStatus: 'pending',
                verificationStatus: 'waiting',
                paymentReference: paymentReference,
                paymentMethod: 'UPI',
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
    const { booking, updateBooking, nextStep, prevStep } = useBooking();
    const [isVerifying, setIsVerifying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [screenshotName, setScreenshotName] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mobile specific states
    const [isMobile, setIsMobile] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [showQrCodeOnMobile, setShowQrCodeOnMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const widthMobile = window.innerWidth <= 768;
            setIsMobile(userAgentMobile || widthMobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleCopyUpi = () => {
        navigator.clipboard.writeText("yashsoni2474@okaxis");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const compressImage = (file: File): Promise<string> => {
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
                            resolve(dataUrl);
                        };
                    };
                });
            };

            const compressedUrl = await compressImage(file);
            setScreenshotUrl(compressedUrl);
            setScreenshotName(file.name);
        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`Failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitPayment = async () => {
        if (!booking.appointmentId || !screenshotUrl) return;

        setIsVerifying(true);
        try {
            await updateDoc(doc(db, "appointments", booking.appointmentId), {
                status: 'pending_verification',
                verificationStatus: 'submitted',
                paymentScreenshot: screenshotUrl,
                paymentMethod: 'UPI QR',
                paymentStatus: 'pending'
            });
            nextStep();
        } catch (error: any) {
            console.error('Error submitting payment verification:', error);
            alert(error.message || 'Something went wrong. Please try again.');
            setIsVerifying(false);
        }
    };

    if (isVerifying) {
        return (
            <div className={styles.card} style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Loader2 size={48} className="spinner" style={{ margin: '0 auto', color: 'var(--primary)', marginBottom: '20px' }} />
                <h2 style={{ marginBottom: '10px' }}>Submitting Proof...</h2>
                <p style={{ color: 'var(--muted-foreground)' }}>
                    Uploading your payment screenshot and initializing verification. Please wait...
                </p>
            </div>
        );
    }

    const upiId = "yashsoni2474@okaxis";
    const upiAmount = booking.patientType === 'India' ? booking.amount : '999';
    const payeeName = "Dr. Reetika Pal";
    const transactionNote = "Consultation Fee";

    const gpayDeeplink = `gpay://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const phonepeDeeplink = `phonepe://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const paytmDeeplink = `paytmmp://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const genericDeeplink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

    const handleUpiAppClick = (deeplink: string) => {
        window.location.href = deeplink;
        setTimeout(() => {
            setShowUpiModal(false);
            setShowUpload(true);
        }, 1500);
    };

    return (
        <div className={styles.card}>
            {!showUpload ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className={styles.paymentSummary} style={{ width: '100%', textAlign: 'center', padding: '10px 0' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '5px' }}>UPI Payment</h2>
                        <p style={{ color: 'var(--muted-foreground)', marginBottom: '20px' }}>
                            {isMobile 
                                ? 'Pay directly using UPI apps installed on your mobile device.'
                                : 'Scan and pay via any UPI app to complete your booking.'
                            }
                        </p>
                        
                        <div className={`${styles.dateTime} ${styles.amountBadge}`} style={{ margin: '0 auto 24px', fontSize: '1.8rem', padding: '12px 30px' }}>
                            {booking.patientType === 'India' ? <IndianRupee size={28} style={{ marginRight: '6px' }} /> : '$'}
                            {booking.patientType === 'India' ? booking.amount : '40'}
                        </div>
                    </div>

                    {isMobile ? (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {!showQrCodeOnMobile ? (
                                <div className={styles.mobilePayOptions}>
                                    <button 
                                        onClick={() => setShowUpiModal(true)} 
                                        className={styles.mobilePrimaryBtn}
                                    >
                                        <Smartphone size={20} />
                                        Pay via UPI Apps (GPay, PhonePe...)
                                    </button>
                                    <button 
                                        onClick={() => setShowQrCodeOnMobile(true)} 
                                        className={styles.mobileSecondaryBtn}
                                    >
                                        Show UPI QR / UPI ID instead
                                    </button>
                                </div>
                            ) : (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
                                        <div style={{ width: '220px', height: '220px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                            <img 
                                                src="/assets/upi-qr.png" 
                                                alt="UPI QR Code" 
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '15px', marginBottom: '8px', textAlign: 'center', fontWeight: '500' }}>
                                            Scan QR or copy UPI ID below to pay.
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '10px', width: '100%', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--foreground)' }}>UPI: {upiId}</span>
                                            <button 
                                                onClick={handleCopyUpi} 
                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', padding: '4px' }}
                                            >
                                                {copied ? <span>Copied!</span> : <span>Copy</span>}
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowQrCodeOnMobile(false)} 
                                        className={styles.mobileSecondaryBtn}
                                        style={{ width: '100%', maxWidth: '400px', marginBottom: '25px' }}
                                    >
                                        Back to Pay via UPI Apps
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', marginBottom: '25px' }}>
                            <div style={{ width: '220px', height: '220px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <img 
                                    src="/assets/upi-qr.png" 
                                    alt="UPI QR Code" 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                />
                            </div>
                            
                            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginTop: '15px', marginBottom: '8px', textAlign: 'center', fontWeight: '500' }}>
                                Scan the QR and complete payment using any UPI app.
                            </p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '10px', width: '100%', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--foreground)' }}>UPI: {upiId}</span>
                                <button 
                                    onClick={handleCopyUpi} 
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', padding: '4px' }}
                                >
                                    {copied ? <span>Copied!</span> : <span>Copy</span>}
                                </button>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => setShowUpload(true)} 
                        className={styles.continueBtn} 
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    >
                        I have made the payment, confirm booking <ChevronRight size={18} />
                    </button>
                    
                    <button onClick={prevStep} className={styles.backBtn} style={{ marginTop: '15px', alignSelf: 'center', border: 'none', background: 'transparent', color: 'var(--muted-foreground)', fontWeight: '600' }}>
                        Back to Details
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <button 
                            onClick={() => setShowUpload(false)} 
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: '5px' }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Confirm Your Booking</h2>
                    </div>
                    
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '25px' }}>
                        Please upload the screenshot of your completed payment transaction. This helps Dr. Reetika verify and approve your booking quickly.
                    </p>

                    <div className={styles.fileUpload} style={{ padding: '30px 20px', background: '#f8fafc', border: '2px dashed var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', marginBottom: '30px' }}>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            style={{ display: 'none' }} 
                            onChange={handleFileUpload}
                            accept="image/*"
                            disabled={uploading}
                        />
                        {uploading ? (
                            <Loader2 size={36} className="spinner" color="var(--primary)" />
                        ) : screenshotUrl ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', background: 'white' }}>
                                    <img src={screenshotUrl} alt="Payment Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', wordBreak: 'break-all', maxWidth: '300px' }}>{screenshotName}</span>
                                <button 
                                    type="button" 
                                    onClick={() => { setScreenshotUrl(null); setScreenshotName(''); }}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Change Image
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%' }}
                            >
                                <Upload size={32} color="var(--primary)" />
                                <p style={{ fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>Click to upload screenshot</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>PNG, JPG, or JPEG accepted</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.actions} style={{ marginTop: '20px' }}>
                        <button 
                            type="button" 
                            onClick={() => setShowUpload(false)} 
                            className={styles.backBtn}
                        >
                            Back
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSubmitPayment} 
                            className={styles.continueBtn} 
                            disabled={!screenshotUrl || uploading}
                        >
                            Submit Payment Proof
                        </button>
                    </div>
                </div>
            )}

            {/* UPI App Selector Modal */}
            {showUpiModal && (
                <div className={styles.modalOverlay} onClick={() => setShowUpiModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setShowUpiModal(false)}>
                            <X size={18} />
                        </button>
                        
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--foreground)' }}>
                            Select UPI App
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '20px', lineHeight: '1.4' }}>
                            Choose your preferred UPI app to pay <strong>₹{upiAmount}</strong>. After transaction completion, return here to submit the proof screenshot.
                        </p>

                        <div className={styles.upiAppsGrid}>
                            <button className={styles.upiAppItem} onClick={() => handleUpiAppClick(gpayDeeplink)}>
                                <div className={styles.upiAppIcon}>
                                    <svg viewBox="0 0 40 40" width="32" height="32">
                                        <path d="M25.7 18.5h-5.4v2.3h3.8c-.2 1-.9 1.8-1.9 2.1v1.7h3.1c1.8-1.7 2.9-4.2 2.9-6.1 0-.6-.1-1.2-.5-1.7z" fill="#4285F4"/>
                                        <path d="M20.3 24.5c-2.4 0-4.4-1.6-5.1-3.8l-3.1 2.4c1.5 3 4.6 5 8.2 5 2.8 0 5.1-.9 6.8-2.5l-3.1-2.4c-.9.8-2.1 1.3-3.7 1.3z" fill="#34A853"/>
                                        <path d="M15.2 20.7c-.2-.7-.3-1.4-.3-2.2 0-.8.1-1.5.3-2.2v-2.4l-3.1-2.4c-1 2-1.5 4.3-1.5 7s.5 5 1.5 7l3.1-2.4c-.2-.6-.3-1.4-.3-2.2z" fill="#FBBC05"/>
                                        <path d="M20.3 16.5c1.5 0 2.9.5 4 1.5l3-3c-1.8-1.7-4.1-2.7-7-2.7-3.6 0-6.7 2-8.2 5l3.1 2.4c.7-2.2 2.7-3.8 5.1-3.8z" fill="#EA4335"/>
                                    </svg>
                                </div>
                                <span className={styles.upiAppName}>Google Pay</span>
                            </button>

                            <button className={styles.upiAppItem} onClick={() => handleUpiAppClick(phonepeDeeplink)}>
                                <div className={styles.upiAppIcon} style={{ background: '#5f259f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Pe</span>
                                </div>
                                <span className={styles.upiAppName}>PhonePe</span>
                            </button>

                            <button className={styles.upiAppItem} onClick={() => handleUpiAppClick(paytmDeeplink)}>
                                <div className={styles.upiAppIcon} style={{ background: '#00baf2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>Paytm</span>
                                </div>
                                <span className={styles.upiAppName}>Paytm</span>
                            </button>

                            <button className={styles.upiAppItem} onClick={() => handleUpiAppClick(genericDeeplink)}>
                                <div className={styles.upiAppIcon} style={{ background: '#0f766e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>UPI</span>
                                </div>
                                <span className={styles.upiAppName}>Any UPI App</span>
                            </button>
                        </div>

                        <div className={styles.upiNote}>
                            <strong>Important:</strong> After the app opens, pay <strong>₹{upiAmount}</strong>, take a screenshot of the payment receipt, and return to this page to complete booking.
                        </div>

                        <button 
                            className={styles.continueBtn} 
                            style={{ width: '100%' }}
                            onClick={() => {
                                setShowUpiModal(false);
                                setShowUpload(true);
                            }}
                        >
                            Proceed to Upload Screenshot
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};



const SuccessStep = () => {
    const { booking } = useBooking();
    const router = useRouter();

    const currentMeetLink = booking.details.meetLink || 'https://meet.google.com/pzl-fjpa-oxe';

    return (
        <div className={styles.card} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: '#fef9c3', color: '#854d0e' }}>
                    <Clock size={44} />
                </div>
            </div>
            <h1 className={styles.successTitle} style={{ color: '#854d0e', fontSize: '2.2rem', fontWeight: 800 }}>Booking Submitted!</h1>
            <p className={styles.successSubtitle} style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)' }}>
                Your appointment is requested for:
            </p>
            <div className={styles.dateTime}>
                <Calendar size={20} style={{ marginRight: '10px' }} />
                {booking.date} at {booking.slot}
            </div>
            
            <div style={{ background: '#fef9c3', border: '1px solid #fef08a', color: '#854d0e', padding: '20px', borderRadius: '16px', margin: '25px auto', maxWidth: '600px', textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <span style={{ fontWeight: '800', display: 'block', marginBottom: '5px', fontSize: '1rem' }}>Awaiting Payment Verification</span>
                We have received your payment screenshot. Dr. Reetika Pal will review the transaction and confirm your booking. You will be notified via email once approved.
            </div>

            <div className={styles.meetSection} style={{ opacity: 0.6, borderStyle: 'solid', borderColor: 'var(--border)', background: '#f8fafc' }}>
                <p style={{ fontWeight: '700', color: 'var(--muted-foreground)', letterSpacing: '0.05em', fontSize: '0.8rem' }}>YOUR CONSULTATION LINK (AWAITING APPROVAL)</p>
                <div className={styles.linkBox}>
                    <code>{currentMeetLink}</code>
                    <button 
                        className={styles.joinBtn} 
                        disabled
                        style={{ background: '#94a3b8', cursor: 'not-allowed' }}
                    >
                        Join Meet
                    </button>
                </div>
                <span className={styles.saveNote}>Meeting link will become active once payment is verified. You can track status on your profile.</span>
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

    // The old Cashfree callback logic has been removed as it's no longer needed for UPI

    // Auth Guard
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?redirect=/book');
        }
    }, [user, loading, router]);

    // Pre-select patient type from query parameter (?type=India or ?type=International)
    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'India' || typeParam === 'International') {
            if (booking.patientType !== typeParam) {
                updateBooking({ patientType: typeParam });
            }
        }
    }, [searchParams, booking.patientType, updateBooking]);

    if (loading || !user || isVerifying) {
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
