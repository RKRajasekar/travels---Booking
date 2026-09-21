const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Clean Database
  await prisma.liveTracker.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.route.deleteMany({});
  await prisma.bus.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const adminPassHash = await bcrypt.hash('R@jasekar2004', 12);
  const mainAdmin = await prisma.user.create({
    data: {
      id: '6a914eca3a0e7658529e1fb1',
      name: 'Ajai Raja (Admin)',
      email: 'ajairaja2004@gmail.com',
      password: adminPassHash,
      role: 'ADMIN',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@nextbus.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const driver = await prisma.user.create({
    data: {
      name: 'Ramesh Kumar',
      email: 'driver@nextbus.com',
      password: passwordHash,
      role: 'DRIVER',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Suresh Raina',
      email: 'user@nextbus.com',
      password: passwordHash,
      role: 'USER',
    },
  });

  console.log('Users created:', { mainAdmin: mainAdmin.email, admin: admin.email, driver: driver.email, user: user.email });

  // 3. Create 10 Premium Buses / Operators
  const buses = [
    {
      id: '65f123456789abcdef000001', // fixed ID for driver simulation
      busNumber: 'TN-37-BY-8899',
      operatorName: 'Parveen Travels',
      registrationNumber: 'REG-TN37-8899',
      busType: 'AC_SLEEPER',
      totalSeats: 30,
    },
    {
      busNumber: 'KA-01-MJ-5566',
      operatorName: 'KPN Travels',
      registrationNumber: 'REG-KA01-5566',
      busType: 'AC_SEATER',
      totalSeats: 40,
    },
    {
      busNumber: 'TN-01-AX-1122',
      operatorName: 'SRS Travels',
      registrationNumber: 'REG-TN01-1122',
      busType: 'SLEEPER',
      totalSeats: 30,
    },
    {
      busNumber: 'KA-25-F-9988',
      operatorName: 'VRL Travels',
      registrationNumber: 'REG-KA25-9988',
      busType: 'AC_SLEEPER',
      totalSeats: 30,
    },
    {
      busNumber: 'AP-02-TJ-7788',
      operatorName: 'Orange Tours & Travels',
      registrationNumber: 'REG-AP02-7788',
      busType: 'AC_SLEEPER',
      totalSeats: 30,
    },
    {
      busNumber: 'DL-01-SB-1212',
      operatorName: 'IntrCity SmartBus',
      registrationNumber: 'REG-DL01-1212',
      busType: 'AC_SLEEPER',
      totalSeats: 30,
    },
    {
      busNumber: 'KA-57-F-4455',
      operatorName: 'KSRTC',
      registrationNumber: 'REG-KA57-4455',
      busType: 'SEATER',
      totalSeats: 40,
    },
    {
      busNumber: 'TN-58-N-2233',
      operatorName: 'TNSTC',
      registrationNumber: 'REG-TN58-2233',
      busType: 'SEATER',
      totalSeats: 40,
    },
    {
      busNumber: 'TN-01-AN-6677',
      operatorName: 'SETC',
      registrationNumber: 'REG-TN01-6677',
      busType: 'AC_SEATER',
      totalSeats: 36,
    },
    {
      busNumber: 'TN-07-ZZ-9900',
      operatorName: 'YBM Travels',
      registrationNumber: 'REG-TN07-9900',
      busType: 'AC_SLEEPER',
      totalSeats: 30,
    },
  ];

  const createdBuses = [];
  for (const b of buses) {
    const cb = await prisma.bus.create({ data: b });
    createdBuses.push(cb);
  }
  console.log(`${createdBuses.length} Buses created.`);

  // 4. Create Routes
  const routes = [
    {
      source: 'Chennai',
      destination: 'Coimbatore',
      distance: 500,
      duration: '7h 30m',
      stops: ['Salem'],
    },
    {
      source: 'Chennai',
      destination: 'Madurai',
      distance: 460,
      duration: '8h 15m',
      stops: ['Trichy'],
    },
    {
      source: 'Chennai',
      destination: 'Bangalore',
      distance: 350,
      duration: '6h 10m',
      stops: ['Vellore', 'Hosur'],
    },
    {
      source: 'Coimbatore',
      destination: 'Chennai',
      distance: 500,
      duration: '7h 30m',
      stops: ['Salem'],
    },
    {
      source: 'Madurai',
      destination: 'Chennai',
      distance: 460,
      duration: '8h 15m',
      stops: ['Trichy'],
    },
  ];

  const createdRoutes = [];
  for (const r of routes) {
    const cr = await prisma.route.create({ data: r });
    createdRoutes.push(cr);
  }
  console.log(`${createdRoutes.length} Routes created.`);

  // 5. Create Trips (Scheduled for tomorrow and the day after)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(21, 0, 0, 0); // 9:00 PM tomorrow

  const tomorrowArrival = new Date(tomorrow);
  tomorrowArrival.setHours(tomorrowArrival.getHours() + 7);
  tomorrowArrival.setMinutes(tomorrowArrival.getMinutes() + 30);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(22, 0, 0, 0); // 10:00 PM day after

  const dayAfterArrival = new Date(dayAfter);
  dayAfterArrival.setHours(dayAfterArrival.getHours() + 8);
  dayAfterArrival.setMinutes(dayAfterArrival.getMinutes() + 15);

  // Define prices mapping for operators to simulate various cost ranges
  const operatorPrices = {
    'Parveen Travels': 15.0, // ~ ₹1260
    'KPN Travels': 12.0,     // ~ ₹1000
    'SRS Travels': 9.5,      // ~ ₹800
    'VRL Travels': 18.0,     // ~ ₹1500 (Above 1200)
    'Orange Tours & Travels': 22.0, // ~ ₹1850 (Above 1600)
    'IntrCity SmartBus': 20.0, // ~ ₹1680 (Above 1600)
    'KSRTC': 5.0,            // ~ ₹420 (Under 500)
    'TNSTC': 4.5,            // ~ ₹380 (Under 500)
    'SETC': 8.0,             // ~ ₹670 (500 - 800)
    'YBM Travels': 14.5,     // ~ ₹1220 (1200 - 1600)
  };

  // Schedule Trips for tomorrow
  let tripCount = 0;
  for (let i = 0; i < createdBuses.length; i++) {
    const bus = createdBuses[i];
    const price = operatorPrices[bus.operatorName] || 10.0;
    
    // Distribute routes
    const routeIndex = i % 3; // Routes from Chennai (Chennai-Coimbatore, Chennai-Madurai, Chennai-Bangalore)
    const route = createdRoutes[routeIndex];

    await prisma.trip.create({
      data: {
        busId: bus.id,
        routeId: route.id,
        departureTime: tomorrow,
        arrivalTime: tomorrowArrival,
        price,
        status: 'SCHEDULED',
        availableSeats: bus.totalSeats - 5,
      },
    });
    tripCount++;
  }

  // Schedule Return Trips for day after
  for (let i = 0; i < createdBuses.length; i++) {
    const bus = createdBuses[i];
    const price = operatorPrices[bus.operatorName] || 10.0;

    // Distribute return routes (Coimbatore-Chennai, Madurai-Chennai)
    const routeIndex = 3 + (i % 2); 
    const route = createdRoutes[routeIndex];

    await prisma.trip.create({
      data: {
        busId: bus.id,
        routeId: route.id,
        departureTime: dayAfter,
        arrivalTime: dayAfterArrival,
        price,
        status: 'SCHEDULED',
        availableSeats: bus.totalSeats - 8,
      },
    });
    tripCount++;
  }

  console.log(`${tripCount} Trips created.`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
