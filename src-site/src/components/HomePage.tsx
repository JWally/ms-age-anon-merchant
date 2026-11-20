import React, { useEffect, useState } from "react";
import Link from "./Link";
import MenuCard from "./MenuCard";
import { useCatalog, MenuPage, navigate } from "../utils/catalog";
export default function HomePage() {
  const query = window.location.search;
  const { data, error, loading } = useCatalog<MenuPage>("/api/menu" + query);
  const params = new URLSearchParams(query);
  const [search, setSearch] = useState(params.get("q") || "");
  useEffect(
    () => setSearch(new URLSearchParams(query).get("q") || ""),
    [query],
  );
  function filter(key: string, value: string) {
    const p = new URLSearchParams(query);
    p.delete("page");
    if (value && value !== "all") p.set(key, value);
    else p.delete(key);
    return "/menu" + (p.size ? "?" + p.toString() : "");
  }
  const selected = data?.categories.find((x) => x.id === data.category);
  return (
    <main>
      <section className="pub-hero page-width">
        <div className="hero-copy">
          <p className="kicker">YOUR NEIGHBORHOOD GRILL & BAR</p>
          <h1>
            Good food.
            <br />
            <em>Great company.</em>
          </h1>
          <p>
            Big plates. Cold pours. One more song.
            <br />
            Pull up a chair—we saved you a spot.
          </p>
          <a href="#menu" className="pub-button">
            Find your favorite <span aria-hidden="true">↓</span>
          </a>
          <div className="hero-footnote">
            <span className="tiny-star">✦</span> COMFORT FOOD. ZERO PRETENSE.
          </div>
        </div>
        <div className="hero-picture">
          <img
            src="/menu/pub-spread.webp"
            alt="A cheeseburger, smoky ribs, buffalo wings and a cold beer at HornPub"
            fetchPriority="high"
          />
          <div className="hero-stamp">
            GOOD TIMES
            <br />
            <b>ON TAP</b>
            <span>HORN • PUB</span>
          </div>
          <div className="photo-caption">
            The usual? Make it something good.
          </div>
        </div>
      </section>
      <div className="pub-ribbon" aria-hidden="true">
        <span>STACKED BURGERS</span>
        <b>✦</b>
        <span>SAUCY WINGS</span>
        <b>✦</b>
        <span>COLD BEER</span>
        <b>✦</b>
        <span>LIVE MUSIC</span>
        <b>✦</b>
        <span>GOOD COMPANY</span>
      </div>
      <section
        id="menu"
        className="catalog page-width"
        aria-labelledby="menu-heading"
      >
        <div className="catalog-heading">
          <div>
            <p className="kicker">COME HUNGRY. STAY AWHILE.</p>
            <h2 id="menu-heading">{selected?.name || "The good stuff."}</h2>
            <p>
              {selected?.intro ||
                "All your pub favorites, and a few new reasons to come back."}
            </p>
          </div>
          <span className="menu-count">
            {data?.catalogTotal || 120} ways to make a night of it.
          </span>
        </div>
        <nav className="category-tabs" aria-label="Menu categories">
          <Link
            to={filter("category", "all")}
            className={!params.get("category") ? "selected" : ""}
            aria-current={!params.get("category") ? "page" : undefined}
          >
            All the good stuff
          </Link>
          {data?.categories.map((c) => (
            <Link
              key={c.id}
              to={filter("category", c.id)}
              className={data.category === c.id ? "selected" : ""}
              aria-current={data.category === c.id ? "page" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="catalog-tools">
          <form
            className="menu-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(filter("q", search));
            }}
          >
            <span aria-hidden="true">⌕</span>
            <label className="sr-only" htmlFor="menu-search">
              Search the menu
            </label>
            <input
              id="menu-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What sounds good?"
            />
            <button type="submit">Search</button>
          </form>
          <label className="menu-sort">
            Sort by{" "}
            <select
              value={params.get("sort") || "featured"}
              onChange={(e) => navigate(filter("sort", e.target.value))}
            >
              <option value="featured">House favorites</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </label>
        </div>
        <div className="results-line" role="status">
          {loading
            ? "Setting the table…"
            : error ||
              `Showing ${data?.total ? (data.page - 1) * data.pageSize + 1 : 0}–${data ? Math.min(data.page * data.pageSize, data.total) : 0} of ${data?.total || 0} items`}
          {data?.query && (
            <Link to={filter("q", "")} className="clear-search">
              Clear “{data.query}” ×
            </Link>
          )}
        </div>
        {loading ? (
          <div className="food-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="menu-skeleton" key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="empty-menu">
            <h3>Let’s try that again.</h3>
            <p>{error}</p>
            <Link to="/menu" className="pub-button">
              Back to the menu
            </Link>
          </div>
        ) : data?.total === 0 ? (
          <div className="empty-menu">
            <h3>No bites on that one.</h3>
            <p>Try another search or browse all our favorites.</p>
            <Link to="/menu" className="pub-button">
              See the full menu
            </Link>
          </div>
        ) : (
          <div className="food-grid">
            {data?.items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
        {data && data.pages > 1 && (
          <nav className="pagination" aria-label="Menu pages">
            {data.previous ? (
              <Link to={data.previous} rel="prev" className="page-direction">
                ← Previous
              </Link>
            ) : (
              <span className="page-direction disabled">← Previous</span>
            )}
            <div>
              {data.pageLinks.map((p) => (
                <Link
                  key={p.page}
                  to={p.url}
                  aria-label={`Page ${p.page}`}
                  aria-current={p.page === data.page ? "page" : undefined}
                  className={p.page === data.page ? "current" : ""}
                >
                  {p.page}
                </Link>
              ))}
            </div>
            {data.next ? (
              <Link to={data.next} rel="next" className="page-direction">
                Next →
              </Link>
            ) : (
              <span className="page-direction disabled">Next →</span>
            )}
          </nav>
        )}
      </section>
      <section className="pub-callout page-width">
        <div>
          <p className="kicker">MAKE YOURSELF AT HOME</p>
          <h2>Stay for the encore.</h2>
          <p>The food’s just the opening act. There’s a whole evening here.</p>
        </div>
        <Link to="/events" className="pub-button light">
          See what’s playing <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
