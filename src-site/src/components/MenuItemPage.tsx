import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useCatalog, MenuDetail, money } from "../utils/catalog";
import Link from "./Link";
import MenuCard from "./MenuCard";
export default function MenuItemPage({ menuItemId }: { menuItemId: number }) {
  const {
    data: item,
    error,
    loading,
  } = useCatalog<MenuDetail>("/api/menu/" + menuItemId);
  const { addToCart } = useContext(CartContext)!;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState("");
  if (loading)
    return (
      <main className="page-width detail-loading">
        <p role="status">Getting something good ready…</p>
      </main>
    );
  if (error || !item)
    return (
      <main className="page-width empty-menu">
        <h1>That one’s off the menu.</h1>
        <p>{error}</p>
        <Link to="/menu" className="pub-button">
          Back to the menu
        </Link>
      </main>
    );
  function add() {
    for (let i = 0; i < quantity; i++)
      addToCart({
        id: item!.id,
        name: item!.name,
        price: item!.price,
        image: item!.image,
        quantity: 1,
      });
    setAdded(`${quantity} × ${item!.name} added to your tab.`);
  }
  return (
    <main className="page-width product-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/menu">Menu</Link>
        <span>/</span>
        <Link to={`/menu?category=${item.category}`}>{item.categoryName}</Link>
        <span>/</span>
        <span>{item.name}</span>
      </nav>
      <section className="product-layout">
        <div className="product-picture">
          <img src={item.image} alt={item.name} />
          {item.badge && <span className="food-badge">{item.badge}</span>}
          <p>Serving suggestion · Menu photography is illustrative.</p>
        </div>
        <div className="product-info">
          <p className="kicker">{item.categoryName}</p>
          <h1>{item.name}</h1>
          <p className="product-price">{money(item.price)}</p>
          <p className="product-description">{item.description}</p>
          <dl className="product-facts">
            <div>
              <dt>On your plate</dt>
              <dd>{item.serving}</dd>
            </div>
            <div>
              <dt>From the kitchen</dt>
              <dd>{item.details}</dd>
            </div>
            <div>
              <dt>Menu number</dt>
              <dd>{item.sku}</dd>
            </div>
          </dl>
          <div className="add-row">
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                disabled={quantity === 1}
                onClick={() => setQuantity((n) => n - 1)}
              >
                −
              </button>
              <output aria-label="Quantity">{quantity}</output>
              <button
                aria-label="Increase quantity"
                disabled={quantity === 10}
                onClick={() => setQuantity((n) => n + 1)}
              >
                +
              </button>
            </div>
            <button className="pub-button" onClick={add}>
              Add to your tab <span>{money(item.price * quantity)}</span>
            </button>
          </div>
          <p className="add-notice" role="status">
            {added}
            {added && (
              <>
                {" "}
                <Link to="/cart">View your tab →</Link>
              </>
            )}
          </p>
          <p className="demo-small">
            Just browsing? So are we. This demo doesn’t place real orders.
          </p>
        </div>
      </section>
      <section className="related">
        <p className="kicker">KEEP A GOOD THING GOING</p>
        <h2>A few more favorites.</h2>
        <div className="food-grid">
          {item.related.map((x) => (
            <MenuCard item={x} key={x.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
