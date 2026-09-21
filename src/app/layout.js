import React from 'react';
import Providers from '@/components/providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Box } from '@mui/material';
import './globals.css';

export const metadata = {
  title: 'NextBus - Premium Bus Ticket Booking Platform',
  description: 'Book luxury and standard bus tickets with real-time GPS tracking, instant QR e-tickets, and interactive seat selection.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#F9FAFB' }}>
        <Providers>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              {children}
            </Box>
            <Footer />
          </Box>
        </Providers>
      </body>
    </html>
  );
}
