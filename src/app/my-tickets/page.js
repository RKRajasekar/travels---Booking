'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Container, Typography, Box, Alert, Snackbar, Tabs, Tab } from '@mui/material';
import { getMyBookings } from '@/actions/booking';
import TicketCard from '@/components/TicketCard';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';

function MyTicketsPageContent() {
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 = Upcoming, 1 = Completed, 2 = Cancelled
  
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMsg(true);
    }
  }, [searchParams]);

  const fetchBookings = () => {
    getMyBookings()
      .then((res) => {
        if (res.success && res.data) {
          setBookings(res.data);
        } else {
          setError(res.error || 'Failed to retrieve tickets.');
        }
      })
      .catch(() => setError('Failed to retrieve tickets.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchBookings();
    } else if (authStatus === 'unauthenticated') {
      setLoading(false);
    }
  }, [authStatus]);

  if (authStatus === 'loading' || loading) {
    return <LoadingState message="Fetching your digital boarding passes..." />;
  }

  if (authStatus === 'unauthenticated') {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <EmptyState
          title="Sign in to view your tickets"
          message="Authentication is required to view personal digital boarding passes."
          actionLabel="Go to Login"
          onAction={() => window.location.href = '/login'}
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  const now = new Date();

  // Filter Bookings by status and travel departure time
  const upcomingBookings = bookings.filter((b) => {
    if (b.bookingStatus !== 'CONFIRMED') return false;
    const depTime = b?.trip?.departureTime ? new Date(b.trip.departureTime) : now;
    return depTime >= now;
  });

  const completedBookings = bookings.filter((b) => {
    if (b.bookingStatus !== 'CONFIRMED') return false;
    const depTime = b?.trip?.departureTime ? new Date(b.trip.departureTime) : now;
    return depTime < now;
  });

  const cancelledBookings = bookings.filter((b) => {
    return b.bookingStatus === 'CANCELLED';
  });

  const getFilteredList = () => {
    switch (activeTab) {
      case 0: return upcomingBookings;
      case 1: return completedBookings;
      case 2: return cancelledBookings;
      default: return [];
    }
  };

  const currentList = getFilteredList();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Header Info */}
      <Box sx={{ mb: 4, '@media print': { display: 'none' } }}>
        <Typography variant="h4" sx={{ fontWeight: 850, color: 'primary.main', letterSpacing: '-0.02em', mb: 0.5 }}>
          My Booked Tickets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
          Manage your printable digital boarding passes and track live positions
        </Typography>
      </Box>

      {/* Tabs Switcher */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4.5, '@media print': { display: 'none' } }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ '& .MuiTab-root': { fontWeight: 700, fontSize: '0.9rem' } }}
        >
          <Tab label={`Upcoming (${upcomingBookings.length})`} />
          <Tab label={`Completed (${completedBookings.length})`} />
          <Tab label={`Cancelled (${cancelledBookings.length})`} />
        </Tabs>
      </Box>

      {/* Ticket List Cards Stack */}
      {currentList.length > 0 ? (
        <Box>
          {currentList.map((booking) => (
            <TicketCard key={booking.id} booking={booking} onRefresh={fetchBookings} />
          ))}
        </Box>
      ) : (
        <Box sx={{ '@media print': { display: 'none' } }}>
          <EmptyState
            title="No tickets found"
            message={`You have no ${activeTab === 0 ? 'upcoming' : activeTab === 1 ? 'completed' : 'cancelled'} travel tickets.`}
            actionLabel="Search Buses"
            onAction={() => window.location.href = '/'}
          />
        </Box>
      )}

      {/* Booking confirmation success toast */}
      <Snackbar
        open={showSuccessMsg}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMsg(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccessMsg(false)} severity="success" sx={{ width: '100%', borderRadius: 2, fontWeight: 700, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
          Payment Successful! Your ticket is confirmed and PNR generated. An SMS alert has been sent.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading your tickets dashboard..." />}>
      <MyTicketsPageContent />
    </Suspense>
  );
}
