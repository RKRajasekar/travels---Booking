'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import VerifiedIcon from '@mui/icons-material/Verified';
import { getOperatorProfileDetails, updateOperatorProfileDetails } from '@/actions/travelOwner';

export default function TravelOwnerProfilePage() {
  const { data: session } = useSession();
  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: operatorName,
    ownerName: '',
    email: '',
    phone: '',
    logo: '',
    address: '',
    gstNumber: '',
    supportContact: '',
    establishedYear: '',
    fleetCount: '',
    rating: 4.8,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getOperatorProfileDetails(operatorName);
      if (res.success) {
        setProfile(res.data);
      }
      setLoading(false);
    }
    load();
  }, [operatorName]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateOperatorProfileDetails(operatorName, profile);
    setSaving(false);

    if (res.success) {
      setSnackbar({ open: true, message: 'Operator profile updated successfully!', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: res.error || 'Failed to save changes', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#DC2626' }} />
      </Box>
    );
  }

  return (
    <Box maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
          Operator Business Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 550 }}>
          Manage your travel agency company details, contact information, and business credentials.
        </Typography>
      </Box>

      <form onSubmit={handleSave}>
        <Grid container spacing={4}>
          {/* Left Column: Identity & Logo */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Avatar
                src={profile.logo}
                alt={profile.name}
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  border: '3px solid #DC2626',
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 850, color: '#0F172A', mb: 0.5 }}>
                {profile.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.6, mb: 2 }}>
                <VerifiedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#10B981' }}>
                  NextBus Verified Operator
                </Typography>
              </Box>

              <Chip
                label={`Rating: ⭐ ${profile.rating} / 5.0`}
                sx={{ fontWeight: 750, bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', mb: 3 }}
              />

              <Divider sx={{ mb: 2.5 }} />

              <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Fleet Size
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 750, color: '#0F172A' }}>
                    {profile.fleetCount || '45 Coaches & Cabs'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Operating Since
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 750, color: '#0F172A' }}>
                    {profile.establishedYear || '1975'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Account Role
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 750, color: '#DC2626' }}>
                    Travel Owner / Operator
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Right Column: Editable Details */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 3 }}>
                <BusinessIcon sx={{ color: '#DC2626', fontSize: 24 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#0F172A' }}>
                  Company & Tax Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Travel Company Name"
                    fullWidth
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Registered Owner / MD Name"
                    fullWidth
                    value={profile.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Official Business Email"
                    type="email"
                    fullWidth
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Primary Business Phone"
                    fullWidth
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="GSTIN / Business Registration"
                    fullWidth
                    value={profile.gstNumber}
                    onChange={(e) => handleChange('gstNumber', e.target.value)}
                    helperText="Government Tax & Operator Identification"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="24x7 Support Contact Number"
                    fullWidth
                    value={profile.supportContact}
                    onChange={(e) => handleChange('supportContact', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Company Headquarters Address"
                    multiline
                    rows={2}
                    fullWidth
                    value={profile.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Company Logo Image URL"
                    fullWidth
                    value={profile.logo}
                    onChange={(e) => handleChange('logo', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                      sx={{
                        bgcolor: '#DC2626',
                        color: '#fff',
                        fontWeight: 750,
                        px: 4,
                        py: 1.2,
                        borderRadius: 2.5,
                        boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                        '&:hover': { bgcolor: '#B91C1C' },
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
