'use client';

import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

export default function LoadingState({ message = 'Loading premium journeys...' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
      <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 550, mt: 1 }}>
        {message}
      </Typography>
    </Box>
  );
}

export function BusListSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', py: 2 }}>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, p: 3, bgcolor: '#FFFFFF', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, width: { xs: '100%', md: '300px' } }}>
            <Box>
              <Skeleton variant="text" width={80} height={28} />
              <Skeleton variant="text" width={60} height={20} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Skeleton variant="text" width={80} height={32} />
              <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1.5 }} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
