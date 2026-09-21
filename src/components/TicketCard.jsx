'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Card, Box, Grid, Typography, Button, Divider, Chip, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import WifiIcon from '@mui/icons-material/Wifi';
import PowerIcon from '@mui/icons-material/Power';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { formatDateTime } from '@/lib/utils';
import { cancelBooking } from '@/actions/booking';

export default function TicketCard({ booking, onRefresh }) {
  const theme = useTheme();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (booking.qrCode) {
      QRCode.toDataURL(booking.qrCode, { width: 120, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
        .then(setQrCodeUrl)
        .catch(err => console.error(err));
    }
  }, [booking.qrCode]);

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = booking?.bookingStatus === 'CONFIRMED';
  const isPaid = booking?.paymentStatus === 'PAID';

  const boardingLandmark = "Boarding: " + (booking?.boardingPoint || 'City Boarding Point');
  const droppingLandmark = "Dropping: " + (booking?.droppingPoint || 'City Dropping Point');
  const passengerCount = Array.isArray(booking?.passengerDetails) ? booking.passengerDetails.length : 1;
  const primaryPassengerName = (Array.isArray(booking?.passengerDetails) && booking.passengerDetails[0]?.name) || booking?.user?.name || 'Passenger';
  const busTypeName = (booking?.trip?.bus?.busType || 'AC_SEATER').replace('_', ' ');
  const seatListStr = Array.isArray(booking?.seatNumbers) ? booking.seatNumbers.join(', ') : 'N/A';

  return (
    <Card
      sx={{
        mb: 4.5,
        border: '1px solid #E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        '@media print': {
          boxShadow: 'none',
          border: '2px solid #000000',
          borderRadius: 0,
        },
      }}
    >
      <Grid container>
        {/* Main Boarding Pass Body */}
        <Grid item xs={12} md={8.5} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DirectionsBusIcon color="secondary" sx={{ fontSize: 24 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'primary.main' }}>
                NextBus Boarding Ticket
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.2 }}>
              <Chip
                label={booking?.bookingStatus || 'CONFIRMED'}
                color={isConfirmed ? 'success' : booking?.bookingStatus === 'CANCELLED' ? 'error' : 'warning'}
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.7rem' }}
              />
              <Chip
                label={isPaid ? 'Payment Successful' : 'Unpaid'}
                variant="outlined"
                color={isPaid ? 'success' : 'warning'}
                size="small"
                sx={{ fontWeight: 800, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>

          {/* Journey Cities Path */}
          <Grid container spacing={2} sx={{ mb: 3.5 }}>
            <Grid item xs={5}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>DEPARTURE</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
                {booking?.trip?.departureTime ? formatDateTime(booking.trip.departureTime, 'hh:mm a') : '--:--'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {booking?.trip?.route?.source || 'Departure'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {booking?.trip?.departureTime ? formatDateTime(booking.trip.departureTime, 'dd MMM yyyy') : 'Scheduled Date'}
              </Typography>
            </Grid>
            <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', borderTop: '2px dashed #E2E8F0', position: 'relative' }}>
                <Box sx={{ position: 'absolute', width: 4, height: 4, borderRadius: '50%', bgcolor: 'secondary.main', top: -3, left: '50%' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 750, fontSize: '10px', mt: 1 }}>
                {booking?.trip?.route?.duration || 'Express'}
              </Typography>
            </Grid>
            <Grid item xs={5} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>ARRIVAL (EST)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
                {booking?.trip?.arrivalTime ? formatDateTime(booking.trip.arrivalTime, 'hh:mm a') : '--:--'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {booking?.trip?.route?.destination || 'Destination'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {booking?.trip?.arrivalTime ? formatDateTime(booking.trip.arrivalTime, 'dd MMM yyyy') : 'Scheduled Date'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

          {/* Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4.5}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>Bus Operator</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {booking?.trip?.bus?.operatorName || 'Standard Express'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '11px', mt: 0.5 }}>
                {booking?.trip?.bus?.busNumber || 'TN-01-EXP'} • {busTypeName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3.5}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>Seat Numbers</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                {seatListStr}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '11px', mt: 0.5 }}>
                Amount: ₹{Math.round(booking?.totalAmount || 0)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>Traveler (Primary)</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {primaryPassengerName}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '11px', mt: 0.5 }}>
                {passengerCount} {passengerCount === 1 ? 'passenger' : 'passengers'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />

          {/* Boarding and dropping landmarks */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>Boarding landmark</Typography>
              <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary', fontSize: '0.85rem' }}>
                {boardingLandmark}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>Dropping landmark</Typography>
              <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary', fontSize: '0.85rem' }}>
                {droppingLandmark}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Boarding stub separator */}
        <Grid
          item
          xs={false}
          md={0.5}
          sx={{
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#F8FAFC',
            borderLeft: '2px dashed #E2E8F0', 
            position: 'relative',
            '@media print': {
              borderLeft: '2px dashed #000000',
            },
          }}
        >
          <Box sx={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.background.default, top: -12, border: '1px solid #E2E8F0', transform: 'translateX(-50%)', left: 0, '@media print': { display: 'none' } }} />
          <Box sx={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.background.default, bottom: -12, border: '1px solid #E2E8F0', transform: 'translateX(-50%)', left: 0, '@media print': { display: 'none' } }} />
        </Grid>

        {/* Boarding Pass Stub */}
        <Grid item xs={12} md={3} sx={{ p: 4, bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PNR CODE
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'secondary.main', mb: 2.5, letterSpacing: '0.05em' }}>
            {booking?.pnr || 'PNR'}
          </Typography>

          {/* QR code canvas rendering */}
          {qrCodeUrl ? (
            <Box component="img" src={qrCodeUrl} alt="PNR QR Code" sx={{ width: 120, height: 120, mb: 1.5, border: '1px solid #E2E8F0', p: 0.5, bgcolor: '#FFFFFF', borderRadius: 2 }} />
          ) : (
            <Box sx={{ width: 120, height: 120, mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #CBD5E1', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Generating QR...</Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, fontSize: '10px' }}>
            Scan to verify boarding authenticity
          </Typography>
        </Grid>
      </Grid>

      {/* Action Footer Bar */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          '@media print': { display: 'none' },
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button variant="outlined" color="primary" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ fontWeight: 700 }}>
            Print Boarding Pass
          </Button>
          {isConfirmed && booking?.bookingStatus !== 'CANCELLED' && booking?.trip?.departureTime && new Date(booking.trip.departureTime) >= new Date() && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setCancelDialogOpen(true)}
              disabled={cancelling}
              sx={{ fontWeight: 700 }}
            >
              Cancel Ticket
            </Button>
          )}
        </Box>
        {isConfirmed && booking?.bookingStatus !== 'CANCELLED' && booking?.tripId && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<GpsFixedIcon />}
            component={Link}
            href={`/track/${booking.tripId}`}
            sx={{ fontWeight: 700 }}
          >
            Track Live Location
          </Button>
        )}
      </Box>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Ticket Cancellation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel PNR <strong>{booking?.pnr}</strong>? This action is permanent and will release seats {seatListStr} back to availability.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling} variant="outlined" sx={{ fontWeight: 700 }}>
            No, Keep Ticket
          </Button>
          <Button
            onClick={async () => {
              setCancelling(true);
              const res = await cancelBooking(booking.id);
              setCancelling(false);
              setCancelDialogOpen(false);
              if (res.success) {
                alert(res.message || 'Ticket cancelled successfully.');
                if (onRefresh) {
                  onRefresh();
                } else {
                  window.location.reload();
                }
              } else {
                alert(res.error || 'Failed to cancel ticket.');
              }
            }}
            disabled={cancelling}
            color="error"
            variant="contained"
            sx={{ fontWeight: 700 }}
          >
            {cancelling ? <CircularProgress size={20} color="inherit" /> : 'Yes, Cancel Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
