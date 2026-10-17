import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { DeliveryAddress } from '../types';
import { TeslaLogoLockup, TeslaEmblem } from '../components/TeslaBranding';

export const SignInPage: React.FC = () => {
  const { signIn, resetPassword, navigateTo, selectedVehicleId } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password reset modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await signIn(email, password);
    setIsLoading(false);

    if (res.success) {
      if (selectedVehicleId) {
        navigateTo('vehicle-details', selectedVehicleId);
      } else {
        navigateTo('home');
      }
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    const res = await resetPassword(resetEmail);
    setResetLoading(false);

    if (res.success) {
      setResetMessage(res.message || 'Password reset link sent to your email.');
    } else {
      setResetError(res.error || 'Failed to dispatch password reset request.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white flex items-center justify-center px-3 sm:px-6 py-10 sm:py-20">
      <div className="max-w-md w-full bg-zinc-950 border border-white/[0.08] rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 space-y-5 sm:space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <TeslaLogoLockup className="w-20 sm:w-24 h-auto" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Sign In to Tesla Portal
          </h1>
          <p className="text-xs text-zinc-400">
            Access your verified allocations, tracking records, and delivery profile.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#E82127]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-zinc-400 uppercase tracking-wider font-semibold">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setIsResetOpen(true);
                }}
                className="text-[11px] text-[#E82127] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#E82127]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#E82127] hover:bg-[#b91318] disabled:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-zinc-900 text-center text-xs text-zinc-400">
          Don't have an allocation account?{' '}
          <button
            onClick={() => navigateTo('auth-signup')}
            className="text-[#E82127] font-semibold hover:underline"
          >
            Register here
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                <h3 className="font-bold text-lg font-display">Reset Password</h3>
              </div>
              <button
                onClick={() => setIsResetOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter your registered email address. If an account is registered with this address,
              we will dispatch password reset instructions via Supabase Auth.
            </p>

            {resetMessage ? (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{resetMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                {resetError && (
                  <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded">
                    {resetError}
                  </div>
                )}

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="w-1/2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-1/2 py-2.5 bg-[#E82127] hover:bg-[#b91318] disabled:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-1.5"
                  >
                    {resetLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const SignUpPage: React.FC = () => {
  const { signUp, navigateTo, selectedVehicleId } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    country: 'United States',
    streetAddress: '',
    city: '',
    stateOrRegion: '',
    postalCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const address: DeliveryAddress = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      streetAddress: formData.streetAddress,
      city: formData.city,
      stateOrRegion: formData.stateOrRegion,
      postalCode: formData.postalCode,
      country: formData.country
    };

    const res = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone,
      country: formData.country,
      address
    });

    setIsLoading(false);

    if (res.success) {
      if (res.message && res.message.includes('email')) {
        setInfoMsg(res.message);
      } else {
        if (selectedVehicleId) {
          navigateTo('vehicle-details', selectedVehicleId);
        } else {
          navigateTo('home');
        }
      }
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white flex items-center justify-center px-3 sm:px-6 py-10 sm:py-20">
      <div className="max-w-xl w-full bg-zinc-950 border border-white/[0.08] rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 space-y-5 sm:space-y-6 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <TeslaLogoLockup className="w-20 sm:w-24 h-auto" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Create Tesla Recipient Account
          </h1>
          <p className="text-xs text-zinc-400">
            Register to participate in vehicle allocations and claim demonstrations.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs rounded space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
            <button
              onClick={() => navigateTo('auth-signin')}
              className="px-4 py-2 bg-[#E82127] text-white font-bold text-xs uppercase tracking-wider rounded"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {!infoMsg && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Elena Rostova"
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
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="elena@example.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-9941"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Country
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

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pr-10 pl-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-[#E82127]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Initial Delivery Street Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.streetAddress}
                  onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="400 Mission Street"
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
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="San Francisco"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  State / Province & Postal Code
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={formData.stateOrRegion}
                    onChange={e => setFormData({ ...formData, stateOrRegion: e.target.value })}
                    placeholder="CA"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="94105"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#E82127] hover:bg-[#b91318] disabled:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-zinc-900 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={() => navigateTo('auth-signin')}
            className="text-[#E82127] font-semibold hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
