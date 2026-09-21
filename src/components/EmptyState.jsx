'use client';

import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function EmptyState({ title = 'No results found', message = 'Try relaxing your filters or check for another travel date.', actionLabel, onAction }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', p: 3 }}>
      <Card sx={{ maxWidth: 450, p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderRadius: 3, border: '1px dashed #D1D5DB', boxShadow: 'none' }}>
        <ErrorOutlineIcon sx={{ fontSize: 56, color: 'text.secondary' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {message}
        </Typography>
        {actionLabel && onAction && (
          <Button variant="contained" color="primary" onClick={onAction} sx={{ px: 4 }}>
            {actionLabel}
          </Button>
        )}
      </Card>
    </Box>
  );
}
