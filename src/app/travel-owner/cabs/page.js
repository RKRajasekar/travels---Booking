'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Button,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import PersonIcon from '@mui/icons-material/Person';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SyncIcon from '@mui/icons-material/Sync';
import { getOperatorCabs, updateCabAvailability } from '@/actions/travelOwner';

export default function TravelOwnerCabsPage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [loading, setLoading] = useState(true);
  const [cabs, setCabs] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCabs = async () => {
    setLoading(true);
    const res = await getOperatorCabs(operatorName);
    if (res.success) {
      setCabs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCabs();
  }, [operatorName]);

  const handleToggleAvailability = async (cab) => {
    const nextAvail = !cab.available;
    setUpdatingId(cab.id);
    const res = await updateCabAvailability(cab.driverId, nextAvail);
    setUpdatingId(null);

    if (res.success) {
      setCabs((prev) =>
        prev.map((c) => (c.id === cab.id ? { ...c, available: nextAvail, status: nextAvail ? 'AVAILABLE' : 'BUSY' } : c))
      );
      setSnackbar({
        open: true,
        message: res.message,
        severity: nextAvail ? 'success' : 'warning',
      });
    } else {
      setSnackbar({ open: true, message: res.error || 'Failed to update cab', severity: 'error' });
    }
  };

  const filteredCabs = cabs.filter((c) => {
    if (filterCategory === 'ALL') return true;
    return c.category.toUpperCase() === filterCategory.toUpperCase();
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
            Cab & Car Fleet Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
            Active cars & assigned chauffeurs for <strong style={{ color: '#059669' }}>{operatorName}</strong> ({cabs.length} Vehicles)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              sx={{ bgcolor: '#fff', borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="MINI">Mini Hatchback</MenuItem>
              <MenuItem value="SEDAN">Comfort Sedan</MenuItem>
              <MenuItem value="SUV">Prime SUV</MenuItem>
              <MenuItem value="XL">Multi-Utility XL</MenuItem>
              <MenuItem value="PREMIUM">Executive Premium</MenuItem>
              <MenuItem value="LUXURY">Ultra Luxury</MenuItem>
              <MenuItem value="ELECTRIC">100% Electric EV</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={fetchCabs}
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
        <strong>Direct Cab Search Connection:</strong> Toggling any vehicle to <strong>Unavailable</strong> will immediately remove that car & driver from the live customer cab booking page (/cab). Toggling it back to <strong>Available</strong> instantly restores it for booking.
      </Alert>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#059669' }} />
        </Box>
      ) : filteredCabs.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748B' }}>
            No cabs found for category: {filterCategory}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredCabs.map((cab) => {
            const isAvail = cab.available;
            const isUpdating = updatingId === cab.id;

            return (
              <Grid item xs={12} md={6} lg={4} key={cab.id}>
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
                  {/* Vehicle Image Banner */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={cab.image}
                      alt={cab.vehicleModel}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Chip
                      label={cab.categoryName}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(15, 23, 42, 0.85)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        backdropFilter: 'blur(6px)',
                      }}
                    />
                    <Chip
                      icon={isAvail ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <CancelIcon sx={{ fontSize: '14px !important' }} />}
                      label={isAvail ? 'AVAILABLE' : 'UNAVAILABLE'}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: isAvail ? '#ECFDF5' : '#FEF2F2',
                        color: isAvail ? '#059669' : '#DC2626',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        border: `1px solid ${isAvail ? '#A7F3D0' : '#FECACA'}`,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Model & Number */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0F172A', lineHeight: 1.2, mb: 0.3 }}>
                        {cab.vehicleModel}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, fontFamily: 'monospace' }}>
                        {cab.vehicleNumber} • {cab.color}
                      </Typography>
                    </Box>

                    {/* Driver Card */}
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 18, color: '#059669' }} />
                        <Typography variant="body2" sx={{ fontWeight: 750, color: '#1E293B' }}>
                          Driver: {cab.driverName}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', pl: 3.2 }}>
                        Phone: {cab.driverPhone} • Rating: ⭐ {cab.rating} ({cab.totalTrips} rides)
                      </Typography>
                    </Box>

                    {/* Specifications */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <AirlineSeatReclineNormalIcon sx={{ fontSize: 18, color: '#64748B' }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                            {cab.seats} Passenger Seats
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <AcUnitIcon sx={{ fontSize: 18, color: '#0284C7' }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                            {cab.ac ? 'Climate AC' : 'Non-AC'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                          <Typography variant="caption" sx={{ fontWeight: 650, color: '#475569' }}>
                            Base Location: {cab.currentLocation}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ mb: 2, mt: 'auto' }} />

                    {/* Availability Toggle Control */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 750, color: '#475569', display: 'block' }}>
                          Customer Availability:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: isAvail ? '#059669' : '#DC2626' }}>
                          {isAvail ? '🟢 Live in Cab Search' : '🔴 Hidden from Search'}
                        </Typography>
                      </Box>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={isAvail}
                            disabled={isUpdating}
                            onChange={() => handleToggleAvailability(cab)}
                            color="success"
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </CardContent>
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
