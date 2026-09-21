'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  Tooltip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import LuggageIcon from '@mui/icons-material/Luggage';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import NearMeIcon from '@mui/icons-material/NearMe';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function CabCard({ cab, onViewDetails }) {
  const router = useRouter();

  if (!cab) return null;

  const {
    id,
    name: driverName,
    avatar: driverAvatar,
    rating,
    trips,
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
    distanceKm,
    etaMinutes,
    available,
    totalFare,
    fare,
    route,
  } = cab;

  const handleBookCab = () => {
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

  const isEV = category === 'ELECTRIC' || fuelType?.toLowerCase().includes('electric');

  return (
    <Card
      sx={{
        borderRadius: 3.5,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 36px -8px rgba(217, 119, 6, 0.16), 0 0 0 1px rgba(217, 119, 6, 0.3)',
          borderColor: 'rgba(217, 119, 6, 0.4)',
        },
      }}
    >
      <Grid container>
        {/* Left Column: Vehicle & Driver Header Image */}
        <Grid item xs={12} sm={4} md={3.5} sx={{ position: 'relative', minHeight: 210 }}>
          <Box
            component="img"
            src={vehicleImage}
            alt={vehicleModel}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              minHeight: { xs: 180, sm: 210 },
              objectFit: 'cover',
              display: 'block',
            }}
          />
          {/* Subtle dark gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
            }}
          />

          {/* Availability Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              px: 1.2,
              py: 0.4,
              borderRadius: 2,
              bgcolor: available ? 'rgba(5, 150, 105, 0.92)' : 'rgba(220, 38, 38, 0.92)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#FFFFFF',
                animation: available ? 'pulseGlow 2s infinite' : 'none',
              }}
            />
            {available ? 'AVAILABLE NOW' : 'BUSY'}
          </Box>

          {/* Category Chip */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              px: 1.2,
              py: 0.4,
              borderRadius: 2,
              bgcolor: isEV ? 'rgba(16, 185, 129, 0.95)' : 'rgba(217, 119, 6, 0.95)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 800,
              backdropFilter: 'blur(4px)',
              textTransform: 'uppercase',
            }}
          >
            {isEV ? '⚡ EV' : category}
          </Box>

          {/* Vehicle Model & Plate at bottom of image */}
          <Box sx={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
            <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>
              {vehicleModel}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.78rem', fontWeight: 600 }}>
              {vehicleNumber} • {color || 'Commercial'}
            </Typography>
          </Box>
        </Grid>

        {/* Middle Column: Driver Specs & Vehicle Features */}
        <Grid item xs={12} sm={5} md={5.5} sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Driver Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Avatar
                src={driverAvatar}
                alt={driverName}
                sx={{
                  width: 44,
                  height: 44,
                  border: '2px solid #D97706',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                    {driverName}
                  </Typography>
                  <VerifiedIcon sx={{ fontSize: 16, color: '#059669' }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  {trips?.toLocaleString()} Completed Rides • {cab.experience || '5+ yrs exp'}
                </Typography>
              </Box>
            </Box>

            {/* Rating Tag */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                px: 1.2,
                py: 0.4,
                borderRadius: 1.8,
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#B45309' }}>
                {rating}
              </Typography>
            </Box>
          </Box>

          {/* Feature Specs Badges */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1.2 }}>
            <Chip
              icon={<AirlineSeatReclineNormalIcon sx={{ fontSize: '16px !important', color: '#334155 !important' }} />}
              label={`${seats} Seats`}
              size="small"
              sx={{ bgcolor: '#F1F5F9', fontWeight: 700, color: '#334155' }}
            />
            <Chip
              icon={<LuggageIcon sx={{ fontSize: '16px !important', color: '#334155 !important' }} />}
              label={`${luggage} Luggage`}
              size="small"
              sx={{ bgcolor: '#F1F5F9', fontWeight: 700, color: '#334155' }}
            />
            {ac && (
              <Chip
                icon={<AcUnitIcon sx={{ fontSize: '14px !important', color: '#0284C7 !important' }} />}
                label="AC Coach"
                size="small"
                sx={{ bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0369A1', fontWeight: 700 }}
              />
            )}
            {isEV ? (
              <Chip
                icon={<FlashOnIcon sx={{ fontSize: '15px !important', color: '#059669 !important' }} />}
                label="100% Electric"
                size="small"
                sx={{ bgcolor: 'rgba(5, 150, 105, 0.1)', color: '#047857', fontWeight: 700 }}
              />
            ) : (
              <Chip
                icon={<LocalGasStationIcon sx={{ fontSize: '14px !important', color: '#64748B !important' }} />}
                label={fuelType || 'Petrol / Diesel'}
                size="small"
                sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Proximity / Live ETA */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mt: 1,
              p: 1.2,
              borderRadius: 2,
              bgcolor: 'rgba(217, 119, 6, 0.06)',
              border: '1px dashed rgba(217, 119, 6, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <AccessTimeFilledIcon sx={{ fontSize: 16, color: '#D97706' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 750, color: '#92400E' }}>
                Pickup in {etaMinutes || 5} mins
              </Typography>
            </Box>
            <Typography sx={{ color: '#CBD5E1' }}>•</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <NearMeIcon sx={{ fontSize: 16, color: '#D97706' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 650, color: '#64748B' }}>
                {distanceKm || 1.8} km away
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Dynamic Price & CTA Actions */}
        <Grid
          item
          xs={12}
          sm={3}
          md={3}
          sx={{
            p: 2.5,
            borderLeft: { sm: '1px solid #F1F5F9' },
            bgcolor: 'rgba(248, 250, 252, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, width: '100%' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estimated Total Fare
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.5, my: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                ₹{Math.round(totalFare || 899).toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 750, display: 'block' }}>
              ✓ Transparent pricing • No surge
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, width: '100%', mt: { xs: 2, sm: 2 } }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleBookCab}
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.92rem',
                py: 1,
                borderRadius: 2.5,
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  boxShadow: '0 6px 20px rgba(217, 119, 6, 0.5)',
                },
              }}
            >
              Book Cab
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => onViewDetails && onViewDetails(cab)}
              startIcon={<InfoOutlinedIcon />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                py: 0.8,
                borderRadius: 2.5,
                '&:hover': {
                  borderColor: '#D97706',
                  color: '#D97706',
                  bgcolor: 'rgba(217, 119, 6, 0.05)',
                },
              }}
            >
              View Details
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
