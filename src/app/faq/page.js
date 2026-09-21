'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Breadcrumbs,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const CATEGORIES = [
  'All',
  'Bus Booking',
  'Cab Booking',
  'Payments',
  'Cancellation',
  'Refunds',
  'Tickets',
  'Travel',
  'Account',
  'Operators',
];

const FAQ_ITEMS = [
  {
    category: 'Bus Booking',
    question: 'How do I book a bus ticket on NextBus?',
    answer:
      'Booking a bus on NextBus is simple: on the home page, select your departure city, arrival destination, and travel date, then click "Search Buses". Browse available luxury coaches (Volvo 9600, AC Sleepers, Executive Seaters), pick your preferred seat using our interactive seat picker, enter passenger details, and complete payment securely.',
  },
  {
    category: 'Cab Booking',
    question: 'How do I book a cab or outstation car?',
    answer:
      'Navigate to the "Cabs" tab (/cab), enter your pickup location, drop location, travel date, pickup time, and number of passengers. Browse available verified chauffeurs and car models (Mini, Sedan, SUV, XL 7-seater, or Luxury), select your car, and confirm your booking. You will instantly receive a 6-digit booking reference and a 4-digit start-trip OTP.',
  },
  {
    category: 'Cancellation',
    question: 'Can I cancel my bus ticket or cab booking?',
    answer:
      'Yes, you can cancel tickets easily from the "My Tickets" or "My Cabs" section. Bus cancellations made more than 24 hours prior to scheduled departure receive up to a 90% refund. Cab bookings cancelled before driver dispatch are 100% free with no cancellation fee.',
  },
  {
    category: 'Travel',
    question: 'How does live GPS bus and cab tracking work?',
    answer:
      'Every bus and cab on NextBus is equipped with real-time GPS telemetry. Upon booking, you receive a dynamic tracking link in your confirmation and under the "Track" menu. You can watch your vehicle move along the road in real time with live speed, heading, and dynamic estimated time of arrival (ETA) countdown.',
  },
  {
    category: 'Operators',
    question: 'What happens if a bus becomes unavailable or service is cancelled by the operator?',
    answer:
      'Travel operators manage their daily fleet status directly through the Travel Owner portal. If an operator marks a bus as Unavailable or in Maintenance before customer booking, that bus immediately ceases to appear in search. If an already-booked trip is cancelled by the operator due to unforeseen circumstances, passengers are automatically notified and provided either free alternative coach re-booking or a 100% automatic refund.',
  },
  {
    category: 'Tickets',
    question: 'Can I change or modify my passenger or seat booking?',
    answer:
      'You can update passenger contact phone numbers and email addresses by contacting our 24x7 support desk or through the booking summary. Date and seat changes depend on operator availability; if seats are available on the desired date, our customer support team can assist with rescheduling.',
  },
  {
    category: 'Operators',
    question: 'How do I contact the travel operator or assigned chauffeur?',
    answer:
      'Operator and chauffeur phone numbers are listed directly on your booking pass and ticket summary. You can also view operator headquarters contact numbers on the "Contact Us" and "About Us" pages.',
  },
  {
    category: 'Payments',
    question: 'What payment methods are supported on NextBus?',
    answer:
      'We accept all major Credit and Debit Cards (Visa, MasterCard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm), Net Banking across 50+ Indian banks, and digital wallets. All transactions are protected by bank-grade 256-bit encryption.',
  },
  {
    category: 'Refunds',
    question: 'How long does it take for cancellation refunds to reflect?',
    answer:
      'Once a cancellation is confirmed on NextBus, the refund is initiated immediately. It typically takes 3 to 5 business days for net banking/UPI and 5 to 7 business days for credit/debit card accounts depending on your issuing bank.',
  },
  {
    category: 'Account',
    question: 'Do I need an account to book tickets?',
    answer:
      'You can book as a guest user using just your mobile number and email. However, creating a free account allows you to save frequent traveler profiles, view unified trip history across buses and cabs, download official tax GST invoices, and access one-click cancellations.',
  },
  {
    category: 'Travel',
    question: 'What baggage allowance is permitted on buses and cabs?',
    answer:
      'For buses, each passenger is allowed up to 2 medium suitcases or duffle bags (up to 20kg total) in the luggage hold, plus one small personal handbag in the cabin. For cabs, luggage capacity varies by vehicle category (Hatchback: 1 bag, Sedan: 2 bags, SUV/XL: 3-4 bags).',
  },
  {
    category: 'Operators',
    question: 'How do I register as a Travel / Fleet Owner on NextBus?',
    answer:
      'Fleet owners can register via our dedicated operator portal or register page by choosing "Travel / Operator Owner". Once verified by our verification team, operators receive credentials to access the Travel Owner Dashboard (/travel-owner/dashboard) to manage fleets, toggle daily availability, and monitor revenues.',
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState('panel-0');

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 650 }}>
            FAQs & Help Center
          </Typography>
        </Breadcrumbs>

        {/* Hero Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
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
            <HelpOutlineIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Frequently Asked Questions
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', mb: 1.5 }}>
            How can we help you?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            Find clear answers to common questions regarding bus reservations, cab tracking, refunds, and operator fleet management.
          </Typography>

          {/* Search Box */}
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search your question (e.g. cancel, cab tracking, refund)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#DC2626' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#DC2626' },
                },
              }}
            />
          </Box>
        </Box>

        {/* Category Pills */}
        <Paper sx={{ mb: 4, borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', bgcolor: '#fff' }}>
          <Tabs
            value={selectedCategory}
            onChange={(e, val) => setSelectedCategory(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              py: 0.5,
              '& .MuiTab-root': { fontWeight: 750, fontSize: '0.86rem', minHeight: 48 },
              '& .Mui-selected': { color: '#DC2626' },
              '& .MuiTabs-indicator': { bgcolor: '#DC2626' },
            }}
          >
            {CATEGORIES.map((cat) => (
              <Tab key={cat} value={cat} label={cat} />
            ))}
          </Tabs>
        </Paper>

        {/* FAQ Accordions List */}
        {filteredFaqs.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748B', mb: 1 }}>
              No answers found matching &ldquo;{searchQuery}&rdquo;
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try searching with other keywords or browse our categories.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              sx={{ borderColor: '#DC2626', color: '#DC2626', fontWeight: 700 }}
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 6 }}>
            {filteredFaqs.map((faq, idx) => {
              const panelId = `panel-${idx}`;
              return (
                <Accordion
                  key={idx}
                  expanded={expanded === panelId}
                  onChange={handleAccordionChange(panelId)}
                  sx={{
                    borderRadius: '14px !important',
                    border: '1px solid #E2E8F0',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                    '&.Mui-expanded': {
                      borderColor: '#DC2626',
                      boxShadow: '0 6px 20px rgba(220, 38, 38, 0.05)',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#DC2626' }} />}
                    sx={{ px: 3, py: 1.2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={faq.category}
                        size="small"
                        sx={{
                          fontWeight: 750,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(220, 38, 38, 0.06)',
                          color: '#DC2626',
                        }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {faq.question}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.8, fontSize: '0.94rem' }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}

        {/* Still Need Help Banner */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 4,
            bgcolor: '#140306',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: 'rgba(220, 38, 38, 0.2)',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ContactSupportIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 850, mb: 0.5 }}>
                Still have questions?
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Our 24x7 customer support desk is ready to help you with booking, tracking, or refunds.
              </Typography>
            </Box>
          </Box>

          <Button
            component={Link}
            href="/contact"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#DC2626',
              color: '#fff',
              fontWeight: 750,
              px: 3.5,
              py: 1.2,
              borderRadius: 2.5,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Contact Support Team
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
