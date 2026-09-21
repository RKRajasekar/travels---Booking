'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Box,
  Typography,
  Button,
  Divider,
  Collapse,
  Chip,
  Rating,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import WifiIcon from '@mui/icons-material/Wifi';
import PowerIcon from '@mui/icons-material/Power';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import LocalHotelIcon from '@mui/icons-material/LocalHotel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ShieldIcon from '@mui/icons-material/Shield';
import SingleBedIcon from '@mui/icons-material/SingleBed';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import VerifiedIcon from '@mui/icons-material/Verified';

import { formatDateTime } from '@/lib/utils';
import { getTripBookedSeats } from '@/actions/booking';

// Mock Boarding and Dropping points generator based on source/dest
const getPoints = (city, baseTime, offsetMinutes = 0) => {
  const dateObj = new Date(baseTime);
  const time1 = new Date(dateObj.getTime() + offsetMinutes * 60 * 1000);
  const time2 = new Date(dateObj.getTime() + (offsetMinutes + 20) * 60 * 1000);
  const time3 = new Date(dateObj.getTime() + (offsetMinutes + 45) * 60 * 1000);

  const formatT = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return [
    { name: `${city} Central Terminal`, address: `Platform 4, Main Bus Station, ${city}`, time: formatT(time1), landmark: 'Opposite Clock Tower' },
    { name: `${city} Bypass Junction`, address: `Near NH Highway Toll Plaza, ${city}`, time: formatT(time2), landmark: 'Under the flyover' },
    { name: `${city} Tech Park Entry`, address: `Gate 2, IT Corridor Avenue, ${city}`, time: formatT(time3), landmark: 'Near Metro Pillar 124' },
  ];
};

