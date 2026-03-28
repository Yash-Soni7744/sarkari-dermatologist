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
  Clock
} from 'lucide-react';
import styles from './profile.module.css';

interface Appointment {
  id: string;
  date: string;
  slot: string;
  status: 'pending' | 'confirmed' | 'completed';
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [user, loading, router]);

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
            apts.push({ id: doc.id, ...doc.data() } as Appointment);
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
    fetchAppointments();
  }, [user]);

  if (loading || !user) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px' }}>Loading profile...</div>
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
    return a.date >= todayStr && (a.status === 'pending' || a.status === 'confirmed');
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
              <span>•</span>
              <span>Blood Group: {user.bloodGroup || '--'}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.primaryBtn} ${styles.disabledBtn}`} disabled>
            <Zap size={18} /> Open Chat
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
                            {apt.slot} • <span className={styles.statusText} data-status={apt.status}>{apt.status}</span>
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
                        <div className={styles.linkDisplay}>
                          <ExternalLink size={12} />
                          <span>{apt.meetLink.substring(0, 20)}...</span>
                        </div>
                        <button className={styles.iconBtn} onClick={() => copyToClipboard(apt.meetLink)} title="Copy Link">
                          <Copy size={16} />
                        </button>
                        <button className={styles.joinBtn} onClick={() => window.open(apt.meetLink.startsWith('http') ? apt.meetLink : `https://${apt.meetLink}`, '_blank')}>
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.emptyState}>No upcoming appointments.</p>
            )}
          </div>

          <div className={styles.appointmentSection}>
            <p className={styles.sectionLabel}>Recent History</p>
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

        {/* Prescriptions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FileText className={styles.cardIcon} size={24} />
            <h2>Prescriptions</h2>
          </div>
          <div className={styles.emptyState}>
            <p>No prescriptions found.</p>
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
            <form className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input type="text" defaultValue={user.name} />
              </div>
              <div className={styles.inputGroup}>
                <label>Age</label>
                <input type="number" defaultValue={user.age} />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input type="email" defaultValue={user.email} disabled />
              </div>
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input type="tel" defaultValue={user.phone} />
              </div>
              <div className={styles.inputGroup}>
                <label>Gender</label>
                <input type="text" defaultValue={user.gender} />
              </div>
              <div className={styles.inputGroup}>
                <label>Blood Group</label>
                <input type="text" defaultValue={user.bloodGroup} />
              </div>
            </form>
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className={styles.primaryBtn} onClick={() => setIsEditModalOpen(false)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
