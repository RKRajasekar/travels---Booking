'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CheckoutSchema } from '@/lib/validations';
import { generatePNR, calculateFare } from '@/lib/utils';
import { sendBookingConfirmationSMS } from '@/lib/sms';

function serializeBooking(booking) {
  if (!booking) return null;

  const toIso = (val) => {
    if (!val) return new Date().toISOString();
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    if (val.toISOString) return val.toISOString();
    return new Date().toISOString();
  };

  return {
    ...booking,
    id: booking.id ? booking.id.toString() : '',
    userId: booking.userId ? booking.userId.toString() : '',
    tripId: booking.tripId ? booking.tripId.toString() : '',
    seatNumbers: Array.isArray(booking.seatNumbers) ? booking.seatNumbers : [],
    passengerDetails: Array.isArray(booking.passengerDetails) ? booking.passengerDetails : [],
    boardingPoint: booking.boardingPoint || 'Boarding Point',
    droppingPoint: booking.droppingPoint || 'Dropping Point',
    totalAmount: typeof booking.totalAmount === 'number' ? booking.totalAmount : Number(booking.totalAmount) || 0,
    bookingStatus: booking.bookingStatus || 'CONFIRMED',
    paymentStatus: booking.paymentStatus || 'PAID',
    contactPhone: booking.contactPhone || '',
    contactEmail: booking.contactEmail || '',
    pnr: booking.pnr || '',
    qrCode: booking.qrCode || '',
    createdAt: toIso(booking.createdAt),
    updatedAt: toIso(booking.updatedAt),
    trip: booking.trip ? {
      ...booking.trip,
      id: booking.trip.id ? booking.trip.id.toString() : '',
      busId: booking.trip.busId ? booking.trip.busId.toString() : '',
      routeId: booking.trip.routeId ? booking.trip.routeId.toString() : '',
      departureTime: toIso(booking.trip.departureTime),
      arrivalTime: toIso(booking.trip.arrivalTime),
      price: typeof booking.trip.price === 'number' ? booking.trip.price : Number(booking.trip.price) || 0,
      status: booking.trip.status || 'SCHEDULED',
      availableSeats: booking.trip.availableSeats ?? 30,
      createdAt: toIso(booking.trip.createdAt),
      updatedAt: toIso(booking.trip.updatedAt),
      bus: booking.trip.bus ? {
        ...booking.trip.bus,
        id: booking.trip.bus.id ? booking.trip.bus.id.toString() : '',
        busNumber: booking.trip.bus.busNumber || 'N/A',
        operatorName: booking.trip.bus.operatorName || 'Express Coach',
        registrationNumber: booking.trip.bus.registrationNumber || 'N/A',
        busType: booking.trip.bus.busType || 'AC_SEATER',
        totalSeats: booking.trip.bus.totalSeats || 40,
        createdAt: toIso(booking.trip.bus.createdAt),
        updatedAt: toIso(booking.trip.bus.updatedAt),
      } : {
        id: '',
        busNumber: 'N/A',
        operatorName: 'Express Coach',
        registrationNumber: 'N/A',
        busType: 'AC_SEATER',
        totalSeats: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      route: booking.trip.route ? {
        ...booking.trip.route,
        id: booking.trip.route.id ? booking.trip.route.id.toString() : '',
        source: booking.trip.route.source || 'Departure City',
        destination: booking.trip.route.destination || 'Arrival City',
        distance: booking.trip.route.distance || 0,
        duration: booking.trip.route.duration || 'N/A',
        stops: Array.isArray(booking.trip.route.stops) ? booking.trip.route.stops : [],
        createdAt: toIso(booking.trip.route.createdAt),
        updatedAt: toIso(booking.trip.route.updatedAt),
      } : {
        id: '',
        source: 'Departure City',
        destination: 'Arrival City',
        distance: 0,
        duration: 'N/A',
        stops: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    } : {
      id: booking.tripId ? booking.tripId.toString() : '',
      busId: '',
      routeId: '',
      departureTime: new Date().toISOString(),
      arrivalTime: new Date().toISOString(),
      price: Number(booking.totalAmount) || 0,
      status: 'SCHEDULED',
      availableSeats: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bus: {
        id: '',
        busNumber: 'N/A',
        operatorName: 'Express Coach',
        registrationNumber: 'N/A',
        busType: 'AC_SEATER',
        totalSeats: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      route: {
        id: '',
        source: 'Departure City',
        destination: 'Arrival City',
        distance: 0,
        duration: 'N/A',
        stops: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    user: booking.user ? {
      id: booking.user.id ? booking.user.id.toString() : '',
      name: booking.user.name || 'Passenger',
      email: booking.user.email || '',
      role: booking.user.role || 'USER',
      createdAt: toIso(booking.user.createdAt),
      updatedAt: toIso(booking.user.updatedAt),
    } : {
      id: booking.userId ? booking.userId.toString() : '',
      name: booking.contactEmail ? booking.contactEmail.split('@')[0] : 'Passenger',
      email: booking.contactEmail || '',
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}


export async function createBooking(input) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: 'Unauthorized. Please log in to book tickets.' };
    }

    const validation = CheckoutSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid form input' };
    }

    const { tripId, selectedSeats, passengerDetails, contactEmail, contactPhone, boardingPoint, droppingPoint, discountAmount } = validation.data;

    // Run the booking sequence in a secure atomic transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Fetch trip and check if exists
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { bus: true, route: true },
      });

      if (!trip) {
        throw new Error('Selected trip does not exist.');
      }

      if (trip.status === 'CANCELLED') {
        throw new Error('This trip has been cancelled.');
      }

      // 2. Validate selected seats count
      if (selectedSeats.length > 6) {
        throw new Error('You can book a maximum of 6 seats at a time.');
      }

      // 3. Check if seats are already booked
      const existingBookings = await tx.booking.findMany({
        where: {
          tripId,
          bookingStatus: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      const bookedSeats = new Set();
      existingBookings.forEach((b) => {
        b.seatNumbers.forEach((seat) => bookedSeats.add(seat));
      });

      const doubleBooked = selectedSeats.filter((seat) => bookedSeats.has(seat));
      if (doubleBooked.length > 0) {
        throw new Error('One or more selected seats are no longer available.');
      }

      // 4. Calculate fare on server
      const { total } = calculateFare(trip.price, selectedSeats.length, discountAmount);

      // 5. Generate PNR and QR verification code
      const pnr = generatePNR();
      const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const qrCode = `${nextAuthUrl}/api/tickets/verify?pnr=${pnr}`;

      // 6. Create booking
      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          tripId,
          seatNumbers: selectedSeats,
          passengerDetails: passengerDetails,
          boardingPoint,
          droppingPoint,
          totalAmount: total,
          bookingStatus: 'PENDING',
          paymentStatus: 'PENDING',
          contactPhone,
          contactEmail,
          pnr,
          qrCode,
        },
      });

      // 7. Recalculate and update available seats on the trip
      const totalBookedSeatsCount = bookedSeats.size + selectedSeats.length;
      const availableSeatsCount = Math.max(0, trip.bus.totalSeats - totalBookedSeatsCount);

      await tx.trip.update({
        where: { id: tripId },
        data: { availableSeats: availableSeatsCount },
      });

      return newBooking;
    });

    return {
      success: true,
      bookingId: booking.id,
      pnr: booking.pnr,
      totalAmount: booking.totalAmount,
    };
  } catch (err) {
    console.error('Booking Transaction error:', err);
    return {
      success: false,
      error: err.message || 'An error occurred while booking. Please try again.',
    };
  }
}

