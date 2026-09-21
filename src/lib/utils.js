import { format, differenceInMinutes } from 'date-fns';

export function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 8; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

export function calculateFare(price, seatsCount, discount = 0) {
  const priceINR = price * 84;
  const base = Math.round(priceINR * seatsCount);
  const tax = Math.round(base * 0.05); // 5% GST
  const fee = Math.round(seatsCount * 20); // Platform fee per seat
  const subtotal = base + tax + fee;
  const total = Math.max(0, subtotal - (discount || 0));
  return { base, tax, fee, total };
}

export function calculateETA(distanceKm, speedKmph) {
  if (speedKmph <= 5) {
    // Default fallback to 30km/h traffic speed if bus is stopped
    return Math.round((distanceKm / 30) * 60);
  }
  return Math.round((distanceKm / speedKmph) * 60);
}

export function formatDateTime(date, formatStr = 'dd MMM yyyy, hh:mm a') {
  if (!date) return '';
  return format(new Date(date), formatStr);
}

export function isGpsStale(timestamp) {
  if (!timestamp) return true;
  const diff = differenceInMinutes(new Date(), new Date(timestamp));
  return diff > 5;
}

export function getHeadingDirection(degree) {
  if (degree >= 337.5 || degree < 22.5) return 'North';
  if (degree >= 22.5 && degree < 67.5) return 'North-East';
  if (degree >= 67.5 && degree < 112.5) return 'East';
  if (degree >= 112.5 && degree < 157.5) return 'South-East';
  if (degree >= 157.5 && degree < 202.5) return 'South';
  if (degree >= 202.5 && degree < 247.5) return 'South-West';
  if (degree >= 247.5 && degree < 292.5) return 'West';
  return 'North-West';
}

export function getBusOperatorImage(operatorName) {
  const images = {
    'SRS Travels': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    'KPN Travels': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    'VRL Travels': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    'Parveen Travels': 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?auto=format&fit=crop&w=600&q=80',
    'Orange Tours & Travels': 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80',
    'IntrCity SmartBus': 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80',
    'KSRTC': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    'TNSTC': 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=600&q=80',
    'SETC': 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80',
    'YBM Travels': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    'SRM Travels': 'https://images.unsplash.com/photo-1494515426402-f1980ace7a9c?auto=format&fit=crop&w=600&q=80',
    'GreenLine Travels': 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=600&q=80',
    'Sri Krishna Travels': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    'Kerala Lines': 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?auto=format&fit=crop&w=600&q=80',
  };
  return images[operatorName] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80';
}
