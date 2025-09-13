// src/App.tsx – HornPub with simplified age verification
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
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [isCheckingVerification, setIsCheckingVerification] =
    useState<boolean>(true);

  // Check for existing age verification on app load
  useEffect(() => {
    const checkAgeVerification = async () => {
      try {
        // Check localStorage for existing JWT
        const storedJwt = localStorage.getItem("age-verification-jwt");

        if (storedJwt) {
          // Validate the JWT with server (or use demo validation)
          const { validateJwt } = await import("./utils/webauthn");
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

  // Handle successful age verification
  const handleAgeVerification = (jwt: string) => {
    // Store JWT and mark as verified
    localStorage.setItem("age-verification-jwt", jwt);
    localStorage.setItem("age-verified", "true");
    localStorage.setItem("age-verified-timestamp", Date.now().toString());
    setIsAgeVerified(true);
  };

  // Handle age verification cancellation
  const handleVerificationCancel = () => {
    // Redirect to a safe site
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

  // Show loading state while checking verification
  if (isCheckingVerification) {
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

  // Show age verification modal if not verified
  if (!isAgeVerified) {
    return (
      <div className="warm-gradient min-h-screen">
        <AgeVerificationModal
          onVerify={handleAgeVerification}
          onCancel={handleVerificationCancel}
        />
      </div>
    );
  }

  // Show main app if age verified
  return (
    <CartProvider>
      <Navbar />
      <CurrentPage />
    </CartProvider>
  );
};

export default App;
