import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  CheckCircle2,
  Globe,
  Gauge,
  Zap,
  Shield,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { TeslaEmblem } from '../components/TeslaBranding';

export const VehicleDetailsPage: React.FC = () => {
  const { selectedVehicle, navigateTo, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'specs' | 'interior' | 'technology' | 'charging' | 'terms'>('specs');

  // Fallback to first vehicle if none selected directly
  if (!selectedVehicle) {
    return (
      <div className="min-h-screen bg-[#060607] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <TeslaEmblem className="w-8 h-8" />
          </div>
          <p className="text-zinc-400">No vehicle selected.</p>
          <button
            onClick={() => navigateTo('explore')}
            className="px-6 py-2.5 bg-[#E82127] text-white font-bold text-xs uppercase tracking-wider rounded"
          >
            Back to Vehicle Directory
          </button>
        </div>
      </div>
    );
  }

  const v = selectedVehicle;

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-20">
      {/* Top Back Navigation Bar */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={() => navigateTo('explore')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to All Vehicle Listings</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 uppercase">Allocation Code:</span>
            <span className="text-zinc-300 font-mono font-bold">{v.allocationCode}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Main Grid: Gallery on Left, Specs & Allocation Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Vehicle Image & In-Depth Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[16/9] w-full bg-zinc-900 rounded-xl overflow-hidden border border-white/[0.08] relative">
              <img
                src={v.images.primary}
                alt={`${v.year} ${v.model} ${v.trim}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                decoding="async"
              />
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-zinc-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold text-white border border-white/10 max-w-[90%] truncate">
                {v.availabilityStatus} · {v.unitsRemaining} Units Left
              </div>
            </div>

            {/* Overview Editorial Block */}
            <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white font-display">Vehicle Overview</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {v.details.overview}
              </p>
            </div>

            {/* Tabbed In-Depth Features */}
            <div className="pt-6 border-t border-zinc-900 w-full overflow-hidden">
              <div className="flex border-b border-zinc-800 gap-3 sm:gap-6 text-xs font-semibold overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'specs', label: 'Full Specs' },
                  { id: 'interior', label: 'Interior Experience' },
                  { id: 'technology', label: 'Technology' },
                  { id: 'charging', label: 'Charging & Battery' },
                  { id: 'terms', label: 'Terms & Eligibility' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 transition-colors relative uppercase tracking-wider whitespace-nowrap shrink-0 text-left ${
                      activeTab === tab.id
                        ? 'text-white border-b-2 border-[#E82127]'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-6 text-sm">
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                      <span className="text-xs text-zinc-500">Acceleration (0-60 mph)</span>
                      <p className="text-base font-bold text-white mt-1 tabular-nums">{v.specs.acceleration0to60}</p>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                      <span className="text-xs text-zinc-500">Top Speed</span>
                      <p className="text-base font-bold text-white mt-1 tabular-nums">{v.specs.topSpeed}</p>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                      <span className="text-xs text-zinc-500">EPA Estimated Range</span>
                      <p className="text-base font-bold text-white mt-1 tabular-nums">{v.specs.range}</p>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                      <span className="text-xs text-zinc-500">Powertrain</span>
                      <p className="text-base font-bold text-white mt-1">{v.specs.drivetrain}</p>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                      <span className="text-xs text-zinc-500">Peak Supercharging</span>
                      <p className="text-base font-bold text-white mt-1">{v.specs.superchargingRate}</p>
                    </div>
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded">
                      <span className="text-xs text-zinc-500">Cargo & Seating</span>
                      <p className="text-base font-bold text-white mt-1">{v.specs.cargoCapacity} · {v.specs.seating} Seats</p>
                    </div>
                  </div>
                )}

                {activeTab === 'interior' && (
                  <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                    <p>{v.details.interiorDescription}</p>
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded text-xs space-y-2">
                      <p className="text-white font-semibold">Premium Cabin Materials & Acoustics</p>
                      <p className="text-zinc-400">
                        Acoustic laminated glass on all windows, 360-degree noise mitigation,
                        and vegan leather seating with power lumbar and memory profiles.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'technology' && (
                  <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                    <p>{v.details.technologyDescription}</p>
                    <p className="text-xs text-zinc-400">
                      Standard integration includes multi-device Bluetooth audio, wireless gaming
                      controller compatibility, real-time traffic route computation, and cellular remote
                      connectivity via mobile app.
                    </p>
                  </div>
                )}

                {activeTab === 'charging' && (
                  <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                    <p>{v.details.chargingDescription}</p>
                    <p className="text-xs text-zinc-400">
                      Standard NACS charge port supports all global Supercharger stations. Included
                      J1772 adapter enables charging at public Level 2 destination stations.
                    </p>
                  </div>
                )}

                {activeTab === 'terms' && (
                  <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                    <p>{v.details.termsSummary}</p>
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded text-xs space-y-2 text-zinc-400">
                      <p className="text-white font-semibold">Jurisdiction Eligibility</p>
                      <p>Currently configured for delivery in: {v.eligibleCountries.join(', ')}.</p>
                      <p>Recipients must be at least 21 years of age with a valid government driver license.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Specifications, Itemized Fee Breakdown, and Claim Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-4 sm:p-6 lg:p-8 bg-zinc-950 border border-white/[0.08] rounded-xl space-y-5 sm:space-y-6">
              <div>
                <div className="flex items-center gap-3 sm:gap-3.5 text-xs sm:text-sm text-zinc-400 uppercase font-semibold">
                  <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                  <span>{v.year} {v.model}</span>
                  <span>·</span>
                  <span>{v.colorName}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
                  {v.model}
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 font-medium">
                  {v.trim}
                </p>
              </div>

              {/* Verified Pricing & Fee Breakdown (Strict compliance: itemized, zero hidden fees, clearly explained) */}
              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider">Pricing Standard</span>
                  <span className="text-[#E82127] font-bold">DISCLOSED IN FULL</span>
                </div>

                <div className="bg-zinc-900/60 p-3.5 sm:p-4 rounded-lg space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Vehicle Base Price</span>
                    <span className="text-white font-bold text-sm">FREE ($0.00 USD)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Enclosed Transport & Freight</span>
                    <span className="text-zinc-200 font-semibold tabular-nums">${v.deliveryFeeUSD}.00 USD</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Title Documentation & Filing</span>
                    <span className="text-zinc-200 font-semibold tabular-nums">${v.documentationFeeUSD}.00 USD</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Deposit / Holding Fee</span>
                    <span className="text-zinc-200 font-semibold tabular-nums">$0.00 USD</span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-white font-bold text-sm">Total Disclosed at Delivery</span>
                    <span className="text-white font-bold text-base tabular-nums">${v.totalMandatoryFeeUSD}.00 USD</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 italic">
                  *Vehicle price is $0.00 under promotional allocation. Transport and documentation fees are non-waivable and itemized above.
                </p>
              </div>

              {/* Primary Claim Action */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    if (currentUser) {
                      navigateTo('checkout', v.id);
                    } else {
                      navigateTo('auth-signin', v.id);
                    }
                  }}
                  className="w-full py-3.5 sm:py-4 px-3 sm:px-4 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow-lg flex items-center justify-center gap-2 text-center leading-normal"
                >
                  <span>{currentUser ? 'Proceed to Checkout' : 'Sign In to Claim Vehicle'}</span>
                </button>

                <div className="flex items-start gap-2 p-3 bg-zinc-900/40 border border-zinc-800/80 rounded text-[11px] text-zinc-400">
                  <Info className="w-4 h-4 text-[#E82127] shrink-0 mt-0.5" />
                  <span>
                    <strong>Vehicle Allocation Notice.</strong> Verify your private delivery coordinates and complete itemized logistics settlement to secure dispatch.
                  </span>
                </div>
              </div>

              {/* Delivery Country Eligibility Check */}
              <div className="pt-4 border-t border-zinc-900 space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Eligible Territories for this Vehicle
                </p>
                <div className="flex flex-wrap gap-2">
                  {v.eligibleCountries.map(country => (
                    <span
                      key={country}
                      className="text-xs text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
