// Centralized in-memory persistent store across server actions and dev hot-reloads
const globalStore = globalThis;

export const DEFAULT_OPERATORS = [
  {
    id: 'op-kpn',
    name: 'KPN Travels',
    ownerName: 'K. P. Natarajan',
    email: 'kpn@travelowner.com',
    phone: '+91 94432 11223',
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    address: '124 KPN Complex, Opp. New Bus Stand, Salem, Tamil Nadu - 636004',
    gstNumber: '33AAACK1234F1Z8',
    supportContact: '+91 427 2333888 (24x7 Support Desk)',
    establishedYear: '1972',
    fleetCount: '45 Coaches & 18 Cabs',
    rating: 4.8,
  },
  {
    id: 'op-vrl',
    name: 'VRL Travels',
    ownerName: 'Vijay Sankeshwar',
    email: 'vrl@travelowner.com',
    phone: '+91 83622 37511',
    logo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80',
    address: 'VRL Logistics Hub, Giriraj Annexe, Circuit House Road, Hubli, Karnataka - 580029',
    gstNumber: '29AAACV5678B1Z2',
    supportContact: '0836-2307800 (Toll Free: 1800 599 7800)',
    establishedYear: '1976',
    fleetCount: '62 Coaches & 24 Cabs',
    rating: 4.7,
  },
  {
    id: 'op-parveen',
    name: 'Parveen Travels',
    ownerName: 'A. Afzal',
    email: 'parveen@travelowner.com',
    phone: '+91 98409 99888',
    logo: 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?auto=format&fit=crop&w=400&q=80',
    address: '148 Perambur Barracks Road, Purasawalkam, Chennai, Tamil Nadu - 600007',
    gstNumber: '33AAACP9012D1Z5',
    supportContact: '+91 44 4900 4900',
    establishedYear: '1980',
    fleetCount: '38 Coaches & 15 Cabs',
    rating: 4.6,
  },
  {
    id: 'op-orange',
    name: 'Orange Tours & Travels',
    ownerName: 'M. Sunil Kumar',
    email: 'orange@travelowner.com',
    phone: '+91 92465 55888',
    logo: 'https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=400&q=80',
    address: 'Orange Plaza, Beside Mythrivanam, Ameerpet, Hyderabad, Telangana - 500016',
    gstNumber: '36AAFCO3456K1Z9',
    supportContact: '+91 40 3355 9999',
    establishedYear: '2011',
    fleetCount: '52 Coaches & 20 Cabs',
    rating: 4.8,
  },
  {
    id: 'op-srm',
    name: 'SRM Travels',
    ownerName: 'Ravi Pachamoothoo',
    email: 'srm@travelowner.com',
    phone: '+91 44 2499 7788',
    logo: 'https://images.unsplash.com/photo-1494515426402-f1980ace7a9c?auto=format&fit=crop&w=400&q=80',
    address: 'SRM Transport Terminal, Koyambedu, Chennai, Tamil Nadu - 600107',
    gstNumber: '33AAACS7890H1Z3',
    supportContact: '+91 44 4900 3300',
    establishedYear: '1998',
    fleetCount: '40 Coaches & 16 Cabs',
    rating: 4.6,
  },
  {
    id: 'op-greenline',
    name: 'GreenLine Travels',
    ownerName: 'R. K. Sharma',
    email: 'greenline@travelowner.com',
    phone: '+91 80 2222 9900',
    logo: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=400&q=80',
    address: 'GreenLine Hub, Majestic, Bangalore, Karnataka - 560009',
    gstNumber: '29AAACG4321P1Z7',
    supportContact: '080-2222-9900',
    establishedYear: '2005',
    fleetCount: '35 Coaches & 12 Cabs',
    rating: 4.7,
  },
];

// Initialize global in-memory state
if (!globalStore.__OPERATOR_PROFILES__) {
  globalStore.__OPERATOR_PROFILES__ = {};
}
DEFAULT_OPERATORS.forEach((op) => {
  globalStore.__OPERATOR_PROFILES__[op.name] = {
    ...(globalStore.__OPERATOR_PROFILES__[op.name] || {}),
    ...op,
  };
});

// busAvailability map: key = busId or registrationNumber or busNumber -> 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE' | 'COMPLETED'
if (!globalStore.__BUS_AVAILABILITY__) {
  globalStore.__BUS_AVAILABILITY__ = {};
}

// tripStatus map: key = tripId -> 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'UNAVAILABLE'
if (!globalStore.__TRIP_OVERRIDES__) {
  globalStore.__TRIP_OVERRIDES__ = {};
}

// Map each cab/driver in global store to an operator
export function getDriverOperator(driver) {
  if (driver.operatorName) return driver.operatorName;
  // Deterministic mapping based on driver ID or index
  const index = parseInt((driver.id || '101').replace(/\D/g, ''), 10) || 101;
  const operatorNames = ['KPN Travels', 'VRL Travels', 'Parveen Travels', 'Orange Tours & Travels'];
  return operatorNames[index % operatorNames.length];
}

export function getOperatorProfile(operatorName) {
  if (!operatorName) return DEFAULT_OPERATORS[0];
  return globalStore.__OPERATOR_PROFILES__[operatorName] || {
    id: `op-${operatorName.toLowerCase().replace(/\s+/g, '-')}`,
    name: operatorName,
    ownerName: 'Travel Fleet Owner',
    email: `owner@${operatorName.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: '+91 98400 12345',
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=120&q=80',
    address: `${operatorName} Headquarters, Prime Transport Terminal`,
    gstNumber: '33AAACK8899F1Z0',
    supportContact: '+91 800 200 4000',
    establishedYear: '2015',
    fleetCount: '25 Vehicles',
    rating: 4.7,
  };
}

export function updateOperatorProfile(operatorName, data) {
  if (!globalStore.__OPERATOR_PROFILES__[operatorName]) {
    globalStore.__OPERATOR_PROFILES__[operatorName] = getOperatorProfile(operatorName);
  }
  globalStore.__OPERATOR_PROFILES__[operatorName] = {
    ...globalStore.__OPERATOR_PROFILES__[operatorName],
    ...data,
  };
  return globalStore.__OPERATOR_PROFILES__[operatorName];
}

export function getBusAvailability(busIdentifier) {
  return globalStore.__BUS_AVAILABILITY__[busIdentifier] || 'AVAILABLE';
}

export function setBusAvailability(busIdentifier, status) {
  globalStore.__BUS_AVAILABILITY__[busIdentifier] = status;
  return status;
}

export function isBusAvailable(bus) {
  if (!bus) return true;
  const statusById = bus.id ? globalStore.__BUS_AVAILABILITY__[bus.id] : null;
  const statusByReg = bus.registrationNumber ? globalStore.__BUS_AVAILABILITY__[bus.registrationNumber] : null;
  const statusByNum = bus.busNumber ? globalStore.__BUS_AVAILABILITY__[bus.busNumber] : null;

  const currentStatus = statusById || statusByReg || statusByNum || 'AVAILABLE';
  return currentStatus === 'AVAILABLE';
}
