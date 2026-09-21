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
  Divider,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import CancelIcon from '@mui/icons-material/Cancel';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const TERMS_SECTIONS = [
  {
    icon: <GavelIcon sx={{ color: '#DC2626' }} />,
    title: '1. General Booking Terms',
    content: `NextBus is an authorized technology platform that connects passengers with independent bus fleet operators and licensed cab chauffeurs. By completing a ticket reservation or cab booking on this platform, you agree to comply with these terms, government motor vehicle regulations, and operator specific conditions of carriage. All reservations are subject to vehicle availability and verified passenger details.`,
  },
  {
    icon: <DirectionsBusIcon sx={{ color: '#DC2626' }} />,
    title: '2. Bus Booking Rules & Boarding Protocols',
    content: `• Passengers must report to the assigned boarding point at least 15 minutes before the scheduled departure time.
• Valid government-issued photo identification (Aadhaar, Passport, Voter ID, Driving License) along with the NextBus m-ticket or QR pass must be presented upon boarding.
• For safety reasons, seats allocated specifically in women-only rows cannot be transferred to male passengers.
• Pets, hazardous goods, inflammable liquids, and contraband items are strictly prohibited inside passenger compartments.`,
  },
  {
    icon: <LocalTaxiIcon sx={{ color: '#059669' }} />,
    title: '3. Cab Booking & Chauffeur Services',
    content: `• On-demand and scheduled cab services calculate fares using base fare + per-kilometer rates + applicable tolls/parking fees.
• The 4-digit start-trip OTP must be shared with your chauffeur only once the chauffeur arrives at the designated pickup address and verifies your identity.
• Luggage capacity limits per vehicle category (Hatchback: 1 bag, Sedan: 2 bags, SUV/XL: 3-4 bags) must be respected to ensure vehicle safety.
• Waiting charges apply after the complimentary 5-minute waiting window at pickup.`,
  },
  {
    icon: <CancelIcon sx={{ color: '#EF4444' }} />,
    title: '4. Cancellation & Rescheduling Policy',
    content: `• Bus Bookings: Cancellations made more than 24 hours before departure are eligible for up to 90% refund. Cancellations between 12-24 hours are eligible for 75% refund. Cancellations within 4 hours of departure are non-refundable.
• Cab Bookings: Cancellations before chauffeur dispatch are 100% free of charge. Cancellations after a driver has arrived at the pickup location incur a standard driver compensation fee of ₹100.`,
  },
  {
    icon: <CurrencyRupeeIcon sx={{ color: '#059669' }} />,
    title: '5. Refunds & Payment Settlement',
    content: `All refunds are processed back to the original payment source (Credit/Debit Card, UPI, Net Banking) within 5 to 7 business days following approved cancellation. NextBus provides transparent invoice breakdowns showing base fare, GST (5% for passenger transit), toll charges, and applied promotional discounts.`,
  },
  {
    icon: <BadgeIcon sx={{ color: '#2563EB' }} />,
    title: '6. Travel Requirements & Passenger Conduct',
    content: `Passengers must conduct themselves in a courteous manner. Smoking, alcohol consumption, loud audio playback without headphones, or harassment of staff or co-passengers is grounds for immediate termination of transit without refund. Seat belts must be fastened where provided in intercity multi-axle coaches and cabs.`,
  },
  {
    icon: <BusinessIcon sx={{ color: '#7C3AED' }} />,
    title: '7. Operator Responsibilities & Service Commitments',
    content: `Verified travel operators on NextBus are responsible for maintaining vehicle roadworthiness, valid commercial permits, passenger insurance, air conditioning functionality, and trained licensed drivers. In the rare event of mechanical failure, the operator is obligated to arrange alternative transit or issue a full refund.`,
  },
  {
    icon: <WarningAmberIcon sx={{ color: '#D97706' }} />,
    title: '8. Limitation of Liability & Force Majeure',
    content: `NextBus acts as an intermediary booking facilitator. While we enforce strict quality standards, NextBus is not liable for travel delays caused by adverse weather conditions, highway traffic accidents, roadblocks, strikes, natural disasters, or technical breakdowns beyond reasonable control. In no event shall NextBus's aggregate liability exceed the total booking fare paid by the passenger.`,
  },
  {
    icon: <GavelIcon sx={{ color: '#0F172A' }} />,
    title: '9. Changes to Terms & Governing Jurisdiction',
    content: `NextBus reserves the right to modify these Terms of Service at any time. Continued use of our platform constitutes agreement to the updated terms. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu, India.`,
  },
];

export default function TermsPage() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 650 }}>
            Terms & Conditions
          </Typography>
        </Breadcrumbs>

        {/* Hero Header */}
        <Box sx={{ mb: 6, textAlign: { xs: 'left', md: 'center' } }}>
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
            <GavelIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Legal Agreements & Conditions of Carriage
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', mb: 1.5 }}>
            Terms & Conditions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680, mx: { md: 'auto' }, lineHeight: 1.6 }}>
            Please read these conditions carefully before booking bus coaches, airport transfers, or on-demand cabs on NextBus.
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1.5 }}>
            Version 2.4 • Effective September 2026
          </Typography>
        </Box>

        {/* Terms Sections */}
        <Grid container spacing={3}>
          {TERMS_SECTIONS.map((sec, idx) => (
            <Grid item xs={12} key={idx}>
              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  bgcolor: '#FFFFFF',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#CBD5E1' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {sec.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A' }}>
                    {sec.title}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5, borderColor: '#F1F5F9' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    lineHeight: 1.8,
                    fontSize: '0.94rem',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {sec.content}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
