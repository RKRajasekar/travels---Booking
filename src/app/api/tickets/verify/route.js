import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, 'http://localhost');
    const pnr = searchParams.get('pnr');

    if (!pnr) {
      return Response.json({ success: false, error: 'PNR query parameter is required.' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { pnr },
      include: {
        user: { select: { name: true, email: true } },
        trip: {
          include: {
            bus: { select: { operatorName: true, busNumber: true } },
            route: { select: { source: true, destination: true } },
          },
        },
      },
    });

    if (!booking) {
      return Response.json({ success: false, error: 'PNR not found. Invalid boarding ticket.' }, { status: 404 });
    }

    const departureTimeStr = booking.trip?.departureTime ? new Date(booking.trip.departureTime).toISOString() : new Date().toISOString();
    const arrivalTimeStr = booking.trip?.arrivalTime ? new Date(booking.trip.arrivalTime).toISOString() : new Date().toISOString();

    return Response.json({
      success: true,
      verified: true,
      pnr: booking.pnr,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      passengerDetails: Array.isArray(booking.passengerDetails) ? booking.passengerDetails : [],
      seats: Array.isArray(booking.seatNumbers) ? booking.seatNumbers : [],
      boardingPoint: booking.boardingPoint || '',
      droppingPoint: booking.droppingPoint || '',
      totalAmount: booking.totalAmount || 0,
      trip: {
        departureTime: departureTimeStr,
        arrivalTime: arrivalTimeStr,
        source: booking.trip?.route?.source || 'Departure Point',
        destination: booking.trip?.route?.destination || 'Arrival Point',
        operator: booking.trip?.bus?.operatorName || 'Express Coach',
        busNumber: booking.trip?.bus?.busNumber || 'N/A',
      },
      passenger: booking.user?.name || (Array.isArray(booking.passengerDetails) && booking.passengerDetails[0]?.name) || 'Passenger',
      email: booking.user?.email || booking.contactEmail || '',
    });
  } catch (err) {
    console.error('API ticket verification error:', err);
    return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
