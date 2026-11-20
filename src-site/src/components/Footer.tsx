import React from "react";
import Link from "./Link";
export default function Footer() {
  return (
    <footer className="pub-footer">
      <div className="page-width">
        <div className="footer-top">
          <Link to="/" className="pub-logo">
            Horn<span>Pub</span>
            <small>YOUR NEW OLD FAVORITE.</small>
          </Link>
          <p>
            A seat at the bar. Something good on the table.
            <br />
            That’s our kind of night.
          </p>
          <nav aria-label="Footer">
            <Link to="/menu">Menu</Link>
            <Link to="/events">Live music</Link>
            <a href="/verification">Your verification</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>HornPub · A Fortress demo</span>
          <span>
            Illustrative menu photography. No real orders or reservations.
          </span>
        </div>
      </div>
    </footer>
  );
}
