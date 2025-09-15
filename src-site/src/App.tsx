// src/App.tsx – HornPub with crypto session management
import React, { useEffect, useMemo, useState } from "react";
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

/**
 * Route component resolver - determines which component to render based on current path
 */
const useRouteComponent = (path: string) =>
  useMemo(() => {
    // Handle dynamic menu item routes
    if (path.startsWith("/menu/")) {
      const id = Number(path.split("/")[2]);
      return () => <MenuItemPage menuItemId={id} />;
    }

    // Handle static routes
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
  // Current page path for routing
  const [path, setPath] = useState(() => window.location.pathname);

  // App initialization state - true while setting up crypto session
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Authentication state - separate from isInitializing to handle auth changes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Get singleton crypto session instance
  const cryptoSession = useCryptoSession();

  /**
   * Initialize crypto session and check authentication status
   * This runs once on app load and whenever we need to re-check auth
   */
  const initializeSession = async () => {
    try {
      console.log("Initializing crypto session...");

      // Initialize the crypto session (sets up IndexedDB, keys, etc.)
      await cryptoSession.init();
      console.log("Crypto session initialized successfully");

      // Check current authentication status
      const authStatus = await cryptoSession.isAuthenticated();
      console.log("Authentication status:", authStatus);

      // Log session details for debugging
      const session = await cryptoSession.getSession();
      if (session) {
        console.log("Current session:", {
          expiration: new Date(session.expiration).toISOString(),
          timeUntilExpiry: session.expiration - Date.now(),
          isValid: authStatus,
        });
      } else {
        console.log("No session found");
      }

      // Update authentication state
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Error initializing crypto session:", error);
      // On error, assume not authenticated
      setIsAuthenticated(false);
    } finally {
      // Always finish initialization, even on error
      setIsInitializing(false);
    }
  };

  /**
   * Initial app setup - runs once on component mount
   */
  useEffect(() => {
    initializeSession();

    // Cleanup crypto session when app unmounts
    return () => {
      console.log("App unmounting, destroying crypto session");
      cryptoSession.destroy();
    };
  }, []); // Empty dependency array - run only once

  /**
   * Handle successful age verification
   * Note: Session token storage happens in completeKycVerification(),
   * so we just need to re-check authentication status here
   */
  const handleAgeVerification = async () => {
    try {
      console.log("Age verification completed, re-checking authentication...");

      // Brief delay to ensure session token is fully stored
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Re-check authentication status
      const authStatus = await cryptoSession.isAuthenticated();
      console.log("Post-verification authentication status:", authStatus);

      // Update state to reflect new authentication status
      setIsAuthenticated(authStatus);

      if (authStatus) {
        console.log("User successfully authenticated");
      } else {
        console.warn(
          "Age verification completed but user still not authenticated",
        );
      }
    } catch (error) {
      console.error("Error handling age verification:", error);
      setIsAuthenticated(false);
    }
  };

  /**
   * Handle age verification cancellation (user clicks "I'm under 21")
   */
  const handleVerificationCancel = () => {
    console.log("Age verification cancelled, redirecting user");

    // Clear any partial session state
    cryptoSession.logout();

    // Redirect away from the app
    window.location.href = "https://www.google.com";
  };

  /**
   * Handle browser navigation (back/forward buttons)
   */
  useEffect(() => {
    const handlePopState = () => {
      console.log("Navigation detected:", window.location.pathname);
      setPath(window.location.pathname);

      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /**
   * Periodically check authentication status to handle external changes
   * (like manual localStorage deletion or session expiration)
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      const currentAuth = await cryptoSession.isAuthenticated();
      if (currentAuth !== isAuthenticated) {
        console.log("Authentication status changed:", currentAuth);
        setIsAuthenticated(currentAuth);
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkAuthStatus, 5000);

    // Also check when window gains focus (user comes back to tab)
    const handleFocus = () => {
      console.log("Window focused, checking auth status");
      checkAuthStatus();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, cryptoSession]);

  // Get the component to render for current path
  const CurrentPage = useRouteComponent(path);

  /**
   * RENDER LOGIC
   */

  // Show loading screen while initializing crypto session
  if (isInitializing) {
    console.log("Rendering initialization screen");
    return (
      <div className="warm-gradient min-h-screen flex items-center justify-center">
        <div
          className="text-4xl font-bold"
          style={{ color: "var(--warm-brown)" }}
        >
          Loading HornPub...
        </div>
      </div>
    );
  }

  // Show age verification modal if user is not authenticated
  if (!isAuthenticated) {
    console.log("Rendering age verification modal");
    return (
      <div className="warm-gradient min-h-screen">
        <AgeVerificationModal
          onVerify={handleAgeVerification}
          onCancel={handleVerificationCancel}
        />
      </div>
    );
  }

  // Show main application if user is authenticated
  console.log("Rendering main application");
  return (
    <CartProvider>
      <Navbar />
      <CurrentPage />
    </CartProvider>
  );
};

export default App;
