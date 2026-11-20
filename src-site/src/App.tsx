// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import OrderPage from "./components/OrderPage";
import MenuItemPage from "./components/MenuItemPage";
import OrderConfirmationPage from "./components/OrderConfirmationPage";
import ReservationsPage from "./components/ReservationsPage";
import EventsPage from "./components/EventsPage";
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
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        if (!active) return;
        if (!response.ok)
          return window.location.replace(
            "/verify?next=" + encodeURIComponent(window.location.pathname),
          );
        const { expiresAt } = await response.json();
        clearTimeout(timer);
        timer = setTimeout(check, Math.max(0, expiresAt - Date.now()));
      } catch {
        if (active) timer = setTimeout(check, 10000);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
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

  const CurrentPage = useRouteComponent(path);

  return (
    <CartProvider>
      <div className="demo-notice">
        Fortress demo · No real orders or reservations.{" "}
        <a href="/verification">Your verification</a> ·{" "}
        <button onClick={() => window.location.assign("/verify")}>
          Verify again
        </button>
      </div>
      <Navbar />
      <CurrentPage />
    </CartProvider>
  );
};

export default App;
