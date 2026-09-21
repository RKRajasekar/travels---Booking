'use server';

import { prisma } from '@/lib/prisma';
import {
  DEFAULT_OPERATORS,
  getOperatorProfile,
  getBusAvailability,
  setBusAvailability,
} from '@/lib/operatorStore';
import { getBusOperatorImage } from '@/lib/utils';

// Bus model templates for operator fleets
const BUS_TEMPLATES = {
  'KPN Travels': {
    modelName: 'Volvo 9600 B11R Multi-Axle AC Sleeper (2+1)',
    busClass: 'Luxury Sleeper',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
  },
  'VRL Travels': {
    modelName: 'I-Shift Multi-Axle Executive Sleeper (2+1)',
    busClass: 'Executive Sleeper',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
  },
  'Orange Tours & Travels': {
    modelName: 'Volvo 9600 Multi-Axle Luxury Sleeper (2+1)',
    busClass: 'Super Luxury',
    image: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
  },
  'Parveen Travels': {
    modelName: 'Mercedes-Benz Multi-Axle AC Seater / Sleeper',
    busClass: 'Royal Suite',
    image: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
  },
  'SRM Travels': {
    modelName: 'Scania Metrolink HD Multi-Axle (2+1)',
    busClass: 'Premium Sleeper',
    image: 'https://images.unsplash.com/photo-1494515426402-f1980ace7a9c?auto=format&fit=crop&w=400&q=80',
    rating: 4.5,
  },
  'GreenLine Travels': {
    modelName: 'Volvo 9600 Multi-Axle Intercity Cruiser',
    busClass: 'Luxury Seater',
    image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
  },
};

function getTemplate(operatorName, busType) {
  if (BUS_TEMPLATES[operatorName]) return BUS_TEMPLATES[operatorName];
  return {
    modelName: `Volvo Multi-Axle (${busType?.replace('_', ' ') || 'AC Sleeper'})`,
    busClass: 'Commercial Fleet',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=360&q=80',
    rating: 4.6,
  };
}

const DEFAULT_OPERATOR_CONFIGS = [
  { name: 'KPN Travels', type: 'AC_SLEEPER', seats: 30, code: 'KPN' },
  { name: 'VRL Travels', type: 'AC_SLEEPER', seats: 32, code: 'VRL' },
  { name: 'Parveen Travels', type: 'AC_SEATER', seats: 40, code: 'PRV' },
  { name: 'Orange Tours & Travels', type: 'AC_SLEEPER', seats: 30, code: 'ORG' },
  { name: 'SRM Travels', type: 'AC_SLEEPER', seats: 30, code: 'SRM' },
  { name: 'GreenLine Travels', type: 'AC_SEATER', seats: 42, code: 'GNL' },
];

/**
 * Ensures seed buses exist across popular South Indian and National operators
 */
async function ensureAdminBusesExist() {
  for (const op of DEFAULT_OPERATOR_CONFIGS) {
    const existingCount = await prisma.bus.count({
      where: { operatorName: { equals: op.name, mode: 'insensitive' } },
    });

    if (existingCount === 0) {
      const busTemplates = [
        { num: 'TN-01-AX-1010', reg: 'REG-TN01-1010', type: op.type, seats: op.seats },
        { num: 'KA-04-MB-2020', reg: 'REG-KA04-2020', type: op.type, seats: op.seats },
        { num: 'KL-07-CD-3030', reg: 'REG-KL07-3030', type: 'AC_SEATER', seats: 40 },
        { num: 'TS-09-EF-4040', reg: 'REG-TS09-4040', type: op.type, seats: op.seats },
        { num: 'AP-16-GH-5050', reg: 'REG-AP16-5050', type: 'AC_SLEEPER', seats: 30 },
      ];

      for (const t of busTemplates) {
        try {
          await prisma.bus.create({
            data: {
              busNumber: `${op.code}-${t.num}`,
              operatorName: op.name,
              registrationNumber: `${op.code}-${t.reg}`,
              busType: t.type,
              totalSeats: t.seats,
            },
          });
        } catch (e) {
          // Ignore duplicate unique constraints
        }
      }
    }
  }
}

/**
 * Fetch all registered travels / operators and all buses across all operators
 * for complete master administrative oversight.
 */
