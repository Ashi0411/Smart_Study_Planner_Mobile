// Security utilities for input sanitization, password strength validation, and brute-force mitigation

export interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  criteria: PasswordCriteria;
  isValid: boolean;
}

/**
 * Validates email format according to standard RFC 5322 regex and length constraints
 */
export function validateEmail(email: string): { isValid: boolean; error?: string; normalized: string } {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return { isValid: false, error: 'Email address is required.', normalized };
  }

  if (normalized.length > 254) {
    return { isValid: false, error: 'Email exceeds maximum allowable length.', normalized };
  }

  // RFC 5322 compliant email regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(normalized)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. user@example.com).', normalized };
  }

  return { isValid: true, normalized };
}

/**
 * Evaluates password strength based on standard NIST / OWASP guidelines:
 * - At least 8 characters
 * - Uppercase & Lowercase letters
 * - At least one numeric digit
 * - At least one special symbol
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=[\]]/.test(password),
  };

  let points = 0;
  if (criteria.minLength) points += 1;
  if (criteria.hasUppercase && criteria.hasLowercase) points += 1;
  if (criteria.hasNumber) points += 1;
  if (criteria.hasSpecialChar) points += 1;

  // Bonus point for 12+ length
  if (password.length >= 12 && points === 4) {
    return {
      score: 4,
      label: 'Very Strong',
      color: '#10B981', // Emerald
      criteria,
      isValid: true,
    };
  }

  switch (points) {
    case 4:
      return { score: 4, label: 'Strong', color: '#10B981', criteria, isValid: true };
    case 3:
      return { score: 3, label: 'Fair', color: '#F59E0B', criteria, isValid: criteria.minLength };
    case 2:
      return { score: 2, label: 'Weak', color: '#F97316', criteria, isValid: false };
    case 1:
    default:
      return { score: 1, label: 'Very Weak', color: '#EF4444', criteria, isValid: false };
  }
}

/**
 * Sanitizes general input strings (strips harmful characters and tags)
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // strip script/html tags
    .slice(0, 100); // enforce sensible length limit
}

// In-memory anti-brute-force rate limiter
class AntiBruteForceLimiter {
  private attempts: Map<string, { count: number; lockUntil: number }> = new Map();

  private MAX_FAILED_ATTEMPTS = 5;
  private LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

  isLocked(identifier: string): { locked: boolean; remainingSeconds: number } {
    const key = identifier.toLowerCase().trim();
    const record = this.attempts.get(key);

    if (!record) return { locked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (record.lockUntil > now) {
      const remainingSeconds = Math.ceil((record.lockUntil - now) / 1000);
      return { locked: true, remainingSeconds };
    }

    // Lockout expired
    if (record.lockUntil > 0 && record.lockUntil <= now) {
      this.attempts.delete(key);
    }

    return { locked: false, remainingSeconds: 0 };
  }

  recordFailure(identifier: string): { locked: boolean; remainingSeconds: number } {
    const key = identifier.toLowerCase().trim();
    const now = Date.now();
    const record = this.attempts.get(key) || { count: 0, lockUntil: 0 };

    record.count += 1;

    if (record.count >= this.MAX_FAILED_ATTEMPTS) {
      record.lockUntil = now + this.LOCKOUT_DURATION_MS;
      this.attempts.set(key, record);
      return { locked: true, remainingSeconds: Math.ceil(this.LOCKOUT_DURATION_MS / 1000) };
    }

    this.attempts.set(key, record);
    return { locked: false, remainingSeconds: 0 };
  }

  reset(identifier: string): void {
    const key = identifier.toLowerCase().trim();
    this.attempts.delete(key);
  }
}

export const bruteForceLimiter = new AntiBruteForceLimiter();
