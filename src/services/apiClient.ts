/**
 * Production Backend API Client
 * Connects frontend React components to Express backend routes (/api/*).
 */

import { authStorage, isStaticDeployment } from './authStorage';

// When VITE_API_BASE_URL is omitted, undefined, or empty, default to '/api' for same-origin requests
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (rawBaseUrl && rawBaseUrl.trim() !== '')
  ? rawBaseUrl.trim().replace(/\/$/, '')
  : '/api';

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    timestamp?: string;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load initial token from localStorage if present
    try {
      this.token = localStorage.getItem('tesla_auth_token');
    } catch {
      this.token = null;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('tesla_auth_token', token);
      } else {
        localStorage.removeItem('tesla_auth_token');
      }
    } catch {
      // Ignore storage errors
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: `HTTP_${response.status}`,
            message: data.message || `Request failed with status ${response.status}`
          }
        };
      }

      return data as ApiResponse<T>;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Network communication failure: ${msg}`
        }
      };
    }
  }

  // Health and Readiness
  async getHealth() {
    return this.request<{ status: string; uptimeSeconds: number }>('/health');
  }

  async getReadiness() {
    return this.request<{
      status: string;
      database: { connected: boolean; message: string };
      services: Record<string, boolean>;
    }>('/ready');
  }

  // Vehicles
  async getVehicles() {
    return this.request<any[]>('/vehicles');
  }

  async getVehicle(id: string) {
    return this.request<any>(`/vehicles/${id}`);
  }

  // Claims
  async submitClaim(vehicleId: string, deliveryAddress: any) {
    return this.request<any>('/claims', {
      method: 'POST',
      body: JSON.stringify({ vehicleId, deliveryAddress })
    });
  }

  async getMyClaims() {
    const user = authStorage.getCurrentUser();
    if (!user || !user.id) {
      return { success: true, data: [] };
    }

    if (isStaticDeployment()) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        if (!raw) return { success: true, data: [] };
        const allClaims: any[] = JSON.parse(raw);
        const myClaims = allClaims.filter(c =>
          c.userId !== 'user-default-alloc' && (
            (c.userId && c.userId === user.id) ||
            (c.deliveryAddress?.email && user.email && c.deliveryAddress.email.toLowerCase() === user.email.toLowerCase()) ||
            (c.applicant?.id && c.applicant.id === user.id) ||
            (c.applicant?.email && user.email && c.applicant.email.toLowerCase() === user.email.toLowerCase())
          )
        );
        return { success: true, data: myClaims };
      } catch {
        return { success: true, data: [] };
      }
    }
    const res = await this.request<any[]>('/claims/my-claims');
    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        if (!raw) return { success: true, data: [] };
        const allClaims: any[] = JSON.parse(raw);
        const myClaims = allClaims.filter(c =>
          c.userId !== 'user-default-alloc' && (
            (c.userId && c.userId === user.id) ||
            (c.deliveryAddress?.email && user.email && c.deliveryAddress.email.toLowerCase() === user.email.toLowerCase()) ||
            (c.applicant?.id && c.applicant.id === user.id) ||
            (c.applicant?.email && user.email && c.applicant.email.toLowerCase() === user.email.toLowerCase())
          )
        );
        return { success: true, data: myClaims };
      } catch {
        return { success: true, data: [] };
      }
    }
    return res;
  }

  async getClaimDetails(id: string) {
    if (isStaticDeployment()) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const found = claims.find((c: any) => c.id === id || c.trackingNumber === id);
        if (found) return { success: true, data: found };
      } catch {
        // Fallback
      }
    }
    return this.request<any>(`/claims/${id}`);
  }

  // Auth
  async login(email: string, pass: string): Promise<ApiResponse<{ user: any; token: string }>> {
    // If running in static hosting environment (like GitHub Pages), use client-side authentication directly
    if (isStaticDeployment()) {
      const authRes = await authStorage.login(email, pass);
      if (authRes.success && authRes.user) {
        if (authRes.token) {
          this.setToken(authRes.token);
        }
        return {
          success: true,
          data: {
            user: authRes.user,
            token: authRes.token || 'static-token'
          }
        };
      }
      return {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: authRes.error || 'Authentication failed. Please verify credentials.'
        }
      };
    }

    const res = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });

    // If backend returns 405 (Method Not Allowed), 404, or Network Error (static deployment without Express backend)
    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      const authRes = await authStorage.login(email, pass);
      if (authRes.success && authRes.user) {
        if (authRes.token) {
          this.setToken(authRes.token);
        }
        return {
          success: true,
          data: {
            user: authRes.user,
            token: authRes.token || 'static-token'
          }
        };
      }
      return {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: authRes.error || 'Authentication failed. Please verify credentials.'
        }
      };
    }

    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    country: string;
    address?: any;
  }): Promise<ApiResponse<{ user: any; token?: string }>> {
    if (isStaticDeployment()) {
      const authRes = await authStorage.register(data);
      if (authRes.success && authRes.user) {
        if (authRes.token) {
          this.setToken(authRes.token);
        }
        return {
          success: true,
          data: {
            user: authRes.user,
            token: authRes.token
          },
          message: authRes.message
        };
      }
      return {
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: authRes.error || 'Registration failed.'
        }
      };
    }

    const res = await this.request<{ user: any; token?: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      const authRes = await authStorage.register(data);
      if (authRes.success && authRes.user) {
        if (authRes.token) {
          this.setToken(authRes.token);
        }
        return {
          success: true,
          data: {
            user: authRes.user,
            token: authRes.token
          },
          message: authRes.message
        };
      }
      return {
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: authRes.error || 'Registration failed.'
        }
      };
    }

    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getMe() {
    if (isStaticDeployment()) {
      const user = authStorage.getCurrentUser();
      if (user) {
        return { success: true, data: user };
      }
      return { success: false, error: { code: 'NO_SESSION', message: 'No active session' } };
    }

    const res = await this.request<any>('/auth/me');
    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      const user = authStorage.getCurrentUser();
      if (user) {
        return { success: true, data: user };
      }
    }
    return res;
  }

  async resetPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    if (isStaticDeployment()) {
      const authRes = await authStorage.resetPassword(email);
      if (authRes.success) {
        return {
          success: true,
          data: { message: authRes.message || 'Password reset instructions have been dispatched.' }
        };
      }
      return {
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: authRes.error || 'Failed to dispatch password reset request.'
        }
      };
    }

    const res = await this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      const authRes = await authStorage.resetPassword(email);
      if (authRes.success) {
        return {
          success: true,
          data: { message: authRes.message || 'Password reset instructions have been dispatched.' }
        };
      }
      return {
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: authRes.error || 'Failed to dispatch password reset request.'
        }
      };
    }

    return res;
  }

  async submitPaymentEvidence(
    claimId: string,
    evidence: {
      transferReference: string;
      senderName: string;
      bankName: string;
      receiptUrl?: string | null;
      notes?: string | null;
    }
  ) {
    if (isStaticDeployment()) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const target = claims.find((c: any) => c.id === claimId);
        if (target) {
          target.payment = {
            id: 'pay-' + Date.now(),
            status: 'Evidence Submitted',
            amountUSD: target.feeBreakdown?.totalUSD || 1390,
            transferReference: evidence.transferReference,
            senderName: evidence.senderName,
            bankName: evidence.bankName,
            receiptUrl: evidence.receiptUrl,
            submittedAt: new Date().toISOString()
          };
          localStorage.setItem('tesla_claims_db', JSON.stringify(claims));
        }
      } catch {
        // Ignore
      }
      return { success: true, data: { submitted: true } };
    }

    const res = await this.request<any>(`/claims/${claimId}/payment-evidence`, {
      method: 'POST',
      body: JSON.stringify(evidence)
    });

    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      return { success: true, data: { submitted: true } };
    }
    return res;
  }

  // Administrator Endpoints (Protected by server-side requireAdmin or authStorage in static mode)
  async adminGetClaims(params?: { status?: string; paymentStatus?: string; limit?: number }) {
    if (isStaticDeployment()) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        let claims = raw ? JSON.parse(raw) : [];
        if (params?.status) {
          claims = claims.filter((c: any) => c.status?.toLowerCase() === params.status?.toLowerCase());
        }
        if (params?.paymentStatus) {
          claims = claims.filter((c: any) => c.payment?.status?.toLowerCase() === params.paymentStatus?.toLowerCase());
        }
        if (params?.limit) {
          claims = claims.slice(0, params.limit);
        }
        return { success: true, data: claims };
      } catch {
        return { success: true, data: [] };
      }
    }

    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request<any[]>(`/admin/claims${qs}`);

    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        return { success: true, data: raw ? JSON.parse(raw) : [] };
      } catch {
        return { success: true, data: [] };
      }
    }

    return res;
  }

  async adminUpdateClaim(
    id: string,
    payload: { status?: string; deliveryStatus?: string; reason: string }
  ) {
    if (isStaticDeployment()) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const index = claims.findIndex((c: any) => c.id === id);
        if (index !== -1) {
          if (payload.status) claims[index].status = payload.status;
          if (payload.deliveryStatus) claims[index].deliveryStatus = payload.deliveryStatus;
          claims[index].lastUpdatedDate = new Date().toISOString();
          if (payload.reason) claims[index].notes = payload.reason;
          localStorage.setItem('tesla_claims_db', JSON.stringify(claims));
        }
      } catch {
        // Fallback
      }
      authStorage.recordAuditLog('CLAIM_STATUS_UPDATED', 'claim', id, payload);
      return { success: true, data: { id, ...payload } };
    }

    const res = await this.request<any>(`/admin/claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });

    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const index = claims.findIndex((c: any) => c.id === id);
        if (index !== -1) {
          if (payload.status) claims[index].status = payload.status;
          if (payload.deliveryStatus) claims[index].deliveryStatus = payload.deliveryStatus;
          claims[index].lastUpdatedDate = new Date().toISOString();
          if (payload.reason) claims[index].notes = payload.reason;
          localStorage.setItem('tesla_claims_db', JSON.stringify(claims));
        }
      } catch {
        // Fallback
      }
      authStorage.recordAuditLog('CLAIM_STATUS_UPDATED', 'claim', id, payload);
      return { success: true, data: { id, ...payload } };
    }

    return res;
  }

  async adminVerifyPayment(
    paymentId: string,
    notes?: string,
    updateClaimStatusToApproved: boolean = true
  ) {
    if (isStaticDeployment()) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const target = claims.find((c: any) => c.payment?.id === paymentId || c.id === paymentId);
        if (target) {
          if (updateClaimStatusToApproved) target.status = 'Approved';
          if (!target.payment) target.payment = { status: 'Verified' };
          target.payment.status = 'Verified';
          target.payment.verifiedAt = new Date().toISOString();
          target.payment.verificationNotes = notes || 'Verified by authorized administrator';
          localStorage.setItem('tesla_claims_db', JSON.stringify(claims));
        }
      } catch {
        // Ignore
      }
      authStorage.recordAuditLog('PAYMENT_VERIFIED', 'payment', paymentId, { notes, updateClaimStatusToApproved });
      return { success: true, data: { verified: true } };
    }

    const res = await this.request<any>(`/admin/payments/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ notes, updateClaimStatusToApproved })
    });

    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const target = claims.find((c: any) => c.payment?.id === paymentId || c.id === paymentId);
        if (target) {
          if (updateClaimStatusToApproved) target.status = 'Approved';
          if (!target.payment) target.payment = { status: 'Verified' };
          target.payment.status = 'Verified';
          target.payment.verifiedAt = new Date().toISOString();
          target.payment.verificationNotes = notes || 'Verified by authorized administrator';
          localStorage.setItem('tesla_claims_db', JSON.stringify(claims));
        }
      } catch {
        // Ignore
      }
      authStorage.recordAuditLog('PAYMENT_VERIFIED', 'payment', paymentId, { notes, updateClaimStatusToApproved });
      return { success: true, data: { verified: true } };
    }

    return res;
  }

  async adminRejectPayment(paymentId: string, reason: string) {
    if (isStaticDeployment()) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const target = claims.find((c: any) => c.payment?.id === paymentId || c.id === paymentId);
        if (target && target.payment) {
          target.payment.status = 'Failed';
          target.payment.rejectionReason = reason;
          localStorage.setItem('tesla_claims_db', JSON.stringify(claims));
        }
      } catch {
        // Ignore
      }
      authStorage.recordAuditLog('PAYMENT_REJECTED', 'payment', paymentId, { reason });
      return { success: true, data: { rejected: true } };
    }

    const res = await this.request<any>(`/admin/payments/${paymentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });

    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      try {
        const raw = localStorage.getItem('tesla_claims_db');
        const claims = raw ? JSON.parse(raw) : [];
        const target = claims.find((c: any) => c.payment?.id === paymentId || c.id === paymentId);
        if (target && target.payment) {
          target.payment.status = 'Failed';
          target.payment.rejectionReason = reason;
          localStorage.setItem('tesla_claims_db', JSON.stringify(claims));
        }
      } catch {
        // Ignore
      }
      authStorage.recordAuditLog('PAYMENT_REJECTED', 'payment', paymentId, { reason });
      return { success: true, data: { rejected: true } };
    }

    return res;
  }

  async adminGetAuditLogs(limit?: number) {
    if (isStaticDeployment()) {
      return {
        success: true,
        data: authStorage.getAuditLogs(limit)
      };
    }

    const qs = limit ? `?limit=${limit}` : '';
    const res = await this.request<any[]>(`/admin/audit-logs${qs}`);
    if (
      !res.success &&
      (res.error?.code === 'HTTP_405' ||
        res.error?.code === 'HTTP_404' ||
        res.error?.code === 'NETWORK_ERROR')
    ) {
      return {
        success: true,
        data: authStorage.getAuditLogs(limit)
      };
    }
    return res;
  }

  logout() {
    this.setToken(null);
  }
}

export const apiClient = new ApiClient();
