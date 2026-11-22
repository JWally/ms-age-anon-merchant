import React, { useContext, useRef, useState } from "react";
import Link from "./Link";
import { CartContext } from "../context/CartContext";
export default function Navbar() {
  const { cart } = useContext(CartContext)!;
  const count = cart.reduce((n, x) => n + x.quantity, 0);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header
      className="pub-header"
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="page-width nav-inner">
        <Link to="/" className="pub-logo">
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
          <span className="sr-only">home</span>
        </Link>
        <button
          className="mobile-toggle"
          ref={toggle}
          aria-controls="primary-navigation"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((x) => !x)}
        >
          <span aria-hidden="true">{open ? "×" : "☰"}</span>
          <span className="menu-toggle-text">Menu</span>
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
