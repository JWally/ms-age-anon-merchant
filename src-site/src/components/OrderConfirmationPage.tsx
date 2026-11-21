import React from "react";
export default function OrderConfirmationPage() {
  return (
    <main className="warm-gradient min-h-screen text-center px-6 py-20">
      <h1
        className="text-4xl font-bold mb-6"
        style={{ color: "var(--warm-brown)" }}
      >
        That’s a wrap.
      </h1>
      <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
        Your demo order is complete. No order was placed and no payment was
        taken.
      </p>
      <a
        href="/"
        className="btn-warm-primary inline-block px-8 py-4 rounded-lg"
      >
        Back to the menu
      </a>
    </main>
  );
}
