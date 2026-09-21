'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import KeyIcon from '@mui/icons-material/Key';

import { getCabTrackingTelemetry } from '@/actions/cab';

// Dynamic import for Leaflet map component (No SSR)
const CabLiveMap = dynamic(() => import('@/components/CabLiveMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F1F5F9', borderRadius: 4 }}>
      <CircularProgress sx={{ color: '#D97706' }} />
    </Box>
  ),
});

export default function CabTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId;

  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTelemetry = React.useCallback(() => {
    if (!bookingId) return;
    getCabTrackingTelemetry(bookingId)
      .then((res) => {
        if (res.success && res.data) {
          setTelemetry(res.data);
        } else {
          setError(res.error || 'Tracking data unavailable for this booking');
        }
      })
      .catch((err) => setError(err.message || 'Failed to load tracking data'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return;

    fetchTelemetry();
    // Refresh telemetry every 8 seconds
    const timer = setInterval(fetchTelemetry, 8000);
    return () => clearInterval(timer);
  }, [bookingId, fetchTelemetry]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#D97706', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Connecting live GPS satellite tracking...</Typography>
      </Container>
    );
  }

  if (error || !telemetry) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>
          {error || 'Unable to connect to live cab GPS.'}
        </Alert>
        <Button onClick={() => router.push('/my-cab-bookings')} sx={{ color: '#D97706', fontWeight: 800 }}>
          Back to My Cab Bookings
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        {/* Header Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push(`/cab/confirmation/${bookingId}`)} sx={{ color: '#D97706' }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  Live Cab Tracking
                </Typography>
                <Chip icon={<GpsFixedIcon sx={{ fontSize: '14px !important' }} />} label="Live GPS Active" size="small" color="success" sx={{ fontWeight: 800 }} />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Booking ID: {bookingId} • {telemetry.trip?.pickup} → {telemetry.trip?.drop}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchTelemetry}
            sx={{ borderColor: '#D97706', color: '#D97706', fontWeight: 800, borderRadius: 2.5 }}
          >
            Refresh GPS
          </Button>
        </Box>

        {/* Live Map Component */}
        <CabLiveMap
          driverLocation={telemetry.driverLocation}
          pickupCoords={telemetry.pickupCoords}
          dropCoords={telemetry.dropCoords}
          speed={telemetry.speed}
          heading={telemetry.heading}
          remainingMinutes={telemetry.remainingMinutes}
          driverStatus={telemetry.driverStatus}
          otp={telemetry.otp}
          driver={telemetry.driver}
          vehicle={telemetry.vehicle}
          trip={telemetry.trip}
        />
      </Container>
    </Box>
  );
}
