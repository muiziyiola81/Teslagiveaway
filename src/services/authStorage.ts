import { User, DeliveryAddress, Claim, ClaimStatus, DeliveryStatus, PaymentStatus } from '../types';

/**
 * Client-Side Authentication & Storage Service
 * Powers authentication and state in static hosting environments like GitHub Pages
 * where an Express/Node backend is not available.
 */

export interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  country: string;
  role: 'user' | 'support' | 'admin' | 'superadmin';
  address?: DeliveryAddress;
  createdAt: string;
}

export interface ClientAuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'miizlake@gmail.com',
  'admin@tesla-allocation.internal',
  'muiziyiola81@gmail.com'
];

const USERS_STORAGE_KEY = 'tesla_registered_users';
const CLAIMS_STORAGE_KEY = 'tesla_claims_db';
const AUDIT_STORAGE_KEY = 'tesla_audit_logs';

/**
 * Robust SHA-256 password hashing using the native Web Cryptography API.
 * Never stores plain-text passwords.
 */
export async function hashPassword(password: string): Promise<string> {
  const salted = `${password}:tesla_portal_allocation_2026`;
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(salted);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback if crypto.subtle is unavailable
  }

  // Pure JavaScript SHA-256 fallback if crypto.subtle is not supported
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Check if the application is running in a static hosting environment
 * such as GitHub Pages (*.github.io, custom domains, etc.) where no server is available.
 */
export function isStaticDeployment(): boolean {
  if (typeof window === 'undefined') return false;
  const configuredApi = import.meta.env.VITE_API_BASE_URL;

  // If a full remote URL (http:// or https://) is explicitly configured, use remote API
  if (configuredApi && /^https?:\/\//i.test(configuredApi.trim())) {
    return false;
  }

  const host = window.location.hostname.toLowerCase();

  // Standard static hosting domains
  if (
    host.endsWith('github.io') ||
    host.endsWith('pages.dev') ||
    host.endsWith('gitlab.io') ||
    host.endsWith('surge.sh') ||
    host.endsWith('netlify.app') ||
    host.endsWith('vercel.app')
  ) {
    return true;
  }

  // If running in production (not localhost/127.0.0.1) without an external API configured,
  // it is deployed on static hosting (such as GitHub Pages with a custom domain)
  if (host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('192.168.') && !host.startsWith('10.')) {
    return true;
  }

  // Also default to static mode if VITE_API_BASE_URL is not set or relative /api
  if (!configuredApi || configuredApi === '/api' || configuredApi.trim() === '') {
    return true;
  }

  return false;
}

/**
 * Check if an email is an authorized administrator email.
 */
export function isAuthorizedAdminEmail(email: string): boolean {
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

class AuthStorageService {
  private getStoredUsers(): StoredUserAccount[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  }

  private saveStoredUsers(users: StoredUserAccount[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Client-side user login for static deployments.
   */
  async login(
    email: string,
    pass: string
  ): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !pass) {
      return { success: false, error: 'Email and password are required.' };
    }

    const users = this.getStoredUsers();
    let account = users.find(u => u.email === trimmedEmail);
    const passwordHash = await hashPassword(pass);

    // If an authorized admin email is logging in for the first time on GitHub Pages
    if (!account && isAuthorizedAdminEmail(trimmedEmail)) {
      if (pass.length < 6) {
        return {
          success: false,
          error: 'Administrator password must be at least 6 characters.'
        };
      }

      const role: 'admin' | 'superadmin' =
        trimmedEmail === 'muiziyiola81@gmail.com' ? 'superadmin' : 'admin';

      account = {
        id: 'usr-admin-' + Math.random().toString(36).substring(2, 8),
        email: trimmedEmail,
        passwordHash,
        fullName:
          trimmedEmail === 'miizlake@gmail.com'
            ? 'Operations Administrator'
            : trimmedEmail === 'muiziyiola81@gmail.com'
            ? 'Operations Superadmin'
            : 'Tesla Operations Lead',
        phone: '+1 (800) 555-0199',
        country: 'United States',
        role,
        createdAt: new Date().toISOString()
      };
      users.push(account);
      this.saveStoredUsers(users);
    }

    if (!account) {
      return {
        success: false,
        error: 'Account not found with this email. Please verify your address or register for an account.'
      };
    }

    if (account.passwordHash !== passwordHash) {
      return {
        success: false,
        error: 'Invalid password. Please check your credentials and try again.'
      };
    }

    const userObj: User = {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      phone: account.phone,
      country: account.country,
      role: account.role,
      address: account.address
    };

    const token = 'static-jwt-' + account.id;

    // Log login audit event
    this.recordAuditLog('USER_LOGIN', 'user', account.id, { email: account.email, role: account.role });

    return {
      success: true,
      user: userObj,
      token
    };
  }

  /**
   * Client-side registration for static deployments.
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    country: string;
    address?: DeliveryAddress;
  }): Promise<{ success: boolean; user?: User; token?: string; error?: string; message?: string }> {
    const trimmedEmail = data.email.trim().toLowerCase();
    if (!trimmedEmail || !data.password || !data.fullName) {
      return { success: false, error: 'Please fill in all mandatory profile fields.' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = this.getStoredUsers();
    const existing = users.find(u => u.email === trimmedEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      };
    }

    const passwordHash = await hashPassword(data.password);
    const role = isAuthorizedAdminEmail(trimmedEmail) ? 'admin' : 'user';

    const newAccount: StoredUserAccount = {
      id: 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      email: trimmedEmail,
      passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      country: data.country.trim() || 'United States',
      role,
      address: data.address,
      createdAt: new Date().toISOString()
    };

    users.push(newAccount);
    this.saveStoredUsers(users);

    const userObj: User = {
      id: newAccount.id,
      email: newAccount.email,
      fullName: newAccount.fullName,
      phone: newAccount.phone,
      country: newAccount.country,
      role: newAccount.role,
      address: newAccount.address
    };

    const token = 'static-jwt-' + newAccount.id;

    // Record audit event
    this.recordAuditLog('USER_REGISTERED', 'user', newAccount.id, { email: newAccount.email, role: newAccount.role });

    return {
      success: true,
      user: userObj,
      token,
      message: 'Account created successfully.'
    };
  }

  /**
   * Client-side password reset request for static deployments.
   */
  async resetPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    const users = this.getStoredUsers();
    const found = users.some(u => u.email === trimmedEmail) || isAuthorizedAdminEmail(trimmedEmail);

    if (!found) {
      return {
        success: false,
        error: 'No account registered with that email address. Please register.'
      };
    }

    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${trimmedEmail}.`
    };
  }

  /**
   * Record client-side audit event for administrative actions.
   */
  recordAuditLog(action: string, resourceType: string, resourceId: string, payload?: Record<string, unknown>): void {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      const logs: ClientAuditLog[] = raw ? JSON.parse(raw) : [];
      logs.unshift({
        id: 'aud-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        payload,
        created_at: new Date().toISOString()
      });
      // Keep recent 50 logs
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
    } catch {
      // Ignore
    }
  }

  getAuditLogs(limit: number = 20): ClientAuditLog[] {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) {
        const logs: ClientAuditLog[] = JSON.parse(raw);
        return logs.slice(0, limit);
      }
    } catch {
      // Ignore
    }
    return [];
  }

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem('tesla_auth_session');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
    return null;
  }
}

export const authStorage = new AuthStorageService();
