"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Video, 
  CheckCircle, 
  Stethoscope, 
  LogOut,
  ExternalLink,
  Search,
  Maximize2,
  X,
  FileText,
  ClipboardList,
  Plus,
  Trash2,
  MessageCircle,
  CreditCard
} from 'lucide-react';
import ChatWindow from '@/components/Chat/ChatWindow';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  orderBy,
  Timestamp,
  addDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import styles from './doctor.module.css';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientId: string;
  patientPhone?: string;
  date: string;
  slot: string;
  status: 'pending' | 'pending_verification' | 'confirmed' | 'completed' | 'rejected';
  meetLink: string;
  photos?: string; // JSON string
  paymentScreenshot?: string;
  verificationStatus?: string;
  createdAt: Timestamp;
}

export default function DoctorDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_verification' | 'confirmed' | 'completed'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [reviewingApt, setReviewingApt] = useState<Appointment | null>(null);
  const [activeApt, setActiveApt] = useState<Appointment | null>(null);
  const [activeChat, setActiveChat] = useState<Appointment | null>(null);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: [{ name: '', strength: '', instructions: '', duration: '' }],
    advice: '',
    followUpPeriod: '7 days',
    followUpMode: 'Online'
  });

  const getWhatsAppLink = (patientPhone?: string) => {
    if (!patientPhone) return '#';
    const cleanPhone = patientPhone.replace(/[\s+-]/g, '');
    let finalPhone = cleanPhone;
    if (finalPhone.length === 10) {
      finalPhone = `91${finalPhone}`;
    }
    const message = encodeURIComponent("Hello! I am Dr. Reetika Pal. I am ready for our scheduled dermatology video consultation. Please confirm if I can initiate the WhatsApp video call now.");
    return `https://wa.me/${finalPhone}?text=${message}`;
  };


  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'doctor') return;

    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const apts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];

      // Filter out raw pending (unsubmitted/unpaid) appointments, but keep pending_verification
      const validApts = apts.filter(apt => apt.status !== 'pending' && apt.status !== 'rejected');

      // Automatic status transition for past appointments
      for (const apt of apts) {
        if (apt.status === 'confirmed' && apt.date < today) {
          try {
            await updateDoc(doc(db, "appointments", apt.id), {
              status: 'completed'
            });
          } catch (e) {
            console.error("Auto-complete failed for", apt.id, e);
          }
        }
      }

      setAppointments(validApts);
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error("Firestore snapshot error:", err);
      setError(err.message || "Failed to load appointments due to insufficient permissions or database error.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (newStatus === 'completed') {
      const confirmed = window.confirm("This can't be undone. Are you sure you want to mark this appointment as complete?");
      if (!confirmed) return;
    }

    try {
      await updateDoc(doc(db, "appointments", id), {
        status: newStatus
      });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await updateDoc(doc(db, "appointments", id), {
          status: 'confirmed',
          paymentStatus: 'paid',
          verificationStatus: 'verified'
        });
        alert("Booking approved and confirmed!");
      } else {
        const confirmReject = window.confirm("Are you sure you want to reject this payment screenshot? This will reset the booking status to pending payment.");
        if (!confirmReject) return;
        await updateDoc(doc(db, "appointments", id), {
          status: 'pending',
          verificationStatus: 'rejected',
          paymentScreenshot: ''
        });
        alert("Payment screenshot rejected. Patient will need to re-upload proof.");
      }
      setReviewingApt(null);
    } catch (error) {
      console.error("Error updating verification status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleOpenPrescription = (apt: Appointment) => {
    setActiveApt(apt);
    setIsPrescriptionModalOpen(true);
  };

  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', strength: '', instructions: '', duration: '' }]
    }));
  };

  const removeMedication = (index: number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...prescriptionForm.medications];
    (newMeds[index] as any)[field] = value;
    setPrescriptionForm(prev => ({ ...prev, medications: newMeds }));
  };

  const savePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApt) return;
    setIsSavingPrescription(true);
    try {
      // Fetch patient demographics
      const patientSnap = await getDoc(doc(db, "users", (activeApt as any).patientId));
      const patientData = patientSnap.exists() ? patientSnap.data() : {};
      
      const prescriptionData = {
        appointmentId: activeApt.id,
        patientId: (activeApt as any).patientId || null,
        patientEmail: (activeApt as any).patientEmail || null,
        patientName: activeApt.patientName,
        patientAge: patientData.age || 'N/A',
        patientGender: patientData.gender || 'N/A',
        patientContact: patientData.phone || 'N/A',
        doctorName: "Dr. Reetika Pal",
        doctorDegree: "MBBS, MD (Dermatology, Venereology & Leprosy)",
        registrationNo: "51656 (Delhi Medical Council)",
        date: new Date().toISOString().split('T')[0],
        diagnosis: prescriptionForm.diagnosis,
        medications: prescriptionForm.medications,
        advice: prescriptionForm.advice,
        followUp: {
          period: prescriptionForm.followUpPeriod,
          mode: prescriptionForm.followUpMode
        },
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, "prescriptions"), prescriptionData);
      
      // Auto-complete appointment if confirmed
      if (activeApt.status === 'confirmed') {
        await updateDoc(doc(db, "appointments", activeApt.id), {
          status: 'completed'
        });
      }

      setIsPrescriptionModalOpen(false);
      alert("Prescription saved successfully!");
    } catch (error) {
      console.error("Prescription Save Error:", error);
      alert("Failed to save prescription.");
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/doctor-login');
  };

  const parsePhotos = (jsonStr?: string) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Parse error:", e);
      return [];
    }
  };

  const filteredApts = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'pending_verification') {
      return matchesSearch && apt.status === 'pending_verification';
    }
    if (filterStatus === 'confirmed') {
      return matchesSearch && apt.status === 'confirmed' && apt.date >= today;
    }
    if (filterStatus === 'completed') {
      return matchesSearch && (apt.status === 'completed' || apt.date < today);
    }
    return matchesSearch;
  });

  const stats = {
    total: appointments.length,
    today: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pendingVerification: appointments.filter(a => a.status === 'pending_verification').length,
  };

  return (
    <ProtectedRoute allowedRole="doctor">
      {loading ? (
        <div className={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Stethoscope size={48} className="spinner" color="var(--primary)" />
          </div>
        </div>
      ) : error ? (
        <div className={styles.container} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', maxWidth: '450px', width: '90%', textAlign: 'center' }}>
            <div style={{ background: '#fee2e2', color: '#ef4444', padding: '16px', borderRadius: '50%' }}>
              <Stethoscope size={36} />
            </div>
            <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.4rem' }}>Connection Error</h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                background: '#0d9488', 
                color: 'white', 
                padding: '12px 24px', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600',
                transition: 'background-color 0.2s',
                width: '100%'
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.container}>
      {/* Photo Expansion Modal */}
      {selectedPhoto && (
        <div className={styles.modal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedPhoto(null)}>
              <X size={32} />
            </button>
            <img src={selectedPhoto} alt="Full Resolution" />
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.doctorInfo}>
          <h1>
            <Stethoscope size={32} color="var(--primary)" />
            Welcome, Dr. Reitika
            <span className={styles.badge}>Chief Dermatologist</span>
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '5px' }}>
            Managing your online dermatology practice
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', width: '250px' }}
            />
          </div>
          <select 
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{ 
              padding: '12px', 
              borderRadius: '12px', 
              border: '1px solid var(--border)', 
              background: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              color: 'var(--primary)'
            }}
          >
            <option value="all">All Appointments</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="confirmed">Confirmed (Upcoming)</option>
            <option value="completed">Completed (History)</option>
          </select>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users /></div>
          <div>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Patients</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#166534' }}><CalendarIcon /></div>
          <div>
            <span className={styles.statValue}>{stats.today}</span>
            <span className={styles.statLabel}>Appointments Today</span>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => setFilterStatus('pending_verification')} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div className={styles.statIcon} style={{ background: '#fef9c3', color: '#854d0e' }}><CreditCard /></div>
          <div>
            <span className={styles.statValue}>{stats.pendingVerification}</span>
            <span className={styles.statLabel}>Pending Review</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0e7ff', color: '#3730a3' }}><CheckCircle /></div>
          <div>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Consulted</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
             <Video size={20} color="var(--primary)" /> Recent Appointments
          </h2>
          
          {/* Desktop Table View */}
          <div className={styles.desktopView}>
            <table className={styles.aptTable}>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Schedule</th>
                  <th>Symptoms / Photos</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApts.map(apt => (
                  <tr key={apt.id} className={styles.aptRow}>
                    <td>
                      <div className={styles.patientCell}>
                        <div className={styles.avatar}>{apt.patientName.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: '700' }}>{apt.patientName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{apt.patientEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{apt.date}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{apt.slot}</div>
                    </td>
                    <td>
                      <div className={styles.gallery}>
                        {parsePhotos(apt.photos).map((p: any, i: number) => (
                          <div key={i} className={styles.thumbnail} onClick={() => setSelectedPhoto(p.url)} title="View full image">
                            <img src={p.url} alt="Medical Photo" />
                          </div>
                        ))}
                        {(!apt.photos || parsePhotos(apt.photos).length === 0) && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>No photos uploaded</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.status} data-status={apt.status}>
                        {apt.status === 'pending_verification' ? 'Pending Review' : apt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {apt.status === 'pending_verification' ? (
                          <button 
                            className={styles.actionBtn}
                            onClick={() => setReviewingApt(apt)}
                            title="Review Payment Proof"
                            style={{ background: '#fef9c3', color: '#854d0e', borderColor: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <CreditCard size={18} /> Review Payment
                          </button>
                        ) : (
                          <>
                            <button 
                              className={`${styles.actionBtn} ${styles.joinBtn}`}
                              onClick={() => {
                                const link = getWhatsAppLink(apt.patientPhone);
                                if (link !== '#') window.open(link, '_blank');
                                else alert('Patient phone number is not available.');
                              }}
                              title="Start Video Call on WhatsApp"
                              style={{ background: '#25d366', color: 'white', borderColor: '#25d366' }}
                            >
                              <MessageCircle size={18} />
                            </button>
                            <button 
                              className={`${styles.actionBtn} ${styles.prescriptionBtn}`}
                              onClick={() => handleOpenPrescription(apt)}
                              title="Write Prescription"
                              style={{ background: '#f0fdfa', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            >
                              <FileText size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          className={styles.actionBtn}
                          onClick={() => setActiveChat(apt)}
                          title="Open Chat"
                          style={{ background: '#f0fdfa', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                        >
                          <MessageCircle size={18} />
                        </button>
                        {apt.status !== 'completed' && apt.status !== 'pending_verification' && (
                          <button 
                            className={`${styles.actionBtn} ${styles.completeBtn}`}
                            onClick={() => handleStatusUpdate(apt.id, 'completed')}
                            title="Mark Complete"
                            style={{ background: '#f0fdfa', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.mobileView}>
            <div className={styles.mobileAptList}>
              {filteredApts.map(apt => (
                <div key={apt.id} className={styles.mobileAptCard}>
                  <div className={styles.mobCardHeader}>
                    <div className={styles.patientCell}>
                      <div className={styles.avatar}>{apt.patientName.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: '700' }}>{apt.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{apt.slot} • {apt.date}</div>
                      </div>
                    </div>
                    <span className={styles.status} data-status={apt.status}>
                      {apt.status === 'pending_verification' ? 'Pending Review' : apt.status}
                    </span>
                  </div>
                  
                  <div className={styles.mobCardBody}>
                    <div className={styles.gallery}>
                      {parsePhotos(apt.photos).map((p: any, i: number) => (
                        <div key={i} className={styles.thumbnail} onClick={() => setSelectedPhoto(p.url)}>
                          <img src={p.url} alt="Medical" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.mobCardFooter}>
                    {apt.status === 'pending_verification' ? (
                      <button 
                        className={styles.actionBtn}
                        onClick={() => setReviewingApt(apt)}
                        style={{ background: '#fef9c3', color: '#854d0e', borderColor: '#eab308', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <CreditCard size={18} /> Review Payment
                      </button>
                    ) : (
                      <>
                        <button 
                          className={`${styles.actionBtn} ${styles.joinBtn}`}
                          onClick={() => {
                            const link = getWhatsAppLink(apt.patientPhone);
                            if (link !== '#') window.open(link, '_blank');
                            else alert('Patient phone number is not available.');
                          }}
                          style={{ background: '#25d366', color: 'white', borderColor: '#25d366' }}
                        >
                          <MessageCircle size={18} /> Call
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${styles.prescriptionBtn}`}
                          onClick={() => handleOpenPrescription(apt)}
                          style={{ background: '#f0fdfa', color: 'var(--primary)', borderColor: 'var(--primary)', flex: 1 }}
                        >
                          <FileText size={18} /> Prescription
                        </button>
                      </>
                    )}
                    <button 
                      className={styles.actionBtn}
                      onClick={() => setActiveChat(apt)}
                      style={{ background: '#f0fdfa', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    >
                      <MessageCircle size={18} />
                    </button>
                    {apt.status !== 'completed' && apt.status !== 'pending_verification' && (
                      <button 
                        className={`${styles.actionBtn} ${styles.completeBtn}`}
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        style={{ border: '1px solid var(--border)', background: 'white' }}
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredApts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted-foreground)' }}>
              No appointments found.
            </div>
          )}
        </section>
      </div>
      {/* Prescription Form Modal */}
      {isPrescriptionModalOpen && activeApt && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '1000px', width: '95%' }}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClipboardList color="var(--primary)" size={24} />
                <h2 style={{ margin: 0 }}>Create E-Prescription</h2>
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => setIsPrescriptionModalOpen(false)}
                style={{ top: '25px', right: '25px', color: 'var(--muted-foreground)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={savePrescription} className={styles.prescriptionForm}>
              <div className={styles.formSection}>
                <h3>Patient Details</h3>
                <div className={styles.detailsRow}>
                  <span><strong>Patient:</strong> {activeApt.patientName}</span>
                  <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3>Clinical Summary</h3>
                <label>Diagnosis / Provisional Diagnosis</label>
                <textarea 
                  value={prescriptionForm.diagnosis}
                  onChange={e => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                  placeholder="Summarize the diagnosis based on teleconsultation..."
                  required
                />
              </div>

              <div className={styles.formSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3>Medications</h3>
                  <button type="button" onClick={addMedication} className={styles.addBtn}>
                    <Plus size={16} /> Add Medicine
                  </button>
                </div>
                <div className={styles.medsTable}>
                  {prescriptionForm.medications.map((med, index) => (
                    <div key={index} className={styles.medRow}>
                      <input 
                        placeholder="Medication Name"
                        value={med.name}
                        onChange={e => updateMedication(index, 'name', e.target.value)}
                        required
                      />
                      <input 
                        placeholder="Strength"
                        value={med.strength}
                        onChange={e => updateMedication(index, 'strength', e.target.value)}
                        required
                      />
                      <input 
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={e => updateMedication(index, 'instructions', e.target.value)}
                        required
                      />
                      <input 
                        placeholder="Duration"
                        value={med.duration}
                        onChange={e => updateMedication(index, 'duration', e.target.value)}
                        required
                      />
                      {prescriptionForm.medications.length > 1 && (
                        <button type="button" onClick={() => removeMedication(index)} className={styles.removeBtn}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formSection}>
                <h3>General Instructions / Advice</h3>
                <textarea 
                  value={prescriptionForm.advice}
                  onChange={e => setPrescriptionForm({ ...prescriptionForm, advice: e.target.value })}
                  placeholder="Lifestyle advice, application methods, precautions..."
                />
              </div>

              <div className={styles.formSection}>
                <h3>Follow-up Plan</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Review After</label>
                    <input 
                      value={prescriptionForm.followUpPeriod}
                      onChange={e => setPrescriptionForm({ ...prescriptionForm, followUpPeriod: e.target.value })}
                      placeholder="e.g., 7 days"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Follow-up Mode</label>
                    <select 
                      value={prescriptionForm.followUpMode}
                      onChange={e => setPrescriptionForm({ ...prescriptionForm, followUpMode: e.target.value })}
                    >
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.secondaryBtn} 
                  onClick={() => setIsPrescriptionModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.primaryBtn} 
                  disabled={isSavingPrescription}
                >
                  {isSavingPrescription ? "Generating..." : "Save & Generate Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Payment Modal */}
      {reviewingApt && (
        <div className={styles.modal} onClick={() => setReviewingApt(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard color="var(--primary)" size={24} />
                <h2 style={{ margin: 0 }}>Verify Payment Screenshot</h2>
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => setReviewingApt(null)}
                style={{ top: '25px', right: '25px', color: 'var(--muted-foreground)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '12px', fontSize: '0.9rem' }}>
                  <div><strong>Patient Name:</strong> {reviewingApt.patientName}</div>
                  <div><strong>Email:</strong> {reviewingApt.patientEmail}</div>
                  <div><strong>Appointment Date:</strong> {reviewingApt.date}</div>
                  <div><strong>Time Slot:</strong> {reviewingApt.slot}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', marginBottom: '10px', fontSize: '0.95rem' }}>Uploaded Proof:</p>
                  {reviewingApt.paymentScreenshot ? (
                    <div 
                      style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', maxHeight: '350px', background: '#eee', display: 'inline-block', cursor: 'pointer' }}
                      onClick={() => setSelectedPhoto(reviewingApt.paymentScreenshot || null)}
                      title="Click to view full screen"
                    >
                      <img 
                        src={reviewingApt.paymentScreenshot} 
                        alt="Payment Screenshot" 
                        style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', display: 'block' }} 
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '30px', background: '#fef2f2', color: '#ef4444', borderRadius: '12px', fontWeight: '500' }}>
                      No screenshot uploaded!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter} style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: 0, paddingTop: '15px' }}>
              <button 
                type="button" 
                className={styles.secondaryBtn} 
                onClick={() => handleReviewAction(reviewingApt.id, 'reject')}
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                Reject Payment
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className={styles.secondaryBtn} 
                  onClick={() => setReviewingApt(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={styles.primaryBtn} 
                  onClick={() => handleReviewAction(reviewingApt.id, 'approve')}
                  style={{ background: '#10b981' }}
                >
                  Approve Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window Overlay */}
      {activeChat && (
        <ChatWindow 
          chatId={activeChat.patientId}
          currentUserId={user?.id || 'doctor'}
          currentUserName="Dr. Reetika"
          otherPartyName={activeChat.patientName}
          otherPartyPhone={activeChat.patientPhone}
          meetLink={activeChat.meetLink}
          onClose={() => setActiveChat(null)}
          isDoctor={true}
        />
      )}
      </div>
      )}
    </ProtectedRoute>
  );
}
