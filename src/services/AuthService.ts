
/**
 * Authentication Service for Wantok.ai
 * Handles user authentication, registration, and session management
 */
import { AuditTrailService } from './index';
import { 
  UserProfile, 
  RegisterUserPayload, 
  LoginPayload, 
  AuthResponse,
  UserRole,
  PasswordResetRequest,
  PasswordResetPayload
} from '../models/User';
import { EventBus } from './EventBus';

// JWT Token interface
interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  exp: number; // Expiration time
}

class AuthService {
  private static instance: AuthService;
  private currentUser: UserProfile | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private readonly TOKEN_KEY = 'wantok_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'wantok_refresh_token';
  private readonly USER_KEY = 'wantok_user';
  private readonly TOKEN_EXPIRY_KEY = 'wantok_token_expires';
  
  // Constants for token management
  private readonly ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly REMEMBER_ME_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  // Rate limiting for login attempts
  private loginAttempts: Record<string, { count: number, lastAttempt: number }> = {};
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  
  // Private constructor for singleton pattern
  private constructor() {
    this.loadUserFromStorage();
    
    // Set up interval to check token expiration
    setInterval(() => this.checkTokenExpiration(), 60 * 1000); // Check every minute
  }
  
  /**
   * Get the singleton instance of AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Register a new user
   */
  public async register(payload: RegisterUserPayload): Promise<AuthResponse> {
    try {
      this.validateRegistrationPayload(payload);
      
      // Check if user already exists
      const existingUsers = this.getStoredUsers();
      if (existingUsers.some(user => user.email === payload.email)) {
        throw new Error('Email is already registered');
      }
      
      // Create user object
      const userId = this.generateUniqueId();
      const now = new Date();
      const hashedPassword = await this.hashPassword(payload.password);
      
      const newUser: UserProfile & { password: string } = {
        id: userId,
        email: payload.email,
        businessName: payload.businessName || undefined,
        tinNumber: payload.tinNumber || undefined,
        verified: false, // New users are unverified by default
        role: payload.role || UserRole.INDIVIDUAL,
        createdAt: now,
        updatedAt: now,
        password: hashedPassword
      };
      
      // Store user in localStorage (simulated database)
      this.saveUserToStorage(newUser);
      
      // Generate tokens
      const { accessToken, refreshToken, expiresAt } = this.generateTokens(userId, payload.email, newUser.role);
      
      // Set current session
      this.setCurrentSession({
        user: this.sanitizeUser(newUser),
        accessToken,
        refreshToken,
        expiresAt
      });
      
      // Log the registration
      AuditTrailService.getInstance().logAction(
        userId,
        'signup',
        { email: payload.email, businessName: payload.businessName }
      );

      // Emit registration event
      EventBus.getInstance().emit('user.registered', { userId, email: payload.email });
      
      // Send verification email (simulated)
      this.sendVerificationEmail(payload.email);
      
      return {
        user: this.sanitizeUser(newUser),
        accessToken,
        refreshToken,
        expiresAt
      };
    } catch (error) {
      // Log failed registration attempt
      EventBus.getInstance().emit('auth.registration.failed', { error: (error as Error).message });
      throw error;
    }
  }
  
  /**
   * Log in an existing user
   */
  public async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { email, password, rememberMe } = payload;
      
      // Check rate limiting
      if (this.isRateLimited(email)) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      // Increment login attempts
      this.recordLoginAttempt(email);
      
