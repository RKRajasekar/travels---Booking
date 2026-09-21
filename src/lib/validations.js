import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'ADMIN', 'DRIVER', 'TRAVEL_OWNER']).default('USER'),
  companyName: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SearchSchema = z.object({
  source: z.string().min(1, 'Source city is required'),
  destination: z.string().min(1, 'Destination city is required'),
  date: z.string().min(1, 'Departure date is required'),
}).refine(data => data.source.toLowerCase() !== data.destination.toLowerCase(), {
  message: 'Source and destination cannot be the same',
  path: ['destination'],
});

export const PassengerSchema = z.object({
  name: z.string().min(2, 'Passenger name must be at least 2 characters'),
  age: z.coerce.number().int().min(1, 'Age must be at least 1').max(120, 'Invalid age'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

export const CheckoutSchema = z.object({
  passengerDetails: z.array(PassengerSchema).min(1, 'At least one passenger must be added'),
  contactPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number'),
  contactEmail: z.string().email('Please enter a valid email address'),
  selectedSeats: z.array(z.string()).min(1, 'At least one seat must be selected'),
  boardingPoint: z.string().min(1, 'Boarding point is required'),
  droppingPoint: z.string().min(1, 'Dropping point is required'),
  tripId: z.string().min(1, 'Trip ID is required'),
  discountAmount: z.coerce.number().optional().default(0),
  appliedCoupon: z.string().optional().default(''),
  paymentMethod: z.string().optional().default('card'),
});

export const GpsUpdateSchema = z.object({
  busId: z.string().min(1, 'Bus ID is required'),
  latitude: z.coerce.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  speed: z.coerce.number().nonnegative('Speed cannot be negative'),
  heading: z.coerce.number().min(0, 'Heading must be between 0 and 360').max(360, 'Heading must be between 0 and 360'),
});
