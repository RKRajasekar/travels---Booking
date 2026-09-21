'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Container, Grid, Card, Typography, Box, Alert, Chip, Divider, Paper, CircularProgress } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import CompassCalibrationIcon from '@mui/icons-material/CompassCalibration';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import NavigationIcon from '@mui/icons-material/Navigation';
import { getTripById } from '@/actions/search';
import { getLatestGpsPosition } from '@/actions/tracking';
import { getHeadingDirection, isGpsStale, calculateETA } from '@/lib/utils';
import LoadingState from '@/components/LoadingState';

// Import LiveMap dynamically (Client-Side Only)
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

const CITY_DISTANCES = {
  'Chennai-Coimbatore': 500,
  'Chennai-Madurai': 460,
  'Chennai-Bangalore': 350,
  'Chennai-Salem': 340,
  'Coimbatore-Chennai': 500,
  'Madurai-Chennai': 460,
  'Bangalore-Chennai': 350,
  'Salem-Chennai': 340,
};

export default function TrackPage() {
  const params = useParams();
  const tripId = params.tripId;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);
  const [stale, setStale] = useState(false);

  // Load Trip details
  useEffect(() => {
    if (!tripId) return;

    getTripById(tripId)
      .then((res) => {
        if (res.success && res.data) {
          setTrip(res.data);
          
          // Pull initial GPS data
          getLatestGpsPosition(res.data.busId).then((gpsRes) => {
            if (gpsRes.success && gpsRes.tracker) {
              setCoords(gpsRes.tracker);
              setStale(isGpsStale(gpsRes.tracker.timestamp));
            }
          });
        } else {
          setError(res.error || 'Trip details not found.');
        }
      })
      .catch(() => setError('Error loading journey.'))
      .finally(() => setLoading(false));
  }, [tripId]);

  // Connect to live SSE updates
  useEffect(() => {
    if (!trip?.busId) return;

    const eventSource = new EventSource(`/api/track/${trip.busId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.latitude && data.longitude) {
          setCoords(data);
          setStale(isGpsStale(data.timestamp));
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [trip?.busId]);

  if (loading) {
    return <LoadingState message="Connecting to live telemetry satellites..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!trip) return null;

  const routeKey = `${trip.route.source}-${trip.route.destination}`;
  const totalDistance = CITY_DISTANCES[routeKey] || 400;
  const currentSpeed = coords?.speed || 0;
  const etaMinutes = calculateETA(totalDistance / 2, currentSpeed);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Stale GPS warning banner */}
      {stale && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 4, borderRadius: 2, fontWeight: 700, borderColor: 'warning.light', bgcolor: 'rgba(245, 158, 11, 0.02)' }}>
          Live location temporarily unavailable. Displaying last logged coordinates from: {coords ? new Date(coords.timestamp).toLocaleTimeString() : 'N/A'}.
        </Alert>
      )}

      {/* Page Title & PNR Header */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: 'primary.main', letterSpacing: '-0.02em', mb: 0.5 }}>
            Live Bus Position
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Routing: {trip.route.source} ➔ {trip.route.destination} ({trip.bus.operatorName})
          </Typography>
        </Box>
        <Chip
          icon={<GpsFixedIcon sx={{ fontSize: '15px !important', color: stale ? 'warning.main' : 'success.main' }} />}
          label={stale ? 'GPS Connection Stale' : 'Broadcasting Live GPS'}
          color={stale ? 'warning' : 'success'}
          sx={{ fontWeight: 750, borderRadius: 2, px: 1 }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Interactive Map */}
        <Grid item xs={12} md={7.8}>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            {coords ? (
              <LiveMap
                latitude={coords.latitude}
                longitude={coords.longitude}
                speed={coords.speed}
                heading={coords.heading}
                sourceCity={trip.route.source}
                destCity={trip.route.destination}
                stops={trip.route.stops}
              />
            ) : (
              <Box sx={{ height: 480, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
                <CircularProgress color="secondary" size={28} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
                  Awaiting driver coordinate broadcast signals...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Info Panels */}
        <Grid item xs={12} md={4.2}>
          <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, mb: 3.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2.5, color: 'primary.main' }}>
              Transit Stats
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Bus Plate Number</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{trip.bus.busNumber}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Bus Type Class</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{trip.bus.busType.replace('_', ' ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Upcoming Stops</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{trip.route.stops.join(' ➔ ')}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccessTimeIcon color="secondary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 750 }}>ESTIMATED ETA</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  ~ {Math.floor(etaMinutes / 60)}h {etaMinutes % 60}m remaining
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Speedometer Gauges */}
          {coords && (
            <Grid container spacing={2.5}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, textAlign: 'center', bgcolor: '#FFFFFF' }}>
                  <SpeedIcon color="secondary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>SPEED</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5 }}>
                    {coords.speed.toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>km/h</span>
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, textAlign: 'center', bgcolor: '#FFFFFF' }}>
                  <NavigationIcon color="secondary" sx={{ fontSize: 32, mb: 1, transform: `rotate(${coords.heading}deg)`, transition: 'transform 0.4s ease' }} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>HEADING</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5 }}>
                    {getHeadingDirection(coords.heading)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
