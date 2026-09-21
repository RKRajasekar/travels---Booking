'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import PowerIcon from '@mui/icons-material/Power';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LuggageIcon from '@mui/icons-material/Luggage';
import ShieldIcon from '@mui/icons-material/Shield';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PolicyIcon from '@mui/icons-material/Policy';

export default function CabDetailsModal({ open, onClose, cab }) {
  const router = useRouter();

  if (!cab) return null;

  const {
    id,
    name: driverName,
    avatar: driverAvatar,
    rating,
    trips,
    experience,
    languages,
    vehicleModel,
    vehicleNumber,
    category,
    categoryName,
    vehicleImage,
    ac,
    seats,
    luggage,
    fuelType,
    color,
    totalFare,
    fare,
    route,
  } = cab;

  const handleBookNow = () => {
    onClose();
    const query = new URLSearchParams({
      driverId: id,
      pickup: route?.pickup || 'Chennai',
      drop: route?.drop || 'Bangalore',
      date: route?.date || new Date().toISOString().split('T')[0],
      time: route?.time || '08:00 AM',
      passengers: (route?.passengers || 1).toString(),
      category: category || 'SEDAN',
    });

    router.push(`/cab/checkout?${query.toString()}`);
  };

  const amenities = [
    { icon: <AcUnitIcon sx={{ color: '#0284C7' }} />, label: 'Air Conditioning (High Cooling)' },
    { icon: <PowerIcon sx={{ color: '#059669' }} />, label: 'High-Speed USB Phone Charging' },
    { icon: <MusicNoteIcon sx={{ color: '#D97706' }} />, label: 'Bluetooth Music & Audio System' },
    { icon: <LuggageIcon sx={{ color: '#7C3AED' }} />, label: `Dedicated Luggage Space (${luggage} Bags)` },
    { icon: <WaterDropIcon sx={{ color: '#0284C7' }} />, label: 'Complimentary Packaged Water' },
    { icon: <ShieldIcon sx={{ color: '#DC2626' }} />, label: '24/7 Live GPS Safety Monitored' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          bgcolor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={vehicleImage}
            alt={vehicleModel}
            sx={{ width: 44, height: 44, borderRadius: 2 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>
              {vehicleModel} ({categoryName || category})
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Vehicle Plate: {vehicleNumber} • {color || 'Commercial'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#FFFFFF' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: '#F8FAFC' }}>
        <Grid container spacing={3}>
          {/* Driver Information Card */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ color: '#D97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                Driver Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={driverAvatar}
                  alt={driverName}
                  sx={{ width: 60, height: 60, border: '3px solid #D97706' }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A' }}>
                      {driverName}
                    </Typography>
                    <VerifiedIcon sx={{ fontSize: 18, color: '#059669' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Experience: {experience || '7 years'} • Rating: ⭐ {rating}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                    ✓ 100% Background Verified Chauffeur
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total Completed Trips</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{trips?.toLocaleString()} Rides</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Languages Spoken</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {languages ? languages.join(', ') : 'Tamil, English'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Driver Status</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 800 }}>🟢 Available Now</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Sanitization</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>✓ Sanitized Daily</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Trip & Route Itinerary */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                Trip & Route Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationOnIcon sx={{ color: '#D97706', mt: 0.2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Pickup Location</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{route?.pickup || 'Chennai'}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationOnIcon sx={{ color: '#059669', mt: 0.2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Drop Destination</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{route?.drop || 'Bangalore'}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <AccessTimeIcon sx={{ color: '#64748B', mt: 0.2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Travel Schedule</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {route?.date} at {route?.time} ({route?.passengers || 1} Passenger{(route?.passengers || 1) > 1 ? 's' : ''})
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(5, 150, 105, 0.08)', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#047857' }}>
                    Est. Highway Distance: {route?.distanceKm || 350} km
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#047857' }}>
                    Est. Duration: ~{Math.round((route?.distanceKm || 350) / 55)} hrs
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Amenities Grid */}
          <Grid item xs={12}>
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 2 }}>
                Included Ride Amenities
              </Typography>
              <Grid container spacing={2}>
                {amenities.map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#F1F5F9', display: 'flex' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 650, color: '#334155' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Policies & Fare Breakdown */}
          <Grid item xs={12} md={7}>
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                Ride Policies & Terms
              </Typography>
              <List dense disablePadding>
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} /></ListItemIcon>
                  <ListItemText primary="Free Cancellation up to 1 hour before scheduled pickup." primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 500 }} />
                </ListItem>
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} /></ListItemIcon>
                  <ListItemText primary="Complimentary 15 minutes waiting time included at pickup point." primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 500 }} />
                </ListItem>
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} /></ListItemIcon>
                  <ListItemText primary="State and highway tolls are transparently calculated in total fare." primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 500 }} />
                </ListItem>
                <ListItem sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} /></ListItemIcon>
                  <ListItemText primary="Zero hidden driver bata charges or night surge on confirmed bookings." primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: 500 }} />
                </ListItem>
              </List>
            </Box>
          </Grid>

          {/* Itemized Fare Card */}
          <Grid item xs={12} md={5}>
            <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.25)', height: '100%' }}>
              <Typography variant="subtitle2" sx={{ color: '#92400E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                Fare Breakdown
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Base Fare</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{fare?.baseFare || 160}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Distance Fare ({fare?.distanceKm || 15} km)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{fare?.distanceFare || 650}</Typography>
                </Box>
                {(fare?.tollCharges || 0) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Estimated Toll</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{fare?.tollCharges}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Safety & Service Fee</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{fare?.serviceFee || 49}</Typography>
                </Box>
                {(fare?.discountAmount || 0) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Coupon Discount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>-₹{fare?.discountAmount}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A' }}>Total Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#D97706' }}>
                    ₹{Math.round(totalFare || 899).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF', justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#64748B', fontWeight: 700 }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleBookNow}
          endIcon={<ArrowForwardIcon />}
          sx={{
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            px: 4,
            py: 1.2,
            borderRadius: 2.5,
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            },
          }}
        >
          BOOK THIS CAB NOW
        </Button>
      </DialogActions>
    </Dialog>
  );
}
