'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography } from '@mui/material';

// Fix Leaflet marker icons bundling issues in nextjs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Bus icon
  iconSize: [38, 38],
  iconAnchor: [19, 19], // Anchor at center
  popupAnchor: [0, -19],
});

const startIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png', // Pin
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const endIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1483/1483336.png', // Destination flag/pin
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Recenter map on coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// City coordinates registry matching seed routes (Indian cities)
const CITY_COORDS = {
  'Chennai': [13.0827, 80.2707],
  'Coimbatore': [11.0168, 76.9558],
  'Madurai': [9.9252, 78.1198],
  'Bangalore': [12.9716, 77.5946],
  'Salem': [11.6643, 78.1460],
  'Hosur': [12.7409, 77.8253],
  'Trichy': [10.7905, 78.7047],
  'Vellore': [12.9165, 79.1325],
};

export default function LiveMap({ latitude, longitude, speed, heading, sourceCity, destCity, stops }) {
  const startCoords = CITY_COORDS[sourceCity] || [13.0827, 80.2707];
  const endCoords = CITY_COORDS[destCity] || [11.0168, 76.9558];
  
  // Build full route coordinates path: Source -> Stops -> Destination
  const pathCoords = [startCoords];
  stops.forEach(stop => {
    if (CITY_COORDS[stop]) {
      pathCoords.push(CITY_COORDS[stop]);
    }
  });
  pathCoords.push(endCoords);

  return (
    <Box sx={{ height: '450px', width: '100%', borderRadius: 3, overflow: 'hidden', border: '1px solid #E5E7EB', position: 'relative' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={8}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Recenter Helper */}
        <RecenterMap lat={latitude} lng={longitude} />

        {/* Source Pin */}
        <Marker position={startCoords} icon={startIcon}>
          <Popup>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Source: {sourceCity}</Typography>
          </Popup>
        </Marker>

        {/* Destination Pin */}
        <Marker position={endCoords} icon={endIcon}>
          <Popup>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Destination: {destCity}</Typography>
          </Popup>
        </Marker>

        {/* Route Line */}
        <Polyline positions={pathCoords} color="#6366F1" weight={4} opacity={0.6} dashArray="8, 8" />

        {/* Moving Bus Marker */}
        <Marker position={[latitude, longitude]} icon={busIcon}>
          <Popup>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>NextBus Live Tracker</Typography>
              <Typography variant="caption" display="block">Speed: {speed} km/h</Typography>
              <Typography variant="caption" display="block">Heading: {heading}°</Typography>
            </Box>
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
}