      // Find user
      const user = this.findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Verify password
      const passwordValid = await this.verifyPassword(password, user.password);
      if (!passwordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Reset login attempts on successful login
      this.resetLoginAttempts(email);
      
      // Generate tokens (with longer expiry if rememberMe is true)
      const { accessToken, refreshToken, expiresAt } = this.generateTokens(
        user.id, 
        user.email, 
        user.role,
        rememberMe
      );
      
      // Set current session
      this.setCurrentSession({
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        expiresAt
      });
      
      // Log the login
      AuditTrailService.getInstance().logAction(
        user.id,
        'login',
        { email: user.email }
      );

      // Emit login event
      EventBus.getInstance().emit('user.loggedin', { userId: user.id, email: user.email });
      
      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken,
        expiresAt
      };
    } catch (error) {
      // Log failed login attempt
      EventBus.getInstance().emit('auth.login.failed', { email: payload.email, error: (error as Error).message });
      throw error;
    }
  }
  
  /**
   * Log out the current user
   */
  public logout(): void {
    if (!this.currentUser) {
      return;
    }
    
    const userId = this.currentUser.id;
    const email = this.currentUser.email;
    
    // Clear local storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    
    // Clear memory
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
    
    // Log the logout
    AuditTrailService.getInstance().logAction(
      userId,
      'logout',
      { email }
    );

    // Emit logout event
    EventBus.getInstance().emit('user.loggedout', { userId, email });
  }
  
  /**
   * Request a password reset email
   */
  public async requestPasswordReset(request: PasswordResetRequest): Promise<boolean> {
    try {
      const { email } = request;
      
      // Find user
      const user = this.findUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists - just pretend we sent an email
        return true;
      }
      
      // Generate password reset token
      const resetToken = this.generateResetToken(user.id);
      
      // Store token in localStorage (would be database in a real implementation)
      const resetRequests = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
      resetRequests[user.id] = {
        token: resetToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('password_reset_tokens', JSON.stringify(resetRequests));
      
      // Send email with reset link (simulated)
      console.log(`Password reset email sent to ${email} with token: ${resetToken}`);
      
      // Log the request
      AuditTrailService.getInstance().logAction(
        user.id,
        'form_submission',
        { action: 'password_reset_request', email }
      );

      // Emit password reset requested event
      EventBus.getInstance().emit('user.password.reset.requested', { userId: user.id, email });
      
      return true;
    } catch (error) {
      EventBus.getInstance().emit('auth.password.reset.request.failed', { error: (error as Error).message });
      throw error;
    }
  }
  
  /**
   * Reset a password using a valid token
   */
  public async resetPassword(payload: PasswordResetPayload): Promise<boolean> {
    try {
      const { token, newPassword, confirmPassword } = payload;
      
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Validate password strength
      if (!this.isPasswordStrong(newPassword)) {
        throw new Error('Password is not strong enough. It should have at least 8 characters, including uppercase, lowercase, number, and special character.');
      }
      
      // Verify token and get user ID
      const userId = this.verifyResetToken(token);
      if (!userId) {
        throw new Error('Invalid or expired reset token');
      }
      
      // Find user
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update password
      const user = users[userIndex];
      user.password = await this.hashPassword(newPassword);
      user.updatedAt = new Date();
      
      // Update user in storage
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Remove used token
      const resetRequests = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
      delete resetRequests[userId];
      localStorage.setItem('password_reset_tokens', JSON.stringify(resetRequests));
      
      // Log the action
      AuditTrailService.getInstance().logAction(
        userId,
        'profile_update',
        { action: 'password_reset' }
      );

      // Emit password reset event
      EventBus.getInstance().emit('user.password.reset.completed', { userId, email: user.email });
      
      return true;
    } catch (error) {
      EventBus.getInstance().emit('auth.password.reset.failed', { error: (error as Error).message });
      throw error;
    }
  }
  
  /**
   * Get the current authenticated user
   */
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }
  
  /**
   * Check if the user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.currentUser && !!this.accessToken && this.isTokenValid();
  }
  
  /**
   * Check if current user has the specified role
   */
  public hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }
  
  /**
   * Refresh the access token using the refresh token
   */
  public async refreshAccessToken(): Promise<AuthResponse | null> {
    try {
      if (!this.refreshToken || !this.currentUser) {
        return null;
      }
      
      // Verify the refresh token (in a real app, this would be a server call)
      const payload = this.decodeToken(this.refreshToken);
      if (!payload || Date.now() >= payload.exp * 1000) {
        this.logout();
        return null;
      }
      
      // Generate new access token
      const { accessToken, expiresAt } = this.generateTokens(
        this.currentUser.id,
        this.currentUser.email,
        this.currentUser.role
      );
      
      // Update current session
      this.accessToken = accessToken;
      this.tokenExpiresAt = expiresAt;
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiresAt.toString());
      
      // Log the token refresh
      AuditTrailService.getInstance().logAction(
        this.currentUser.id,
        'login',
        { action: 'token_refresh', email: this.currentUser.email }
      );

      // Emit token refreshed event
      EventBus.getInstance().emit('auth.token.refreshed', { userId: this.currentUser.id });
      
      return {
        user: this.currentUser,
        accessToken,
        expiresAt
      };
    } catch (error) {
      EventBus.getInstance().emit('auth.token.refresh.failed', { error: (error as Error).message });
      this.logout();
      return null;
    }
  }
  
  /**
   * Verify a user's email address with a token
   */
  public verifyEmail(userId: string, token: string): boolean {
    try {
      // In a real app, this would validate against a stored token
      // For now, we'll simulate this
      const verificationTokens = JSON.parse(
        localStorage.getItem('email_verification_tokens') || '{}'
      );
      
      const storedToken = verificationTokens[userId];
      if (!storedToken || storedToken.token !== token || Date.now() > storedToken.expiresAt) {
        return false;
      }
      
      // Find and update user
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return false;
      }
      
      // Update user verification status
      users[userIndex].verified = true;
      users[userIndex].updatedAt = new Date();
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user if it's the logged-in user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = {
          ...this.currentUser,
          verified: true
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
      }
      
      // Remove used token
      delete verificationTokens[userId];
      localStorage.setItem('email_verification_tokens', JSON.stringify(verificationTokens));
      
      // Log verification
      AuditTrailService.getInstance().logAction(
        userId,
        'profile_update',
        { action: 'email_verification', verified: true }
      );

      // Emit email verified event
      EventBus.getInstance().emit('user.email.verified', { userId, email: users[userIndex].email });
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Update the user's profile
   */
  public async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Check authentication
      if (!this.isAuthenticated() || this.currentUser?.id !== userId) {
        throw new Error('Unauthorized');
      }
      
      // Find user
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update allowed fields only (prevent overwriting sensitive fields)
      const allowedFields: (keyof UserProfile)[] = [
        'firstName', 'lastName', 'businessName', 'phoneNumber', 'businessType'
      ];
      
      const user = users[userIndex];
      for (const field of allowedFields) {
        if (field in updates) {
          (user as any)[field] = updates[field as keyof typeof updates];
        }
      }
      
      user.updatedAt = new Date();
      
      // Save updated user
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = this.sanitizeUser(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
      }
      
      // Log profile update
      AuditTrailService.getInstance().logAction(
        userId,
        'profile_update',
        { updatedFields: Object.keys(updates) }
      );

      // Emit profile updated event
      EventBus.getInstance().emit('user.profile.updated', { userId, email: user.email });
      
      return this.sanitizeUser(user);
    } catch (error) {
      EventBus.getInstance().emit('user.profile.update.failed', { error: (error as Error).message });
      throw error;
    }
  }
  
  // Private methods
  
  /**
   * Validate registration payload
   */
  private validateRegistrationPayload(payload: RegisterUserPayload): void {
    // Check required fields
    if (!payload.email || !payload.password || !payload.confirmPassword) {
      throw new Error('Missing required fields');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password strength
    if (!this.isPasswordStrong(payload.password)) {
      throw new Error('Password is not strong enough. It should have at least 8 characters, including uppercase, lowercase, number, and special character.');
    }
    
    // Check passwords match
    if (payload.password !== payload.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    // Validate TIN number if provided
    if (payload.tinNumber && !this.isValidTIN(payload.tinNumber)) {
      throw new Error('Invalid Papua New Guinea TIN number format');
    }
  }
  
  /**
   * Check if password meets strength requirements
   */
  private isPasswordStrong(password: string): boolean {
    if (password.length < 8) return false;
    
    // Check for uppercase, lowercase, number, and special character
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }
  
  /**
   * Validate PNG Tax Identification Number
   */
  private isValidTIN(tin: string): boolean {
    // Simplified validation for PNG TIN
    // In a real application, this would implement proper PNG TIN validation rules
    return /^\d{9,10}$/.test(tin);
  }
  
  /**
   * Hash a password (simulated for localStorage implementation)
   */
  private async hashPassword(password: string): Promise<string> {
    // In a real app, this would use bcrypt or similar
    // For this simulation, we'll use a simple hash + salt approach
    const salt = this.generateUniqueId().slice(0, 16);
    const hash = await this.simulateHash(password + salt);
    return `${salt}:${hash}`;
  }
  
  /**
   * Verify a password against a hash
   */
  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // In a real app, this would use bcrypt or similar
    const [salt, hash] = storedHash.split(':');
    const calculatedHash = await this.simulateHash(password + salt);
    return calculatedHash === hash;
  }
  
  /**
   * Simple hash function (for simulation only - not secure!)
   */
  private async simulateHash(input: string): Promise<string> {
    // In a real app, use bcrypt - this is just for simulation
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Generate JWT tokens
   */
  private generateTokens(
    userId: string, 
    email: string, 
    role: UserRole,
    extendedSession = false
  ): { accessToken: string, refreshToken: string, expiresAt: number } {
    // Calculate expiry times
    const now = Date.now();
    const accessTokenExpiry = now + this.ACCESS_TOKEN_EXPIRY;
    const refreshTokenExpiry = extendedSession 
      ? now + this.REMEMBER_ME_EXPIRY 
      : now + this.REFRESH_TOKEN_EXPIRY;
    
    // Create token payloads
    const accessPayload: TokenPayload = {
      userId,
      email,
      role,
      exp: Math.floor(accessTokenExpiry / 1000)
    };
    
    const refreshPayload: TokenPayload = {
      userId,
      email,
      role,
      exp: Math.floor(refreshTokenExpiry / 1000)
    };
    
    // Generate tokens (simulated)
    const accessToken = this.encodeToken(accessPayload);
    const refreshToken = this.encodeToken(refreshPayload);
    
    return {
      accessToken,
      refreshToken,
      expiresAt: accessTokenExpiry
    };
  }
  
  /**
   * Encode a JWT token (simulated)
   */
  private encodeToken(payload: TokenPayload): string {
    // In a real app, this would use a JWT library
    // For simulation, we'll base64 encode the payload
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = this.generateUniqueId(); // Simulated signature
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
  
  /**
   * Decode a JWT token (simulated)
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      // In a real app, this would verify the signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload as TokenPayload;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Check if the current token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiresAt) {
      return false;
    }
    
    // Check if token has expired
    return Date.now() < this.tokenExpiresAt;
  }
  
  /**
   * Generate a unique ID
   */
  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * Check token expiration and refresh if needed
   */
  private checkTokenExpiration(): void {
    if (!this.isAuthenticated()) {
      return;
    }
    
    // If token is expired or about to expire (within 5 minutes), refresh it
    if (!this.tokenExpiresAt || Date.now() > this.tokenExpiresAt - (5 * 60 * 1000)) {
      this.refreshAccessToken();
    }
  }
  
  /**
   * Set the current user session
   */
  private setCurrentSession(session: AuthResponse): void {
    this.currentUser = session.user;
    this.accessToken = session.accessToken;
    this.refreshToken = session.refreshToken || null;
    this.tokenExpiresAt = session.expiresAt;
    
    // Store in localStorage
    localStorage.setItem(this.USER_KEY, JSON.stringify(session.user));
    localStorage.setItem(this.TOKEN_KEY, session.accessToken);
    if (session.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, session.refreshToken);
    }
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, session.expiresAt.toString());
  }
  
  /**
   * Load user from localStorage
   */
  private loadUserFromStorage(): void {
    // Try to restore session from localStorage
    try {
      const storedUser = localStorage.getItem(this.USER_KEY);
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const storedExpiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (storedUser && storedToken && storedExpiry) {
        this.currentUser = JSON.parse(storedUser);
        this.accessToken = storedToken;
        this.refreshToken = storedRefreshToken;
        this.tokenExpiresAt = parseInt(storedExpiry, 10);
        
        // Check if token is expired
        if (!this.isTokenValid()) {
          // Try to use refresh token
          if (this.refreshToken) {
            this.refreshAccessToken();
          } else {
            this.logout();
          }
        }
      }
    } catch (error) {
      this.logout();
    }
  }
  
  /**
   * Find a user by email
   */
  private findUserByEmail(email: string): (UserProfile & { password: string }) | undefined {
    const users = this.getStoredUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  /**
   * Save user to localStorage (simulated database)
   */
  private saveUserToStorage(user: UserProfile & { password: string }): void {
    const users = this.getStoredUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  /**
   * Get all users from storage
   */
  private getStoredUsers(): Array<UserProfile & { password: string }> {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  }
  
  /**
   * Remove password from user object
   */
  private sanitizeUser(user: UserProfile & { password: string }): UserProfile {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
  
  /**
   * Generate a password reset token
   */
  private generateResetToken(userId: string): string {
    return `reset_${userId}_${this.generateUniqueId()}`;
  }
  
  /**
   * Verify a password reset token
   */
  private verifyResetToken(token: string): string | null {
    try {
      const resetRequests = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
      
      // Find matching token
      for (const userId in resetRequests) {
        const request = resetRequests[userId];
        
        if (
          request.token === token && 
          Date.now() <= request.expiresAt
        ) {
          return userId;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Send verification email (simulated)
   */
  private sendVerificationEmail(email: string): void {
    // Find user by email
    const user = this.findUserByEmail(email);
    if (!user) return;
    
    // Generate verification token
    const token = this.generateUniqueId();
    
    // Store token (would be in database in a real app)
    const verificationTokens = JSON.parse(
      localStorage.getItem('email_verification_tokens') || '{}'
    );
    
    verificationTokens[user.id] = {
      token,
      expiresAt: Date.now() + (48 * 60 * 60 * 1000) // 48 hours
    };
    
    localStorage.setItem('email_verification_tokens', JSON.stringify(verificationTokens));
    
    // In a real app, this would send an actual email
    console.log(`Verification email sent to ${email} with token: ${token}`);
  }
  
  /**
   * Check if login attempts are rate limited
   */
  private isRateLimited(email: string): boolean {
    const attempts = this.loginAttempts[email];
    
    if (!attempts) {
      return false;
    }
    
    // Check if lockout period is over
    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      const lockoutExpires = attempts.lastAttempt + this.LOCKOUT_DURATION;
      
      if (Date.now() < lockoutExpires) {
        return true;
      }
      
      // Reset if lockout period is over
      this.resetLoginAttempts(email);
    }
    
    return false;
  }
  
  /**
   * Record a login attempt
   */
  private recordLoginAttempt(email: string): void {
    if (!this.loginAttempts[email]) {
      this.loginAttempts[email] = { count: 0, lastAttempt: Date.now() };
    }
    
    this.loginAttempts[email].count += 1;
    this.loginAttempts[email].lastAttempt = Date.now();
  }
  
  /**
   * Reset login attempts for an email
   */
  private resetLoginAttempts(email: string): void {
    delete this.loginAttempts[email];
  }
}

export default AuthService;
