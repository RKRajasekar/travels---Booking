'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Card, Grid, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { LoginSchema } from '@/lib/validations';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const fillCredentials = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error || 'Invalid credentials');
    } else {
      if (callbackUrl && callbackUrl !== '/') {
        window.location.href = callbackUrl;
      } else if (data.email.toLowerCase().includes('travelowner') || data.email.toLowerCase().includes('owner')) {
        window.location.href = '/travel-owner/dashboard';
      } else if (data.email.toLowerCase() === 'ajairaja2004@gmail.com' || data.email.toLowerCase().includes('admin')) {
        window.location.href = '/admin';
      } else {
        window.location.href = callbackUrl;
      }
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
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.4), rgba(79, 70, 229, 0.7)), url("https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80")',
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
          Travel standard, travel premium.
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, pr: 6 }}>
          Plan your commute with our state-of-the-art bus network. Complete seats custom selection, trace coordinates in real-time, and download validation QR boarding passes instantly.
        </Typography>
      </Grid>

      {/* Right side form */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: '#F9FAFB' }}>
        <Card sx={{ p: 5, width: '100%', maxWidth: 450, border: '1px solid #E5E7EB', borderRadius: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.04)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to access your digital tickets and live trackers.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Quick Demo Access Badges */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F1F5F9', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
              Quick Demo Fill:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fillCredentials('kpn@travelowner.com', 'Kpn@1234')}
                sx={{ fontSize: '0.75rem', fontWeight: 700, py: 0.4, borderColor: '#DC2626', color: '#DC2626', '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)' } }}
              >
                🏢 KPN Operator
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fillCredentials('vrl@travelowner.com', 'Vrl@1234')}
                sx={{ fontSize: '0.75rem', fontWeight: 700, py: 0.4, borderColor: '#DC2626', color: '#DC2626', '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)' } }}
              >
                🏢 VRL Operator
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fillCredentials('ajairaja2004@gmail.com', 'R@jasekar2004')}
                sx={{ fontSize: '0.75rem', fontWeight: 700, py: 0.4, borderColor: '#2563EB', color: '#2563EB' }}
              >
                🛡️ Admin
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fillCredentials('user@nextbus.com', 'password123')}
                sx={{ fontSize: '0.75rem', fontWeight: 700, py: 0.4, borderColor: '#059669', color: '#059669' }}
              >
                👤 Customer
              </Button>
            </Box>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
