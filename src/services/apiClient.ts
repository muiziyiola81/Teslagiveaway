/**
 * Production Backend API Client
 * Connects frontend React components to Express backend routes (/api/*).
 */

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
    return this.request<any[]>('/claims/my-claims');
  }

  async getClaimDetails(id: string) {
    return this.request<any>(`/claims/${id}`);
  }

  // Auth
  async login(email: string, pass: string) {
    const res = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async register(data: { email: string; password: string; fullName: string; phone: string; country: string }) {
    const res = await this.request<{ user: any; token?: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async resetPassword(email: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  logout() {
    this.setToken(null);
  }
}

export const apiClient = new ApiClient();
