'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Grid,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  Box,
  InputAdornment,
  Tooltip,
  Typography,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { getRouteSuggestions } from '@/actions/search';
import { getCanonicalCity } from '@/lib/cities';
import { format, addDays } from 'date-fns';

export default function SearchForm({ onLocationDetected, initialSource = '', onSearch }) {
  const router = useRouter();
  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState('');
  const [sourceOptions, setSourceOptions] = useState([]);
  const [destOptions, setDestOptions] = useState([]);
  const [sourceInput, setSourceInput] = useState(initialSource);
  const [destInput, setDestInput] = useState('');
  const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd')); // default to tomorrow
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (initialSource) {
      setSource(initialSource);
      setSourceInput(initialSource);
    }
  }, [initialSource]);

  // Fetch suggestions
  useEffect(() => {
    if (sourceInput.length >= 2) {
      getRouteSuggestions(sourceInput).then((options) => {
        setSourceOptions(options);
      });
    } else {
      setSourceOptions([]);
    }
  }, [sourceInput]);

  useEffect(() => {
    if (destInput.length >= 2) {
      getRouteSuggestions(destInput).then((options) => {
        setDestOptions(options);
      });
    } else {
      setDestOptions([]);
    }
  }, [destInput]);

  const handleSwap = () => {
    const tempVal = source;
    const tempInput = sourceInput;
    setSource(destination);
    setSourceInput(destInput);
    setDestination(tempVal);
    setDestInput(tempInput);
    
    if (onLocationDetected && destination) {
      onLocationDetected(destination);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const cityCoords = {
          'Chennai': [13.0827, 80.2707],
          'Coimbatore': [11.0168, 76.9558],
          'Madurai': [9.9252, 78.1198],
          'Bangalore': [12.9716, 77.5946],
          'Salem': [11.6643, 78.1460],
        };

        let closestCity = 'Chennai';
        let minDistance = Infinity;

        for (const [city, coords] of Object.entries(cityCoords)) {
          const dist = Math.pow(lat - coords[0], 2) + Math.pow(lng - coords[1], 2);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        }

        setSource(closestCity);
        setSourceInput(closestCity);

        if (onLocationDetected) {
          onLocationDetected(closestCity);
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn("Geolocation permission error/denied:", err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination || !date) return;
    const canonicalSource = getCanonicalCity(source);
    const canonicalDest = getCanonicalCity(destination);
    if (onSearch) {
      onSearch({ source: canonicalSource, destination: canonicalDest, date });
    } else {
      router.push(`/search?source=${encodeURIComponent(canonicalSource)}&destination=${encodeURIComponent(canonicalDest)}&date=${date}`);
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5, md: 4 },
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        mt: { xs: 2.5, md: -7 },
        zIndex: 20,
        position: 'relative',
        borderRadius: { xs: 4, md: 5 },
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220, 38, 38, 0.12)',
        boxShadow: '0 20px 45px -15px rgba(59, 8, 19, 0.12), 0 0 0 1px rgba(220, 38, 38, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 24px 55px -15px rgba(59, 8, 19, 0.18), 0 0 0 1px rgba(220, 38, 38, 0.15)',
        },
      }}
    >
      {/* Decorative top accent line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #3B0813 25%, #DC2626 50%, #059669 75%, transparent 100%)',
          borderRadius: '3px 3px 0 0',
        }}
      />

      <form onSubmit={handleSearch}>
        <Grid container spacing={2.5} alignItems="center">
          {/* Source Autocomplete */}
          <Grid item xs={12} md={3.7}>
            <Autocomplete
              value={source}
              onChange={(e, newVal) => {
                const val = newVal || '';
                setSource(val);
                if (onLocationDetected) {
                  onLocationDetected(val);
                }
              }}
              inputValue={sourceInput}
              onInputChange={(e, newInputValue) => setSourceInput(newInputValue)}
              options={sourceOptions.length > 0 ? sourceOptions : ['Chennai', 'Coimbatore', 'Madurai', 'Bangalore', 'Salem', 'Trichy', 'Trivandrum', 'Kochi', 'Hyderabad', 'Tirupati']}
              noOptionsText="Type source city"
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="From"
                  variant="outlined"
                  placeholder="Departure city"
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#FAFBFD',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#FFFFFF', borderColor: '#DC2626' },
                      '&.Mui-focused': { bgcolor: '#FFFFFF', borderColor: '#DC2626' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#DC2626' },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <TripOriginIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        <InputAdornment position="end">
                          <Tooltip title="Use my current GPS location">
                            <IconButton
                              onClick={handleUseCurrentLocation}
                              edge="end"
                              disabled={gpsLoading}
                              size="small"
                              sx={{
                                color: '#059669',
                                bgcolor: 'rgba(5, 150, 105, 0.08)',
                                mr: 0.5,
                                '&:hover': {
                                  bgcolor: 'rgba(5, 150, 105, 0.18)',
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              <GpsFixedIcon sx={{ fontSize: 16, color: gpsLoading ? '#94A3B8' : '#059669' }} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Swap Button */}
          <Grid item xs={12} md={0.8} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Swap Cities">
              <IconButton
                onClick={handleSwap}
                sx={{
                  border: '1.5px solid #F1F5F9',
                  bgcolor: '#F8FAFC',
                  color: '#3B0813',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: 'rgba(220, 38, 38, 0.08)',
                    color: '#DC2626',
                    borderColor: '#DC2626',
                    transform: { xs: 'rotate(90deg) scale(1.1)', md: 'rotate(180deg)' },
                  },
                  transform: { xs: 'rotate(90deg)', md: 'none' },
                }}
              >
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Destination Autocomplete */}
          <Grid item xs={12} md={3.7}>
            <Autocomplete
              value={destination}
              onChange={(e, newVal) => setDestination(newVal || '')}
              inputValue={destInput}
              onInputChange={(e, newInputValue) => setDestInput(newInputValue)}
              options={destOptions.length > 0 ? destOptions : ['Chennai', 'Coimbatore', 'Madurai', 'Bangalore', 'Salem', 'Trichy', 'Trivandrum', 'Kochi', 'Hyderabad', 'Tirupati']}
              noOptionsText="Type destination city"
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="To"
                  variant="outlined"
                  placeholder="Destination city"
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: '#FAFBFD',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#FFFFFF', borderColor: '#059669' },
                      '&.Mui-focused': { bgcolor: '#FFFFFF', borderColor: '#059669' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#059669' },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ fontSize: 20, color: '#059669' }} />
                      </InputAdornment>
                    ),
                    endAdornment: params.InputProps.endAdornment,
                  }}
                />
              )}
            />
          </Grid>

          {/* Date Picker */}
          <Grid item xs={12} md={3.8}>
            <TextField
              label="Travel Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: todayStr }}
              fullWidth
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: '#FAFBFD',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#FFFFFF', borderColor: '#DC2626' },
                  '&.Mui-focused': { bgcolor: '#FFFFFF', borderColor: '#DC2626' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#DC2626' },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CalendarMonthIcon sx={{ color: '#DC2626', pointerEvents: 'none' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Search CTA Button */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SearchIcon sx={{ fontSize: '1.25rem !important' }} />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                height: 52,
                px: { xs: 5, md: 8 },
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '0.02em',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 40%, #059669 100%)',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.35)',
                color: '#FFFFFF',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B91C1C 0%, #781D2D 40%, #047857 100%)',
                  boxShadow: '0 8px 25px rgba(220, 38, 38, 0.5), 0 0 15px rgba(5, 150, 105, 0.3)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Search Buses
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
}

