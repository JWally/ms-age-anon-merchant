import React, { useState, useContext, useEffect, JSX } from "react";
import { CartContext } from "../context/CartContext";

function OrderPage(): JSX.Element {
  const { cart, removeFromCart, updateQuantity, getCartTotal, emptyCart } =
    useContext(CartContext)!;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      alert("ORDER SENT!");

      // 3) Empty the cart
      emptyCart();

      // 4) Remove from sessionStorage right away
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
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1
            className="text-5xl font-bold mb-8"
            style={{ color: "var(--warm-brown)" }}
          >
            Your Order is Empty
          </h1>
          <p
            className="text-2xl mb-12"
            style={{ color: "var(--text-secondary)" }}
          >
            Looks like you haven't added any delicious items to your order yet!
          </p>

          <div
            className="warm-card-gradient rounded-xl p-12 mb-12 shadow-lg max-w-2xl mx-auto"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <div
              className="text-8xl mb-8"
              style={{ color: "var(--warm-orange)" }}
            >
              🍽️
            </div>
            <p
              className="text-lg mb-8"
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
              className="btn-warm-primary px-10 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105 inline-block"
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1
          className="text-5xl font-bold mb-12 text-center"
          style={{ color: "var(--warm-brown)" }}
        >
          Review Your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="warm-card-gradient rounded-xl p-8 shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h2
                className="text-3xl font-semibold mb-8"
                style={{ color: "var(--warm-brown)" }}
              >
                Your Order
              </h2>

              <div className="space-y-6">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-6 rounded-lg shadow-sm"
                    style={{
                      backgroundColor: "var(--warm-cream)",
                      border: "1px solid var(--border-warm)",
                    }}
                  >
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-xl mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="font-medium text-lg"
                        style={{ color: "var(--warm-orange)" }}
                      >
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div
                        className="flex items-center rounded-lg overflow-hidden"
                        style={{
                          backgroundColor: "var(--warm-white)",
                          border: "1px solid var(--border-warm)",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-4 py-3 font-bold transition-colors"
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
                          className="px-6 py-3 font-bold text-lg"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-4 py-3 font-bold transition-colors"
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

                      <span
                        className="font-bold text-xl min-w-[100px] text-right"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 px-4 py-2 rounded-lg transition-colors font-medium"
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
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="warm-card-gradient rounded-xl p-8 shadow-lg sticky top-8"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h2
                className="text-2xl font-semibold mb-6"
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
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div
                  className="border-t pt-4"
                  style={{ borderColor: "var(--border-warm)" }}
                >
                  <div
                    className="flex justify-between font-bold text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span>Total</span>
                    <span style={{ color: "var(--warm-orange)" }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-bold text-lg shadow-lg disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                >
                  {isSubmitting ? "Processing Order..." : "Place Order"}
                </button>

                <button
                  onClick={() => emptyCart()}
                  className="w-full px-8 py-4 rounded-lg transition-colors font-medium border-2"
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

              <div
                className="mt-8 p-6 rounded-lg"
                style={{
                  backgroundColor: "var(--warm-cream)",
                  border: "1px solid var(--border-warm)",
                }}
              >
                <p
                  className="text-sm text-center leading-relaxed"
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
    </div>
  );
}

export default OrderPage;
