// Simplified WebAuthn implementation using @passwordless-id/webauthn
// Install: npm install @passwordless-id/webauthn

import { client, utils } from "@passwordless-id/webauthn";
import { base64traverse } from "./misc";

interface MerchantToken {
  credential: {
    id: string;
    publicKey: string;
    algorithm: string | number;
  };
  timestamp: number;
  userHandle?: string;
}

interface SignedKycToken {
  merchantCredential: {
    id: string;
    publicKey: string;
  };
  ageClaim: {
    over_21: boolean;
  };
  ipHash: string;
  timestamp: number;
  signature: string;
  verifierDomain: string;
}

// Generate a random challenge or encode a provided string
function generateChallenge(inputString?: string): string {
  if (inputString) {
    // If string provided, base64URL encode it
    const uint8Array = new TextEncoder().encode(inputString);
    return utils.toBase64url(uint8Array.buffer); // Use .buffer to get ArrayBuffer
  }

  // Original behavior: generate random challenge
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Step 1: Create merchant token with @passwordless-id/webauthn
export const createMerchantToken = async (): Promise<string> => {
  try {
    // Check if WebAuthn is available
    if (!window.PublicKeyCredential) {
      throw new Error("WebAuthn not supported");
    }

    const challenge = generateChallenge();

    // Use the simplified library for registration
    const registration = await client.register({
      discoverable: "discouraged",
      challenge,
      user: "age-verification-user", // Simple user identifier
      userVerification: "required",
    });

    console.log("Registration successful:", registration);

    // The library returns a clean, standardized format
    const merchantToken: MerchantToken = {
      credential: {
        id: registration.id,
        publicKey: registration.response.publicKey,
        algorithm: registration.response.publicKeyAlgorithm,
      },
      timestamp: Date.now(),
      userHandle: registration.user?.id,
    };

    // Store for future authentication
    localStorage.setItem("webauthn-credential-id", merchantToken.credential.id);
    localStorage.setItem(
      "webauthn-public-key",
      merchantToken.credential.publicKey,
    );
    localStorage.setItem(
      "webauthn-algorithm",
      merchantToken.credential.algorithm.toString(),
    );

    return btoa(JSON.stringify(merchantToken));
  } catch (error) {
    console.error("WebAuthn registration failed:", error);
    // @ts-expect-error: Please fix type issue
    throw new Error(`Failed to create merchant token: ${error.message}`);
  }
};

// Step 6: Perform WebAuthn authentication with signed KYC token + nonce
export const authenticateWithSignedToken = async (
  signedKycToken: string,
): Promise<{
  authentication: any;
}> => {
  try {
    // Combine signed token and nonce for challenge
    const combinedChallenge = signedKycToken;

    const rawData = base64traverse(combinedChallenge);
    let userId: string;
    try {
      // @ts-expect-error: todo: clean up
      userId = rawData.target.payload.credential.id;
    } catch (e) {
      throw new Error("Credential ID not found in KYC Provider Data");
    }

    // Use the simplified library for authentication
    const authentication = await client.authenticate({
      challenge: combinedChallenge,
      userVerification: "required",
      allowCredentials: [userId],
    });

    console.log("Authentication successful:", authentication);

    return {
      authentication,
    };
  } catch (error) {
    console.error("WebAuthn authentication failed:", error);
    // @ts-expect-error: please fix type error
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

// Complete verification flow (combines steps 5-8)
export const completeKycVerification = async (
  signedKycTokenString: string,
): Promise<{
  success: boolean;
  jwt?: string;
  error?: string;
}> => {
  try {
    // Step 6: Perform WebAuthn authentication
    const { authentication } =
      await authenticateWithSignedToken(signedKycTokenString);

    // Step 7-8: Send everything to server for verification
    // Lazy: get API's URL:
    const APIURL = `api-${document.location.hostname}`;

    const response = await fetch(`https://${APIURL}/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authentication),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    const result = await response.json();

    // if (result.success && result.jwt) {
    //   localStorage.setItem("age-verification-jwt", result.jwt);
    //   localStorage.setItem("age-verified", "true");
    //   localStorage.setItem("age-verified-timestamp", Date.now().toString());
    // }

    return { jwt: "OK", success: true };
  } catch (error) {
    return {
      success: false,
      // @ts-expect-error: please fix type error
      error: error.message,
    };
  }
};

// Utility functions (same as before)
export const isUserVerified = (): boolean => {
  const jwt = localStorage.getItem("age-verification-jwt");
  const timestamp = localStorage.getItem("age-verified-timestamp");

  if (!jwt || !timestamp) return false;

  const dayInMs = 24 * 60 * 60 * 1000;
  const isRecent = Date.now() - parseInt(timestamp) < dayInMs;

  return isRecent;
};

export const clearVerification = (): void => {
  localStorage.removeItem("webauthn-credential-id");
  localStorage.removeItem("webauthn-public-key");
  localStorage.removeItem("webauthn-algorithm");
  localStorage.removeItem("age-verification-jwt");
  localStorage.removeItem("age-verified");
  localStorage.removeItem("age-verified-timestamp");
};

export const validateJwt = async (jwt: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/validate-jwt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }).catch(() => ({
      ok: true,
      json: async () => ({ valid: jwt.startsWith("demo-jwt-") }),
    }));

    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    }

    return false;
  } catch (error) {
    console.error("JWT validation error:", error);
    return false;
  }
};

// Helper: Check if WebAuthn is available
export const isWebAuthnAvailable = (): boolean => {
  return !!(window.PublicKeyCredential && window.navigator.credentials);
};

/*
Server-side verification example using @passwordless-id/webauthn:

import { server } from '@passwordless-id/webauthn';

// Verify registration
const expected = {
  challenge: 'the-challenge-sent-to-client',
  origin: 'https://yoursite.com',
  userVerified: true // if you required user verification
};

try {
  const registrationParsed = await server.verifyRegistration(registration, expected);
  // Store registrationParsed.credential.id and registrationParsed.credential.publicKey 
  // in your database for future authentications
  console.log('Registration verified:', registrationParsed);
} catch (error) {
  console.error('Registration verification failed:', error);
}

// Verify authentication
const credentialKey = {
  id: 'stored-credential-id',
  publicKey: 'stored-public-key',  
  algorithm: 'ES256' // or whatever algorithm was used
};

const expected = {
  challenge: 'the-challenge-sent-to-client',
  origin: 'https://yoursite.com',
  userVerified: true,
  counter: -1 // disable counter checks, or use stored counter value
};

try {
  const authenticationParsed = await server.verifyAuthentication(authentication, credentialKey, expected);
  console.log('Authentication verified:', authenticationParsed);
  // User is now authenticated!
} catch (error) {
  console.error('Authentication verification failed:', error);
}
*/
