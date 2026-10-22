export type VehicleModel = 'Model 3' | 'Model Y' | 'Model S' | 'Model X' | 'Cybertruck';

export type ClaimStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Processing'
  | 'Ready for Delivery'
  | 'Delivered'
  | 'Completed';

export type DeliveryStatus =
  | 'Not Scheduled'
  | 'Processing'
  | 'Ready for Delivery'
  | 'In Transit'
  | 'Delivered';

export type PaymentStatus =
  | 'Pending'
  | 'Evidence Submitted'
  | 'Pending Manual Verification'
  | 'Verified'
  | 'Failed'
  | 'Refunded';

export interface ClaimPayment {
  id?: string;
  status: PaymentStatus;
  amountCents?: number;
  amountUSD?: number;
  provider?: string;
  method?: string;
  transferReference?: string;
  senderName?: string;
  bankName?: string;
  receiptUrl?: string | null;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  cryptoAsset?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verifiedByEmail?: string;
  verificationNotes?: string;
  rejectionReason?: string;
  applicantNotes?: string;
}

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
  isVerifiedAccount?: boolean;
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
  deliveryStatus?: DeliveryStatus;
  payment?: ClaimPayment;
  submissionDate: string;
  lastUpdatedDate: string;
  deliveryAddress: DeliveryAddress;
  feeBreakdown: {
    vehiclePriceUSD: number;
    deliveryFeeUSD: number;
    documentationFeeUSD: number;
    totalUSD: number;
    isSimulation?: boolean;
  };
  authorizedNextSteps: string[];
  timeline: ClaimTimelineItem[];
  notes?: string;
  applicant?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
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
  | 'checkout'
  | 'demo-checkout'
  | 'terms'
  | 'privacy'
  | 'support'
  | 'auth-signin'
  | 'auth-signup'
  | 'admin-dashboard';

export interface PromotionConfig {
  mode: 'Independent Program Mode' | 'Authorized Partner Promotion';
  operatorName: string;
  contactEmail: string;
  phoneSupport: string;
  legalEntityNotice: string;
  sampleDataNotice: string;
}
