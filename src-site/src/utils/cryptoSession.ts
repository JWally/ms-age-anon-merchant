import { EcSignData, EcVerifySig } from "@justinwwolcott/ez-web-crypto";

/**
 * CryptoSession manages client-side cryptographic operations and session state.
 *
 * Key responsibilities:
 * - Generate and store non-extractable ECDSA key pairs in IndexedDB
 * - Create verification tokens (public key + timestamp + signature)
 * - Store and validate server-issued session tokens
 * - Sign challenges for authenticated API requests
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
   * Validate a session token with three security checks:
   * 1. TTL validation - ensure session hasn't expired
   * 2. Server signature verification - verify server signed the token data
   * 3. Client key consistency - verify current client has same private key
   */
  async isValidSession(session: unknown, target: string): Promise<boolean> {
    console.log("-".repeat(80));
    console.log({ session });

    try {
      // Type assertion for the session data structure
      const sessionData = session as {
        token: string;
        serverPublicKey: string;
        clientPublicKey: string;
        expiration: number;
        serverSignature: string;
        storedAt: number;
      };

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
      // Sign a test message with current private key and verify with stored client public key
      // This ensures the current session has the same key pair that was originally authenticated
      const testMessage = `session-validation-${Date.now()}`;
      const testSignature = await this.sign(testMessage);

      const clientSigValid = await EcVerifySig(
        sessionData.clientPublicKey,
        testSignature,
        btoa(testMessage),
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
   * Token format: SERVER_PUB.CLIENT_PUB.SERVER_TTL.SERVER_SIGNATURE
   */
  storeSessionToken(sessionToken: string): void {
    console.log("SETTING STORAGE TOKEN!!!");
    try {
      // Parse the session token to extract TTL
      const parts = sessionToken.split(".");
      if (parts.length !== 4) {
        throw new Error("Invalid session token format");
      }

      const [serverPub, clientPub, ttlString, serverSignature] = parts;
      const ttl = parseInt(ttlString, 10);

      if (isNaN(ttl)) {
        throw new Error("Invalid TTL in session token");
      }

      // Store the session with expiration time
      const sessionData = {
        token: sessionToken,
        serverPublicKey: serverPub,
        clientPublicKey: clientPub,
        expiration: ttl, // TTL is already a timestamp
        serverSignature: serverSignature,
        storedAt: Date.now(),
      };

      localStorage.setItem("crypto-session", JSON.stringify(sessionData));

      this.emitSessionChange(true);
    } catch (error) {
      console.error("Failed to store session token:", error);
      throw error;
    }
  }

  /**
   * Get the current session token if it exists and is valid.
   */
  async getSessionToken(): Promise<string | null> {
    try {
      const stored = localStorage.getItem("crypto-session");
      if (!stored) return null;

      const session = JSON.parse(stored);

      // Check if the session has expired
      if (Date.now() > session.expiration) {
        this.logout();
        return null;
      }

      if (!(await this.isValidSession(session, stored))) {
        this.logout();
        return null;
      }

      return session.token;
    } catch (error) {
      console.error("Failed to get session token:", error);
      this.logout(); // Clear corrupted session data
      return null;
    }
  }

  /**
   * Check if the current session is valid (exists and not expired).
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getSessionToken();
    return token !== null;
  }

  /**
   * Get the full session data for debugging or advanced use cases.
   */
  async getSession(): Promise<any> {
    try {
      const stored = localStorage.getItem("crypto-session");
      if (!stored) return null;

      const session = JSON.parse(stored);

      // Check if expired
      if (Date.now() > session.expiration) {
        this.logout();
        return null;
      }

      if (!(await this.isValidSession(session, stored))) {
        this.logout();
        return null;
      }

      return session;
    } catch (error) {
      console.error("Failed to get session:", error);
      this.logout();
      return null;
    }
  }

  /**
   * Sign a challenge from the server using the stored private key.
   * Used for authenticated API requests.
   */
  async signChallenge(challenge: string): Promise<string> {
    if (!(await this.isAuthenticated())) {
      throw new Error("Not authenticated - no valid session");
    }
    return this.sign(challenge);
  }

  /**
   * Clear the session and log out the user.
   * Removes session data from localStorage but keeps cryptographic keys.
   */
  logout(): void {
    localStorage.removeItem("crypto-session");
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

  // Add to CryptoSession class in utils/cryptoSession.ts

  /**
   * Get time until session expires (in milliseconds)
   * Returns 0 if no session or already expired
   */
  async getTimeUntilExpiration(): Promise<number> {
    const session = await this.getSession();
    if (!session) return 0;

    const timeLeft = session.expiration - Date.now();
    return Math.max(0, timeLeft);
  }

  /**
   * Check if session will expire soon (within specified minutes)
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
