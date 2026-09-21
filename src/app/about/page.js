'use client';

import React from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Breadcrumbs,
  Button,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CORE_PILLARS = [
  {
    icon: <DirectionsBusIcon sx={{ fontSize: 32, color: '#DC2626' }} />,
    title: 'Intercity Bus Booking',
    desc: 'Connecting 80+ South Indian & national destinations with premium multi-axle Volvo 9600, AC Sleepers, and executive coaches. Interactive seat maps with real-time availability.',
  },
  {
    icon: <LocalTaxiIcon sx={{ fontSize: 32, color: '#059669' }} />,
    title: 'On-Demand Highway Cabs',
    desc: 'Comfort Sedans, Prime SUVs, and 7-seater Innova Crystas for one-way transfers, outstation highway tours, and prompt airport connections with transparent per-kilometer pricing.',
  },
  {
    icon: <BusinessIcon sx={{ fontSize: 32, color: '#2563EB' }} />,
    title: 'Verified Travel Operators',
    desc: 'Partnered with legendary transport pioneers like KPN Travels, VRL Travels, Parveen Travels, and Orange Tours to guarantee licensed, sanitized, and roadworthy vehicles.',
  },
  {
    icon: <GpsFixedIcon sx={{ fontSize: 32, color: '#D97706' }} />,
    title: 'Live GPS Telemetry Tracking',
    desc: 'Never stand guessing on roadside boarding spots. Track your assigned coach or cab in real-time with sub-second satellite coordinates, live speedometers, and ETA countdowns.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32, color: '#7C3AED' }} />,
    title: 'Bank-Grade Secure Payments',
    desc: 'PCI-DSS certified gateway integrations supporting UPI (GPay, PhonePe), Credit/Debit cards, and net banking with instant digital verification passes and automated refund processing.',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 32, color: '#0F172A' }} />,
    title: '24x7 Dedicated Passenger Care',
    desc: 'Round-the-clock telephone and live assistance for route inquiries, boarding point modifications, emergency breakdowns, and quick refunds.',
  },
];

export default function AboutUsPage() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 650 }}>
            About Us
          </Typography>
        </Breadcrumbs>

        {/* Hero Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.6,
              borderRadius: 5,
              bgcolor: 'rgba(220, 38, 38, 0.08)',
              color: '#DC2626',
              mb: 2,
            }}
          >
            <VerifiedIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              NextBus Platform Story
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', mb: 2 }}>
            Redefining Intercity Travel Across India
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: 'auto', lineHeight: 1.8, fontSize: '1.05rem' }}>
            NextBus was founded with a singular purpose: to bring dignity, precision, and world-class technology to highway transit.
            By unifying verified luxury bus fleets and vetted highway cab chauffeurs into a single real-time platform, we eliminate boarding uncertainty and empower seamless journeys.
          </Typography>
        </Box>

        {/* Big Numbers Grid */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {[
            { metric: '5,00,000+', label: 'Happy Travelers Moved' },
            { metric: '450+', label: 'Daily Verified Schedules' },
            { metric: '80+', label: 'Connected Cities & Hubs' },
            { metric: '99.2%', label: 'Punctual Departure Rating' },
          ].map((stat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card sx={{ p: 3.5, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#DC2626', mb: 0.5 }}>
                  {stat.metric}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Core Pillars Grid */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', mb: 1 }}>
              Why Millions Trust NextBus
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Engineered from the ground up for safety, convenience, and transparency.
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {CORE_PILLARS.map((pillar, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 3.5,
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#CBD5E1', transform: 'translateY(-2px)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                    }}
                  >
                    {pillar.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A', mb: 1.2 }}>
                    {pillar.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {pillar.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Travel Operator Ecosystem Spotlight */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            bgcolor: '#0B0F19',
            color: '#FFFFFF',
            mb: 8,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, borderRadius: 5, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                  Operator Empowerment
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 850, mb: 2, lineHeight: 1.2 }}>
                The NextBus Travel Owner Portal
              </Typography>
              <Typography variant="body1" sx={{ color: '#94A3B8', lineHeight: 1.7, mb: 3 }}>
                We believe in partnering directly with bus operators and taxi fleet owners. Through our dedicated Travel Owner Dashboard, fleet managers maintain real-time control over their vehicle availability, monitor seat occupancy, dispatch chauffeurs, and access instant daily performance metrics.
              </Typography>
              <Button
                component={Link}
                href="/travel-owner/dashboard"
                variant="contained"
                sx={{
                  bgcolor: '#DC2626',
                  color: '#fff',
                  fontWeight: 750,
                  px: 3.5,
                  py: 1.2,
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#B91C1C' },
                }}
              >
                Access Operator Portal
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', mb: 2 }}>
                  Operator Fleet Features:
                </Typography>
                {[
                  'Daily Live Availability Toggle (Instantly affects search)',
                  'Driver Rostering & GPS status verification',
                  'Dedicated route management & seat capacity control',
                  'Isolated operator revenue & booking audits',
                ].map((feature, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.88rem' }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', mb: 1.5 }}>
            Ready to experience effortless highway travel?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Book your journey on South India’s most dependable transit network.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              sx={{ bgcolor: '#DC2626', fontWeight: 750, px: 4, py: 1.2, borderRadius: 2.5, '&:hover': { bgcolor: '#B91C1C' } }}
            >
              Book a Bus Ticket
            </Button>
            <Button
              component={Link}
              href="/cab"
              variant="outlined"
              size="large"
              sx={{ borderColor: '#059669', color: '#059669', fontWeight: 750, px: 4, py: 1.2, borderRadius: 2.5, '&:hover': { bgcolor: 'rgba(5, 150, 105, 0.05)' } }}
            >
              Book an Outstation Cab
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
