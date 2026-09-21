'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Container,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import PeopleIcon from '@mui/icons-material/People';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/travel-owner/dashboard', icon: <DashboardIcon /> },
  { label: 'Buses', path: '/travel-owner/buses', icon: <DirectionsBusIcon /> },
  { label: 'Daily Availability', path: '/travel-owner/availability', icon: <EventAvailableIcon /> },
  { label: 'Trips', path: '/travel-owner/trips', icon: <AltRouteIcon /> },
  { label: 'Cabs / Cars', path: '/travel-owner/cabs', icon: <LocalTaxiIcon /> },
  { label: 'Drivers', path: '/travel-owner/drivers', icon: <PeopleIcon /> },
  { label: 'Bookings', path: '/travel-owner/bookings', icon: <BookOnlineIcon /> },
  { label: 'Operator Profile', path: '/travel-owner/profile', icon: <AccountCircleIcon /> },
];

export default function TravelOwnerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (authStatus === 'loading') {
    return <LoadingState message="Loading Travel Operator Workspace..." />;
  }

  // Access control: User must be authenticated and have role TRAVEL_OWNER or ADMIN
  const isAuthorized =
    authStatus === 'authenticated' &&
    (session?.user?.role === 'TRAVEL_OWNER' || session?.user?.role === 'ADMIN');

  if (authStatus === 'unauthenticated' || !isAuthorized) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          }}
        >
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: 3,
              bgcolor: 'rgba(220, 38, 38, 0.1)',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <DirectionsBusIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 850, color: '#0F172A', mb: 1.5 }}>
            Travel Operator Portal
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 4 }}>
            This workspace is dedicated to registered bus and cab fleet operators to manage vehicles, daily
            service availability, and customer bookings.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/login?callbackUrl=/travel-owner/dashboard"
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#DC2626',
                color: '#fff',
                fontWeight: 700,
                px: 3.5,
                py: 1.2,
                borderRadius: 2.5,
                '&:hover': { bgcolor: '#B91C1C' },
              }}
            >
              Sign In as Travel Owner
            </Button>
            <Button
              component={Link}
              href="/"
              variant="outlined"
              size="large"
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                px: 3,
                borderRadius: 2.5,
              }}
            >
              Back to Home
            </Button>
          </Box>

          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #F1F5F9' }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1, fontWeight: 700 }}>
              Demo Operator Credentials:
            </Typography>
            <Chip
              label="Email: kpn@travelowner.com | Password: Kpn@1234"
              variant="outlined"
              size="small"
              sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#0F172A' }}
            />
          </Box>
        </Paper>
      </Container>
    );
  }

  const operatorName = session?.user?.operatorName || 'KPN Travels';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0B0F19', color: '#F8FAFC' }}>
      {/* Operator Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.2,
            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
          }}
        >
          <DirectionsBusIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#FFFFFF', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {operatorName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <VerifiedIcon sx={{ fontSize: 13, color: '#10B981' }} />
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 750, fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              VERIFIED OPERATOR
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/travel-owner/dashboard' && pathname?.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.6 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.1,
                  px: 1.8,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  bgcolor: isActive ? '#DC2626' : 'transparent',
                  fontWeight: isActive ? 750 : 600,
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    bgcolor: isActive ? '#DC2626' : 'rgba(255, 255, 255, 0.06)',
                    color: '#FFFFFF',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isActive ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 750 : 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Footer / User Profile & Logout */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #DC2626 0%, #3B0813 100%)',
              fontWeight: 800,
              fontSize: '0.9rem',
            }}
          >
            {session?.user?.name?.[0]?.toUpperCase() || 'O'}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 750, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session?.user?.name || 'Operator Owner'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem', display: 'block' }}>
              Operator Role
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={handleSignOut}
          startIcon={<LogoutIcon />}
          sx={{
            color: '#F87171',
            borderColor: 'rgba(248, 113, 113, 0.25)',
            py: 0.8,
            fontWeight: 700,
            borderRadius: 2,
            '&:hover': {
              borderColor: '#EF4444',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Desktop Persistent Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid #E2E8F0',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Workspace Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {/* Top Header Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #E2E8F0',
            color: '#0F172A',
            zIndex: 1000,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 60, sm: 68 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { md: 'none' }, color: '#0F172A' }}
              >
                <MenuIcon />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 850, fontSize: { xs: '1rem', sm: '1.2rem' }, color: '#0F172A' }}>
                  Operator Workspace
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: { xs: 'none', sm: 'block' } }}>
                  Managing fleet for <strong style={{ color: '#DC2626' }}>{operatorName}</strong>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label="🟢 Live Sync Active"
                size="small"
                sx={{
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  border: '1px solid #A7F3D0',
                }}
              />
              <Button
                component={Link}
                href="/"
                target="_blank"
                size="small"
                variant="outlined"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: 2,
                  py: 0.6,
                  '&:hover': { borderColor: '#DC2626', color: '#DC2626' },
                }}
              >
                Customer Site
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Dynamic Route Content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
