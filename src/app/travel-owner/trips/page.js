'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import SyncIcon from '@mui/icons-material/Sync';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getOperatorTrips, updateTripStatus, updateBusAvailability } from '@/actions/travelOwner';

export default function TravelOwnerTripsPage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('SCHEDULED');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const res = await getOperatorTrips(operatorName);
    if (res.success) {
      setTrips(res.data);
    }
    setLoading(false);
  }, [operatorName]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleEditOpen = (trip) => {
    setSelectedTrip(trip);
    setEditStatus(trip.status);
    setDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedTrip) return;
    const res = await updateTripStatus(selectedTrip.id, editStatus);
    setDialogOpen(false);
    if (res.success) {
      setTrips((prev) =>
        prev.map((t) => (t.id === selectedTrip.id ? { ...t, status: editStatus } : t))
      );
      setSnackbar({ open: true, message: `Trip status updated to ${editStatus}`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: res.error || 'Failed to update trip', severity: 'error' });
    }
  };

  const handleToggleBusAvail = async (trip) => {
    const nextStatus = trip.busAvailability === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    const res = await updateBusAvailability(trip.busId || trip.busNumber, nextStatus);
    if (res.success) {
      fetchTrips();
      setSnackbar({
        open: true,
        message: `Bus set to ${nextStatus}. Trip availability updated.`,
        severity: nextStatus === 'AVAILABLE' ? 'success' : 'warning',
      });
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'TODAY') return t.status === 'ACTIVE';
    if (activeTab === 'UPCOMING') return t.status === 'SCHEDULED';
    if (activeTab === 'COMPLETED') return t.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return t.status === 'CANCELLED';
    return true;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Chip label="TODAY'S TRIP" size="small" sx={{ bgcolor: '#DBEAFE', color: '#1E40AF', fontWeight: 800, fontSize: '0.7rem' }} />;
      case 'SCHEDULED':
        return <Chip label="UPCOMING" size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 800, fontSize: '0.7rem' }} />;
      case 'COMPLETED':
        return <Chip label="COMPLETED" size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '0.7rem' }} />;
      case 'CANCELLED':
        return <Chip label="CANCELLED" size="small" sx={{ bgcolor: '#FEF2F2', color: '#991B1B', fontWeight: 800, fontSize: '0.7rem' }} />;
      default:
        return <Chip label={status} size="small" sx={{ fontWeight: 800 }} />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
            Bus Trip Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Scheduled, active, and completed routes for <strong style={{ color: '#DC2626' }}>{operatorName}</strong>
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={fetchTrips}
          startIcon={<SyncIcon />}
          sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
        >
          Refresh Trips
        </Button>
      </Box>

      {/* Tabs Filter */}
      <Paper sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            pt: 0.5,
            '& .MuiTab-root': { fontWeight: 750, fontSize: '0.88rem', minHeight: 48 },
            '& .Mui-selected': { color: '#DC2626' },
            '& .MuiTabs-indicator': { bgcolor: '#DC2626', height: 3 },
          }}
        >
          <Tab value="ALL" label={`All Trips (${trips.length})`} />
          <Tab value="TODAY" label="Today's Trips" />
          <Tab value="UPCOMING" label="Upcoming Trips" />
          <Tab value="COMPLETED" label="Completed" />
          <Tab value="CANCELLED" label="Cancelled" />
        </Tabs>
      </Paper>

      {/* Trips Table */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#DC2626' }} />
          </Box>
        ) : filteredTrips.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748B' }}>
              No trips found in this view.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Route & Bus</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Departure / Arrival</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Seats</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTrips.map((trip) => (
                  <TableRow key={trip.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 850, color: '#0F172A' }}>
                        {trip.route}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 650 }}>
                        Bus: <strong style={{ color: '#0F172A' }}>{trip.busNumber}</strong> ({trip.busType})
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        Dep: {trip.departureTime}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Arr: {trip.arrivalTime}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Available
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                            {trip.availableSeats}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Booked
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#DC2626' }}>
                            {trip.bookedSeats}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      {getStatusChip(trip.status)}
                    </TableCell>

                    <TableCell sx={{ py: 2, textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditOpen(trip)}
                          startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                          sx={{ fontSize: '0.75rem', fontWeight: 750, py: 0.4, borderColor: '#CBD5E1', color: '#334155' }}
                        >
                          Edit Status
                        </Button>
                        <Button
                          component={Link}
                          href="/travel-owner/bookings"
                          size="small"
                          variant="text"
                          startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                          sx={{ fontSize: '0.75rem', fontWeight: 750, color: '#DC2626' }}
                        >
                          Bookings
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 850, color: '#0F172A' }}>
          Update Trip Status
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Change status for route: <strong>{selectedTrip?.route}</strong>
          </Typography>
          <TextField
            select
            fullWidth
            label="Trip Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
          >
            <MenuItem value="SCHEDULED">Scheduled (Upcoming)</MenuItem>
            <MenuItem value="ACTIVE">Active (Today&apos;s Trip)</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 700, color: '#64748B' }}>
            Cancel
          </Button>
          <Button onClick={handleSaveStatus} variant="contained" sx={{ bgcolor: '#DC2626', fontWeight: 700, '&:hover': { bgcolor: '#B91C1C' } }}>
            Save Status
          </Button>
        </DialogActions>
      </Dialog>

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