export async function processMockPayment(bookingId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { trip: { include: { bus: true } } },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.paymentStatus === 'PAID') {
        return booking;
      }

      // Mark the booking as PAID and CONFIRMED
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
        include: {
          trip: {
            include: {
              bus: true,
              route: true,
            },
          },
        },
      });

      return updatedBooking;
    });

    // Send confirmation SMS asynchronously
    if (result && result.contactPhone) {
      try {
        await sendBookingConfirmationSMS({
          phone: result.contactPhone,
          booking: result,
        });
      } catch (smsErr) {
        console.error('Failed to send booking SMS:', smsErr);
      }
    }

    return { success: true, booking: serializeBooking(result) };
  } catch (err) {
    console.error('Mock payment error:', err);
    return { success: false, error: err.message || 'Payment verification failed' };
  }
}

export async function cancelBooking(bookingId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { trip: { include: { bus: true } } },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Authorization check: only Admin or owner can cancel
      if (session.user.role !== 'ADMIN' && booking.userId !== session.user.id) {
        throw new Error('Unauthorized to cancel this booking');
      }

      if (booking.bookingStatus === 'CANCELLED') {
        return;
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: 'CANCELLED',
          paymentStatus: 'FAILED',
        },
      });

      // Recalculate and update available seats on the trip
      const allActiveBookings = await tx.booking.findMany({
        where: {
          tripId: booking.tripId,
          bookingStatus: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      const bookedSeatsCount = allActiveBookings.reduce((sum, b) => sum + b.seatNumbers.length, 0);
      const availableSeatsCount = Math.max(0, (booking.trip?.bus?.totalSeats || 40) - bookedSeatsCount);

      await tx.trip.update({
        where: { id: booking.tripId },
        data: { availableSeats: availableSeatsCount },
      });
    });

    return { success: true, message: 'Booking cancelled successfully' };
  } catch (err) {
    console.error('Cancel booking error:', err);
    return { success: false, error: err.message || 'Failed to cancel booking' };
  }
}

export async function getMyBookings() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const whereConditions = [
      { userId: session.user.id }
    ];

    if (session.user.email) {
      whereConditions.push({ contactEmail: session.user.email });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        trip: {
          include: { bus: true, route: true },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = bookings.map(serializeBooking).filter(Boolean);
    return { success: true, data: serialized };
  } catch (err) {
    console.error('Get my bookings error:', err);
    return { success: false, error: 'Failed to retrieve bookings' };
  }
}

export async function getBookingDetails(bookingId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: {
          include: { bus: true, route: true },
        },
        user: true,
      },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Owner or admin check
    if (session.user.role !== 'ADMIN' && booking.userId !== session.user.id) {
      return { success: false, error: 'Unauthorized to view this booking' };
    }

    return { success: true, data: serializeBooking(booking) };
  } catch (err) {
    console.error('Get booking details error:', err);
    return { success: false, error: 'Failed to retrieve booking details' };
  }
}

export async function getTripBookedSeats(tripId) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        tripId,
        bookingStatus: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: {
        seatNumbers: true,
      },
    });

    const bookedSeats = bookings.flatMap((b) => b.seatNumbers);
    return { success: true, bookedSeats };
  } catch (err) {
    console.error('Get booked seats error:', err);
    return { success: false, error: 'Failed to fetch booked seats' };
  }
}
