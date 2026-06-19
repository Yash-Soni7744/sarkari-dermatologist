"use client";

import React, { createContext, useContext, useState } from 'react';

export type PatientType = 'India' | 'International';

interface BookingState {
    date: string;
    slot: string;
    patientType: PatientType;
    amount: number;
    details: {
        name: string;
        phone: string;
        email: string;
        concern: string;
        photos: Array<{ url: string; name: string }>;
        meetLink?: string;
    };
    step: 1 | 2 | 3 | 4; // 1: Slot, 2: Details, 3: Payment, 4: Success
    appointmentId?: string;
    paymentReference?: string;
    paymentScreenshot?: string;
    paymentMethod?: string;
}

interface BookingContextType {
    booking: BookingState;
    updateBooking: (data: Partial<BookingState>) => void;
    nextStep: () => void;
    prevStep: () => void;
    resetBooking: () => void;
}

const defaultState: BookingState = {
    date: '',
    slot: '',
    patientType: 'India',
    amount: 999,
    details: {
        name: '',
        phone: '',
        email: '',
        concern: '',
        photos: [],
        meetLink: '',
    },
    step: 1,
    appointmentId: '',
    paymentReference: '',
    paymentScreenshot: '',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [booking, setBooking] = useState<BookingState>(defaultState);

    const updateBooking = (data: Partial<BookingState>) => {
        setBooking(prev => {
            const newState = { ...prev, ...data };
            if (data.patientType) {
                newState.amount = data.patientType === 'India' ? 999 : 3400; // Roughly $40
            }
            return newState;
        });
    };

    const nextStep = () => {
        setBooking(prev => ({ ...prev, step: (prev.step + 1) as any }));
        window.scrollTo(0, 0);
    };
    const prevStep = () => {
        setBooking(prev => ({ ...prev, step: (prev.step - 1) as any }));
        window.scrollTo(0, 0);
    };
    const resetBooking = () => setBooking(defaultState);

    return (
        <AuthContextWrapper>
            <BookingContext.Provider value={{ booking, updateBooking, nextStep, prevStep, resetBooking }}>
                {children}
            </BookingContext.Provider>
        </AuthContextWrapper>
    );
}

// Small wrapper to ensure Booking is inside Auth context if needed
function AuthContextWrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}
