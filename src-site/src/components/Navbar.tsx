import React, { useContext, useState } from "react";
import Link from "./Link";
import { CartContext } from "../context/CartContext";
export default function Navbar() {
  const { cart } = useContext(CartContext)!;
  const count = cart.reduce((n, x) => n + x.quantity, 0);
  const [open, setOpen] = useState(false);
  return (
    <header className="pub-header">
      <div className="page-width nav-inner">
        <Link to="/" className="pub-logo" aria-label="HornPub home">
          Horn<span>Pub</span>
          <small>GRILL · BAR · GOOD TIMES</small>
        </Link>
        <nav
          className={open ? "pub-nav is-open" : "pub-nav"}
          aria-label="Primary"
        >
          <Link to="/menu" onClick={() => setOpen(false)}>
            The menu
          </Link>
          <Link to="/reservations" onClick={() => setOpen(false)}>
            Grab a table
          </Link>
          <Link to="/events" onClick={() => setOpen(false)}>
            Live music
          </Link>
        </nav>
        <div className="nav-actions">
          <Link to="/cart" className="tab-button">
            Your tab <span>{count}</span>
          </Link>
          <button
            className="mobile-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((x) => !x)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
