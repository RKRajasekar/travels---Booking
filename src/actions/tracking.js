'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GpsUpdateSchema } from '@/lib/validations';

export async function updateGpsPosition(input) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'DRIVER' && session.user.role !== 'ADMIN') {
      return { success: false, error: 'Access denied. Only DRIVER or ADMIN can update coordinates.' };
    }

    const validation = GpsUpdateSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid coordinates input' };
    }

    const { busId, latitude, longitude, speed, heading } = validation.data;

    // Create a new tracker entry
    const tracker = await prisma.liveTracker.create({
      data: {
        busId,
        latitude,
        longitude,
        speed,
        heading,
      },
    });

    return { success: true, tracker: { ...tracker, timestamp: tracker.timestamp.toISOString() } };
  } catch (err) {
    console.error('Update GPS position error:', err);
    return { success: false, error: 'Failed to record coordinates' };
  }
}

export async function getLatestGpsPosition(busId) {
  try {
    const tracker = await prisma.liveTracker.findFirst({
      where: { busId },
      orderBy: { timestamp: 'desc' },
    });

    if (!tracker) {
      return { success: false, error: 'No live tracking data available' };
    }

    return {
      success: true,
      tracker: {
        ...tracker,
        timestamp: tracker.timestamp.toISOString(),
      },
    };
  } catch (err) {
    console.error('Get latest GPS error:', err);
    return { success: false, error: 'Failed to fetch GPS coordinates' };
  }
}

export async function getDriverTrips() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        bus: true,
        route: true,
      },
      orderBy: { departureTime: 'asc' },
    });

    return {
      success: true,
      trips: trips.map((t) => ({
        id: t.id,
        busId: t.busId,
        operatorName: t.bus.operatorName,
        busNumber: t.bus.busNumber,
        source: t.route.source,
        destination: t.route.destination,
        departureTime: t.departureTime.toISOString(),
      })),
    };
  } catch (err) {
    console.error('getDriverTrips error:', err);
    return { success: false, error: 'Failed to fetch scheduled trips' };
  }
}
