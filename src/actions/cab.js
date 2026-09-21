'use server';

import { INITIAL_DRIVERS, CAB_CATEGORIES, CAB_OFFERS } from '@/lib/cabData';
import { calculateCabFare, getRouteDistance } from '@/lib/cabFare';
import { CabSearchSchema, CabCheckoutSchema } from '@/lib/cabValidations';
import { CITY_COORDS, getCanonicalCity } from '@/lib/cities';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Global In-Memory Persistent Store across Next.js Hot Reloads & Server Actions
// ---------------------------------------------------------------------------
const globalCabStore = globalThis;

if (!globalCabStore.__CAB_DRIVERS__) {
  // Deep clone initial drivers
  globalCabStore.__CAB_DRIVERS__ = JSON.parse(JSON.stringify(INITIAL_DRIVERS));
}

if (!globalCabStore.__CAB_BOOKINGS__) {
  globalCabStore.__CAB_BOOKINGS__ = [];
}

/**
 * Searches and returns ONLY drivers with available === true,
 * enriched with dynamic route fares, realistic ETAs, and distance metrics.
 */
export async function searchAvailableCabs(inputParams) {
  try {
    const validation = CabSearchSchema.safeParse(inputParams);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid search parameters',
        data: []
      };
    }

    const { pickup, drop, date, time, passengers, category, serviceType } = validation.data;
    const distanceKm = getRouteDistance(pickup, drop);

    // Retrieve drivers pool
    const allDrivers = globalCabStore.__CAB_DRIVERS__;

    // STRICT REQUIREMENT: Only show drivers where available === true
    let availableDrivers = allDrivers.filter((driver) => driver.available === true);

    // Optional category filter if passed
    if (category && category !== 'ALL') {
      availableDrivers = availableDrivers.filter(
        (driver) => driver.category.toUpperCase() === category.toUpperCase()
      );
    }

    // Filter by passenger capacity
    if (passengers > 4) {
      availableDrivers = availableDrivers.filter((driver) => driver.seats >= passengers);
    }

    // Enrich each available driver with calculated dynamic fare and route data
    const enrichedResults = availableDrivers.map((driver) => {
      const fareInfo = calculateCabFare({
        category: driver.category,
        distanceKm,
        pickupTime: time,
        passengers
      });

      const catObj = CAB_CATEGORIES.find((c) => c.id === driver.category) || CAB_CATEGORIES[1];

      return {
        ...driver,
        categoryName: catObj.displayName,
        categoryTagline: catObj.tagline,
        categoryFeatures: catObj.features,
        vehicleImage: driver.vehicleImage || catObj.image,
        route: {
          pickup,
          drop,
          date,
          time,
          passengers,
          distanceKm,
          estimatedMinutes: fareInfo.estimatedMinutes,
        },
        fare: fareInfo,
        totalFare: fareInfo.total,
        serviceType: serviceType || 'One Way'
      };
    });

    return {
      success: true,
      data: enrichedResults,
      meta: {
        pickup,
        drop,
        date,
        time,
        passengers,
        distanceKm,
        totalAvailable: enrichedResults.length
      }
    };
  } catch (err) {
    console.error('Error searching available cabs:', err);
    return { success: false, error: err.message || 'Failed to search cabs', data: [] };
  }
}

/**
 * Retrieves details for a specific driver and calculates full trip fare.
 */
export async function getCabById(driverId, searchContext = {}) {
  try {
    const driver = globalCabStore.__CAB_DRIVERS__.find((d) => d.id === driverId);
    if (!driver) {
      return { success: false, error: 'Driver not found' };
    }

    const pickup = searchContext.pickup || 'Chennai';
    const drop = searchContext.drop || 'Bangalore';
    const time = searchContext.time || '08:00 AM';
    const date = searchContext.date || new Date().toISOString().split('T')[0];
    const passengers = parseInt(searchContext.passengers || '1', 10);
    const couponCode = searchContext.couponCode || '';

    const distanceKm = getRouteDistance(pickup, drop);
    const fareInfo = calculateCabFare({
      category: driver.category,
      distanceKm,
      pickupTime: time,
      couponCode,
      passengers
    });

    const catObj = CAB_CATEGORIES.find((c) => c.id === driver.category) || CAB_CATEGORIES[1];

    return {
      success: true,
      data: {
        ...driver,
        categoryName: catObj.displayName,
        categoryTagline: catObj.tagline,
        categoryFeatures: catObj.features,
        vehicleImage: driver.vehicleImage || catObj.image,
        route: {
          pickup,
          drop,
          date,
          time,
          passengers,
          distanceKm,
          estimatedMinutes: fareInfo.estimatedMinutes,
        },
        fare: fareInfo,
        totalFare: fareInfo.total
      }
    };
  } catch (err) {
    console.error('Error getting cab details:', err);
    return { success: false, error: 'Failed to retrieve cab details' };
  }
}

/**
 * Creates a Cab Booking atomically:
 * 1. Checks driver availability.
 * 2. Sets driver.available = false immediately.
 * 3. Saves confirmed booking with CAB-XXXXXX ID.
 */
