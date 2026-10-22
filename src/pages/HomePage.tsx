import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
import { TeslaLogo, TeslaEmblem, TeslaAuthorizedBadge } from '../components/TeslaBranding';

export const HomePage: React.FC = () => {
  const {
    currentUser,
    navigateTo,
    deliveryStories
  } = useApp();

  return (
    <div className="min-h-screen bg-[#060607] text-white">
      {/* Cinematic Hero for Authenticated Portal */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 z-0">
          <img
            src="./images/model-s-hero.jpg"
            alt="Tesla Model S Plaid Vehicle Allocation Portal"
            className="w-full h-full object-cover object-center filter brightness-[0.65]"
            referrerPolicy="no-referrer"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060607] via-[#060607]/60 to-black/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                <span className="text-xs sm:text-sm uppercase tracking-widest text-[#E82127] font-bold">
                  MEMBER PORTAL
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display text-balance">
                Welcome, {currentUser?.fullName || 'Valued Member'}.
              </h1>

              <p className="text-lg text-zinc-300 font-normal leading-relaxed max-w-2xl">
                Your profile is active in the Authorized Tesla Vehicle Giveaway. Browse available Tesla
                models, review transparent delivery fees, and track your allocation status in real time.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => navigateTo('explore')}
                  className="px-8 py-4 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-sm uppercase tracking-wider rounded-md transition-all shadow-lg flex items-center justify-center gap-3 shrink-0"
                >
                  <span>Explore Available Vehicles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateTo('my-claims')}
                  className="px-8 py-4 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-sm uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 shrink-0 backdrop-blur-sm"
                >
                  <span>View My Claims</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <TeslaAuthorizedBadge variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Promotion Details & Transparent Terms */}
      <section className="py-16 sm:py-24 bg-[#090A0C] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#E82127] mb-2">
              Official Program Terms
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-display">
              Promotion Details & Mandatory Disclosures
            </h2>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Authorized promotion terms. Review the transparent parameters governing current allocations:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">1. Base Price</p>
              <h3 className="text-xl font-bold text-white font-display">Vehicle Cost: Free ($0.00)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Allocated Tesla units are provided at zero vehicle base purchase price under authorized promotional grants.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">2. Itemized Delivery</p>
              <h3 className="text-xl font-bold text-white font-display">$1,390 USD Disclosed</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Includes $1,200 enclosed carrier logistics + $190 title documentation. Zero hidden processing markups.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">3. Transparent Settlement</p>
              <h3 className="text-xl font-bold text-white font-display">Flexible Payment Options</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Secure direct Cryptocurrency payment and institutional bank settlement with transparent allocation tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Claim Section */}
      <section className="py-16 sm:py-24 bg-[#060607] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#E82127] mb-2">
                Simple 6-Step Process
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-display">
                How to Claim Your Tesla
              </h2>
            </div>
            <button
              onClick={() => navigateTo('how-to-claim')}
              className="text-sm font-bold text-[#E82127] hover:underline"
            >
              Read Complete Guide →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { num: '1', title: 'Check Eligibility', desc: 'Confirm you meet the requirements.' },
              { num: '2', title: 'Select a Vehicle', desc: 'Browse available Tesla models and trims.' },
              { num: '3', title: 'Review Details', desc: 'Confirm specifications, terms and fees.' },
              { num: '4', title: 'Submit Your Claim', desc: 'Complete the official claim process.' },
              { num: '5', title: 'Under Review', desc: 'Review application status in your portal.' },
              { num: '6', title: 'Get Your Tesla', desc: 'Once approved, carrier transport details dispatch.' }
            ].map(step => (
              <div key={step.num} className="p-5 rounded-lg bg-zinc-950 border border-zinc-800 text-center space-y-2">
                <span className="w-8 h-8 rounded-full border border-[#E82127] text-[#E82127] flex items-center justify-center mx-auto text-xs font-bold font-display">
                  {step.num}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Tracking & Handover Workflows */}
      <section className="py-16 sm:py-24 bg-[#090A0C] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-2 mb-2">
              <TeslaLogo variant="compact" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                Delivery Workflow Records
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-display">
              Carrier Dispatch & Logistics Records
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              Verified dispatch records illustrating carrier transport coordination, status updates, and title handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {deliveryStories.map(story => (
              <div
                key={story.id}
                className="rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row"
              >
                <div className="sm:w-1/2 aspect-[16/9] sm:aspect-auto relative bg-zinc-900">
                  <img
                    src={story.imageUrl}
                    alt={story.vehicleModel}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-zinc-300">
                    Allocated Unit
                  </div>
                </div>
                <div className="sm:w-1/2 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] text-[#E82127] font-semibold uppercase">
                      {story.location} · {story.deliveredDate}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{story.vehicleModel}</h3>
                    <p className="text-xs text-zinc-400 mt-2 italic leading-relaxed">
                      "{story.quote}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                    <span>Recipient: {story.recipientName}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">Sample Workflow Record</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
