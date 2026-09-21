'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleSignOut = () => {
    handleMenuClose();
    signOut({ callbackUrl: '/' });
  };

  const menuItems = [
    { label: '🚌 Buses', path: '/' },
    { label: '🚕 Cabs', path: '/cab' },
    ...(session
      ? [
          { label: 'My Tickets', path: '/my-tickets' },
          { label: 'My Cabs', path: '/my-cab-bookings' },
        ]
      : [{ label: 'My Cabs', path: '/my-cab-bookings' }]),
    ...(session?.user?.role === 'ADMIN' ? [{ label: 'Admin Dashboard', path: '/admin' }] : []),
    ...(session?.user?.role === 'TRAVEL_OWNER' ? [{ label: '🏢 Operator Portal', path: '/travel-owner/dashboard' }] : []),
    ...(session?.user?.role === 'DRIVER' ? [{ label: 'Driver Dashboard', path: '/driver' }] : []),
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(220, 38, 38, 0.1)',
        boxShadow: '0 4px 20px -5px rgba(59, 8, 19, 0.06)',
        color: '#0F172A',
        transition: 'all 0.3s ease',
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 72 } }}>
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.2,
                background: 'linear-gradient(135deg, #3B0813 0%, #DC2626 70%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
                color: '#ffffff',
              }}
            >
              <DirectionsBusIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 900,
                  fontSize: '1.4rem',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(120deg, #2A050C 0%, #DC2626 65%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                NextBus
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#059669',
                  lineHeight: 1,
                  mt: 0.2,
                }}
              >
                Premium Transit
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  href={item.path}
                  sx={{
                    color: '#334155',
                    fontWeight: 650,
                    fontSize: '0.92rem',
                    px: 2,
                    py: 0.8,
                    borderRadius: 2,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#DC2626',
                      backgroundColor: 'rgba(220, 38, 38, 0.05)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {session ? (
                  <Box>
                    <IconButton
                      onClick={handleMenuOpen}
                      sx={{
                        p: 0.4,
                        border: '2px solid #DC2626',
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          background: 'linear-gradient(135deg, #3B0813 0%, #DC2626 100%)',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                        }}
                      >
                        {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      PaperProps={{
                        sx: {
                          borderRadius: 3,
                          mt: 1.2,
                          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
                          border: '1px solid #F1F5F9',
                          minWidth: 190,
                        },
                      }}
                    >
                      <MenuItem disabled sx={{ fontWeight: 700, color: '#0F172A', opacity: 0.9, fontSize: '0.85rem' }}>
                        Hi, {session.user.name} ({session.user.role})
                      </MenuItem>
                      <MenuItem component={Link} href="/my-tickets" onClick={handleMenuClose} sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        My Bus Tickets
                      </MenuItem>
                      <MenuItem component={Link} href="/my-cab-bookings" onClick={handleMenuClose} sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        My Cab Bookings
                      </MenuItem>
                      {session.user.role === 'TRAVEL_OWNER' && (
                        <MenuItem component={Link} href="/travel-owner/dashboard" onClick={handleMenuClose} sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#DC2626' }}>
                          🏢 Operator Dashboard
                        </MenuItem>
                      )}
                      <MenuItem onClick={handleSignOut} sx={{ color: '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>
                        Sign Out
                      </MenuItem>
                    </Menu>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      component={Link}
                      href="/login"
                      variant="text"
                      sx={{
                        color: '#0F172A',
                        fontWeight: 700,
                        px: 2.2,
                        borderRadius: 2,
                        '&:hover': {
                          color: '#DC2626',
                          backgroundColor: 'rgba(220, 38, 38, 0.05)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      component={Link}
                      href="/register"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        px: 3,
                        py: 0.9,
                        borderRadius: 2,
                        boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #B91C1C 0%, #781D2D 100%)',
                          boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
                        },
                      }}
                    >
                      Register
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {session && (
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    p: 0.4,
                    border: '2px solid #DC2626',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      background: 'linear-gradient(135deg, #3B0813 0%, #DC2626 100%)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              )}
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(220, 38, 38, 0.06)',
                  color: '#DC2626',
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 280, pt: 3 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List sx={{ px: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pb: 2.5, mb: 2, borderBottom: '1px solid #F1F5F9' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #3B0813 0%, #DC2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <DirectionsBusIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.25rem' }}>
                NextBus
              </Typography>
            </Box>

            {menuItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    py: 1.2,
                    '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.08)', color: '#DC2626' },
                  }}
                >
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 650, fontSize: '0.95rem' }} />
                </ListItemButton>
              </ListItem>
            ))}

            {session ? (
              <ListItemButton
                onClick={handleSignOut}
                sx={{
                  borderRadius: 2,
                  mt: 3,
                  bgcolor: 'rgba(220, 38, 38, 0.08)',
                  color: '#DC2626',
                  '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.15)' },
                }}
              >
                <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3 }}>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: '#DC2626',
                    color: '#DC2626',
                    fontWeight: 700,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': { borderColor: '#B91C1C', bgcolor: 'rgba(220, 38, 38, 0.05)' },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #DC2626 0%, #3B0813 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}

