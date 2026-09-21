import { z } from 'zod';

export const CabSearchSchema = z.object({
  pickup: z.string().min(2, 'Pickup location is required'),
  drop: z.string().min(2, 'Drop location is required'),
  date: z.string().min(1, 'Travel date is required'),
  time: z.string().min(1, 'Pickup time is required'),
  passengers: z.coerce.number().min(1, 'At least 1 passenger').max(8, 'Maximum 8 passengers'),
  category: z.string().optional(),
  serviceType: z.string().optional(),
});

export const CabCheckoutSchema = z.object({
  driverId: z.string().min(1, 'Please select a driver'),
  pickup: z.string().min(2, 'Pickup location is required'),
  drop: z.string().min(2, 'Drop location is required'),
  date: z.string().min(1, 'Travel date is required'),
  time: z.string().min(1, 'Pickup time is required'),
  passengerName: z.string().min(2, 'Full name must be at least 2 characters'),
  passengerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  passengerEmail: z.string().email('Please enter a valid email address'),
  passengersCount: z.coerce.number().min(1).max(8),
  pickupAddress: z.string().optional(),
  dropAddress: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['upi', 'card', 'netbanking', 'wallet']),
});
