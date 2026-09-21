'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Button,
  IconButton,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  useMediaQuery,
  useTheme,
  Alert,
  Chip,
  Skeleton,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import TuneIcon from '@mui/icons-material/Tune';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

import { searchAvailableCabs } from '@/actions/cab';
import CabCard from '@/components/CabCard';
import CabDetailsModal from '@/components/CabDetailsModal';
import CabSearchForm from '@/components/CabSearchForm';
import EmptyState from '@/components/EmptyState';

const ALL_CAB_TYPES = ['SEDAN', 'SUV', 'XL', 'MINI', 'ELECTRIC', 'PREMIUM', 'LUXURY', 'AIRPORT', 'OUTSTATION'];

function CabSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const pickup = searchParams.get('pickup') || 'Chennai';
  const drop = searchParams.get('drop') || 'Bangalore';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const time = searchParams.get('time') || '08:00 AM';
  const passengers = parseInt(searchParams.get('passengers') || '2', 10);
  const initialCat = searchParams.get('category') || 'ALL';

  const [cabs, setCabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Cab for Details Modal
  const [selectedCabForModal, setSelectedCabForModal] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Modify Search Dialog
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);

  // Filter Drawer on Mobile
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // ----------------------------------------------------
  // Dynamic Filters State
  // ----------------------------------------------------
  const [selectedTypes, setSelectedTypes] = useState(
    initialCat !== 'ALL' && ALL_CAB_TYPES.includes(initialCat.toUpperCase())
      ? [initialCat.toUpperCase()]
      : []
  );
  const [priceRange, setPriceRange] = useState([200, 8000]);
  const [minRating, setMinRating] = useState(0); // 0, 3.5, 4.0, 4.5
  const [featureAcOnly, setFeatureAcOnly] = useState(false);
  const [featureLuggageOnly, setFeatureLuggageOnly] = useState(false);
  const [featureEvOnly, setFeatureEvOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);

  // ----------------------------------------------------
  // Sorting State
  // ----------------------------------------------------
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price_low' | 'price_high' | 'rating' | 'fastest' | 'nearest'

  // Fetch cabs from server actions
  useEffect(() => {
    setLoading(true);
    setError('');

    searchAvailableCabs({
      pickup,
      drop,
      date,
      time,
      passengers,
      category: initialCat,
    })
      .then((res) => {
        if (res.success && res.data) {
          setCabs(res.data);
          // Set max price range from fetched results
          const maxP = Math.max(...res.data.map((c) => c.totalFare || 2000), 4000);
          setPriceRange([100, Math.ceil(maxP * 1.1)]);
        } else {
          setError(res.error || 'No cabs found matching your criteria.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to search cabs');
      })
      .finally(() => setLoading(false));
  }, [pickup, drop, date, time, passengers, initialCat]);

  // Handle View Details
  const handleOpenDetails = (cab) => {
    setSelectedCabForModal(cab);
    setDetailsModalOpen(true);
  };

  // Filter Type Toggle
  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSelectedTypes([]);
    setMinRating(0);
    setFeatureAcOnly(false);
    setFeatureLuggageOnly(false);
    setFeatureEvOnly(false);
    setAvailableOnly(true);
    const maxP = Math.max(...cabs.map((c) => c.totalFare || 2000), 4000);
    setPriceRange([100, Math.ceil(maxP * 1.1)]);
  };

  // ----------------------------------------------------
  // Filter & Sort Logic
  // ----------------------------------------------------
  const filteredAndSortedCabs = useMemo(() => {
    let list = [...cabs];

    // Filter by Available Only
    if (availableOnly) {
      list = list.filter((c) => c.available === true);
    }

    // Filter by Type
    if (selectedTypes.length > 0) {
      list = list.filter((c) => selectedTypes.includes(c.category?.toUpperCase()));
    }

    // Filter by Price Range
    list = list.filter(
      (c) => (c.totalFare || 0) >= priceRange[0] && (c.totalFare || 0) <= priceRange[1]
    );

    // Filter by Rating
    if (minRating > 0) {
      list = list.filter((c) => (c.rating || 0) >= minRating);
    }

    // Filter Features
    if (featureAcOnly) {
      list = list.filter((c) => c.ac === true);
    }
    if (featureLuggageOnly) {
      list = list.filter((c) => (c.luggage || 0) >= 3);
    }
    if (featureEvOnly) {
      list = list.filter(
        (c) => c.category === 'ELECTRIC' || c.fuelType?.toLowerCase().includes('electric')
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        list.sort((a, b) => (a.totalFare || 0) - (b.totalFare || 0));
        break;
      case 'price_high':
        list.sort((a, b) => (b.totalFare || 0) - (a.totalFare || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'fastest':
        list.sort((a, b) => (a.etaMinutes || 5) - (b.etaMinutes || 5));
        break;
      case 'nearest':
        list.sort((a, b) => (a.distanceKm || 2) - (b.distanceKm || 2));
        break;
      case 'recommended':
      default:
        list.sort((a, b) => (b.rating || 0) * 1000 - (a.totalFare || 0));
        break;
    }

    return list;
  }, [
    cabs,
    availableOnly,
    selectedTypes,
    priceRange,
    minRating,
    featureAcOnly,
    featureLuggageOnly,
    featureEvOnly,
    sortBy,
  ]);

  // Sidebar Filter Content component
  const filterControls = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Clear Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon sx={{ color: '#D97706' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
            Filters
          </Typography>
        </Box>
        <Button size="small" onClick={handleClearFilters} sx={{ color: '#D97706', fontWeight: 750 }}>
          Clear All
        </Button>
      </Box>

      <Divider />

      {/* Availability Filter */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          Driver Availability
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#047857' }}>
              🟢 Available Drivers Only
            </Typography>
          }
        />
      </Box>

      <Divider />

      {/* Cab Category Filter */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.2 }}>
          Cab Categories
        </Typography>
        <FormGroup>
          {ALL_CAB_TYPES.map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                  {type === 'ELECTRIC' ? '⚡ Electric EV' : type}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Divider />

      {/* Price Range Slider */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          Price Range (₹)
        </Typography>
        <Slider
          value={priceRange}
          onChange={(_, newVal) => setPriceRange(newVal)}
          valueLabelDisplay="auto"
          min={100}
          max={6000}
          step={50}
          sx={{ color: '#D97706' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
            ₹{priceRange[0]}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
            ₹{priceRange[1]}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Driver Rating Filter */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          Minimum Driver Rating
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[0, 4.0, 4.5, 4.8].map((rat) => (
            <Chip
              key={rat}
              label={rat === 0 ? 'All' : `⭐ ${rat}+`}
              clickable
              onClick={() => setMinRating(rat)}
              sx={{
                fontWeight: 750,
                bgcolor: minRating === rat ? '#D97706' : '#F1F5F9',
                color: minRating === rat ? '#FFFFFF' : '#334155',
              }}
            />
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Features Filter */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          Special Features
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={featureAcOnly}
                onChange={(e) => setFeatureAcOnly(e.target.checked)}
                sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }}
                size="small"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Air Conditioned Only</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={featureLuggageOnly}
                onChange={(e) => setFeatureLuggageOnly(e.target.checked)}
                sx={{ color: '#D97706', '&.Mui-checked': { color: '#D97706' } }}
                size="small"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Extra Luggage (3+ Bags)</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={featureEvOnly}
                onChange={(e) => setFeatureEvOnly(e.target.checked)}
                sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }}
                size="small"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>⚡ Green Electric EV</Typography>}
          />
        </FormGroup>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* ====================================================
          STICKY SEARCH SUMMARY BAR
          ==================================================== */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          py: 2,
          px: 2,
          position: 'sticky',
          top: 64,
          zIndex: 90,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            {/* Route Summary */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 3 }, flexWrap: 'wrap' }}>
              <IconButton onClick={() => router.push('/cab')} size="small" sx={{ color: '#D97706' }}>
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                  {pickup} → {drop}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  {date} • {time} • {passengers} Passenger{passengers > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>

            {/* Modify Search Action Button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setModifyDialogOpen(true)}
              sx={{
                borderColor: '#D97706',
                color: '#D97706',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 2.5,
                '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.08)', borderColor: '#B45309' },
              }}
            >
              Modify Search
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Results Layout */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3.5}>
          {/* Desktop Filter Sidebar */}
          {!isMobile && (
            <Grid item md={3.5}>
              <Card sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', position: 'sticky', top: 150 }}>
                {filterControls}
              </Card>
            </Grid>
          )}

          {/* Results Column */}
          <Grid item xs={12} md={8.5}>
            {/* Sort & Count Header Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A' }}>
                  Available Cabs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {loading ? 'Searching live drivers...' : `${filteredAndSortedCabs.length} verified cabs ready for your route`}
                </Typography>
              </Box>

              {/* Mobile Filter Trigger & Desktop Sort */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={<TuneIcon />}
                    onClick={() => setFilterDrawerOpen(true)}
                    sx={{ borderColor: '#D97706', color: '#D97706', fontWeight: 800, borderRadius: 2.5 }}
                  >
                    Filters
                  </Button>
                )}

                {/* Sort Chips */}
                <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 0.5 }}>
                  {[
                    { label: 'Recommended', value: 'recommended' },
                    { label: 'Lowest Price', value: 'price_low' },
                    { label: 'Fastest ETA', value: 'fastest' },
                    { label: 'Top Rated', value: 'rating' },
                    { label: 'Nearest', value: 'nearest' },
                  ].map((s) => (
                    <Chip
                      key={s.value}
                      label={s.label}
                      clickable
                      onClick={() => setSortBy(s.value)}
                      size="small"
                      sx={{
                        fontWeight: 750,
                        bgcolor: sortBy === s.value ? '#0F172A' : '#FFFFFF',
                        color: sortBy === s.value ? '#FFFFFF' : '#334155',
                        border: '1px solid #CBD5E1',
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Error state if any */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} variant="rounded" height={220} sx={{ borderRadius: 3.5 }} />
                ))}
              </Box>
            )}

            {/* Results Cards List */}
            {!loading && filteredAndSortedCabs.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {filteredAndSortedCabs.map((cab) => (
                  <CabCard key={cab.id} cab={cab} onViewDetails={handleOpenDetails} />
                ))}
              </Box>
            )}

            {/* Empty State */}
            {!loading && filteredAndSortedCabs.length === 0 && (
              <EmptyState
                title="No available cabs match your filters"
                message="Try adjusting your price range, cab category, or clearing active filters to see more drivers."
                actionLabel="Reset All Filters"
                onAction={handleClearFilters}
              />
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            p: 3,
            maxHeight: '85vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Filter Available Cabs
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {filterControls}
        <Button
          fullWidth
          variant="contained"
          onClick={() => setFilterDrawerOpen(false)}
          sx={{ mt: 3, bgcolor: '#D97706', py: 1.2, borderRadius: 2.5, fontWeight: 800 }}
        >
          Apply Filters ({filteredAndSortedCabs.length} Cabs)
        </Button>
      </Drawer>

      {/* Modify Search Modal */}
      <Dialog
        open={modifyDialogOpen}
        onClose={() => setModifyDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Modify Cab Search</Typography>
          <IconButton onClick={() => setModifyDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <CabSearchForm
            initialPickup={pickup}
            initialDrop={drop}
            initialDate={date}
            initialTime={time}
            initialPassengers={passengers}
          />
        </DialogContent>
      </Dialog>

      {/* Cab Details Modal */}
      <CabDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        cab={selectedCabForModal}
      />
    </Box>
  );
}

export default function CabSearchPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 10, textAlign: 'center' }}>Loading cab search results...</Box>}>
      <CabSearchContent />
    </Suspense>
  );
}
