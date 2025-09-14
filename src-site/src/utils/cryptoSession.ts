import { EcSignData } from "@justinwwolcott/ez-web-crypto";

// utils/cryptoSession.ts - Simple crypto session manager
class CryptoSession {
  private db: IDBDatabase | null = null;
  private keyPair: CryptoKeyPair | null = null;
  private session: any = null;

  // Initialize - call this first
  async init(): Promise<void> {
    this.db = await this.openDB();
    this.keyPair = await this.getKeyPair();
    this.session = this.loadSession();
  }

  // Open IndexedDB
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

  // Get or create ECDSA key pair
  private async getKeyPair(): Promise<CryptoKeyPair> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) return reject("DB not initialized");

      const tx = this.db.transaction(["keys"], "readwrite");
      const store = tx.objectStore("keys");
      const request = store.get("sessionKey");

      request.onsuccess = async () => {
        if (request.result) {
          resolve(request.result);
        } else {
          // Generate new key pair
          const keyPair = await crypto.subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            false, // Non-extractable private key
            ["sign", "verify"],
          );

          // Store it
          const putTx = this.db!.transaction(["keys"], "readwrite");
          const putStore = putTx.objectStore("keys");
          putStore.put(keyPair, "sessionKey");

          resolve(keyPair);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Export public key as base64
  async getPublicKey(): Promise<string> {
    if (!this.keyPair) throw new Error("Not initialized");

    const exported = await crypto.subtle.exportKey(
      "spki",
      this.keyPair.publicKey,
    );
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  // Sign a message with private key
  async sign(message: string): Promise<string> {
    if (!this.keyPair) throw new Error("Not initialized");

    const goodSignature = await EcSignData(
      this.keyPair.privateKey,
      btoa(message),
    );

    return goodSignature;
  }

  // Create a signed token thing
  async getVerificationToken(): Promise<string> {
    const publicKey = await this.getPublicKey();

    const timeStamp = Date.now();

    const target = `${publicKey}.${timeStamp}`;

    const signature = await this.sign(target);

    return `${target}.${signature}`;
  }

  // Load existing session from localStorage
  private loadSession(): any {
    try {
      const stored = localStorage.getItem("crypto-session");
      if (!stored) return null;

      const session = JSON.parse(stored);

      // Check if expired
      if (Date.now() > session.expiration) {
        localStorage.removeItem("crypto-session");
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  // Check if currently authenticated
  isAuthenticated(): boolean {
    return this.session && Date.now() < this.session.expiration;
  }

  // Get session info
  getSession(): any {
    return this.session;
  }

  // Logout - clear everything
  logout(): void {
    this.session = null;
    localStorage.removeItem("crypto-session");
  }

  // Sign a challenge for API calls
  async signChallenge(challenge: string): Promise<string> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    return this.sign(challenge);
  }

  // Cleanup
  destroy(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.keyPair = null;
    this.session = null;
  }
}

// Singleton instance
let cryptoSession: CryptoSession | null = null;

// Simple API
export const useCryptoSession = () => {
  if (!cryptoSession) {
    cryptoSession = new CryptoSession();
  }
  return cryptoSession;
};

// Usage example:
/*
import { useCryptoSession } from './utils/cryptoSession';

const session = useCryptoSession();

// Initialize on app start
await session.init();

// Login after WebAuthn
const success = await session.login(webauthnToken);
if (success) {
  console.log('Logged in!');
}

// Check auth status
if (session.isAuthenticated()) {
  console.log('User is authenticated');
}

// Sign API challenges
const signature = await session.signChallenge('some-server-challenge');

// Logout
session.logout();
*/
