import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import Link from "./Link";
import { money, navigate } from "../utils/catalog";
export default function OrderPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, emptyCart } =
    useContext(CartContext)!;
  if (!cart.length)
    return (
      <main className="page-width empty-tab">
        <div className="empty-tab-mark" aria-hidden="true">
          0
        </div>
        <p className="kicker">PLENTY OF ROOM FOR SOMETHING GOOD</p>
        <h1>Your tab’s looking a little quiet.</h1>
        <p>Let’s fix that. There are 120 good places to start.</p>
        <Link to="/menu" className="pub-button">
          Find your favorite <span aria-hidden="true">↗</span>
        </Link>
      </main>
    );
  return (
    <main className="page-width cart-page">
      <div className="cart-heading">
        <div>
          <p className="kicker">LOOKING LIKE A GOOD NIGHT</p>
          <h1>Your tab.</h1>
        </div>
        <Link to="/menu" className="item-link">
          Keep browsing ↗
        </Link>
      </div>
      <div className="cart-layout">
        <section className="cart-lines" aria-label="Items on your tab">
          {cart.map((item) => (
            <article className="cart-line" key={item.id}>
              {item.image && (
                <Link to={`/menu/${item.id}`}>
                  <img src={item.image} alt={item.name} />
                </Link>
              )}
              <div className="cart-line-copy">
                <h2>
                  <Link to={`/menu/${item.id}`}>{item.name}</Link>
                </h2>
                <p>{money(item.price)} each</p>
                <button
                  className="remove-item"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  Remove
                </button>
              </div>
              <div className="quantity-control">
                <button
                  aria-label={`Decrease ${item.name}`}
                  disabled={item.quantity <= 1}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <output>{item.quantity}</output>
                <button
                  aria-label={`Increase ${item.name}`}
                  disabled={item.quantity >= 10}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <strong>{money(item.price * item.quantity)}</strong>
            </article>
          ))}
        </section>
        <aside className="tab-summary">
          <p className="kicker">THE GOOD STUFF, ADDED UP</p>
          <h2>On your tab</h2>
          <div>
            <span>{cart.reduce((n, x) => n + x.quantity, 0)} items</span>
            <strong>{money(getCartTotal())}</strong>
          </div>
          <p>
            This is a demo tab. No payment is collected and no food order is
            sent.
          </p>
          <button
            className="pub-button"
            onClick={() => {
              emptyCart();
              navigate("/order-confirmation");
            }}
          >
            Finish demo order <span>↗</span>
          </button>
        </aside>
      </div>
    </main>
  );
}