export async function createCabBooking(inputData) {
  try {
    const validation = CabCheckoutSchema.safeParse(inputData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid booking details'
      };
    }

    const {
      driverId,
      pickup,
      drop,
      date,
      time,
      passengerName,
      passengerPhone,
      passengerEmail,
      passengersCount,
      pickupAddress,
      dropAddress,
      couponCode,
      paymentMethod
    } = validation.data;

    // Check session if logged in
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = session?.user?.id || 'guest_user';

    // Atomic driver lookup and availability check
    const driverIndex = globalCabStore.__CAB_DRIVERS__.findIndex((d) => d.id === driverId);
    if (driverIndex === -1) {
      return { success: false, error: 'Selected driver does not exist.' };
    }

    const driver = globalCabStore.__CAB_DRIVERS__[driverIndex];
    if (!driver.available) {
      return {
        success: false,
        error: 'Sorry! This driver was just booked by another customer. Please choose another cab.'
      };
    }

    // Calculate final validated fare on server
    const distanceKm = getRouteDistance(pickup, drop);
    const fareInfo = calculateCabFare({
      category: driver.category,
      distanceKm,
      pickupTime: time,
      couponCode,
      passengers: passengersCount
    });

    // Generate unique 6-digit Cab Booking ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `CAB-${randomNum}`;

    const newBooking = {
      id: bookingId,
      bookingId,
      userId,
      driverId: driver.id,
      driver: {
        name: driver.name,
        phone: driver.phone,
        rating: driver.rating,
        trips: driver.trips,
        avatar: driver.avatar,
        experience: driver.experience,
        languages: driver.languages
      },
      vehicle: {
        model: driver.vehicleModel,
        number: driver.vehicleNumber,
        category: driver.category,
        ac: driver.ac,
        seats: driver.seats,
        luggage: driver.luggage,
        fuelType: driver.fuelType,
        color: driver.color,
        image: driver.vehicleImage
      },
      trip: {
        pickup,
        drop,
        pickupAddress: pickupAddress || `${pickup} Central Station / Airport Area`,
        dropAddress: dropAddress || `${drop} Main City Center`,
        date,
        time,
        passengers: passengersCount,
        distanceKm,
        estimatedMinutes: fareInfo.estimatedMinutes,
      },
      passenger: {
        name: passengerName,
        phone: passengerPhone,
        email: passengerEmail
      },
      fare: fareInfo,
      totalAmount: fareInfo.total,
      payment: {
        method: paymentMethod.toUpperCase(),
        status: 'PAID',
        transactionId: `TXN-CAB-${Date.now().toString().slice(-8)}`,
        paidAt: new Date().toISOString()
      },
      status: 'CONFIRMED', // CONFIRMED | ACTIVE | COMPLETED | CANCELLED
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // LOCK DRIVER AVAILABILITY: Set driver.available = false
    globalCabStore.__CAB_DRIVERS__[driverIndex].available = false;

    // Save booking into store
    globalCabStore.__CAB_BOOKINGS__.unshift(newBooking);

    return {
      success: true,
      bookingId: newBooking.bookingId,
      booking: newBooking
    };
  } catch (err) {
    console.error('Create Cab Booking Error:', err);
    return { success: false, error: err.message || 'Failed to complete booking' };
  }
}

/**
 * Cancels a Cab Booking:
 * 1. Sets booking.status = 'CANCELLED'
 * 2. Releases driver: driver.available = true
 * 3. Calculates refund.
 */
export async function cancelCabBooking(bookingId, reason = 'User requested cancellation') {
  try {
    const bookingIndex = globalCabStore.__CAB_BOOKINGS__.findIndex(
      (b) => b.bookingId === bookingId || b.id === bookingId
    );

    if (bookingIndex === -1) {
      return { success: false, error: 'Cab booking not found' };
    }

    const booking = globalCabStore.__CAB_BOOKINGS__[bookingIndex];
    if (booking.status === 'CANCELLED') {
      return { success: true, message: 'Booking is already cancelled' };
    }

    // Update booking status
    booking.status = 'CANCELLED';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date().toISOString();
    booking.refundAmount = booking.totalAmount; // 100% full refund policy
    booking.refundStatus = 'REFUNDED_TO_SOURCE';
    booking.updatedAt = new Date().toISOString();

    // RELEASE DRIVER BACK TO AVAILABLE POOL
    const driverIndex = globalCabStore.__CAB_DRIVERS__.findIndex((d) => d.id === booking.driverId);
    if (driverIndex !== -1) {
      globalCabStore.__CAB_DRIVERS__[driverIndex].available = true;
    }

    return {
      success: true,
      message: 'Cab booking cancelled successfully. 100% refund has been processed.',
      booking
    };
  } catch (err) {
    console.error('Cancel Cab Booking Error:', err);
    return { success: false, error: 'Failed to cancel booking' };
  }
}

/**
 * Returns user's cab bookings history.
 */
