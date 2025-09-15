// src/hooks/useSessionMonitor.ts
import { useEffect, useCallback } from "react";
import { useCryptoSession } from "../utils/cryptoSession";

interface UseSessionMonitorProps {
  onSessionChange: (isAuthenticated: boolean) => void;
}

export const useSessionMonitor = ({
  onSessionChange,
}: UseSessionMonitorProps) => {
  const cryptoSession = useCryptoSession();

  const checkSession = useCallback(async () => {
    const isAuth = await cryptoSession.isAuthenticated();
    onSessionChange(isAuth);
  }, [cryptoSession, onSessionChange]);

  useEffect(() => {
    // 1. Listen for custom session-changed events (same tab)
    const handleSessionChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("Session changed event:", customEvent.detail);
      onSessionChange(customEvent.detail.authenticated);
    };

    // 2. Listen for storage events (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "crypto-session") {
        console.log("Session storage changed in another tab");
        checkSession();
      }
    };

    // 3. Check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    // 4. Periodic expiration check (every 60 seconds)
    const intervalId = setInterval(checkSession, 60000);

    // Add all listeners
    window.addEventListener("session-changed", handleSessionChange);
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("session-changed", handleSessionChange);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkSession, onSessionChange]);
};
