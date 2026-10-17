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
  ChevronDown,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

import { ClaimStatus } from '../types';
import { TeslaEmblem } from '../components/TeslaBranding';

export const MyClaimsPage: React.FC = () => {
  const { userClaims, currentUser, updateClaimStatus, navigateTo } = useApp();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(
    userClaims.length > 0 ? userClaims[0].id : null
  );

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case 'Draft':
        return 'text-zinc-400 border-zinc-700 bg-zinc-900';
      case 'Submitted':
        return 'text-sky-400 border-sky-800 bg-sky-950/40';
      case 'Under Review':
        return 'text-amber-400 border-amber-800 bg-amber-950/40';
      case 'Approved':
        return 'text-white border-zinc-700 bg-zinc-900';
      case 'Rejected':
        return 'text-red-400 border-red-800 bg-red-950/40';
      case 'Completed':
        return 'text-purple-400 border-purple-800 bg-purple-950/40';
      default:
        return 'text-zinc-400 border-zinc-700 bg-zinc-900';
    }
  };

  const activeClaim = userClaims.find(c => c.id === selectedClaimId) || userClaims[0];

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      {/* Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                SECURE RECIPIENT DASHBOARD
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              My Vehicle Claims
            </h1>
            <p className="text-sm text-zinc-400">
              Private records for {currentUser?.fullName || 'Authenticated Prototype User'}. Protected
              by least-privilege recipient scoping.
            </p>
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
                  Active Claims ({userClaims.length})
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

            {/* Right Column: Claim Details, Timeline & Status Actions */}
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
                        Status: {activeClaim.status}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Last Updated: {new Date(activeClaim.lastUpdatedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Status Switcher (For Evaluation & Demo Testing) */}
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                        Prototype Evaluation Control: Test Lifecycle Status
                      </span>
                      <span className="text-[10px] text-[#E82127]">Demo Switcher</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(
                        ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed'] as ClaimStatus[]
                      ).map(st => (
                        <button
                          key={st}
                          onClick={() => updateClaimStatus(activeClaim.id, st)}
                          className={`px-2.5 py-1 text-xs rounded transition-colors ${
                            activeClaim.status === st
                              ? 'bg-[#E82127] text-white font-bold'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
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

                  {/* Disclosed Itemized Fees */}
                  <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg space-y-2 text-xs">
                    <span className="font-semibold text-zinc-300 uppercase tracking-wider block">
                      Itemized Fee Breakdown
                    </span>
                    <div className="divide-y divide-zinc-800/80">
                      <div className="py-2 flex justify-between">
                        <span className="text-zinc-400">Allocated Vehicle Price</span>
                        <span className="text-white font-bold">$0.00 (Promotion)</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-zinc-400">Carrier Freight Transport</span>
                        <span className="text-zinc-200 tabular-nums">
                          ${activeClaim.feeBreakdown.deliveryFeeUSD}.00 USD
                        </span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <span className="text-zinc-400">Title Documentation</span>
                        <span className="text-zinc-200 tabular-nums">
                          ${activeClaim.feeBreakdown.documentationFeeUSD}.00 USD
                        </span>
                      </div>
                      <div className="py-2 flex justify-between font-bold text-white text-sm">
                        <span>Total Due at Dispatch</span>
                        <span className="tabular-nums">${activeClaim.feeBreakdown.totalUSD}.00 USD</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 pt-1">
                      Status: Simulation Confirmed ($0.00 charged in prototype mode)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
