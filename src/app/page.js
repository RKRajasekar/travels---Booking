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
  Divider,
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
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ShieldIcon from '@mui/icons-material/Shield';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import AirlineSeatReclineExtraIcon from '@mui/icons-material/AirlineSeatReclineExtra';

import SearchForm from '@/components/SearchForm';
import ModeSwitcher from '@/components/ModeSwitcher';
import { format, addDays } from 'date-fns';

// ----------------------------------------------------
// Mock Databases for Home Sections
// ----------------------------------------------------

const governmentBuses = [
  {
    name: 'TNSTC',
    fullname: 'Tamil Nadu State Transport Corporation',
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=600&q=80',
    type: 'Ultra Deluxe Classic Seater',
    routes: 'Chennai ↔ Madurai, Trichy ↔ Coimbatore',
    acText: 'Non-AC Sleeper/Seater',
    rating: '4.2',
    status: 'High Frequency Services',
    source: 'Chennai',
    dest: 'Madurai'
  },
  {
    name: 'SETC',
    fullname: 'State Express Transport Corporation',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    type: 'AC Sleeper / Seater Coaches',
    routes: 'Chennai ↔ Bangalore, Madurai ↔ Chennai',
    acText: 'AC & Non-AC Luxury Coaches',
    rating: '4.3',
    status: 'Interstate Long Distance',
    source: 'Chennai',
    dest: 'Bangalore'
  },
  {
    name: 'KSRTC',
    fullname: 'Karnataka State Road Transport Corporation',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    type: 'Airavat Club Class (Volvo AC)',
    routes: 'Bangalore ↔ Chennai, Bangalore ↔ Coimbatore',
    acText: 'Multi-Axle Premium AC Sleeper',
    rating: '4.6',
    status: 'Super Luxury Volvo Transit',
    source: 'Bangalore',
    dest: 'Coimbatore'
  },
  {
    name: 'APSRTC',
    fullname: 'Andhra Pradesh State Road Transport Corporation',
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
    type: 'Amaravathi Super Luxury Sleeper',
    routes: 'Tirupati ↔ Bangalore, Nellore ↔ Chennai',
    acText: 'AC Sleeper / Semi-Sleeper',
    rating: '4.4',
    status: 'Punctual & Comfortable',
    source: 'Chennai',
    dest: 'Bangalore'
  }
];

const services = [
  {
    title: 'Easy Bus Booking',
    desc: 'Search and book buses quickly from multiple travel operators.',
    icon: '🚌'
  },
  {
    title: 'Smart Bus Search',
    desc: 'Find buses based on route, date, bus type, timing, and price.',
    icon: '🔍'
  },
  {
    title: 'Easy Seat Selection',
    desc: 'View available seats and select your preferred seat.',
    icon: '💺'
  },
  {
    title: 'Secure Online Payment',
    desc: 'Provide a simple and secure payment experience.',
    icon: '💳'
  },
  {
    title: 'Instant Ticket Confirmation',
    desc: 'Get booking confirmation and ticket details after successful booking.',
    icon: '🎫'
  },
  {
    title: 'Digital Ticket',
    desc: 'Access your ticket easily from the website/app.',
    icon: '📱'
  },
  {
    title: 'Easy Cancellation',
    desc: 'Provide cancellation and refund information clearly.',
    icon: '🔄'
  },
  {
    title: 'Live Trip/Bus Information',
    desc: 'Show available journey and service information whenever applicable.',
    icon: '🕐'
  }
];

const offers = [
  {
    title: 'First Booking Offer',
    desc: 'Use coupon on your very first bus ticket reservation.',
    discount: '₹100 OFF',
    code: 'FIRST100',
    color: '#DC2626'
  },
  {
    title: 'Weekend Special',
    desc: 'Travel on weekends and grab extra savings on luxury buses.',
    discount: 'Up to 15% OFF',
    code: 'WEEKEND15',
    color: '#059669'
  },
  {
    title: 'Govt Bus Deal',
    desc: 'Save more when booking government operated state transport buses.',
    discount: 'Flat 10% OFF',
    code: 'GOVT10',
    color: '#781D2D'
  },
  {
    title: 'New User Discount',
    desc: 'Sign up today and unlock instant wallet cash for bus tickets.',
    discount: 'Flat ₹150 OFF',
    code: 'NEWUSER150',
    color: '#D97706'
  },
  {
    title: 'Festival Offers',
    desc: 'Travel to your hometown this festival season with huge discounts.',
    discount: 'Up to 25% OFF',
    code: 'FESTIVE25',
    color: '#E11D48'
  },
  {
    title: 'Cashback Offers',
    desc: 'Pay via UPI or Net Banking to get cashback directly to your wallet.',
    discount: '₹50 Cashback',
    code: 'UPI50',
    color: '#10B981'
  }
];

