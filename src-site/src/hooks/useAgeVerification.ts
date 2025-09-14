// hooks/useAgeVerification.ts - For App.tsx logic
import { useState, useEffect, useCallback } from "react";
import { validateJwt } from "../utils/webauthn";

interface UseAgeVerificationReturn {
  isAgeVerified: boolean;
  isCheckingVerification: boolean;
  handleAgeVerification: (jwt: string) => void;
  handleVerificationCancel: () => void;
}

export const useAgeVerification = (): UseAgeVerificationReturn => {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  useEffect(() => {
    const checkAgeVerification = async () => {
      try {
        const storedJwt = localStorage.getItem("age-verification-jwt");

        if (storedJwt) {
          const isValid = await validateJwt(storedJwt);
          setIsAgeVerified(isValid);
        } else {
          setIsAgeVerified(false);
        }
      } catch (error) {
        console.error("Error checking age verification:", error);
        setIsAgeVerified(false);
      } finally {
        setIsCheckingVerification(false);
      }
    };

    checkAgeVerification();
  }, []);

  const handleAgeVerification = useCallback((jwt: string) => {
    localStorage.setItem("age-verification-jwt", jwt);
    localStorage.setItem("age-verified", "true");
    localStorage.setItem("age-verified-timestamp", Date.now().toString());
    setIsAgeVerified(true);
  }, []);

  const handleVerificationCancel = useCallback(() => {
    window.location.href = "https://www.google.com";
  }, []);

  return {
    isAgeVerified,
    isCheckingVerification,
    handleAgeVerification,
    handleVerificationCancel,
  };
};
