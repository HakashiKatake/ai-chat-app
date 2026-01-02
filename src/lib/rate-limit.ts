/**
 * Simple in-memory rate limiter
 * 
 * For production, use Redis-based rate limiting
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    windowMs: number;    // Time window in milliseconds
    maxRequests: number; // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 20,      // 20 requests per minute
};

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number; // seconds until reset
}

/**
 * Check if a request is allowed under rate limiting
 * @param identifier - Unique identifier (usually user ID)
 * @param config - Optional custom rate limit config
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // If no entry or expired, create new
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: Math.ceil(config.windowMs / 1000),
        };
    }

    // Check if under limit
    if (entry.count < config.maxRequests) {
        entry.count++;
        return {
            allowed: true,
            remaining: config.maxRequests - entry.count,
            resetIn: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    // Rate limited
    return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
