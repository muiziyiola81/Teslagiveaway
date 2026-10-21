import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X, ArrowUpRight, ShieldCheck, User as UserIcon, LogOut, Search, Shield } from 'lucide-react';
import { TeslaLogo, TeslaEmblem, TeslaWordmark, TeslaLogoLockup } from './TeslaBranding';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activePage,
    navigateTo,
    isMobileNavOpen,
    toggleMobileNav,
    closeMobileNav,
    signOut,
    config
  } = useApp();

  const drawerRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // Close hamburger drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        closeMobileNav();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen, closeMobileNav]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Vehicles' },
    { id: 'how-to-claim', label: 'How to Claim' },
    { id: 'my-claims', label: 'My Claims' },
    ...(isAdmin ? [{ id: 'admin-dashboard', label: 'Admin Console' }] : []),
    { id: 'profile', label: 'My Profile' },
    { id: 'delivery-address', label: 'Delivery Address' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'support', label: 'Support' }
  ];

  const fullDrawerLinks = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Vehicles' },
    { id: 'how-to-claim', label: 'How to Claim Your Tesla' },
    { id: 'my-claims', label: 'My Claims' },
    ...(isAdmin ? [{ id: 'admin-dashboard', label: 'Admin Operations Console' }] : []),
    { id: 'profile', label: 'My Profile' },
    { id: 'delivery-address', label: 'Delivery Address' },
    { id: 'reviews', label: 'Customer Reviews' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'support', label: 'Contact & Support' }
  ];

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-zinc-950 border-b border-zinc-900 px-2 sm:px-4 py-1.5 text-center text-xs text-zinc-400 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0 min-w-0 max-w-full">
            <span className="text-[#E82127] font-semibold tracking-wider uppercase text-[10px] sm:text-[11px] flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E82127]" />
              Tesla Promotion:
            </span>
            <span className="truncate text-[11px] sm:text-xs text-zinc-300 max-w-[180px] xs:max-w-[240px] sm:max-w-none">
              Authorized Allocation · Free ($0.00) Base Price · Disclosed Delivery Fees Only
            </span>
          </div>
          <button
            onClick={() => navigateTo('support')}
            className="hidden sm:inline-flex items-center text-[11px] text-zinc-400 hover:text-white underline decoration-zinc-700 hover:decoration-white transition-colors shrink-0"
          >
            Program Terms
          </button>
        </div>
      </div>

      {/* Main Top Bar matching official Tesla layout */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-white/[0.08] transition-colors w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Zone 1: Official Red Tesla Logo */}
          <button
            onClick={() => navigateTo(currentUser ? 'home' : 'landing')}
            className="flex items-center gap-2 text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity focus:outline-none min-w-0"
            aria-label="Tesla Vehicle Giveaway Portal"
          >
            <TeslaLogo variant="full" />
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-zinc-300">
            {navLinks.map(link => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => navigateTo(link.id as any)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E82127]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Search, Profile/Sign In, and Hamburger Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => navigateTo('explore')}
              title="Search vehicles"
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors"
              aria-label="Search vehicles"
            >
              <Search className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                onClick={() => navigateTo('admin-dashboard' as any)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#E82127] hover:bg-[#b91318] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
                title="Open Admin Operations Console"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {currentUser ? (
              <button
                onClick={() => navigateTo('profile')}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 border border-zinc-800 rounded-md hover:border-zinc-700 hover:bg-zinc-800 transition-all whitespace-nowrap shrink-0 max-w-[130px] sm:max-w-[200px]"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#E82127] shrink-0" />
                <span className="truncate text-xs">{currentUser.fullName}</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('auth-signin')}
                className="inline-flex items-center justify-center px-2.5 sm:px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#E82127] rounded-md hover:bg-[#b91318] transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Sign In
              </button>
            )}

            {/* Hamburger Trigger */}
            <button
              onClick={toggleMobileNav}
              aria-label={isMobileNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileNavOpen}
              className="p-1.5 sm:p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-md border border-white/[0.08] transition-colors shrink-0"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer (Mobile & Full Menu) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeMobileNav}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="relative w-full max-w-[88vw] sm:max-w-md bg-zinc-950 border-l border-zinc-800 p-5 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto h-full z-10 animate-in slide-in-from-right duration-200"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <TeslaLogo variant="full" />
                </div>
                <button
                  onClick={closeMobileNav}
                  aria-label="Close menu"
                  className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User summary if logged in */}
              {currentUser && (
                <div className="mt-4 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={signOut}
                      title="Sign Out"
                      className="p-2 text-zinc-400 hover:text-[#E82127] rounded transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="mt-6 flex flex-col space-y-1">
                {fullDrawerLinks.map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id as any)}
                      className={`flex items-center justify-between w-full px-3.5 py-3 rounded-md text-left text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#E82127]/10 text-white border-l-2 border-[#E82127]'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#E82127]' : 'text-zinc-400'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-zinc-900 mt-6">
              {currentUser ? (
                <button
                  onClick={signOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigateTo('auth-signin')}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-center text-white bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigateTo('auth-signup')}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-center text-white bg-[#E82127] rounded-md hover:bg-[#b91318] transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Authorized Tesla Promotion</span>
                <span className="text-[#E82127] font-semibold">Promotion Terms Apply</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
