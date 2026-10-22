import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Lock,
  ChevronRight
} from 'lucide-react';
import { TeslaLogo, TeslaEmblem, TeslaAuthorizedBadge } from '../components/TeslaBranding';

export const LandingPage: React.FC = () => {
  const { navigateTo, vehicles } = useApp();

  return (
    <div className="min-h-screen bg-[#060607] text-white">
      {/* Hero Section matching official Tesla giveaway layout */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-white/[0.06]">
        {/* Background Image with measured dark gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="./images/model-s-hero.jpg"
            alt="Tesla Model S Plaid Vehicle Giveaway"
            className="w-full h-full object-cover object-center filter brightness-[0.65]"
            referrerPolicy="no-referrer"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060607] via-[#060607]/60 to-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Official Lockup, Headline & CTA */}
            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              {/* Tesla Brand Badge Lockup */}
              <div className="flex items-center gap-3 sm:gap-3.5">
                <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#E82127]">
                  AUTHORIZED VEHICLE GIVEAWAY
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white font-display text-balance">
                Drive the Future With Tesla
              </h1>

              <p className="text-sm sm:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-2xl">
                Authorized Tesla vehicle giveaway promotion. Qualify, select your model, and claim
                your Tesla with no vehicle base price. Mandatory delivery and documentation charges disclosed in full.
              </p>

              {/* Primary Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                <button
                  onClick={() => navigateTo('explore')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-md transition-all shadow-xl hover:shadow-red-900/40 flex items-center justify-center gap-2 sm:gap-3 shrink-0"
                >
                  <span>Explore Available Vehicles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateTo('how-to-claim')}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 shrink-0 backdrop-blur-sm"
                >
                  <span>How to Claim</span>
                </button>
              </div>

              {/* Transparent Disclosed Terms Mini-Strip */}
              <div className="pt-5 border-t border-white/[0.1] grid grid-cols-3 gap-2 sm:gap-6 max-w-lg text-xs">
                <div className="min-w-0">
                  <p className="text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs truncate">Vehicle Price</p>
                  <p className="text-white font-bold text-xs sm:text-sm mt-0.5 truncate">$0.00 / Free</p>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Promotion Allocation</p>
                </div>
                <div className="min-w-0">
                  <p className="text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs truncate">Freight & Doc</p>
                  <p className="text-white font-bold text-xs sm:text-sm mt-0.5 truncate">$1,390 USD</p>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Disclosed in full</p>
                </div>
                <div className="min-w-0">
                  <p className="text-zinc-500 uppercase tracking-wider text-[10px] sm:text-xs truncate">Status</p>
                  <p className="text-[#E82127] font-bold text-xs sm:text-sm mt-0.5 truncate">Authorized</p>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">Terms Apply</p>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Authorization Card */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end w-full max-w-full overflow-hidden">
              <TeslaAuthorizedBadge variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Key Value Propositions Strip */}
      <section className="bg-zinc-950 border-b border-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-900">
            <TeslaLogo variant="compact" />
            <div>
              <h4 className="text-sm font-bold text-white">Authentic Tesla Vehicles</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Verified specs & configurations</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-900">
            <ShieldCheck className="w-6 h-6 text-[#E82127] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Authorized Promotion</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Transparent & documented terms</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-900">
            <Truck className="w-6 h-6 text-[#E82127] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Carrier Home Delivery</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Direct transport in eligible regions</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-900">
            <Lock className="w-6 h-6 text-[#E82127] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Disclosed Fees</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Zero vehicle cost + shipping fee</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: 6-Step Process */}
      <section className="py-20 sm:py-28 bg-[#090A0C] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              How It Works
            </h2>
            <p className="text-sm text-zinc-400">
              A transparent 6-step claim and allocation process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                step: '1',
                title: 'Check Eligibility',
                desc: 'Confirm age (21+) and eligible region requirements.'
              },
              {
                step: '2',
                title: 'Select Your Vehicle',
                desc: 'Explore available Model 3, Model Y, Model S, or Model X.'
              },
              {
                step: '3',
                title: 'Review Details',
                desc: 'Inspect full specifications and itemized fees.'
              },
              {
                step: '4',
                title: 'Submit Your Claim',
                desc: 'Provide verified delivery details in the portal.'
              },
              {
                step: '5',
                title: 'Track Your Status',
                desc: 'Monitor claim review and transport dispatch.'
              },
              {
                step: '6',
                title: 'Carrier Delivery',
                desc: 'Coordinate delivery handover and vehicle intake.'
              }
            ].map(item => (
              <div
                key={item.step}
                className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col items-center text-center space-y-3"
              >
                <div className="w-10 h-10 rounded-full border border-[#E82127] text-[#E82127] flex items-center justify-center font-bold text-sm font-display">
                  {item.step}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED MODELS: 4-Model Strip */}
      <section className="py-20 sm:py-28 bg-[#060607] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#E82127] mb-1">
                FEATURED MODELS
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                Premium Vehicles. Real Opportunities.
              </h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Explore our available Tesla models and find the perfect match for your lifestyle.
              </p>
            </div>

            <button
              onClick={() => navigateTo('explore')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-[#E82127] border border-zinc-800 px-4 py-2.5 rounded hover:border-zinc-700 transition-colors"
            >
              <span>View All Vehicles</span>
              <ChevronRight className="w-4 h-4 text-[#E82127]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map(v => (
              <div
                key={v.id}
                className="group rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-900 relative">
                    <img
                      src={v.images.primary}
                      alt={v.model}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      {v.availabilityStatus}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold text-white font-display">{v.model}</h3>
                    <p className="text-xs text-zinc-400">
                      {v.model === 'Model 3' && 'Performance | Efficiency | Style'}
                      {v.model === 'Model Y' && 'Space | Versatility | Innovation'}
                      {v.model === 'Model S' && 'Luxury | Performance | Range'}
                      {v.model === 'Model X' && 'Space | Performance | Advanced'}
                    </p>
                    <div className="pt-2 text-[11px] text-zinc-500">
                      <span>Vehicle Price: </span>
                      <strong className="text-white font-semibold">FREE ($0.00)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => navigateTo('vehicle-details', v.id)}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 hover:bg-[#E82127] rounded transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
