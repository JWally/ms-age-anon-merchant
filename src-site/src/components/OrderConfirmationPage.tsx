import React, { useEffect, useState } from "react";

function OrderConfirmationPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderNumber] = useState(() => Math.floor(Math.random() * 1000) + 1000);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session-id");
    if (sid) {
      setSessionId(sid);
    }
  }, []);

  return (
    <div className="warm-gradient min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div
            className="text-8xl mb-6"
            style={{ color: "var(--warm-orange)" }}
          >
            ✓
          </div>
          <h1
            className="text-5xl font-bold mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Order Confirmed!
          </h1>
          <p className="text-2xl" style={{ color: "var(--text-secondary)" }}>
            Thank you for dining with HornPub
          </p>
        </div>

        {/* Order Details */}
        <div
          className="warm-card-gradient rounded-xl p-10 mb-10 shadow-lg text-center"
          style={{ border: "1px solid var(--border-warm)" }}
        >
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Order Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: "var(--warm-cream)" }}
            >
              <h3
                className="font-semibold text-lg mb-2"
                style={{ color: "var(--warm-orange)" }}
              >
                Order Number
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                #{orderNumber}
              </p>
            </div>

            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: "var(--warm-cream)" }}
            >
              <h3
                className="font-semibold text-lg mb-2"
                style={{ color: "var(--warm-orange)" }}
              >
                Estimated Time
              </h3>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                15-25 min
              </p>
            </div>
          </div>

          {sessionId && (
            <div
              className="p-6 rounded-lg mb-6"
              style={{
                backgroundColor: "var(--warm-cream)",
                border: "1px solid var(--border-warm)",
              }}
            >
              <p
                className="text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Reference ID
              </p>
              <p
                className="font-mono text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                {sessionId}
              </p>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div
          className="warm-card-gradient rounded-xl p-10 mb-10 shadow-lg"
          style={{ border: "1px solid var(--border-warm)" }}
        >
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: "var(--warm-brown)" }}
          >
            What's Next?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div
                className="text-6xl mb-4"
                style={{ color: "var(--warm-orange)" }}
              >
                👨‍🍳
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "var(--warm-brown)" }}
              >
                Preparing
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Our kitchen is preparing your order fresh with the finest
                ingredients
              </p>
            </div>

            <div className="text-center p-6">
              <div
                className="text-6xl mb-4"
                style={{ color: "var(--warm-orange)" }}
              >
                ⏰
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "var(--warm-brown)" }}
              >
                Ready Soon
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                You'll receive a notification when your order is ready for
                pickup
              </p>
            </div>

            <div className="text-center p-6">
              <div
                className="text-6xl mb-4"
                style={{ color: "var(--warm-orange)" }}
              >
                🎵
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "var(--warm-brown)" }}
              >
                Enjoy
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Relax and enjoy our warm atmosphere while you wait
              </p>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div
          className="warm-card-gradient rounded-xl p-10 shadow-lg"
          style={{ border: "1px solid var(--border-warm)" }}
        >
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{ color: "var(--warm-brown)" }}
          >
            Visit Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--warm-orange)" }}
              >
                Location
              </h3>
              <div
                className="text-lg space-y-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <p>123 Music Street</p>
                <p>Downtown District</p>
                <p>City, State 12345</p>
              </div>
            </div>

            <div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--warm-orange)" }}
              >
                Contact
              </h3>
              <div
                className="text-lg space-y-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <p>
                  <strong>Phone:</strong> (555) HORN-PUB
                </p>
                <p>
                  <strong>Email:</strong> orders@hornpub.com
                </p>
                <p>
                  <strong>Hours:</strong> 11 AM - 10 PM Daily
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12 space-x-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:scale-105 inline-block mr-4"
          >
            Order Again
          </a>

          <a
            href="/events"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/events");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="px-8 py-4 rounded-lg transition-colors font-medium text-lg border-2 inline-block"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--border-warm)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--warm-cream)";
              e.target.style.color = "var(--warm-brown)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "var(--text-secondary)";
            }}
          >
            Check Out Live Music
          </a>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
