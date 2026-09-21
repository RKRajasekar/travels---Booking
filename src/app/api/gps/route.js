import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GpsUpdateSchema } from '@/lib/validations';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'DRIVER' && session.user.role !== 'ADMIN') {
      return Response.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const validation = GpsUpdateSchema.safeParse(body);

    if (!validation.success) {
      return Response.json({ success: false, error: validation.error.errors[0]?.message }, { status: 400 });
    }

    const { busId, latitude, longitude, speed, heading } = validation.data;

    const tracker = await prisma.liveTracker.create({
      data: {
        busId,
        latitude,
        longitude,
        speed,
        heading,
      },
    });

    return Response.json({ success: true, data: tracker });
  } catch (err) {
    console.error('API GPS update error:', err);
    return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
