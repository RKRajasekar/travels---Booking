'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Grid,
  TextField,
  Autocomplete,
  Button,
  IconButton,
  Typography,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import { ALL_CITIES, getCanonicalCity } from '@/lib/cities';
import { format, addDays } from 'date-fns';

const TIME_SLOTS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'
];

const SERVICE_CHIPS = [
  { label: 'All Cabs', category: 'ALL' },
  { label: 'Sedan', category: 'SEDAN' },
  { label: 'SUV', category: 'SUV' },
  { label: 'XL (6+1)', category: 'XL' },
  { label: 'Mini', category: 'MINI' },
  { label: '⚡ Electric EV', category: 'ELECTRIC' },
  { label: '👑 Luxury', category: 'LUXURY' },
  { label: '✈️ Airport', category: 'AIRPORT' },
  { label: '🛣️ Outstation', category: 'OUTSTATION' },
];

export default function CabSearchForm({
  initialPickup = 'Chennai',
  initialDrop = 'Bangalore',
  initialDate,
  initialTime = '08:00 AM',
  initialPassengers = 2,
  initialCategory = 'ALL'
}) {
  const router = useRouter();

  const defaultDate = initialDate || format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const [pickup, setPickup] = useState(initialPickup);
  const [drop, setDrop] = useState(initialDrop);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(initialTime);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [locating, setLocating] = useState(false);
  const [swapSpin, setSwapSpin] = useState(false);
  const [formError, setFormError] = useState('');

  const cityOptions = ALL_CITIES.map((c) => c.name);

  // Swap pickup and drop
  const handleSwap = () => {
    setSwapSpin(true);
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
    setTimeout(() => setSwapSpin(false), 300);
  };

  // GPS Location Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        // Default to nearest detected capital / metropolitan area
        setPickup('Chennai');
      },
      () => {
        setLocating(false);
        setPickup('Chennai');
      },
      { timeout: 5000 }
    );
  };

  // Submit Search
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!pickup || !pickup.trim()) {
      setFormError('Please enter a pickup location');
      return;
    }
    if (!drop || !drop.trim()) {
      setFormError('Please enter a drop location');
      return;
    }
    if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
      setFormError('Pickup and drop locations cannot be the same city');
      return;
    }

    const query = new URLSearchParams({
      pickup: getCanonicalCity(pickup.trim()),
      drop: getCanonicalCity(drop.trim()),
      date,
      time,
      passengers: passengers.toString(),
      ...(selectedCategory && selectedCategory !== 'ALL' ? { category: selectedCategory } : {})
    });

    router.push(`/cab/search?${query.toString()}`);
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        p: { xs: 2.5, md: 3.5 },
        bgcolor: '#FFFFFF',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(217, 119, 6, 0.15)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Category Quick Selector Chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          overflowX: 'auto',
          pb: 0.5,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(217, 119, 6, 0.2)', borderRadius: 2 },
        }}
      >
        {SERVICE_CHIPS.map((chip) => (
          <Chip
            key={chip.category}
            label={chip.label}
            clickable
            onClick={() => setSelectedCategory(chip.category)}
            sx={{
              fontWeight: 750,
              fontSize: '0.82rem',
              px: 0.8,
              py: 2,
              borderRadius: 2.5,
              bgcolor:
                selectedCategory === chip.category
                  ? '#D97706'
                  : 'rgba(241, 245, 249, 0.9)',
              color: selectedCategory === chip.category ? '#FFFFFF' : '#334155',
              border:
                selectedCategory === chip.category
                  ? '1px solid #B45309'
                  : '1px solid #E2E8F0',
              boxShadow:
                selectedCategory === chip.category
                  ? '0 4px 12px rgba(217, 119, 6, 0.35)'
                  : 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor:
                  selectedCategory === chip.category
                    ? '#B45309'
                    : 'rgba(217, 119, 6, 0.08)',
              },
            }}
          />
        ))}
      </Box>

      {/* Main Search Form Form Controls */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          {/* Pickup Location */}
          <Grid item xs={12} md={3.2}>
            <Autocomplete
              freeSolo
              options={cityOptions}
              value={pickup}
              onChange={(_, newVal) => setPickup(newVal || '')}
              onInputChange={(_, newInputValue) => setPickup(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pickup Location"
                  placeholder="Enter city or area (e.g., Chennai)"
                  required
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: '#D97706' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Use Current GPS Location">
                          <IconButton
                            size="small"
                            onClick={handleDetectLocation}
                            disabled={locating}
                            sx={{ color: '#D97706' }}
                          >
                            {locating ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <MyLocationIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Swap Button */}
          <Grid
            item
            xs={12}
            md={0.6}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Tooltip title="Swap Pickup & Drop">
              <IconButton
                onClick={handleSwap}
                sx={{
                  bgcolor: 'rgba(217, 119, 6, 0.08)',
                  color: '#D97706',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  transform: swapSpin ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    bgcolor: '#D97706',
                    color: '#FFFFFF',
                  },
                }}
              >
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Drop Location */}
          <Grid item xs={12} md={3.2}>
            <Autocomplete
              freeSolo
              options={cityOptions}
              value={drop}
              onChange={(_, newVal) => setDrop(newVal || '')}
              onInputChange={(_, newInputValue) => setDrop(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Drop Location"
                  placeholder="Enter destination (e.g., Bangalore)"
                  required
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: '#059669' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Travel Date */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Travel Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon sx={{ color: '#D97706', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Pickup Time */}
          <Grid item xs={6} sm={3} md={1.5}>
            <FormControl fullWidth>
              <InputLabel id="pickup-time-label">Pickup Time</InputLabel>
              <Select
                labelId="pickup-time-label"
                value={time}
                label="Pickup Time"
                onChange={(e) => setTime(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <AccessTimeIcon sx={{ color: '#D97706', fontSize: 18 }} />
                  </InputAdornment>
                }
              >
                {TIME_SLOTS.map((slot) => (
                  <MenuItem key={slot} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Passengers */}
          <Grid item xs={6} sm={3} md={1.5}>
            <FormControl fullWidth>
              <InputLabel id="passengers-label">Passengers</InputLabel>
              <Select
                labelId="passengers-label"
                value={passengers}
                label="Passengers"
                onChange={(e) => setPassengers(Number(e.target.value))}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#D97706', fontSize: 18 }} />
                  </InputAdornment>
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} {num === 1 ? 'Person' : 'Persons'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Error message if any */}
        {formError && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mt: 2, fontWeight: 600, textAlign: 'center' }}
          >
            {formError}
          </Typography>
        )}

        {/* Search Action CTA */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SearchIcon sx={{ fontSize: '24px !important' }} />}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 50%, #92400E 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              px: { xs: 4, md: 6 },
              py: 1.4,
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 12px 30px rgba(217, 119, 6, 0.55)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            SEARCH CABS
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