const faqs = [
  {
    q: 'How can I book a bus ticket?',
    a: 'You can book a ticket by entering your source, destination, and travel date on the homepage. Then, choose your preferred bus operator, select your seat, enter traveler details, and complete the secure payment.'
  },
  {
    q: 'How can I search for available buses?',
    a: 'Simply enter your departure city (From), arrival city (To), and travel date in the search section, then click "Search Buses". You can then refine your search using price, time, and operator filters.'
  },
  {
    q: 'Can I choose my preferred seat?',
    a: 'Yes! Our interactive Seat Picker lets you view the real-time layout of the bus, including window, aisle, sleeper, and seater configurations, so you can pick exactly where you want to sit.'
  },
  {
    q: 'Can I cancel my bus ticket?',
    a: 'Yes, cancellations are easy. You can cancel your booking through the "My Tickets" section. Refund eligibility depends on the operator\'s cancellation policy.'
  },
  {
    q: 'How will I receive my ticket after booking?',
    a: 'You will receive an instant confirmation email and SMS with your digital ticket. You can also view and download it anytime from the "My Tickets" page on our website.'
  },
  {
    q: 'What payment methods are available?',
    a: 'We support all major secure payment options, including Credit/Debit Cards, UPI, Net Banking, and popular mobile wallets.'
  },
  {
    q: 'What should I do if my payment is successful but my ticket is not confirmed?',
    a: 'Don\'t worry! In rare cases of network issues, if the ticket is not confirmed, the amount will be automatically refunded to your original payment method within 3-5 business days. You can also contact our support.'
  },
  {
    q: 'How can I check my booking status?',
    a: 'Navigate to "My Tickets" and log in with your account to view the real-time status of your active and past reservations.'
  },
  {
    q: 'Can I change my travel date after booking?',
    a: 'Date modifications depend on the specific bus operator\'s policy. Some operators allow rescheduling up to 24 hours before departure, while others require cancellation and re-booking.'
  },
  {
    q: 'How can I get a refund after cancellation?',
    a: 'Once you cancel a ticket, the refund amount is calculated based on the policy and processed immediately. It usually takes 2-7 working days to reflect in your bank account or wallet.'
  },
  {
    q: 'What happens if the bus is cancelled by the operator?',
    a: 'If the operator cancels the bus, you will receive a full 100% refund. We will notify you immediately via email/SMS and help you book an alternative service if available.'
  },
  {
    q: 'Can I book a ticket for someone else?',
    a: 'Absolutely! You can book tickets for your friends or family by entering their name, age, gender, and contact details in the traveler info form during checkout.'
  },
  {
    q: 'How early can I book a bus ticket?',
    a: 'Most operators open bookings 30 to 45 days in advance, allowing you to plan your journey and secure your preferred seats early.'
  },
  {
    q: 'What should I do if I lose my ticket confirmation?',
    a: 'You can retrieve it by going to "My Tickets" on our website. Alternatively, contact our 24/7 customer support with your phone number and email, and we will resend it to you.'
  },
  {
    q: 'How can I contact customer support regarding my booking?',
    a: 'You can reach our dedicated customer support team via the contact form on our website, email us at support@nextbus.com, or call our toll-free helpline number.'
  }
];

