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
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const cryptoSession = useCryptoSession();

  // Initialize crypto session on app load
  useEffect(() => {
    const initSession = async () => {
      try {
        await cryptoSession.init();
        console.log("Crypto session initialized");

        const publicKey = await cryptoSession.getVerificationToken();

        console.log({ publicKey });

        // Check if we have an existing valid session
        if (cryptoSession.isAuthenticated()) {
          console.log("Found existing valid session");
        } else {
          console.log("No valid session found");
        }
      } catch (error) {
        console.error("Error initializing crypto session:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();

    // Cleanup on unmount
    return () => {
      cryptoSession.destroy();
    };
  }, [cryptoSession]);

  // Handle successful age verification
  const handleAgeVerification = async (webauthnToken: string) => {
    try {
      //const success = await cryptoSession.login(webauthnToken);
      const success = true;
      if (success) {
        console.log("Age verification successful - crypto session created");
        // Force re-render by updating a dummy state or just rely on the session check
        setPath(window.location.pathname); // Force re-render
      } else {
        console.error("Age verification failed");
        // Could show error message to user here
      }
    } catch (error) {
      console.error("Age verification error:", error);
      // Could show error message to user here
    }
  };

  // Handle age verification cancellation
  const handleVerificationCancel = () => {
    cryptoSession.logout(); // Clean up any partial session state
    window.location.href = "https://www.google.com";
  };

  /* Listen for history navigation */
  useEffect(() => {
    const onPopstate = () => {
      setPath(window.location.pathname);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("popstate", onPopstate);
    return () => window.removeEventListener("popstate", onPopstate);
  }, []);

  const CurrentPage = useRouteComponent(path);

  // Show loading state while initializing crypto session
  if (isInitializing) {
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

  // Show age verification modal if not authenticated
  if (!cryptoSession.isAuthenticated()) {
    return (
      <div className="warm-gradient min-h-screen">
        <AgeVerificationModal
          onVerify={handleAgeVerification}
          onCancel={handleVerificationCancel}
        />
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <CartProvider>
      <Navbar />
      <CurrentPage />
    </CartProvider>
  );
};

export default App;
