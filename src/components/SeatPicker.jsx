'use client';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, Typography, Paper, Tooltip, Chip, Alert, CircularProgress, Divider } from '@mui/material';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import SingleBedIcon from '@mui/icons-material/SingleBed';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getTripBookedSeats } from '@/actions/booking';

export default function SeatPicker({ trip, onProceed }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deck, setDeck] = useState('lower'); // 'lower' or 'upper' for sleepers

  const isSleeper = trip.bus.busType.includes('SLEEPER');
  const totalSeats = trip.bus.totalSeats;

  // Load booked seats
  useEffect(() => {
    getTripBookedSeats(trip.id)
      .then((res) => {
        if (res.success && res.bookedSeats) {
          setBookedSeats(res.bookedSeats);
        } else {
          setError(res.error || 'Failed to load live seat availability.');
        }
      })
      .catch(() => setError('Error loading seat status.'))
      .finally(() => setLoading(false));
  }, [trip.id]);

  // Generate seat names
  const generateSeats = () => {
    if (isSleeper) {
      const seatsPerDeck = Math.ceil(totalSeats / 2);
      const lower = Array.from({ length: seatsPerDeck }, (_, i) => `L${i + 1}`);
      const upper = Array.from({ length: totalSeats - seatsPerDeck }, (_, i) => `U${i + 1}`);
      return { lower, upper };
    } else {
      const seaterSeats = [];
      const rowsCount = Math.ceil(totalSeats / 4);
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      for (let r = 0; r < rowsCount; r++) {
        const rowLetter = rows[r] || `R${r}`;
        seaterSeats.push(`${rowLetter}1`);
        seaterSeats.push(`${rowLetter}2`);
        seaterSeats.push(`${rowLetter}3`);
        seaterSeats.push(`${rowLetter}4`);
      }
      return { seater: seaterSeats.slice(0, totalSeats) };
    }
  };

  const seatData = generateSeats();

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 seats.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const isFemaleReserved = (seatId) => {
    // Standard rule: seat rows ending with 3, or L3/U3 are ladies reserved
    return seatId.endsWith('3') || seatId === 'L3' || seatId === 'U3';
  };

  const getSeatStyles = (seatId) => {
    const isBooked = bookedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);
    const isLadies = isFemaleReserved(seatId);

    if (isBooked) {
      return {
        bgcolor: '#E2E8F0', // slate 200
        border: '1px solid #CBD5E1',
        color: '#94A3B8',
        cursor: 'not-allowed',
      };
    }
    if (isSelected) {
      return {
        bgcolor: 'secondary.main',
        border: '1px solid #1D4ED8',
        color: '#FFFFFF',
        '&:hover': { bgcolor: 'secondary.dark' },
      };
    }
    if (isLadies) {
      return {
        bgcolor: '#FCE7F3', // pink 100
        border: '1px solid #F472B6',
        color: '#DB2777',
        '&:hover': { bgcolor: '#FBCFE8' },
      };
    }
    return {
      bgcolor: '#FFFFFF',
      border: '1px solid #CBD5E1',
      color: '#0F172A',
      '&:hover': { bgcolor: '#F8FAFC', borderColor: 'secondary.main' },
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // Seat Price details calculations
  const priceINR = Math.round(trip.price * 84); // INR base
  const totalBaseFare = priceINR * selectedSeats.length;
  const gstTax = Math.round(totalBaseFare * 0.05); // 5% GST
  const bookingFee = selectedSeats.length * 20; // 20 INR per seat platform fee
  const totalAmount = totalBaseFare + gstTax + bookingFee;

  return (
    <Grid container spacing={4}>
      {/* Visual Bus Interior */}
      <Grid item xs={12} md={7.5}>
        <Paper variant="outlined" sx={{ p: 4, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4, position: 'relative' }}>
          
          {/* Deck Toggles (for Sleeper Bus) */}
          {isSleeper && (
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, justifyContent: 'center' }}>
              <Button
                variant={deck === 'lower' ? 'contained' : 'outlined'}
                onClick={() => setDeck('lower')}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              >
                Lower Deck
              </Button>
              <Button
                variant={deck === 'upper' ? 'contained' : 'outlined'}
                onClick={() => setDeck('upper')}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              >
                Upper Deck
              </Button>
            </Box>
          )}

          {/* Seat Grid Legends */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3.5, justifyContent: 'center' }}>
            {[
              { color: '#FFFFFF', border: '1px solid #CBD5E1', text: 'Available' },
              { color: '#FCE7F3', border: '1px solid #F472B6', text: 'Ladies Reserved' },
              { color: '#2563EB', border: '1px solid #1D4ED8', text: 'Selected' },
              { color: '#E2E8F0', border: '1px solid #CBD5E1', text: 'Booked' },
            ].map((legend, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: legend.color, border: legend.border, borderRadius: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{legend.text}</Typography>
              </Box>
            ))}
          </Box>

          {/* Top-Down Bus Interior Frame */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 420,
              mx: 'auto',
              border: '3px solid #64748B',
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              bgcolor: '#FFFFFF',
              pb: 3,
              pt: 2.5,
              px: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Front Dashboard Shield */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '2px solid #E2E8F0', mb: 3.5 }}>
              <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MeetingRoomIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Entry Door</Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', bgcolor: '#F1F5F9', px: 1.5, py: 0.5, borderRadius: 1 }}>
                ⎈ Driver Area
              </Typography>
            </Box>

            {error && <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 3 }}>{error}</Alert>}

            {/* Grid Layouts */}
            {isSleeper ? (
              <Grid container spacing={1.5} justifyContent="center">
                {(deck === 'lower' ? seatData.lower : seatData.upper)?.map((seatId) => (
                  <Grid item key={seatId} xs={4}>
                    <Tooltip title={`${deck === 'lower' ? 'Lower' : 'Upper'} Berth ${seatId}`} arrow>
                      <Button
                        fullWidth
                        onClick={() => handleSeatClick(seatId)}
                        sx={{
                          height: 80,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          p: 0.5,
                          borderRadius: 1,
                          fontSize: '11px',
                          fontWeight: 800,
                          ...getSeatStyles(seatId),
                        }}
                      >
                        <SingleBedIcon sx={{ fontSize: 24, mb: 0.5 }} />
                        {seatId}
                      </Button>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            ) : (
              /* Seater Rows Grid */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Array.from({ length: Math.ceil((seatData.seater?.length || 0) / 4) }).map((_, rowIndex) => {
                  const seatIndexStart = rowIndex * 4;
                  const rowSeats = seatData.seater?.slice(seatIndexStart, seatIndexStart + 4) || [];
                  
                  return (
                    <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Left 2 Seats */}
                      <Box sx={{ display: 'flex', gap: 1.5, flex: 1, justifyContent: 'flex-start' }}>
                        {rowSeats.slice(0, 2).map((seatId) => (
                          <Button
                            key={seatId}
                            onClick={() => handleSeatClick(seatId)}
                            sx={{
                              width: 48,
                              height: 48,
                              minWidth: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              p: 0.5,
                              borderRadius: 1,
                              fontSize: '10px',
                              fontWeight: 800,
                              ...getSeatStyles(seatId),
                            }}
                          >
                            <AirlineSeatReclineNormalIcon sx={{ fontSize: 18 }} />
                            {seatId}
                          </Button>
                        ))}
                      </Box>

                      {/* Walkway Aisle */}
                      <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ borderLeft: '2px dashed #E2E8F0', height: 48 }} />
                      </Box>

                      {/* Right 2 Seats */}
                      <Box sx={{ display: 'flex', gap: 1.5, flex: 1, justifyContent: 'flex-end' }}>
                        {rowSeats.slice(2, 4).map((seatId) => (
                          <Button
                            key={seatId}
                            onClick={() => handleSeatClick(seatId)}
                            sx={{
                              width: 48,
                              height: 48,
                              minWidth: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              p: 0.5,
                              borderRadius: 1,
                              fontSize: '10px',
                              fontWeight: 800,
                              ...getSeatStyles(seatId),
                            }}
                          >
                            <AirlineSeatReclineNormalIcon sx={{ fontSize: 18 }} />
                            {seatId}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Back Row / Emergency Exit Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'center', borderTop: '2px solid #E2E8F0', pt: 2, mt: 3.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                [ Emergency Exit ]
              </Typography>
            </Box>

          </Box>
        </Paper>
      </Grid>

      {/* Pricing Summary Side Panel */}
      <Grid item xs={12} md={4.5}>
        <Paper variant="outlined" sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: 'primary.main' }}>
              Booking Breakdowns
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Journey Route</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {trip.route.source} → {trip.route.destination}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Seat Base Fare</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{priceINR} / seat</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Operator</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{trip.bus.operatorName}</Typography>
              </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

            {/* Selected Seats display list */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Selected Seat(s)
              </Typography>
              {selectedSeats.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedSeats.map((seatId) => (
                    <Chip
                      key={seatId}
                      label={seatId}
                      onDelete={() => handleSeatClick(seatId)}
                      color="secondary"
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No seats selected yet. Please click available slots on the bus map.
                </Typography>
              )}
            </Box>

            {/* Fare Breakdown Calculation panel */}
            {selectedSeats.length > 0 && (
              <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Base Fare</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 750 }}>₹{totalBaseFare}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Service GST (5%)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 750 }}>₹{gstTax}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Booking platform fee</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 750 }}>₹{bookingFee}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>Total Amount</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'secondary.main' }}>
                    ₹{totalAmount}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            disabled={selectedSeats.length === 0}
            onClick={() => onProceed(selectedSeats)}
            sx={{ mt: 4, py: 1.5, fontWeight: 700, letterSpacing: '0.02em' }}
          >
            Confirm & Book {selectedSeats.length > 0 ? `(${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''})` : ''}
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