export async function getAdminFleetData() {
  try {
    await ensureAdminBusesExist();

    // 1. Fetch all buses from DB
    let buses = [];
    try {
      buses = await prisma.bus.findMany({
        include: {
          trips: {
            take: 1,
            orderBy: { departureTime: 'desc' },
            include: { route: true },
          },
        },
        orderBy: { operatorName: 'asc' },
      });
    } catch (dbErr) {
      console.error('Error querying buses with trips, retrying without trips:', dbErr);
      buses = await prisma.bus.findMany({
        orderBy: { operatorName: 'asc' },
      });
    }

    // 2. Collect travel owners from global in-memory registry or database
    const globalStore = globalThis;
    const memoryOwners = globalStore.__TRAVEL_OWNERS__ || {};
    const registeredTravelOwnersCount = Object.keys(memoryOwners).length;

    // 3. Collect distinct operator names
    const operatorNamesSet = new Set();
    DEFAULT_OPERATORS.forEach((op) => operatorNamesSet.add(op.name));
    DEFAULT_OPERATOR_CONFIGS.forEach((op) => operatorNamesSet.add(op.name));
    buses.forEach((b) => {
      if (b.operatorName) operatorNamesSet.add(b.operatorName);
    });

    const distinctOperators = Array.from(operatorNamesSet);

    // 4. Transform buses with live status and template
    let availableCount = 0;
    let unavailableCount = 0;
    let maintenanceCount = 0;
    let totalSeatsSum = 0;

    const defaultRoutes = [
      'Chennai ➔ Bangalore',
      'Chennai ➔ Coimbatore',
      'Bangalore ➔ Hyderabad',
      'Chennai ➔ Madurai',
      'Coimbatore ➔ Bangalore',
      'Hyderabad ➔ Chennai',
    ];

    const formattedBuses = buses.map((bus, idx) => {
      const status = getBusAvailability(bus.id) || 'AVAILABLE';
      if (status === 'AVAILABLE') availableCount++;
      else if (status === 'MAINTENANCE') maintenanceCount++;
      else unavailableCount++;

      totalSeatsSum += bus.totalSeats || 30;

      const template = getTemplate(bus.operatorName, bus.busType);
      const opProfile = getOperatorProfile(bus.operatorName);

      const latestTrip = bus.trips?.[0];
      const routeDesc = latestTrip?.route
        ? `${latestTrip.route.source} ➔ ${latestTrip.route.destination}`
        : defaultRoutes[idx % defaultRoutes.length];

      return {
        id: bus.id,
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber,
        operatorName: bus.operatorName,
        busType: bus.busType,
        totalSeats: bus.totalSeats,
        modelName: template.modelName,
        busClass: template.busClass,
        image: template.image,
        rating: template.rating,
        status: status,
        assignedRoute: routeDesc,
        operatorLogo: getBusOperatorImage(bus.operatorName),
        operatorPhone: opProfile?.phone || '+91 94432 11223',
        operatorEmail: opProfile?.email || 'operator@nextbus.com',
        operatorOwner: opProfile?.ownerName || 'Managing Partner',
        createdAt: bus.createdAt?.toISOString?.() || new Date().toISOString(),
      };
    });

    // 5. Operator Summary Cards
    const operatorSummaries = distinctOperators.map((opName) => {
      const opProfile = getOperatorProfile(opName);
      const opBuses = formattedBuses.filter(
        (b) => b.operatorName?.toLowerCase() === opName.toLowerCase()
      );
      const opAvailable = opBuses.filter((b) => b.status === 'AVAILABLE').length;

      return {
        name: opName,
        ownerName: opProfile.ownerName,
        email: opProfile.email,
        phone: opProfile.phone,
        logo: getBusOperatorImage(opName),
        address: opProfile.address,
        gstNumber: opProfile.gstNumber,
        rating: opProfile.rating || 4.7,
        totalBuses: opBuses.length,
        availableBuses: opAvailable,
        unavailableBuses: opBuses.length - opAvailable,
      };
    });

    // 6. Return comprehensive admin fleet payload
    return {
      success: true,
      data: {
        stats: {
          totalOperators: distinctOperators.length,
          totalBuses: formattedBuses.length,
          availableBuses: availableCount,
          unavailableBuses: unavailableCount,
          maintenanceBuses: maintenanceCount,
          totalSeats: totalSeatsSum,
          registeredTravelOwnersCount: registeredTravelOwnersCount,
        },
        operators: operatorSummaries,
        buses: formattedBuses,
      },
    };
  } catch (error) {
    console.error('getAdminFleetData Error:', error);
    return { success: false, error: error.message || 'Failed to fetch admin fleet data' };
  }
}

/**
 * Administrative override to toggle or set any bus status across any operator.
 * Real-time updates immediately propagate to customer trip searches.
 */
export async function adminUpdateBusAvailability(busId, status) {
  try {
    if (!busId) {
      return { success: false, error: 'Bus ID is required' };
    }

    const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status: ${status}` };
    }

    setBusAvailability(busId, status);

    return {
      success: true,
      message: `Bus status updated to ${status}`,
      data: { busId, status },
    };
  } catch (error) {
    console.error('adminUpdateBusAvailability Error:', error);
    return { success: false, error: error.message || 'Failed to update bus status' };
  }
}
