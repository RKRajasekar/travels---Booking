'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import PhoneIcon from '@mui/icons-material/Phone';
import MessageIcon from '@mui/icons-material/Message';
import SosIcon from '@mui/icons-material/Sos';
import CloseIcon from '@mui/icons-material/Close';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NearMeIcon from '@mui/icons-material/NearMe';
import KeyIcon from '@mui/icons-material/Key';

// Fix Leaflet marker icons bundling issues in nextjs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const cabIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Taxi Cab icon
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png', // Green/Start Pin
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const dropIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1483/1483336.png', // Destination flag/pin
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// Recenter map on coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function CabLiveMap({
  driverLocation = [13.0827, 80.2707],
  pickupCoords = [13.0827, 80.2707],
  dropCoords = [12.9716, 77.5946],
  speed = 45,
  heading = 0,
  remainingMinutes = 5,
  driverStatus = 'Driver is on the way to pickup location',
  otp = '4821',
  driver = {},
  vehicle = {},
  trip = {}
}) {
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  // Validate and sanitize coordinates
  const safeDriver = (Array.isArray(driverLocation) && !isNaN(driverLocation[0]) && !isNaN(driverLocation[1]))
    ? [Number(driverLocation[0]), Number(driverLocation[1])]
    : [13.0827, 80.2707];

  const safePickup = (Array.isArray(pickupCoords) && !isNaN(pickupCoords[0]) && !isNaN(pickupCoords[1]))
    ? [Number(pickupCoords[0]), Number(pickupCoords[1])]
    : [13.0827, 80.2707];

  const safeDrop = (Array.isArray(dropCoords) && !isNaN(dropCoords[0]) && !isNaN(dropCoords[1]))
    ? [Number(dropCoords[0]), Number(dropCoords[1])]
    : [12.9716, 77.5946];

  // Path from Pickup -> Drop
  const routePolyline = [safePickup, safeDriver, safeDrop];

  return (
    <Box sx={{ position: 'relative', width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)' }}>
      {/* Map Container */}
      <Box sx={{ height: { xs: 400, md: 520 }, width: '100%' }}>
        <MapContainer
          center={safeDriver}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap lat={safeDriver[0]} lng={safeDriver[1]} />

          {/* Pickup Pin */}
          <Marker position={safePickup} icon={pickupIcon}>
            <Popup>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>Pickup: {trip.pickup || 'Pickup Point'}</Typography>
              <Typography variant="caption">{trip.pickupAddress || 'Address'}</Typography>
            </Popup>
          </Marker>

          {/* Destination Pin */}
          <Marker position={safeDrop} icon={dropIcon}>
            <Popup>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>Drop: {trip.drop || 'Drop Point'}</Typography>
              <Typography variant="caption">{trip.dropAddress || 'Destination'}</Typography>
            </Popup>
          </Marker>

          {/* Route Path */}
          <Polyline positions={[safePickup, safeDrop]} color="#D97706" weight={5} opacity={0.6} dashArray="8, 8" />

          {/* Moving Live Cab Marker */}
          <Marker position={safeDriver} icon={cabIcon}>
            <Popup>
              <Box sx={{ p: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#D97706' }}>
                  {vehicle.model || 'Cab'} ({vehicle.number || ''})
                </Typography>
                <Typography variant="caption" display="block">Driver: {driver.name || 'Chauffeur'}</Typography>
                <Typography variant="caption" display="block">Speed: {speed} km/h</Typography>
                <Typography variant="caption" display="block">ETA: {remainingMinutes} mins</Typography>
              </Box>
            </Popup>
          </Marker>
        </MapContainer>
      </Box>

      {/* Floating Status & Driver Telemetry HUD */}
      <Card
        sx={{
          position: { xs: 'relative', md: 'absolute' },
          bottom: { md: 20 },
          left: { md: 20 },
          right: { md: 20 },
          p: 2.5,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3.5,
          border: '1px solid rgba(217, 119, 6, 0.25)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)',
          zIndex: 999,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Driver & Vehicle Info */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={driver.avatar}
                alt={driver.name}
                sx={{ width: 50, height: 50, border: '2px solid #D97706' }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                  {driver.name || 'Assigned Driver'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  {vehicle.model} • {vehicle.number}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
                  <Chip
                    icon={<KeyIcon sx={{ fontSize: '13px !important', color: '#B45309 !important' }} />}
                    label={`Start OTP: ${otp}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#92400E', fontWeight: 800, fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Live Status & ETA */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.4, borderRadius: 2, bgcolor: 'rgba(5, 150, 105, 0.12)', mb: 0.8 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#059669', animation: 'pulseGlow 1.5s infinite' }} />
                <Typography variant="caption" sx={{ color: '#047857', fontWeight: 800 }}>
                  {driverStatus}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' }, gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#D97706' }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {remainingMinutes > 0 ? `${remainingMinutes} mins` : 'Arrived'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SpeedIcon sx={{ fontSize: 18, color: '#D97706' }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {speed} km/h
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Action Buttons (Call, Chat, SOS) */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => setCallModalOpen(true)}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#0F172A',
                  fontWeight: 750,
                  fontSize: '0.82rem',
                  borderRadius: 2.5,
                  '&:hover': { borderColor: '#D97706', color: '#D97706', bgcolor: 'rgba(217, 119, 6, 0.05)' },
                }}
              >
                Call
              </Button>

              <Button
                variant="outlined"
                startIcon={<MessageIcon />}
                onClick={() => setChatModalOpen(true)}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#0F172A',
                  fontWeight: 750,
                  fontSize: '0.82rem',
                  borderRadius: 2.5,
                  '&:hover': { borderColor: '#D97706', color: '#D97706', bgcolor: 'rgba(217, 119, 6, 0.05)' },
                }}
              >
                Chat
              </Button>

              <Button
                variant="contained"
                startIcon={<SosIcon />}
                onClick={() => setSosModalOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  borderRadius: 2.5,
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
                }}
              >
                SOS
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Simulated Call Modal */}
      <Dialog open={callModalOpen} onClose={() => setCallModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Calling Chauffeur</Typography>
          <IconButton size="small" onClick={() => setCallModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Avatar src={driver.avatar} sx={{ width: 72, height: 72, mx: 'auto', mb: 2, border: '3px solid #059669' }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{driver.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{driver.phone || '+91 98401 23456'}</Typography>
          <Chip label="Connecting encrypted masked call..." color="success" size="small" />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2.5 }}>
          <Button variant="contained" color="error" onClick={() => setCallModalOpen(false)} sx={{ borderRadius: 3, px: 4 }}>
            End Call
          </Button>
        </DialogActions>
      </Dialog>

      {/* Simulated Chat Modal */}
      <Dialog open={chatModalOpen} onClose={() => setChatModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Chat with {driver.name}</Typography>
          <IconButton size="small" onClick={() => setChatModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F1F5F9', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 750, color: '#64748B' }}>Driver:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              &quot;Hello Sir/Madam, I am on the way to your pickup location. Reaching in ~{remainingMinutes} mins.&quot;
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(217, 119, 6, 0.1)', textAlign: 'right' }}>
            <Typography variant="caption" sx={{ fontWeight: 750, color: '#92400E' }}>You:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              &quot;Thank you! I will be waiting near the main gate.&quot;
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button fullWidth variant="contained" sx={{ bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' } }} onClick={() => setChatModalOpen(false)}>
            Send Quick Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Simulated Emergency SOS Modal */}
      <Dialog open={sosModalOpen} onClose={() => setSosModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#DC2626', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>24/7 Safety & SOS Helpline</Typography>
          <IconButton size="small" sx={{ color: '#FFFFFF' }} onClick={() => setSosModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1, color: '#0F172A' }}>
            Emergency Emergency Safety Response
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your live GPS location and trip details are securely shared with our 24/7 central emergency monitoring command center.
          </Typography>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B' }}>
              Police Helpline: 112 • NextBus Safety Desk: 1800-419-8899
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setSosModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
