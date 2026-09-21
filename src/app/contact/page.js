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
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  Paper,
} from '@mui/material';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import HeadsetIcon from '@mui/icons-material/Headset';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const SUPPORT_CHANNELS = [
  {
    icon: <HeadsetIcon sx={{ fontSize: 28, color: '#DC2626' }} />,
    title: 'Customer Transit Support',
    subtitle: 'For passenger booking, live bus tracking, and refund inquiries',
    phone: '+91 44 4900 8800',
    email: 'support@nextbus.com',
    hours: '24 hours a day, 7 days a week',
  },
  {
    icon: <BusinessIcon sx={{ fontSize: 28, color: '#059669' }} />,
    title: 'Travel Operator Support',
    subtitle: 'For bus fleet owners, cab operators & driver onboarding',
    phone: '+91 44 4900 8855',
    email: 'operators@nextbus.com',
    hours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  },
  {
    icon: <ContactSupportIcon sx={{ fontSize: 28, color: '#2563EB' }} />,
    title: 'Corporate & Business Travel',
    subtitle: 'Bulk employee commutes, event charters & GST invoicing',
    phone: '+91 44 4900 8899',
    email: 'corporate@nextbus.com',
    hours: 'Mon - Fri: 9:30 AM - 6:30 PM',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Customer Support',
    subject: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim() || formData.message.length < 10) errors.message = 'Please provide a detailed message (at least 10 characters)';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setSnackbar({
        open: true,
        message: 'Your inquiry has been received. Our team will contact you within 2 hours.',
        severity: 'success',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Customer Support',
        subject: '',
        message: '',
      });
    }, 1200);
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 650 }}>
            Contact & Support
          </Typography>
        </Breadcrumbs>

        {/* Hero Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
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
            <ContactSupportIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              We&apos;re Always Here To Help
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', mb: 1.5 }}>
            Contact NextBus Support
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto', lineHeight: 1.6 }}>
            Whether you are a traveler with a booking query or a fleet owner interested in partnering, our dedicated support desks are standing by.
          </Typography>
        </Box>

        {/* Channels Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {SUPPORT_CHANNELS.map((ch, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card
                sx={{
                  p: 3.5,
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  boxShadow: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {ch.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 850, color: '#0F172A', mb: 0.5 }}>
                  {ch.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2.5, display: 'block', lineHeight: 1.5 }}>
                  {ch.subtitle}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#059669' }} />
                    <Typography variant="body2" sx={{ fontWeight: 750, color: '#0F172A' }}>
                      {ch.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                    <Typography variant="body2" sx={{ fontWeight: 650, color: '#334155' }}>
                      {ch.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      {ch.hours}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contact Form & Office Info */}
        <Grid container spacing={4}>
          {/* Left: Contact Form */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="h5" sx={{ fontWeight: 850, color: '#0F172A', mb: 1 }}>
                Send Us a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fill in the details below and an operations specialist will respond shortly.
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2, fontWeight: 700 }}>
                  Thank you! Your ticket has been logged. An agent will respond shortly.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Your Name *"
                      fullWidth
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address *"
                      type="email"
                      fullWidth
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      fullWidth
                      placeholder="+91 98400 12345"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Inquiry Department"
                      fullWidth
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                    >
                      <MenuItem value="Customer Support">Customer Support (Bus & Cabs)</MenuItem>
                      <MenuItem value="Travel Operator Support">Travel Operator & Fleet Relations</MenuItem>
                      <MenuItem value="Corporate Travel">Corporate & Bulk Bookings</MenuItem>
                      <MenuItem value="Billing & Refunds">Billing & Refund Settlement</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Subject *"
                      fullWidth
                      placeholder="e.g. Inquiring about route from Chennai to Bangalore"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      error={!!formErrors.subject}
                      helperText={formErrors.subject}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Message Description *"
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Please explain your question or provide booking PNR if applicable..."
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      error={!!formErrors.message}
                      helperText={formErrors.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{
                        bgcolor: '#DC2626',
                        color: '#fff',
                        fontWeight: 750,
                        px: 4,
                        py: 1.3,
                        borderRadius: 2.5,
                        '&:hover': { bgcolor: '#B91C1C' },
                      }}
                    >
                      {submitting ? 'Sending Message...' : 'Submit Inquiry'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Card>
          </Grid>

          {/* Right: Office Headquarters & Map Card */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3.5,
                bgcolor: '#0B0F19',
                color: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>
                Headquarters
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                NextBus Systems Technologies Inc.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3 }}>
                <LocationOnIcon sx={{ color: '#DC2626', fontSize: 22, mt: 0.2 }} />
                <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.6 }}>
                  Tower B, 7th Floor, Transit Mobility Complex,<br />
                  Anna Salai, Mount Road,<br />
                  Chennai, Tamil Nadu - 600002, India
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <PhoneIcon sx={{ color: '#10B981', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  +91 44 4900 8800 / +91 44 4900 8801
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <EmailIcon sx={{ color: '#38BDF8', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  contact@nextbus.com
                </Typography>
              </Box>

              {/* Travel Operator Quick Link Card */}
              <Box sx={{ mt: 'auto', p: 2.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
                  Are you a Bus or Cab Fleet Owner?
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2, lineHeight: 1.5 }}>
                  Access our dedicated Travel Owner Dashboard to list routes, manage driver rosters, and control daily availability.
                </Typography>
                <Button
                  component={Link}
                  href="/travel-owner/dashboard"
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#DC2626', color: '#FCA5A5', fontWeight: 750, borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.1)' } }}
                >
                  Go to Travel Owner Hub ↗
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ fontWeight: 700, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