export async function getUserCabBookings() {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    let bookings = globalCabStore.__CAB_BOOKINGS__;

    if (userId || userEmail) {
      bookings = bookings.filter(
        (b) =>
          b.userId === userId ||
          (userEmail && b.passenger?.email?.toLowerCase() === userEmail.toLowerCase()) ||
          b.userId === 'guest_user'
      );
    }

    return { success: true, data: bookings };
  } catch (err) {
    console.error('Error fetching user cab bookings:', err);
    return { success: false, error: 'Failed to retrieve bookings', data: [] };
  }
}

/**
 * Returns single booking by ID.
 */
export async function getCabBookingById(bookingId) {
  try {
    const booking = globalCabStore.__CAB_BOOKINGS__.find(
      (b) => b.bookingId === bookingId || b.id === bookingId
    );

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    return { success: true, data: booking };
  } catch (err) {
    console.error('Error fetching booking:', err);
    return { success: false, error: 'Failed to retrieve booking' };
  }
}

/**
 * Computes simulated live tracking telemetry for a given booking:
 * - Driver's live moving location
 * - Route waypoints
 * - Remaining ETA countdown
 * - Speed, heading, driver status
 */
export async function getCabTrackingTelemetry(bookingId) {
  try {
    const booking = globalCabStore.__CAB_BOOKINGS__.find(
      (b) => b.bookingId === bookingId || b.id === bookingId
    );

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    const pickupCity = booking.trip.pickup;
    const dropCity = booking.trip.drop;

    const getCityLatLng = (city) => {
      const canonical = getCanonicalCity(city);
      const coords = CITY_COORDS[canonical];
      if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return [coords.lat, coords.lng];
      }
      return [13.0827, 80.2707];
    };

    const startCoords = getCityLatLng(pickupCity);
    const endCoords = getCityLatLng(dropCity);

    // Compute progress ratio based on elapsed time since booking (simulating 5 min arrival / trip)
    const elapsedSeconds = Math.max(0, (Date.now() - new Date(booking.createdAt).getTime()) / 1000);
    
    // Simulate driver movement: Start at nearby offset -> Arriving at pickup -> On trip to destination
    let driverLat, driverLng, speed, heading, tripStatusText, remainingMinutes;

    if (elapsedSeconds < 60) {
      // Driver is 1-2 km away, moving towards pickup
      const offsetRatio = Math.min(1, elapsedSeconds / 60);
      driverLat = startCoords[0] + 0.015 * (1 - offsetRatio);
      driverLng = startCoords[1] + 0.015 * (1 - offsetRatio);
      speed = 38 + Math.round(Math.sin(elapsedSeconds) * 4);
      heading = 210;
      tripStatusText = 'Driver is heading towards your pickup location';
      remainingMinutes = Math.max(1, Math.ceil((60 - elapsedSeconds) / 12));
    } else if (elapsedSeconds < 120) {
      // Driver arrived at pickup
      driverLat = startCoords[0];
      driverLng = startCoords[1];
      speed = 0;
      heading = 0;
      tripStatusText = 'Driver has arrived at pickup point (Share OTP to start)';
      remainingMinutes = 0;
    } else {
      // On the highway towards destination
      const tripProgress = Math.min(0.95, (elapsedSeconds - 120) / 600);
      driverLat = startCoords[0] + (endCoords[0] - startCoords[0]) * tripProgress;
      driverLng = startCoords[1] + (endCoords[1] - startCoords[1]) * tripProgress;
      speed = 65 + Math.round(Math.sin(elapsedSeconds) * 8);
      heading = 265;
      tripStatusText = 'En route to destination';
      remainingMinutes = Math.max(5, Math.ceil(booking.trip.estimatedMinutes * (1 - tripProgress)));
    }

    return {
      success: true,
      data: {
        bookingId: booking.bookingId,
        driverStatus: booking.status === 'CANCELLED' ? 'Trip Cancelled' : tripStatusText,
        driverLocation: [driverLat, driverLng],
        pickupCoords: startCoords,
        dropCoords: endCoords,
        speed,
        heading,
        remainingMinutes,
        otp: booking.otp,
        driver: booking.driver,
        vehicle: booking.vehicle,
        trip: booking.trip
      }
    };
  } catch (err) {
    console.error('Error fetching cab telemetry:', err);
    return { success: false, error: 'Failed to fetch telemetry' };
  }
}

/**
 * Validates a coupon code on server.
 */
export async function validateCabCoupon(code, fareAmount) {
  try {
    if (!code) return { success: false, error: 'Please enter a coupon code' };

    const coupon = CAB_OFFERS.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );

    if (!coupon) {
      return { success: false, error: 'Invalid coupon code. Try CAB50 or FIRSTCAB' };
    }

    if (fareAmount < (coupon.minFare || 0)) {
      return {
        success: false,
        error: `Minimum fare of ₹${coupon.minFare} required for coupon ${coupon.code}`
      };
    }

    let discount = 0;
    if (coupon.isPercent) {
      const raw = Math.round((fareAmount * coupon.discount) / 100);
      discount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    } else {
      discount = coupon.discount;
    }

    return {
      success: true,
      discount,
      coupon
    };
  } catch (err) {
    return { success: false, error: 'Failed to validate coupon' };
  }
}
