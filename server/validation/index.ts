import { z } from 'zod';

export const deliveryAddressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits').max(30),
  streetAddress: z.string().trim().min(5, 'Street address must be at least 5 characters').max(200),
  apartmentOrSuite: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().min(2, 'City is required').max(100),
  stateOrRegion: z.string().trim().min(2, 'State or region is required').max(100),
  postalCode: z.string().trim().min(3, 'Postal/Zip code is required').max(20),
  country: z.string().trim().min(2, 'Country is required').max(100)
});

export const claimSubmissionSchema = z.object({
  vehicleId: z.string().trim().min(1, 'Vehicle ID is required'),
  deliveryAddress: deliveryAddressSchema
});

export const claimStatusUpdateSchema = z.object({
  status: z.enum([
    'submitted',
    'under_review',
    'verified',
    'dispatched',
    'delivered',
    'rejected',
    'cancelled'
  ]),
  reason: z.string().trim().min(3, 'Reason for status update is mandatory').max(500)
});

export const vehicleCreateSchema = z.object({
  id: z.string().trim().min(2).max(50),
  vin: z.string().trim().length(17, 'VIN must be exactly 17 characters'),
  model: z.string().trim().min(1).max(50),
  year: z.number().int().min(2020).max(2035),
  trim: z.string().trim().min(1).max(50),
  powertrain: z.string().trim().min(1).max(50),
  rangeMiles: z.number().int().positive(),
  zeroToSixtySec: z.number().positive(),
  topSpeedMph: z.number().int().positive(),
  exteriorColor: z.string().trim().min(1).max(50),
  interiorColor: z.string().trim().min(1).max(50),
  wheels: z.string().trim().min(1).max(50),
  priceUsd: z.number().min(0),
  deliveryFeeUsd: z.number().min(0),
  documentationFeeUsd: z.number().min(0),
  isFreePromotionalVehicle: z.boolean(),
  availabilityStatus: z.enum(['in_stock', 'allocated', 'claimed', 'discontinued']),
  imageUrl: z.string().refine(v => v.startsWith('/') || /^https?:\/\//.test(v), 'Image must be a valid path or URL')
});

export const signInSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signUpSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  phone: z.string().trim().min(7, 'Phone number is required').max(30),
  country: z.string().trim().min(2, 'Country is required').max(100),
  address: deliveryAddressSchema.optional()
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Valid email is required')
});

