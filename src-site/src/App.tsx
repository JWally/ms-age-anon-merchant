// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import OrderPage from "./components/OrderPage";
import MenuItemPage from "./components/MenuItemPage";
import OrderConfirmationPage from "./components/OrderConfirmationPage";
import ReservationsPage from "./components/ReservationsPage";
import EventsPage from "./components/EventsPage";
import { CartProvider } from "./context/CartContext";

const useRouteComponent = (path: string) =>
  useMemo(() => {
    const pathname = path.split("?")[0];
    if (pathname.startsWith("/menu/")) {
      const id = Number(pathname.split("/")[2]);
      return () => <MenuItemPage menuItemId={id} />;
    }

    switch (pathname) {
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
  const [path, setPath] = useState(
    () => window.location.pathname + window.location.search,
  );
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        if (!active) return;
        if (!response.ok)
          return window.location.replace(
            "/verify?next=" +
              encodeURIComponent(
                window.location.pathname + window.location.search,
              ),
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
      setPath(window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const CurrentPage = useRouteComponent(path);

  return (
    <CartProvider>
      <aside className="demo-notice" aria-label="About this demo">
        <span>Fortress demo · No real orders or reservations.</span>
        <span className="notice-actions">
          <a href="/verification">Your verification</a>
          <a href="/verify">Verify again</a>
        </span>
      </aside>
      <Navbar />
      <CurrentPage />
      <Footer />
    </CartProvider>
  );
};

export default App;
