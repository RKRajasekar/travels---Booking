'use client';

import React from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';

export default function ModeSwitcher({ activeMode = 'bus', onModeChange }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        p: '5px',
        borderRadius: '50px',
        bgcolor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Bus Booking Tab */}
      <ButtonBase
        onClick={() => onModeChange && onModeChange('bus')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 2.2, sm: 3 },
          py: 1,
          borderRadius: '40px',
          color: activeMode === 'bus' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
          background:
            activeMode === 'bus'
              ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
              : 'transparent',
          boxShadow:
            activeMode === 'bus'
              ? '0 4px 18px rgba(220, 38, 38, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
              : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: activeMode === 'bus' ? 'scale(1.02)' : 'scale(1)',
          '&:hover': {
            color: '#FFFFFF',
            bgcolor: activeMode === 'bus' ? undefined : 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <DirectionsBusIcon
          sx={{
            fontSize: { xs: 18, sm: 20 },
            color: activeMode === 'bus' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
          }}
        />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            letterSpacing: '0.02em',
          }}
        >
          Bus Booking
        </Typography>
      </ButtonBase>

      {/* Cab Booking Tab */}
      <ButtonBase
        onClick={() => onModeChange && onModeChange('cab')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 2.2, sm: 3 },
          py: 1,
          borderRadius: '40px',
          color: activeMode === 'cab' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
          background:
            activeMode === 'cab'
              ? 'linear-gradient(135deg, #D97706 0%, #B45309 60%, #92400E 100%)'
              : 'transparent',
          boxShadow:
            activeMode === 'cab'
              ? '0 4px 18px rgba(217, 119, 6, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
              : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: activeMode === 'cab' ? 'scale(1.02)' : 'scale(1)',
          '&:hover': {
            color: '#FFFFFF',
            bgcolor: activeMode === 'cab' ? undefined : 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <LocalTaxiIcon
          sx={{
            fontSize: { xs: 18, sm: 20 },
            color: activeMode === 'cab' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
          }}
        />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            letterSpacing: '0.02em',
          }}
        >
          Cab Booking
        </Typography>
      </ButtonBase>
    </Box>
  );
}
