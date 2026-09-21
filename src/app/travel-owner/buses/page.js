'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  CardMedia,
  CardContent,
  Divider,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirlineSeatReclineExtraIcon from '@mui/icons-material/AirlineSeatReclineExtra';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import SyncIcon from '@mui/icons-material/Sync';
import { getOperatorBuses, updateBusAvailability } from '@/actions/travelOwner';

const STATUS_CONFIG = {
  AVAILABLE: { label: '🟢 Available', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  UNAVAILABLE: { label: '🔴 Unavailable', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  MAINTENANCE: { label: '🟡 Maintenance', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  COMPLETED: { label: '⚪ Completed', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
};

export default function TravelOwnerBusesPage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchBuses = async () => {
    setLoading(true);
    const res = await getOperatorBuses(operatorName);
    if (res.success) {
      setBuses(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBuses();
  }, [operatorName]);

  const handleStatusChange = async (busId, newStatus) => {
    setUpdatingId(busId);
    const res = await updateBusAvailability(busId, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setBuses((prev) =>
        prev.map((b) => (b.id === busId ? { ...b, status: newStatus } : b))
      );
      setSnackbar({
        open: true,
        message: res.message,
        severity: newStatus === 'AVAILABLE' ? 'success' : 'warning',
      });
    } else {
      setSnackbar({
        open: true,
        message: res.error || 'Failed to update bus status',
        severity: 'error',
      });
    }
  };

  const filteredBuses = buses.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
            Fleet Buses Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Showing verified fleet for <strong style={{ color: '#DC2626' }}>{operatorName}</strong> ({buses.length} Coaches)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ bgcolor: '#fff', borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}
            >
              <MenuItem value="ALL">All Statuses ({buses.length})</MenuItem>
              <MenuItem value="AVAILABLE">🟢 Available</MenuItem>
              <MenuItem value="UNAVAILABLE">🔴 Unavailable</MenuItem>
              <MenuItem value="MAINTENANCE">🟡 Maintenance</MenuItem>
              <MenuItem value="COMPLETED">⚪ Completed</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={fetchBuses}
            startIcon={<SyncIcon />}
            sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Info notice about dynamic availability */}
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
        <strong>Live Search Integration:</strong> When you change any coach from 🟢 Available to 🔴 Unavailable,
        that coach immediately stops appearing in customer search results for booking. Changing it back to 🟢 Available restores it in search.
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#DC2626' }} />
        </Box>
      ) : filteredBuses.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748B' }}>
            No buses found matching status: {filterStatus}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredBuses.map((bus) => {
            const currentStatusCfg = STATUS_CONFIG[bus.status] || STATUS_CONFIG.AVAILABLE;
            const isUpdating = updatingId === bus.id;

            return (
              <Grid item xs={12} md={6} lg={4} key={bus.id}>
                <Card
                  sx={{
                    borderRadius: 3.5,
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': {
                      boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Bus Image Banner with Status Chip */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={bus.image}
                      alt={bus.busClass}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Chip
                      label={currentStatusCfg.label}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: currentStatusCfg.bg,
                        color: currentStatusCfg.color,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        border: `1px solid ${currentStatusCfg.border}`,
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        left: 12,
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(6px)',
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 1.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800, fontFamily: 'monospace' }}>
                        {bus.busNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0F172A', lineHeight: 1.2, mb: 0.4 }}>
                        {bus.busClass}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                        {bus.operatorName} • {bus.registrationNumber}
                      </Typography>
                    </Box>

                    {/* Route Details */}
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <AltRouteIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                        <Typography variant="body2" sx={{ fontWeight: 750, color: '#1E293B' }}>
                          {bus.route}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#64748B' }} />
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                            Dep: {bus.departureTime}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#64748B' }} />
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                            Arr: {bus.arrivalTime}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Seat Counts */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <AirlineSeatReclineExtraIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Total Seats
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {bus.totalSeats} Seats
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Available Seats
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                          {bus.availableSeats} Left
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2, mt: 'auto' }} />

                    {/* Status Toggle Controls */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 750, color: '#475569', display: 'block', mb: 1 }}>
                        Update Bus Status:
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        <Button
                          size="small"
                          variant={bus.status === 'AVAILABLE' ? 'contained' : 'outlined'}
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(bus.id, 'AVAILABLE')}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 750,
                            py: 0.6,
                            borderRadius: 1.5,
                            bgcolor: bus.status === 'AVAILABLE' ? '#10B981' : 'transparent',
                            borderColor: '#10B981',
                            color: bus.status === 'AVAILABLE' ? '#fff' : '#10B981',
                            '&:hover': { bgcolor: '#059669', color: '#fff', borderColor: '#059669' },
                          }}
                        >
                          🟢 Available
                        </Button>
                        <Button
                          size="small"
                          variant={bus.status === 'UNAVAILABLE' ? 'contained' : 'outlined'}
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(bus.id, 'UNAVAILABLE')}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 750,
                            py: 0.6,
                            borderRadius: 1.5,
                            bgcolor: bus.status === 'UNAVAILABLE' ? '#EF4444' : 'transparent',
                            borderColor: '#EF4444',
                            color: bus.status === 'UNAVAILABLE' ? '#fff' : '#EF4444',
                            '&:hover': { bgcolor: '#DC2626', color: '#fff', borderColor: '#DC2626' },
                          }}
                        >
                          🔴 Unavailable
                        </Button>
                        <Button
                          size="small"
                          variant={bus.status === 'MAINTENANCE' ? 'contained' : 'outlined'}
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(bus.id, 'MAINTENANCE')}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 750,
                            py: 0.6,
                            borderRadius: 1.5,
                            bgcolor: bus.status === 'MAINTENANCE' ? '#F59E0B' : 'transparent',
                            borderColor: '#F59E0B',
                            color: bus.status === 'MAINTENANCE' ? '#fff' : '#F59E0B',
                            '&:hover': { bgcolor: '#D97706', color: '#fff', borderColor: '#D97706' },
                          }}
                        >
                          🟡 Maintenance
                        </Button>
                        <Button
                          size="small"
                          variant={bus.status === 'COMPLETED' ? 'contained' : 'outlined'}
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(bus.id, 'COMPLETED')}
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 750,
                            py: 0.6,
                            borderRadius: 1.5,
                            bgcolor: bus.status === 'COMPLETED' ? '#64748B' : 'transparent',
                            borderColor: '#64748B',
                            color: bus.status === 'COMPLETED' ? '#fff' : '#64748B',
                            '&:hover': { bgcolor: '#475569', color: '#fff', borderColor: '#475569' },
                          }}
                        >
                          ⚪ Completed
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
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
