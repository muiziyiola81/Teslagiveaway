import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  FileText,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Lock,
  Building2,
  Calendar,
  X,
  Eye,
  Check,
  AlertTriangle,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Claim, ClaimStatus, DeliveryStatus, PaymentStatus } from '../types';
import { TeslaEmblem, TeslaLogo } from '../components/TeslaBranding';
import { apiClient } from '../services/apiClient';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    adminClaims,
    loadAdminClaims,
    adminUpdateClaimStatus,
    adminVerifyPayment,
    adminRejectPayment,
    navigateTo,
    showNotification
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status modification form state
  const [targetClaimStatus, setTargetClaimStatus] = useState<ClaimStatus>('Submitted');
  const [targetDeliveryStatus, setTargetDeliveryStatus] = useState<DeliveryStatus>('Processing');
  const [statusReason, setStatusReason] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Payment verification modal state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectingPayment, setIsRejectingPayment] = useState(false);
  const [showReceiptZoom, setShowReceiptZoom] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  useEffect(() => {
    if (isAdmin) {
      loadAdminClaims();
      fetchAuditLogs();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedClaim) {
      setTargetClaimStatus(selectedClaim.status);
      setTargetDeliveryStatus(selectedClaim.deliveryStatus || 'Processing');
      setStatusReason('');
      setVerificationNotes('');
      setRejectionReason('');
    }
  }, [selectedClaim]);

  const fetchAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await apiClient.adminGetAuditLogs(20);
      if (res.success && res.data) {
        setAuditLogs(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAdminClaims();
      await fetchAuditLogs();
      showNotification('Administrative data refreshed from server.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#060607] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-950 border border-red-500/30 rounded-xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center mx-auto text-red-500">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-white">Access Denied</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Administrative credentials required. This console is restricted to authorized Tesla
              Allocation Operations administrators. Client-side role spoofing is strictly prohibited and
              rejected by server Row Level Security.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => navigateTo('auth-signin')}
              className="w-full py-3 bg-[#E82127] text-white font-bold text-xs uppercase tracking-wider rounded"
            >
              Sign In With Authorized Account
            </button>
            <button
              onClick={() => navigateTo('landing')}
              className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded"
            >
              Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter claims
  const filteredClaims = adminClaims.filter(claim => {
    // Search query matching tracking number, applicant name, email, vin, or model
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTracking = claim.trackingNumber.toLowerCase().includes(q);
      const matchApplicant = claim.applicant?.fullName.toLowerCase().includes(q) ||
        claim.deliveryAddress.fullName.toLowerCase().includes(q);
      const matchEmail = claim.applicant?.email.toLowerCase().includes(q) ||
        claim.deliveryAddress.email.toLowerCase().includes(q);
      const matchModel = claim.vehicleSnapshot.model.toLowerCase().includes(q);
      const matchVin = (claim.vehicleSnapshot as any).vin?.toLowerCase().includes(q);
      if (!matchTracking && !matchApplicant && !matchEmail && !matchModel && !matchVin) {
        return false;
      }
    }

    // Claim Status filter
    if (claimStatusFilter !== 'all') {
      if (claim.status.toLowerCase() !== claimStatusFilter.toLowerCase()) {
        return false;
      }
    }

    // Payment Status filter
    if (paymentStatusFilter !== 'all') {
      const pStatus = claim.payment?.status || 'Pending';
      if (paymentStatusFilter === 'pending_manual_verification') {
        if (pStatus !== 'Pending Manual Verification') return false;
      } else if (paymentStatusFilter === 'evidence_submitted') {
        if (pStatus !== 'Evidence Submitted') return false;
      } else if (paymentStatusFilter === 'verified') {
        if (pStatus !== 'Verified') return false;
      } else if (paymentStatusFilter === 'pending') {
        if (pStatus !== 'Pending') return false;
      }
    }

    // Delivery Status filter
    if (deliveryStatusFilter !== 'all') {
      const dStatus = (claim.deliveryStatus || 'Not Scheduled').toLowerCase();
      if (dStatus !== deliveryStatusFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Calculate statistics
  const totalClaimsCount = adminClaims.length;
  const pendingReviewCount = adminClaims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const pendingPaymentsCount = adminClaims.filter(c => c.payment?.status === 'Evidence Submitted').length;
  const approvedClaimsCount = adminClaims.filter(c => c.status === 'Approved').length;
  const readyForDeliveryCount = adminClaims.filter(
    c => c.deliveryStatus === 'Ready for Delivery' || c.status === 'Ready for Delivery'
  ).length;

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    if (!statusReason.trim() || statusReason.trim().length < 3) {
      showNotification('Please enter a mandatory administrative reason for this status modification (minimum 3 characters).', 'error');
      return;
    }

    setIsSavingStatus(true);
    try {
      const derivedDeliveryStatus: DeliveryStatus =
        targetClaimStatus === 'Approved'
          ? 'Ready for Delivery'
          : targetClaimStatus === 'Processing'
          ? 'Processing'
          : targetClaimStatus === 'Ready for Delivery'
          ? 'Ready for Delivery'
          : 'Processing';

      const res = await adminUpdateClaimStatus(selectedClaim.id, {
        status: targetClaimStatus,
        deliveryStatus: derivedDeliveryStatus,
        reason: statusReason.trim()
      });

      if (res.success) {
        // Update currently selected claim snapshot
        setSelectedClaim(prev => prev ? {
          ...prev,
          status: targetClaimStatus,
          deliveryStatus: derivedDeliveryStatus,
          lastUpdatedDate: new Date().toISOString()
        } : null);
        setStatusReason('');
        fetchAuditLogs();
      }
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedClaim) return;
    const paymentId = selectedClaim.payment?.id || selectedClaim.id;

    setIsVerifyingPayment(true);
    try {
      const res = await adminVerifyPayment(
        paymentId,
        verificationNotes.trim() || 'Settlement confirmed by authorized administrator.',
        true
      );

      if (res.success) {
        setSelectedClaim(prev => prev ? {
          ...prev,
          status: 'Approved',
          deliveryStatus: 'Processing',
          payment: {
            ...prev.payment,
            status: 'Verified',
            verifiedAt: new Date().toISOString(),
            verifiedBy: currentUser.id,
            verifiedByEmail: currentUser.email,
            verificationNotes: verificationNotes.trim() || 'Settlement confirmed by authorized administrator.'
          }
        } : null);
        setVerificationNotes('');
        fetchAuditLogs();
      }
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedClaim) return;
    if (!rejectionReason.trim()) {
      showNotification('Please provide a reason for rejecting the payment evidence.', 'error');
      return;
    }

    const paymentId = selectedClaim.payment?.id || selectedClaim.id;
    setIsRejectingPayment(true);
    try {
      const res = await adminRejectPayment(paymentId, rejectionReason.trim());
      if (res.success) {
        setSelectedClaim(prev => prev ? {
          ...prev,
          payment: {
            ...prev.payment,
            status: 'Failed',
            rejectionReason: rejectionReason.trim()
          }
        } : null);
        setRejectionReason('');
        fetchAuditLogs();
      }
    } finally {
      setIsRejectingPayment(false);
    }
  };

  const getClaimStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-sky-800 bg-sky-950/60 text-sky-300">Submitted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-amber-800 bg-amber-950/60 text-amber-300">Under Review</span>;
      case 'Approved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-emerald-800 bg-emerald-950/60 text-emerald-300">Approved</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-red-800 bg-red-950/60 text-red-300">Rejected</span>;
      case 'Processing':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-blue-800 bg-blue-950/60 text-blue-300">Processing</span>;
      case 'Ready for Delivery':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-cyan-800 bg-cyan-950/60 text-cyan-300">Ready for Delivery</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-purple-800 bg-purple-950/60 text-purple-300">Delivered</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded border border-zinc-800 bg-zinc-900 text-zinc-300">{status}</span>;
    }
  };

  const getDeliveryStatusBadge = (status?: DeliveryStatus) => {
    const s = status || 'Not Scheduled';
    switch (s) {
      case 'Processing':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-blue-800/80 bg-blue-950/40 text-blue-300 flex items-center gap-1 w-fit"><Truck className="w-3 h-3" /> Processing Logistics</span>;
      case 'Ready for Delivery':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-cyan-800/80 bg-cyan-950/40 text-cyan-300 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Ready for Delivery</span>;
      case 'In Transit':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-indigo-800/80 bg-indigo-950/40 text-indigo-300 flex items-center gap-1 w-fit"><Truck className="w-3 h-3" /> Carrier In Transit</span>;
      case 'Delivered':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-purple-800/80 bg-purple-950/40 text-purple-300 flex items-center gap-1 w-fit"><Check className="w-3 h-3" /> Handover Complete</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 w-fit">Not Scheduled</span>;
    }
  };

  const getPaymentStatusBadge = (claim: Claim) => {
    const p = claim.payment;
    const status = p?.status || 'Pending';

    if (status === 'Verified') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded border border-emerald-600/60 bg-emerald-950/70 text-emerald-300 flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Payment Verified</span>
        </span>
      );
    }

    if (status === 'Pending Manual Verification') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded border border-amber-600/70 bg-amber-950/80 text-amber-300 flex items-center gap-1.5 animate-pulse w-fit">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Pending Manual Verification</span>
        </span>
      );
    }

    if (status === 'Evidence Submitted') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded border border-amber-600/70 bg-amber-950/80 text-amber-300 flex items-center gap-1.5 animate-pulse w-fit">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Wire Receipt Awaiting Verification</span>
        </span>
      );
    }

    if (status === 'Failed') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded border border-red-800 bg-red-950/60 text-red-300 flex items-center gap-1.5 w-fit">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>Payment Failed / Rejected</span>
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 flex items-center gap-1.5 w-fit">
        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span>Pending Payment ($1,390)</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white pb-24">
      {/* Top Banner & Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#E82127]/10 border border-[#E82127]/30 flex items-center justify-center text-[#E82127]">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#E82127]">
                  TESLA OPERATIONS · TRUSTED ADMINISTRATIVE BACKEND
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
                Allocation Claims & Payment Verification
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Server-enforced role authorization. Inspect applicant claims, review bank transfer
                evidence, verify receipt of funds, and manage delivery logistics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="px-3.5 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Admin: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.email})
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-[#E82127] text-white rounded">
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Live</span>
              </button>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-8">
            <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Claims</span>
              <p className="text-2xl sm:text-3xl font-black font-display text-white">{totalClaimsCount}</p>
              <span className="text-[11px] text-zinc-400">Total recorded</span>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-sky-900/40 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Pending Review</span>
              <p className="text-2xl sm:text-3xl font-black font-display text-sky-300">{pendingReviewCount}</p>
              <span className="text-[11px] text-zinc-400">Submitted / Intake</span>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-amber-600/50 rounded-xl space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Payments to Verify</span>
              <p className="text-2xl sm:text-3xl font-black font-display text-amber-300">{pendingPaymentsCount}</p>
              <span className="text-[11px] text-amber-400/80 font-medium">Bank receipts awaiting review</span>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-emerald-900/40 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Approved</span>
              <p className="text-2xl sm:text-3xl font-black font-display text-emerald-300">{approvedClaimsCount}</p>
              <span className="text-[11px] text-zinc-400">Eligibility confirmed</span>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-purple-900/40 rounded-xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Logistics Active</span>
              <p className="text-2xl sm:text-3xl font-black font-display text-purple-300">{readyForDeliveryCount}</p>
              <span className="text-[11px] text-zinc-400">Ready for Carrier Staging</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Filters and Search Bar */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking ID, Recipient Name, Email, VIN, or Vehicle Model..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E82127]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={claimStatusFilter}
                onChange={e => setClaimStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#E82127]"
              >
                <option value="all">All Claim Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#E82127]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending_manual_verification">⏳ Pending Manual Verification (Crypto)</option>
              <option value="evidence_submitted">⚠️ Wire Proof Awaiting Review</option>
              <option value="verified">Verified (Settled)</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={deliveryStatusFilter}
              onChange={e => setDeliveryStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#E82127]"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="processing">Processing</option>
              <option value="ready for delivery">Ready for Delivery</option>
            </select>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E82127]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Allocated Claims Register ({filteredClaims.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-500">
              Authorized Operational View
            </span>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-400">No claims match the selected criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setClaimStatusFilter('all');
                  setPaymentStatusFilter('all');
                  setDeliveryStatusFilter('all');
                }}
                className="text-xs text-[#E82127] hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900/60 border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <th className="py-3 px-4">Tracking Code & Date</th>
                    <th className="py-3 px-4">Applicant Recipient</th>
                    <th className="py-3 px-4">Vehicle Information</th>
                    <th className="py-3 px-4">Claim Status</th>
                    <th className="py-3 px-4">Payment Verification</th>
                    <th className="py-3 px-4">Delivery Logistics</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredClaims.map(claim => {
                    const applicantName = claim.applicant?.fullName || claim.deliveryAddress.fullName;
                    const applicantEmail = claim.applicant?.email || claim.deliveryAddress.email;
                    const applicantPhone = claim.applicant?.phone || claim.deliveryAddress.phone;
                    const isSelected = selectedClaim?.id === claim.id;

                    return (
                      <tr
                        key={claim.id}
                        className={`hover:bg-zinc-900/40 transition-colors ${
                          isSelected ? 'bg-zinc-900/70 border-l-2 border-l-[#E82127]' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-mono">
                          <span className="font-bold text-white block">{claim.trackingNumber}</span>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(claim.submissionDate).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-semibold text-white block">{applicantName}</span>
                          <span className="text-[11px] text-zinc-400 block">{applicantEmail}</span>
                          <span className="text-[10px] text-zinc-500">
                            {claim.deliveryAddress.city}, {claim.deliveryAddress.stateOrRegion} · {applicantPhone}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 rounded bg-zinc-900 overflow-hidden shrink-0">
                              <img
                                src={claim.vehicleSnapshot.images.primary}
                                alt={claim.vehicleSnapshot.model}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-white block">
                                {claim.vehicleSnapshot.year} {claim.vehicleSnapshot.model}
                              </span>
                              <span className="text-[11px] text-zinc-400 block truncate max-w-[140px]">
                                {claim.vehicleSnapshot.trim}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {getClaimStatusBadge(claim.status)}
                        </td>

                        <td className="py-4 px-4">
                          {getPaymentStatusBadge(claim)}
                        </td>

                        <td className="py-4 px-4">
                          {getDeliveryStatusBadge(claim.deliveryStatus)}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedClaim(claim)}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-[#E82127] text-zinc-200 hover:text-white rounded border border-zinc-700 hover:border-[#E82127] transition-all font-semibold text-xs inline-flex items-center gap-1.5"
                          >
                            <span>Inspect & Manage</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Claim Inspection & Management Modal / Drawer */}
        {selectedClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-zinc-900 flex items-center justify-between sticky top-0 bg-zinc-950 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#E82127]/10 border border-[#E82127]/40 flex items-center justify-center text-[#E82127]">
                    <TeslaEmblem className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        {selectedClaim.trackingNumber}
                      </span>
                      {getClaimStatusBadge(selectedClaim.status)}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-display text-white mt-0.5">
                      Administrative Claim Inspection & Controls
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedClaim(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-8 space-y-8">
                {/* 1. Vehicle & Recipient Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Details */}
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block pb-1 border-b border-zinc-800">
                      Vehicle Allocation Specification
                    </span>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-16 rounded overflow-hidden bg-zinc-950 shrink-0">
                        <img
                          src={selectedClaim.vehicleSnapshot.images.primary}
                          alt={selectedClaim.vehicleSnapshot.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <p className="font-bold text-white text-sm">
                          {selectedClaim.vehicleSnapshot.year} {selectedClaim.vehicleSnapshot.model}
                        </p>
                        <p className="text-zinc-300">{selectedClaim.vehicleSnapshot.trim}</p>
                        <p className="text-zinc-500 font-mono text-[11px]">
                          Allocation: {selectedClaim.vehicleSnapshot.allocationCode}
                        </p>
                        <p className="text-zinc-400 text-[11px]">
                          Color: {selectedClaim.vehicleSnapshot.colorName} · {selectedClaim.vehicleSnapshot.specs.drivetrain}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-3 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block pb-1 border-b border-zinc-800">
                      Applicant Recipient & Destination
                    </span>
                    <div className="space-y-1 text-zinc-300">
                      <p className="font-bold text-white text-sm">
                        {selectedClaim.applicant?.fullName || selectedClaim.deliveryAddress.fullName}
                      </p>
                      <p className="text-zinc-400">
                        {selectedClaim.applicant?.email || selectedClaim.deliveryAddress.email} · {selectedClaim.deliveryAddress.phone}
                      </p>
                      <p className="text-zinc-300 pt-1">
                        {selectedClaim.deliveryAddress.streetAddress}
                        {selectedClaim.deliveryAddress.apartmentOrSuite && `, ${selectedClaim.deliveryAddress.apartmentOrSuite}`}
                      </p>
                      <p className="text-zinc-400">
                        {selectedClaim.deliveryAddress.city}, {selectedClaim.deliveryAddress.stateOrRegion} {selectedClaim.deliveryAddress.postalCode}, {selectedClaim.deliveryAddress.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. PAYMENT VERIFICATION & WIRE EVIDENCE SECTION */}
                <div className="p-5 sm:p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#E82127]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Bank Transfer & Payment Verification
                      </h3>
                    </div>
                    {getPaymentStatusBadge(selectedClaim)}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                      <span className="text-zinc-500 block">Purchase Base Price</span>
                      <span className="text-sm font-bold text-emerald-400">$0.00 (Promotional)</span>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                      <span className="text-zinc-500 block">Enclosed Carrier Freight</span>
                      <span className="text-sm font-bold text-white">$1,200.00 USD</span>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded border border-zinc-800">
                      <span className="text-zinc-500 block">Documentation & Filing</span>
                      <span className="text-sm font-bold text-white">$190.00 USD</span>
                    </div>
                  </div>

                  {/* Evidence Display or Verification Action */}
                  {selectedClaim.payment?.status === 'Verified' ? (
                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Payment Verified by Authorized Administrator</span>
                      </div>
                      <p className="text-zinc-300">
                        Incoming wire funds ($1,390.00 USD) were verified and confirmed.
                      </p>
                      {selectedClaim.payment.verificationNotes && (
                        <p className="text-zinc-400 text-[11px] italic">
                          Audit Note: "{selectedClaim.payment.verificationNotes}"
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-500">
                        Verified at: {new Date(selectedClaim.payment.verifiedAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  ) : selectedClaim.payment?.status === 'Evidence Submitted' ? (
                    <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-lg space-y-4 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <AlertCircle className="w-4 h-4" />
                        <span>Submitted Bank Transfer Evidence Awaiting Administrator Confirmation</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-950 rounded border border-amber-900/50">
                        <div>
                          <span className="text-zinc-500 text-[10px] uppercase block">Bank Name</span>
                          <span className="font-bold text-white">{selectedClaim.payment.bankName || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[10px] uppercase block">Sender Account Name</span>
                          <span className="font-bold text-white">{selectedClaim.payment.senderName || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[10px] uppercase block">Wire Reference Code</span>
                          <span className="font-mono font-bold text-amber-300">{selectedClaim.payment.transferReference}</span>
                        </div>
                      </div>

                      {/* Receipt Preview */}
                      {selectedClaim.payment.receiptUrl && (
                        <div className="space-y-1.5">
                          <span className="text-zinc-400 text-[11px] font-semibold uppercase">
                            Submitted Receipt Slip / Document Preview:
                          </span>
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setShowReceiptZoom(true)}
                              className="w-32 h-20 bg-zinc-950 rounded border border-zinc-700 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors relative group"
                            >
                              <img
                                src={selectedClaim.payment.receiptUrl}
                                alt="Wire Receipt"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowReceiptZoom(true)}
                              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Full Size Receipt</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Verification Controls */}
                      <div className="pt-2 border-t border-amber-900/40 space-y-3">
                        <div>
                          <label className="block text-zinc-300 font-semibold mb-1">
                            Treasury Verification Notes (Optional audit comment):
                          </label>
                          <input
                            type="text"
                            value={verificationNotes}
                            onChange={e => setVerificationNotes(e.target.value)}
                            placeholder="e.g. Verified settlement on Chase commercial treasury ledger (Ref: TSLA-778)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            disabled={isVerifyingPayment}
                            onClick={handleVerifyPayment}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isVerifyingPayment ? 'Verifying...' : 'Confirm Receipt of Funds (Verify Payment)'}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              placeholder="Reason if rejecting..."
                              className="bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white w-48"
                            />
                            <button
                              type="button"
                              disabled={isRejectingPayment || !rejectionReason.trim()}
                              onClick={handleRejectPayment}
                              className="px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold rounded text-xs uppercase tracking-wider disabled:opacity-50 transition-colors"
                            >
                              Reject Proof
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-3 text-xs">
                      <p className="text-zinc-400">
                        Recipient has not yet submitted wire proof. You may manually confirm settlement if institutional wire was verified directly:
                      </p>
                      <button
                        type="button"
                        disabled={isVerifyingPayment}
                        onClick={handleVerifyPayment}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold rounded text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Manually Mark Wire Payment Verified ($1,390 USD Received)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. CLAIM STATUS & DELIVERY CONTROLS (STRICTLY ADMIN ONLY) */}
                <form onSubmit={handleSaveStatus} className="p-5 sm:p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#E82127]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        Authorized Lifecycle & Logistics Controls
                      </h3>
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase">Server-Side Authorization Enforced</span>
                  </div>

                  <div className="space-y-4">
                    {/* Claim Status Choice */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Claim Lifecycle Status
                      </label>
                      <select
                        value={targetClaimStatus}
                        onChange={e => setTargetClaimStatus(e.target.value as ClaimStatus)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#E82127]"
                      >
                        <option value="Submitted">Submitted (Initial Applicant Intake)</option>
                        <option value="Under Review">Under Review (Eligibility & Jurisdiction)</option>
                        <option value="Approved">Approved (Allocation Granted)</option>
                        <option value="Processing">Processing (Carrier Logistics Coordination)</option>
                        <option value="Ready for Delivery">Ready for Delivery (Vehicle Staged)</option>
                        <option value="Rejected">Rejected (Ineligible or Disqualified)</option>
                      </select>
                      <p className="text-[11px] text-zinc-500">
                        Authoritatively controls whether the vehicle claim allocation is active, under evaluation, approved, or revoked.
                      </p>
                    </div>
                  </div>

                  {/* Mandatory Reason */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Mandatory Administrative Audit Reason <span className="text-[#E82127]">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={statusReason}
                      onChange={e => setStatusReason(e.target.value)}
                      placeholder="Explain the operational reason for this status modification (e.g., Driver licensing verified, carrier dispatched via enclosed transport slot)..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#E82127]"
                    />
                    <p className="text-[11px] text-zinc-500">
                      This explanation will be committed to `claim_status_history` and `audit_events`.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedClaim(null)}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingStatus || !statusReason.trim()}
                      className="px-6 py-2.5 bg-[#E82127] hover:bg-[#b91318] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSavingStatus ? 'Updating Status...' : 'Commit Status Modification'}</span>
                    </button>
                  </div>
                </form>

                {/* 4. Status History Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Claim Lifecycle Progression Timeline
                  </h4>
                  <div className="space-y-2">
                    {selectedClaim.timeline.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-zinc-900/30 border border-zinc-900 rounded-lg text-xs"
                      >
                        <div className="mt-0.5">
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{step.title}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{step.timestamp}</span>
                          </div>
                          <p className="text-zinc-400 mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Image Zoom Modal */}
        {showReceiptZoom && selectedClaim?.payment?.receiptUrl && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowReceiptZoom(false)}
          >
            <div className="max-w-2xl max-h-[85vh] bg-zinc-950 p-2 rounded-xl border border-zinc-700 overflow-hidden relative">
              <button
                onClick={() => setShowReceiptZoom(false)}
                className="absolute top-4 right-4 p-2 bg-black/80 text-white rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedClaim.payment.receiptUrl}
                alt="Wire Receipt Full Size"
                className="max-h-[80vh] w-auto object-contain mx-auto rounded"
              />
            </div>
          </div>
        )}

        {/* Security Audit Events Log Preview */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Administrative & Security Audit Events (Recent 20 Records)
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">public.audit_events</span>
          </div>

          {isLoadingAuditLogs ? (
            <p className="text-xs text-zinc-500">Loading audit records...</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-zinc-500">No recent audit events logged.</p>
          ) : (
            <div className="divide-y divide-zinc-900/60 max-h-60 overflow-y-auto">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between text-xs gap-4">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-white text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {log.action}
                    </span>
                    <span className="text-zinc-400 ml-2">
                      Resource: <strong className="text-zinc-300">{log.resource_type}</strong> ({log.resource_id})
                    </span>
                    {log.payload?.reason && (
                      <p className="text-[11px] text-zinc-500 italic">Reason: "{log.payload.reason}"</p>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
