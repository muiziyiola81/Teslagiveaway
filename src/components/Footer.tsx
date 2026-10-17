import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield } from 'lucide-react';
import { TeslaLogo, TeslaEmblem, TeslaWordmark } from './TeslaBranding';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-zinc-950 border-t border-white/[0.08] text-zinc-400 mt-auto">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <TeslaLogo variant="full" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Authorized Tesla Vehicle Allocation Portal. Browse verified Tesla electric vehicle allocations,
              review exact specifications, and submit your claim with disclosed delivery fees.
            </p>
          </div>

          {/* Vehicle Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
              Tesla Models
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-white transition-colors"
                >
                  Model 3
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-white transition-colors"
                >
                  Model Y
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-white transition-colors"
                >
                  Model S
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-white transition-colors"
                >
                  Model X
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Delivery */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
              Claim & Account
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('how-to-claim')}
                  className="hover:text-white transition-colors"
                >
                  How to Claim Your Tesla
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('my-claims')}
                  className="hover:text-white transition-colors"
                >
                  My Claims & Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('profile')}
                  className="hover:text-white transition-colors"
                >
                  Recipient Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('delivery-address')}
                  className="hover:text-white transition-colors"
                >
                  Saved Delivery Address
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
              Support & Legal
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('reviews')}
                  className="hover:text-white transition-colors"
                >
                  Customer Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('support')}
                  className="hover:text-white transition-colors"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Bar matching User Layout */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <TeslaLogo variant="wordmark" />
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
            <button onClick={() => navigateTo('home')} className="hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => navigateTo('explore')} className="hover:text-white transition-colors">
              Explore Vehicles
            </button>
            <button onClick={() => navigateTo('how-to-claim')} className="hover:text-white transition-colors">
              How to Claim
            </button>
            <button onClick={() => navigateTo('my-claims')} className="hover:text-white transition-colors">
              My Claims
            </button>
            <button onClick={() => navigateTo('profile')} className="hover:text-white transition-colors">
              My Profile
            </button>
            <button onClick={() => navigateTo('delivery-address')} className="hover:text-white transition-colors">
              Delivery Address
            </button>
            <button onClick={() => navigateTo('reviews')} className="hover:text-white transition-colors">
              Reviews
            </button>
            <button onClick={() => navigateTo('support')} className="hover:text-white transition-colors">
              Support
            </button>
          </nav>

          <div className="flex items-center gap-3 text-xs text-zinc-400 text-right">
            <TeslaLogo variant="compact" />
            <div className="text-[11px] text-zinc-400 text-left md:text-right">
              <p>© 2026 Tesla Promotion. All rights reserved.</p>
              <p>Authorized vehicle promotion. <button onClick={() => navigateTo('terms')} className="text-zinc-300 hover:text-white underline">Terms and conditions apply.</button></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
