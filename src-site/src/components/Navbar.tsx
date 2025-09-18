import React, { useContext, useState, useEffect } from "react";
import Link from "./Link";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
  const { cart } = useContext(CartContext)!;
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav
        className="warm-gradient shadow-lg relative z-50 border-b-2"
        style={{ borderColor: "var(--warm-orange)" }}
        aria-label="Primary"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="font-bold text-3xl flex items-center gap-3 transform hover:scale-105 transition-all duration-300"
                style={{ color: "var(--warm-brown)" }}
              >
                <span className="font-serif tracking-wider">HornPub</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Menu
              </Link>

              <Link
                to="/reservations"
                className="font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Reservations
              </Link>

              <Link
                to="/events"
                className="font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Live Music
              </Link>

              <Link
                to="/cart"
                className="btn-warm-primary px-6 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                Order ({itemCount})
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="relative w-12 h-12 flex items-center justify-center transition-all duration-300 group rounded-lg"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Toggle menu"
                aria-controls="mobile-menu"
              >
                <div className="relative w-6 h-6 flex flex-col justify-center space-y-1.5">
                  <span
                    className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                      isMenuOpen ? "rotate-45 translate-y-2" : ""
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                      isMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                      isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div
          className="h-1"
          style={{ backgroundColor: "var(--warm-orange)", opacity: 0.6 }}
        ></div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeMenu}
        ></div>
      )}

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 md:hidden transition-all duration-500 ease-out ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div
          className="warm-card-gradient shadow-2xl overflow-hidden"
          style={{ borderTop: "1px solid var(--border-warm)" }}
        >
          <div className="px-6 py-6 space-y-3">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="px-5 py-4 rounded-xl transition-all duration-300 font-medium"
                style={{ color: "var(--text-secondary)" }}
                onClick={closeMenu}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Menu
              </Link>

              <Link
                to="/reservations"
                className="px-5 py-4 rounded-xl transition-all duration-300 font-medium"
                style={{ color: "var(--text-secondary)" }}
                onClick={closeMenu}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Reservations
              </Link>

              <Link
                to="/events"
                className="px-5 py-4 rounded-xl transition-all duration-300 font-medium"
                style={{ color: "var(--text-secondary)" }}
                onClick={closeMenu}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Live Music
              </Link>

              <Link
                to="/cart"
                className="px-5 py-4 rounded-xl transition-all duration-300 font-medium"
                style={{ color: "var(--text-secondary)" }}
                onClick={closeMenu}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--warm-cream)";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <div className="flex items-center justify-between">
                  <span>Your Order</span>
                  <span
                    className="px-3 py-1 rounded-full text-lg font-bold shadow-lg"
                    style={{
                      backgroundColor: "var(--warm-orange)",
                      color: "white",
                    }}
                  >
                    {itemCount}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
