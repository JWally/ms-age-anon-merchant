// hooks/useWebAuthn.ts
import { useState, useCallback } from "react";
import {
  createMerchantToken,
  completeKycVerification,
} from "../utils/webauthn";

interface UseWebAuthnReturn {
  // State
  merchantToken: string;
  signedKycToken: string;
  isCreatingToken: boolean;
  isVerifying: boolean;
  error: string;
  showMerchantToken: boolean;
  tokenCopied: boolean;

  // Actions
  createToken: () => Promise<void>;
  verifyToken: () => Promise<{
    success: boolean;
    jwt?: string;
    error?: string;
  }>;
  setSignedKycToken: (token: string) => void;
  copyToken: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useWebAuthn = (): UseWebAuthnReturn => {
  const [merchantToken, setMerchantToken] = useState("");
  const [signedKycToken, setSignedKycToken] = useState("");
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [showMerchantToken, setShowMerchantToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const createToken = useCallback(async () => {
    setIsCreatingToken(true);
    setError("");

    try {
      const token = await createMerchantToken();
      setMerchantToken(token);
      setShowMerchantToken(true);
    } catch (err) {
      //@ts-expect-error: todo -> err.message err:any
      setError(`Failed to create token: ${err.message}`);
    } finally {
      setIsCreatingToken(false);
    }
  }, []);

  const verifyToken = useCallback(async () => {
    if (!signedKycToken.trim()) {
      setError("Please paste the signed token from your bank");
      return { success: false, error: "Missing signed token" };
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await completeKycVerification(signedKycToken);
      return result;
    } catch (err) {
      //@ts-expect-error: todo -> err.message err:any
      const errorMsg = `Verification error: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsVerifying(false);
    }
  }, [signedKycToken]);

  const copyToken = useCallback(() => {
    navigator.clipboard.writeText(merchantToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  }, [merchantToken]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const reset = useCallback(() => {
    setMerchantToken("");
    setSignedKycToken("");
    setError("");
    setShowMerchantToken(false);
    setTokenCopied(false);
  }, []);

  return {
    merchantToken,
    signedKycToken,
    isCreatingToken,
    isVerifying,
    error,
    showMerchantToken,
    tokenCopied,
    createToken,
    verifyToken,
    setSignedKycToken,
    copyToken,
    clearError,
    reset,
  };
};
