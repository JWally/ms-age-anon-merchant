// Simplified WebAuthn implementation using @passwordless-id/webauthn
// Install: npm install @passwordless-id/webauthn

import { client, utils } from "@passwordless-id/webauthn";
import { base64traverse } from "./misc";
import { useCryptoSession } from "./cryptoSession";

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
    const cryptoSession = useCryptoSession();

    const sessionToken = await cryptoSession.getVerificationToken();

    // Step 6: Perform WebAuthn authentication
    const { authentication } =
      await authenticateWithSignedToken(signedKycTokenString);

    // Step 7-8: Send everything to server for verification
    // Lazy: get API's URL:
    const APIURL = `api-${document.location.hostname}`;

    const response = await fetch(`https://${APIURL}/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-verification-token": sessionToken,
      },
      body: JSON.stringify(authentication),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    const result = await response.json();

    cryptoSession.storeSessionToken(result.sessionToken);

    return { ...result, success: true };
  } catch (error) {
    return {
      success: false,
      // @ts-expect-error: please fix type error
      error: error.message,
    };
  }
};

// Helper: Check if WebAuthn is available
export const isWebAuthnAvailable = (): boolean => {
  return !!(window.PublicKeyCredential && window.navigator.credentials);
};
