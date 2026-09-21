'use server';

import { prisma } from '@/lib/prisma';
import { SearchSchema } from '@/lib/validations';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import {
  ALL_CITIES,
  getCanonicalCity,
  getCityState,
  calculateDistance,
  formatDuration,
  findStops
} from '@/lib/cities';
import { isBusAvailable } from '@/lib/operatorStore';

// Comprehensive Bus Inventory Templates covering Volvo, Luxury, Premium, and Commercial fleets
const OPERATORS = [
  // --- VOLVO 9600 & MULTI-AXLE LUXURY SLEEPER (LUXURY CLASS) ---
  {
    operatorName: 'VRL Travels',
    modelName: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.7,
    reviewsCount: 2840,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'Orange Tours & Travels',
    modelName: 'Volvo 9600 Multi-Axle Luxury Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.8,
    reviewsCount: 3120,
    image: 'https://images.unsplash.com/photo-1562620644-66bd4786321c?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'IntrCity SmartBus',
    modelName: 'Volvo 9600 AC Sleeper with SmartLounge (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.7,
    reviewsCount: 1890,
    image: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'Parveen Travels',
    modelName: 'Volvo 9600 B11R Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.6,
    reviewsCount: 2450,
    image: 'https://images.unsplash.com/photo-1563865436874-9aef32095ffd?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'YBM Travels',
    modelName: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.6,
    reviewsCount: 1740,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'SRM Travels',
    modelName: 'Volvo 9600 I-Shift Multi-Axle Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.5,
    reviewsCount: 1950,
    image: 'https://images.unsplash.com/photo-1494515426402-f1980ace7a9c?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'Sri Krishna Travels',
    modelName: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.6,
    reviewsCount: 1340,
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'GreenLine Travels',
    modelName: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.7,
    reviewsCount: 1530,
    image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=600&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'Kerala Lines',
    modelName: 'Volvo 9600 Luxury Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.8,
    reviewsCount: 1480,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'KSRTC',
    modelName: 'Ambari Dream Class (Volvo 9600 Multi-Axle AC Sleeper)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.8,
    reviewsCount: 4200,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'KSRTC',
    modelName: 'Airavat Club Class (Volvo Multi-Axle AC Sleeper)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.7,
    reviewsCount: 3800,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },

  // --- VOLVO B11R & 9400 MULTI-AXLE SLEEPER & SEMI-SLEEPER ---
  {
    operatorName: 'KPN Travels',
    modelName: 'Volvo 9400 Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.5,
    reviewsCount: 2300,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'SRS Travels',
    modelName: 'Volvo B11R Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.4,
    reviewsCount: 1820,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'Sharma Transports',
    modelName: 'Volvo Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.5,
    reviewsCount: 1150,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'Kallada Travels',
    modelName: 'Volvo G9 Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.4,
    reviewsCount: 1620,
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'National Travels',
    modelName: 'Volvo B11R Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.3,
    reviewsCount: 980,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'Alhind Tours & Travels',
    modelName: 'Volvo Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.6,
    reviewsCount: 1670,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'Jabbar Travels',
    modelName: 'Volvo Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.4,
    reviewsCount: 920,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'Hebron Transports',
    modelName: 'Volvo Club Class Multi-Axle Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.5,
    reviewsCount: 890,
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'Seabird Tourist',
    modelName: 'Volvo B11R Multi-Axle AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.4,
    reviewsCount: 1110,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },

  // --- VOLVO AC SEATER & MULTI-AXLE SEMI-SLEEPER ---
  {
    operatorName: 'VRL Travels',
    modelName: 'Volvo Multi-Axle Semi-Sleeper AC (2+2)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.6,
    reviewsCount: 2210,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'Parveen Travels',
    modelName: 'Volvo B11R Multi-Axle AC Seater (2+2)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.5,
    reviewsCount: 1980,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'KPN Travels',
    modelName: 'Volvo Executive AC Seater (2+2)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: false,
    rating: 4.4,
    reviewsCount: 1840,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'Orange Tours & Travels',
    modelName: 'Volvo Multi-Axle AC Seater (2+2)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.6,
    reviewsCount: 2050,
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'SRS Travels',
    modelName: 'Volvo Multi-Axle AC Seater (2+2)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.3,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'KSRTC',
    modelName: 'Airavat Diamond Class (Volvo AC Multi-Axle Seater)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.7,
    reviewsCount: 3450,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'APSRTC',
    modelName: 'Amaravathi Volvo Multi-Axle AC Seater',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.5,
    reviewsCount: 2600,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'TSRTC',
    modelName: 'Garuda Plus Volvo Multi-Axle AC Seater',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: true,
    isMultiAxle: true,
    rating: 4.4,
    reviewsCount: 1920,
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: false }
  },
  {
    operatorName: 'SETC',
    modelName: 'Airavat Partner AC Seater / Sleeper Coach',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 36,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.4,
    reviewsCount: 1240,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },

  // --- LUXURY NON-VOLVO SLEEPERS & COMMERCIAL COACHES ---
  {
    operatorName: 'Parveen Travels',
    modelName: 'Mercedes-Benz Multi-Axle Luxury Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: false,
    isMultiAxle: true,
    rating: 4.7,
    reviewsCount: 1780,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'Orange Tours & Travels',
    modelName: 'Business Class BharatBenz AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: false,
    isMultiAxle: true,
    rating: 4.7,
    reviewsCount: 1650,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'IntrCity SmartBus',
    modelName: 'Smart AC Sleeper Lounge Coach (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Luxury',
    seats: 30,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.6,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: true, snacks: true }
  },
  {
    operatorName: 'Rathimeena Travels',
    modelName: 'Executive AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Premium',
    seats: 30,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.4,
    reviewsCount: 1410,
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'Conti Travels',
    modelName: 'Premium AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Premium',
    seats: 30,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.5,
    reviewsCount: 960,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'A1 Travels',
    modelName: 'Premium AC Sleeper (2+1)',
    type: 'AC_SLEEPER',
    busClass: 'Premium',
    seats: 30,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.4,
    reviewsCount: 880,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: true, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'Rathimeena Travels',
    modelName: 'Executive 2+2 AC Seater Coach',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 36,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.3,
    reviewsCount: 1100,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'Alagappa Travels',
    modelName: 'Deluxe AC Seater (2+2)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 40,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.2,
    reviewsCount: 750,
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: false, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'KPN Travels',
    modelName: 'Premium 2+1 Non-AC Sleeper',
    type: 'SLEEPER',
    busClass: 'Economy',
    seats: 30,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.3,
    reviewsCount: 1200,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: true, waterBottle: false, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'SRS Travels',
    modelName: 'Executive 2+1 Non-AC Sleeper',
    type: 'SLEEPER',
    busClass: 'Economy',
    seats: 30,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.1,
    reviewsCount: 950,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: true, waterBottle: false, blanket: false, readingLight: true, liveTracking: false, emergencySupport: true, cctv: false, snacks: false }
  },

  // --- GOVERNMENT & REGIONAL CLASSIC COACHES ---
  {
    operatorName: 'SETC',
    modelName: 'Ultra Deluxe AC Seater (2+2)',
    type: 'AC_SEATER',
    busClass: 'Premium',
    seats: 36,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.3,
    reviewsCount: 1240,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: true, chargingPoint: true, waterBottle: true, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'SETC',
    modelName: 'Classic Non-AC Sleeper / Seater',
    type: 'SLEEPER',
    busClass: 'Economy',
    seats: 36,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.2,
    reviewsCount: 880,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: true, waterBottle: false, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'TNSTC',
    modelName: 'Ultra Deluxe Classic Seater (2+2)',
    type: 'SEATER',
    busClass: 'Economy',
    seats: 40,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.1,
    reviewsCount: 1850,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: false, waterBottle: false, blanket: false, readingLight: true, liveTracking: false, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'TNSTC',
    modelName: 'Super Deluxe Point-to-Point Express (2+2)',
    type: 'SEATER',
    busClass: 'Economy',
    seats: 40,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.0,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: false, waterBottle: false, blanket: false, readingLight: true, liveTracking: false, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'KSRTC',
    modelName: 'Rajahamsa Executive Seater (2+2)',
    type: 'SEATER',
    busClass: 'Economy',
    seats: 40,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.4,
    reviewsCount: 2100,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: true, waterBottle: false, blanket: false, readingLight: true, liveTracking: true, emergencySupport: true, cctv: false, snacks: false }
  },
  {
    operatorName: 'Mettur Super Services',
    modelName: 'Non-AC 2+2 Seater Express',
    type: 'NON_AC',
    busClass: 'Economy',
    seats: 40,
    isVolvo: false,
    isMultiAxle: false,
    rating: 4.0,
    reviewsCount: 650,
    image: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=360&q=80',
    amenities: { wifi: false, chargingPoint: false, waterBottle: false, blanket: false, readingLight: true, liveTracking: false, emergencySupport: true, cctv: false, snacks: false }
  },
];

