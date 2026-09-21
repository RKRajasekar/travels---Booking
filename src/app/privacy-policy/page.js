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
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import PaymentIcon from '@mui/icons-material/Payment';
import CookieIcon from '@mui/icons-material/Cookie';
import GavelIcon from '@mui/icons-material/Gavel';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const SECTIONS = [
  {
    icon: <PrivacyTipIcon sx={{ color: '#DC2626' }} />,
    title: '1. Information We Collect',
    content: `When you use NextBus services to book bus tickets or hire cabs, we collect personal details necessary to fulfill your transit requirements. This includes your full name, mobile number, email address, age, gender (required for bus seat safety allocations), government identity numbers when mandated by interstate transport regulations, and pickup/destination coordinates.`,
  },
  {
    icon: <PaymentIcon sx={{ color: '#059669' }} />,
    title: '2. Booking & Payment Information',
    content: `Payment transactions on NextBus are processed through PCI-DSS certified payment gateways using 256-bit SSL encryption. We do NOT store your full credit card numbers, CVVs, or banking passwords on our servers. We store tokenized transaction identifiers, booking payment status, invoice amounts, and coupon codes applied for transaction validation and accounting purposes.`,
  },
  {
    icon: <LockIcon sx={{ color: '#2563EB' }} />,
    title: '3. How We Use Information',
    content: `We use your information exclusively to:
• Issue verifiable digital tickets, PNRs, and cab booking tokens.
• Send live bus GPS tracking links and driver dispatch updates via SMS and email.
• Enable travel operators and chauffeurs to verify passenger identity upon boarding.
• Provide customer care assistance, processing refunds, and resolving transit grievances.
• Prevent fraudulent transactions and enhance transit safety protocols.`,
  },
  {
    icon: <CookieIcon sx={{ color: '#D97706' }} />,
    title: '4. Cookies & Tracking Technologies',
    content: `NextBus uses essential session cookies, route preference caches, and analytical telemetry to remember your recent searches (such as frequent routes like Chennai - Bangalore), maintain authenticated login sessions, and optimize web app loading speeds. You can configure your browser to decline optional cookies without affecting core ticket booking functionality.`,
  },
  {
    icon: <SecurityIcon sx={{ color: '#7C3AED' }} />,
    title: '5. Third-Party Services & Operator Sharing',
    content: `To execute your journey, necessary passenger details (name, seat number, boarding point, contact phone) are shared with the respective verified Travel Operator (e.g. KPN Travels, VRL Travels, Parveen Travels) and assigned cab chauffeurs. We do not sell, rent, or trade your personal data to marketing third parties.`,
  },
  {
    icon: <GavelIcon sx={{ color: '#0F172A' }} />,
    title: '6. Data Security & Storage',
    content: `We implement strict organizational and technical safeguards, including encrypted database storage, token-based authentication (NextAuth), role-based privilege isolation, and continuous network monitoring. In the event of system updates or data archiving, your personal identifiers are retained only as long as required by transport tax regulations.`,
  },
  {
    icon: <PrivacyTipIcon sx={{ color: '#DC2626' }} />,
    title: '7. User Rights & Data Deletion',
    content: `You have the right to review your personal data, request corrections to profile records, and request account deactivation. To exercise your privacy rights or request data erasure under applicable data privacy laws, submit a request to privacy@nextbus.com.`,
  },
  {
    icon: <ContactSupportIcon sx={{ color: '#059669' }} />,
    title: '8. Grievance Officer & Contact Information',
    content: `In accordance with Information Technology rules, the Grievance Officer for NextBus Systems Inc. can be contacted at:
Grievance Officer: NextBus Data Privacy Desk
NextBus Systems Inc., Anna Salai Transit Hub, Chennai, Tamil Nadu - 600002
Email: privacy@nextbus.com | Phone: +91 44 4900 8800`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 650 }}>
            Privacy Policy
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
            <SecurityIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Your Data & Privacy Protected
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', mb: 1.5 }}>
            Privacy Policy
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: { md: 'auto' }, lineHeight: 1.6 }}>
            Learn how NextBus collects, protects, and handles your personal information when booking premium bus coaches and on-demand cabs.
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1.5 }}>
            Last Revised: September 2026 • Effective Worldwide
          </Typography>
        </Box>

        {/* Policy Sections */}
        <Grid container spacing={3}>
          {SECTIONS.map((sec, idx) => (
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
