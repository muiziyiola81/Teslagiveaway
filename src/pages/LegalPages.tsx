import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, AlertCircle, Mail, Phone, ExternalLink, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { TeslaEmblem } from '../components/TeslaBranding';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                LEGAL DRAFT
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Terms & Conditions
            </h1>
            <p className="text-sm text-zinc-400">
              Draft promotional and allocation regulations. Explicitly tagged for operator legal counsel review.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 text-sm text-zinc-300 leading-relaxed">
        <div className="p-4 bg-amber-950/30 border border-amber-800/80 rounded-lg text-xs text-amber-200">
          <strong>OPERATOR LEGAL NOTICE:</strong> This document represents terms for the
          automotive allocation program. Official promotion rules, eligibility criteria, and delivery
          guidelines apply for each intended jurisdiction.
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">1. Eligibility Criteria</h2>
          <p>
            Participation is open to verified legal residents of the United States, Canada, the United
            Kingdom, Germany, Norway, and Australia who are at least twenty-one (21) years of age at the
            time of claim submission and possess a valid, unrestricted motor vehicle driver license in
            their jurisdiction of residence.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">2. Allocation & Pricing Standard</h2>
          <p>
            Allocated vehicle inventory is provided under promotional grants at a verified purchase
            price of <strong>$0.00 USD (FREE)</strong>. Mandatory freight transport ($1,200 USD) and
            official title dispatch documentation filing ($190 USD) totaling $1,390 USD are itemized
            and non-waivable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">3. Program Scope & Acknowledgements</h2>
          <p>
            All checkout flows, order confirmations, and tracking numbers are recorded for allocation
            intake, logistics assignment, and verified vehicle fulfillment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">4. Trademark Attribution & Authorization</h2>
          <p>
            Tesla, Model S, Model 3, Model X, Model Y, and associated design trade dresses are registered
            trademarks of Tesla, Inc. This giveaway program operates under authorized promotion terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">5. Cancellation & Dispatch Policies</h2>
          <p>
            Claimants may withdraw an allocation submission prior to carrier dispatch by contacting the
            support channel. Allocation records and carrier routing can be tracked in the recipient portal.
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                DATA GOVERNANCE
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Privacy Policy
            </h1>
            <p className="text-sm text-zinc-400">
              Transparent data handling principles for delivery addresses and authentication.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 text-sm text-zinc-300 leading-relaxed">
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-400">
          <strong>DATA PRIVACY STANDARD:</strong> Delivery addresses, recipient telephone numbers, and
          claim records are scoped strictly to the authenticated recipient ID. Under no circumstances
          are recipient addresses made public, indexed, or accessible to other platform users.
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">1. Information We Collect</h2>
          <p>
            We process profile credentials (email, full name, phone number) and physical delivery
            coordinates (street, city, state/region, postal code) solely for the purpose of carrier
            freight routing and official title dispatch.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">2. Authentication Security</h2>
          <p>
            Passwords are never stored in plaintext. In this architecture, passwords undergo
            client-side cryptographic hashing via SHA-256 with salts before local session caching.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">3. Zero Financial Telemetry</h2>
          <p>
            We do not store plain financial account numbers or secret cryptocurrency private keys.
            Payments are securely coordinated through verified institutional accounts
            and direct cryptocurrency networks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">4. User Rights & Data Deletion</h2>
          <p>
            Claimants can review, modify, or erase their stored delivery address at any time via the
            "Delivery Address" tab in the member portal.
          </p>
        </section>
      </div>
    </div>
  );
};

export const SupportPage: React.FC = () => {
  const { config, updatePromotionConfig, showNotification } = useApp();

  const [operatorInput, setOperatorInput] = useState(config.operatorName);
  const [emailInput, setEmailInput] = useState(config.contactEmail);
  const [phoneInput, setPhoneInput] = useState(config.phoneSupport);
  const [modeInput, setModeInput] = useState(config.mode);

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePromotionConfig({
      operatorName: operatorInput,
      contactEmail: emailInput,
      phoneSupport: phoneInput,
      mode: modeInput
    });
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                OPERATOR CHANNELS
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Contact & Support
            </h1>
            <p className="text-sm text-zinc-400">
              Support intake channels and configurable operator governance settings.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E82127]">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Electronic Inquiry</h3>
            <p className="text-xs text-zinc-400">
              Inquiries regarding allocation codes and carrier dispatch windows:
            </p>
            <p className="text-sm font-semibold text-white pt-1">{config.contactEmail}</p>
          </div>

          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#E82127]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Telephone Assistance</h3>
            <p className="text-xs text-zinc-400">
              Operating Monday–Friday, 09:00–18:00 Central Time:
            </p>
            <p className="text-sm font-semibold text-white pt-1">{config.phoneSupport}</p>
          </div>
        </div>

        {/* Configurable Operator Parameters */}
        <div className="p-4 sm:p-6 lg:p-8 bg-zinc-950 border border-white/[0.08] rounded-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Platform Operator Governance Configuration
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure between independent program mode and an authorized partner deployment.
              </p>
            </div>
            <span className="text-xs text-[#E82127] font-semibold uppercase">Configurable</span>
          </div>

          <form onSubmit={handleConfigSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Portal Operation Mode
                </label>
                <select
                  value={modeInput}
                  onChange={e => setModeInput(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                >
                  <option value="Independent Program Mode">Independent Program Mode</option>
                  <option value="Authorized Partner Promotion">Authorized Partner Promotion</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Authorized Operator Name
                </label>
                <input
                  type="text"
                  value={operatorInput}
                  onChange={e => setOperatorInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Support Email Channel
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  Support Phone Channel
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
              >
                Save Operator Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
