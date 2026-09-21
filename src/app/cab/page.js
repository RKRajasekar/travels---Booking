'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import AirlineSeatReclineExtraIcon from '@mui/icons-material/AirlineSeatReclineExtra';
import CleanHandsIcon from '@mui/icons-material/CleanHands';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import ModeSwitcher from '@/components/ModeSwitcher';
import CabSearchForm from '@/components/CabSearchForm';
import { CAB_CATEGORIES, CAB_SERVICES, CAB_OFFERS, CAB_FAQS } from '@/lib/cabData';

export default function CabHomePage() {
  const router = useRouter();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleModeChange = (mode) => {
    if (mode === 'bus') {
      router.push('/');
    }
  };

  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setToastMsg(`Coupon code "${code}" copied! Discount applied at checkout.`);
      setToastOpen(true);
    }
  };

  const handleServiceClick = (service) => {
    router.push(`/cab/search?pickup=Chennai&drop=Bangalore&date=${new Date().toISOString().split('T')[0]}&time=08:00 AM&passengers=2&category=${service.category}`);
  };

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ====================================================
          PREMIUM 2D CAB HERO SECTION WITH AMBER/GOLD THEME
          ==================================================== */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(145deg, #1C1103 0%, #2E1A04 40%, #452405 70%, #150A02 100%)',
          color: '#FFFFFF',
          pt: { xs: 4, md: 6 },
          pb: { xs: 11, md: 14 },
          px: 2,
          overflow: 'hidden',
          borderBottom: '1px solid rgba(217, 119, 6, 0.25)',
        }}
      >
        {/* Ambient Glows and Particles */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              right: '15%',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(46, 26, 4, 0) 70%)',
              filter: 'blur(45px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-20%',
              left: '5%',
              width: 420,
              height: 420,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(5, 150, 105, 0.16) 0%, rgba(5, 150, 105, 0) 70%)',
              filter: 'blur(45px)',
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Top Mode Switcher Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 4 } }}>
            <ModeSwitcher activeMode="cab" onModeChange={handleModeChange} />
          </Box>

          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
            {/* Left Hero Title */}
            <Grid item xs={12} md={6.5}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.6,
                    borderRadius: 5,
                    bgcolor: 'rgba(217, 119, 6, 0.18)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    mb: 2.2,
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.2)',
                  }}
                >
                  <LocalTaxiIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#FDE68A',
                    }}
                  >
                    Premium Chauffeur & City Cabs
                  </Typography>
                </Box>

                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.3rem', sm: '2.9rem', md: '3.6rem' },
                    lineHeight: { xs: 1.15, md: 1.1 },
                    letterSpacing: '-0.035em',
                    mb: 2.2,
                    background: 'linear-gradient(135deg, #FFFFFF 20%, #FEF3C7 60%, #F59E0B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Reliable Rides, Verified Drivers & Zero Surge.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.82)',
                    fontSize: { xs: '0.98rem', md: '1.12rem' },
                    lineHeight: 1.6,
                    maxWidth: 540,
                    mb: 3.5,
                    mx: { xs: 'auto', md: 0 },
                  }}
                >
                  Book clean Sedans, spacious SUVs, luxury cars, and green electric EVs with real-time GPS tracking and 100% transparent pricing.
                </Typography>

                {/* Trust Badges */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    gap: 1.2,
                  }}
                >
                  <Chip
                    icon={<GpsFixedIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
                    label="Live GPS Tracking"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(5, 150, 105, 0.2)',
                      color: '#A7F3D0',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: 650,
                    }}
                  />
                  <Chip
                    icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#F59E0B !important' }} />}
                    label="100% Verified Chauffeurs"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(217, 119, 6, 0.2)',
                      color: '#FDE68A',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontWeight: 650,
                    }}
                  />
                  <Chip
                    icon={<CleanHandsIcon sx={{ fontSize: '14px !important', color: '#60A5FA !important' }} />}
                    label="Sanitized Cabs"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(37, 99, 235, 0.2)',
                      color: '#BFDBFE',
                      border: '1px solid rgba(96, 165, 250, 0.3)',
                      fontWeight: 650,
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Hero Illustration: 2D Premium Yellow/Gold Cab */}
            <Grid item xs={12} md={5.5}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: 420, md: 520 },
                  mx: 'auto',
                  animation: 'busFloat 5s ease-in-out infinite',
                }}
              >
                <svg
                  viewBox="0 0 560 340"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: '100%', height: 'auto' }}
                >
                  <defs>
                    <linearGradient id="cabBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#B45309" />
                    </linearGradient>
                    <linearGradient id="cabRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                    <radialGradient id="cabGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Underglow */}
                  <ellipse cx="280" cy="275" rx="230" ry="25" fill="url(#cabGlow)" />

                  {/* Road */}
                  <line x1="20" y1="280" x2="540" y2="280" stroke="#475569" strokeWidth="4" strokeDasharray="16 12" />

                  {/* Cab Body */}
                  <path
                    d="M 60 215 
                       Q 90 215 110 200 
                       L 155 145 
                       Q 175 125 210 125 
                       L 360 125 
                       Q 395 125 425 155 
                       L 470 195 
                       Q 505 205 515 225 
                       L 515 250 
                       L 45 250 
                       L 45 225 Z"
                    fill="url(#cabBodyGrad)"
                  />

                  {/* Cab Roof Sign (TAXI) */}
                  <rect x="235" y="105" width="70" height="20" rx="4" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
                  <text x="270" y="119" fill="#0F172A" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                    NEXTCAB
                  </text>

                  {/* Windows */}
                  {/* Front Window */}
                  <path d="M 370 135 L 420 160 L 440 195 L 350 195 L 350 135 Z" fill="url(#cabRoofGrad)" stroke="#1E293B" strokeWidth="2" />
                  {/* Rear Window */}
                  <path d="M 210 135 L 340 135 L 340 195 L 175 195 Z" fill="url(#cabRoofGrad)" stroke="#1E293B" strokeWidth="2" />

                  {/* Headlights */}
                  <polygon points="505,225 515,225 515,240 500,238" fill="#FEF08A" filter="drop-shadow(0 0 8px #FDE047)" />
                  <polygon points="45,225 55,225 55,240 45,238" fill="#EF4444" />

                  {/* Wheels */}
                  {/* Rear Wheel Arch */}
                  <circle cx="130" cy="255" r="30" fill="#0F172A" />
                  <circle cx="130" cy="255" r="20" fill="#64748B" stroke="#CBD5E1" strokeWidth="2" />
                  <circle cx="130" cy="255" r="7" fill="#D97706" />

                  {/* Front Wheel Arch */}
                  <circle cx="430" cy="255" r="30" fill="#0F172A" />
                  <circle cx="430" cy="255" r="20" fill="#64748B" stroke="#CBD5E1" strokeWidth="2" />
                  <circle cx="430" cy="255" r="7" fill="#D97706" />

                  {/* Side Stripe */}
                  <path d="M 60 215 L 505 215" stroke="#1E293B" strokeWidth="3" />
                  <text x="270" y="212" fill="#FFFFFF" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                    ★ NEXTBUS CAB EXPRESS ★
                  </text>
                </svg>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ====================================================
          SEARCH FORM CONTAINER (Floating Glass Card)
          ==================================================== */}
      <Container maxWidth="lg" sx={{ mb: 9, mt: -6 }}>
        <CabSearchForm />
      </Container>

      {/* ====================================================
          SECTION 1: CAB SERVICES (8 Service Types)
          ==================================================== */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.8,
              py: 0.5,
              borderRadius: 5,
              bgcolor: 'rgba(217, 119, 6, 0.1)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              mb: 1.5,
            }}
          >
            <LocalTaxiIcon sx={{ fontSize: 16, color: '#D97706' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#D97706', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Tailored Ride Experiences
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Our Cab Services
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '640px', mx: 'auto', fontWeight: 500 }}>
            From quick city commutes and scheduled airport transfers to weekend outstation trips, we have the ideal ride for every journey.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {CAB_SERVICES.map((srv) => (
            <Grid item xs={12} sm={6} md={3} key={srv.id}>
              <Card
                onClick={() => handleServiceClick(srv)}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: '#D97706',
                    boxShadow: '0 14px 30px rgba(217, 119, 6, 0.15)',
                    '& .serviceIcon': { transform: 'scale(1.15)' },
                  },
                }}
              >
                <Typography className="serviceIcon" sx={{ fontSize: '2.5rem', mb: 1.5, transition: 'transform 0.3s ease' }}>
                  {srv.icon}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.8 }}>
                  {srv.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {srv.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ====================================================
          SECTION 2: FLEET SHOWCASE (10 Realistic Categories)
          ==================================================== */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Explore Our Cab Fleet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '640px', mx: 'auto', fontWeight: 500 }}>
            Choose from hatchbacks, executive sedans, spacious 7-seater SUVs, and green electric vehicles.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {CAB_CATEGORIES.slice(0, 6).map((cat) => (
            <Grid item xs={12} sm={6} md={4} key={cat.id}>
              <Card
                sx={{
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 36px rgba(15, 23, 42, 0.1)',
                  },
                }}
              >
                <Box sx={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                  <Box
                    component="img"
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Chip
                    label={`From ₹${cat.perKmRate}/km`}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'rgba(15, 23, 42, 0.85)',
                      color: '#FEF3C7',
                      fontWeight: 800,
                      backdropFilter: 'blur(4px)',
                    }}
                  />
                </Box>
                <Box sx={{ p: 2.8, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                      {cat.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      {cat.sampleModels}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={`${cat.seats} Seats`} size="small" sx={{ fontWeight: 700 }} />
                      <Chip label={`${cat.luggage} Bags`} size="small" sx={{ fontWeight: 700 }} />
                      <Chip label="AC" size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7' }} />
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => router.push(`/cab/search?category=${cat.id}`)}
                    sx={{
                      borderColor: '#D97706',
                      color: '#D97706',
                      fontWeight: 750,
                      borderRadius: 2.5,
                      '&:hover': { bgcolor: '#D97706', color: '#FFFFFF' },
                    }}
                  >
                    View Available {cat.name}s
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ====================================================
          SECTION 3: WORKING OFFERS & COUPONS
          ==================================================== */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1.2, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Exclusive Cab Coupons & Offers
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '640px', mx: 'auto', fontWeight: 500 }}>
            Apply these working discount coupons during checkout to enjoy instant savings on your rides.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {CAB_OFFERS.map((offer) => (
            <Grid item xs={12} sm={6} md={4} key={offer.code}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: '1px dashed #CBD5E1',
                  bgcolor: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: offer.color }}>
                      {offer.title}
                    </Typography>
                    <Chip label={offer.badge} size="small" sx={{ bgcolor: `${offer.color}15`, color: offer.color, fontWeight: 800 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {offer.desc}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: 'rgba(241, 245, 249, 0.8)',
                  }}
                >
                  <Typography sx={{ fontWeight: 900, letterSpacing: '0.1em', color: '#0F172A' }}>
                    {offer.code}
                  </Typography>
                  <Tooltip title="Copy coupon code">
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopyCode(offer.code)}
                      sx={{ fontWeight: 800, color: offer.color }}
                    >
                      COPY
                    </Button>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ====================================================
          SECTION 4: CAB FAQS ACCORDION
          ==================================================== */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#0F172A', mb: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Everything you need to know about booking, drivers, cancellations, and live tracking.
          </Typography>
        </Box>

        {CAB_FAQS.map((faq, idx) => (
          <Accordion
            key={idx}
            sx={{
              mb: 1.5,
              borderRadius: '12px !important',
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#D97706' }} />}>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, fontWeight: 500 }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 3, fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
