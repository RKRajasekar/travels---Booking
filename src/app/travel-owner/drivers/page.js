'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Grid,
  Card,
  Avatar,
  Typography,
  Chip,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SyncIcon from '@mui/icons-material/Sync';
import { getOperatorDrivers, updateDriverStatus } from '@/actions/travelOwner';

const STATUS_MAP = {
  AVAILABLE: { label: '🟢 Available', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  BUSY: { label: '🔴 Busy', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  OFFLINE: { label: '⚪ Offline', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  ON_TRIP: { label: '🟡 On Trip', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
};

export default function TravelOwnerDriversPage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDrivers = async () => {
    setLoading(true);
    const res = await getOperatorDrivers(operatorName);
    if (res.success) {
      setDrivers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, [operatorName]);

  const handleStatusChange = async (driverId, newStatus) => {
    setUpdatingId(driverId);
    const res = await updateDriverStatus(driverId, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, status: newStatus, available: newStatus === 'AVAILABLE' } : d))
      );
      setSnackbar({
        open: true,
        message: res.message,
        severity: newStatus === 'AVAILABLE' ? 'success' : 'warning',
      });
    } else {
      setSnackbar({ open: true, message: res.error || 'Failed to update driver', severity: 'error' });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
            Driver & Chauffeur Roster
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Active verified drivers for <strong style={{ color: '#059669' }}>{operatorName}</strong> ({drivers.length} Chauffeurs)
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={fetchDrivers}
          startIcon={<SyncIcon />}
          sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
        >
          Refresh Roster
        </Button>
      </Box>

      {/* Info Notice */}
      <Alert
        severity="info"
        sx={{
          mb: 4,
          borderRadius: 3,
          bgcolor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#1E40AF',
          '& .MuiAlert-icon': { color: '#2563EB' },
        }}
      >
        <strong>Driver Availability Rules:</strong> If a driver is marked <strong>🔴 Busy</strong>, <strong>⚪ Offline</strong>, or <strong>🟡 On Trip</strong>, that driver will immediately be barred from receiving new customer ride bookings until set back to <strong>🟢 Available</strong>.
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#059669' }} />
        </Box>
      ) : drivers.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748B' }}>
            No drivers currently assigned.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {drivers.map((driver) => {
            const statusCfg = STATUS_MAP[driver.status] || STATUS_MAP.AVAILABLE;
            const isUpdating = updatingId === driver.id;

            return (
              <Grid item xs={12} sm={6} lg={4} key={driver.id}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 3.5,
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Driver Profile Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={driver.avatar}
                      alt={driver.name}
                      sx={{ width: 60, height: 60, border: '2px solid #E2E8F0' }}
                    />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0F172A', lineHeight: 1.2 }}>
                        {driver.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
                        <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {driver.rating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • {driver.totalTrips} Trips
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={statusCfg.label}
                      sx={{
                        bgcolor: statusCfg.bg,
                        color: statusCfg.color,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        border: `1px solid ${statusCfg.border}`,
                      }}
                    />
                  </Box>

                  {/* Driver Details */}
                  <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <DirectionsCarIcon sx={{ fontSize: 18, color: '#059669' }} />
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 750 }}>
                        Assigned Vehicle: <strong style={{ color: '#0F172A' }}>{driver.assignedVehicle}</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 650 }}>
                        {driver.phone}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', pl: 3 }}>
                      Experience: {driver.experience} • Languages: {driver.languages.join(', ')}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2, mt: 'auto' }} />

                  {/* Status Change Control */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 750, color: '#475569', display: 'block', mb: 1 }}>
                      Update Chauffeur Status:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={driver.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(driver.id, e.target.value)}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 750,
                          fontSize: '0.85rem',
                          bgcolor: '#fff',
                        }}
                      >
                        <MenuItem value="AVAILABLE">🟢 Available (Accepting Rides)</MenuItem>
                        <MenuItem value="BUSY">🔴 Busy (No New Bookings)</MenuItem>
                        <MenuItem value="ON_TRIP">🟡 On Trip (En Route)</MenuItem>
                        <MenuItem value="OFFLINE">⚪ Offline (Off Duty)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontWeight: 700, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
