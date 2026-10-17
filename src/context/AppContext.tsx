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
  ClaimStatus
} from '../types';
import {
  MOCK_VEHICLES,
  MOCK_REVIEWS,
  MOCK_DELIVERY_STORIES,
  INITIAL_PROMOTION_CONFIG
} from '../data/mockData';

import { apiClient } from '../services/apiClient';

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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    country: string;
    address: DeliveryAddress;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => void;
  updateProfile: (profile: Partial<User>) => void;
  updateDeliveryAddress: (address: DeliveryAddress) => void;
  submitDemoClaim: (vehicleId: string, address: DeliveryAddress) => Promise<Claim>;
  updateClaimStatus: (claimId: string, newStatus: ClaimStatus) => void;
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
                role: meRes.data.role || 'user'
              };
              setCurrentUser(verifiedUser);
              localStorage.setItem('tesla_auth_session', JSON.stringify(verifiedUser));
            } else {
              // Token expired or invalid
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

    // Load mock claims & reviews foundation
    try {
      const storedClaims = localStorage.getItem('tesla_claims_db');
      if (storedClaims) {
        setClaims(JSON.parse(storedClaims));
      } else {
        const seedClaim: Claim = {
          id: 'claim-demo-7821',
          trackingNumber: 'TSLA-TRK-98204-DEMO',
          userId: 'user-default-demo',
          vehicleId: 'veh-ms-plaid-2026',
          vehicleSnapshot: MOCK_VEHICLES[0],
          status: 'Under Review',
          submissionDate: '2026-10-08T14:30:00Z',
          lastUpdatedDate: '2026-10-10T09:15:00Z',
          deliveryAddress: {
            fullName: 'Alexander Wright',
            email: 'alex.wright@prototype.demo',
            phone: '+1 (512) 555-0182',
            streetAddress: '1204 Congress Avenue, Suite 400',
            city: 'Austin',
            stateOrRegion: 'TX',
            postalCode: '78701',
            country: 'United States'
          },
          feeBreakdown: {
            vehiclePriceUSD: 0,
            deliveryFeeUSD: 1200,
            documentationFeeUSD: 190,
            totalUSD: 1390,
            isSimulation: true
          },
          authorizedNextSteps: [
            'Carrier documentation team is reviewing delivery address jurisdiction',
            'Government ID validation pending authorized dispatch agent verification',
            'Enclosed carrier transit schedule window: Oct 24 – Oct 28'
          ],
          timeline: [
            {
              timestamp: '2026-10-08 14:30',
              title: 'Claim Allocation Submitted',
              description: 'Digital claim request received for Model S Plaid 2026.',
              completed: true
            },
            {
              timestamp: '2026-10-09 11:00',
              title: 'Identity & Address Document Check',
              description: 'Verification of state residency and domestic delivery eligibility.',
              completed: true
            },
            {
              timestamp: '2026-10-10 09:15',
              title: 'Regional Logistics Assignment',
              description: 'Carrier transport slot reserved in Austin transport hub.',
              completed: true,
              active: true
            },
            {
              timestamp: 'Pending Verification',
              title: 'Carrier Dispatch & Final Handover',
              description: 'Direct driveway delivery and title handover completion.',
              completed: false
            }
          ]
        };
        setClaims([seedClaim]);
        localStorage.setItem('tesla_claims_db', JSON.stringify([seedClaim]));
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
            'my-claims', 'profile', 'delivery-address', 'demo-checkout',
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

  // Authenticate user via Supabase Auth through backend
  const signIn = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
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
          role: res.data.user.role || 'user'
        };
        setCurrentUser(userObj);
        localStorage.setItem('tesla_auth_session', JSON.stringify(userObj));
        showNotification(`Welcome back, ${userObj.fullName}!`, 'success');
        return { success: true };
      }

      return {
        success: false,
        error: res.error?.message || 'Authentication failed. Please verify credentials.'
      };
    } catch {
      // Fallback for static hosting environments (e.g. GitHub Pages without Express backend)
      const fallbackUser: User = {
        id: 'usr-demo-' + Math.random().toString(36).substring(2, 8),
        email: trimmedEmail,
        fullName: trimmedEmail.split('@')[0],
        phone: '+1 (555) 019-2834',
        country: 'United States',
        role: 'user'
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('tesla_auth_session', JSON.stringify(fallbackUser));
      showNotification(`Welcome back, ${fallbackUser.fullName}! (Client Demonstration Session)`, 'success');
      return { success: true };
    }
  };

  // Register new user via Supabase Auth
  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    country: string;
    address: DeliveryAddress;
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
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
          address: data.address
        };

        if (res.data.token) {
          setCurrentUser(userObj);
          localStorage.setItem('tesla_auth_session', JSON.stringify(userObj));
          showNotification(`Account created successfully. Welcome, ${userObj.fullName}!`, 'success');
        } else {
          showNotification(
            res.message || 'Account created. Please check your email to verify your address.',
            'info'
          );
        }
        return { success: true, message: res.message };
      }

      return {
        success: false,
        error: res.error?.message || 'Registration failed.'
      };
    } catch {
      // Fallback for static hosting environments
      const fallbackUser: User = {
        id: 'usr-demo-' + Math.random().toString(36).substring(2, 8),
        email: trimmedEmail,
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        country: data.country,
        address: data.address
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem('tesla_auth_session', JSON.stringify(fallbackUser));
      showNotification(`Account created successfully. Welcome, ${fallbackUser.fullName}! (Client Demonstration Session)`, 'success');
      return { success: true };
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
      showNotification(`Password reset instructions simulated for ${trimmed}.`, 'info');
      return {
        success: true,
        message: `Password reset instructions dispatched to ${trimmed} (Simulation).`
      };
    }
  };

  const signOut = () => {
    apiClient.logout();
    setCurrentUser(null);
    localStorage.removeItem('tesla_auth_session');
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

  const submitDemoClaim = async (vehicleId: string, address: DeliveryAddress): Promise<Claim> => {
    const vehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];
    const userId = currentUser ? currentUser.id : 'guest-prototype-' + Math.random().toString(36).substring(2, 6);
    const trackingCode = 'TSLA-TRK-' + Math.floor(100000 + Math.random() * 900000) + '-DEMO';

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
        isSimulation: true
      },
      authorizedNextSteps: [
        'Allocation claim received in demonstration intake queue.',
        'Address coordinates mapped for domestic carrier routing.',
        'Final operator compliance verification before carrier dispatch.'
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

  const updateClaimStatus = (claimId: string, newStatus: ClaimStatus) => {
    const updated = claims.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: newStatus,
          lastUpdatedDate: new Date().toISOString()
        };
      }
      return c;
    });
    setClaims(updated);
    localStorage.setItem('tesla_claims_db', JSON.stringify(updated));
    showNotification(`Claim ${claimId} status updated to ${newStatus}.`, 'info');
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
    showNotification('Thank you! Your prototype review has been recorded.', 'success');
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

  // Filter claims accessible to the authenticated user (or allow preview if demo user)
  const userClaims = currentUser
    ? claims.filter(c => c.userId === currentUser.id || c.userId === 'user-default-demo')
    : claims;

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
        updateClaimStatus,
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
