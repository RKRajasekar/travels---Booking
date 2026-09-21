'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getOperatorDashboardData } from '@/actions/travelOwner';

export default function TravelOwnerDashboardPage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await getOperatorDashboardData(operatorName);
    if (res.success) {
      setDashboardData(res.data);
    } else {
      setError(res.error || 'Failed to load dashboard data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [operatorName]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#DC2626' }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Gathering fleet metrics for {operatorName}...
        </Typography>
      </Box>
    );
  }

  const stats = dashboardData?.stats || {
    totalBuses: 24,
    availableBuses: 18,
    unavailableBuses: 6,
    totalCars: 15,
    availableCars: 11,
    unavailableCars: 4,
    todayTripsCount: 9,
    todayBookingsCount: 42,
  };

  return (
    <Box>
      {/* Top Banner */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
            {operatorName} Operations Hub
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Live status of your coaches, cars, drivers, and booking pipelines.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/travel-owner/availability"
            variant="contained"
            startIcon={<EventAvailableIcon />}
            sx={{
              bgcolor: '#DC2626',
              color: '#fff',
              fontWeight: 700,
              px: 2.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Manage Daily Availability
          </Button>
          <Button
            component={Link}
            href="/travel-owner/trips"
            variant="outlined"
            sx={{
              borderColor: '#CBD5E1',
              color: '#334155',
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            View Trips
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* BUS METRICS */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 100%)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Fleet Buses
              </Typography>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                <DirectionsBusIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', mb: 2 }}>
              {stats.totalBuses}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, pt: 1.5, borderTop: '1px solid #FEE2E2' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>
                  {stats.availableBuses} Available
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  {stats.unavailableBuses} Unavailable
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* CAR / CAB METRICS */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Cars & Cabs
              </Typography>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                <LocalTaxiIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', mb: 2 }}>
              {stats.totalCars}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, pt: 1.5, borderTop: '1px solid #DCFCE7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>
                  {stats.availableCars} Available
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  {stats.unavailableCars} Unavailable
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* TODAY'S TRIPS */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Today&apos;s Trips
              </Typography>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
                <AltRouteIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', mb: 2 }}>
              {stats.todayTripsCount}
            </Typography>
            <Box sx={{ pt: 1.5, borderTop: '1px solid #DBEAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                Active scheduled routes
              </Typography>
              <Chip label="Live On-Time" size="small" sx={{ bgcolor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
          </Card>
        </Grid>

        {/* TODAY'S BOOKINGS */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Today&apos;s Bookings
              </Typography>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(217, 119, 6, 0.1)', color: '#D97706' }}>
                <BookOnlineIcon sx={{ fontSize: 24 }} />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', mb: 2 }}>
              {stats.todayBookingsCount}
            </Typography>
            <Box sx={{ pt: 1.5, borderTop: '1px solid #FEF3C7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                Tickets & Cab orders
              </Typography>
              <Chip label="Confirmed" size="small" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Access Action Banners */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Daily Bus Availability Control
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Instantly toggle bus services online or offline in customer search.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/travel-owner/availability"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#DC2626',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#B91C1C' },
              }}
            >
              Control
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#064E3B',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                Cab & Driver Fleet Control
              </Typography>
              <Typography variant="body2" sx={{ color: '#A7F3D0', fontSize: '0.85rem' }}>
                Assign drivers, check real-time GPS states, and toggle car availability.
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/travel-owner/cabs"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#10B981',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#059669' },
              }}
            >
              Manage
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Bookings Table */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0F172A' }}>
              Recent Passenger & Ride Bookings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bookings confirmed for {operatorName} vehicles
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/travel-owner/bookings"
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{ fontWeight: 700, color: '#DC2626' }}
          >
            View All Bookings
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 1.6, color: '#334155' }}>Booking / PNR</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.6, color: '#334155' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.6, color: '#334155' }}>Route</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.6, color: '#334155' }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.6, color: '#334155' }}>Fare</TableCell>
                <TableCell sx={{ fontWeight: 800, py: 1.6, color: '#334155' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData?.recentBookings?.length > 0 ? (
                dashboardData.recentBookings.map((b, idx) => (
                  <TableRow key={idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 750, color: '#0F172A', py: 1.5, fontFamily: 'monospace' }}>
                      {b.id}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 650, color: '#1E293B' }}>
                        {b.customer}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {b.phone}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 650, color: '#334155', py: 1.5 }}>{b.route}</TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.85rem', py: 1.5 }}>{b.vehicle}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#059669', py: 1.5 }}>₹{b.amount}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={b.status}
                        size="small"
                        sx={{
                          fontWeight: 750,
                          fontSize: '0.72rem',
                          bgcolor: b.status === 'CONFIRMED' ? '#ECFDF5' : '#FEF2F2',
                          color: b.status === 'CONFIRMED' ? '#059669' : '#DC2626',
                          border: `1px solid ${b.status === 'CONFIRMED' ? '#A7F3D0' : '#FECACA'}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>
                    No bookings logged for today yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