// Helper to look up template metadata
function getBusTemplate(operatorName, busType) {
  return (
    OPERATORS.find(
      (op) => op.operatorName === operatorName && op.type === busType
    ) ||
    OPERATORS.find((op) => op.operatorName === operatorName) ||
    OPERATORS[0]
  );
}

const depTimes = [
  { h: 5, m: 30 },
  { h: 6, m: 45 },
  { h: 8, m: 15 },
  { h: 10, m: 0 },
  { h: 11, m: 30 },
  { h: 13, m: 15 },
  { h: 15, m: 0 },
  { h: 16, m: 30 },
  { h: 18, m: 0 },
  { h: 19, m: 15 },
  { h: 20, m: 0 },
  { h: 20, m: 45 },
  { h: 21, m: 15 },
  { h: 21, m: 45 },
  { h: 22, m: 15 },
  { h: 22, m: 45 },
  { h: 23, m: 15 },
  { h: 23, m: 45 },
  { h: 0, m: 30 }
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function isBusAppropriateForRoute(bus, state1, state2) {
  const name = bus.operatorName;
  if (name === 'TNSTC' || name === 'SETC') {
    return state1 === 'TN' || state2 === 'TN' || state1 === 'PY' || state2 === 'PY';
  }
  if (name === 'KSRTC') {
    return state1 === 'KA' || state2 === 'KA';
  }
  if (name === 'APSRTC') {
    return state1 === 'AP' || state2 === 'AP';
  }
  if (name === 'TSRTC') {
    return state1 === 'TS' || state2 === 'TS';
  }
  if (name === 'Kerala Lines' || name === 'Kallada Travels' || name === 'Alhind Tours & Travels') {
    return state1 === 'KL' || state2 === 'KL' || state1 === 'TN' || state2 === 'TN' || state1 === 'KA' || state2 === 'KA';
  }
  return true;
}

function calculatePrice(operatorName, busType, modelName = '', distance) {
  let ratePerKm = 1.5;
  const isVolvo = modelName.toLowerCase().includes('volvo') || operatorName.toLowerCase().includes('airavat') || operatorName.toLowerCase().includes('ambari');
  const isMultiAxle = modelName.toLowerCase().includes('multi-axle') || modelName.toLowerCase().includes('9600') || modelName.toLowerCase().includes('b11r');
  const isMercedes = modelName.toLowerCase().includes('mercedes') || modelName.toLowerCase().includes('bharatbenz') || modelName.toLowerCase().includes('business class');

  if (operatorName === 'TNSTC') {
    ratePerKm = 0.95;
  } else if (operatorName === 'SETC') {
    ratePerKm = busType.includes('AC') ? 1.4 : 1.1;
  } else if (['KSRTC', 'APSRTC', 'TSRTC'].includes(operatorName)) {
    if (isVolvo || isMultiAxle) ratePerKm = 2.8;
    else if (busType.includes('AC')) ratePerKm = 1.6;
    else ratePerKm = 1.15;
  } else {
    // Private luxury operators
    if (isVolvo && isMultiAxle && busType.includes('SLEEPER')) {
      ratePerKm = 3.6; // Luxury Volvo 9600 / Multi-Axle Sleeper: ₹1300 - ₹2400+
    } else if (isMercedes || modelName.toLowerCase().includes('luxury') || modelName.toLowerCase().includes('dream class')) {
      ratePerKm = 3.4; // Business Class / Mercedes / Luxury Sleeper: ₹1250 - ₹2200
    } else if (isVolvo && busType.includes('SLEEPER')) {
      ratePerKm = 3.1; // Volvo AC Sleeper: ₹1100 - ₹1900
    } else if (isVolvo && busType.includes('SEATER')) {
      ratePerKm = 2.7; // Volvo AC Seater / Semi-Sleeper: ₹950 - ₹1600
    } else if (busType.includes('SLEEPER') && busType.includes('AC')) {
      ratePerKm = 2.6; // Premium AC Sleeper: ₹900 - ₹1500
    } else if (busType.includes('SLEEPER')) {
      ratePerKm = 1.9; // Non-AC Sleeper: ₹700 - ₹1200
    } else if (busType.includes('SEATER') && busType.includes('AC')) {
      ratePerKm = 2.0; // AC Seater: ₹650 - ₹1100
    } else {
      ratePerKm = 1.3; // Non-AC Seater: ₹450 - ₹800
    }
  }

  // Base minimum floor based on bus type
  let minPrice = 450;
  if (isVolvo && isMultiAxle) minPrice = 1250;
  else if (isVolvo || isMercedes) minPrice = 1050;
  else if (busType.includes('AC_SLEEPER')) minPrice = 950;
  else if (busType.includes('AC_SEATER')) minPrice = 650;
  else if (busType.includes('SLEEPER')) minPrice = 650;

  const rawINR = Math.round(distance * ratePerKm);
  const priceINR = Math.max(minPrice, rawINR);
  return priceINR / 84;
}

async function ensureBusesExist() {
  const count = await prisma.bus.count();
  if (count >= 70) return;

  const states = ['TN', 'KA', 'KL', 'AP', 'TS'];
  
  for (let i = 0; i < OPERATORS.length; i++) {
    const op = OPERATORS[i];
    const state = states[i % states.length];
    const series = ['A', 'B', 'C', 'D', 'E', 'F', 'G'][i % 7];
    const busNum = `${state}-${String(10 + (i % 88))}-${series}-${String(1000 + i * 11)}`;
    const regNum = `REG-${state}${String(10 + (i % 88))}-${String(1000 + i * 11)}`;

    try {
      await prisma.bus.create({
        data: {
          busNumber: busNum,
          operatorName: op.operatorName,
          registrationNumber: regNum,
          busType: op.type,
          totalSeats: op.seats,
        }
      });
    } catch (e) {
      // Ignore duplicates
    }
  }
}

function serializeTrip(trip) {
  if (!trip) return null;

  const opTemplate = getBusTemplate(trip.bus?.operatorName, trip.bus?.busType);

  return {
    ...trip,
    departureTime: trip.departureTime instanceof Date ? trip.departureTime.toISOString() : trip.departureTime,
    arrivalTime: trip.arrivalTime instanceof Date ? trip.arrivalTime.toISOString() : trip.arrivalTime,
    createdAt: trip.createdAt instanceof Date ? trip.createdAt.toISOString() : trip.createdAt,
    updatedAt: trip.updatedAt instanceof Date ? trip.updatedAt.toISOString() : trip.updatedAt,
    bus: {
      ...trip.bus,
      modelName: opTemplate.modelName,
      busClass: opTemplate.busClass,
      image: opTemplate.image,
      rating: opTemplate.rating,
      reviewsCount: opTemplate.reviewsCount,
      isVolvo: opTemplate.isVolvo,
      isMultiAxle: opTemplate.isMultiAxle,
      amenities: opTemplate.amenities,
      createdAt: trip.bus?.createdAt instanceof Date ? trip.bus.createdAt.toISOString() : (trip.bus?.createdAt || new Date().toISOString()),
      updatedAt: trip.bus?.updatedAt instanceof Date ? trip.bus.updatedAt.toISOString() : (trip.bus?.updatedAt || new Date().toISOString()),
    },
    route: {
      ...trip.route,
      createdAt: trip.route?.createdAt instanceof Date ? trip.route.createdAt.toISOString() : (trip.route?.createdAt || new Date().toISOString()),
      updatedAt: trip.route?.updatedAt instanceof Date ? trip.route.updatedAt.toISOString() : (trip.route?.updatedAt || new Date().toISOString()),
    },
  };
}

export async function searchTrips(input) {
  try {
    const validation = SearchSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid input data' };
    }

    const { source, destination, date } = validation.data;
    const travelDate = parseISO(date);
    const start = startOfDay(travelDate);
    const end = endOfDay(travelDate);

    const sourceCanonical = getCanonicalCity(source);
    const destCanonical = getCanonicalCity(destination);

    // Find routes matching source and destination (case-insensitive search)
    let route = await prisma.route.findFirst({
      where: {
        source: { equals: sourceCanonical, mode: 'insensitive' },
        destination: { equals: destCanonical, mode: 'insensitive' },
      },
    });

    if (!route) {
      const distance = calculateDistance(sourceCanonical, destCanonical);
      const durationMin = Math.round((distance / 55) * 60 + 30);
      const duration = formatDuration(durationMin);
      const stops = findStops(sourceCanonical, destCanonical);

      route = await prisma.route.create({
        data: {
          source: sourceCanonical,
          destination: destCanonical,
          distance,
          duration,
          stops: stops.length > 0 ? stops : ['Junction Point'],
        },
      });
    }

    // Find trips for this route within the departure date range
    let trips = await prisma.trip.findMany({
      where: {
        routeId: route.id,
        departureTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        bus: true,
        route: true,
      },
    });

    // Fallback: If no trips or few trips are scheduled on this date, dynamically populate rich inventory
    if (trips.length === 0) {
      await ensureBusesExist();
      const allBuses = await prisma.bus.findMany({});
      
      const state1 = getCityState(sourceCanonical);
      const state2 = getCityState(destCanonical);
      
      const appropriateBuses = allBuses.filter(bus => isBusAppropriateForRoute(bus, state1, state2));
      
      // Select 14-20 buses deterministically for comprehensive options
      const routeSeed = hashCode(sourceCanonical + destCanonical + date);
      const targetCount = 14 + (routeSeed % 7); // between 14 and 20
      
      const selectedBuses = [];
      const tempBuses = [...appropriateBuses];
      for (let i = 0; i < targetCount && tempBuses.length > 0; i++) {
        const selectIdx = (routeSeed + i * 5) % tempBuses.length;
        selectedBuses.push(tempBuses.splice(selectIdx, 1)[0]);
      }
      
      const distance = route.distance;
      const durationMin = Math.round((distance / 55) * 60 + 30);

      const createdTrips = [];
      for (let i = 0; i < selectedBuses.length; i++) {
        const bus = selectedBuses[i];
        const template = getBusTemplate(bus.operatorName, bus.busType);
        const price = calculatePrice(bus.operatorName, bus.busType, template.modelName, distance);
        
        const depTimeInfo = depTimes[(routeSeed + i) % depTimes.length];
        const depTime = new Date(travelDate);
        depTime.setHours(depTimeInfo.h, depTimeInfo.m, 0, 0);

        const arrTime = new Date(depTime.getTime() + durationMin * 60 * 1000);

        // Realistic available seat numbers (e.g. 7, 12, 18, 24, 31)
        const bookedOffset = 4 + ((routeSeed + i * 3) % (bus.totalSeats === 30 ? 22 : 30));
        const availableSeats = Math.max(3, bus.totalSeats - bookedOffset);

        const newTrip = await prisma.trip.create({
          data: {
            busId: bus.id,
            routeId: route.id,
            departureTime: depTime,
            arrivalTime: arrTime,
            price,
            status: 'SCHEDULED',
            availableSeats,
          },
          include: {
            bus: true,
            route: true,
          },
        });
        createdTrips.push(newTrip);
      }
      trips = createdTrips;
    }

    // Find active GPS trackers within the last 5 minutes to set live status
    const activeTrackers = await prisma.liveTracker.findMany({
      where: {
        busId: { in: trips.map((t) => t.busId) },
      },
      orderBy: { timestamp: 'desc' },
    });

    const liveBusIds = new Set();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    activeTrackers.forEach((t) => {
      if (t.timestamp > fiveMinutesAgo) {
        liveBusIds.add(t.busId);
      }
    });

    // STRICT TRAVEL OWNER AVAILABILITY INTEGRATION:
    // Exclude any buses or trips marked UNAVAILABLE or MAINTENANCE by the travel operator
    const availableTrips = trips.filter((t) => {
      if (t.status === 'CANCELLED') return false;
      return isBusAvailable(t.bus);
    });

    return {
      success: true,
      data: availableTrips.map((t) => ({
        ...serializeTrip(t),
        isLive: liveBusIds.has(t.busId),
      })),
    };
  } catch (err) {
    console.error('Search trips error:', err);
    return { success: false, error: 'An unexpected error occurred while searching trips' };
  }
}

