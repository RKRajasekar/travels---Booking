'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CancelIcon from '@mui/icons-material/Cancel';
import PrintIcon from '@mui/icons-material/Print';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { getUserCabBookings, cancelCabBooking } from '@/actions/cab';
import EmptyState from '@/components/EmptyState';
import { formatINR } from '@/lib/cabFare';

export default function MyCabBookingsPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 = Upcoming, 1 = Completed, 2 = Cancelled
  const [error, setError] = useState('');

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    getUserCabBookings()
      .then((res) => {
        if (res.success && res.data) {
          setBookings(res.data);
        } else {
          setError(res.error || 'Failed to retrieve cab bookings');
        }
      })
      .catch((err) => setError(err.message || 'Error loading bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelDialog = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);

    const res = await cancelCabBooking(selectedBookingForCancel.bookingId);
    setCancelling(false);

    if (res.success) {
      setCancelModalOpen(false);
      fetchBookings();
    } else {
      alert(res.error || 'Failed to cancel booking');
    }
  };

  // Filter Bookings by Tab
  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'ACTIVE');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');

  const getActiveList = () => {
    switch (activeTab) {
      case 0: return upcomingBookings;
      case 1: return completedBookings;
      case 2: return cancelledBookings;
      default: return [];
    }
  };

  const activeList = getActiveList();

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', pt: 4 }}>
      <Container maxWidth="lg">
        {/* Page Title */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <LocalTaxiIcon sx={{ fontSize: 32, color: '#D97706' }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A' }}>
                My Cab Bookings
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
              Track live chauffeurs, download digital passes, or manage your cab reservations.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => router.push('/cab')}
            sx={{
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3,
            }}
          >
            + Book New Cab
          </Button>
        </Box>

        {/* Tabs Bar */}
        <Box sx={{ borderBottom: 1, borderColor: '#E2E8F0', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="inherit"
            TabIndicatorProps={{ sx: { bgcolor: '#D97706', height: 3 } }}
          >
            <Tab
              label={`Upcoming / Confirmed (${upcomingBookings.length})`}
              sx={{ fontWeight: 800, fontSize: '0.92rem', color: activeTab === 0 ? '#D97706' : '#64748B' }}
            />
            <Tab
              label={`Completed (${completedBookings.length})`}
              sx={{ fontWeight: 800, fontSize: '0.92rem', color: activeTab === 1 ? '#D97706' : '#64748B' }}
            />
            <Tab
              label={`Cancelled (${cancelledBookings.length})`}
              sx={{ fontWeight: 800, fontSize: '0.92rem', color: activeTab === 2 ? '#DC2626' : '#64748B' }}
            />
          </Tabs>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#D97706', mb: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Loading your cab bookings...</Typography>
          </Box>
        )}

        {/* Error State */}
        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Bookings List */}
        {!loading && activeList.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {activeList.map((booking) => (
              <Card
                key={booking.bookingId}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                }}
              >
                <Grid container spacing={2.5} alignItems="center">
                  {/* Left: Driver & Vehicle */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={booking.driver?.avatar}
                        alt={booking.driver?.name}
                        sx={{ width: 56, height: 56, border: '2px solid #D97706' }}
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                          {booking.driver?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                          {booking.vehicle?.model} • {booking.vehicle?.number}
                        </Typography>
                        <Chip
                          label={booking.status}
                          size="small"
                          sx={{
                            mt: 0.5,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            bgcolor:
                              booking.status === 'CONFIRMED'
                                ? 'rgba(5, 150, 105, 0.12)'
                                : booking.status === 'CANCELLED'
                                ? 'rgba(220, 38, 38, 0.12)'
                                : '#F1F5F9',
                            color:
                              booking.status === 'CONFIRMED'
                                ? '#047857'
                                : booking.status === 'CANCELLED'
                                ? '#991B1B'
                                : '#334155',
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  {/* Middle: Route & Date */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 800, letterSpacing: '0.05em' }}>
                        ID: {booking.bookingId}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {booking.trip?.pickup} → {booking.trip?.drop}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {booking.trip?.date} at {booking.trip?.time} ({booking.trip?.passengers} Pass.)
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Right: Fare & Actions */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.5 }}>
                        {formatINR(booking.totalAmount)}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => router.push(`/cab/confirmation/${booking.bookingId}`)}
                          sx={{ borderColor: '#CBD5E1', color: '#0F172A', fontWeight: 750, borderRadius: 2 }}
                        >
                          View
                        </Button>

                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => router.push(`/cab/track/${booking.bookingId}`)}
                            sx={{ bgcolor: '#D97706', color: '#fff', fontWeight: 750, borderRadius: 2, '&:hover': { bgcolor: '#B45309' } }}
                          >
                            Track
                          </Button>
                        )}

                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenCancelDialog(booking)}
                            sx={{ fontWeight: 750, borderRadius: 2 }}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        )}

        {/* Empty State */}
        {!loading && activeList.length === 0 && (
          <EmptyState
            title={`No ${activeTab === 0 ? 'Upcoming' : activeTab === 1 ? 'Completed' : 'Cancelled'} Cab Bookings`}
            message="Ready to travel? Book verified chauffeurs with live tracking and zero surge."
            actionLabel="Book a Cab Now"
            onAction={() => router.push('/cab')}
          />
        )}
      </Container>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Cancel Cab Booking?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel booking <strong>{selectedBookingForCancel?.bookingId}</strong>?
          </Typography>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B' }}>
              ✓ 100% Full Refund Policy
            </Typography>
            <Typography variant="caption" sx={{ color: '#7F1D1D' }}>
              Your refund of {formatINR(selectedBookingForCancel?.totalAmount)} will be refunded immediately.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelModalOpen(false)} sx={{ fontWeight: 750 }}>
            Keep Booking
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            sx={{ fontWeight: 800, borderRadius: 2.5 }}
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel & Release Driver'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
