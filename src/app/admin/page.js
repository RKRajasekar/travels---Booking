'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Container,
  Grid,
  Card,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/AltRoute';
import PaidIcon from '@mui/icons-material/Paid';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import BusinessIcon from '@mui/icons-material/Business';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BuildIcon from '@mui/icons-material/Build';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { getAdminFleetData, adminUpdateBusAvailability } from '@/actions/admin';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function AdminDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [fleetData, setFleetData] = useState({
    stats: {
      totalOperators: 0,
      totalBuses: 0,
      availableBuses: 0,
      unavailableBuses: 0,
      maintenanceBuses: 0,
      totalSeats: 0,
      registeredTravelOwnersCount: 0,
    },
    operators: [],
    buses: [],
  });

  const [selectedOperator, setSelectedOperator] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fleetSectionRef = useRef(null);

  const handleOperatorCardClick = (opName) => {
    setSelectedOperator((prev) => (prev === opName ? 'ALL' : opName));
    setTimeout(() => {
      if (fleetSectionRef.current) {
        fleetSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Simulated GPS tracker for admin live feed
  const [activeBusLocation, setActiveBusLocation] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
    speed: 55,
    heading: 120,
    timestamp: new Date().toISOString(),
  });

  const fetchFleet = async () => {
    setLoading(true);
    const res = await getAdminFleetData();
    if (res.success) {
      setFleetData(res.data);
    } else {
      setToast({
        open: true,
        message: res.error || 'Failed to fetch fleet data',
        severity: 'error',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    } else if (authStatus === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchFleet();
    }
  }, [authStatus, router, session]);

  // Simulate bus movement for admin map view
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBusLocation((prev) => ({
        ...prev,
        latitude: prev.latitude + (Math.random() - 0.5) * 0.005,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.005,
        timestamp: new Date().toISOString(),
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle Admin Availability Toggle
  const handleToggleBus = async (bus) => {
    const nextStatus = bus.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    setTogglingId(bus.id);

    const res = await adminUpdateBusAvailability(bus.id, nextStatus);
    setTogglingId(null);

    if (res.success) {
      setFleetData((prev) => {
        const updatedBuses = prev.buses.map((b) =>
          b.id === bus.id ? { ...b, status: nextStatus } : b
        );

        const newAvailable = updatedBuses.filter((b) => b.status === 'AVAILABLE').length;
        const newUnavailable = updatedBuses.filter((b) => b.status === 'UNAVAILABLE').length;
        const newMaintenance = updatedBuses.filter((b) => b.status === 'MAINTENANCE').length;

        return {
          ...prev,
          buses: updatedBuses,
          stats: {
            ...prev.stats,
            availableBuses: newAvailable,
            unavailableBuses: newUnavailable,
            maintenanceBuses: newMaintenance,
          },
        };
      });

      setToast({
        open: true,
        message: `Bus ${bus.busNumber} (${bus.operatorName}) is now ${nextStatus}`,
        severity: nextStatus === 'AVAILABLE' ? 'success' : 'warning',
      });
    } else {
      setToast({
        open: true,
        message: res.error || 'Failed to update bus status',
        severity: 'error',
      });
    }
  };

  // Quick maintenance toggle
  const handleSetMaintenance = async (bus) => {
    const nextStatus = bus.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    setTogglingId(bus.id);

    const res = await adminUpdateBusAvailability(bus.id, nextStatus);
    setTogglingId(null);

    if (res.success) {
      setFleetData((prev) => {
        const updatedBuses = prev.buses.map((b) =>
          b.id === bus.id ? { ...b, status: nextStatus } : b
        );
        return { ...prev, buses: updatedBuses };
      });
      setToast({
        open: true,
        message: `Bus ${bus.busNumber} marked ${nextStatus}`,
        severity: nextStatus === 'MAINTENANCE' ? 'info' : 'success',
      });
    }
  };

  if (authStatus === 'loading' || (authStatus === 'authenticated' && loading && fleetData.buses.length === 0)) {
    return <LoadingState message="Verifying administrative clearances & loading master fleet..." />;
  }

  if (authStatus === 'authenticated' && session?.user?.role !== 'ADMIN') {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <EmptyState
          title="Access Denied"
          message="Administrative master privileges are required to access this fleet operations control panel."
          actionLabel="Go Home"
          onAction={() => router.push('/')}
        />
      </Container>
    );
  }

  // Filter buses based on Operator, Status, and Search Query
  const filteredBuses = fleetData.buses.filter((bus) => {
    if (selectedOperator !== 'ALL' && bus.operatorName !== selectedOperator) {
      return false;
    }
    if (selectedStatus !== 'ALL' && bus.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = bus.busNumber?.toLowerCase().includes(q);
      const matchReg = bus.registrationNumber?.toLowerCase().includes(q);
      const matchOp = bus.operatorName?.toLowerCase().includes(q);
      const matchModel = bus.modelName?.toLowerCase().includes(q);
      return matchNum || matchReg || matchOp || matchModel;
    }
    return true;
  });

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '1.6rem', md: '2.1rem' },
                }}
              >
                Admin Fleet & Operations Center
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550, ml: { md: 6 } }}>
              Master overview of all registered travel operators, active coaches, live availability, and real-time transit telemetry.
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={fetchFleet}
              startIcon={<SyncIcon />}
              sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, borderRadius: 2 }}
            >
              Sync Fleets
            </Button>
            <Button
              component={Link}
              href="/travel-owner/dashboard"
              variant="contained"
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#DC2626',
                '&:hover': { bgcolor: '#B91C1C' },
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              Operator Workspace ↗
            </Button>
          </Box>
        </Box>

        {/* Global Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Registered Travels',
              value: `${fleetData.stats.totalOperators} Operators`,
              sub: 'Across South & National routes',
              icon: <BusinessIcon sx={{ fontSize: 28 }} />,
              color: '#7C3AED',
            },
            {
              title: 'Total Fleet Buses',
              value: `${fleetData.stats.totalBuses} Coaches`,
              sub: `${fleetData.stats.availableBuses} Available • ${fleetData.stats.unavailableBuses + fleetData.stats.maintenanceBuses} Inactive`,
              icon: <DirectionsBusIcon sx={{ fontSize: 28 }} />,
              color: '#2563EB',
            },
            {
              title: 'Total Passenger Seats',
              value: `${fleetData.stats.totalSeats.toLocaleString()} Seats`,
              sub: 'Luxury Sleeper & Seater Capacity',
              icon: <EventSeatIcon sx={{ fontSize: 28 }} />,
              color: '#059669',
            },
            {
              title: 'System Revenue',
              value: '₹1,04,580',
              sub: 'Direct Operator Settlements',
              icon: <PaidIcon sx={{ fontSize: 28 }} />,
              color: '#D97706',
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  border: '1px solid #E2E8F0',
                  borderRadius: 3.5,
                  boxShadow: 'none',
                  bgcolor: '#FFFFFF',
                }}
              >
                <Box
                  sx={{
                    p: 1.8,
                    borderRadius: 2.5,
                    bgcolor: `${item.color}15`,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', my: 0.2 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    {item.sub}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Registered Travels Directory Cards */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A' }}>
              Registered Travel Operators
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
              Showing {fleetData.operators.length} Partner Fleets
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {fleetData.operators.map((op) => (
              <Grid item xs={12} sm={6} md={3} key={op.name}>
                <Card
                  onClick={() => handleOperatorCardClick(op.name)}
                  sx={{
                    p: 2.2,
                    borderRadius: 3,
                    border: selectedOperator === op.name ? '2px solid #DC2626' : '1px solid #E2E8F0',
                    bgcolor: selectedOperator === op.name ? '#FEF2F2' : '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: selectedOperator === op.name ? '0 8px 24px rgba(220, 38, 38, 0.16)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#DC2626',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      variant="rounded"
                      src={op.logo}
                      alt={op.name}
                      sx={{
                        width: 56,
                        height: 44,
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                        bgcolor: '#DC2626',
                        '& img': { objectFit: 'cover' },
                      }}
                    >
                      <DirectionsBusIcon sx={{ fontSize: 24, color: '#FFFFFF' }} />
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 850, color: '#0F172A' }}>
                        {op.name}
                      </Typography>
                      <Typography variant="caption" noWrap sx={{ color: '#64748B', display: 'block' }}>
                        {op.ownerName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Chip
                      size="small"
                      label={`${op.totalBuses} Buses`}
                      sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#1E293B' }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>
                      {op.availableBuses} Available
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Master Registered Buses Table Section */}
        <Card
          ref={fleetSectionRef}
          id="registered-fleet-section"
          sx={{
            p: 3,
            mb: 5,
            borderRadius: 3.5,
            border: '1px solid #E2E8F0',
            boxShadow: 'none',
            scrollMarginTop: '32px',
          }}
        >
          {/* Header & Filter Controls */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A' }}>
                  Registered Fleet Buses ({filteredBuses.length} Coaches)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Live availability controls and administrative status override across all registered travels.
                </Typography>
              </Box>
              {selectedOperator !== 'ALL' && (
                <Chip
                  label={`Filtered by: ${selectedOperator}`}
                  onDelete={() => setSelectedOperator('ALL')}
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            <Grid container spacing={2} alignItems="center">
              {/* Search Field */}
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search bus number, reg no, operator, or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                  }}
                />
              </Grid>

              {/* Operator Dropdown Filter */}
              <Grid item xs={6} md={3.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter By Operator</InputLabel>
                  <Select
                    value={selectedOperator}
                    label="Filter By Operator"
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    sx={{ bgcolor: '#F8FAFC', borderRadius: 2 }}
                  >
                    <MenuItem value="ALL">All Operators ({fleetData.buses.length})</MenuItem>
                    {fleetData.operators.map((op) => (
                      <MenuItem key={op.name} value={op.name}>
                        {op.name} ({op.totalBuses})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={6} md={3.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Availability Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Availability Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{ bgcolor: '#F8FAFC', borderRadius: 2 }}
                  >
                    <MenuItem value="ALL">All Statuses ({fleetData.buses.length})</MenuItem>
                    <MenuItem value="AVAILABLE">Available Only ({fleetData.stats.availableBuses})</MenuItem>
                    <MenuItem value="UNAVAILABLE">Unavailable Only ({fleetData.stats.unavailableBuses})</MenuItem>
                    <MenuItem value="MAINTENANCE">Maintenance Only ({fleetData.stats.maintenanceBuses})</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Travel Operator</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Bus & Reg Plate</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Vehicle Model & Class</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Seats</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>
                    Admin Override
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
                        No buses found matching the current search or filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBuses.map((bus) => {
                    const isAvailable = bus.status === 'AVAILABLE';
                    const isMaintenance = bus.status === 'MAINTENANCE';
                    const isToggling = togglingId === bus.id;

                    return (
                      <TableRow
                        key={bus.id}
                        sx={{
                          '&:hover': { bgcolor: '#F8FAFC' },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Operator */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              variant="rounded"
                              src={bus.operatorLogo}
                              alt={bus.operatorName}
                              sx={{
                                width: 52,
                                height: 40,
                                borderRadius: 1.8,
                                border: '1px solid #E2E8F0',
                                bgcolor: '#DC2626',
                                '& img': { objectFit: 'cover' },
                              }}
                            >
                              <DirectionsBusIcon sx={{ fontSize: 20, color: '#FFFFFF' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                {bus.operatorName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                {bus.operatorOwner}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Bus Number & Registration */}
                        <TableCell sx={{ py: 2 }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.2,
                              py: 0.3,
                              borderRadius: 1.5,
                              bgcolor: '#1E293B',
                              color: '#FDE047',
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              letterSpacing: 0.8,
                              mb: 0.3,
                            }}
                          >
                            {bus.busNumber}
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                            {bus.registrationNumber}
                          </Typography>
                        </TableCell>

                        {/* Model & Class */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                            {bus.modelName}
                          </Typography>
                          <Chip
                            label={bus.busClass}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(220, 38, 38, 0.08)',
                              color: '#DC2626',
                              mt: 0.4,
                            }}
                          />
                        </TableCell>

                        {/* Route */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                            {bus.assignedRoute}
                          </Typography>
                        </TableCell>

                        {/* Capacity */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventSeatIcon sx={{ fontSize: 16, color: '#64748B' }} />
                            <Typography variant="body2" sx={{ fontWeight: 750, color: '#0F172A' }}>
                              {bus.totalSeats}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Status */}
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            size="small"
                            icon={
                              isAvailable ? (
                                <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                              ) : isMaintenance ? (
                                <BuildIcon sx={{ fontSize: '14px !important' }} />
                              ) : (
                                <CancelIcon sx={{ fontSize: '14px !important' }} />
                              )
                            }
                            label={bus.status}
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: isAvailable
                                ? 'rgba(16, 185, 129, 0.12)'
                                : isMaintenance
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(239, 68, 68, 0.12)',
                              color: isAvailable ? '#059669' : isMaintenance ? '#D97706' : '#DC2626',
                              border: isAvailable
                                ? '1px solid #10B981'
                                : isMaintenance
                                ? '1px solid #F59E0B'
                                : '1px solid #EF4444',
                            }}
                          />
                        </TableCell>

                        {/* Admin Action Toggle */}
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            {isToggling ? (
                              <CircularProgress size={22} sx={{ color: '#DC2626' }} />
                            ) : (
                              <>
                                <Tooltip title={isAvailable ? 'Click to mark Unavailable' : 'Click to mark Available'}>
                                  <Switch
                                    checked={isAvailable}
                                    onChange={() => handleToggleBus(bus)}
                                    color="success"
                                    size="small"
                                    sx={{
                                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#059669' },
                                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#059669' },
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip title={isMaintenance ? 'Remove Maintenance' : 'Set to Maintenance'}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleSetMaintenance(bus)}
                                    sx={{
                                      minWidth: 28,
                                      px: 1,
                                      py: 0.3,
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      borderColor: isMaintenance ? '#F59E0B' : '#E2E8F0',
                                      color: isMaintenance ? '#D97706' : '#64748B',
                                      bgcolor: isMaintenance ? '#FFFBEB' : 'transparent',
                                      '&:hover': { borderColor: '#F59E0B' },
                                    }}
                                  >
                                    🛠️
                                  </Button>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Live Map & Active Telemetry */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={7.2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A' }}>
                Active Fleet Live GPS Telemetry
              </Typography>
              <Chip
                label="Real-time Satellite Feeds Active"
                color="success"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 800, fontSize: '11px' }}
              />
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 3.5, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <LiveMap
                latitude={activeBusLocation.latitude}
                longitude={activeBusLocation.longitude}
                speed={activeBusLocation.speed}
                heading={activeBusLocation.heading}
                sourceCity="Chennai"
                destCity="Coimbatore"
                stops={['Salem']}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4.8}>
            <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A', mb: 2 }}>
              High-Frequency Trunk Routes
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Route</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Key Stops</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A', py: 1.8 }}>Base Fare</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { route: 'Chennai ➔ Coimbatore', stops: 'Salem', price: '₹2,940' },
                    { route: 'Chennai ➔ Madurai', stops: 'Trichy', price: '₹2,520' },
                    { route: 'Chennai ➔ Bangalore', stops: 'Hosur, Vellore', price: '₹3,360' },
                    { route: 'Bangalore ➔ Hyderabad', stops: 'Anantapur, Kurnool', price: '₹3,500' },
                    { route: 'Coimbatore ➔ Chennai', stops: 'Salem', price: '₹2,940' },
                    { route: 'Madurai ➔ Chennai', stops: 'Trichy', price: '₹2,520' },
                  ].map((row, idx) => (
                    <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#0F172A', py: 1.5 }}>{row.route}</TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '0.85rem', py: 1.5 }}>{row.stops}</TableCell>
                      <TableCell sx={{ color: '#DC2626', fontWeight: 850, py: 1.5 }}>{row.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
