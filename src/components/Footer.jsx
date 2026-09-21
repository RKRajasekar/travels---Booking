'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Container, Grid, Typography, IconButton, TextField, Button } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput && emailInput.includes('@')) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const companyLinks = [
    { label: 'About Us', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'Travel Blog', path: '/blog' },
    { label: 'Operator Portal', path: '/travel-owner/dashboard' },
  ];

  const supportLinks = [
    { label: 'Contact Us', path: '/contact' },
    { label: 'FAQs & Help', path: '/faq' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
  ];

  return (
    <Box
      sx={{
        bgcolor: '#140306',
        color: '#94A3B8',
        pt: 8,
        pb: 5,
        borderTop: '1px solid rgba(220, 38, 38, 0.15)',
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Logo & About */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #DC2626 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <DirectionsBusIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  fontSize: '1.35rem',
                }}
              >
                NextBus
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, pr: { md: 4 }, lineHeight: 1.6, color: '#94A3B8' }}>
              NextBus is the leading bus ticket booking platform offering premium journeys, real-time live GPS tracking, and secure seat choices on popular routes.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <FacebookIcon />, link: 'https://facebook.com', label: 'Facebook' },
                { icon: <TwitterIcon />, link: 'https://twitter.com', label: 'Twitter' },
                { icon: <InstagramIcon />, link: 'https://instagram.com', label: 'Instagram' },
                { icon: <LinkedInIcon />, link: 'https://linkedin.com', label: 'LinkedIn' },
              ].map((item, index) => (
                <IconButton
                  key={index}
                  size="small"
                  component="a"
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  sx={{
                    color: '#94A3B8',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#FFFFFF', bgcolor: '#DC2626', transform: 'translateY(-2px)' },
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2.5}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.82rem' }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {companyLinks.map((item) => (
                <Typography
                  key={item.label}
                  variant="body2"
                  component={Link}
                  href={item.path}
                  sx={{ textDecoration: 'none', color: '#94A3B8', transition: 'color 0.2s', '&:hover': { color: '#FCA5A5' } }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Customer Support */}
          <Grid item xs={6} md={2.5}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.82rem' }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {supportLinks.map((item) => (
                <Typography
                  key={item.label}
                  variant="body2"
                  component={Link}
                  href={item.path}
                  sx={{ textDecoration: 'none', color: '#94A3B8', transition: 'color 0.2s', '&:hover': { color: '#FCA5A5' } }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.82rem' }}>
              Get Special Offers
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#94A3B8', lineHeight: 1.5 }}>
              Subscribe to get details on premium routes and special travel discounts.
            </Typography>
            {subscribed ? (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#6EE7B7' }}>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  ✓ Subscribed! You will receive exclusive discounts.
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Enter email"
                  fullWidth
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 2,
                    input: { color: '#FFFFFF', fontSize: '0.88rem' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                      '&:hover fieldset': { borderColor: '#DC2626' },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    px: 2.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    fontWeight: 700,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #B91C1C 0%, #059669 100%)',
                    },
                  }}
                >
                  Join
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Divider & Copyright */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            pt: 3.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            © {new Date().getFullYear()} NextBus Systems Inc. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Typography variant="caption" component={Link} href="/privacy-policy" sx={{ color: '#64748B', textDecoration: 'none', '&:hover': { color: '#FCA5A5' } }}>
              Privacy Policy
            </Typography>
            <Typography variant="caption" component={Link} href="/terms" sx={{ color: '#64748B', textDecoration: 'none', '&:hover': { color: '#FCA5A5' } }}>
              Terms of Use
            </Typography>
            <Typography variant="caption" component={Link} href="/travel-owner/dashboard" sx={{ color: '#DC2626', fontWeight: 700, textDecoration: 'none', '&:hover': { color: '#F87171' } }}>
              Operator Portal ↗
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
