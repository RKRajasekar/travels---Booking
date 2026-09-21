'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Avatar,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import CancelIcon from '@mui/icons-material/Cancel';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyIcon from '@mui/icons-material/Key';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrintIcon from '@mui/icons-material/Print';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';

import { getCabBookingById, cancelCabBooking } from '@/actions/cab';
import { formatINR } from '@/lib/cabFare';

export default function CabConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Fetch Booking Details
  useEffect(() => {
    if (!bookingId) return;

    setLoading(true);
    getCabBookingById(bookingId)
      .then((res) => {
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError(res.error || 'Cab booking not found');
        }
      })
      .catch((err) => setError(err.message || 'Error fetching booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Handle Cancel Booking
  const handleConfirmCancel = async () => {
    setCancelling(true);
    const res = await cancelCabBooking(bookingId);
    setCancelling(false);

    if (res.success && res.booking) {
      setBooking(res.booking);
      setCancelDialogOpen(false);
      setCancelSuccessMsg('Booking cancelled successfully. 100% full refund has been credited back.');
    } else {
      setError(res.error || 'Failed to cancel booking');
    }
  };

  // Handle Download / Print Ticket
  const handleDownloadTicket = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#D97706', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Loading booking confirmation...</Typography>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error || 'Booking details not found.'}
        </Alert>
        <Button onClick={() => router.push('/cab')} sx={{ mt: 2, color: '#D97706', fontWeight: 800 }}>
          Back to Cab Home
        </Button>
      </Container>
    );
  }

  const isCancelled = booking.status === 'CANCELLED';

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', pt: 4 }}>
      <Container maxWidth="md">
        {/* Cancelled Alert if applicable */}
        {isCancelled && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 3, fontWeight: 750 }}>
            This cab booking has been CANCELLED. Your assigned driver has been released and 100% refund has been processed.
          </Alert>
        )}

        {cancelSuccessMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontWeight: 750 }}>
            {cancelSuccessMsg}
          </Alert>
        )}

        {/* Main Confirmation Printable Card */}
        <Card
          sx={{
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              bgcolor: isCancelled ? '#475569' : '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: isCancelled ? 'rgba(220, 38, 38, 0.2)' : 'rgba(5, 150, 105, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCancelled ? (
                  <CancelIcon sx={{ fontSize: 36, color: '#F87171' }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 36, color: '#10B981' }} />
                )}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                  {isCancelled ? 'Cab Booking Cancelled' : '🎉 Cab Booking Confirmed!'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                  Booking ID: <strong style={{ color: '#FDE68A' }}>{booking.bookingId}</strong> • Status:{' '}
                  <span style={{ color: isCancelled ? '#F87171' : '#34D399', fontWeight: 800 }}>
                    {booking.status}
                  </span>
                </Typography>
              </Box>
            </Box>

            {/* OTP Badge for Driver */}
            {!isCancelled && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px dashed #F59E0B',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: '#FDE68A', fontWeight: 700, display: 'block' }}>
                  START RIDE OTP
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FEF08A', letterSpacing: '0.1em' }}>
                  {booking.otp || '4821'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Body Information Grid */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={3.5}>
              {/* Assigned Chauffeur & Vehicle */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#D97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                  Assigned Driver & Cab
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                  <Avatar
                    src={booking.driver?.avatar}
                    alt={booking.driver?.name}
                    sx={{ width: 56, height: 56, border: '2px solid #D97706' }}
                  />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>
                        {booking.driver?.name}
                      </Typography>
                      <VerifiedIcon sx={{ fontSize: 16, color: '#059669' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Phone: {booking.driver?.phone || '+91 98401 23456'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 750 }}>
                      ⭐ {booking.driver?.rating} Rating • {booking.driver?.trips} Trips
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {booking.vehicle?.model} ({booking.vehicle?.category})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Registration No: <strong>{booking.vehicle?.number}</strong> • {booking.vehicle?.color} • {booking.vehicle?.fuelType}
                  </Typography>
                </Box>
              </Grid>

              {/* Route & Schedule */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                  Trip Route & Schedule
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOnIcon sx={{ color: '#D97706', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pickup Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{booking.trip?.pickup}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.trip?.pickupAddress}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationOnIcon sx={{ color: '#059669', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Drop Destination</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{booking.trip?.drop}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.trip?.dropAddress}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <CalendarMonthIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {booking.trip?.date} at {booking.trip?.time} ({booking.trip?.passengers} Passenger{booking.trip?.passengers > 1 ? 's' : ''})
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Passenger & Fare Summary */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 800, mb: 1 }}>
                  Passenger Details
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 750 }}>
                  {booking.passenger?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Mobile: +91 {booking.passenger?.phone} • Email: {booking.passenger?.email}
                </Typography>
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, mt: 0.5, display: 'block' }}>
                  Payment Method: {booking.payment?.method} (Paid Successfully)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 800, mb: 1 }}>
                  Total Fare Paid
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#D97706' }}>
                  {formatINR(booking.totalAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Includes Base Fare, Distance ({booking.trip?.distanceKm} km), Tolls & Taxes.
                </Typography>
              </Grid>
            </Grid>

            {/* Action Buttons Bar */}
            <Box
              className="no-print"
              sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handleDownloadTicket}
                  sx={{ borderColor: '#CBD5E1', color: '#0F172A', fontWeight: 750, borderRadius: 2.5 }}
                >
                  Download / Print Pass
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => router.push('/my-cab-bookings')}
                  sx={{ borderColor: '#CBD5E1', color: '#0F172A', fontWeight: 750, borderRadius: 2.5 }}
                >
                  My Cab Bookings
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {!isCancelled && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                    sx={{ fontWeight: 750, borderRadius: 2.5 }}
                  >
                    Cancel Booking
                  </Button>
                )}

                {!isCancelled && (
                  <Button
                    variant="contained"
                    startIcon={<GpsFixedIcon />}
                    onClick={() => router.push(`/cab/track/${booking.bookingId}`)}
                    sx={{
                      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      borderRadius: 2.5,
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                    }}
                  >
                    Track Cab Live
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Card>
      </Container>

      {/* Cancel Confirmation Modal */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A' }}>
          Cancel Cab Booking?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel booking <strong>{booking.bookingId}</strong>?
          </Typography>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B' }}>
              ✓ 100% Full Refund Policy
            </Typography>
            <Typography variant="caption" sx={{ color: '#7F1D1D' }}>
              Your refund of {formatINR(booking.totalAmount)} will be credited back immediately to your original payment mode.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelDialogOpen(false)} sx={{ fontWeight: 750 }}>
            Keep Booking
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            sx={{ fontWeight: 800, borderRadius: 2.5 }}
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel & Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
