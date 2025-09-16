import { EcSignData, EcVerifySig } from "@justinwwolcott/ez-web-crypto";

/**
 * CryptoSession manages client-side cryptographic operations and session state.
 *
 * Key responsibilities:
 * - Generate and store non-extractable ECDSA key pairs in IndexedDB
 * - Create verification tokens (public key + timestamp + signature)
 * - Store and validate server-issued session tokens as a single string
 * - Sign challenges for authenticated API requests
 * - Validate session integrity on every access
 */
class CryptoSession {
  private db: IDBDatabase | null = null;
  private keyPair: CryptoKeyPair | null = null;

  /**
   * Initialize the crypto session.
   * Must be called before any other operations.
   */
  async init(): Promise<void> {
    this.db = await this.openDB();
    this.keyPair = await this.getKeyPair();
  }

  /**
   * Open IndexedDB connection for storing cryptographic keys.
   * Creates the database and object store if they don't exist.
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("CryptoSessions", 1);

      request.onupgradeneeded = (e) => {
        const db = (e.target as any).result;
        if (!db.objectStoreNames.contains("keys")) {
          db.createObjectStore("keys");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get existing ECDSA key pair from IndexedDB or generate a new one.
   * Private keys are stored as non-extractable for security.
   */
  private async getKeyPair(): Promise<CryptoKeyPair> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) return reject("DB not initialized");

      const tx = this.db.transaction(["keys"], "readwrite");
      const store = tx.objectStore("keys");
      const request = store.get("sessionKey");

      request.onsuccess = async () => {
        if (request.result) {
          // Use existing key pair
          resolve(request.result);
        } else {
          // Generate new ECDSA P-256 key pair
          const keyPair = await crypto.subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            false, // Non-extractable private key for security
            ["sign", "verify"],
          );

          // Store the key pair in IndexedDB
          const putTx = this.db!.transaction(["keys"], "readwrite");
          const putStore = putTx.objectStore("keys");
          putStore.put(keyPair, "sessionKey");

          resolve(keyPair);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Parse session token string into components.
   * Token format: SERVER_PUB.CLIENT_PUB.TTL.SERVER_SIGNATURE
   */
  private parseSessionToken(token: string): {
    serverPublicKey: string;
    clientPublicKey: string;
    expiration: number;
    serverSignature: string;
  } | null {
    const parts = token.split(".");
    if (parts.length !== 4) {
      console.error("Invalid session token format");
      return null;
    }

    const [serverPub, clientPub, ttlString, serverSignature] = parts;
    const ttl = parseInt(ttlString, 10);

    if (isNaN(ttl)) {
      console.error("Invalid TTL in session token");
      return null;
    }

    return {
      serverPublicKey: serverPub,
      clientPublicKey: clientPub,
      expiration: ttl,
      serverSignature: serverSignature,
    };
  }

  /**
   * Validate a session token with comprehensive security checks.
   * This is called EVERY time the session is accessed.
   *
   * Performs three critical validations:
   * 1. TTL validation - ensure session hasn't expired
   * 2. Server signature verification - verify server signed the token data
   * 3. Client key consistency - verify current client has same private key
   */
  private async validateSessionToken(token: string): Promise<boolean> {
    console.log("-".repeat(80));
    console.log("Validating session token...");

    try {
      const sessionData = this.parseSessionToken(token);
      if (!sessionData) {
        console.log("❌ Invalid token format");
        return false;
      }

      // Check 1: TTL validation - ensure session hasn't expired
      if (Date.now() >= sessionData.expiration) {
        console.log("❌ Session validation failed: TTL expired");
        return false;
      }
      console.log("✅ TTL check passed");

      // Check 2: Verify server's signature on the token data
      // Server signed: serverPub.clientPub.ttl
      const serverSignedData = `${sessionData.serverPublicKey}.${sessionData.clientPublicKey}.${sessionData.expiration}`;

      const serverSigValid = await EcVerifySig(
        sessionData.serverPublicKey,
        sessionData.serverSignature,
        btoa(serverSignedData), // Base64 encode the signed data
      );

      if (!serverSigValid) {
        console.log("❌ Session validation failed: Invalid server signature");
        return false;
      }
      console.log("✅ Server signature verification passed");

      // Check 3: Client key consistency validation
      // Sign current timestamp and verify with stored client public key
      const timestampMessage = `session-check-${Date.now()}`;
      const timestampSignature = await this.sign(timestampMessage);

      const clientSigValid = await EcVerifySig(
        sessionData.clientPublicKey,
        timestampSignature,
        btoa(timestampMessage),
      );

      if (!clientSigValid) {
        console.log("❌ Session validation failed: Client key mismatch");
        return false;
      }
      console.log("✅ Client key consistency check passed");

      console.log("✅ All session validation checks passed");
      return true;
    } catch (error) {
      console.error("❌ Session validation error:", error);
      return false;
    }
  }

  /**
   * Get the raw session token from storage.
   * Returns null if no token exists.
   */
  private getRawSessionToken(): string | null {
    return localStorage.getItem("crypto-session");
  }

  /**
   * Emit a custom event when session state changes
   */
  private emitSessionChange(authenticated: boolean): void {
    window.dispatchEvent(
      new CustomEvent("session-changed", {
        detail: { authenticated },
      }),
    );
  }

  /**
   * Export the public key as a base64-encoded string.
   * This is used in verification tokens sent to the server.
   */
  async getPublicKey(): Promise<string> {
    if (!this.keyPair) throw new Error("Not initialized");

    const exported = await crypto.subtle.exportKey(
      "spki",
      this.keyPair.publicKey,
    );
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  /**
   * Sign a message using the stored private key.
   * Returns a base64-encoded signature.
   */
  async sign(message: string): Promise<string> {
    if (!this.keyPair) throw new Error("Not initialized");

    const goodSignature = await EcSignData(
      this.keyPair.privateKey,
      btoa(message),
    );

    return goodSignature;
  }

  /**
   * Create a verification token to prove possession of the private key.
   * Format: publicKey.timestamp.signature
   * Server can verify this token to establish trust.
   */
  async getVerificationToken(): Promise<string> {
    const publicKey = await this.getPublicKey();
    const timeStamp = Date.now();
    const target = `${publicKey}.${timeStamp}`;
    const signature = await this.sign(target);

    return `${target}.${signature}`;
  }

  /**
   * Store a session token received from the server after successful authentication.
   * Token format: SERVER_PUB.CLIENT_PUB.TTL.SERVER_SIGNATURE
   * Stored as a single string, validated on every access.
   */
  async storeSessionToken(sessionToken: string): Promise<void> {
    console.log("Storing session token...");

    try {
      // Validate the token before storing
      if (!(await this.validateSessionToken(sessionToken))) {
        throw new Error("Invalid session token - validation failed");
      }

      // Store as a single string
      localStorage.setItem("crypto-session", sessionToken);

      this.emitSessionChange(true);
      console.log("Session token stored successfully");
    } catch (error) {
      console.error("Failed to store session token:", error);
      throw error;
    }
  }

  /**
   * Get the current session token if it exists and is valid.
   * Performs full validation on every access.
   */
  async getSessionToken(): Promise<string | null> {
    try {
      const token = this.getRawSessionToken();
      if (!token) return null;

      // Validate on every access
      if (!(await this.validateSessionToken(token))) {
        this.logout();
        return null;
      }

      return token;
    } catch (error) {
      console.error("Failed to get session token:", error);
      this.logout(); // Clear corrupted session data
      return null;
    }
  }

  /**
   * Check if the current session is valid (exists and not expired).
   * Performs full validation including signature checks.
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getSessionToken();
    return token !== null;
  }

  /**
   * Get parsed session data for debugging or advanced use cases.
   * Still validates the session before returning data.
   */
  async getSession(): Promise<any> {
    try {
      const token = await this.getSessionToken();
      if (!token) return null;

      return this.parseSessionToken(token);
    } catch (error) {
      console.error("Failed to get session:", error);
      this.logout();
      return null;
    }
  }

  /**
   * Sign a challenge from the server using the stored private key.
   * Used for authenticated API requests.
   * Validates session before signing.
   */
  async signChallenge(challenge: string): Promise<string> {
    if (!(await this.isAuthenticated())) {
      throw new Error("Not authenticated - no valid session");
    }
    return this.sign(challenge);
  }

  /**
   * Get time until session expires (in milliseconds)
   * Returns 0 if no session or already expired
   * Validates session before checking expiration
   */
  async getTimeUntilExpiration(): Promise<number> {
    const token = await this.getSessionToken();
    if (!token) return 0;

    const sessionData = this.parseSessionToken(token);
    if (!sessionData) return 0;

    const timeLeft = sessionData.expiration - Date.now();
    return Math.max(0, timeLeft);
  }

  /**
   * Check if session will expire soon (within specified minutes)
   * Validates session before checking expiration
   */
  async isExpiringSoon(withinMinutes: number = 5): Promise<boolean> {
    const timeLeft = await this.getTimeUntilExpiration();
    return timeLeft > 0 && timeLeft < withinMinutes * 60 * 1000;
  }

  /**
   * Extend session if possible (would require server support)
   */
  async extendSession(): Promise<boolean> {
    // This would need server API support
    console.log("Session extension not yet implemented");
    return false;
  }

  /**
   * Clear the session and log out the user.
   * Removes session data from localStorage but keeps cryptographic keys.
   */
  logout(): void {
    localStorage.removeItem("crypto-session");
    this.emitSessionChange(false);
  }

  /**
   * Completely destroy the session and close database connections.
   * Call this when the app is shutting down.
   */
  destroy(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.keyPair = null;
    this.logout();
  }
}

// Singleton instance to ensure consistent state across the application
let cryptoSession: CryptoSession | null = null;

/**
 * Get the singleton CryptoSession instance.
 * Creates the instance if it doesn't exist.
 */
export const useCryptoSession = () => {
  if (!cryptoSession) {
    cryptoSession = new CryptoSession();
  }
  return cryptoSession;
};
