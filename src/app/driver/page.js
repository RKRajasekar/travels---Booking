'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container, Card, Typography, Button, Box, Grid, Alert, Divider, TextField, MenuItem, Switch, FormControlLabel } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import NavigationIcon from '@mui/icons-material/Navigation';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { getDriverTrips } from '@/actions/tracking';

export default function DriverDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Off-duty. Please select your scheduled trip below to begin transmission.');
  const [mockTelemetry, setMockTelemetry] = useState(false);
  
  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const mockIntervalRef = useRef(null);

  // Authorization check
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  // Load scheduled trips
  useEffect(() => {
    if (authStatus === 'authenticated') {
      getDriverTrips().then((res) => {
        if (res.success && res.trips) {
          setTrips(res.trips);
          if (res.trips.length > 0) {
            setSelectedTripId(res.trips[0].id);
            setSelectedTrip(res.trips[0]);
          }
        }
      });
    }
  }, [authStatus]);

  useEffect(() => {
    const trip = trips.find((t) => t.id === selectedTripId);
    setSelectedTrip(trip || null);
  }, [selectedTripId, trips]);

  const startTracking = () => {
    if (!selectedTrip) {
      alert('Please select an active assigned trip first.');
      return;
    }

    setTracking(true);
    setStatusMsg('Establishing GPS link. Syncing telemetry with passengers...');

    if (mockTelemetry) {
      // Simulator mode: periodically updates coordinates along a mock travel vector
      let simLat = 13.0827; // Chennai start lat
      let simLng = 80.2707;
      
      mockIntervalRef.current = setInterval(async () => {
        // Move towards Coimbatore (11.0168, 76.9558)
        simLat -= 0.015;
        simLng -= 0.025;
        
        const speed = 55 + Math.random() * 15; // 55-70 km/h
        const heading = 225; // Southwest direction

        setCoords({
          latitude: simLat,
          longitude: simLng,
          speed,
          heading,
        });

        try {
          const response = await fetch('/api/gps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              busId: selectedTrip.busId,
              latitude: simLat,
              longitude: simLng,
              speed,
              heading,
            }),
          });
          const data = await response.json();
          if (data.success) {
            setStatusMsg(`Simulated GPS post successful at ${new Date().toLocaleTimeString()}`);
          }
        } catch (err) {
          console.error(err);
        }
      }, 8000);

    } else {
      // Real Geolocation Watch Position Mode
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        setTracking(false);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, speed, heading } = position.coords;
          const now = Date.now();

          const currentSpeed = speed ? speed * 3.6 : 60; // default 60 km/h fallback
          const currentHeading = heading || 90;

          setCoords({
            latitude,
            longitude,
            speed: currentSpeed,
            heading: currentHeading,
          });

          if (now - lastUpdateRef.current >= 8000) {
            lastUpdateRef.current = now;

            try {
              const response = await fetch('/api/gps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  busId: selectedTrip.busId,
                  latitude,
                  longitude,
                  speed: currentSpeed,
                  heading: currentHeading,
                }),
              });
              const data = await response.json();
              if (data.success) {
                setStatusMsg(`GPS telemetry updated at ${new Date().toLocaleTimeString()}`);
              }
            } catch (err) {
              setStatusMsg('Signal loss. Re-transmitting coordinates...');
            }
          }
        },
        (err) => {
          setStatusMsg(`GPS Error: ${err.message}. Try enabling simulator mode.`);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
    setTracking(false);
    setCoords(null);
    setStatusMsg('Journey ended. Satellite tracking link closed.');
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, []);

  if (authStatus === 'loading') {
    return <LoadingState message="Verifying driver licensing details..." />;
  }

  if (authStatus === 'authenticated' && session.user.role !== 'DRIVER' && session.user.role !== 'ADMIN') {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <EmptyState
          title="Access Denied"
          message="Authorized driver/administrator authentication credentials are required to access this telemetry portal."
          actionLabel="Go Home"
          onAction={() => router.push('/')}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 850, color: 'primary.main', letterSpacing: '-0.02em', mb: 0.5 }}>
          Driver Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
          Welcome back, {session?.user?.name} • Broadcaster ID: {session?.user?.id.slice(-6).toUpperCase()}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Controls Card */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 4, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
              Journey Telemetry Configuration
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                select
                label="Select Scheduled Trip"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                fullWidth
                disabled={tracking}
              >
                {trips.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.operatorName} • {t.source} ➔ {t.destination} ({t.busNumber})
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={mockTelemetry}
                    onChange={(e) => setMockTelemetry(e.target.checked)}
                    disabled={tracking}
                    color="secondary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Enable GPS Travel Simulator Mode
                  </Typography>
                }
              />
            </Box>

            <Alert severity={tracking ? 'success' : 'info'} sx={{ mb: 4, borderRadius: 2, fontWeight: 650 }}>
              {statusMsg}
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {!tracking ? (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={startTracking}
                  startIcon={<GpsFixedIcon />}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  Start Journey
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={stopTracking}
                  startIcon={<DirectionsBusIcon />}
                  fullWidth
                  sx={{ py: 1.5, fontWeight: 700 }}
                >
                  End Journey
                </Button>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Telemetry Display */}
        {coords && (
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 4, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FFFFFF', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <NavigationIcon sx={{ fontSize: 44, color: 'secondary.main', transform: `rotate(${coords.heading}deg)`, transition: 'transform 0.4s ease' }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
                Satellite Output Sensors
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={6} sx={{ borderRight: '1px solid #F1F5F9' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>LATITUDE</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'primary.main', mt: 0.5 }}>
                    {coords.latitude.toFixed(5)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>LONGITUDE</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'primary.main', mt: 0.5 }}>
                    {coords.longitude.toFixed(5)}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2.5 }} />
              
              <Grid container spacing={2.5}>
                <Grid item xs={6} sx={{ borderRight: '1px solid #F1F5F9' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>SPEED</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'secondary.main', mt: 0.5 }}>
                    {coords.speed.toFixed(1)} km/h
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>HEADING VECTOR</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'primary.main', mt: 0.5 }}>
                    {coords.heading.toFixed(0)}° ({coords.heading > 180 ? 'SW' : 'NE'})
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
