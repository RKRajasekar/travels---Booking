import { CAB_CATEGORIES, CAB_OFFERS } from './cabData';
import { calculateDistance } from './cities';

/**
 * Calculates itemized dynamic cab fare based on category, route distance, time, and coupon.
 *
 * @param {Object} params
 * @param {string} params.category - Cab category (MINI, SEDAN, SUV, XL, PREMIUM, LUXURY, ELECTRIC, OUTSTATION, AIRPORT, LOCAL)
 * @param {number} params.distanceKm - Driving distance in kilometers
 * @param {string} params.pickupTime - Travel pickup time (e.g. '08:00 AM' or '11:30 PM')
 * @param {string} [params.couponCode] - Applied coupon code (e.g. 'CAB50')
 * @param {number} [params.passengers] - Number of passengers
 * @returns {Object} Itemized fare breakdown and total
 */
export function calculateCabFare({
  category = 'SEDAN',
  distanceKm = 15,
  pickupTime = '08:00 AM',
  couponCode = '',
  passengers = 1
}) {
  const catObj = CAB_CATEGORIES.find((c) => c.id === category) || CAB_CATEGORIES[1]; // default Sedan
  const dist = Math.max(catObj.minKm || 5, Number(distanceKm) || 15);

  const baseFare = catObj.baseFare;
  const distanceFare = Math.round(dist * catObj.perKmRate);

  // Highway / Interstate Toll calculation (approx 1 toll booth every 65km after initial 30km)
  let tollCharges = 0;
  if (dist > 40) {
    const tollBooths = Math.floor((dist - 20) / 60);
    tollCharges = tollBooths * 85;
  }

  // Night Surcharge: If pickup is between 10:00 PM and 05:00 AM (15% surcharge on base+distance)
  let nightSurcharge = 0;
  if (isNightTime(pickupTime)) {
    nightSurcharge = Math.round((baseFare + distanceFare) * 0.12);
  }

  // Fixed transparent platform & safety service fee (₹49)
  const serviceFee = 49;

  // Additional passenger surcharge if XL / high passenger count
  let passengerSurcharge = 0;
  if (passengers > 4 && catObj.seats >= 6) {
    passengerSurcharge = Math.round((passengers - 4) * 50);
  }

  const subTotal = baseFare + distanceFare + tollCharges + nightSurcharge + serviceFee + passengerSurcharge;

  // Coupon discount calculation
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = CAB_OFFERS.find(
      (o) => o.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (coupon) {
      if (subTotal >= (coupon.minFare || 0)) {
        if (coupon.isPercent) {
          const rawDiscount = Math.round((subTotal * coupon.discount) / 100);
          discountAmount = coupon.maxDiscount
            ? Math.min(rawDiscount, coupon.maxDiscount)
            : rawDiscount;
        } else {
          discountAmount = coupon.discount;
        }
        appliedCoupon = coupon;
      }
    }
  }

  const total = Math.max(100, Math.round(subTotal - discountAmount));

  return {
    category: catObj.id,
    categoryName: catObj.displayName,
    distanceKm: dist,
    perKmRate: catObj.perKmRate,
    baseFare,
    distanceFare,
    tollCharges,
    nightSurcharge,
    serviceFee,
    passengerSurcharge,
    subTotal,
    discountAmount,
    couponCode: appliedCoupon ? appliedCoupon.code : null,
    appliedCoupon,
    total,
    estimatedMinutes: Math.max(15, Math.round((dist / 45) * 60) + catObj.etaMinutes)
  };
}

/**
 * Checks if a time string falls between 10:00 PM and 5:00 AM
 */
function isNightTime(timeStr) {
  if (!timeStr) return false;
  const clean = timeStr.toLowerCase().trim();
  if (clean.includes('pm')) {
    const hour = parseInt(clean, 10);
    if (hour === 10 || hour === 11) return true;
  }
  if (clean.includes('am')) {
    const hour = parseInt(clean, 10);
    if (hour === 12 || hour < 5) return true;
  }
  // If in 24-hr format "22:00"
  if (clean.includes(':')) {
    const [h] = clean.split(':').map(Number);
    if (h >= 22 || h < 5) return true;
  }
  return false;
}

/**
 * Helper to compute distance between two Indian cities using cities.js
 */
export function getRouteDistance(source, destination) {
  if (!source || !destination) return 18;
  const canonicalSrc = source.trim().toLowerCase();
  const canonicalDest = destination.trim().toLowerCase();
  if (canonicalSrc === canonicalDest) return 12; // Intra-city local trip

  return calculateDistance(source, destination);
}

/**
 * Format Indian Rupee currency
 */
export function formatINR(amount) {
  return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
}
