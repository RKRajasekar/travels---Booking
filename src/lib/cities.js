// Reusable South Indian cities data structure with geo-coordinates, aliases, and state mappings
export const ALL_CITIES = [
  // Tamil Nadu
  { name: 'Chennai', state: 'TN', aliases: ['Madras'] },
  { name: 'Coimbatore', state: 'TN', aliases: ['Kovai'] },
  { name: 'Madurai', state: 'TN', aliases: ['Thoonga Nagaram'] },
  { name: 'Trichy', state: 'TN', aliases: ['Tiruchirappalli', 'Tiruchirapalli'] },
  { name: 'Salem', state: 'TN', aliases: [] },
  { name: 'Tirunelveli', state: 'TN', aliases: ['Nellai'] },
  { name: 'Nagercoil', state: 'TN', aliases: [] },
  { name: 'Thoothukudi', state: 'TN', aliases: ['Tuticorin'] },
  { name: 'Erode', state: 'TN', aliases: [] },
  { name: 'Vellore', state: 'TN', aliases: [] },
  { name: 'Dindigul', state: 'TN', aliases: [] },
  { name: 'Thanjavur', state: 'TN', aliases: ['Tanjore'] },
  { name: 'Kumbakonam', state: 'TN', aliases: [] },
  { name: 'Karur', state: 'TN', aliases: [] },
  { name: 'Namakkal', state: 'TN', aliases: [] },
  { name: 'Hosur', state: 'TN', aliases: [] },
  { name: 'Dharmapuri', state: 'TN', aliases: [] },
  { name: 'Krishnagiri', state: 'TN', aliases: [] },
  { name: 'Sivakasi', state: 'TN', aliases: [] },
  { name: 'Virudhunagar', state: 'TN', aliases: [] },
  { name: 'Ramanathapuram', state: 'TN', aliases: ['Ramnad'] },
  { name: 'Rameswaram', state: 'TN', aliases: ['Rameshwaram'] },
  { name: 'Karaikudi', state: 'TN', aliases: [] },
  { name: 'Cuddalore', state: 'TN', aliases: [] },
  { name: 'Pondicherry', state: 'PY', aliases: ['Puducherry', 'Pondy'] },
  { name: 'Villupuram', state: 'TN', aliases: ['Viluppuram'] },
  { name: 'Tiruvannamalai', state: 'TN', aliases: [] },
  { name: 'Kanchipuram', state: 'TN', aliases: ['Conjeevaram', 'Kanchi'] },
  { name: 'Tiruppur', state: 'TN', aliases: ['Tirupur'] },
  { name: 'Pollachi', state: 'TN', aliases: [] },
  { name: 'Ooty', state: 'TN', aliases: ['Udhagamandalam', 'Ootacamund'] },
  { name: 'Kanyakumari', state: 'TN', aliases: [] },

  // Karnataka
  { name: 'Bangalore', state: 'KA', aliases: ['Bengaluru'] },
  { name: 'Mysore', state: 'KA', aliases: ['Mysuru'] },
  { name: 'Mangalore', state: 'KA', aliases: ['Mangaluru'] },
  { name: 'Chikmagalur', state: 'KA', aliases: ['Chikkamagaluru'] },
  { name: 'Hassan', state: 'KA', aliases: [] },
  { name: 'Hubli', state: 'KA', aliases: ['Hubballi'] },
  { name: 'Belgaum', state: 'KA', aliases: ['Belagavi'] },
  { name: 'Davanagere', state: 'KA', aliases: [] },

  // Kerala
  { name: 'Trivandrum', state: 'KL', aliases: ['Thiruvananthapuram'] },
  { name: 'Kollam', state: 'KL', aliases: ['Quilon'] },
  { name: 'Kochi', state: 'KL', aliases: ['Cochin', 'Ernakulam'] },
  { name: 'Alappuzha', state: 'KL', aliases: ['Alleppey'] },
  { name: 'Kottayam', state: 'KL', aliases: [] },
  { name: 'Kozhikode', state: 'KL', aliases: ['Calicut'] },
  { name: 'Kannur', state: 'KL', aliases: ['Cannanore'] },
  { name: 'Thrissur', state: 'KL', aliases: ['Trichur'] },
  { name: 'Palakkad', state: 'KL', aliases: ['Palghat'] },
  { name: 'Munnar', state: 'KL', aliases: [] },

  // Andhra Pradesh / Telangana
  { name: 'Hyderabad', state: 'TS', aliases: ['Secunderabad'] },
  { name: 'Vijayawada', state: 'AP', aliases: ['Bezawada'] },
  { name: 'Visakhapatnam', state: 'AP', aliases: ['Vizag'] },
  { name: 'Tirupati', state: 'AP', aliases: [] },
  { name: 'Nellore', state: 'AP', aliases: [] },
  { name: 'Guntur', state: 'AP', aliases: [] },
];

