import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import "./globals.css";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: "--font-lato"
});

export const metadata: Metadata = {
  title: "Sarkari Dermatologist | Online Consultations",
  description: "Expert dermatology care for India and international patients. Book your online consultation today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lato.variable}`}>
        <AuthProvider>
          <BookingProvider>
            <ScrollToTop />
            <Header />
            <main style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
              {children}
            </main>
            <Footer />
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


