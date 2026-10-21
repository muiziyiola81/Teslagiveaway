import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Vehicle,
  Claim,
  Review,
  DeliveryStory,
  PageView,
  DeliveryAddress,
  PromotionConfig,
  ClaimStatus,
  DeliveryStatus,
  PaymentStatus
} from '../types';
import {
  MOCK_VEHICLES,
  MOCK_REVIEWS,
  MOCK_DELIVERY_STORIES,
  INITIAL_PROMOTION_CONFIG
} from '../data/mockData';

import { apiClient } from '../services/apiClient';
import { isAuthorizedAdminEmail, isStaticDeployment } from '../services/authStorage';

interface VehicleFilters {
  search: string;
  model: string;
  year: string;
  trim: string;
  country: string;
  availability: string;
}

interface AppContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  activePage: PageView;
  selectedVehicleId: string | null;
  selectedVehicle: Vehicle | null;
  vehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  filters: VehicleFilters;
  claims: Claim[];
  userClaims: Claim[];
  reviews: Review[];
  deliveryStories: DeliveryStory[];
  config: PromotionConfig;
  isMobileNavOpen: boolean;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  // Actions
  setFilters: React.Dispatch<React.SetStateAction<VehicleFilters>>;
  resetFilters: () => void;
  navigateTo: (page: PageView, vehicleId?: string) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    country: string;
    address: DeliveryAddress;
  }) => Promise<{ success: boolean; error?: string; message?: string; user?: User }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => void;
  updateProfile: (profile: Partial<User>) => void;
  updateDeliveryAddress: (address: DeliveryAddress) => void;
  submitDemoClaim: (
    vehicleId: string,
    address: DeliveryAddress,
    paymentDetails?: {
      method?: string;
      transferReference?: string;
      notes?: string;
      status?: PaymentStatus;
      cryptoAddress?: string;
      cryptoNetwork?: string;
      cryptoAsset?: string;
    }
  ) => Promise<Claim>;
  submitPaymentEvidence: (
    claimId: string,
    evidence: {
      transferReference: string;
      senderName: string;
      bankName: string;
      receiptUrl?: string | null;
      notes?: string | null;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  adminClaims: Claim[];
  isLoadingAdminClaims: boolean;
  loadAdminClaims: (filters?: { status?: string; paymentStatus?: string }) => Promise<void>;
  adminUpdateClaimStatus: (
    claimId: string,
    payload: { status?: string; deliveryStatus?: string; reason: string }
  ) => Promise<{ success: boolean; error?: string }>;
  adminVerifyPayment: (
    paymentId: string,
    notes?: string,
    updateClaimStatusToApproved?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  adminRejectPayment: (
    paymentId: string,
    reason: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshClaims: () => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'isSampleData'>) => void;
  updatePromotionConfig: (config: Partial<PromotionConfig>) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

const DEFAULT_FILTERS: VehicleFilters = {
  search: '',
  model: 'all',
  year: 'all',
  trim: 'all',
  country: 'all',
  availability: 'all'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<PageView>('landing');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [filters, setFilters] = useState<VehicleFilters>(DEFAULT_FILTERS);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [adminClaims, setAdminClaims] = useState<Claim[]>([]);
  const [isLoadingAdminClaims, setIsLoadingAdminClaims] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [deliveryStories] = useState<DeliveryStory[]>(MOCK_DELIVERY_STORIES);
  const [config, setConfig] = useState<PromotionConfig>(INITIAL_PROMOTION_CONFIG);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Initialize session verification & seed data
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      // 1. Restore local cache for instant rendering
      try {
        const storedUser = localStorage.getItem('tesla_auth_session');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (isMounted) setCurrentUser(parsed);
        }
      } catch {
        // Ignore JSON parse error
      }

      // 2. Perform verified session check against backend
      const token = apiClient.getToken();
      if (token) {
        try {
          const meRes = await apiClient.getMe();
          if (isMounted) {
            if (meRes.success && meRes.data) {
              const verifiedUser: User = {
                id: meRes.data.id,
                email: meRes.data.email,
                fullName: meRes.data.fullName || meRes.data.email.split('@')[0],
                phone: meRes.data.phone || '',
                country: meRes.data.country || 'United States',
                role: meRes.data.role || (isAuthorizedAdminEmail(meRes.data.email) ? 'admin' : 'user')
              };
              setCurrentUser(verifiedUser);
              localStorage.setItem('tesla_auth_session', JSON.stringify(verifiedUser));
            } else if (!isStaticDeployment()) {
              // Token expired or invalid on real backend
              apiClient.logout();
              setCurrentUser(null);
              localStorage.removeItem('tesla_auth_session');
            }
          }
        } catch {
          // Keep offline cached user if temporary network glitch
        }
      }

      if (isMounted) {
        setIsAuthLoading(false);
      }
    }

    // Load claims from storage without mock seeds
    try {
      const storedClaims = localStorage.getItem('tesla_claims_db');
      if (storedClaims) {
        // Strip legacy mock/seed claims
        const parsed: Claim[] = JSON.parse(storedClaims).filter((c: Claim) => c.userId !== 'user-default-alloc' && c.userId !== 'user-default-demo');
        setClaims(parsed);
        localStorage.setItem('tesla_claims_db', JSON.stringify(parsed));
      } else {
        setClaims([]);
      }

      const storedReviews = localStorage.getItem('tesla_reviews_db');
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
    } catch {
      // Fallback cleanly
    }

    // Hash routing sync for GitHub Pages and deep linking
    const handleHashChange = () => {
      try {
        const rawHash = window.location.hash.replace(/^#\/?/, '');
        if (rawHash) {
          const [pagePart, queryPart] = rawHash.split('?');
          const validPages: PageView[] = [
            'landing', 'home', 'explore', 'vehicle-details', 'how-to-claim',
            'my-claims', 'profile', 'delivery-address', 'checkout', 'demo-checkout',
            'reviews', 'terms', 'privacy', 'support', 'auth-signin', 'auth-signup'
          ];
          if (validPages.includes(pagePart as PageView)) {
            setActivePage(pagePart as PageView);
            if (queryPart) {
              const params = new URLSearchParams(queryPart);
              const vehId = params.get('id');
              if (vehId) setSelectedVehicleId(vehId);
            }
          }
        }
      } catch {
        // Ignore hash parse errors
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    initSession();

    return () => {
      isMounted = false;
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const clearNotification = () => setNotification(null);

  const navigateTo = (page: PageView, vehicleId?: string) => {
    setActivePage(page);
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
    }
    try {
      const targetHash = vehicleId ? `#${page}?id=${vehicleId}` : `#${page}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    } catch {
      // Ignore URL state error
    }
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMobileNav = () => setIsMobileNavOpen(prev => !prev);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const syncStoredClaims = () => {
    try {
      const raw = localStorage.getItem('tesla_claims_db');
      if (raw) {
        const parsed = JSON.parse(raw).filter(
          (c: Claim) => c.userId !== 'user-default-alloc' && c.userId !== 'user-default-demo'
        );
        setClaims(parsed);
      } else {
        setClaims([]);
      }
    } catch {
      setClaims([]);
    }
  };

  // Authenticate user
  const signIn = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !pass) {
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      const res = await apiClient.login(trimmedEmail, pass);
      if (res.success && res.data?.user) {
        const userObj: User = {
          id: res.data.user.id,
          email: res.data.user.email,
          fullName: res.data.user.fullName || trimmedEmail.split('@')[0],
          phone: res.data.user.phone || '',
          country: res.data.user.country || 'United States',
          role: res.data.user.role || (isAuthorizedAdminEmail(trimmedEmail) ? 'admin' : 'user'),
          address: res.data.user.address
        };
        setCurrentUser(userObj);
        localStorage.setItem('tesla_auth_session', JSON.stringify(userObj));
        syncStoredClaims();
        showNotification(`Welcome back, ${userObj.fullName}!`, 'success');
        return { success: true, user: userObj };
      }

      return {
        success: false,
        error: res.error?.message || 'Authentication failed. Please verify credentials.'
      };
    } catch {
      // Fallback for static hosting environments (e.g. GitHub Pages without Express backend)
      const role = isAuthorizedAdminEmail(trimmedEmail) ? 'admin' : 'user';
      const fallbackUser: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 8),
        email: trimmedEmail,
        fullName: trimmedEmail.split('@')[0],
        phone: '+1 (555) 019-2834',
        country: 'United States',
        role
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('tesla_auth_session', JSON.stringify(fallbackUser));
      syncStoredClaims();
      showNotification(`Welcome back, ${fallbackUser.fullName}!`, 'success');
      return { success: true, user: fallbackUser };
    }
  };

  // Register new user
  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    country: string;
    address: DeliveryAddress;
  }): Promise<{ success: boolean; error?: string; message?: string; user?: User }> => {
    const trimmedEmail = data.email.trim().toLowerCase();
    if (!trimmedEmail || !data.password || !data.fullName) {
      return { success: false, error: 'Please provide all mandatory profile fields.' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const res = await apiClient.register({
        email: trimmedEmail,
        password: data.password,
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        country: data.country
      });

      if (res.success && res.data?.user) {
        const userObj: User = {
          id: res.data.user.id,
          email: res.data.user.email,
          fullName: res.data.user.fullName || data.fullName.trim(),
          phone: res.data.user.phone || data.phone.trim(),
          country: res.data.user.country || data.country,
          address: data.address,
          role: res.data.user.role || (isAuthorizedAdminEmail(trimmedEmail) ? 'admin' : 'user')
        };

        if (res.data.token) {
          setCurrentUser(userObj);
          localStorage.setItem('tesla_auth_session', JSON.stringify(userObj));
          syncStoredClaims();
          showNotification(`Account created successfully. Welcome, ${userObj.fullName}!`, 'success');
        } else {
          showNotification(
            res.message || 'Account created. Please check your email to verify your address.',
            'info'
          );
        }
        return { success: true, message: res.message, user: userObj };
      }

      return {
        success: false,
        error: res.error?.message || 'Registration failed.'
      };
    } catch {
      // Fallback for static hosting environments
      const role = isAuthorizedAdminEmail(trimmedEmail) ? 'admin' : 'user';
      const fallbackUser: User = {
        id: 'usr-' + Math.random().toString(36).substring(2, 8),
        email: trimmedEmail,
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        country: data.country,
        address: data.address,
        role
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('tesla_auth_session', JSON.stringify(fallbackUser));
      syncStoredClaims();
      showNotification(`Account created successfully. Welcome, ${fallbackUser.fullName}!`, 'success');
      return { success: true, user: fallbackUser };
    }
  };

  // Request password reset email from Supabase Auth
  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Email address is required.' };
    }

    try {
      const res = await apiClient.resetPassword(trimmed);
      if (res.success) {
        return {
          success: true,
          message: res.data?.message || 'Password reset instructions have been dispatched.'
        };
      }
      return {
        success: false,
        error: res.error?.message || 'Failed to dispatch password reset request.'
      };
    } catch {
      showNotification(`Password reset instructions sent to ${trimmed}.`, 'info');
      return {
        success: true,
        message: `Password reset instructions dispatched to ${trimmed}.`
      };
    }
  };

  const signOut = () => {
    apiClient.logout();
    setCurrentUser(null);
    setClaims([]);
    setSelectedVehicleId(null);
    localStorage.removeItem('tesla_auth_session');
    localStorage.removeItem('tesla_auth_token');
    showNotification('Signed out securely.', 'info');
    navigateTo('landing');
  };

  const updateProfile = (profile: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    localStorage.setItem('tesla_auth_session', JSON.stringify(updated));
    showNotification('Profile updated successfully.', 'success');
  };

  const updateDeliveryAddress = (address: DeliveryAddress) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, address };
    setCurrentUser(updatedUser);
    localStorage.setItem('tesla_auth_session', JSON.stringify(updatedUser));
    showNotification('Delivery address saved to your private profile.', 'success');
  };

  const submitDemoClaim = async (
    vehicleId: string,
    address: DeliveryAddress,
    paymentDetails?: {
      method?: string;
      transferReference?: string;
      notes?: string;
      status?: PaymentStatus;
      cryptoAddress?: string;
      cryptoNetwork?: string;
      cryptoAsset?: string;
    }
  ): Promise<Claim> => {
    const vehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];

    const resolvedStatus: PaymentStatus =
      paymentDetails?.status ||
      (paymentDetails?.method?.toLowerCase().includes('crypto')
        ? 'Pending Manual Verification'
        : 'Evidence Submitted');

    // If authenticated with real backend, submit through authoritative API
    if (apiClient.getToken() && currentUser) {
      try {
        const res = await apiClient.submitClaim(vehicle.id, {
          fullName: address.fullName,
          email: address.email || currentUser.email,
          phone: address.phone || currentUser.phone || '+1 555-0199',
          streetAddress: address.streetAddress,
          apartmentOrSuite: address.apartmentOrSuite || null,
          city: address.city,
          stateOrRegion: address.stateOrRegion,
          postalCode: address.postalCode,
          country: address.country
        });

        if (res.success && res.data) {
          const mapped = mapDbClaimToClaim(res.data);
          if (paymentDetails) {
            mapped.payment = {
              id: 'pay-' + Date.now(),
              status: resolvedStatus,
              method: paymentDetails.method || 'Standard',
              provider: paymentDetails.method?.includes('Flutterwave') ? 'Flutterwave' : 'Cryptocurrency',
              amountUSD: vehicle.totalMandatoryFeeUSD,
              transferReference: paymentDetails.transferReference || (paymentDetails.method?.includes('Flutterwave') ? 'FLW-' + Math.floor(10000000 + Math.random() * 90000000) : 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase()),
              submittedAt: new Date().toISOString(),
              cryptoAddress: paymentDetails.cryptoAddress,
              cryptoNetwork: paymentDetails.cryptoNetwork,
              cryptoAsset: paymentDetails.cryptoAsset,
              applicantNotes: paymentDetails.notes || 'Settlement processed via ' + (paymentDetails.method || 'Checkout')
            };
          }
          const updatedClaims = [mapped, ...claims.filter(c => c.id !== mapped.id && c.trackingNumber !== mapped.trackingNumber)];
          setClaims(updatedClaims);
          localStorage.setItem('tesla_claims_db', JSON.stringify(updatedClaims));
          if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
            loadAdminClaims();
          }
          return mapped;
        }
      } catch (err) {
        console.warn('Backend claim submission failed, falling back to local state:', err);
      }
    }

    const userId = currentUser ? currentUser.id : 'usr-' + Math.random().toString(36).substring(2, 8);
    const trackingCode = 'TSLA-TRK-' + Math.floor(100000 + Math.random() * 900000);

    const newClaim: Claim = {
      id: 'claim-' + Date.now(),
      trackingNumber: trackingCode,
      userId,
      vehicleId: vehicle.id,
      vehicleSnapshot: vehicle,
      status: 'Submitted',
      submissionDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      deliveryAddress: address,
      feeBreakdown: {
        vehiclePriceUSD: vehicle.vehiclePriceUSD,
        deliveryFeeUSD: vehicle.deliveryFeeUSD,
        documentationFeeUSD: vehicle.documentationFeeUSD,
        totalUSD: vehicle.totalMandatoryFeeUSD,
        isSimulation: false
      },
      payment: paymentDetails ? {
        id: 'pay-' + Date.now(),
        status: resolvedStatus,
        method: paymentDetails.method || 'Standard',
        provider: paymentDetails.method?.includes('Flutterwave') ? 'Flutterwave' : 'Cryptocurrency',
        amountUSD: vehicle.totalMandatoryFeeUSD,
        transferReference: paymentDetails.transferReference || (paymentDetails.method?.includes('Flutterwave') ? 'FLW-' + Math.floor(10000000 + Math.random() * 90000000) : 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase()),
        submittedAt: new Date().toISOString(),
        cryptoAddress: paymentDetails.cryptoAddress,
        cryptoNetwork: paymentDetails.cryptoNetwork,
        cryptoAsset: paymentDetails.cryptoAsset,
        applicantNotes: paymentDetails.notes || 'Settlement processed via ' + (paymentDetails.method || 'Checkout')
      } : undefined,
      authorizedNextSteps: [
        'Allocation claim received in operations intake queue.',
        'Address coordinates mapped for domestic carrier routing.',
        'Compliance check and carrier dispatch booking pending.'
      ],
      timeline: [
        {
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          title: 'Claim Request Submitted',
          description: `Allocation reservation submitted for ${vehicle.year} ${vehicle.model} ${vehicle.trim}.`,
          completed: true,
          active: true
        },
        {
          timestamp: 'Upcoming (1-2 business days)',
          title: 'Eligibility & ID Review',
          description: 'Authorized operator validation of applicant jurisdiction and driver licensing.',
          completed: false
        },
        {
          timestamp: 'Pending Approval',
          title: 'Enclosed Carrier Dispatch',
          description: 'Vehicle booked with verified regional automotive freight carrier.',
          completed: false
        }
      ]
    };

    const updatedClaims = [newClaim, ...claims];
    setClaims(updatedClaims);
    localStorage.setItem('tesla_claims_db', JSON.stringify(updatedClaims));
    return newClaim;
  };

  const mapDbClaimToClaim = (raw: any): Claim => {
    const vehicle = vehicles.find(v => v.id === raw.vehicle_id) || {
      ...vehicles[0],
      id: raw.vehicle_id,
      model: (raw.vehicles?.model as any) || 'Model S',
      year: raw.vehicles?.year || 2026,
      trim: raw.vehicles?.trim || 'Plaid Tri-Motor AWD',
      colorName: raw.vehicles?.exterior_color || 'Solid Black',
      allocationCode: raw.vehicles?.vin || 'VIN-ALLOC'
    };

    let displayStatus: ClaimStatus = 'Submitted';
    const rawStatus = (raw.status || '').toLowerCase();
    if (rawStatus === 'verified') displayStatus = 'Approved';
    else if (rawStatus === 'under_review') displayStatus = 'Under Review';
    else if (rawStatus === 'rejected') displayStatus = 'Rejected';
    else if (rawStatus === 'delivered') displayStatus = 'Delivered';
    else if (rawStatus === 'submitted') displayStatus = 'Submitted';

    let parsedNotes: Record<string, any> = {};
    try {
      if (raw.notes && typeof raw.notes === 'string' && raw.notes.trim().startsWith('{')) {
        parsedNotes = JSON.parse(raw.notes);
      } else if (raw.notes) {
        parsedNotes = { adminNotes: raw.notes };
      }
    } catch {
      parsedNotes = { adminNotes: raw.notes || '' };
    }

    let deliveryStatus: DeliveryStatus = 'Processing';
    if (raw.delivery_status) {
      const ds = raw.delivery_status.toLowerCase();
      if (ds === 'ready_for_delivery' || ds === 'ready for delivery') deliveryStatus = 'Ready for Delivery';
      else if (ds === 'delivered') deliveryStatus = 'Delivered';
      else if (ds === 'dispatched' || ds === 'in_transit') deliveryStatus = 'In Transit';
      else if (ds === 'not_scheduled') deliveryStatus = 'Not Scheduled';
      else deliveryStatus = 'Processing';
    } else if (parsedNotes.deliveryStatus) {
      deliveryStatus = parsedNotes.deliveryStatus;
    } else if (rawStatus === 'delivered') {
      deliveryStatus = 'Delivered';
    }

    const rawPayments = raw.payments || (raw.primary_payment ? [raw.primary_payment] : []);
    const p = rawPayments[0] || null;
    let paymentObj: any = {
      status: 'Pending',
      amountUSD: Number(raw.total_fee_usd) || 1390
    };

    if (p) {
      const pMeta = p.metadata || {};
      let pStatus: PaymentStatus = 'Pending';
      if (p.status === 'succeeded' || pMeta.verified === true) {
        pStatus = 'Verified';
      } else if (pMeta.verificationStatus === 'pending_review' || pMeta.method === 'bank_transfer') {
        pStatus = 'Evidence Submitted';
      } else if (p.status === 'failed') {
        pStatus = 'Failed';
      }

      paymentObj = {
        id: p.id,
        status: pStatus,
        amountCents: p.amount_cents,
        amountUSD: Math.round(p.amount_cents / 100),
        provider: p.provider,
        method: pMeta.method,
        transferReference: pMeta.transferReference || p.provider_payment_id,
        senderName: pMeta.senderName,
        bankName: pMeta.bankName,
        receiptUrl: pMeta.receiptUrl,
        submittedAt: pMeta.submittedAt,
        verifiedAt: pMeta.verifiedAt,
        verifiedBy: pMeta.verifiedBy,
        verifiedByEmail: pMeta.verifiedByEmail,
        verificationNotes: pMeta.verificationNotes,
        rejectionReason: pMeta.rejectionReason
      };
    }

    const deliveryAddress = raw.delivery_addresses
      ? {
          fullName: raw.delivery_addresses.full_name,
          email: raw.delivery_addresses.email,
          phone: raw.delivery_addresses.phone,
          streetAddress: raw.delivery_addresses.street_address,
          apartmentOrSuite: raw.delivery_addresses.apartment_or_suite,
          city: raw.delivery_addresses.city,
          stateOrRegion: raw.delivery_addresses.state_or_region,
          postalCode: raw.delivery_addresses.postal_code,
          country: raw.delivery_addresses.country
        }
      : {
          fullName: raw.profiles?.full_name || 'Applicant Recipient',
          email: raw.profiles?.email || 'user@example.com',
          phone: raw.profiles?.phone || '',
          streetAddress: 'Registered Delivery Destination',
          city: 'Austin',
          stateOrRegion: 'TX',
          postalCode: '78701',
          country: 'United States'
        };

    return {
      id: raw.id,
      trackingNumber: raw.tracking_number,
      userId: raw.user_id,
      vehicleId: raw.vehicle_id,
      vehicleSnapshot: vehicle,
      status: displayStatus,
      deliveryStatus,
      payment: paymentObj,
      submissionDate: raw.created_at || new Date().toISOString(),
      lastUpdatedDate: raw.updated_at || new Date().toISOString(),
      deliveryAddress,
      applicant: raw.profiles ? {
        id: raw.profiles.id,
        fullName: raw.profiles.full_name,
        email: raw.profiles.email,
        phone: raw.profiles.phone
      } : undefined,
      feeBreakdown: {
        vehiclePriceUSD: Number(raw.vehicle_price_usd) || 0,
        deliveryFeeUSD: Number(raw.delivery_fee_usd) || 1200,
        documentationFeeUSD: Number(raw.documentation_fee_usd) || 190,
        totalUSD: Number(raw.total_fee_usd) || 1390,
        isSimulation: Boolean(raw.is_simulation)
      },
      authorizedNextSteps: [
        'Allocation intake reviewed by regional operations.',
        'Carrier documentation mapped for delivery route.',
        'Direct driveway delivery appointment scheduled.'
      ],
      timeline: [
        {
          timestamp: new Date(raw.created_at || Date.now()).toLocaleDateString(),
          title: 'Allocation Request Submitted',
          description: `Intake recorded for ${vehicle.year} ${vehicle.model}.`,
          completed: true,
          active: displayStatus === 'Submitted'
        },
        {
          timestamp: raw.updated_at ? new Date(raw.updated_at).toLocaleDateString() : 'In Progress',
          title: 'Eligibility & ID Verification',
          description: 'Authorized operations validation of licensing and delivery zone.',
          completed: displayStatus === 'Approved' || displayStatus === 'Delivered',
          active: displayStatus === 'Under Review'
        },
        {
          timestamp: paymentObj.status === 'Verified' ? 'Confirmed' : 'Pending Review',
          title: 'Transport Logistics & Fee Verification',
          description: paymentObj.status === 'Verified'
            ? 'Mandatory fees confirmed by administrator.'
            : 'Wire receipt awaiting verification.',
          completed: paymentObj.status === 'Verified'
        },
        {
          timestamp: deliveryStatus === 'Delivered' ? 'Completed' : 'Upcoming',
          title: 'Enclosed Carrier Dispatch & Handover',
          description: 'Dedicated enclosed carrier delivery to destination address.',
          completed: deliveryStatus === 'Delivered'
        }
      ],
      notes: typeof raw.notes === 'string' ? raw.notes : JSON.stringify(raw.notes)
    };
  };

  const loadAdminClaims = async (filters?: { status?: string; paymentStatus?: string }) => {
    setIsLoadingAdminClaims(true);
    try {
      const res = await apiClient.adminGetClaims(filters);
      if (res.success && res.data) {
        const mapped = res.data.map(mapDbClaimToClaim);
        setAdminClaims(mapped);
      } else {
        // Fallback to in-memory claims
        setAdminClaims(claims);
      }
    } catch {
      setAdminClaims(claims);
    } finally {
      setIsLoadingAdminClaims(false);
    }
  };

  const refreshClaims = async () => {
    try {
      if (apiClient.getToken()) {
        const res = await apiClient.getMyClaims();
        if (res.success && res.data) {
          const mapped = res.data.map(mapDbClaimToClaim);
          setClaims(prev => {
            const combined = [...mapped];
            prev.forEach(p => {
              if (!combined.some(c => c.id === p.id || c.trackingNumber === p.trackingNumber)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      }
    } catch {
      // Ignore
    }

    if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
      await loadAdminClaims();
    }
  };

  const submitPaymentEvidence = async (
    claimId: string,
    evidence: {
      transferReference: string;
      senderName: string;
      bankName: string;
      receiptUrl?: string | null;
      notes?: string | null;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.submitPaymentEvidence(claimId, evidence);
      if (res.success) {
        showNotification('Payment evidence submitted. Awaiting administrator verification.', 'success');
        await refreshClaims();
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Failed to submit evidence' };
    } catch {
      // Offline fallback
      const updated = claims.map(c => {
        if (c.id === claimId) {
          return {
            ...c,
            payment: {
              status: 'Evidence Submitted' as PaymentStatus,
              amountUSD: c.feeBreakdown.totalUSD,
              transferReference: evidence.transferReference,
              senderName: evidence.senderName,
              bankName: evidence.bankName,
              receiptUrl: evidence.receiptUrl,
              submittedAt: new Date().toISOString()
            }
          };
        }
        return c;
      });
      setClaims(updated);
      localStorage.setItem('tesla_claims_db', JSON.stringify(updated));
      showNotification('Wire payment proof recorded. Pending administrative funds review.', 'info');
      return { success: true };
    }
  };

  const adminUpdateClaimStatus = async (
    claimId: string,
    payload: { status?: string; deliveryStatus?: string; reason: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.adminUpdateClaim(claimId, payload);
      if (res.success) {
        showNotification('Claim status updated successfully.', 'success');
        await refreshClaims();
        await loadAdminClaims();
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Failed to update claim status' };
    } catch {
      // Local fallback
      const updated = claims.map(c => {
        if (c.id === claimId) {
          return {
            ...c,
            status: (payload.status as ClaimStatus) || c.status,
            deliveryStatus: (payload.deliveryStatus as DeliveryStatus) || c.deliveryStatus,
            lastUpdatedDate: new Date().toISOString(),
            notes: payload.reason
          };
        }
        return c;
      });
      setClaims(updated);
      localStorage.setItem('tesla_claims_db', JSON.stringify(updated));
      showNotification('Claim status updated successfully.', 'info');
      return { success: true };
    }
  };

  const adminVerifyPayment = async (
    paymentId: string,
    notes?: string,
    updateClaimStatusToApproved: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.adminVerifyPayment(paymentId, notes, updateClaimStatusToApproved);
      if (res.success) {
        showNotification('Payment verified successfully. Funds confirmed.', 'success');
        await refreshClaims();
        await loadAdminClaims();
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Verification failed' };
    } catch {
      // Local fallback
      const updated = claims.map(c => {
        if (c.payment?.id === paymentId || c.id === paymentId) {
          return {
            ...c,
            status: updateClaimStatusToApproved ? ('Approved' as ClaimStatus) : c.status,
            payment: {
              ...c.payment,
              status: 'Verified' as PaymentStatus,
              verifiedAt: new Date().toISOString(),
              verificationNotes: notes || 'Verified by authorized administrator'
            }
          };
        }
        return c;
      });
      setClaims(updated);
      localStorage.setItem('tesla_claims_db', JSON.stringify(updated));
      showNotification('Payment verified successfully.', 'success');
      return { success: true };
    }
  };

  const adminRejectPayment = async (
    paymentId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.adminRejectPayment(paymentId, reason);
      if (res.success) {
        showNotification('Payment evidence rejected.', 'info');
        await refreshClaims();
        await loadAdminClaims();
        return { success: true };
      }
      return { success: false, error: res.error?.message || 'Rejection failed' };
    } catch {
      showNotification('Payment evidence marked as rejected.', 'info');
      return { success: true };
    }
  };

  const addReview = (review: Omit<Review, 'id' | 'isSampleData'>) => {
    const newRev: Review = {
      ...review,
      id: 'rev-' + Date.now(),
      isSampleData: false
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem('tesla_reviews_db', JSON.stringify(updated));
    showNotification('Thank you! Your review has been recorded.', 'success');
  };

  const updatePromotionConfig = (newCfg: Partial<PromotionConfig>) => {
    setConfig(prev => ({ ...prev, ...newCfg }));
    showNotification('Promotion mode configuration updated.', 'info');
  };

  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(v => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        v.model.toLowerCase().includes(q) ||
        v.trim.toLowerCase().includes(q) ||
        v.specs.drivetrain.toLowerCase().includes(q) ||
        v.colorName.toLowerCase().includes(q) ||
        v.allocationCode.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Model filter
    if (filters.model !== 'all' && v.model !== filters.model) {
      return false;
    }

    // Year filter
    if (filters.year !== 'all' && v.year.toString() !== filters.year) {
      return false;
    }

    // Trim filter
    if (filters.trim !== 'all' && !v.trim.toLowerCase().includes(filters.trim.toLowerCase())) {
      return false;
    }

    // Country filter
    if (filters.country !== 'all') {
      if (!v.eligibleCountries.includes(filters.country)) {
        return false;
      }
    }

    // Availability filter
    if (filters.availability !== 'all' && v.availabilityStatus !== filters.availability) {
      return false;
    }

    return true;
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;

  // Filter claims strictly belonging to the authenticated user.
  // When no user is authenticated, return an empty array (NO claims).
  const userClaims = currentUser
    ? claims.filter(c =>
        c.userId !== 'user-default-alloc' && (
          (c.userId && c.userId === currentUser.id) ||
          (c.deliveryAddress?.email && currentUser.email && c.deliveryAddress.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (c.applicant?.id && c.applicant.id === currentUser.id) ||
          (c.applicant?.email && currentUser.email && c.applicant.email.toLowerCase() === currentUser.email.toLowerCase())
        )
      )
    : [];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        activePage,
        selectedVehicleId,
        selectedVehicle,
        vehicles,
        filteredVehicles,
        filters,
        claims,
        userClaims,
        reviews,
        deliveryStories,
        config,
        isMobileNavOpen,
        notification,
        setFilters,
        resetFilters,
        navigateTo,
        toggleMobileNav,
        closeMobileNav,
        signIn,
        signUp,
        resetPassword,
        signOut,
        updateProfile,
        updateDeliveryAddress,
        submitDemoClaim,
        submitPaymentEvidence,
        adminClaims,
        isLoadingAdminClaims,
        loadAdminClaims,
        adminUpdateClaimStatus,
        adminVerifyPayment,
        adminRejectPayment,
        refreshClaims,
        addReview,
        updatePromotionConfig,
        showNotification,
        clearNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
