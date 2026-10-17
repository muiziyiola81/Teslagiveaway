export type VehicleModel = 'Model 3' | 'Model Y' | 'Model S' | 'Model X' | 'Cybertruck';

export type ClaimStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

export interface VehicleSpecs {
  acceleration0to60: string;
  topSpeed: string;
  range: string;
  drivetrain: string;
  superchargingRate: string;
  cargoCapacity: string;
  seating: number;
  autopilotHardware: string;
}

export interface VehicleImages {
  primary: string;
  exteriorAngle: string;
  interior: string;
}

export interface Vehicle {
  id: string;
  model: VehicleModel;
  trim: string;
  year: number;
  colorName: string;
  colorHex: string;
  images: VehicleImages;
  specs: VehicleSpecs;
  vehiclePriceUSD: number; // 0 for giveaway promotion
  deliveryFeeUSD: number;
  documentationFeeUSD: number;
  totalMandatoryFeeUSD: number;
  eligibleCountries: string[];
  availabilityStatus: 'Available' | 'Allocated' | 'Reserved' | 'Limited Batch';
  unitsAllocatedTotal: number;
  unitsRemaining: number;
  allocationCode: string;
  details: {
    overview: string;
    interiorDescription: string;
    technologyDescription: string;
    chargingDescription: string;
    termsSummary: string;
  };
  isSampleData: boolean;
}

export interface DeliveryAddress {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartmentOrSuite?: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  country: string;
  address?: DeliveryAddress;
  role?: 'user' | 'support' | 'admin' | 'superadmin';
  createdAt?: string;
  isPrototypeAccount?: boolean;
}

export interface ClaimTimelineItem {
  timestamp: string;
  title: string;
  description: string;
  completed: boolean;
  active?: boolean;
}

export interface Claim {
  id: string;
  trackingNumber: string;
  userId: string;
  vehicleId: string;
  vehicleSnapshot: Vehicle;
  status: ClaimStatus;
  submissionDate: string;
  lastUpdatedDate: string;
  deliveryAddress: DeliveryAddress;
  feeBreakdown: {
    vehiclePriceUSD: number;
    deliveryFeeUSD: number;
    documentationFeeUSD: number;
    totalUSD: number;
    isSimulation: boolean;
  };
  authorizedNextSteps: string[];
  timeline: ClaimTimelineItem[];
  notes?: string;
}

export interface Review {
  id: string;
  author: string;
  cityCountry: string;
  vehicleClaimed: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  isSampleData: boolean;
}

export interface DeliveryStory {
  id: string;
  recipientName: string;
  location: string;
  vehicleModel: string;
  deliveredDate: string;
  summary: string;
  quote: string;
  imageUrl: string;
  isSampleData: boolean;
}

export type PageView =
  | 'landing'
  | 'home'
  | 'explore'
  | 'vehicle-details'
  | 'how-to-claim'
  | 'my-claims'
  | 'profile'
  | 'delivery-address'
  | 'demo-checkout'
  | 'reviews'
  | 'terms'
  | 'privacy'
  | 'support'
  | 'auth-signin'
  | 'auth-signup';

export interface PromotionConfig {
  mode: 'Independent Demo' | 'Authorized Partner Promotion';
  operatorName: string;
  contactEmail: string;
  phoneSupport: string;
  legalEntityNotice: string;
  sampleDataNotice: string;
}
