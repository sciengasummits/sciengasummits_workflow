import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ─── JWT-like Token Management ─────────────────────────────────
// Uses HMAC-SHA256 signed tokens for stateless authentication
// Token format: base64(payload).signature

const SECRET = process.env.AUTH_SECRET || 'sciengasummits-2026-default-secret-change-me';
const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a signed authentication token
 * @param {Object} payload - { username, conferenceId, displayName }
 * @returns {string} signed token
 */
export function generateToken(payload) {
    const tokenData = {
        ...payload,
        iat: Date.now(),
        exp: Date.now() + TOKEN_EXPIRY_MS,
    };
    const dataStr = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
    const signature = crypto
        .createHmac('sha256', SECRET)
        .update(dataStr)
        .digest('base64url');
    return `${dataStr}.${signature}`;
}

/**
 * Verify and decode a token
 * @param {string} token - The token to verify
 * @returns {Object|null} decoded payload or null if invalid/expired
 */
export function verifyToken(token) {
    if (!token) return null;
    try {
        const [dataStr, signature] = token.split('.');
        if (!dataStr || !signature) return null;

        // Verify signature
        const expectedSig = crypto
            .createHmac('sha256', SECRET)
            .update(dataStr)
            .digest('base64url');
        if (signature !== expectedSig) return null;

        // Decode and check expiry
        const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString());
        if (!payload.exp || Date.now() > payload.exp) return null;

        return payload;
    } catch {
        return null;
    }
}

/**
 * Extract token from request Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string|null} token or null
 */
export function extractToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return authHeader;
}

/**
 * Middleware helper: verify request is authenticated
 * Returns the decoded user payload or a 401 NextResponse
 * @param {Request} request
 * @returns {{ user: Object } | { error: NextResponse }}
 */
export function requireAuth(request) {
    const token = extractToken(request);
    if (!token) {
        return {
            error: NextResponse.json(
                { success: false, message: 'Authentication required. Please log in.' },
                { status: 401 }
            ),
        };
    }
    const user = verifyToken(token);
    if (!user) {
        return {
            error: NextResponse.json(
                { success: false, message: 'Session expired or invalid. Please log in again.' },
                { status: 401 }
            ),
        };
    }
    return { user };
}

// ─── Rate Limiting (in-memory, per-process) ────────────────────
// Tracks OTP generation attempts per username and IP
const otpAttempts = new Map(); // key: username|ip -> { count, resetAt }
const MAX_OTP_ATTEMPTS = 5;
const OTP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if OTP generation is rate-limited
 * @param {string} key - username or IP
 * @returns {boolean} true if should be blocked
 */
export function isOtpRateLimited(key) {
    const now = Date.now();
    const entry = otpAttempts.get(key);
    if (!entry || now > entry.resetAt) {
        otpAttempts.set(key, { count: 1, resetAt: now + OTP_WINDOW_MS });
        return false;
    }
    entry.count++;
    if (entry.count > MAX_OTP_ATTEMPTS) {
        return true;
    }
    return false;
}

/**
 * Check if login attempt is rate-limited
 * @param {string} key - username or IP
 * @returns {boolean} true if should be blocked
 */
export function isLoginRateLimited(key) {
    const now = Date.now();
    const entry = loginAttempts.get(key);
    if (!entry || now > entry.resetAt) {
        loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
        return false;
    }
    entry.count++;
    if (entry.count > MAX_LOGIN_ATTEMPTS) {
        return true;
    }
    return false;
}

/**
 * Reset login attempts for a user (on successful login)
 * @param {string} key
 */
export function resetLoginAttempts(key) {
    loginAttempts.delete(key);
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of otpAttempts) {
        if (now > val.resetAt) otpAttempts.delete(key);
    }
    for (const [key, val] of loginAttempts) {
        if (now > val.resetAt) loginAttempts.delete(key);
    }
}, 30 * 60 * 1000);

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP string
 */
export function generateSecureOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash an OTP for secure storage
 * @param {string} otp
 * @returns {string} hashed OTP
 */
export function hashOTP(otp) {
    return crypto.createHash('sha256').update(otp + SECRET).digest('hex');
}

/**
 * Verify an OTP against its hash
 * @param {string} otp - plaintext OTP
 * @param {string} hash - stored hash
 * @returns {boolean}
 */
export function verifyOTPHash(otp, hash) {
    return hashOTP(otp) === hash;
}
