import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const busId = params.busId;

  let lastSentTimestamp = new Date(0);

  const responseStream = new ReadableStream({
    async start(controller) {
      // Helper function to push data to stream
      const push = (eventName, data) => {
        controller.enqueue(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const pushHeartbeat = () => {
        controller.enqueue(': heartbeat\n\n');
      };

      // Heartbeat timer to keep connection alive
      const heartbeatInterval = setInterval(() => {
        pushHeartbeat();
      }, 15000);

      // Main tracking loop
      const trackingInterval = setInterval(async () => {
        try {
          const latestTracker = await prisma.liveTracker.findFirst({
            where: {
              busId,
              timestamp: { gt: lastSentTimestamp },
            },
            orderBy: { timestamp: 'desc' },
          });

          if (latestTracker) {
            lastSentTimestamp = latestTracker.timestamp;
            push('message', {
              latitude: latestTracker.latitude,
              longitude: latestTracker.longitude,
              speed: latestTracker.speed,
              heading: latestTracker.heading,
              timestamp: latestTracker.timestamp.toISOString(),
            });
          }
        } catch (err) {
          console.error('SSE Tracker pull error:', err);
        }
      }, 4000); // Check for new coords database entries every 4 seconds

      // Clean up when connection closes
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        clearInterval(trackingInterval);
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
