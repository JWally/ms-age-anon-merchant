import React from "react";
import Link from "./Link";
import { MenuCard as Item, menuThumbnail, money } from "../utils/catalog";

export default function MenuCard({
  item,
  heading: Heading = "h3",
}: {
  item: Item;
  heading?: "h2" | "h3";
}) {
  return (
    <article className="menu-card" data-product-id={item.id}>
      <Link to={item.url} className="food-card-link">
        <picture className="food-photo">
          <source
            media="(max-width: 520px)"
            srcSet={menuThumbnail(item.image)}
          />
          <img
            src={item.image}
            alt=""
            loading="lazy"
            width="600"
            height="400"
          />
        </picture>
        <div className="food-copy">
          {item.badge && <span className="food-badge">{item.badge}</span>}
          <Heading>{item.name}</Heading>
          <p>{item.blurb}</p>
          <div className="food-bottom">
            <span className="food-price">{money(item.price)}</span>
            <span className="item-link">
              View item <span aria-hidden="true">↗</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
