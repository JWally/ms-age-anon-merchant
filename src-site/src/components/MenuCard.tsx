import React from "react";
import Link from "./Link";
import { MenuCard as Item, money } from "../utils/catalog";
export default function MenuCard({ item }: { item: Item }) {
  return (
    <article className="menu-card" data-product-id={item.id}>
      <Link
        to={`/menu/${item.id}`}
        className="food-image-link"
        aria-label={`View ${item.name}`}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width="600"
          height="400"
        />
        {item.badge && <span className="food-badge">{item.badge}</span>}
      </Link>
      <div className="food-copy">
        <h3>
          <Link to={`/menu/${item.id}`}>{item.name}</Link>
        </h3>
        <p>{item.blurb}</p>
        <div className="food-bottom">
          <span className="food-price">{money(item.price)}</span>
          <Link
            to={`/menu/${item.id}`}
            className="item-link"
            aria-label={`View ${item.name} details`}
          >
            View item <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
