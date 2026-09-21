'use client';

import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import { getOperatorBookings } from '@/actions/travelOwner';

export default function TravelOwnerBookingsPage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    const res = await getOperatorBookings(operatorName);
    if (res.success) {
      setBookings(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [operatorName]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab !== 'ALL' && b.status.toUpperCase() !== activeTab.toUpperCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.id?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.vehicle?.toLowerCase().includes(q) ||
        b.route?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'Confirmed':
        return <Chip label="CONFIRMED" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #A7F3D0' }} />;
      case 'Upcoming':
        return <Chip label="UPCOMING" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #BFDBFE' }} />;
      case 'Completed':
        return <Chip label="COMPLETED" size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #CBD5E1' }} />;
      case 'Cancelled':
        return <Chip label="CANCELLED" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #FECACA' }} />;
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
            Operator Passenger Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Strictly displaying bookings for <strong style={{ color: '#DC2626' }}>{operatorName}</strong> buses and cabs ({bookings.length} Total Records)
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={fetchBookings}
          startIcon={<SyncIcon />}
          sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { fontWeight: 750, fontSize: '0.85rem', minHeight: 40 },
                '& .Mui-selected': { color: '#DC2626' },
                '& .MuiTabs-indicator': { bgcolor: '#DC2626' },
              }}
            >
              <Tab value="ALL" label="All Statuses" />
              <Tab value="CONFIRMED" label="Confirmed" />
              <Tab value="UPCOMING" label="Upcoming" />
              <Tab value="COMPLETED" label="Completed" />
              <Tab value="CANCELLED" label="Cancelled" />
            </Tabs>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by Booking ID, customer, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Bookings Table */}
      <Card sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#DC2626' }} />
          </Box>
        ) : filteredBookings.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#64748B' }}>
              No bookings found matching current filters.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Booking ID</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Fare</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.8, color: '#334155' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.8, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                      {booking.id}
                    </TableCell>

                    <TableCell sx={{ py: 1.8 }}>
                      <Chip
                        icon={booking.type === 'BUS' ? <DirectionsBusIcon sx={{ fontSize: '13px !important' }} /> : <LocalTaxiIcon sx={{ fontSize: '13px !important' }} />}
                        label={booking.type}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          bgcolor: booking.type === 'BUS' ? '#FEF2F2' : '#F0FDF4',
                          color: booking.type === 'BUS' ? '#DC2626' : '#059669',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.8 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {booking.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {booking.customerPhone}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.8, color: '#334155', fontWeight: 650, fontSize: '0.85rem' }}>
                      {booking.vehicle}
                    </TableCell>

                    <TableCell sx={{ py: 1.8, color: '#0F172A', fontWeight: 700, fontSize: '0.88rem' }}>
                      {booking.route}
                    </TableCell>

                    <TableCell sx={{ py: 1.8 }}>
                      <Typography variant="body2" sx={{ fontWeight: 650, color: '#334155' }}>
                        {booking.date}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {booking.time}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.8, fontWeight: 850, color: '#059669', fontSize: '0.95rem' }}>
                      ₹{booking.fare}
                    </TableCell>

                    <TableCell sx={{ py: 1.8 }}>
                      {getStatusChip(booking.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
