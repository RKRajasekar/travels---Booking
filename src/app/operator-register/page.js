'use client';

import React from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Card,
  Grid,
  Button,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SpeedIcon from '@mui/icons-material/Speed';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedIcon from '@mui/icons-material/Verified';

const OPERATOR_PERKS = [
  {
    icon: <SpeedIcon sx={{ fontSize: 32, color: '#DC2626' }} />,
    title: 'Real-Time Availability Control',
    description: 'Toggle single or multi-coach availability in one click. Changes reflect instantly on customer searches.',
  },
  {
    icon: <MonetizationOnIcon sx={{ fontSize: 32, color: '#059669' }} />,
    title: 'Zero Latency Payouts',
    description: 'Direct daily settlement into your commercial banking account with comprehensive GST compliant invoicing.',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 32, color: '#2563EB' }} />,
    title: 'Unified Bus & Cab Fleet Management',
    description: 'Manage coaches, car rentals, and chauffeur assignments from one cohesive operations cockpit.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 32, color: '#7C3AED' }} />,
    title: 'Verified Customer Base',
    description: 'Access millions of verified commuters across Southern & National trunk routes with zero commission leakages.',
  },
];

export default function OperatorRegisterPage() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: 3,
              bgcolor: 'rgba(220, 38, 38, 0.1)',
              color: '#DC2626',
              fontWeight: 800,
              fontSize: '0.85rem',
              mb: 2,
            }}
          >
            <DirectionsBusIcon sx={{ fontSize: 18 }} />
            Operator Partnership Program
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', mb: 2, fontSize: { xs: '2rem', md: '2.8rem' } }}>
            Power Your Travel Fleet With NextBus
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 720, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Join premier operators like KPN Travels, VRL, and Parveen Travels. Manage daily coach schedules, live seat allocations, and driver rosters with enterprise-grade tools.
          </Typography>
        </Box>

        {/* Perks Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {OPERATOR_PERKS.map((perk, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {perk.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {perk.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                  {perk.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Card */}
        <Card
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #140306 0%, #1E293B 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(220, 38, 38, 0.2)',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>
            Ready to Onboard Your Fleet?
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 600, mx: 'auto', mb: 4 }}>
            Sign up in under 2 minutes. Select &quot;Travel / Fleet Operator&quot; during registration to immediately access your Operator Workspace.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              Create Operator Account
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2.5,
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Sign In to Operator Portal
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
