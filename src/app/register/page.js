'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { RegisterSchema } from '@/lib/validations';
import { registerUser } from '@/actions/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const res = await registerUser(data);
    setLoading(false);

    if (res.success) {
      setSuccess(res.message || 'Registration successful!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <Grid container sx={{ minHeight: '85vh' }}>
      {/* Left side panel (hidden on mobile) */}
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.7)), url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <DirectionsBusIcon sx={{ fontSize: 44 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
            NextBus
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
          Your safety is our absolute focus.
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, pr: 6 }}>
          Register for a NextBus passenger profile to start tracking active buses, view custom luxury coaches, lock in booking selections with secure payments, and fetch dynamic verification passes.
        </Typography>
      </Grid>

      {/* Right side form */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: '#F9FAFB' }}>
        <Card sx={{ p: 5, width: '100%', maxWidth: 450, border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.04)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Join NextBus to manage routes and track schedules.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>Account Role</InputLabel>
                <Select label="Account Role" defaultValue="USER" {...register('role')}>
                  <MenuItem value="USER">Customer / Traveler</MenuItem>
                  <MenuItem value="TRAVEL_OWNER">Travel / Fleet Operator</MenuItem>
                  <MenuItem value="DRIVER">Driver</MenuItem>
                  <MenuItem value="ADMIN">System Admin</MenuItem>
                </Select>
                <FormHelperText>{errors.role?.message}</FormHelperText>
              </FormControl>

              <TextField
                label="Company / Operator Name (For Travel Owners)"
                variant="outlined"
                fullWidth
                placeholder="e.g. SRM Travels, Royal Express"
                {...register('companyName')}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </Box>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
}