export const CITY_COORDS = {
  // Tamil Nadu
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Trichy': { lat: 10.7905, lng: 78.7047 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'Nagercoil': { lat: 8.1833, lng: 77.4119 },
  'Thoothukudi': { lat: 8.7642, lng: 78.1348 },
  'Erode': { lat: 11.3410, lng: 77.7172 },
  'Vellore': { lat: 12.9165, lng: 79.1325 },
  'Dindigul': { lat: 10.3673, lng: 77.9803 },
  'Thanjavur': { lat: 10.7870, lng: 79.1378 },
  'Kumbakonam': { lat: 10.9602, lng: 79.3845 },
  'Karur': { lat: 10.9601, lng: 78.0766 },
  'Namakkal': { lat: 11.2189, lng: 78.1672 },
  'Hosur': { lat: 12.7409, lng: 77.8253 },
  'Dharmapuri': { lat: 12.1211, lng: 78.1582 },
  'Krishnagiri': { lat: 12.5186, lng: 78.2137 },
  'Sivakasi': { lat: 9.4532, lng: 77.8024 },
  'Virudhunagar': { lat: 9.5680, lng: 77.9624 },
  'Ramanathapuram': { lat: 9.3639, lng: 78.8395 },
  'Rameswaram': { lat: 9.2876, lng: 79.3129 },
  'Karaikudi': { lat: 10.0747, lng: 78.7842 },
  'Cuddalore': { lat: 11.7480, lng: 79.7714 },
  'Pondicherry': { lat: 11.9416, lng: 79.8083 },
  'Villupuram': { lat: 11.9398, lng: 79.4862 },
  'Tiruvannamalai': { lat: 12.2253, lng: 79.0747 },
  'Kanchipuram': { lat: 12.8342, lng: 79.7036 },
  'Tiruppur': { lat: 11.1085, lng: 77.3411 },
  'Pollachi': { lat: 10.6588, lng: 77.0090 },
  'Ooty': { lat: 11.4102, lng: 76.6950 },
  'Kanyakumari': { lat: 8.0883, lng: 77.5385 },

  // Karnataka
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Mysore': { lat: 12.2958, lng: 76.6394 },
  'Mangalore': { lat: 12.9141, lng: 74.8560 },
  'Chikmagalur': { lat: 13.3161, lng: 75.7720 },
  'Hassan': { lat: 13.0068, lng: 76.1026 },
  'Hubli': { lat: 15.3647, lng: 75.1240 },
  'Belgaum': { lat: 15.8497, lng: 74.4977 },
  'Davanagere': { lat: 14.4644, lng: 75.9218 },

  // Kerala
  'Trivandrum': { lat: 8.5241, lng: 76.9366 },
  'Kollam': { lat: 8.8932, lng: 76.6141 },
  'Kochi': { lat: 9.9312, lng: 76.2673 },
  'Alappuzha': { lat: 9.4981, lng: 76.3388 },
  'Kottayam': { lat: 9.5916, lng: 76.5222 },
  'Kozhikode': { lat: 11.2588, lng: 75.7804 },
  'Kannur': { lat: 11.8745, lng: 75.3704 },
  'Thrissur': { lat: 10.5276, lng: 76.2144 },
  'Palakkad': { lat: 10.7867, lng: 76.6548 },
  'Munnar': { lat: 10.0889, lng: 77.0595 },

  // Andhra Pradesh / Telangana
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Vijayawada': { lat: 16.5062, lng: 80.6480 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Tirupati': { lat: 13.6288, lng: 79.4192 },
  'Nellore': { lat: 14.4426, lng: 79.9865 },
  'Guntur': { lat: 16.3067, lng: 80.4365 },
};

export const CANONICAL_MAP = {};

// Auto-build CANONICAL_MAP for fast O(1) lookups
ALL_CITIES.forEach((city) => {
  const lowerName = city.name.toLowerCase();
  CANONICAL_MAP[lowerName] = city.name;
  city.aliases.forEach((alias) => {
    CANONICAL_MAP[alias.toLowerCase()] = city.name;
  });
});

export function getCanonicalCity(city) {
  if (!city) return '';
  const clean = city.trim().toLowerCase();
  return CANONICAL_MAP[clean] || (city.charAt(0).toUpperCase() + city.slice(1));
}

export function getCityState(city) {
  const canonical = getCanonicalCity(city);
  const found = ALL_CITIES.find(c => c.name === canonical);
  return found ? found.state : 'TN';
}

export function calculateDistance(city1, city2) {
  const canonical1 = getCanonicalCity(city1);
  const canonical2 = getCanonicalCity(city2);

  const c1 = CITY_COORDS[canonical1];
  const c2 = CITY_COORDS[canonical2];
  if (!c1 || !c2) return 350; // Fallback

  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  // Multiply by 1.28 to estimate driving distance via highways
  return Math.max(50, Math.round(d * 1.28));
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function findStops(city1, city2) {
  const canonical1 = getCanonicalCity(city1);
  const canonical2 = getCanonicalCity(city2);
  const distTotal = calculateDistance(canonical1, canonical2);

  const stops = [];
  for (const city of ALL_CITIES) {
    if (city.name === canonical1 || city.name === canonical2) continue;
    const d1 = calculateDistance(canonical1, city.name);
    const d2 = calculateDistance(city.name, canonical2);
    // If it lies close to the geodesic line
    if (d1 + d2 < distTotal * 1.15 && d1 > 40 && d2 > 40) {
      stops.push({ name: city.name, d1 });
    }
  }

  // Sort stops by distance from city1 to keep route sequential
  stops.sort((a, b) => a.d1 - b.d1);
  return stops.map((s) => s.name).slice(0, 2);
}
