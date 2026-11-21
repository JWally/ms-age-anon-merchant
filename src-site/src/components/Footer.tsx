import React from "react";
import Link from "./Link";
export default function Footer() {
  return (
    <footer className="pub-footer">
      <div className="page-width">
        <div className="footer-top">
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
