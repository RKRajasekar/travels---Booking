'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HelpSupportPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/faq');
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: '#DC2626' }} />
      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
        Redirecting to Help & FAQ Center...
      </Typography>
    </Box>
  );
}