export default function HomePage() {
  const router = useRouter();

  // Search parameters states for form initialization
  const [sourceCity, setSourceCity] = useState('Chennai');
  
  // Copy toast states
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleLocationUpdate = (city) => {
    setSourceCity(city || '');
  };

  const handleGovtBusSearch = (bus) => {
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    router.push(`/search?source=${encodeURIComponent(bus.source)}&destination=${encodeURIComponent(bus.dest)}&date=${tomorrowStr}`);
  };

  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setToastMsg(`Coupon code "${code}" copied! Discount applied at checkout.`);
      setToastOpen(true);
    }
  };

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ====================================================
          PREMIUM 2D ILLUSTRATED TRAVEL HERO SECTION
          ==================================================== */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(145deg, #1C0308 0%, #3B0813 40%, #540D1B 70%, #170407 100%)',
          color: '#FFFFFF',
          pt: { xs: 6, md: 9 },
          pb: { xs: 11, md: 14 },
          px: 2,
          overflow: 'hidden',
          borderBottom: '1px solid rgba(220, 38, 38, 0.15)',
        }}
      >
        {/* Subtle Scenic Background Layer (Mountains, Road, Route Lights & Particles) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Radial Glows */}
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              right: '15%',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(220, 38, 38, 0.22) 0%, rgba(59, 8, 19, 0) 70%)',
              filter: 'blur(40px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-20%',
              right: '5%',
              width: 420,
              height: 420,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(5, 150, 105, 0.16) 0%, rgba(5, 150, 105, 0) 70%)',
              filter: 'blur(45px)',
            }}
          />

          {/* Floating Travel Particles */}
          <Box
            sx={{
              position: 'absolute',
              top: '25%',
              left: '12%',
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#10B981',
              boxShadow: '0 0 10px #10B981',
              animation: 'particleFloat 6s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              left: '48%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#EF4444',
              boxShadow: '0 0 12px #EF4444',
              animation: 'particleFloat 8s ease-in-out infinite 1s',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '65%',
              right: '35%',
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: '#34D399',
              boxShadow: '0 0 8px #34D399',
              animation: 'particleFloat 7s ease-in-out infinite 2s',
            }}
          />

          {/* Layered Mountains SVG Silhouette */}
          <svg
            viewBox="0 0 1440 320"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 'auto',
              opacity: 0.22,
            }}
            preserveAspectRatio="none"
          >
            <path
              fill="#DC2626"
              d="M0,224L60,208C120,192,240,160,360,170.7C480,181,600,235,720,234.7C840,235,960,181,1080,165.3C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
            <path
              fill="#23040B"
              d="M0,288L80,266.7C160,245,320,203,480,208C640,213,800,267,960,266.7C1120,267,1280,213,1360,186.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </Box>

        {/* Hero Content Container: Split Layout on Desktop */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Top Level Mode Switcher */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 4 } }}>
            <ModeSwitcher activeMode="bus" onModeChange={(mode) => mode === 'cab' && router.push('/cab')} />
          </Box>

          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
            
            {/* Left Hero Content (Preserves exact heading & description text) */}
            <Grid item xs={12} md={6.5}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                
                {/* Premium Travel Badge */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.7,
                    borderRadius: '50px',
                    bgcolor: 'rgba(220, 38, 38, 0.18)',
                    border: '1px solid rgba(220, 38, 38, 0.35)',
                    backdropFilter: 'blur(8px)',
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#10B981',
                      boxShadow: '0 0 8px #10B981',
                      animation: 'pulseGlow 2s infinite',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#FCA5A5',
                      fontSize: '0.75rem',
                    }}
                  >
                    India&apos;s Premium Bus Transit Network
                  </Typography>
                </Box>

                {/* EXACT REQUIRED HEADING */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.4rem', sm: '3.1rem', md: '3.6rem' },
                    fontWeight: 900,
                    mb: 2,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.12,
                    textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FEE2E2 70%, #FCA5A5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Your Journey. Your Seat. Your Way.
                </Typography>

                {/* EXACT REQUIRED DESCRIPTION */}
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.05rem', md: '1.25rem' },
                    fontWeight: 400,
                    color: '#E2E8F0',
                    mb: 3.5,
                    maxWidth: '560px',
                    mx: { xs: 'auto', md: '0' },
                    lineHeight: 1.65,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Book premium bus journeys, choose your exact seat and track your bus live.
                </Typography>

                {/* Trust & Highlights Badges */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  <Chip
                    icon={<StarIcon sx={{ fontSize: '15px !important', color: '#FBBF24 !important' }} />}
                    label="4.8/5 Rated Service"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontWeight: 650,
                      backdropFilter: 'blur(6px)',
                    }}
                  />
                  <Chip
                    icon={<GpsFixedIcon sx={{ fontSize: '14px !important', color: '#34D399 !important' }} />}
                    label="Live GPS Tracking"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(5, 150, 105, 0.18)',
                      color: '#6EE7B7',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      fontWeight: 650,
                      backdropFilter: 'blur(6px)',
                    }}
                  />
                  <Chip
                    icon={<ShieldIcon sx={{ fontSize: '14px !important', color: '#F87171 !important' }} />}
                    label="100% Verified Operators"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(220, 38, 38, 0.18)',
                      color: '#FCA5A5',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      fontWeight: 650,
                      backdropFilter: 'blur(6px)',
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Hero: High-End 2D Volvo Multi-Axle Bus Illustration with Scenic Elements */}
            <Grid item xs={12} md={5.5}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: 440, md: 540 },
                  mx: 'auto',
                  animation: 'busFloat 5s ease-in-out infinite',
                }}
              >
                {/* 2D Modern Volvo Coach SVG Art */}
                <svg
                  viewBox="0 0 600 380"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                >
                  <defs>
                    {/* Bus Metallic Gradient */}
                    <linearGradient id="busBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2D060C" />
                      <stop offset="35%" stopColor="#4A0B14" />
                      <stop offset="70%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#7F1D1D" />
                    </linearGradient>

                    {/* Window Glass Gradient */}
                    <linearGradient id="busGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1E293B" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#0F172A" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
                    </linearGradient>

                    {/* Glass Reflection Stripe */}
                    <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                      <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>

                    {/* Green Underglow */}
                    <radialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
                      <stop offset="60%" stopColor="#059669" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                    </radialGradient>

                    {/* Headlight Beam */}
                    <linearGradient id="headlightBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
                      <stop offset="30%" stopColor="#FDE047" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                    </linearGradient>

                    {/* Road Gradient */}
                    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0F172A" />
                      <stop offset="50%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>

                    {/* Scenic Hills Gradient */}
                    <linearGradient id="hillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B0813" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#1C0308" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Scenic Mountain Background Silhouette */}
                  <path
                    d="M30 180 Q100 120 180 150 T340 110 T480 145 T580 165 L580 270 L30 270 Z"
                    fill="url(#hillGrad)"
                  />
                  
                  {/* Decorative Scenic Trees */}
                  <g opacity="0.45" fill="#047857">
                    <polygon points="120,180 110,210 130,210" />
                    <polygon points="145,170 132,210 158,210" />
                    <polygon points="175,185 165,215 185,215" />
                    <polygon points="460,165 448,205 472,205" />
                    <polygon points="490,175 480,210 500,210" />
                  </g>

                  {/* Route Dash Lines & Location Waypoint */}
                  <path
                    d="M60 140 Q 200 70 380 90 T 540 120"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    opacity="0.6"
                    className="roadDash"
                  />
                  
                  {/* Location Waypoint Pin 1 */}
                  <g transform="translate(195, 75)">
                    <circle cx="0" cy="0" r="14" fill="#10B981" opacity="0.2" className="pulseGlow" />
                    <circle cx="0" cy="0" r="8" fill="#10B981" />
                    <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
                  </g>

                  {/* Location Waypoint Pin 2 */}
                  <g transform="translate(480, 105)">
                    <circle cx="0" cy="0" r="14" fill="#DC2626" opacity="0.2" className="pulseGlow" />
                    <circle cx="0" cy="0" r="8" fill="#DC2626" />
                    <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
                  </g>

                  {/* Floating Cloud */}
                  <g fill="#FFFFFF" opacity="0.18" style={{ animation: 'cloudDrift 12s ease-in-out infinite' }}>
                    <circle cx="100" cy="80" r="22" />
                    <circle cx="125" cy="72" r="28" />
                    <circle cx="155" cy="80" r="22" />
                    <rect x="100" y="78" width="55" height="24" rx="6" />
                  </g>

                  {/* Road Base Surface */}
                  <path
                    d="M10 270 L590 270 L550 315 L50 315 Z"
                    fill="url(#roadGrad)"
                    stroke="#334155"
                    strokeWidth="1"
                  />

                  {/* Animated Road Centerline Dashes */}
                  <line
                    x1="40"
                    y1="292"
                    x2="560"
                    y2="292"
                    stroke="#FDE047"
                    strokeWidth="3.5"
                    strokeDasharray="20 18"
                    strokeLinecap="round"
                    style={{ animation: 'roadDash 1.2s linear infinite' }}
                  />

                  {/* Green Underglow Effect Under Bus */}
                  <ellipse cx="300" cy="275" rx="220" ry="24" fill="url(#greenGlow)" />

                  {/* Headlight Beam Projecting Forward from Front Bus Left (Rightward) */}
                  <polygon
                    points="510,236 620,210 620,290 510,250"
                    fill="url(#headlightBeamGrad)"
                    style={{ animation: 'headlightBeam 2.5s ease-in-out infinite' }}
                  />

                  {/* ----------------- LUXURY VOLVO COACH CHASSIS ----------------- */}
                  {/* Main Aerodynamic Bus Body */}
                  <path
                    d="M 90 262 
                       L 85 175 
                       Q 88 152 110 148 
                       L 485 148 
                       Q 522 150 535 185 
                       L 540 248 
                       Q 538 262 520 264 
                       L 90 264 Z"
                    fill="url(#busBodyGrad)"
                    stroke="#7F1D1D"
                    strokeWidth="1.5"
                  />

                  {/* Aerodynamic Crimson Speed Swoosh / Accent Stripe */}
                  <path
                    d="M 100 220 
                       Q 280 210 460 225 
                       L 535 218 
                       L 538 234 
                       Q 450 238 270 230 
                       L 100 236 Z"
                    fill="#EF4444"
                    opacity="0.95"
                  />
                  <path
                    d="M 120 238 
                       Q 300 230 480 242 
                       L 535 238 
                       L 533 244 
                       Q 470 248 290 238 
                       L 120 244 Z"
                    fill="#10B981"
                    opacity="0.9"
                  />

                  {/* Panoramic Window Tinted Section */}
                  <path
                    d="M 115 158 
                       L 475 158 
                       Q 510 160 522 188 
                       L 525 208 
                       L 115 208 Z"
                    fill="url(#busGlassGrad)"
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />

                  {/* Window Dividers */}
                  <line x1="180" y1="158" x2="180" y2="208" stroke="#334155" strokeWidth="2.5" />
                  <line x1="245" y1="158" x2="245" y2="208" stroke="#334155" strokeWidth="2.5" />
                  <line x1="310" y1="158" x2="310" y2="208" stroke="#334155" strokeWidth="2.5" />
                  <line x1="375" y1="158" x2="375" y2="208" stroke="#334155" strokeWidth="2.5" />
                  <line x1="440" y1="158" x2="440" y2="208" stroke="#334155" strokeWidth="2.5" />

                  {/* Ambient Passenger / Seat Lighting inside Windows (Emerald Glow) */}
                  <rect x="125" y="180" width="40" height="8" rx="2" fill="#10B981" opacity="0.65" />
                  <rect x="190" y="180" width="40" height="8" rx="2" fill="#10B981" opacity="0.65" />
                  <rect x="255" y="180" width="40" height="8" rx="2" fill="#10B981" opacity="0.65" />
                  <rect x="320" y="180" width="40" height="8" rx="2" fill="#10B981" opacity="0.65" />
                  <rect x="385" y="180" width="40" height="8" rx="2" fill="#10B981" opacity="0.65" />

                  {/* Windshield Reflection Gloss Stripe */}
                  <polygon
                    points="450,158 520,165 490,208 420,208"
                    fill="url(#glassReflection)"
                  />

                  {/* LED Destination Board Screen */}
                  <rect x="445" y="162" width="70" height="14" rx="2" fill="#020617" stroke="#334155" strokeWidth="0.8" />
                  <text x="480" y="172" fill="#34D399" fontSize="7.5" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                    NEXTBUS EXP
                  </text>

                  {/* NextBus Brand Typography on Body */}
                  <text x="210" y="231" fill="#FFFFFF" fontSize="13" fontWeight="900" letterSpacing="2" fontFamily="sans-serif" opacity="0.95">
                    NEXTBUS
                  </text>
                  <circle cx="288" cy="227" r="3" fill="#10B981" />

                  {/* Front Headlight Cluster */}
                  <path
                    d="M 528 232 L 539 233 L 536 248 L 526 246 Z"
                    fill="#FEF08A"
                    stroke="#FBBF24"
                    strokeWidth="1"
                    filter="drop-shadow(0 0 6px #FDE047)"
                  />
                  {/* Subtle Green Foglamp */}
                  <circle cx="530" cy="254" r="3.5" fill="#34D399" filter="drop-shadow(0 0 4px #10B981)" />

                  {/* Rear Taillight Red Strip */}
                  <rect x="85" y="215" width="4" height="30" rx="1.5" fill="#EF4444" filter="drop-shadow(0 0 6px #DC2626)" />

                  {/* Wheel Arches & Multi-Axle Wheels (1 Front + 2 Rear Axles) */}
                  {/* Rear Dual Axles */}
                  {/* Wheel Arch 1 */}
                  <path d="M 130 264 A 24 24 0 0 1 178 264 Z" fill="#1C0308" />
                  {/* Wheel 1 (Tire + Rotating Alloy Rim) */}
                  <circle cx="154" cy="264" r="21" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                  <circle cx="154" cy="264" r="13" fill="#334155" stroke="#CBD5E1" strokeWidth="1.5" />
                  <g style={{ transformOrigin: '154px 264px', animation: 'wheelSpin 0.7s linear infinite' }}>
                    <line x1="145" y1="264" x2="163" y2="264" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                    <line x1="154" y1="255" x2="154" y2="273" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                    <line x1="147" y1="257" x2="161" y2="271" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="147" y1="271" x2="161" y2="257" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="154" cy="264" r="4.5" fill="#DC2626" />
                  </g>

                  {/* Wheel Arch 2 */}
                  <path d="M 188 264 A 24 24 0 0 1 236 264 Z" fill="#1C0308" />
                  {/* Wheel 2 (Tire + Rotating Alloy Rim) */}
                  <circle cx="212" cy="264" r="21" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                  <circle cx="212" cy="264" r="13" fill="#334155" stroke="#CBD5E1" strokeWidth="1.5" />
                  <g style={{ transformOrigin: '212px 264px', animation: 'wheelSpin 0.7s linear infinite' }}>
                    <line x1="203" y1="264" x2="221" y2="264" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                    <line x1="212" y1="255" x2="212" y2="273" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                    <line x1="205" y1="257" x2="219" y2="271" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="205" y1="271" x2="219" y2="257" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="212" cy="264" r="4.5" fill="#DC2626" />
                  </g>

                  {/* Front Axle */}
                  {/* Wheel Arch 3 */}
                  <path d="M 440 264 A 24 24 0 0 1 488 264 Z" fill="#1C0308" />
                  {/* Wheel 3 (Tire + Rotating Alloy Rim) */}
                  <circle cx="464" cy="264" r="21" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                  <circle cx="464" cy="264" r="13" fill="#334155" stroke="#CBD5E1" strokeWidth="1.5" />
                  <g style={{ transformOrigin: '464px 264px', animation: 'wheelSpin 0.7s linear infinite' }}>
                    <line x1="455" y1="264" x2="473" y2="264" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                    <line x1="464" y1="255" x2="464" y2="273" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
                    <line x1="457" y1="257" x2="471" y2="271" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="457" y1="271" x2="471" y2="257" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="464" cy="264" r="4.5" fill="#10B981" />
                  </g>
                </svg>
              </Box>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* ====================================================
          SEARCH FORM CONTAINER (Floating Modern Glass Card)
          ==================================================== */}
      <Container maxWidth="lg" sx={{ mb: 9 }}>
        <SearchForm 
          onLocationDetected={handleLocationUpdate} 
          initialSource={sourceCity} 
        />
      </Container>

      {/* ====================================================
          SECTION 1: GOVERNMENT BUSES (State Transport Carriers)
          ==================================================== */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        {/* Section Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.8,
              py: 0.5,
              borderRadius: 5,
              bgcolor: 'rgba(5, 150, 105, 0.1)',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              mb: 1.5,
            }}
          >
            <VerifiedIcon sx={{ fontSize: 16, color: '#059669' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Official State Transport Partnerships
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#0F172A',
              mb: 1.2,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              letterSpacing: '-0.025em',
            }}
          >
            Government Buses
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: '640px', mx: 'auto', fontWeight: 500, lineHeight: 1.6 }}
          >
            Official state-owned public transit services providing extremely affordable, reliable, and wide-reaching connectivity across all major interstate corridors.
          </Typography>
        </Box>

        {/* 4 Government Bus Cards */}
        <Grid container spacing={3.5}>
          {governmentBuses.map((bus, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '1px solid rgba(220, 38, 38, 0.12)',
                  bgcolor: '#FFFFFF',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 35px -10px rgba(59, 8, 19, 0.14), 0 0 0 1px rgba(220, 38, 38, 0.25)',
                    '& .busImage': {
                      transform: 'scale(1.06)',
                    },
                    '& .viewBtn': {
                      background: 'linear-gradient(135deg, #B91C1C 0%, #059669 100%)',
                    }
                  }
                }}
              >
                {/* Operator Header Image with Badge Overlay */}
                <Box sx={{ position: 'relative', height: 160, overflow: 'hidden', bgcolor: '#1E293B' }}>
                  <Box
                    component="img"
                    className="busImage"
                    src={bus.image}
                    alt={bus.name}
                    loading="lazy"
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(59, 8, 19, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%)',
                    }}
                  />
                  {/* Status Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(5, 150, 105, 0.9)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    {bus.status}
                  </Box>

                  {/* Rating Tag */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.4,
                      px: 1,
                      py: 0.3,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    <StarIcon sx={{ fontSize: 13, color: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                      {bus.rating}
                    </Typography>
                  </Box>
                </Box>

                {/* Card Body */}
                <Box sx={{ p: 2.8, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#3B0813', fontSize: '1.2rem', lineHeight: 1.2 }}>
                      {bus.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 32,
                        overflow: 'hidden',
                        lineHeight: 1.35,
                        mt: 0.5,
                      }}
                    >
                      {bus.fullname}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: '#F1F5F9' }} />

                  {/* Route & Level Info */}
                  <Box sx={{ mb: 2.5, flexGrow: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        color: '#DC2626',
                        mb: 0.3,
                      }}
                    >
                      Fleet & Comfort
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 750, color: '#0F172A', fontSize: '0.85rem', mb: 1.5 }}>
                      {bus.type}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        color: '#059669',
                        mb: 0.3,
                      }}
                    >
                      Popular Routes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {bus.routes}
                    </Typography>
                  </Box>

                  {/* CTA View Buses (Triggers exact same handleGovtBusSearch) */}
                  <Button
                    className="viewBtn"
                    variant="contained"
                    fullWidth
                    onClick={() => handleGovtBusSearch(bus)}
                    endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      fontWeight: 750,
                      py: 1.1,
                      borderRadius: 2.5,
                      background: 'linear-gradient(135deg, #DC2626 0%, #3B0813 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 18px rgba(220, 38, 38, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    View Buses
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ====================================================
          SECTION 2: WHAT SERVICES DO WE PROVIDE?
          ==================================================== */}
      <Box
        sx={{
          py: 9,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid rgba(220, 38, 38, 0.08)',
          borderBottom: '1px solid rgba(220, 38, 38, 0.08)',
          mb: 10,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.8,
                py: 0.5,
                borderRadius: 5,
                bgcolor: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.18)',
                mb: 1.5,
              }}
            >
              <DirectionsBusIcon sx={{ fontSize: 16, color: '#DC2626' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#DC2626', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                End-to-End Travel Features
              </Typography>
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: '#0F172A',
                mb: 1.2,
                fontSize: { xs: '1.8rem', md: '2.4rem' },
                letterSpacing: '-0.025em',
              }}
            >
              What Services Do We Provide?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto', fontWeight: 500 }}
            >
              We ensure a premium, secure, and hassle-free transit planning experience from seat selection to destination arrival.
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {services.map((serv, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  sx={{
                    p: 3.5,
                    height: '100%',
                    borderRadius: 3.5,
                    backgroundColor: '#FAFBFD',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    '&:hover': {
                      borderColor: '#DC2626',
                      boxShadow: '0 12px 28px -6px rgba(220, 38, 38, 0.12)',
                      transform: 'translateY(-5px)',
                      backgroundColor: '#FFFFFF',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(220, 38, 38, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      mb: 0.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    {serv.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.3 }}>
                    {serv.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: '0.85rem', fontWeight: 500 }}>
                    {serv.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ====================================================
          SECTION 3: OFFERS FOR YOU (Vouchers / Deals)
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
              bgcolor: 'rgba(5, 150, 105, 0.1)',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              mb: 1.5,
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 16, color: '#059669' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Special Discounts & Savings
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#0F172A',
              mb: 1.2,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              letterSpacing: '-0.025em',
            }}
          >
            Offers For You
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', fontWeight: 500 }}
          >
            Save big on your next journey with our exclusive deals and state-wide seasonal promotions.
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {offers.map((off, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  border: '1.5px dashed #CBD5E1',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#DC2626',
                    boxShadow: '0 10px 28px rgba(220, 38, 38, 0.08)',
                    transform: 'translateY(-3px)',
                  }
                }}
              >
                {/* Voucher Top Header Stripe */}
                <Box sx={{ bgcolor: off.color, height: 6, width: '100%' }} />
                
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 850, color: off.color, fontSize: '0.85rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      {off.title}
                    </Typography>
                    <Chip
                      label={off.discount}
                      size="small"
                      sx={{ height: 24, fontWeight: 800, bgcolor: `${off.color}15`, color: off.color, fontSize: '0.78rem', borderRadius: 1.5 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, height: 42, overflow: 'hidden', lineHeight: 1.45, fontSize: '0.85rem', fontWeight: 500 }}>
                    {off.desc}
                  </Typography>

                  <Divider sx={{ borderStyle: 'dashed', mb: 2.5, borderColor: '#E2E8F0' }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ p: 0.8, px: 2, border: '1px dashed #94A3B8', borderRadius: 2, bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalOfferIcon sx={{ fontSize: 15, color: '#DC2626' }} />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.08em', color: '#0F172A', fontSize: '0.9rem' }}>
                        {off.code}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleCopyCode(off.code)}
                      startIcon={<ContentCopyIcon sx={{ fontSize: '13px !important' }} />}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        borderColor: '#DC2626',
                        color: '#DC2626',
                        '&:hover': {
                          borderColor: '#B91C1C',
                          bgcolor: 'rgba(220, 38, 38, 0.06)',
                        },
                      }}
                    >
                      Use Offer
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ====================================================
          SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ)
          ==================================================== */}
      <Container maxWidth="md" sx={{ mb: 6 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#0F172A',
              mb: 1.2,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              letterSpacing: '-0.025em',
            }}
          >
            Frequently Asked Questions About Ticket Booking
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto', fontWeight: 500 }}
          >
            Got questions? We have compiled the answers to the most common queries regarding ticket reservations.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          {faqs.map((faq, idx) => (
            <Accordion
              key={idx}
              elevation={0}
              sx={{
                border: '1px solid #E2E8F0',
                mb: 1.5,
                borderRadius: '10px !important',
                bgcolor: '#FFFFFF',
                transition: 'all 0.25s ease',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  borderColor: '#DC2626',
                  boxShadow: '0 6px 16px rgba(220, 38, 38, 0.06)',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#DC2626' }} />}
                sx={{ fontWeight: 700, color: '#0F172A', py: 0.6 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 750, fontSize: '0.94rem', color: '#0F172A' }}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: '1px solid #F1F5F9', pt: 2, pb: 2.2, color: '#475569', lineHeight: 1.65, fontSize: '0.88rem', fontWeight: 500 }}>
                {faq.a}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Copy Toast Alert */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2.5, fontWeight: 700, bgcolor: '#059669', color: '#FFFFFF' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

