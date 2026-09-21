'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SyncIcon from '@mui/icons-material/Sync';
import {
  getOperatorBuses,
  updateBusAvailability,
  getOperatorCabs,
  updateCabAvailability,
} from '@/actions/travelOwner';

export default function DailyAvailabilityPage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [busRes, cabRes] = await Promise.all([
      getOperatorBuses(operatorName),
      getOperatorCabs(operatorName),
    ]);
    if (busRes.success) setBuses(busRes.data);
    if (cabRes.success) setCabs(cabRes.data);
    setLoading(false);
  }, [operatorName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBusToggle = async (bus) => {
    const newStatus = bus.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    setUpdatingId(bus.id);
    const res = await updateBusAvailability(bus.id, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setBuses((prev) =>
        prev.map((b) => (b.id === bus.id ? { ...b, status: newStatus } : b))
      );
      setSnackbar({
        open: true,
        message: `${bus.busNumber} is now ${newStatus === 'AVAILABLE' ? 'ONLINE (Appears in search)' : 'OFFLINE (Hidden from search)'}`,
        severity: newStatus === 'AVAILABLE' ? 'success' : 'warning',
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || 'Failed to update bus availability',
        severity: 'error',
      });
    }
  };

  const handleCabToggle = async (cab) => {
    const newAvailable = !cab.available;
    setUpdatingId(cab.id);
    const res = await updateCabAvailability(cab.driverId, newAvailable);
    setUpdatingId(null);

    if (res.success) {
      setCabs((prev) =>
        prev.map((c) => (c.id === cab.id ? { ...c, available: newAvailable } : c))
      );
      setSnackbar({
        open: true,
        message: `${cab.vehicleModel} (${cab.vehicleNumber}) is now ${newAvailable ? 'ONLINE (Appears in cab search)' : 'OFFLINE (Hidden from search)'}`,
        severity: newAvailable ? 'success' : 'warning',
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || 'Failed to update cab availability',
        severity: 'error',
      });
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Daily Availability Control Center
            </Typography>
            <Chip
              label={todayStr}
              size="small"
              sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 800, border: '1px solid #FECACA' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Live control for <strong style={{ color: '#DC2626' }}>{operatorName}</strong> services. Toggle whether each vehicle operates today.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={loadData}
            startIcon={<SyncIcon />}
            sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
          >
            Refresh States
          </Button>
          <Button
            component={Link}
            href="/search?source=Chennai&destination=Bangalore&date=2026-09-20"
            target="_blank"
            variant="contained"
            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#0F172A',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            Test Customer Search ↗
          </Button>
        </Box>
      </Box>

      {/* Critical System Notice */}
      <Alert
        severity="success"
        sx={{
          mb: 4,
          borderRadius: 3,
          bgcolor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          '& .MuiAlert-icon': { color: '#16A34A' },
        }}
      >
        <strong>Direct Engine Connection:</strong> This toggle is directly wired to NextBus search & checkout engines.
        When set to <strong>[ UNAVAILABLE ]</strong>, the vehicle will immediately disappear from customer searches.
        When set to <strong>[ AVAILABLE ]</strong>, it will immediately re-appear in customer search queries.
      </Alert>

      {/* Mode Tabs: Buses vs Cabs */}
      <Paper sx={{ mb: 4, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', bgcolor: '#fff' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            px: 2,
            pt: 1,
            '& .MuiTab-root': { fontWeight: 800, fontSize: '0.95rem', minHeight: 52 },
            '& .Mui-selected': { color: '#DC2626' },
            '& .MuiTabs-indicator': { bgcolor: '#DC2626', height: 3 },
          }}
        >
          <Tab
            icon={<DirectionsBusIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Bus Availability (${buses.length})`}
          />
          <Tab
            icon={<LocalTaxiIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Cab & Driver Availability (${cabs.length})`}
          />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#DC2626' }} />
        </Box>
      ) : activeTab === 0 ? (
        /* ================= BUS AVAILABILITY ================= */
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0F172A' }}>
              Today&apos;s Bus Fleet Availability List
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
              {buses.filter((b) => b.status === 'AVAILABLE').length} of {buses.length} Coaches Operating
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {buses.map((bus) => {
              const isAvail = bus.status === 'AVAILABLE';
              const isUpdating = updatingId === bus.id;

              return (
                <Grid item xs={12} md={6} key={bus.id}>
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1.5px solid ${isAvail ? '#A7F3D0' : '#FECACA'}`,
                      bgcolor: isAvail ? '#FAFCFA' : '#FEF8F8',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          bgcolor: isAvail ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isAvail ? '#10B981' : '#EF4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <DirectionsBusIcon sx={{ fontSize: 26 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 850, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {bus.operatorName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, fontFamily: 'monospace', display: 'block' }}>
                          {bus.busNumber} • {bus.registrationNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 650, display: 'block', mt: 0.3 }}>
                          Route: {bus.route}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Toggle Switch with Status Badge */}
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Chip
                        icon={isAvail ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <CancelIcon sx={{ fontSize: '14px !important' }} />}
                        label={isAvail ? 'AVAILABLE' : 'NOT AVAILABLE'}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          bgcolor: isAvail ? '#ECFDF5' : '#FEF2F2',
                          color: isAvail ? '#059669' : '#DC2626',
                          border: `1px solid ${isAvail ? '#A7F3D0' : '#FECACA'}`,
                          mb: 1,
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isAvail}
                              disabled={isUpdating}
                              onChange={() => handleBusToggle(bus)}
                              color="success"
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ fontWeight: 750, color: isAvail ? '#059669' : '#DC2626' }}>
                              {isAvail ? 'Live in Search' : 'Hidden'}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : (
        /* ================= CAB AVAILABILITY ================= */
        <Box>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0F172A' }}>
              Today&apos;s Cab & Driver Fleet Availability List
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
              {cabs.filter((c) => c.available).length} of {cabs.length} Cabs Operating
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {cabs.map((cab) => {
              const isAvail = cab.available;
              const isUpdating = updatingId === cab.id;

              return (
                <Grid item xs={12} md={6} key={cab.id}>
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1.5px solid ${isAvail ? '#A7F3D0' : '#FECACA'}`,
                      bgcolor: isAvail ? '#FAFCFA' : '#FEF8F8',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          bgcolor: isAvail ? 'rgba(5, 150, 105, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isAvail ? '#059669' : '#EF4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <LocalTaxiIcon sx={{ fontSize: 26 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 850, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cab.vehicleModel}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, fontFamily: 'monospace', display: 'block' }}>
                          {cab.vehicleNumber} • {cab.categoryName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 650, display: 'block', mt: 0.3 }}>
                          Chauffeur: {cab.driverName} ({cab.driverPhone})
                        </Typography>
                      </Box>
                    </Box>

                    {/* Toggle Switch with Status Badge */}
                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Chip
                        icon={isAvail ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <CancelIcon sx={{ fontSize: '14px !important' }} />}
                        label={isAvail ? 'AVAILABLE' : 'NOT AVAILABLE'}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          bgcolor: isAvail ? '#ECFDF5' : '#FEF2F2',
                          color: isAvail ? '#059669' : '#DC2626',
                          border: `1px solid ${isAvail ? '#A7F3D0' : '#FECACA'}`,
                          mb: 1,
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isAvail}
                              disabled={isUpdating}
                              onChange={() => handleCabToggle(cab)}
                              color="success"
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ fontWeight: 750, color: isAvail ? '#059669' : '#DC2626' }}>
                              {isAvail ? 'Ready for Rides' : 'Offline'}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