export default function BusCard({ trip, onBookSeats }) {
  const theme = useTheme();
  
  // Panels expansion states
  const [seatsExpanded, setSeatsExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [detailsTab, setDetailsTab] = useState('info'); // info, amenities, points, policy

  // Booking states
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loadingBooked, setLoadingBooked] = useState(false);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');
  const [deck, setDeck] = useState('lower'); // lower / upper

  const durationStr = trip.route.duration;
  const isAc = trip.bus.busType.includes('AC');
  const isSleeper = trip.bus.busType.includes('SLEEPER');

  const depTimeStr = formatDateTime(trip.departureTime, 'hh:mm a');
  const arrTimeStr = formatDateTime(trip.arrivalTime, 'hh:mm a');
  const depDateStr = formatDateTime(trip.departureTime, 'dd MMM');

  const ratingValue = trip.rating || 4.4;
  const reviewsCount = trip.reviewsCount || 148;
  const busClass = trip.busClass || 'Premium';
  const priceINR = Math.round(trip.price * 84);

  // Boarding / Dropping points data
  const boardingPointsList = useMemo(() => getPoints(trip.route.source, trip.departureTime, 0), [trip.route.source, trip.departureTime]);
  const droppingPointsList = useMemo(() => getPoints(trip.route.destination, trip.arrivalTime, 0), [trip.route.destination, trip.arrivalTime]);

  // Set default points
  useEffect(() => {
    if (boardingPointsList.length > 0) setBoardingPoint(boardingPointsList[0].name);
    if (droppingPointsList.length > 0) setDroppingPoint(droppingPointsList[0].name);
  }, [boardingPointsList, droppingPointsList]);

  // Fetch booked seats when seats panel expands
  useEffect(() => {
    if (seatsExpanded) {
      setLoadingBooked(true);
      getTripBookedSeats(trip.id)
        .then((res) => {
          if (res.success && res.bookedSeats) {
            setBookedSeats(res.bookedSeats);
          }
        })
        .catch((err) => console.error('Failed to load booked seats:', err))
        .finally(() => setLoadingBooked(false));
    }
  }, [seatsExpanded, trip.id]);

  // Handle seat clicks
  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 seats at a time.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const isLadiesSeat = (seatId) => {
    // Deterministic ladies seats for demo (e.g. seats ending with '3' or 'L3/U3')
    return seatId.endsWith('3') || seatId.includes('L3') || seatId.includes('U3');
  };

  const isWindowSeat = (seatId) => {
    // Seats with number 1 or 4 are window seats in seater layout
    return seatId.endsWith('1') || seatId.endsWith('4') || seatId.includes('W');
  };

  // Generate visual seating maps
  const renderSeatingLayout = () => {
    const totalSeatsCount = trip.bus.totalSeats || 40;
    
    if (isSleeper) {
      // 2+1 layout, sleepers have lower and upper decks
      const seatsPerDeck = Math.ceil(totalSeatsCount / 2);
      const rowsCount = Math.ceil(seatsPerDeck / 3);
      
      const renderDeckGrid = (deckPrefix) => {
        const rows = [];
        for (let r = 0; r < rowsCount; r++) {
          const rowSeats = [];
          rowSeats.push(`${deckPrefix}${r * 3 + 1}`); // Left window
          rowSeats.push(`${deckPrefix}${r * 3 + 2}`); // Left aisle
          rowSeats.push('aisle');
          rowSeats.push(`${deckPrefix}${r * 3 + 3}`); // Right window
          rows.push(rowSeats);
        }
        
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', p: 3, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #E2E8F0', maxWidth: '320px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #F1F5F9', pb: 1.5, mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>FRONT (Driver)</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>REAR</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
              {rows.map((row, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  {row.map((seat, seatIdx) => {
                    if (seat === 'aisle') {
                      return <Box key={seatIdx} sx={{ width: 30 }} />;
                    }
                    
                    const isBooked = bookedSeats.includes(seat);
                    const isSelected = selectedSeats.includes(seat);
                    const isLadies = isLadiesSeat(seat);
                    
                    let seatBg = '#ffffff';
                    let seatBorder = '1.5px solid #10B981';
                    let seatColor = '#10B981';
                    
                    if (isBooked) {
                      seatBg = '#F1F5F9';
                      seatBorder = '1.5px solid #CBD5E1';
                      seatColor = '#94A3B8';
                    } else if (isSelected) {
                      seatBg = '#2563EB';
                      seatBorder = '1.5px solid #1D4ED8';
                      seatColor = '#ffffff';
                    } else if (isLadies) {
                      seatBg = '#FAF5FF';
                      seatBorder = '1.5px solid #A855F7';
                      seatColor = '#A855F7';
                    }

                    return (
                      <Tooltip title={`Sleeper Berth ${seat} - ₹${priceINR}`} key={seat}>
                        <Box
                          onClick={() => handleSeatClick(seat)}
                          sx={{
                            width: 65,
                            height: 34,
                            bgcolor: seatBg,
                            border: seatBorder,
                            color: seatColor,
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 10px rgba(37, 99, 235, 0.2)' : 'none',
                            '&:hover': {
                              bgcolor: isBooked ? '#F1F5F9' : isSelected ? 'secondary.dark' : 'rgba(16, 185, 129, 0.08)',
                            }
                          }}
                        >
                          <SingleBedIcon sx={{ fontSize: 18, transform: 'rotate(-90deg)' }} />
                          <Typography sx={{ fontSize: 9, fontWeight: 800, ml: 0.5 }}>{seat}</Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        );
      };

      return (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button
              variant={deck === 'lower' ? 'contained' : 'outlined'}
              color="secondary"
              size="small"
              onClick={() => setDeck('lower')}
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            >
              Lower Deck
            </Button>
            <Button
              variant={deck === 'upper' ? 'contained' : 'outlined'}
              color="secondary"
              size="small"
              onClick={() => setDeck('upper')}
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            >
              Upper Deck
            </Button>
          </Box>
          {deck === 'lower' ? renderDeckGrid('L') : renderDeckGrid('U')}
        </Box>
      );
    } else {
      // Seater: 2+2 layout
      const rowsCount = Math.ceil(totalSeatsCount / 4);
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      
      const gridRows = [];
      for (let r = 0; r < rowsCount; r++) {
        const rowLetter = rows[r] || `R${r}`;
        const rowSeats = [];
        rowSeats.push(`${rowLetter}1`); // Left window
        rowSeats.push(`${rowLetter}2`); // Left aisle
        rowSeats.push('aisle');
        rowSeats.push(`${rowLetter}3`); // Right aisle
        rowSeats.push(`${rowLetter}4`); // Right window
        gridRows.push(rowSeats);
      }

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', p: 3, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #E2E8F0', maxWidth: '340px', mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #F1F5F9', pb: 1.5, mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>FRONT (Driver)</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>REAR</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {gridRows.map((row, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {row.map((seat, seatIdx) => {
                  if (seat === 'aisle') {
                    return <Box key={seatIdx} sx={{ width: 20 }} />;
                  }
                  
                  const isBooked = bookedSeats.includes(seat);
                  const isSelected = selectedSeats.includes(seat);
                  const isLadies = isLadiesSeat(seat);
                  const isWindow = isWindowSeat(seat);
                  
                  let seatBg = '#ffffff';
                  let seatBorder = '1.5px solid #10B981';
                  let seatColor = '#10B981';
                  
                  if (isBooked) {
                    seatBg = '#F1F5F9';
                    seatBorder = '1.5px solid #CBD5E1';
                    seatColor = '#94A3B8';
                  } else if (isSelected) {
                    seatBg = '#2563EB';
                    seatBorder = '1.5px solid #1D4ED8';
                    seatColor = '#ffffff';
                  } else if (isLadies) {
                    seatBg = '#FAF5FF';
                    seatBorder = '1.5px solid #A855F7';
                    seatColor = '#A855F7';
                  }

                  return (
                    <Tooltip title={`Seat ${seat} ${isWindow ? '(Window)' : ''} - ₹${priceINR}`} key={seat}>
                      <Box
                        onClick={() => handleSeatClick(seat)}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: seatBg,
                          border: seatBorder,
                          color: seatColor,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 10px rgba(37, 99, 235, 0.2)' : 'none',
                          position: 'relative',
                          '&:hover': {
                            bgcolor: isBooked ? '#F1F5F9' : isSelected ? 'secondary.dark' : 'rgba(16, 185, 129, 0.08)',
                          }
                        }}
                      >
                        <EventSeatIcon sx={{ fontSize: 20 }} />
                        <Typography sx={{ fontSize: 8, fontWeight: 950, position: 'absolute', bottom: 3 }}>{seat}</Typography>
                        {isWindow && !isBooked && !isSelected && (
                          <Box sx={{ position: 'absolute', top: 3, right: 3, width: 4, height: 4, borderRadius: '50%', bgcolor: '#0F172A' }} />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      );
    }
  };

  const handleContinueBooking = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to continue.');
      return;
    }
    if (!boardingPoint || !droppingPoint) {
      alert('Please select both boarding and dropping points.');
      return;
    }
    
    // Pass execution callback
    onBookSeats(trip.id, selectedSeats, boardingPoint, droppingPoint);
  };

  return (
    <Card
      sx={{
        mb: 3.5,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        borderRadius: 3.5,
        '&:hover': {
          borderColor: 'secondary.light',
          boxShadow: '0 12px 24px -8px rgba(15, 23, 42, 0.06)'
        }
      }}
    >
      <Box sx={{ p: 3.5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3.5 }}>
          
          {/* Operator and Bus Type details */}
          <Box sx={{ display: 'flex', gap: 2.5, flex: 1.2 }}>
            {trip.bus?.image || trip.image ? (
              <Box
                component="img"
                src={trip.bus.image || trip.image}
                alt={trip.bus.operatorName}
                loading="lazy"
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2.5,
                  objectFit: 'cover',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  flexShrink: 0
                }}
              />
            ) : (
              <Box sx={{ bgcolor: 'rgba(15, 23, 42, 0.04)', color: 'primary.main', p: 1.8, borderRadius: 2, height: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DirectionsBusIcon sx={{ fontSize: 32 }} />
              </Box>
            )}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.15rem', lineHeight: 1.2 }}>
                  {trip.bus.operatorName}
                </Typography>
                <Tooltip title="Verified Operator">
                  <VerifiedIcon color="secondary" sx={{ fontSize: 17 }} />
                </Tooltip>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 600 }}>
                {busClass} • {trip.bus.modelName || trip.bus.busType.replace('_', ' ')}
              </Typography>
              
              {/* Rating and Reviews */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={ratingValue} precision={0.1} readOnly size="small" sx={{ color: 'warning.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
                  {ratingValue} ★
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 550 }}>
                  ({reviewsCount} reviews)
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Timings and stops */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1.8, gap: 2 }}>
            {/* Departure */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.2rem' }}>
                {depTimeStr}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.88rem' }}>
                {trip.route.source}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 550 }}>
                {depDateStr}
              </Typography>
            </Box>

            {/* Journey Line */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '11px', fontWeight: 700 }}>
                <AccessTimeIcon sx={{ fontSize: 13 }} /> {durationStr}
              </Typography>
              <Box sx={{ width: '100%', height: '2px', bgcolor: '#E2E8F0', position: 'relative', my: 1 }}>
                <Box sx={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main', top: -2, left: 0 }} />
                <Box sx={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main', top: -2, right: 0 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, fontWeight: 550 }}>
                via {trip.route.stops.join(', ')}
              </Typography>
            </Box>

            {/* Arrival */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.2rem' }}>
                {arrTimeStr}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.88rem' }}>
                {trip.route.destination}
              </Typography>
            </Box>
          </Box>

          {/* Ticket Cost and Action CTA */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'center', md: 'flex-end' }, justifyContent: 'space-between', gap: 2, width: { xs: '100%', md: '190px' }, borderLeft: { md: '1px solid #E2E8F0' }, pl: { md: 3.5 } }}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h5" sx={{ fontWeight: 950, color: 'secondary.main', letterSpacing: '-0.02em', fontSize: '1.45rem' }}>
                ₹{priceINR}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontWeight: 600 }}>
                <AirlineSeatReclineNormalIcon sx={{ fontSize: 15 }} /> {trip.availableSeats} seats left
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, width: '100%' }}>
              <Button
                variant={seatsExpanded ? 'outlined' : 'contained'}
                color="secondary"
                fullWidth
                onClick={() => {
                  setSeatsExpanded(!seatsExpanded);
                  setDetailsExpanded(false);
                }}
                sx={{ fontWeight: 800, py: 1.1, fontSize: '0.88rem', borderRadius: 2 }}
              >
                {seatsExpanded ? 'Hide Seats' : 'View Seats'}
              </Button>
              
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setDetailsExpanded(!detailsExpanded);
                  setSeatsExpanded(false);
                }}
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem' }}
              >
                {detailsExpanded ? 'Hide Details' : 'View Details'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Amenities Bar */}
        <Box sx={{ display: 'flex', gap: 3, mt: 3, pt: 2, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
          {[
            { icon: <AcUnitIcon sx={{ fontSize: 16 }} />, label: 'AC' },
            { icon: <WifiIcon sx={{ fontSize: 16 }} />, label: 'Free Wifi' },
            { icon: <PowerIcon sx={{ fontSize: 16 }} />, label: 'Power Sockets' },
            { icon: <LocalHotelIcon sx={{ fontSize: 16 }} />, label: 'Pillow & Blanket' },
            { icon: <LocalDrinkIcon sx={{ fontSize: 16 }} />, label: 'Water Bottle' },
            { icon: <LightbulbIcon sx={{ fontSize: 16 }} />, label: 'Reading Light' },
          ].map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
              {item.icon}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '11.5px' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Collapse panel 1: Bus Details */}
      <Collapse in={detailsExpanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 4, bgcolor: '#F8FAFC' }}>
          {/* Sub Navigation tabs */}
          <Box sx={{ display: 'flex', gap: 2, borderBottom: '1px solid #E2E8F0', pb: 1.5, mb: 3, flexWrap: 'wrap' }}>
            {[
              { id: 'info', label: 'Bus Information' },
              { id: 'amenities', label: 'Amenities Available' },
              { id: 'points', label: 'Boarding/Dropping Points' },
              { id: 'policy', label: 'Cancellation Policy' },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="small"
                variant={detailsTab === tab.id ? 'contained' : 'text'}
                color="secondary"
                onClick={() => setDetailsTab(tab.id)}
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>

          {/* Details Tabs contents */}
          {detailsTab === 'info' && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>Journey Specifics</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>• Bus Model: {trip.bus?.modelName || 'Volvo 9600 Multi-Axle'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>• Operator Class: {busClass}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>• Total Sleeper Berths / Seats: {trip.bus?.totalSeats || 30}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>• Dynamic Live Tracking: Supported</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>Travel Guidelines</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>• Mandatory: Carry printed copy of QR e-ticket.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>• Reporting Time: Report 15 minutes before scheduled boarding.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>• Baggage Limit: Maximum 15kg per passenger.</Typography>
              </Grid>
            </Grid>
          )}

          {detailsTab === 'amenities' && (
            <Grid container spacing={2}>
              {[
                { name: 'AC / Climate Control', desc: 'Auto temperature regulation for supreme comfort' },
                { name: 'High-Speed Wi-Fi', desc: 'Complimentary internet bandwidth during journey' },
                { name: 'Individual USB Plugs', desc: 'Dedicated charging portals at each seat' },
                { name: 'Premium Blanket & Pillow', desc: 'Freshly laundered bedding supplied on-board' },
                { name: 'Mineral Water Bottle', desc: 'Cold water bottle provided free of charge' },
                { name: 'Individual Reading Lights', desc: 'Directional focused LED lights' },
              ].map((am, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Card sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#ffffff' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main', mb: 0.5 }}>{am.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{am.desc}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {detailsTab === 'points' && (
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', borderBottom: '2px solid #E2E8F0', pb: 1 }}>
                  Boarding Point Options (Departure)
                </Typography>
                {boardingPointsList.map((pt, idx) => (
                  <Box key={idx} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{pt.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 850, color: 'secondary.main' }}>{pt.time}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">{pt.address}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Landmark: {pt.landmark}</Typography>
                  </Box>
                ))}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', borderBottom: '2px solid #E2E8F0', pb: 1 }}>
                  Dropping Point Options (Arrival)
                </Typography>
                {droppingPointsList.map((pt, idx) => (
                  <Box key={idx} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{pt.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 850, color: 'secondary.main' }}>{pt.time}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">{pt.address}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Landmark: {pt.landmark}</Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
          )}

          {detailsTab === 'policy' && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>Standard Booking Cancellation Regulations</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { time: 'More than 24 hours before departure', refund: '90% refund' },
                  { time: 'Between 12 to 24 hours before departure', refund: '50% refund' },
                  { time: 'Between 2 to 12 hours before departure', refund: '25% refund' },
                  { time: 'Less than 2 hours / No Show', refund: 'No refund' },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', bgcolor: '#ffffff' }}>
                      <Typography variant="caption" sx={{ fontWeight: 650 }}>{item.time}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>{item.refund}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                *Note: Cancellation policies are set directly by the transport operator. Processing fees of ₹50 per ticket will be deducted from all cancellations. Refunds are credited within 3-5 working days.
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Collapse panel 2: Seat Picker & Selection Panel */}
      <Collapse in={seatsExpanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 4, bgcolor: '#F8FAFC' }}>
          {loadingBooked ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1.5 }}>
              <CircularProgress size={30} color="secondary" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Querying live seat availability...
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4.5}>
              {/* Left Column: Seating grid */}
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, mb: 3, color: 'primary.main', textAlign: 'center' }}>
                  Select Seats
                </Typography>
                {renderSeatingLayout()}
                
                {/* Seating legend */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mt: 4, flexWrap: 'wrap' }}>
                  {[
                    { color: '#10B981', label: 'Available' },
                    { color: '#2563EB', label: 'Selected' },
                    { color: '#E2E8F0', label: 'Booked', border: '1px solid #CBD5E1' },
                    { color: '#FAF5FF', label: 'Ladies Reserved', border: '1.5px solid #A855F7' },
                  ].map((legend, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 14, height: 14, bgcolor: legend.color, border: legend.border || 'none', borderRadius: '3px' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        {legend.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Right Column: Reservation form and selectors */}
              <Grid item xs={12} md={5} sx={{ borderLeft: { md: '1px solid #E2E8F0' }, pl: { md: 4.5 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, mb: 3.5, color: 'primary.main' }}>
                  Reservation Summary
                </Typography>

                {/* Point Selectors */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="boarding-select-label">Boarding Point</InputLabel>
                    <Select
                      labelId="boarding-select-label"
                      value={boardingPoint}
                      label="Boarding Point"
                      onChange={(e) => setBoardingPoint(e.target.value)}
                    >
                      {boardingPointsList.map((pt, idx) => (
                        <MenuItem key={idx} value={pt.name}>
                          {pt.name} ({pt.time})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="dropping-select-label">Dropping Point</InputLabel>
                    <Select
                      labelId="dropping-select-label"
                      value={droppingPoint}
                      label="Dropping Point"
                      onChange={(e) => setDroppingPoint(e.target.value)}
                    >
                      {droppingPointsList.map((pt, idx) => (
                        <MenuItem key={idx} value={pt.name}>
                          {pt.name} ({pt.time})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Selected seats list */}
                {selectedSeats.length > 0 ? (
                  <Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                      {selectedSeats.map((seat) => (
                        <Box key={seat} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.8, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            Seat {seat} ({isSleeper ? 'Sleeper Berth' : 'Seater'})
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 850, color: 'secondary.main' }}>
                            ₹{priceINR}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ mb: 2.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>Subtotal</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950, color: 'secondary.main' }}>
                        ₹{selectedSeats.length * priceINR}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      onClick={handleContinueBooking}
                      sx={{ fontWeight: 700, py: 1.5, fontSize: '0.92rem', borderRadius: 2 }}
                    >
                      Continue to Passenger Details
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlignment: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <AirlineSeatReclineNormalIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No seats selected. Please click on available seats from the seating layout on the left.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}
