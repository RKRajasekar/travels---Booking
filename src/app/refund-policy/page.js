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
  Button,
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShieldIcon from '@mui/icons-material/Shield';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const REFUND_TIERS = [
  {
    time: 'More than 24 hours before departure',
    busRefund: '90% refund of base fare',
    cabRefund: '100% free cancellation (before dispatch)',
    color: '#059669',
  },
  {
    time: '12 to 24 hours before departure',
    busRefund: '75% refund of base fare',
    cabRefund: '100% free cancellation (before dispatch)',
    color: '#2563EB',
  },
  {
    time: '4 to 12 hours before departure',
    busRefund: '50% refund of base fare',
    cabRefund: 'Standard cancellation charge of ₹100 applies if driver dispatched',
    color: '#D97706',
  },
  {
    time: 'Less than 4 hours before departure',
    busRefund: 'Non-refundable (Seats held exclusively)',
    cabRefund: 'Standard cancellation charge of ₹100 applies if driver at pickup',
    color: '#DC2626',
  },
];

export default function RefundPolicyPage() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748B', fontWeight: 600 }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 700 }}>
            Refund & Cancellation Policy
          </Typography>
        </Breadcrumbs>

        {/* Header Banner */}
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            mb: 5,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #140306 0%, #1E293B 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(220, 38, 38, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid #DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
              }}
            >
              <CurrencyRupeeIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography variant="overline" sx={{ color: '#FCA5A5', fontWeight: 800, letterSpacing: 1.2 }}>
              NextBus Fair Travel Guarantee
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            Cancellation & Refund Policy
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 800, lineHeight: 1.6 }}>
            We understand that travel plans change. NextBus provides transparent, hassle-free cancellation and automated refunds credited directly to your original payment method.
          </Typography>
        </Card>

        {/* Refund Tiers Table / Cards */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#0F172A' }}>
          Bus & Cab Cancellation Refund Schedule
        </Typography>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {REFUND_TIERS.map((tier, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  boxShadow: 'none',
                  borderTop: `4px solid ${tier.color}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <AccessTimeIcon sx={{ color: tier.color, fontSize: 20 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: tier.color, textTransform: 'uppercase' }}>
                    Window
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, minHeight: 40 }}>
                  {tier.time}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 700 }}>
                  Bus Ticket Refund
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1.5 }}>
                  {tier.busRefund}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 700 }}>
                  Cab Booking Refund
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                  {tier.cabRefund}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Processing Details */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ShieldIcon sx={{ color: '#059669', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Automated Payment Processing
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, mb: 2 }}>
                Approved refunds are initiated immediately by our automated payment gateway. Depending on your financial institution:
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, color: '#475569', fontSize: '0.88rem', lineHeight: 1.8 }}>
                <li><strong>UPI & Wallets:</strong> Credited within 2 to 24 hours.</li>
                <li><strong>Net Banking & Debit Cards:</strong> Credited within 3 to 5 business days.</li>
                <li><strong>Credit Cards:</strong> Credited within 5 to 7 business days or next statement cycle.</li>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SupportAgentIcon sx={{ color: '#DC2626', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Trip Disruption & Operator Cancellations
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, mb: 2 }}>
                In the rare event that a bus operator or cab chauffeur cancels a scheduled trip due to breakdown, weather, or operational reasons:
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, color: '#475569', fontSize: '0.88rem', lineHeight: 1.8 }}>
                <li>You receive a <strong>100% full refund</strong> with zero cancellation deductions.</li>
                <li>Our 24/7 Dispatch Desk provides priority alternate bus or cab reassignment options.</li>
                <li>An automated SMS alert and email receipt is dispatched instantly.</li>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Action Link */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            component={Link}
            href="/faq"
            variant="outlined"
            sx={{ mr: 2, borderColor: '#CBD5E1', color: '#1E293B', fontWeight: 700, borderRadius: 2 }}
          >
            Visit FAQ & Help Center
          </Button>
          <Button
            component={Link}
            href="/contact"
            variant="contained"
            sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' }, fontWeight: 700, borderRadius: 2 }}
          >
            Contact Grievance Desk
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
