"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Video, 
  CheckCircle, 
  Clock, 
  Stethoscope,
  LogOut,
  ExternalLink,
  Search,
  Maximize2,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './doctor.module.css';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string;
  slot: string;
  status: 'pending' | 'confirmed' | 'completed';
  meetLink: string;
  photos?: string; // JSON string
  createdAt: Timestamp;
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Protected route for Dr. Reitika (or any logged in doctor)
  useEffect(() => {
    // If we wanted to strictly protect via user.email, we could, 
    // but the hardcoded login handles redirection.
  }, [user, router]);

  useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(apts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: newStatus
      });
    } catch (error) {
      console.error("Update failed:", error);
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

  const filteredApts = appointments.filter(apt => 
    apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    today: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Stethoscope size={48} className="spinner" color="var(--primary)" />
        </div>
      </div>
    );
  }

  return (
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
        <div style={{ display: 'flex', gap: '15px' }}>
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
          <button onClick={handleLogout} className={styles.actionBtn} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={18} /> Logout
          </button>
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
          <div className={styles.statIcon} style={{ background: '#fef9c3', color: '#854d0e' }}><Clock /></div>
          <div>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>New Requests</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#166534' }}><CalendarIcon /></div>
          <div>
            <span className={styles.statValue}>{stats.today}</span>
            <span className={styles.statLabel}>Appointments Today</span>
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
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className={`${styles.actionBtn} ${styles.joinBtn}`}
                        onClick={() => window.open(apt.meetLink.startsWith('http') ? apt.meetLink : `https://${apt.meetLink}`, '_blank')}
                      >
                        <ExternalLink size={14} style={{ marginRight: '5px' }} /> Join
                      </button>
                      {apt.status !== 'completed' && (
                        <button 
                          className={`${styles.actionBtn} ${styles.completeBtn}`}
                          onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted-foreground)' }}>
              No appointments found.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
