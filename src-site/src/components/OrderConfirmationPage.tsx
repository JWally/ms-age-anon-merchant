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
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Success Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div
            className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6"
            style={{ color: "var(--warm-orange)" }}
          >
            ✓
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Order Confirmed!
          </h1>
          <p
            className="text-lg sm:text-xl lg:text-2xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Thank you for dining with HornPub
          </p>
        </div>

        {/* Order Details - Mobile optimized single column */}
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg text-center"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8"
              style={{ color: "var(--warm-brown)" }}
            >
              Order Details
            </h2>

            {/* Order info - stacked on mobile, side-by-side on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div
                className="p-4 sm:p-6 rounded-lg"
                style={{ backgroundColor: "var(--warm-cream)" }}
              >
                <h3
                  className="font-semibold text-base sm:text-lg mb-2"
                  style={{ color: "var(--warm-orange)" }}
                >
                  Order Number
                </h3>
                <p
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  #{orderNumber}
                </p>
              </div>

              <div
                className="p-4 sm:p-6 rounded-lg"
                style={{ backgroundColor: "var(--warm-cream)" }}
              >
                <h3
                  className="font-semibold text-base sm:text-lg mb-2"
                  style={{ color: "var(--warm-orange)" }}
                >
                  Estimated Time
                </h3>
                <p
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  15-25 min
                </p>
              </div>
            </div>

            {sessionId && (
              <div
                className="p-4 sm:p-6 rounded-lg mb-6"
                style={{
                  backgroundColor: "var(--warm-cream)",
                  border: "1px solid var(--border-warm)",
                }}
              >
                <p
                  className="text-xs sm:text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Reference ID
                </p>
                <p
                  className="font-mono text-sm sm:text-base lg:text-lg break-all"
                  style={{ color: "var(--text-primary)" }}
                >
                  {sessionId}
                </p>
              </div>
            )}
          </div>

          {/* What's Next - Mobile optimized */}
          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center"
              style={{ color: "var(--warm-brown)" }}
            >
              What's Next?
            </h2>

            {/* Single column on mobile, 3 columns on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-4 sm:p-6">
                <div
                  className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4"
                  style={{ color: "var(--warm-orange)" }}
                >
                  👨‍🍳
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold mb-3"
                  style={{ color: "var(--warm-brown)" }}
                >
                  Preparing
                </h3>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Our kitchen is preparing your order fresh with the finest
                  ingredients
                </p>
              </div>

              <div className="text-center p-4 sm:p-6">
                <div
                  className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4"
                  style={{ color: "var(--warm-orange)" }}
                >
                  ⏰
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold mb-3"
                  style={{ color: "var(--warm-brown)" }}
                >
                  Ready Soon
                </h3>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  You'll receive a notification when your order is ready for
                  pickup
                </p>
              </div>

              <div className="text-center p-4 sm:p-6">
                <div
                  className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4"
                  style={{ color: "var(--warm-orange)" }}
                >
                  🎵
                </div>
                <h3
                  className="text-lg sm:text-xl font-bold mb-3"
                  style={{ color: "var(--warm-brown)" }}
                >
                  Enjoy
                </h3>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Relax and enjoy our warm atmosphere while you wait
                </p>
              </div>
            </div>
          </div>

          {/* Location & Contact - Single column on mobile */}
          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center"
              style={{ color: "var(--warm-brown)" }}
            >
              Visit Us
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
              <div className="text-center sm:text-left">
                <h3
                  className="text-xl sm:text-2xl font-bold mb-4"
                  style={{ color: "var(--warm-orange)" }}
                >
                  Location
                </h3>
                <div
                  className="text-base sm:text-lg space-y-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p>123 Music Street</p>
                  <p>Downtown District</p>
                  <p>City, State 12345</p>
                </div>
              </div>

              <div className="text-center sm:text-left">
                <h3
                  className="text-xl sm:text-2xl font-bold mb-4"
                  style={{ color: "var(--warm-orange)" }}
                >
                  Contact
                </h3>
                <div
                  className="text-base sm:text-lg space-y-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a
                      href="tel:(555)467-6782"
                      className="underline hover:no-underline"
                      style={{ color: "var(--warm-orange)" }}
                    >
                      (555) HORN-PUB
                    </a>
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:orders@hornpub.com"
                      className="underline hover:no-underline"
                      style={{ color: "var(--warm-orange)" }}
                    >
                      orders@hornpub.com
                    </a>
                  </p>
                  <p>
                    <strong>Hours:</strong> 11 AM - 10 PM Daily
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Stacked buttons on mobile */}
        <div className="text-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="w-full sm:w-auto btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:scale-105 inline-block"
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
            className="w-full sm:w-auto px-8 py-4 rounded-lg transition-colors font-medium text-lg border-2 inline-block"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--border-warm)",
              color: "var(--text-secondary)",
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
            Check Out Live Music
          </a>
        </div>

        {/* Additional helpful info */}
        <div
          className="mt-8 sm:mt-12 warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg text-center"
          style={{ border: "1px solid var(--border-warm)" }}
        >
          <h3
            className="text-xl sm:text-2xl font-bold mb-4"
            style={{ color: "var(--warm-brown)" }}
          >
            Need Help?
          </h3>
          <p
            className="text-base sm:text-lg mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Questions about your order? Our team is here to help.
          </p>
          <a
            href="tel:(555)467-6782"
            className="btn-warm-primary px-6 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:scale-105 inline-block"
          >
            Call Us: (555) HORN-PUB
          </a>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
