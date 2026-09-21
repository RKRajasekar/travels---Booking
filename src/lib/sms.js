export async function sendBookingConfirmationSMS({ phone, booking }) {
  const pnr = booking.pnr;
  const source = booking.trip.route.source;
  const destination = booking.trip.route.destination;
  
  // Format departure date/time
  const depDate = new Date(booking.trip.departureTime);
  const formattedDate = depDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  const formattedTime = depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const seats = booking.seatNumbers.join(', ');
  const message = `NextBus Booking Confirmed!\n\nPNR: ${pnr}\n${source} → ${destination}\n${formattedDate}\n${formattedTime}\nSeat: ${seats}\n\nThank you for travelling with NextBus.`;

  const smsProvider = process.env.SMS_PROVIDER;
  const smsApiKey = process.env.SMS_API_KEY;

  if (!smsProvider || !smsApiKey) {
    // Development-safe mode logging
    console.log(`
┌────────────────────────────────────────────────────────┐
│               [SMS DEV-SAFE SANDBOX MODE]              │
├────────────────────────────────────────────────────────┤
│ To: ${phone.padEnd(51)} │
│                                                        │
│ Message:                                               │
${message.split('\n').map(line => `│   ${line.padEnd(49)}   │`).join('\n')}
│                                                        │
└────────────────────────────────────────────────────────┘
`);
    return { success: true, sandbox: true };
  }

  // Real SMS API dispatch simulation
  try {
    console.log(`Sending real SMS via ${smsProvider} to ${phone}...`);
    // Example call implementation could go here
    return { success: true, provider: smsProvider };
  } catch (err) {
    console.error('Failed to send SMS via provider:', err);
    return { success: false, error: err.message };
  }
}
