'use client';

import React from 'react';
import { Card, Box, Typography, Divider, Grid } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDateTime } from '@/lib/utils';

export default function BookingSummary({ trip, seats, boardingPoint, droppingPoint, discountAmount = 0, couponCode = '' }) {
  // Convert standard USD price from database to INR by multiplying by 84
  const priceINR = trip.price * 84;
  const base = Math.round(priceINR * seats.length);
  const tax = Math.round(base * 0.05); // 5% GST
  const fee = Math.round(seats.length * 20); // Platform fee per seat
  const subtotal = base + tax + fee;
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <Card sx={{ p: 3.5, border: '1px solid #E2E8F0', borderRadius: 3, height: 'fit-content', backgroundColor: '#ffffff' }}>
      <Typography variant="h6" sx={{ fontWeight: 850, mb: 2.5, color: 'primary.main' }}>
        Journey Details
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ bgcolor: 'rgba(37, 99, 235, 0.06)', color: 'secondary.main', p: 1.2, borderRadius: 2 }}>
          <DirectionsBusIcon />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {trip.bus.operatorName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {trip.bus.busType.replace('_', ' ')} | No: {trip.bus.busNumber}
          </Typography>
        </Box>
      </Box>

      {/* Route & Times */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={5}>
          <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{formatDateTime(trip.departureTime, 'hh:mm a')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{trip.route.source}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDateTime(trip.departureTime, 'dd MMM yyyy')}</Typography>
        </Grid>
        <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontSize: 10, mt: 0.5, fontWeight: 700 }}>{trip.route.duration}</Typography>
        </Grid>
        <Grid item xs={5} sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{formatDateTime(trip.arrivalTime, 'hh:mm a')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{trip.route.destination}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDateTime(trip.arrivalTime, 'dd MMM yyyy')}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2.5 }} />

      {/* Boarding/Dropping */}
      {boardingPoint && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.02em' }}>
            Boarding Point
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {boardingPoint}
          </Typography>
        </Box>
      )}
      {droppingPoint && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.02em' }}>
            Dropping Point
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {droppingPoint}
          </Typography>
        </Box>
      )}

      {/* Seats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.02em', mb: 0.5 }}>
          Selected Seats
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
          {seats.join(', ')} ({seats.length} Ticket{seats.length !== 1 && 's'})
        </Typography>
      </Box>

      {/* Pricing Breakdown */}
      <Typography variant="subtitle2" sx={{ fontWeight: 850, mb: 1.5, color: 'primary.main' }}>
        Fare Details
      </Typography>
      <Box sx={{ bgcolor: '#F8FAFC', p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>Base Fare</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>₹{base}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>Service Tax (5%)</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>₹{tax}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>Booking Fee</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>₹{fee}</Typography>
        </Box>
        
        {discountAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>
              Discount Applied {couponCode ? `(${couponCode})` : ''}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
              -₹{discountAmount}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.8 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'primary.main' }}>Total Amount</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 950, color: 'secondary.main' }}>
            ₹{total}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
