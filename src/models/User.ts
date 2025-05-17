
/**
 * User model for Wantok.ai authentication system
 * Represents a user in the Papua New Guinea Tax System
 */

export enum UserRole {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  ADMIN = 'admin'
}

export enum BusinessType {
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  PARTNERSHIP = 'partnership',
  LIMITED_COMPANY = 'limited_company',
  CORPORATION = 'corporation',
  NON_PROFIT = 'non_profit',
  OTHER = 'other'
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  tinNumber?: string; // Papua New Guinea Tax Identification Number
  businessType?: BusinessType;
  phoneNumber?: string;
  verified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserPayload {
  email: string;
  password: string;
  confirmPassword: string;
  businessName?: string;
  tinNumber?: string;
  businessType?: BusinessType;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp when token expires
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
