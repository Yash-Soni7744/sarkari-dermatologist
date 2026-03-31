// src/components/Chat/ChatWindow.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  Phone, 
  Video, 
  Copy, 
  Check, 
  Loader2,
  Stethoscope,
  ChevronLeft
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './ChatWindow.module.css';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  fileUrl?: string;
  fileType?: string;
}

interface ChatWindowProps {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
  otherPartyPhone?: string;
  meetLink?: string;
  onClose: () => void;
  isDoctor?: boolean;
}

export default function ChatWindow({ 
  chatId, 
  currentUserId, 
  currentUserName, 
  otherPartyName, 
  otherPartyPhone,
  meetLink,
  onClose,
  isDoctor = false
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time listener for messages
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Chat[${chatId}] update: ${snapshot.docs.length} messages`);
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
    }, (error) => {
        console.error("🔥 Firestore Chat Error:", error);
    });

    return () => unsubscribe();
  }, [chatId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !isUploading) return;

    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: textToSend,
        senderId: currentUserId,
        senderName: currentUserName,
        timestamp: serverTimestamp()
      });
      console.log(`Message sent to Chat[${chatId}]`);
    } catch (error) {
      console.error("🔥 Send Message Error:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
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
          
          // Quality 0.5 JPEG is very small but clear for medical photos
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Image Load Error"));
      };
      reader.onerror = () => reject(new Error("File Read Error"));
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject non-image files over 1MB
    const MAX_RAW_SIZE = 1 * 1024 * 1024; // 1MB
    if (!file.type.startsWith('image/') && file.size > MAX_RAW_SIZE) {
        alert("File too large. Please upload files under 1MB.");
        return;
    }

    setIsUploading(true);
    try {
      let finalFileUrl = "";
      
      if (file.type.startsWith('image/')) {
        // Compress images
        finalFileUrl = await compressImage(file);
        console.log(`Image compressed. Final size: ${(finalFileUrl.length / 1024).toFixed(1)} KB`);
      } else {
        // Just read as Base64 for other small files
        const reader = new FileReader();
        reader.readAsDataURL(file);
        finalFileUrl = await new Promise((resolve) => {
            reader.onload = (event) => resolve(event.target?.result as string);
        });
      }

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: `Shared a file: ${file.name}`,
        fileUrl: finalFileUrl,
        fileType: file.type,
        senderId: currentUserId,
        senderName: currentUserName,
        timestamp: serverTimestamp()
      });
      console.log(`File message sent to Chat[${chatId}]`);
      setIsUploading(false);
    } catch (error) {
      console.error("🔥 Upload Error:", error);
      alert("Failed to upload file.");
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (otherPartyPhone) {
      navigator.clipboard.writeText(otherPartyPhone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '...';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.window} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.doctorBranding}>
            <button className={styles.iconBtn} onClick={onClose} style={{ marginRight: '5px' }}>
                <ChevronLeft size={24} />
            </button>
            <div className={styles.avatarSmall}>
              {isDoctor ? otherPartyName[0] : 'DR'}
            </div>
            <div>
              <div className={styles.drName}>
                {isDoctor ? otherPartyName : 'Dr. Reetika Pal'}
              </div>
              <div className={styles.status}>Online • Active Consultation</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            {otherPartyPhone && (
              <button 
                className={styles.iconBtn} 
                onClick={copyToClipboard} 
                title="Copy Mobile Number"
              >
                {isCopied ? <Check size={20} /> : <Phone size={20} />}
              </button>
            )}
            {meetLink && (
              <button 
                className={styles.iconBtn} 
                onClick={() => window.open(meetLink.startsWith('http') ? meetLink : `https://${meetLink}`, '_blank')}
                title="Join Video Consultation"
              >
                <Video size={20} />
              </button>
            )}
            <button className={styles.iconBtn} onClick={onClose} title="Close Chat">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className={styles.messageList} ref={scrollRef}>
          <div className={styles.welcomeRibbon}>
            <Stethoscope size={16} /> Welcome to your consultation with Dr. Reetika. How can we help you today?
          </div>
          
          {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              className={`${styles.bubble} ${msg.senderId === currentUserId ? styles.sent : styles.received}`}
            >
              {msg.fileUrl && (
                <img 
                  src={msg.fileUrl} 
                  alt="Shared file" 
                  className={styles.imageMsg} 
                  onClick={() => setSelectedImage(msg.fileUrl || null)}
                />
              )}
              <div className={styles.msgText}>{msg.text}</div>
              <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
            </div>
          ))}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontSize: '0.9rem' }}>
              No messages yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Input */}
        <form className={styles.inputArea} onSubmit={handleSendMessage}>
          <button 
            type="button" 
            className={styles.iconBtn} 
            style={{ color: '#0d9488' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="spinner" size={24} /> : <Paperclip size={24} />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            accept="image/*,.pdf"
          />
          <input 
            className={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            disabled={isUploading}
          />
          <button 
            type="submit" 
            className={styles.sendBtn}
            disabled={(!newMessage.trim() && !isUploading) || isUploading}
          >
            <Send size={20} />
          </button>
        </form>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div className={styles.imageModalOverlay} onClick={() => setSelectedImage(null)}>
            <div className={styles.imageModalContent} onClick={e => e.stopPropagation()}>
              <button className={styles.closeImageModal} onClick={() => setSelectedImage(null)}>
                <X size={24} />
              </button>
              <img src={selectedImage} alt="Preview" className={styles.fullImage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
