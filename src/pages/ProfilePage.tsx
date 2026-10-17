import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, Globe, Shield, MapPin, ArrowRight, Save, LogOut } from 'lucide-react';
import { TeslaEmblem } from '../components/TeslaBranding';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, signOut, navigateTo, showNotification } = useApp();

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    country: currentUser?.country || 'United States'
  });

  const [isEditing, setIsEditing] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#060607] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex justify-center mb-2">
            <TeslaEmblem className="w-8 h-8" />
          </div>
          <p className="text-zinc-400">Please sign in to view your profile.</p>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showNotification('Full name cannot be empty.', 'error');
      return;
    }
    updateProfile(formData);
    setIsEditing(false);
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
                MEMBER ACCOUNT
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Recipient Profile
            </h1>
            <p className="text-sm text-zinc-400">
              Manage your personal information, licensing contact, and security preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-900 gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg sm:text-xl font-bold text-white font-display shrink-0">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white font-display truncate">
                  {currentUser.fullName}
                </h2>
                <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                <span className="text-[10px] text-zinc-500 uppercase mt-0.5 block">
                  Member Since: {new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 sm:px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold uppercase tracking-wider rounded text-zinc-200 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 sm:px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold uppercase tracking-wider rounded text-zinc-400 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={signOut}
                className="px-3.5 sm:px-4 py-2 bg-zinc-900 hover:bg-[#E82127]/20 border border-zinc-800 text-xs font-bold uppercase tracking-wider rounded text-zinc-300 hover:text-[#E82127] transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Form / Details */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Country of Residence
                  </label>
                  <select
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
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
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E82127] hover:bg-[#b91318] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-wider">Legal Name</span>
                <p className="text-sm font-semibold text-white mt-1">{currentUser.fullName}</p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-wider">Email Address</span>
                <p className="text-sm font-semibold text-white mt-1">{currentUser.email}</p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-wider">Carrier Phone</span>
                <p className="text-sm font-semibold text-white mt-1">{currentUser.phone || 'Not provided'}</p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-wider">Territory</span>
                <p className="text-sm font-semibold text-white mt-1">{currentUser.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Link to Saved Delivery Address */}
        <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E82127]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Saved Delivery Address</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentUser.address?.streetAddress
                  ? `${currentUser.address.streetAddress}, ${currentUser.address.city}, ${currentUser.address.stateOrRegion}`
                  : 'No delivery address saved yet.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('delivery-address')}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-200 uppercase tracking-wider rounded border border-zinc-700 transition-colors"
          >
            Manage Address
          </button>
        </div>
      </div>
    </div>
  );
};
