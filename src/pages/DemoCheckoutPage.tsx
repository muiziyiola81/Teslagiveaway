import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  Lock,
  MapPin,
  Check
} from 'lucide-react';
import { DeliveryAddress } from '../types';
import { TeslaLogo, TeslaEmblem } from '../components/TeslaBranding';

export const DemoCheckoutPage: React.FC = () => {
  const {
    selectedVehicle,
    currentUser,
    submitDemoClaim,
    navigateTo,
    showNotification
  } = useApp();

  const [address, setAddress] = useState<DeliveryAddress>(
    currentUser?.address || {
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      streetAddress: '',
      apartmentOrSuite: '',
      city: '',
      stateOrRegion: '',
      postalCode: '',
      country: currentUser?.country || 'United States'
    }
  );

  const [hasAcknowledgedSim, setHasAcknowledgedSim] = useState(false);
  const [hasAcknowledgedFees, setHasAcknowledgedFees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedClaimTracking, setSubmittedClaimTracking] = useState<string | null>(null);

  if (!selectedVehicle) {
    return (
      <div className="min-h-screen bg-[#060607] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <TeslaEmblem className="w-8 h-8" />
          </div>
          <p className="text-zinc-400">No vehicle selected for claim checkout.</p>
          <button
            onClick={() => navigateTo('explore')}
            className="px-6 py-2.5 bg-[#E82127] text-white font-bold text-xs uppercase tracking-wider rounded"
          >
            Explore Vehicles
          </button>
        </div>
      </div>
    );
  }

  const v = selectedVehicle;

  const handleAddressChange = (field: keyof DeliveryAddress, val: string) => {
    setAddress(prev => ({ ...prev, [field]: val }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.fullName || !address.email || !address.phone || !address.streetAddress || !address.city || !address.postalCode) {
      showNotification('Please fill in all mandatory delivery address fields.', 'error');
      return;
    }

    if (!hasAcknowledgedSim || !hasAcknowledgedFees) {
      showNotification('Please confirm the prototype simulation and fee disclosure acknowledgements.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create new claim in prototype storage
      const claim = await submitDemoClaim(v.id, address);
      setSubmittedClaimTracking(claim.trackingNumber);
      showNotification('Demonstration claim submitted successfully!', 'success');
    } catch {
      showNotification('Encountered an error while submitting prototype claim.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If claim was just submitted, show explicit Demo Confirmation screen
  if (submittedClaimTracking) {
    return (
      <div className="min-h-screen bg-[#060607] text-white py-12 sm:py-20 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-zinc-950 border border-white/[0.1] rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <TeslaLogo variant="stacked" className="w-20 sm:w-24 h-auto" />
            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E82127]">
              DEMO CONFIRMATION · PROTOTYPE SIMULATION ONLY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Claim Reservation Registered
            </h1>
            <p className="text-sm text-zinc-400">
              Your demonstration allocation claim has been generated with a prototype tracking ID:
            </p>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center space-y-1">
            <span className="text-xs text-zinc-500 uppercase">Simulated Tracking Code</span>
            <p className="text-xl font-mono font-bold text-white tracking-wider">
              {submittedClaimTracking}
            </p>
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-lg text-left text-xs text-zinc-400 space-y-2 border border-zinc-800/80">
            <p className="text-zinc-200 font-semibold">Simulated Parameters Logged:</p>
            <p>· Vehicle: {v.year} {v.model} {v.trim}</p>
            <p>· Destination: {address.streetAddress}, {address.city}, {address.stateOrRegion} {address.postalCode}</p>
            <p>· Disclosed Mandatory Fees: ${v.totalMandatoryFeeUSD}.00 USD (No payment was collected)</p>
            <p>· Status: Submitted (Review intake pending)</p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('my-claims')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
            >
              Track in My Claims
            </button>
            <button
              onClick={() => navigateTo('explore')}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded border border-zinc-800 transition-colors"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      {/* Editorial Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                [SIMULATION / PROTOTYPE DEMO CHECKOUT]
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
              Vehicle Claim Checkout Simulation
            </h1>
            <p className="text-sm text-zinc-400">
              Review your selected electric vehicle, verify your private delivery destination, and
              confirm itemized transport fees. No financial credentials collected.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Delivery Address Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-4 sm:p-6 lg:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#E82127]" />
                  <h2 className="text-lg font-bold text-white font-display">
                    Delivery Address & Recipient
                  </h2>
                </div>
                <span className="text-xs text-zinc-500">*All fields required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={e => handleAddressChange('fullName', e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={address.email}
                    onChange={e => handleAddressChange('email', e.target.value)}
                    placeholder="marcus@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Phone Number (Carrier Contact)
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={e => handleAddressChange('phone', e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Country
                  </label>
                  <select
                    value={address.country}
                    onChange={e => handleAddressChange('country', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  >
                    {v.eligibleCountries.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Street Address (Ground Carrier Accessible)
                  </label>
                  <input
                    type="text"
                    required
                    value={address.streetAddress}
                    onChange={e => handleAddressChange('streetAddress', e.target.value)}
                    placeholder="1200 Performance Way"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Apartment / Suite / Gate Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={address.apartmentOrSuite || ''}
                    onChange={e => handleAddressChange('apartmentOrSuite', e.target.value)}
                    placeholder="Apt 4B or Gate 102"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={e => handleAddressChange('city', e.target.value)}
                    placeholder="Austin"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    State / Province / Region
                  </label>
                  <input
                    type="text"
                    required
                    value={address.stateOrRegion}
                    onChange={e => handleAddressChange('stateOrRegion', e.target.value)}
                    placeholder="Texas"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Postal / Zip Code
                  </label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={e => handleAddressChange('postalCode', e.target.value)}
                    placeholder="78701"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>
              </div>

              <div className="pt-2 text-[11px] text-zinc-500">
                Addresses are saved to your private profile and never shared or exposed to other users.
              </div>
            </div>

            {/* Simulation Warning & Acknowledgement */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#E82127] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-white uppercase tracking-wider">
                    PROTOTYPE SIMULATION TERMS
                  </p>
                  <p className="text-zinc-400 leading-relaxed">
                    This checkout is an interactive prototype simulation. We do not request card details,
                    bank account numbers, wire transfers, or cryptocurrency payments. Submitting creates
                    a demonstration claim record for evaluation purposes.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAcknowledgedSim}
                    onChange={e => setHasAcknowledgedSim(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 text-[#E82127] focus:ring-[#E82127]"
                  />
                  <span className="text-zinc-300">
                    I understand this is a clearly labeled simulation and prototype demo.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAcknowledgedFees}
                    onChange={e => setHasAcknowledgedFees(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-700 text-[#E82127] focus:ring-[#E82127]"
                  />
                  <span className="text-zinc-300">
                    I have reviewed the itemized freight ($1,200) and documentation fee ($190) disclosure.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Vehicle Summary & Itemized Order Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-4 sm:p-6 lg:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <h2 className="text-lg font-bold text-white font-display">
                  Selected Allocation
                </h2>
                <TeslaEmblem className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
              </div>

              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-zinc-900 relative">
                <img
                  src={v.images.primary}
                  alt={v.model}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-zinc-950/80 px-2.5 py-1 rounded text-[11px] font-bold text-white">
                  {v.year}
                </div>
              </div>

              <div>
                <span className="text-xs text-zinc-500 uppercase">{v.colorName} · {v.allocationCode}</span>
                <h3 className="text-xl font-bold text-white font-display mt-0.5">
                  {v.model} <span className="text-zinc-400 font-normal">{v.trim}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Drivetrain: {v.specs.drivetrain} · Range: {v.specs.range}
                </p>
              </div>

              {/* Itemized USD Fee Calculation */}
              <div className="pt-4 border-t border-zinc-900 space-y-3 text-xs">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider block">
                  Itemized Fee Breakdown
                </span>

                <div className="divide-y divide-zinc-900">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-zinc-400">Allocated Vehicle Purchase Price</span>
                    <span className="text-white font-bold">FREE ($0.00 USD)</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center text-zinc-300">
                    <span>Enclosed Transport Logistics Fee</span>
                    <span className="tabular-nums font-semibold">${v.deliveryFeeUSD}.00 USD</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center text-zinc-300">
                    <span>Filing & Title Documentation Fee</span>
                    <span className="tabular-nums font-semibold">${v.documentationFeeUSD}.00 USD</span>
                  </div>
                  <div className="py-3 flex justify-between items-center font-bold text-base text-white">
                    <span>Total Disclosed Amount</span>
                    <span className="tabular-nums">${v.totalMandatoryFeeUSD}.00 USD</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/80 text-[11px] text-zinc-400">
                  Total charged during this demo: <strong className="text-white">$0.00 (Simulated Checkout)</strong>
                </div>
              </div>

              {/* Submit Demo Claim Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#E82127] hover:bg-[#b91318] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Generating Demo Claim...</span>
                ) : (
                  <>
                    <span>Submit Demo Claim Allocation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigateTo('vehicle-details', v.id)}
                className="w-full text-center text-xs text-zinc-500 hover:text-white transition-colors"
              >
                ← Return to Vehicle Specifications
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
