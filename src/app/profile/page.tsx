"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { 
  User as UserIcon, 
  Calendar, 
  FileText, 
  Activity, 
  Copy, 
  ExternalLink, 
  LogOut, 
  Edit3, 
  X,
  Plus,
  Zap,
  FileText as FileTextIcon,
  CheckCircle2,
  Clock,
  Loader2,
  Stethoscope,
  ClipboardList,
  MessageCircle
} from 'lucide-react';
import ChatWindow from '@/components/Chat/ChatWindow';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import styles from './profile.module.css';

interface Appointment {
  id: string;
  date: string;
  slot: string;
  status: 'pending' | 'pending_verification' | 'confirmed' | 'completed' | 'rejected';
  meetLink: string;
  patientId: string;
  photoUrl?: string; // Legacy
  photos?: string; // New Bulletproof JSON format
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFetchingApts, setIsFetchingApts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    phone: '',
    gender: '',
    email: ''
  });
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isFetchingPrescriptions, setIsFetchingPrescriptions] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [activeChat, setActiveChat] = useState<Appointment | null>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (isEditModalOpen && user) {
      setEditForm({
        name: user.name || '',
        age: user.age || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
        email: user.email || ''
      });
    }
  }, [isEditModalOpen, user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const { updateUser } = useAuth();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser(editForm);
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Save Error:", error);
      alert(error?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, "appointments"),
            where("patientId", "==", user.id)
          );
          const querySnapshot = await getDocs(q);
          const apts: Appointment[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status !== 'pending') {
              apts.push({ id: doc.id, ...data } as Appointment);
            }
          });
          // Sort in-memory to avoid index error
          apts.sort((a, b) => b.date.localeCompare(a.date));
          setAppointments(apts);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setIsFetchingApts(false);
        }
      }
    };
    const fetchPrescriptions = async () => {
      if (user) {
        try {
          console.log("Fetching prescriptions for:", user.email, user.id);
          // Query by email first as it's the most reliable unique link
          const q = query(
            collection(db, "prescriptions"),
            where("patientEmail", "==", user.email)
          );
          const querySnapshot = await getDocs(q);
          const items: any[] = [];
          
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });

          // Sort in-memory to avoid missing index errors
          items.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
          });
          
          console.log("Found prescriptions:", items.length);
          setPrescriptions(items);
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
        } finally {
          setIsFetchingPrescriptions(false);
        }
      }
    };

    fetchAppointments();
    fetchPrescriptions();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="page-loader">
        <LoadingSpinner size={64} />
      </div>
    );
  }

  const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalTodayStr();

  const upcomingApts = appointments.filter(a => {
    return a.date >= todayStr && (a.status === 'pending' || a.status === 'pending_verification' || a.status === 'confirmed');
  });

  const previousApts = appointments.filter(a => !upcomingApts.find(u => u.id === a.id));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Meeting link copied!");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return { day, month };
  };

  return (
    <ProtectedRoute allowedRole="patient">
      <div className={styles.container}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <div className={styles.avatarLarge}>
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name[0]}
          </div>
          <div className={styles.userDetails}>
            <h1>
              {user.name}
              <span className={styles.roleBadge}>Patient</span>
            </h1>
            <p className={styles.contactInfo}>{user.email} • {user.phone}</p>
            <div className={styles.metaInfo}>
              <span>{user.age || '--'} Years</span>
              <span>•</span>
              <span>{user.gender || '--'}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.primaryBtn} 
            onClick={() => {
              if (upcomingApts.length > 0) {
                setActiveChat(upcomingApts[0]);
              } else if (appointments.length > 0) {
                setActiveChat(appointments[0]);
              } else {
                alert("You need at least one appointment to start a chat with Dr. Reetika.");
              }
            }}
          >
            <MessageCircle size={18} /> Open Chat
          </button>
          <button className={styles.secondaryBtn} onClick={() => setIsEditModalOpen(true)}>
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className={styles.dashboardGrid}>
        {/* Medical History */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Activity className={styles.cardIcon} size={24} />
            <h2>Medical History</h2>
          </div>
          <div className={styles.emptyState}>
            <p>No medical history recorded yet.</p>
          </div>
        </div>

        {/* Appointments */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Calendar className={styles.cardIcon} size={24} />
            <h2>Appointments</h2>
          </div>
          
          <div className={styles.appointmentSection}>
            <p className={styles.sectionLabel}>Upcoming</p>
            <div className={styles.scrollContainer}>
              {upcomingApts.length > 0 ? (
                upcomingApts.map(apt => {
                const { day, month } = formatDate(apt.date);
                return (
                  <div key={apt.id} className={styles.appointmentCard}>
                    <div className={styles.dateBox}>
                      <span className={styles.day}>{day}</span>
                      <span className={styles.month}>{month}</span>
                    </div>
                    <div className={styles.aptInfo}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4>Video Consultation</h4>
                          <p className={styles.aptMeta}>
                            <Clock size={14} style={{ marginRight: '4px' }} />
                            {apt.slot} • <span className={styles.statusText} data-status={apt.status}>{apt.status === 'pending_verification' ? 'pending verification' : apt.status}</span>
                          </p>
                        </div>
                        {(() => {
                          let displayUrl = apt.photoUrl;
                          if (apt.photos) {
                            try {
                              const gallery = JSON.parse(apt.photos);
                              if (gallery && gallery.length > 0) {
                                displayUrl = gallery[0].url;
                              }
                            } catch (e) {
                              console.error("Parse error:", e);
                            }
                          }
                          
                          return displayUrl ? (
                            <div className={styles.aptPhotoPreview}>
                              <img src={displayUrl} alt="Consultation Photo" />
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <div className={styles.joinSection}>
                        {apt.status === 'pending_verification' ? (
                          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', color: '#854d0e', background: '#fef9c3', padding: '8px', borderRadius: '8px', border: '1px solid #fef08a', fontWeight: '600' }}>
                            Awaiting payment verification by doctor
                          </div>
                        ) : apt.meetLink && apt.meetLink.includes('wa.me') ? (
                          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
                            <p style={{ fontSize: '0.85rem', margin: '0 0 4px', color: 'var(--muted-foreground)', fontWeight: '500' }}>
                              Consultation via WhatsApp video call.
                            </p>
                            <button 
                              className={styles.joinBtn} 
                              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '10px 0' }}
                              onClick={() => window.open(apt.meetLink, '_blank')}
                            >
                              <MessageCircle size={14} /> Message Doctor
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className={styles.linkDisplay}>
                              <ExternalLink size={12} />
                              <span>{apt.meetLink?.substring(0, 20)}...</span>
                            </div>
                            <button className={styles.iconBtn} onClick={() => copyToClipboard(apt.meetLink || '')} title="Copy Link">
                              <Copy size={16} />
                            </button>
                            <button className={styles.joinBtn} onClick={() => window.open(apt.meetLink && apt.meetLink.startsWith('http') ? apt.meetLink : `https://${apt.meetLink}`, '_blank')}>
                              Join
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.emptyState}>No upcoming appointments.</p>
            )}
            </div>
          </div>

          <div className={styles.appointmentSection}>
            <p className={styles.sectionLabel}>Recent History</p>
            <div className={styles.scrollContainer}>
              {previousApts.length > 0 ? (
                previousApts.map(apt => (
                  <div key={apt.id} className={styles.historyItem}>
                    <span>Video Consult</span>
                    <span>{apt.date}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No recent history.</p>
              )}
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FileText className={styles.cardIcon} size={24} />
            <h2>Medical Prescriptions</h2>
          </div>
          <div className={styles.prescriptionList + ' ' + styles.scrollContainer}>
            {isFetchingPrescriptions ? (
              <div className={styles.emptyState}>
                <Loader2 className="spinner" size={20} />
                <p>Fetching prescriptions...</p>
              </div>
            ) : prescriptions.length > 0 ? (
              prescriptions.map(pres => {
                const { day, month } = formatDate(pres.date || new Date().toISOString());
                return (
                  <div key={pres.id} className={styles.prescriptionCard} onClick={() => setSelectedPrescription(pres)}>
                    <div className={styles.dateBox}>
                      <span className={styles.day}>{day}</span>
                      <span className={styles.month}>{month}</span>
                    </div>
                    <div className={styles.presContent}>
                      <h4>Diagnosis</h4>
                      <p>{pres.medications?.length || 0} Medicines Prescribed</p>
                    </div>
                    <button className={styles.viewPresBtn} title="View Letterhead">
                      <FileText size={20} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>No prescriptions found yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>
              <X size={24} />
            </button>
            <h2 className={styles.modalTitle}>Edit Profile</h2>
            <form className={styles.formGrid} onSubmit={handleSave}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input 
                  name="name"
                  type="text" 
                  value={editForm.name} 
                  onChange={handleEditChange} 
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Age</label>
                <input 
                  name="age"
                  type="number" 
                  value={editForm.age} 
                  onChange={handleEditChange} 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  value={editForm.email} 
                  onChange={handleEditChange} 
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input 
                  name="phone"
                  type="tel" 
                  value={editForm.phone} 
                  onChange={handleEditChange} 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Gender</label>
                <select 
                  name="gender" 
                  value={editForm.gender} 
                  onChange={handleEditChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </form>
            <div className={styles.modalFooter}>
              <button 
                className={styles.secondaryBtn} 
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className={styles.primaryBtn} 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Prescription Viewer Modal */}
      {selectedPrescription && (
        <div className={styles.prescriptionOverlay} onClick={() => setSelectedPrescription(null)}>
          <div className={styles.letterheadContainer} onClick={e => e.stopPropagation()}>
            <button className={styles.closeLetterhead} onClick={() => setSelectedPrescription(null)}>
              <X size={24} />
            </button>

            {/* Letterhead Header */}
            <div className={styles.lhHeader}>
              <div className={styles.doctorBranding}>
                <div className={styles.lhLogo}>
                  <Stethoscope size={40} color="var(--primary)" />
                </div>
                <div>
                  <h1 className={styles.drName}>DR. REETIKA PAL</h1>
                  <p className={styles.drDegree}>MBBS, MD (Dermatology)</p>
                  <p className={styles.drTitle}>Consultant Dermatologist & Trichologist</p>
                  <p className={styles.drLocation}>Online Consultation | 🇮🇳 India</p>
                </div>
              </div>
            </div>

            <div className={styles.lhMeta}>
              <div className={styles.metaRow}>
                <span><strong>Date:</strong> {selectedPrescription.date}</span>
                <span><strong>Prescription ID:</strong> {selectedPrescription.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className={styles.metaRow}>
                <span><strong>Patient Name:</strong> {selectedPrescription.patientName}</span>
                <span><strong>Age / Gender:</strong> {selectedPrescription.patientAge} / {selectedPrescription.patientGender}</span>
                <span><strong>Contact:</strong> {selectedPrescription.patientContact}</span>
              </div>
            </div>

            <div className={styles.lhSection}>
              <h3 className={styles.lhSectionTitle}>CLINICAL SUMMARY</h3>
              <div className={styles.diagnosisBox}>
                <div className={styles.diagnosisContent}>{selectedPrescription.diagnosis}</div>
                <p className={styles.lhDisclaimer}>(Based on history, images, and teleconsultation)</p>
              </div>
            </div>

            <div className={styles.lhSection}>
              <div className={styles.rxSymbol}>Rx</div>
              <h3 className={styles.lhSectionTitle}>PRESCRIPTION</h3>
              <table className={styles.medTable}>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Strength</th>
                    <th>Instructions</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrescription.medications?.map((med: any, i: number) => (
                    <tr key={i}>
                      <td><strong>{med.name}</strong></td>
                      <td>{med.strength}</td>
                      <td>{med.instructions}</td>
                      <td>{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.lhSection}>
              <h3 className={styles.lhSectionTitle}>GENERAL INSTRUCTIONS / ADVICE</h3>
              <div className={styles.adviceList}>
                {selectedPrescription.advice?.split('\n').filter((line: string) => line.trim()).map((line: string, i: number) => (
                  <div key={i} className={styles.adviceItem}>
                    <CheckCircle2 className={styles.adviceIcon} size={18} />
                    <span>{line.replace(/^•\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.lhSection}>
              <h3 className={styles.lhSectionTitle}>FOLLOW-UP PLAN</h3>
              <p>Review after: <strong>{selectedPrescription.follow_up?.period || selectedPrescription.followUp?.period || 'N/A'}</strong></p>
              <p>Mode: <strong>{selectedPrescription.follow_up?.mode || selectedPrescription.followUp?.mode || 'Online'}</strong></p>
            </div>

            <div className={styles.lhSignature}>
              <div className={styles.sigBlock}>
                <p className={styles.sigName}>Dr. Reetika Pal</p>
                <p className={styles.sigDegree}>MBBS, MD (Dermatology, Venereology & Leprosy)</p>
                <p className={styles.sigReg}>Reg No: {selectedPrescription.registrationNo || '51656 (Delhi Medical Council)'}</p>
                <p className={styles.sigDigital}>(Digitally signed)</p>
              </div>
            </div>

            <div className={styles.lhFooter}>
              <p>Issued via teleconsultation as per NMC Telemedicine Practice Guidelines, India. No guarantee of cure or cosmetic outcome is implied.</p>
            </div>
          </div>
        </div>
      )}
      {/* Chat Window Overlay */}
      {activeChat && (
        <ChatWindow 
          chatId={user.id}
          currentUserId={user.id}
          currentUserName={user.name}
          otherPartyName="Dr. Reetika Pal"
          meetLink={activeChat.meetLink}
          onClose={() => setActiveChat(null)}
          isDoctor={false}
        />
      )}
      </div>
    </ProtectedRoute>
  );
}
