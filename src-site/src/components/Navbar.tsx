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
          <img
            className="trumpet"
            src="/brand/hornpub-trumpet.png"
            width="64"
            height="64"
            alt=""
          />
          <span>
            HornPub<small>GRILL · BAR · GOOD TIMES</small>
          </span>
        </Link>
        <button
          className="mobile-toggle"
          aria-controls="primary-navigation"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((x) => !x)}
        >
          {open ? "×" : "☰"}
        </button>
        <nav
          className={open ? "pub-nav is-open" : "pub-nav"}
          id="primary-navigation"
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
          <Link
            to="/cart"
            className="tab-button"
            onClick={() => setOpen(false)}
          >
            Your tab <span>{count}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
