// src/App.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import OrderPage from "./components/OrderPage";
import MenuItemPage from "./components/MenuItemPage";
import OrderConfirmationPage from "./components/OrderConfirmationPage";
import ReservationsPage from "./components/ReservationsPage";
import EventsPage from "./components/EventsPage";
import AgeVerificationModal from "./components/AgeVerificationModal";
import { CartProvider } from "./context/CartContext";
import { useCryptoSession } from "./utils/cryptoSession";
import { useSessionMonitor } from "./hooks/useSessionMonitor";

const useRouteComponent = (path: string) =>
  useMemo(() => {
    if (path.startsWith("/menu/")) {
      const id = Number(path.split("/")[2]);
      return () => <MenuItemPage menuItemId={id} />;
    }

    switch (path) {
      case "/order":
      case "/cart":
        return OrderPage;
      case "/order-confirmation":
      case "/order-summary":
        return OrderConfirmationPage;
      case "/reservations":
        return ReservationsPage;
      case "/events":
        return EventsPage;
      default:
        return HomePage;
    }
  }, [path]);

const App: React.FC = () => {
  const [path, setPath] = useState(() => window.location.pathname);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const cryptoSession = useCryptoSession();

  /**
   * Handle session state changes - called immediately when session changes
   */
  const handleSessionChange = useCallback((authStatus: boolean) => {
    console.log("Session status changed immediately:", authStatus);
    setIsAuthenticated(authStatus);
  }, []);

  // Monitor session changes (handles immediate, cross-tab, and expiration)
  useSessionMonitor({ onSessionChange: handleSessionChange });

  /**
   * Initialize crypto session on mount
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await cryptoSession.init();
        const authStatus = await cryptoSession.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error("Error initializing:", error);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    return () => {
      cryptoSession.destroy();
    };
  }, []);

  /**
   * Handle browser navigation
   */
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /**
   * Handle successful age verification
   * No need to manually update state - the session-changed event will handle it
   */
  const handleAgeVerification = () => {
    console.log("Age verification completed - session event will update state");
    // The storeSessionToken call in completeKycVerification will emit an event
    // That event will immediately call handleSessionChange(true)
  };

  /**
   * Handle age verification cancellation
   */
  const handleVerificationCancel = () => {
    cryptoSession.logout(); // This will emit session-changed event
    window.location.href = "https://www.google.com";
  };

  const CurrentPage = useRouteComponent(path);

  if (isInitializing) {
    return (
      <div className="warm-gradient min-h-screen flex items-center justify-center">
        <div
          className="text-4xl font-bold animate-pulse"
          style={{ color: "var(--warm-brown)" }}
        >
          Loading HornPub...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="warm-gradient min-h-screen">
        <AgeVerificationModal
          onVerify={handleAgeVerification}
          onCancel={handleVerificationCancel}
        />
      </div>
    );
  }

  return (
    <CartProvider>
      <Navbar />
      <CurrentPage />
    </CartProvider>
  );
};

export default App;