export async function getRouteSuggestions(query) {
  if (!query || query.length < 2) return [];

  const q = query.trim().toLowerCase();
  const suggestions = new Set();

  for (const city of ALL_CITIES) {
    const nameMatch = city.name.toLowerCase().includes(q);
    const aliasMatch = city.aliases.some(alias => alias.toLowerCase().includes(q));
    
    if (nameMatch || aliasMatch) {
      suggestions.add(city.name);
    }
  }

  return Array.from(suggestions).slice(0, 10);
}

export async function getTripById(id) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        bus: true,
        route: true,
      },
    });

    if (!trip) {
      return { success: false, error: 'Trip not found' };
    }

    return {
      success: true,
      data: serializeTrip(trip),
    };
  } catch (err) {
    console.error('Get trip by ID error:', err);
    return { success: false, error: 'Failed to retrieve trip details' };
  }
}

export async function getTripsFromSource(sourceCity) {
  try {
    if (!sourceCity) return { success: true, data: [] };
    const sourceCanonical = getCanonicalCity(sourceCity);
    const trips = await prisma.trip.findMany({
      where: {
        route: {
          source: { equals: sourceCanonical, mode: 'insensitive' },
        },
      },
      include: {
        bus: true,
        route: true,
      },
      orderBy: { departureTime: 'asc' },
      take: 8,
    });

    return {
      success: true,
      data: trips.map(serializeTrip),
    };
  } catch (err) {
    console.error('getTripsFromSource error:', err);
    return { success: false, error: 'Failed to retrieve source trips' };
  }
}

export async function getAllScheduledTrips() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        bus: true,
        route: true,
      },
      orderBy: { departureTime: 'asc' },
    });

    const activeTrackers = await prisma.liveTracker.findMany({
      where: {
        busId: { in: trips.map((t) => t.busId) },
      },
      orderBy: { timestamp: 'desc' },
    });

    const liveBusIds = new Set();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    activeTrackers.forEach((t) => {
      if (t.timestamp > fiveMinutesAgo) {
        liveBusIds.add(t.busId);
      }
    });

    const availableTrips = trips.filter((t) => {
      if (t.status === 'CANCELLED') return false;
      return isBusAvailable(t.bus);
    });

    return {
      success: true,
      data: availableTrips.map((t) => ({
        ...serializeTrip(t),
        isLive: liveBusIds.has(t.busId),
      })),
    };
  } catch (err) {
    console.error('getAllScheduledTrips error:', err);
    return { success: false, error: 'Failed to retrieve scheduled trips' };
  }
}
