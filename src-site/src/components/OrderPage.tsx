import React, { useState, useContext, JSX } from "react";
import { CartContext } from "../context/CartContext";

function OrderPage(): JSX.Element {
  const { cart, removeFromCart, updateQuantity, getCartTotal, emptyCart } =
    useContext(CartContext)!;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      alert("ORDER SENT!");
      emptyCart();
      sessionStorage.removeItem("session-id");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="warm-gradient min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Your Order is Empty
          </h1>
          <p
            className="text-lg sm:text-xl lg:text-2xl mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Looks like you haven't added any delicious items to your order yet!
          </p>

          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-12 mb-8 shadow-lg max-w-2xl mx-auto"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <div
              className="text-6xl sm:text-7xl lg:text-8xl mb-6"
              style={{ color: "var(--warm-orange)" }}
            >
              🍽️
            </div>
            <p
              className="text-base sm:text-lg mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Browse our menu and discover the perfect combination of great food
              and musical atmosphere.
            </p>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105 inline-block"
            >
              View Menu
            </a>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <div className="warm-gradient min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 text-center"
          style={{ color: "var(--warm-brown)" }}
        >
          Review Your Order
        </h1>

        {/* Mobile-first stacked layout */}
        <div className="space-y-6">
          {/* Order Items Section */}
          <div
            className="warm-card-gradient rounded-xl p-4 sm:p-6 shadow-lg"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h2
              className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6"
              style={{ color: "var(--warm-brown)" }}
            >
              Your Order ({cart.length} {cart.length === 1 ? "item" : "items"})
            </h2>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="border-b border-warm-cream last:border-b-0 pb-4 last:pb-0"
                >
                  {/* Mobile-optimized cart item layout */}
                  <div className="space-y-3">
                    {/* Item name and price */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <h3
                          className="font-semibold text-lg sm:text-xl"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.name}
                        </h3>
                        <p
                          className="text-sm sm:text-base font-medium"
                          style={{ color: "var(--warm-orange)" }}
                        >
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Item total - prominent on mobile */}
                      <div className="text-right">
                        <div
                          className="font-bold text-xl sm:text-2xl"
                          style={{ color: "var(--text-primary)" }}
                        >
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls and remove - stacked on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      {/* Quantity controls - larger touch targets */}
                      <div className="flex items-center justify-center sm:justify-start">
                        <span
                          className="text-sm font-medium mr-3"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Quantity:
                        </span>
                        <div
                          className="flex items-center rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: "var(--warm-white)",
                            border: "2px solid var(--border-warm)",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-4 py-3 sm:px-5 sm:py-4 font-bold text-lg transition-colors"
                            style={{
                              color: "var(--text-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--warm-cream)";
                              e.currentTarget.style.color = "var(--warm-brown)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color =
                                "var(--text-secondary)";
                            }}
                          >
                            -
                          </button>
                          <span
                            className="px-6 py-3 sm:px-8 sm:py-4 font-bold text-lg sm:text-xl"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-4 py-3 sm:px-5 sm:py-4 font-bold text-lg transition-colors"
                            style={{
                              color: "var(--text-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--warm-cream)";
                              e.currentTarget.style.color = "var(--warm-brown)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color =
                                "var(--text-secondary)";
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove button - full width on mobile */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-full sm:w-auto px-4 py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
                        title="Remove item"
                        style={{
                          backgroundColor: "transparent",
                          color: "#dc2626",
                          border: "1px solid #dc2626",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#dc2626";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#dc2626";
                        }}
                      >
                        Remove from Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - no longer sticky on mobile */}
          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h2
              className="text-xl sm:text-2xl font-semibold mb-6"
              style={{ color: "var(--warm-brown)" }}
            >
              Order Summary
            </h2>

            <div className="space-y-4 mb-8">
              <div
                className="flex justify-between text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: "var(--border-warm)" }}
              >
                <div
                  className="flex justify-between font-bold text-2xl sm:text-3xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span>Total</span>
                  <span style={{ color: "var(--warm-orange)" }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons - stacked on mobile for better touch targets */}
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full btn-warm-primary px-8 py-4 sm:py-5 rounded-lg transition-all duration-300 font-bold text-lg sm:text-xl shadow-lg disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {isSubmitting ? "Processing Order..." : "Place Order"}
              </button>

              <button
                onClick={() => emptyCart()}
                className="w-full px-8 py-4 rounded-lg transition-colors font-medium text-base sm:text-lg border-2"
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
                Clear Order
              </button>
            </div>

            {/* Info note */}
            <div
              className="mt-6 p-4 sm:p-6 rounded-lg"
              style={{
                backgroundColor: "var(--warm-cream)",
                border: "1px solid var(--border-warm)",
              }}
            >
              <p
                className="text-sm sm:text-base text-center leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--warm-orange)" }}
                >
                  Note:
                </span>{" "}
                Orders are prepared fresh to order. Average wait time is 15-25
                minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
