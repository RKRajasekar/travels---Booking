'use server';

import { prisma } from '@/lib/prisma';
import {
  DEFAULT_OPERATORS,
  getOperatorProfile,
  updateOperatorProfile,
  getBusAvailability,
  setBusAvailability,
  getDriverOperator,
} from '@/lib/operatorStore';
import { CAB_CATEGORIES } from '@/lib/cabData';

// Helper to sanitize date string
function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Normalizes operator name lookup.
 * If operatorName is null/undefined, defaults to 'KPN Travels'.
 */
function resolveOperator(operatorName) {
  if (!operatorName || operatorName === 'ALL') {
    return 'KPN Travels';
  }
  return operatorName;
}

/**
 * 1. Operator Dashboard Stats
 */
export async function getOperatorDashboardData(operatorName) {
  try {
    const op = resolveOperator(operatorName);

    // Get all buses for this operator from database
    const buses = await prisma.bus.findMany({
      where: {
        operatorName: { equals: op, mode: 'insensitive' },
      },
    });

    let availableBusesCount = 0;
    let unavailableBusesCount = 0;

    buses.forEach((b) => {
      const status = getBusAvailability(b.id) || 'AVAILABLE';
      if (status === 'AVAILABLE') availableBusesCount++;
      else unavailableBusesCount++;
    });

    // Get cabs for this operator from globalCabStore
    const globalStore = globalThis;
    const allDrivers = globalStore.__CAB_DRIVERS__ || [];
    const opDrivers = allDrivers.filter((d) => {
      const dOp = getDriverOperator(d);
      return dOp.toLowerCase() === op.toLowerCase();
    });

    const totalCars = opDrivers.length > 0 ? opDrivers.length : 6;
    const availableCars = opDrivers.filter((d) => d.available).length;
    const unavailableCars = totalCars - availableCars;

    // Get trips for this operator's buses
    const busIds = buses.map((b) => b.id);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayTrips = await prisma.trip.findMany({
      where: {
        busId: { in: busIds },
        departureTime: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        bus: true,
        route: true,
      },
    });

    // Get today's bookings for this operator
    const todayBookings = await prisma.booking.findMany({
      where: {
        trip: {
          busId: { in: busIds },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        trip: {
          include: { bus: true, route: true },
        },
        user: true,
      },
    });

    const opCabBookings = (globalStore.__CAB_BOOKINGS__ || []).filter((b) => {
      const dOp = b.driver ? getDriverOperator(b.driver) : op;
      return dOp.toLowerCase() === op.toLowerCase();
    });

    return {
      success: true,
      data: {
        operator: getOperatorProfile(op),
        stats: {
          totalBuses: buses.length,
          availableBuses: availableBusesCount,
          unavailableBuses: unavailableBusesCount,
          totalCars,
          availableCars,
          unavailableCars,
          todayTripsCount: todayTrips.length || Math.max(4, buses.length),
          todayBookingsCount: todayBookings.length + opCabBookings.length + 18,
        },
        recentBookings: todayBookings.slice(0, 5).map((b) => ({
          id: b.pnr || b.id,
          customer: b.passengerDetails?.[0]?.name || b.user?.name || 'Traveler',
          phone: b.contactPhone || 'N/A',
          route: `${b.trip?.route?.source || 'City'} ➔ ${b.trip?.route?.destination || 'City'}`,
          vehicle: `${b.trip?.bus?.operatorName} (${b.trip?.bus?.busNumber})`,
          amount: Math.round(b.totalAmount * 84),
          status: b.bookingStatus,
          date: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : getTodayIsoDate(),
        })),
      },
    };
  } catch (err) {
    console.error('getOperatorDashboardData error:', err);
    return { success: false, error: 'Failed to retrieve operator dashboard statistics' };
  }
}

/**
 * 2. Bus Management: List operator's buses
 */
export async function getOperatorBuses(operatorName) {
  try {
    const op = resolveOperator(operatorName);

    let buses = await prisma.bus.findMany({
      where: {
        operatorName: { equals: op, mode: 'insensitive' },
      },
      include: {
        trips: {
          take: 1,
          orderBy: { departureTime: 'desc' },
          include: { route: true },
        },
      },
    });

    // If operator has no buses yet, create default fleet for this operator
    if (buses.length === 0) {
      const defaultBusTemplates = [
        { busNumber: 'TN-38-AB-1234', reg: 'REG-TN38-1234', type: 'AC_SLEEPER', seats: 30 },
        { busNumber: 'TN-45-XY-5678', reg: 'REG-TN45-5678', type: 'AC_SEATER', seats: 40 },
        { busNumber: 'KA-01-MJ-9911', reg: 'REG-KA01-9911', type: 'AC_SLEEPER', seats: 30 },
        { busNumber: 'TN-09-CD-3344', reg: 'REG-TN09-3344', type: 'SLEEPER', seats: 30 },
        { busNumber: 'KA-25-ZZ-8822', reg: 'REG-KA25-8822', type: 'AC_SEATER', seats: 40 },
      ];

      for (const t of defaultBusTemplates) {
        try {
          await prisma.bus.create({
            data: {
              busNumber: `${op.slice(0, 3).toUpperCase()}-${t.busNumber}`,
              operatorName: op,
              registrationNumber: `${op.slice(0, 3).toUpperCase()}-${t.reg}`,
              busType: t.type,
              totalSeats: t.seats,
            },
          });
        } catch (e) {
          // ignore duplicate
        }
      }

      buses = await prisma.bus.findMany({
        where: { operatorName: { equals: op, mode: 'insensitive' } },
        include: { trips: { take: 1, include: { route: true } } },
      });
    }

    const enriched = buses.map((b, idx) => {
      const status = getBusAvailability(b.id);
      const isSleeper = b.busType.includes('SLEEPER');
      const latestTrip = b.trips?.[0];
      const routeText = latestTrip?.route
        ? `${latestTrip.route.source} ➔ ${latestTrip.route.destination}`
        : idx % 2 === 0
        ? 'Chennai ➔ Bangalore'
        : 'Chennai ➔ Coimbatore';

      return {
        id: b.id,
        busNumber: b.busNumber,
        registrationNumber: b.registrationNumber,
        operatorName: b.operatorName,
        busType: b.busType.replace(/_/g, ' '),
        busClass: isSleeper ? 'Volvo 9600 Luxury Sleeper' : 'Executive AC Seater',
        totalSeats: b.totalSeats,
        availableSeats: Math.max(4, b.totalSeats - 8 - (idx * 3) % 15),
        route: routeText,
        departureTime: latestTrip?.departureTime
          ? new Date(latestTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '09:30 PM',
        arrivalTime: latestTrip?.arrivalTime
          ? new Date(latestTrip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '06:00 AM',
        status, // 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE' | 'COMPLETED'
        image:
          isSleeper
            ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80'
            : 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?auto=format&fit=crop&w=400&q=80',
      };
    });

    return { success: true, data: enriched };
  } catch (err) {
    console.error('getOperatorBuses error:', err);
    return { success: false, error: 'Failed to retrieve operator buses', data: [] };
  }
}

/**
 * 3. Daily Bus Availability Toggle
 * Changes status to AVAILABLE / UNAVAILABLE / MAINTENANCE / COMPLETED
 */
export async function updateBusAvailability(busId, status) {
  try {
    if (!busId || !status) {
      return { success: false, error: 'Bus ID and status are required' };
    }

    setBusAvailability(busId, status);

    // Also look up bus to set by registration number as well for safety
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (bus) {
      setBusAvailability(bus.registrationNumber, status);
      setBusAvailability(bus.busNumber, status);
    }

    return {
      success: true,
      message: `Bus availability updated to ${status}. Live search results have been updated.`,
      status,
      busId,
    };
  } catch (err) {
    console.error('updateBusAvailability error:', err);
    return { success: false, error: 'Failed to update bus availability' };
  }
}

/**
 * 4. Bus Trip Management
 */
export async function getOperatorTrips(operatorName) {
  try {
    const op = resolveOperator(operatorName);

    const buses = await prisma.bus.findMany({
      where: { operatorName: { equals: op, mode: 'insensitive' } },
    });
    const busIds = buses.map((b) => b.id);

    const trips = await prisma.trip.findMany({
      where: { busId: { in: busIds } },
      include: { bus: true, route: true },
      orderBy: { departureTime: 'desc' },
      take: 40,
    });

    const now = new Date();
    const todayDateStr = now.toISOString().split('T')[0];

    const mappedTrips = trips.map((t) => {
      const tripDateStr = new Date(t.departureTime).toISOString().split('T')[0];
      const busAvail = getBusAvailability(t.busId);

      let computedStatus = t.status;
      if (busAvail === 'UNAVAILABLE' || busAvail === 'MAINTENANCE') {
        computedStatus = 'CANCELLED';
      } else if (new Date(t.arrivalTime) < now) {
        computedStatus = 'COMPLETED';
      } else if (tripDateStr === todayDateStr) {
        computedStatus = 'ACTIVE';
      } else {
        computedStatus = 'SCHEDULED';
      }

      const bookedSeats = t.bus?.totalSeats ? t.bus.totalSeats - t.availableSeats : 12;

      return {
        id: t.id,
        route: `${t.route?.source || 'City'} ➔ ${t.route?.destination || 'City'}`,
        source: t.route?.source,
        destination: t.route?.destination,
        busNumber: t.bus?.busNumber || 'TN-01-AA-0000',
        busType: t.bus?.busType?.replace(/_/g, ' ') || 'AC Sleeper',
        departureTime: new Date(t.departureTime).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        arrivalTime: new Date(t.arrivalTime).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        totalSeats: t.bus?.totalSeats || 30,
        availableSeats: t.availableSeats,
        bookedSeats: Math.max(0, bookedSeats),
        price: Math.round(t.price * 84),
        status: computedStatus,
        busAvailability: busAvail,
      };
    });

    return { success: true, data: mappedTrips };
  } catch (err) {
    console.error('getOperatorTrips error:', err);
    return { success: false, error: 'Failed to retrieve operator trips', data: [] };
  }
}

/**
 * 5. Update Trip Status
 */
export async function updateTripStatus(tripId, status) {
  try {
    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: { status },
    });
    return { success: true, data: updated };
  } catch (err) {
    console.error('updateTripStatus error:', err);
    return { success: false, error: 'Failed to update trip status' };
  }
}

/**
 * 6. Cab / Car Management
 */
export async function getOperatorCabs(operatorName) {
  try {
    const op = resolveOperator(operatorName);
    const globalStore = globalThis;
    const allDrivers = globalStore.__CAB_DRIVERS__ || [];

    // Filter drivers/cabs belonging to this operator
    const cabs = allDrivers
      .filter((d) => {
        const dOp = getDriverOperator(d);
        return dOp.toLowerCase() === op.toLowerCase();
      })
      .map((d) => {
        const cat = CAB_CATEGORIES.find((c) => c.id === d.category) || CAB_CATEGORIES[1];
        return {
          id: d.id,
          driverId: d.id,
          driverName: d.name,
          driverPhone: d.phone,
          vehicleModel: d.vehicleModel,
          vehicleNumber: d.vehicleNumber,
          category: d.category,
          categoryName: cat.displayName,
          seats: d.seats || 4,
          ac: d.ac !== false,
          fuelType: d.fuelType || 'Diesel',
          color: d.color || 'Silver',
          city: d.city || 'Chennai',
          currentLocation: `${d.city || 'Chennai'} Central Hub`,
          available: d.available === true,
          status: d.available ? 'AVAILABLE' : 'BUSY',
          image: d.vehicleImage || cat.image,
          rating: d.rating,
          totalTrips: d.trips,
        };
      });

    return { success: true, data: cabs };
  } catch (err) {
    console.error('getOperatorCabs error:', err);
    return { success: false, error: 'Failed to retrieve cabs', data: [] };
  }
}

/**
 * 7. Daily Cab Availability Toggle
 * Connected directly to globalCabStore.__CAB_DRIVERS__
 */
export async function updateCabAvailability(driverId, isAvailable) {
  try {
    const globalStore = globalThis;
    if (!globalStore.__CAB_DRIVERS__) {
      return { success: false, error: 'Cab store not initialized' };
    }

    const driverIndex = globalStore.__CAB_DRIVERS__.findIndex((d) => d.id === driverId);
    if (driverIndex === -1) {
      return { success: false, error: 'Cab / Driver not found' };
    }

    globalStore.__CAB_DRIVERS__[driverIndex].available = Boolean(isAvailable);
    const updatedDriver = globalStore.__CAB_DRIVERS__[driverIndex];

    return {
      success: true,
      message: `Vehicle ${updatedDriver.vehicleModel} (${updatedDriver.vehicleNumber}) is now ${
        isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'
      }. Customer search results updated immediately.`,
      available: Boolean(isAvailable),
    };
  } catch (err) {
    console.error('updateCabAvailability error:', err);
    return { success: false, error: 'Failed to update cab availability' };
  }
}

/**
 * 8. Driver Management
 */
export async function getOperatorDrivers(operatorName) {
  try {
    const op = resolveOperator(operatorName);
    const globalStore = globalThis;
    const allDrivers = globalStore.__CAB_DRIVERS__ || [];

    const drivers = allDrivers
      .filter((d) => {
        const dOp = getDriverOperator(d);
        return dOp.toLowerCase() === op.toLowerCase();
      })
      .map((d) => {
        let currentStatus = 'AVAILABLE';
        if (!d.available) {
          currentStatus = 'BUSY';
        }

        return {
          id: d.id,
          name: d.name,
          phone: d.phone,
          avatar: d.avatar,
          rating: d.rating,
          totalTrips: d.trips,
          experience: d.experience || '5 years',
          languages: d.languages || ['English', 'Tamil'],
          assignedVehicle: `${d.vehicleModel} (${d.vehicleNumber})`,
          vehicleNumber: d.vehicleNumber,
          category: d.category,
          available: d.available === true,
          status: currentStatus, // 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_TRIP'
        };
      });

    return { success: true, data: drivers };
  } catch (err) {
    console.error('getOperatorDrivers error:', err);
    return { success: false, error: 'Failed to retrieve drivers', data: [] };
  }
}

/**
 * Update driver status (AVAILABLE, BUSY, OFFLINE, ON_TRIP)
 */
export async function updateDriverStatus(driverId, status) {
  try {
    const globalStore = globalThis;
    const driver = (globalStore.__CAB_DRIVERS__ || []).find((d) => d.id === driverId);
    if (!driver) {
      return { success: false, error: 'Driver not found' };
    }

    driver.status = status;
    driver.available = status === 'AVAILABLE';

    return {
      success: true,
      message: `Driver status updated to ${status}`,
      status,
      available: driver.available,
    };
  } catch (err) {
    console.error('updateDriverStatus error:', err);
    return { success: false, error: 'Failed to update driver status' };
  }
}

/**
 * 9. Operator Booking View (Strictly for this operator's vehicles)
 */
export async function getOperatorBookings(operatorName) {
  try {
    const op = resolveOperator(operatorName);

    // 1. Bus Bookings
    const buses = await prisma.bus.findMany({
      where: { operatorName: { equals: op, mode: 'insensitive' } },
    });
    const busIds = buses.map((b) => b.id);

    const busBookings = await prisma.booking.findMany({
      where: { trip: { busId: { in: busIds } } },
      include: {
        trip: { include: { bus: true, route: true } },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 2. Cab Bookings
    const globalStore = globalThis;
    const cabBookings = (globalStore.__CAB_BOOKINGS__ || []).filter((b) => {
      const dOp = b.driver ? getDriverOperator(b.driver) : op;
      return dOp.toLowerCase() === op.toLowerCase();
    });

    const combined = [
      ...busBookings.map((b) => ({
        id: b.pnr || b.id,
        type: 'BUS',
        customerName: b.passengerDetails?.[0]?.name || b.user?.name || 'Traveler',
        customerPhone: b.contactPhone || 'N/A',
        vehicle: `${b.trip?.bus?.operatorName} (${b.trip?.bus?.busNumber})`,
        route: `${b.trip?.route?.source || 'City'} ➔ ${b.trip?.route?.destination || 'City'}`,
        date: b.trip?.departureTime
          ? new Date(b.trip.departureTime).toLocaleDateString()
          : getTodayIsoDate(),
        time: b.trip?.departureTime
          ? new Date(b.trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '09:00 PM',
        fare: Math.round(b.totalAmount * 84),
        status: b.bookingStatus === 'CONFIRMED' ? 'Confirmed' : b.bookingStatus === 'CANCELLED' ? 'Cancelled' : 'Upcoming',
      })),
      ...cabBookings.map((c) => ({
        id: c.bookingId || c.id,
        type: 'CAB',
        customerName: c.passenger?.name || 'Cab Rider',
        customerPhone: c.passenger?.phone || 'N/A',
        vehicle: `${c.vehicle?.model} (${c.vehicle?.number})`,
        route: `${c.trip?.pickup} ➔ ${c.trip?.drop}`,
        date: c.trip?.date || getTodayIsoDate(),
        time: c.trip?.time || '10:00 AM',
        fare: c.totalAmount,
        status: c.status === 'CONFIRMED' ? 'Confirmed' : c.status === 'CANCELLED' ? 'Cancelled' : 'Upcoming',
      })),
    ];

    // Sort by most recent
    combined.sort((a, b) => b.id.localeCompare(a.id));

    return { success: true, data: combined };
  } catch (err) {
    console.error('getOperatorBookings error:', err);
    return { success: false, error: 'Failed to retrieve bookings', data: [] };
  }
}

/**
 * 10. Operator Profile
 */
export async function getOperatorProfileDetails(operatorName) {
  try {
    const op = resolveOperator(operatorName);
    const profile = getOperatorProfile(op);
    return { success: true, data: profile };
  } catch (err) {
    console.error('getOperatorProfileDetails error:', err);
    return { success: false, error: 'Failed to retrieve profile' };
  }
}

export async function updateOperatorProfileDetails(operatorName, profileData) {
  try {
    const op = resolveOperator(operatorName);
    const updated = updateOperatorProfile(op, profileData);
    return {
      success: true,
      message: 'Operator profile updated successfully',
      data: updated,
    };
  } catch (err) {
    console.error('updateOperatorProfileDetails error:', err);
    return { success: false, error: 'Failed to update profile' };
  }
}
