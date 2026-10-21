/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NotificationBanner } from './components/NotificationBanner';

// Keep critical initial entry pages static for immediate zero-delay first paint
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';

// Lazy-load secondary views for fast initial load
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const VehicleDetailsPage = lazy(() => import('./pages/VehicleDetailsPage').then(m => ({ default: m.VehicleDetailsPage })));
const HowToClaimPage = lazy(() => import('./pages/HowToClaimPage').then(m => ({ default: m.HowToClaimPage })));
const MyClaimsPage = lazy(() => import('./pages/MyClaimsPage').then(m => ({ default: m.MyClaimsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DeliveryAddressPage = lazy(() => import('./pages/DeliveryAddressPage').then(m => ({ default: m.DeliveryAddressPage })));
const DemoCheckoutPage = lazy(() => import('./pages/DemoCheckoutPage').then(m => ({ default: m.DemoCheckoutPage })));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const TermsPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.PrivacyPage })));
const SupportPage = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.SupportPage })));
const SignInPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.SignUpPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

import { TeslaEmblem } from './components/TeslaBranding';

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-[#000000]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center w-14 h-14">
        <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping opacity-30" />
        <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center p-2.5 shadow-lg shadow-red-950/30">
          <TeslaEmblem className="w-full h-full" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 font-semibold font-display">
          Loading Allocation Portal
        </span>
        <div className="w-16 h-0.5 bg-zinc-900 overflow-hidden rounded-full">
          <div className="w-full h-full bg-[#E82127] animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const MainRouter: React.FC = () => {
  const { activePage } = useApp();

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage />;
      case 'home':
        return <HomePage />;
      case 'explore':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <ExplorePage />
          </Suspense>
        );
      case 'vehicle-details':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <VehicleDetailsPage />
          </Suspense>
        );
      case 'how-to-claim':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <HowToClaimPage />
          </Suspense>
        );
      case 'my-claims':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <MyClaimsPage />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <ProfilePage />
          </Suspense>
        );
      case 'delivery-address':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <DeliveryAddressPage />
          </Suspense>
        );
      case 'checkout':
      case 'demo-checkout':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <DemoCheckoutPage />
          </Suspense>
        );
      case 'reviews':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <ReviewsPage />
          </Suspense>
        );
      case 'terms':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <TermsPage />
          </Suspense>
        );
      case 'privacy':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <PrivacyPage />
          </Suspense>
        );
      case 'support':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <SupportPage />
          </Suspense>
        );
      case 'auth-signin':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <SignInPage />
          </Suspense>
        );
      case 'auth-signup':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <SignUpPage />
          </Suspense>
        );
      case 'admin-dashboard':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <AdminDashboardPage />
          </Suspense>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden flex flex-col bg-[#060607] text-[#F4F4F5] selection:bg-[#E82127] selection:text-white">
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {renderCurrentPage()}
      </main>
      <Footer />
      <NotificationBanner />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
