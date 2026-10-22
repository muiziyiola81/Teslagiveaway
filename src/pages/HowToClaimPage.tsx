import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Truck,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { ClaimStatus } from '../types';
import { TeslaEmblem } from '../components/TeslaBranding';

export const HowToClaimPage: React.FC = () => {
  const { navigateTo } = useApp();

  const statusDefinitions: Array<{
    status: ClaimStatus;
    color: string;
    description: string;
    criteria: string;
  }> = [
    {
      status: 'Draft',
      color: 'text-zinc-400 border-zinc-700 bg-zinc-900',
      description: 'The claim request is initiated and saved to the recipient profile but has not yet been submitted to the operator intake system.',
      criteria: 'User has selected a vehicle and entered or started entering delivery coordinates.'
    },
    {
      status: 'Submitted',
      color: 'text-sky-400 border-sky-800 bg-sky-950/40',
      description: 'The claim reservation has been recorded in the allocation database and assigned an authentic tracking code.',
      criteria: 'All required delivery address fields, telephone contacts, and acknowledgement of itemized fees have been provided.'
    },
    {
      status: 'Under Review',
      color: 'text-amber-400 border-amber-800 bg-amber-950/40',
      description: 'The operator or authorized logistics agent is verifying territorial residency, driver licensing age (21+), and freight carrier accessibility.',
      criteria: 'Compliance check underway with regional automotive transport partners.'
    },
    {
      status: 'Approved',
      color: 'text-white border-zinc-700 bg-zinc-900',
      description: 'Documentation and eligibility verified. Allocation is finalized and queued for transport dispatch.',
      criteria: 'Carrier bill of lading drafted, vehicle VIN matched, and title transfer documentation authorized.'
    },
    {
      status: 'Rejected',
      color: 'text-red-400 border-red-800 bg-red-950/40',
      description: 'The allocation request could not be fulfilled due to ineligible territorial jurisdiction, unmet licensing age, or carrier delivery constraints.',
      criteria: 'Disqualification notice and explanation logged in the recipient portal.'
    },
    {
      status: 'Completed',
      color: 'text-purple-400 border-purple-800 bg-purple-950/40',
      description: 'Vehicle carrier transport completed and handover signed at the recipient driveway.',
      criteria: 'Bill of lading signed, keys and mobile app access handed over, and permanent title transferred.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      {/* Editorial Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                PROGRAM PROCEDURES
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              How to Claim Your Vehicle
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              A comprehensive guide to vehicle eligibility, selection, itemized transport fee
              disclosures, claim submission, and official lifecycle tracking.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* Step-by-Step Sequence */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-white font-display">
            The 6-Step Allocation Workflow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <span className="text-xs font-bold text-[#E82127] font-display">STEP 01</span>
              <h3 className="text-lg font-bold text-white">Verify Jurisdiction Eligibility</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Confirm your residence is in one of the currently eligible territories (US, Canada, UK,
                Germany, Norway, Australia) and that you are at least 21 years of age with a valid
                driver license.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <span className="text-xs font-bold text-[#E82127] font-display">STEP 02</span>
              <h3 className="text-lg font-bold text-white">Select an Available Model</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Browse our real-time inventory listings. Filter by model series (Model S, 3, Y, or X),
                battery range, and exterior color to choose your desired configuration.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <span className="text-xs font-bold text-[#E82127] font-display">STEP 03</span>
              <h3 className="text-lg font-bold text-white">Review Detailed Specifications</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Inspect verified acceleration times, EPA estimated ranges, charging rates, and
                standard interior technology on the vehicle detail sheet before proceeding.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <span className="text-xs font-bold text-[#E82127] font-display">STEP 04</span>
              <h3 className="text-lg font-bold text-white">Review Disclosed Mandatory Fees</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                While the base vehicle price is $0.00 (Free), mandatory carrier freight ($1,200) and title
                documentation ($190) totaling $1,390 USD are itemized transparently with zero hidden markups.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <span className="text-xs font-bold text-[#E82127] font-display">STEP 05</span>
              <h3 className="text-lg font-bold text-white">Submit Authenticated Claim</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Complete checkout. Confirm your verified private delivery address and submit logistics fee settlement via direct Cryptocurrency.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <span className="text-xs font-bold text-[#E82127] font-display">STEP 06</span>
              <h3 className="text-lg font-bold text-white">Track Live Real-Time Milestones</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Use your private tracking number to follow intake validation, carrier dispatch booking,
                and scheduled driveway handover in the "My Claims" dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Claim Status Lifecycle & Distinction */}
        <section className="space-y-6 pt-6 border-t border-zinc-900">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E82127]">
              LIFECYCLE TAXONOMY
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">
              Understanding Claim Status States
            </h2>
            <p className="text-xs text-zinc-400 mt-2">
              Status designations reflect verified database records and carrier schedules. Here is the
              exact operational criteria for each state:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statusDefinitions.map(def => (
              <div
                key={def.status}
                className="p-6 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded border ${def.color}`}>
                    {def.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase">Verified State</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {def.description}
                </p>
                <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-500">
                  <strong className="text-zinc-400">Trigger:</strong> {def.criteria}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA to Explore */}
        <div className="p-8 sm:p-12 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              Ready to explore currently available vehicles?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Browse the catalog with active filters and start your allocation claim.
            </p>
          </div>
          <button
            onClick={() => navigateTo('explore')}
            className="px-6 py-3.5 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 shrink-0"
          >
            <span>Explore Vehicles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
