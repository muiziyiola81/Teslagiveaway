import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ShieldCheck, Save, CheckCircle2, ArrowLeft } from 'lucide-react';
import { DeliveryAddress } from '../types';
import { TeslaEmblem } from '../components/TeslaBranding';

export const DeliveryAddressPage: React.FC = () => {
  const { currentUser, updateDeliveryAddress, navigateTo, showNotification } = useApp();

  const [address, setAddress] = useState<DeliveryAddress>(
    currentUser?.address || {
      fullName: '',
      email: '',
      phone: '',
      streetAddress: '',
      apartmentOrSuite: '',
      city: '',
      stateOrRegion: '',
      postalCode: '',
      country: 'United States'
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#060607] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex justify-center mb-2">
            <TeslaEmblem className="w-8 h-8" />
          </div>
          <p className="text-zinc-400">Please sign in to manage your delivery destination.</p>
          <button
            onClick={() => navigateTo('auth-signin')}
            className="w-full px-6 py-3 bg-[#E82127] text-white font-bold text-xs uppercase tracking-wider rounded"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof DeliveryAddress, val: string) => {
    setAddress(prev => ({ ...prev, [field]: val }));
    setSavedSuccess(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !address.fullName.trim() ||
      !address.email.trim() ||
      !address.phone.trim() ||
      !address.streetAddress.trim() ||
      !address.city.trim() ||
      !address.stateOrRegion.trim() ||
      !address.postalCode.trim()
    ) {
      showNotification('Please fill in all mandatory address fields.', 'error');
      return;
    }

    updateDeliveryAddress(address);
    setSavedSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      {/* Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                CARRIER DISPATCH COORDINATES
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Delivery Address
            </h1>
            <p className="text-sm text-zinc-400">
              Specify your private residential or commercial driveway coordinates for enclosed trailer
              unloading. Never disclosed to third parties or other users.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {savedSuccess && (
          <div className="p-4 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>Delivery address updated and saved to your private profile.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-zinc-950 border border-white/[0.08] rounded-xl p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E82127]" />
              <h2 className="text-lg font-bold text-white font-display">
                Address Information
              </h2>
            </div>
            <span className="text-xs text-zinc-500">All fields mandatory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                Recipient Legal Name
              </label>
              <input
                type="text"
                required
                value={address.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                placeholder="Marcus Vance"
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                required
                value={address.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="marcus@example.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                Carrier Contact Phone
              </label>
              <input
                type="tel"
                required
                value={address.phone}
                onChange={e => handleChange('phone', e.target.value)}
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
                onChange={e => handleChange('country', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="Norway">Norway</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                Street Address (Driveway / Unloading Spot)
              </label>
              <input
                type="text"
                required
                value={address.streetAddress}
                onChange={e => handleChange('streetAddress', e.target.value)}
                placeholder="1 Tesla Road"
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
                onChange={e => handleChange('apartmentOrSuite', e.target.value)}
                placeholder="Suite 100 or Gate code #4019"
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
                onChange={e => handleChange('city', e.target.value)}
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
                onChange={e => handleChange('stateOrRegion', e.target.value)}
                placeholder="TX"
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
                onChange={e => handleChange('postalCode', e.target.value)}
                placeholder="78701"
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-[#E82127]" />
              <span>Confidential. Never exposed in public directories.</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Delivery Address</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
