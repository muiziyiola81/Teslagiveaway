import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Building2,
  Upload,
  Check,
  Eye,
  X,
  CreditCard
} from 'lucide-react';

import { ClaimStatus, DeliveryStatus, PaymentStatus } from '../types';
import { TeslaEmblem } from '../components/TeslaBranding';

export const MyClaimsPage: React.FC = () => {
  const { userClaims, currentUser, submitPaymentEvidence, navigateTo, showNotification } = useApp();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  React.useEffect(() => {
    if (userClaims && userClaims.length > 0) {
      if (!selectedClaimId || !userClaims.some(c => c.id === selectedClaimId)) {
        setSelectedClaimId(userClaims[0].id);
      }
    } else {
      setSelectedClaimId(null);
    }
  }, [userClaims, selectedClaimId]);

  // Wire payment submission modal state
  const [showWireModal, setShowWireModal] = useState(false);
  const [wireBankName, setWireBankName] = useState('');
  const [wireSenderName, setWireSenderName] = useState(currentUser?.fullName || '');
  const [wireReference, setWireReference] = useState('');
  const [wireReceiptUrl, setWireReceiptUrl] = useState<string | null>(null);
  const [wireNotes, setWireNotes] = useState('');
  const [isSubmittingWire, setIsSubmittingWire] = useState(false);

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case 'Submitted':
        return 'text-sky-400 border-sky-800 bg-sky-950/40';
      case 'Under Review':
        return 'text-amber-400 border-amber-800 bg-amber-950/40';
      case 'Approved':
        return 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
      case 'Rejected':
        return 'text-red-400 border-red-800 bg-red-950/40';
      case 'Processing':
        return 'text-blue-400 border-blue-800 bg-blue-950/40';
      case 'Ready for Delivery':
        return 'text-cyan-400 border-cyan-800 bg-cyan-950/40';
      case 'Delivered':
      case 'Completed':
        return 'text-purple-400 border-purple-800 bg-purple-950/40';
      default:
        return 'text-zinc-400 border-zinc-700 bg-zinc-900';
    }
  };

  // If no user is authenticated, show NO claims and prompt to sign in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#060607] text-white pb-24">
        {/* Header */}
        <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                  RECIPIENT ALLOCATION TRACKING
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
                My Vehicle Claims
              </h1>
              <p className="text-sm text-zinc-400">
                Please sign in to view your claims.
              </p>
            </div>
          </div>
        </div>

        {/* Unauthenticated Simple Message */}
        <div className="max-w-md mx-auto px-4 pt-16 sm:pt-24 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto p-4 shadow-xl">
            <TeslaEmblem className="w-full h-full text-zinc-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Authentication Required
            </h2>
            <p className="text-sm text-zinc-400">
              Please sign in to view your claims.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('auth-signin')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-lg"
            >
              Sign In to Tesla Portal
            </button>
            <button
              onClick={() => navigateTo('explore')}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded border border-zinc-800 transition-colors"
            >
              Explore Vehicles
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeClaim = userClaims.find(c => c.id === selectedClaimId) || userClaims[0];
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const handleReceiptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      showNotification('Please upload an image receipt (JPEG/PNG) or PDF remittance slip.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Receipt file size must be under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setWireReceiptUrl(reader.result as string);
      showNotification('Receipt attached successfully.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleWireEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;

    if (!wireReference.trim() || !wireBankName.trim() || !wireSenderName.trim()) {
      showNotification('Please fill in bank name, sender name, and wire reference number.', 'error');
      return;
    }

    setIsSubmittingWire(true);
    try {
      const res = await submitPaymentEvidence(activeClaim.id, {
        transferReference: wireReference.trim(),
        senderName: wireSenderName.trim(),
        bankName: wireBankName.trim(),
        receiptUrl: wireReceiptUrl,
        notes: wireNotes.trim() || null
      });

      if (res.success) {
        setShowWireModal(false);
        setWireReference('');
        setWireBankName('');
        setWireNotes('');
        setWireReceiptUrl(null);
      }
    } finally {
      setIsSubmittingWire(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      {/* Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-3 sm:gap-3.5">
                <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                  RECIPIENT ALLOCATION TRACKING
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
                My Vehicle Claims
              </h1>
              <p className="text-sm text-zinc-400">
                Authoritative recipient records for {currentUser?.fullName || 'Authenticated User'}.
                All claim and logistics statuses are strictly maintained by authorized Tesla Operations personnel.
              </p>
            </div>

            {isAdmin && (
              <div className="p-4 bg-zinc-950 border border-[#E82127]/50 rounded-xl space-y-2 max-w-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                  <Shield className="w-4 h-4 text-[#E82127]" />
                  <span>Authorized Administrator</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  You hold verified administrative privileges to review all applicant claims and confirm payments.
                </p>
                <button
                  onClick={() => navigateTo('admin-dashboard' as any)}
                  className="w-full py-2 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open Admin Operations Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {userClaims.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-black border border-zinc-800 flex items-center justify-center mx-auto p-3 shadow-lg shadow-red-950/20">
              <TeslaEmblem className="w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">No Claims Recorded</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You haven't submitted any vehicle allocation requests yet. Browse the inventory to
              claim a vehicle.
            </p>
            <button
              onClick={() => navigateTo('explore')}
              className="px-6 py-2.5 bg-[#E82127] text-white text-xs font-bold uppercase tracking-wider rounded"
            >
              Explore Vehicles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Claims List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  My Active Allocations ({userClaims.length})
                </span>
              </div>

              <div className="space-y-3">
                {userClaims.map(claim => {
                  const isSelected = activeClaim?.id === claim.id;
                  return (
                    <button
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-zinc-900 border-[#E82127]'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[150px]">
                          {claim.trackingNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusColor(
                            claim.status
                          )}`}
                        >
                          {claim.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white font-display">
                        {claim.vehicleSnapshot.year} {claim.vehicleSnapshot.model}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {claim.vehicleSnapshot.trim}
                      </p>
                      <div className="pt-2 mt-2 border-t border-zinc-900 flex justify-between text-[11px] text-zinc-500">
                        <span>Submitted {new Date(claim.submissionDate).toLocaleDateString()}</span>
                        <span className="text-zinc-300 font-semibold tabular-nums">
                          ${claim.feeBreakdown.totalUSD} USD
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Claim Details, Authoritative Status & Payment Tracking */}
            {activeClaim && (
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-4 sm:p-6 lg:p-8 space-y-6">
                  {/* Top Bar of Active Claim */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-zinc-400 mb-1">
                        <span>Tracking Number:</span>
                        <span className="font-mono text-white font-bold break-all">{activeClaim.trackingNumber}</span>
                      </div>
                      <h2 className="text-2xl font-black text-white font-display">
                        {activeClaim.vehicleSnapshot.year} {activeClaim.vehicleSnapshot.model}{' '}
                        <span className="text-zinc-400 font-normal text-lg">
                          {activeClaim.vehicleSnapshot.trim}
                        </span>
                      </h2>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded border ${getStatusColor(
                          activeClaim.status
                        )}`}
                      >
                        Claim Status: {activeClaim.status}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Last Updated: {new Date(activeClaim.lastUpdatedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* AUTHORITATIVE CLAIM & DELIVERY STATUS DISPLAY (NO CLIENT SWITCHING) */}
                  <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#E82127]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          Official Allocation Lifecycle Tracking
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        Read-Only Recipient View
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 block">Claim Status</span>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-white text-sm">{activeClaim.status}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {activeClaim.status === 'Approved'
                            ? 'Approved by operations.'
                            : activeClaim.status === 'Under Review'
                            ? 'Under active evaluation.'
                            : 'Submitted to intake queue.'}
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 block">Delivery Logistics</span>
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-400" />
                          <span className="font-bold text-white text-sm">
                            {activeClaim.deliveryStatus || 'Processing'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Enclosed carrier ground transport.
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 block">Fee Settlement</span>
                        <div className="flex items-center gap-1.5">
                          {activeClaim.payment?.status === 'Verified' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-bold text-emerald-400 text-sm">Verified</span>
                            </>
                          ) : activeClaim.payment?.status === 'Pending Manual Verification' ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span className="font-bold text-amber-400 text-sm">Manual Verification Pending</span>
                            </>
                          ) : activeClaim.payment?.status === 'Evidence Submitted' ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span className="font-bold text-amber-400 text-sm">Review Pending</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="font-bold text-zinc-300 text-sm">Pending ($1,390)</span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Freight & documentation fee.
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-500 bg-zinc-950/60 p-2.5 rounded border border-zinc-800/60 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>
                        Status updates are performed exclusively by authorized Tesla Operations administrators. Recipient modifications are disabled.
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Preview Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-zinc-900/40 p-4 rounded-lg border border-zinc-900">
                    <div className="aspect-[16/9] rounded overflow-hidden bg-zinc-950">
                      <img
                        src={activeClaim.vehicleSnapshot.images.primary}
                        alt={activeClaim.vehicleSnapshot.model}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1 text-xs">
                      <p className="text-zinc-400">
                        <strong className="text-white">Color:</strong>{' '}
                        {activeClaim.vehicleSnapshot.colorName}
                      </p>
                      <p className="text-zinc-400">
                        <strong className="text-white">Drivetrain:</strong>{' '}
                        {activeClaim.vehicleSnapshot.specs.drivetrain}
                      </p>
                      <p className="text-zinc-400">
                        <strong className="text-white">Range:</strong>{' '}
                        {activeClaim.vehicleSnapshot.specs.range}
                      </p>
                      <p className="text-zinc-400">
                        <strong className="text-white">Allocation Code:</strong>{' '}
                        {activeClaim.vehicleSnapshot.allocationCode}
                      </p>
                    </div>
                  </div>

                  {/* PAYMENT & WIRE TRANSFER EVIDENCE SECTION */}
                  <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#E82127]" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                          Mandatory Logistics & Documentation Fee Settlement
                        </h3>
                      </div>

                      {activeClaim.payment?.status === 'Verified' ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded border border-emerald-600 bg-emerald-950/80 text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Payment Verified & Confirmed</span>
                        </span>
                      ) : activeClaim.payment?.status === 'Pending Manual Verification' ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded border border-amber-600 bg-amber-950/80 text-amber-300 flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Manual Verification</span>
                        </span>
                      ) : activeClaim.payment?.status === 'Evidence Submitted' ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded border border-amber-600 bg-amber-950/80 text-amber-300 flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Receipt Under Review (Pending Treasury Confirmation)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
                          Payment Pending ($1,390 USD)
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400 space-y-2">
                      <div className="divide-y divide-zinc-800">
                        <div className="py-2 flex justify-between">
                          <span>Allocated Vehicle Price:</span>
                          <span className="text-emerald-400 font-bold">$0.00 (Promotion)</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span>Enclosed Carrier Freight:</span>
                          <span className="text-white font-medium">${activeClaim.feeBreakdown.deliveryFeeUSD}.00 USD</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span>Title Documentation Filing:</span>
                          <span className="text-white font-medium">${activeClaim.feeBreakdown.documentationFeeUSD}.00 USD</span>
                        </div>
                        <div className="py-2 flex justify-between text-sm font-bold text-white">
                          <span>Total Disclosed Amount:</span>
                          <span>${activeClaim.feeBreakdown.totalUSD}.00 USD</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic state of payment/wire proof */}
                    {activeClaim.payment?.status === 'Verified' ? (
                      <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs space-y-1">
                        <p className="text-emerald-300 font-bold">
                          ✓ Payment verified by authorized Tesla administrator
                        </p>
                        <p className="text-zinc-400">
                          Funds have been confirmed in the operations treasury. Your allocation is cleared for dispatch.
                        </p>
                      </div>
                    ) : activeClaim.payment?.status === 'Pending Manual Verification' ? (
                      <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-lg text-xs space-y-3">
                        <div className="space-y-1">
                          <p className="text-amber-300 font-bold">
                            Cryptocurrency payment recorded — Pending manual verification
                          </p>
                          <p className="text-zinc-400 leading-relaxed">
                            Your cryptocurrency payment has been recorded and is pending manual verification by Tesla Operations. A crypto payment is never automatically marked as verified or completed until verified on-chain by authorized operations administrators.
                          </p>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded border border-amber-900/50 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {activeClaim.payment.cryptoAsset && (
                            <div>
                              <span className="text-zinc-500">Asset:</span>{' '}
                              <span className="text-zinc-200 font-medium">{activeClaim.payment.cryptoAsset}</span>
                            </div>
                          )}
                          {activeClaim.payment.cryptoNetwork && (
                            <div>
                              <span className="text-zinc-500">Network:</span>{' '}
                              <span className="text-zinc-200 font-medium">{activeClaim.payment.cryptoNetwork}</span>
                            </div>
                          )}
                          {activeClaim.payment.cryptoAddress && (
                            <div className="sm:col-span-2">
                              <span className="text-zinc-500">Receiving Address:</span>{' '}
                              <span className="font-mono text-zinc-300 break-all select-all">{activeClaim.payment.cryptoAddress}</span>
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <span className="text-zinc-500">Transaction Reference / TXID:</span>{' '}
                            <span className="font-mono text-amber-300 font-bold break-all">{activeClaim.payment.transferReference}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Submitted:</span>{' '}
                            <span className="text-zinc-200">
                              {new Date(activeClaim.payment.submittedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : activeClaim.payment?.status === 'Evidence Submitted' ? (
                      <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-lg text-xs space-y-3">
                        <div className="space-y-1">
                          <p className="text-amber-300 font-bold">
                            Wire transfer receipt submitted for administrator review
                          </p>
                          <p className="text-zinc-400 leading-relaxed">
                            Uploading a payment receipt does not automatically mark payment as verified. An authorized
                            administrator is reviewing your submitted remittance proof and confirming receipt of funds
                            with the bank.
                          </p>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded border border-amber-900/50 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-zinc-500">Bank:</span>{' '}
                            <span className="text-zinc-200 font-medium">{activeClaim.payment.bankName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Sender:</span>{' '}
                            <span className="text-zinc-200 font-medium">{activeClaim.payment.senderName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Reference:</span>{' '}
                            <span className="font-mono text-amber-300 font-bold">{activeClaim.payment.transferReference}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">Submitted:</span>{' '}
                            <span className="text-zinc-200">
                              {new Date(activeClaim.payment.submittedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowWireModal(true)}
                          className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Update or re-submit wire proof</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3">
                        <p className="text-xs text-zinc-300">
                          To finalize your allocation for enclosed carrier dispatch, please submit your bank transfer remittance details or receipt slip for administrative verification.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowWireModal(true)}
                          className="px-5 py-2.5 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Bank Transfer Receipt / Wire Proof</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Authorized Next Steps */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                      Authorized Next Steps
                    </h3>
                    <div className="space-y-2">
                      {activeClaim.authorizedNextSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-zinc-900/30 border border-zinc-900 rounded text-xs text-zinc-300"
                        >
                          <Clock className="w-4 h-4 text-[#E82127] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address Snapshot */}
                  <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-300 uppercase tracking-wider">
                        Registered Dispatch Destination
                      </span>
                      <button
                        onClick={() => navigateTo('delivery-address')}
                        className="text-[#E82127] hover:underline"
                      >
                        Edit in Profile
                      </button>
                    </div>
                    <div className="text-zinc-400 leading-relaxed">
                      <p className="text-white font-medium">{activeClaim.deliveryAddress.fullName}</p>
                      <p>{activeClaim.deliveryAddress.streetAddress}</p>
                      <p>
                        {activeClaim.deliveryAddress.city}, {activeClaim.deliveryAddress.stateOrRegion}{' '}
                        {activeClaim.deliveryAddress.postalCode}
                      </p>
                      <p>{activeClaim.deliveryAddress.country} · {activeClaim.deliveryAddress.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wire Evidence Submission Modal */}
      {showWireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#E82127]/10 border border-[#E82127]/40 flex items-center justify-center text-[#E82127]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">
                    Submit Bank Wire Transfer Proof
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Mandatory Transport Fee: $1,390.00 USD
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWireModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Wire Instructions Box */}
            <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 block">
                Official Treasury Settlement Instructions
              </span>
              <div className="grid grid-cols-2 gap-2 text-zinc-400">
                <div>
                  <span className="text-zinc-500 block text-[10px]">Beneficiary Name:</span>
                  <span className="text-white font-medium">Tesla Allocation Operations</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Financial Institution:</span>
                  <span className="text-white font-medium">JPMorgan Chase Bank, N.A.</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Routing / ABA:</span>
                  <span className="font-mono text-zinc-200">111000614</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Wire Memo / Ref:</span>
                  <span className="font-mono text-white font-bold">{activeClaim?.trackingNumber}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleWireEvidenceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                  Originating Bank Name <span className="text-[#E82127]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={wireBankName}
                  onChange={e => setWireBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase, Bank of America, Wells Fargo"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                    Sender Account Name <span className="text-[#E82127]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wireSenderName}
                    onChange={e => setWireSenderName(e.target.value)}
                    placeholder="Full name on sender account"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                    Wire / Transfer Reference Number <span className="text-[#E82127]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={wireReference}
                    onChange={e => setWireReference(e.target.value)}
                    placeholder="e.g. WT-992014-TX"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#E82127]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                  Attach Remittance Slip or Wire Receipt (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptFileUpload}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
                {wireReceiptUrl && (
                  <div className="mt-2 flex items-center gap-2 text-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt image successfully attached.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1 uppercase tracking-wider">
                  Notes for Treasury Operations (Optional)
                </label>
                <input
                  type="text"
                  value={wireNotes}
                  onChange={e => setWireNotes(e.target.value)}
                  placeholder="Additional transfer notes or date details..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#E82127]"
                />
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <span className="font-semibold text-white block">Important Verification Disclosure:</span>
                <p>
                  Uploading this receipt registers your payment evidence with the administrative verification queue.
                  Payment is NOT automatically marked verified until an authorized administrator verifies receipt of funds in the bank.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWireModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWire}
                  className="px-6 py-2.5 bg-[#E82127] hover:bg-[#b91318] text-white font-bold rounded text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSubmittingWire ? 'Submitting...' : 'Submit Evidence for Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
