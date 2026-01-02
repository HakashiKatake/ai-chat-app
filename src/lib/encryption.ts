/**
 * Message Encryption Utility
 * 
 * Uses AES-256-GCM encryption for message content.
 * The encryption key is derived from ENCRYPTION_KEY environment variable.
 * 
 * Format: iv:authTag:encryptedContent (all base64 encoded)
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = "ai-chat-app-salt"; // Static salt for key derivation

function getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret) {
        throw new Error("ENCRYPTION_KEY environment variable is not set");
    }
    // Derive a 32-byte key from the secret using scrypt
    return scryptSync(secret, SALT, 32);
}

/**
 * Encrypt a message
 * @param plaintext - The message content to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (base64)
 */
export function encryptMessage(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    // Combine IV, auth tag, and ciphertext
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypt a message
 * @param encryptedString - The encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext message
 */
export function decryptMessage(encryptedString: string): string {
    const key = getEncryptionKey();

    const parts = encryptedString.split(":");
    if (parts.length !== 3) {
        // If not in expected format, return as-is (for backward compatibility)
        return encryptedString;
    }

    const [ivBase64, authTagBase64, ciphertext] = parts;

    try {
        const iv = Buffer.from(ivBase64, "base64");
        const authTag = Buffer.from(authTagBase64, "base64");

        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext, "base64", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        // Return encrypted string if decryption fails (wrong key, corrupted data, etc.)
        return encryptedString;
    }
}

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
    return !!process.env.ENCRYPTION_KEY;
}

/**
 * Safely encrypt - returns plaintext if encryption is not configured
 */
export function safeEncrypt(plaintext: string): string {
    if (!isEncryptionEnabled()) {
        return plaintext;
    }
    return encryptMessage(plaintext);
}

/**
 * Safely decrypt - handles unencrypted messages gracefully
 */
export function safeDecrypt(content: string): string {
    if (!isEncryptionEnabled()) {
        return content;
    }
    // Check if it looks like an encrypted message (has the format iv:tag:content)
    if (!content.includes(":") || content.split(":").length !== 3) {
        return content;
    }
    return decryptMessage(content);
}
