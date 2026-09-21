'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Alert,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

import { searchTrips } from '@/actions/search';
import BusCard from '@/components/BusCard';
import { BusListSkeleton } from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';

// Helper to enrich database trips with mockup specifications and template metadata
const enrichTripData = (trip, index) => {
  const opName = trip.bus?.operatorName || 'Express Coach';
  const modelName = trip.bus?.modelName || (trip.bus?.busType?.includes('SLEEPER') ? 'Volvo 9600 Multi-Axle AC Sleeper (2+1)' : 'Executive AC Seater');
  const isAc = trip.bus?.busType?.includes('AC') || modelName.toLowerCase().includes('ac');
  const isSleeper = trip.bus?.busType?.includes('SLEEPER') || modelName.toLowerCase().includes('sleeper');
  const isVolvo = trip.bus?.isVolvo || modelName.toLowerCase().includes('volvo');
  const isMultiAxle = trip.bus?.isMultiAxle || modelName.toLowerCase().includes('multi-axle') || modelName.toLowerCase().includes('9600') || modelName.toLowerCase().includes('b11r');

  let busClass = trip.bus?.busClass;
  if (!busClass) {
    if (isVolvo || modelName.toLowerCase().includes('luxury') || modelName.toLowerCase().includes('dream class') || modelName.toLowerCase().includes('mercedes')) {
      busClass = 'Luxury';
    } else if (isAc || isSleeper) {
      busClass = 'Premium';
    } else {
      busClass = 'Economy';
    }
  }

  let rating = trip.bus?.rating || (4.3 + ((index * 7) % 6) / 10);
  let reviewsCount = trip.bus?.reviewsCount || (800 + ((index * 137) % 2400));

  const image = trip.bus?.image || (
    isVolvo ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80' :
    isSleeper ? 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80' :
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80'
  );

  const am = trip.bus?.amenities || {
    wifi: isAc && (isVolvo || busClass === 'Luxury' || busClass === 'Premium'),
    chargingPoint: isAc || isSleeper,
    waterBottle: isAc || busClass === 'Luxury',
    blanket: isSleeper,
    readingLight: true,
    liveTracking: trip.isLive || index % 2 === 0,
    emergencySupport: true,
    cctv: isVolvo || busClass === 'Luxury',
    snacks: busClass === 'Luxury'
  };

  return {
    ...trip,
    rating,
    reviewsCount,
    busClass,
    amenities: am,
    bus: {
      ...trip.bus,
      operatorName: opName,
      modelName,
      busClass,
      image,
      isVolvo,
      isMultiAxle,
      amenities: am,
    }
  };
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const source = searchParams.get('source') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Sorting State
  const [sortBy, setSortBy] = useState('recommended'); // recommended, cheapest, expensive, earliest, earliestArrival, highestRated, fastest

  // Mobile Filter Dialog state
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter States
  const [busTypes, setBusTypes] = useState({
    ac: false,
    nonAc: false,
    seater: false,
    sleeper: false,
    semiSleeper: false,
    acSleeper: false,
    volvo: false,
    multiAxle: false,
  });

  const [busClasses, setBusClasses] = useState({
    economy: false,
    premium: false,
    luxury: false,
  });

  const [departureTimes, setDepartureTimes] = useState({
    before6am: false,
    range6amTo12pm: false,
    range12pmTo6pm: false,
    after6pm: false,
  });

  const [arrivalTimes, setArrivalTimes] = useState({
    before6am: false,
    range6amTo12pm: false,
    range12pmTo6pm: false,
    after6pm: false,
  });

  const [priceTiers, setPriceTiers] = useState({
    under500: false,
    range500to800: false,
    range800to1200: false,
    range1200to1600: false,
    above1600: false,
  });

  const [priceRange, setPriceRange] = useState([0, 2200]);

  const [ratings, setRatings] = useState({
    rating4plus: false,
    rating3plus: false,
  });

  const [amenities, setAmenities] = useState({
    wifi: false,
    chargingPoint: false,
    waterBottle: false,
    blanket: false,
    readingLight: false,
    liveTracking: false,
    emergencySupport: false,
  });

  const [seatAvailability, setSeatAvailability] = useState({
    availableSeatsOnly: false,
    windowSeatsAvailable: false,
    lowerBerthAvailable: false,
    upperBerthAvailable: false,
  });

  // Load Trips matching query
  useEffect(() => {
    if (!source || !destination || !date) {
      setError('Please provide valid search query parameters.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    searchTrips({ source, destination, date })
      .then((res) => {
        if (res.success && res.data) {
          setTrips(res.data);
        } else {
          setError(res.error || 'Failed to retrieve journeys.');
        }
      })
      .catch(() => setError('An unexpected error occurred while loading trips.'))
      .finally(() => setLoading(false));
  }, [source, destination, date]);

  // Navigate to checkout
  const handleBookSeats = (tripId, seats, boarding, dropping) => {
    router.push(`/checkout?tripId=${tripId}&seats=${seats.join(',')}&passengers=${seats.length}&boarding=${encodeURIComponent(boarding)}&dropping=${encodeURIComponent(dropping)}`);
  };

  // Reset all filters
  const handleClearAllFilters = () => {
    setBusTypes({ ac: false, nonAc: false, seater: false, sleeper: false, semiSleeper: false, acSleeper: false, volvo: false, multiAxle: false });
    setBusClasses({ economy: false, premium: false, luxury: false });
    setDepartureTimes({ before6am: false, range6amTo12pm: false, range12pmTo6pm: false, after6pm: false });
    setArrivalTimes({ before6am: false, range6amTo12pm: false, range12pmTo6pm: false, after6pm: false });
    setPriceTiers({ under500: false, range500to800: false, range800to1200: false, range1200to1600: false, above1600: false });
    setPriceRange([0, 2200]);
    setRatings({ rating4plus: false, rating3plus: false });
    setAmenities({ wifi: false, chargingPoint: false, waterBottle: false, blanket: false, readingLight: false, liveTracking: false, emergencySupport: false });
    setSeatAvailability({ availableSeatsOnly: false, windowSeatsAvailable: false, lowerBerthAvailable: false, upperBerthAvailable: false });
  };

  // 1. Memoize enriched trips to avoid re-enriching on every render/checkbox change
  const enrichedTrips = useMemo(() => {
    return trips.map((t, idx) => enrichTripData(t, idx));
  }, [trips]);

  // 2. Memoize filtered trips
  const filteredTrips = useMemo(() => {
    return enrichedTrips.filter((trip) => {
      // 1. Bus Type filters
      const hasBusTypeActive = Object.values(busTypes).some(Boolean);
      if (hasBusTypeActive) {
        let typeMatch = false;
        const tAc = trip.bus.busType?.includes('AC') || trip.bus.modelName?.toLowerCase().includes('ac');
        const tSleeper = trip.bus.busType?.includes('SLEEPER') || trip.bus.modelName?.toLowerCase().includes('sleeper');
        const tSeater = trip.bus.busType?.includes('SEATER') || trip.bus.modelName?.toLowerCase().includes('seater');
        const tVolvo = trip.bus.isVolvo || trip.bus.modelName?.toLowerCase().includes('volvo') || (trip.bus.busType === 'AC_SLEEPER' && trip.busClass === 'Luxury');
        const tMultiAxle = trip.bus.isMultiAxle || trip.bus.modelName?.toLowerCase().includes('multi-axle') || trip.bus.modelName?.toLowerCase().includes('9600') || trip.bus.modelName?.toLowerCase().includes('b11r');
        const tSemi = trip.bus.modelName?.toLowerCase().includes('semi') || (tSeater && tAc);
        
        if (busTypes.ac && tAc) typeMatch = true;
        if (busTypes.nonAc && !tAc) typeMatch = true;
        if (busTypes.sleeper && tSleeper) typeMatch = true;
        if (busTypes.seater && tSeater) typeMatch = true;
        if (busTypes.semiSleeper && tSemi) typeMatch = true;
        if (busTypes.acSleeper && tAc && tSleeper) typeMatch = true;
        if (busTypes.volvo && tVolvo) typeMatch = true;
        if (busTypes.multiAxle && tMultiAxle) typeMatch = true;
        
        if (!typeMatch) return false;
      }

      // 2. Bus Class filters
      const hasBusClassActive = Object.values(busClasses).some(Boolean);
      if (hasBusClassActive) {
        let classMatch = false;
        if (busClasses.economy && trip.busClass === 'Economy') classMatch = true;
        if (busClasses.premium && trip.busClass === 'Premium') classMatch = true;
        if (busClasses.luxury && trip.busClass === 'Luxury') classMatch = true;
        if (!classMatch) return false;
      }

      const depHour = new Date(trip.departureTime).getHours();
      const arrHour = new Date(trip.arrivalTime).getHours();

      // 3. Departure Time filters
      const hasDepActive = Object.values(departureTimes).some(Boolean);
      if (hasDepActive) {
        let depMatch = false;
        if (departureTimes.before6am && depHour < 6) depMatch = true;
        if (departureTimes.range6amTo12pm && depHour >= 6 && depHour < 12) depMatch = true;
        if (departureTimes.range12pmTo6pm && depHour >= 12 && depHour < 18) depMatch = true;
        if (departureTimes.after6pm && depHour >= 18) depMatch = true;
        if (!depMatch) return false;
      }

      // 4. Arrival Time filters
      const hasArrActive = Object.values(arrivalTimes).some(Boolean);
      if (hasArrActive) {
        let arrMatch = false;
        if (arrivalTimes.before6am && arrHour < 6) arrMatch = true;
        if (arrivalTimes.range6amTo12pm && arrHour >= 6 && arrHour < 12) arrMatch = true;
        if (arrivalTimes.range12pmTo6pm && arrHour >= 12 && arrHour < 18) arrMatch = true;
        if (arrivalTimes.after6pm && arrHour >= 18) arrMatch = true;
        if (!arrMatch) return false;
      }

      const priceINR = Math.round(trip.price * 84);

      // 5. Price Slider check
      if (priceINR < priceRange[0] || priceINR > priceRange[1]) {
        return false;
      }

      // 5b. Price Tier checks
      const hasPriceTierActive = Object.values(priceTiers).some(Boolean);
      if (hasPriceTierActive) {
        let priceMatch = false;
        if (priceTiers.under500 && priceINR < 500) priceMatch = true;
        if (priceTiers.range500to800 && priceINR >= 500 && priceINR <= 800) priceMatch = true;
        if (priceTiers.range800to1200 && priceINR >= 800 && priceINR <= 1200) priceMatch = true;
        if (priceTiers.range1200to1600 && priceINR >= 1200 && priceINR <= 1600) priceMatch = true;
        if (priceTiers.above1600 && priceINR > 1600) priceMatch = true;
        if (!priceMatch) return false;
      }

      // 6. Rating filters
      const hasRatingActive = Object.values(ratings).some(Boolean);
      if (hasRatingActive) {
        let ratingMatch = false;
        if (ratings.rating4plus && trip.rating >= 4.0) ratingMatch = true;
        if (ratings.rating3plus && trip.rating >= 3.0) ratingMatch = true;
        if (!ratingMatch) return false;
      }

      // 7. Amenities filters
      const hasAmenitiesActive = Object.values(amenities).some(Boolean);
      if (hasAmenitiesActive) {
        if (amenities.wifi && !trip.amenities.wifi) return false;
        if (amenities.chargingPoint && !trip.amenities.chargingPoint) return false;
        if (amenities.waterBottle && !trip.amenities.waterBottle) return false;
        if (amenities.blanket && !trip.amenities.blanket) return false;
        if (amenities.readingLight && !trip.amenities.readingLight) return false;
        if (amenities.liveTracking && !trip.amenities.liveTracking) return false;
        if (amenities.emergencySupport && !trip.amenities.emergencySupport) return false;
      }

      // 8. Seat Availability filters
      const hasSeatActive = Object.values(seatAvailability).some(Boolean);
      if (hasSeatActive) {
        const isSleeperType = trip.bus.busType.includes('SLEEPER');
        if (seatAvailability.availableSeatsOnly && trip.availableSeats <= 0) return false;
        if (seatAvailability.windowSeatsAvailable && trip.availableSeats <= 3) return false;
        if (seatAvailability.lowerBerthAvailable && (!isSleeperType || trip.availableSeats <= 1)) return false;
        if (seatAvailability.upperBerthAvailable && (!isSleeperType || trip.availableSeats <= 1)) return false;
      }

      return true;
    });
  }, [enrichedTrips, busTypes, busClasses, departureTimes, arrivalTimes, priceTiers, priceRange, ratings, amenities, seatAvailability]);

  // 3. Memoize sorted trips
  const sortedTrips = useMemo(() => {
    return [...filteredTrips].sort((a, b) => {
      if (sortBy === 'recommended') {
        return (b.rating * b.availableSeats) - (a.rating * a.availableSeats);
      }
      if (sortBy === 'cheapest') {
        return a.price - b.price;
      }
      if (sortBy === 'expensive') {
        return b.price - a.price;
      }
      if (sortBy === 'earliest') {
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      }
      if (sortBy === 'earliestArrival') {
        return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
      }
      if (sortBy === 'highestRated') {
        return b.rating - a.rating;
      }
      if (sortBy === 'fastest') {
        const parseDuration = (d) => {
          const hMatch = d.match(/(\d+)h/);
          const mMatch = d.match(/(\d+)m/);
          const h = hMatch ? parseInt(hMatch[1]) : 0;
          const m = mMatch ? parseInt(mMatch[1]) : 0;
          return h * 60 + m;
        };
        return parseDuration(a.route.duration) - parseDuration(b.route.duration);
      }
      return 0;
    });
  }, [filteredTrips, sortBy]);

  const renderFilterControls = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Bus Type */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Bus Type
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={busTypes.ac} onChange={(e) => setBusTypes({ ...busTypes, ac: e.target.checked })} size="small" />} label="AC" />
          <FormControlLabel control={<Checkbox checked={busTypes.nonAc} onChange={(e) => setBusTypes({ ...busTypes, nonAc: e.target.checked })} size="small" />} label="Non-AC" />
          <FormControlLabel control={<Checkbox checked={busTypes.seater} onChange={(e) => setBusTypes({ ...busTypes, seater: e.target.checked })} size="small" />} label="Seater" />
          <FormControlLabel control={<Checkbox checked={busTypes.sleeper} onChange={(e) => setBusTypes({ ...busTypes, sleeper: e.target.checked })} size="small" />} label="Sleeper" />
          <FormControlLabel control={<Checkbox checked={busTypes.semiSleeper} onChange={(e) => setBusTypes({ ...busTypes, semiSleeper: e.target.checked })} size="small" />} label="Semi Sleeper" />
          <FormControlLabel control={<Checkbox checked={busTypes.acSleeper} onChange={(e) => setBusTypes({ ...busTypes, acSleeper: e.target.checked })} size="small" />} label="AC Sleeper" />
          <FormControlLabel control={<Checkbox checked={busTypes.volvo} onChange={(e) => setBusTypes({ ...busTypes, volvo: e.target.checked })} size="small" />} label="Volvo Coach" />
          <FormControlLabel control={<Checkbox checked={busTypes.multiAxle} onChange={(e) => setBusTypes({ ...busTypes, multiAxle: e.target.checked })} size="small" />} label="Multi-Axle" />
        </FormGroup>
      </Box>

      <Divider />

      {/* Bus Class */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Bus Class
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={busClasses.economy} onChange={(e) => setBusClasses({ ...busClasses, economy: e.target.checked })} size="small" />} label="Economy" />
          <FormControlLabel control={<Checkbox checked={busClasses.premium} onChange={(e) => setBusClasses({ ...busClasses, premium: e.target.checked })} size="small" />} label="Premium" />
          <FormControlLabel control={<Checkbox checked={busClasses.luxury} onChange={(e) => setBusClasses({ ...busClasses, luxury: e.target.checked })} size="small" />} label="Luxury" />
        </FormGroup>
      </Box>

      <Divider />

      {/* Departure Timings */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Departure Time
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={departureTimes.before6am} onChange={(e) => setDepartureTimes({ ...departureTimes, before6am: e.target.checked })} size="small" />} label="Before 6 AM" />
          <FormControlLabel control={<Checkbox checked={departureTimes.range6amTo12pm} onChange={(e) => setDepartureTimes({ ...departureTimes, range6amTo12pm: e.target.checked })} size="small" />} label="6 AM – 12 PM" />
          <FormControlLabel control={<Checkbox checked={departureTimes.range12pmTo6pm} onChange={(e) => setDepartureTimes({ ...departureTimes, range12pmTo6pm: e.target.checked })} size="small" />} label="12 PM – 6 PM" />
          <FormControlLabel control={<Checkbox checked={departureTimes.after6pm} onChange={(e) => setDepartureTimes({ ...departureTimes, after6pm: e.target.checked })} size="small" />} label="After 6 PM" />
        </FormGroup>
      </Box>

      <Divider />

      {/* Arrival Timings */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Arrival Time
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={arrivalTimes.before6am} onChange={(e) => setArrivalTimes({ ...arrivalTimes, before6am: e.target.checked })} size="small" />} label="Before 6 AM" />
          <FormControlLabel control={<Checkbox checked={arrivalTimes.range6amTo12pm} onChange={(e) => setArrivalTimes({ ...arrivalTimes, range6amTo12pm: e.target.checked })} size="small" />} label="6 AM – 12 PM" />
          <FormControlLabel control={<Checkbox checked={arrivalTimes.range12pmTo6pm} onChange={(e) => setArrivalTimes({ ...arrivalTimes, range12pmTo6pm: e.target.checked })} size="small" />} label="12 PM – 6 PM" />
          <FormControlLabel control={<Checkbox checked={arrivalTimes.after6pm} onChange={(e) => setArrivalTimes({ ...arrivalTimes, after6pm: e.target.checked })} size="small" />} label="After 6 PM" />
        </FormGroup>
      </Box>

      <Divider />

      {/* Price Slider */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Price Range Filter
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={(e, val) => setPriceRange(val)}
            valueLabelDisplay="auto"
            min={0}
            max={2200}
            size="small"
            color="secondary"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">₹{priceRange[0]}</Typography>
            <Typography variant="caption" color="text.secondary">₹{priceRange[1]}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Price Tiers */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Price Tiers
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={priceTiers.under500} onChange={(e) => setPriceTiers({ ...priceTiers, under500: e.target.checked })} size="small" />} label="Under ₹500" />
          <FormControlLabel control={<Checkbox checked={priceTiers.range500to800} onChange={(e) => setPriceTiers({ ...priceTiers, range500to800: e.target.checked })} size="small" />} label="₹500 – ₹800" />
          <FormControlLabel control={<Checkbox checked={priceTiers.range800to1200} onChange={(e) => setPriceTiers({ ...priceTiers, range800to1200: e.target.checked })} size="small" />} label="₹800 – ₹1200" />
          <FormControlLabel control={<Checkbox checked={priceTiers.range1200to1600} onChange={(e) => setPriceTiers({ ...priceTiers, range1200to1600: e.target.checked })} size="small" />} label="₹1200 – ₹1600" />
          <FormControlLabel control={<Checkbox checked={priceTiers.above1600} onChange={(e) => setPriceTiers({ ...priceTiers, above1600: e.target.checked })} size="small" />} label="₹1600+" />
        </FormGroup>
      </Box>

      <Divider />

      {/* Rating Filters */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Operator Rating
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={ratings.rating4plus} onChange={(e) => setRatings({ ...ratings, rating4plus: e.target.checked })} size="small" />} label="4★ & above" />
          <FormControlLabel control={<Checkbox checked={ratings.rating3plus} onChange={(e) => setRatings({ ...ratings, rating3plus: e.target.checked })} size="small" />} label="3★ & above" />
        </FormGroup>
      </Box>

      <Divider />

      {/* Amenities */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Amenities
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={amenities.wifi} onChange={(e) => setAmenities({ ...amenities, wifi: e.target.checked })} size="small" />} label="Wi-Fi" />
          <FormControlLabel control={<Checkbox checked={amenities.chargingPoint} onChange={(e) => setAmenities({ ...amenities, chargingPoint: e.target.checked })} size="small" />} label="Charging Point" />
          <FormControlLabel control={<Checkbox checked={amenities.waterBottle} onChange={(e) => setAmenities({ ...amenities, waterBottle: e.target.checked })} size="small" />} label="Water Bottle" />
          <FormControlLabel control={<Checkbox checked={amenities.blanket} onChange={(e) => setAmenities({ ...amenities, blanket: e.target.checked })} size="small" />} label="Blanket" />
          <FormControlLabel control={<Checkbox checked={amenities.readingLight} onChange={(e) => setAmenities({ ...amenities, readingLight: e.target.checked })} size="small" />} label="Reading Light" />
          <FormControlLabel control={<Checkbox checked={amenities.liveTracking} onChange={(e) => setAmenities({ ...amenities, liveTracking: e.target.checked })} size="small" />} label="Live Tracking" />
          <FormControlLabel control={<Checkbox checked={amenities.emergencySupport} onChange={(e) => setAmenities({ ...amenities, emergencySupport: e.target.checked })} size="small" />} label="Emergency Support" />
        </FormGroup>
      </Box>

      <Divider />

      {/* Seat Availability */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
          Seat Availability
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox checked={seatAvailability.availableSeatsOnly} onChange={(e) => setSeatAvailability({ ...seatAvailability, availableSeatsOnly: e.target.checked })} size="small" />} label="Available Seats" />
          <FormControlLabel control={<Checkbox checked={seatAvailability.windowSeatsAvailable} onChange={(e) => setSeatAvailability({ ...seatAvailability, windowSeatsAvailable: e.target.checked })} size="small" />} label="Window Seats Available" />
          <FormControlLabel control={<Checkbox checked={seatAvailability.lowerBerthAvailable} onChange={(e) => setSeatAvailability({ ...seatAvailability, lowerBerthAvailable: e.target.checked })} size="small" />} label="Lower Berth Available" />
          <FormControlLabel control={<Checkbox checked={seatAvailability.upperBerthAvailable} onChange={(e) => setSeatAvailability({ ...seatAvailability, upperBerthAvailable: e.target.checked })} size="small" />} label="Upper Berth Available" />
        </FormGroup>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 800, color: 'primary.main' }}>
          Searching available schedules...
        </Typography>
        <BusListSkeleton />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Route Title info */}
      <Box sx={{ mb: 4, borderBottom: '1px solid #E2E8F0', pb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Button
            onClick={() => router.push('/')}
            variant="text"
            color="secondary"
            startIcon={<KeyboardArrowLeftIcon />}
            sx={{ fontWeight: 700, p: 0, mb: 0.5 }}
          >
            Back to Search
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.02em' }}>
            {source} ↔ {destination}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
            {date} • {sortedTrips.length} bus{sortedTrips.length !== 1 ? 'es' : ''} available
          </Typography>
        </Box>
        
        {isMobile && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FilterAltIcon />}
            onClick={() => setFilterOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            Filters
          </Button>
        )}
      </Box>

      {/* Main split grid */}
      <Grid container spacing={4}>
        
        {/* LEFT COLUMN: Filters (Desktop) */}
        {!isMobile && (
          <Grid item xs={12} md={3.2}>
            <Card sx={{ p: 3.5, border: '1px solid #E2E8F0', borderRadius: 3, position: 'sticky', top: 90, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterAltIcon color="secondary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    Refine Search
                  </Typography>
                </Box>
                <Button size="small" onClick={handleClearAllFilters} color="secondary" sx={{ fontWeight: 700, p: 0 }}>
                  Clear All
                </Button>
              </Box>
              {renderFilterControls()}
            </Card>
          </Grid>
        )}

        {/* RIGHT COLUMN: Sort controls + Trip feeds */}
        <Grid item xs={12} md={isMobile ? 12 : 8.8}>
          
          {/* Top Sort Header bar */}
          <Card sx={{ p: 2, mb: 3.5, border: '1px solid #E2E8F0', borderRadius: 2.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, backgroundColor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SortIcon color="secondary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>Sort By:</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { value: 'recommended', label: 'Recommended' },
                { value: 'cheapest', label: 'Price: Low to High' },
                { value: 'expensive', label: 'Price: High to Low' },
                { value: 'earliest', label: 'Earliest Departure' },
                { value: 'earliestArrival', label: 'Earliest Arrival' },
                { value: 'highestRated', label: 'Highest Rated' },
                { value: 'fastest', label: 'Fastest Journey' },
              ].map((sortOption) => (
                <Button
                  key={sortOption.value}
                  size="small"
                  variant={sortBy === sortOption.value ? 'contained' : 'outlined'}
                  onClick={() => setSortBy(sortOption.value)}
                  color={sortBy === sortOption.value ? 'secondary' : 'primary'}
                  sx={{ borderRadius: 1.5, fontWeight: 700, px: 2, py: 0.5, fontSize: '0.8rem' }}
                >
                  {sortOption.label}
                </Button>
              ))}
            </Box>
          </Card>

          {/* Cards Stack Feed */}
          {sortedTrips.length > 0 ? (
            <Box>
              {sortedTrips.map((trip) => (
                <BusCard key={trip.id} trip={trip} onBookSeats={handleBookSeats} />
              ))}
            </Box>
          ) : (
            <EmptyState
              title="No buses match your filters"
              message="Try adjusting your filter ticks or resetting filters using the Clear All action."
              actionLabel="Clear Filters"
              onAction={handleClearAllFilters}
            />
          )}
        </Grid>
      </Grid>

      {/* Mobile filter dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="xs" scroll="paper">
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filters
          <Button size="small" onClick={() => setFilterOpen(false)} color="secondary" sx={{ fontWeight: 700 }}>
            Done
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 1 }}>
            {renderFilterControls()}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button
            variant="text"
            color="primary"
            onClick={handleClearAllFilters}
            sx={{ fontWeight: 700 }}
          >
            Clear All
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setFilterOpen(false)} sx={{ fontWeight: 700 }}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<BusListSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
