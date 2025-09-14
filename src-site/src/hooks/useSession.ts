// hooks/useSession.ts
import { useState, useEffect, useCallback } from "react";

const generateSessionId = (): string => {
  return (
    Math.random().toString().replace(/\./g, "") +
    "-" +
    Math.random().toString().replace(/\./g, "")
  );
};

interface UseSessionReturn {
  sessionId: string;
  clearSession: () => void;
  refreshSession: () => void;
}

export const useSession = (): UseSessionReturn => {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const existingSessionId = sessionStorage.getItem("session-id");
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = generateSessionId();
      sessionStorage.setItem("session-id", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem("session-id");
    setSessionId("");
  }, []);

  const refreshSession = useCallback(() => {
    const newSessionId = generateSessionId();
    sessionStorage.setItem("session-id", newSessionId);
    setSessionId(newSessionId);
  }, []);

  return {
    sessionId,
    clearSession,
    refreshSession,
  };
};
