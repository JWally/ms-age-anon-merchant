import { menuItems, categories } from "./menu-data.mjs";
export const PAGE_SIZE = 12;
const summary = ({ id, name, price, image, category, blurb, badge }) => ({
  id,
  name,
  price,
  image,
  category,
  blurb,
  badge,
  currency: "USD",
  url: `/menu/${id}`,
});
export function listMenu(params) {
  const category = params.get("category") || "all";
  const query = (params.get("q") || "").trim().slice(0, 100);
  const sort = params.get("sort") || "featured";
  const page = Number(params.get("page") || 1);
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !["featured", "price-asc", "price-desc", "name"].includes(sort) ||
    (category !== "all" && !categories.some((x) => x.id === category))
  )
    return { error: "invalid_filter" };
  const rows = menuItems.filter(
    (x) =>
      (category === "all" || x.category === category) &&
      `${x.name} ${x.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (sort === "price-asc")
    rows.sort((a, b) => a.price - b.price || a.id - b.id);
  if (sort === "price-desc")
    rows.sort((a, b) => b.price - a.price || a.id - b.id);
  if (sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  if (page > pages) return { error: "page_not_found" };
  const pageUrl = (n) => {
    const p = new URLSearchParams();
    if (category !== "all") p.set("category", category);
    if (query) p.set("q", query);
    if (sort !== "featured") p.set("sort", sort);
    p.set("page", String(n));
    return "/menu?" + p.toString();
  };
  return {
    items: rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(summary),
    total: rows.length,
    catalogTotal: menuItems.length,
    page,
    pages,
    pageSize: PAGE_SIZE,
    category,
    query,
    sort,
    categories: categories.map((c) => ({
      ...c,
      count: menuItems.filter((x) => x.category === c.id).length,
    })),
    previous: page > 1 ? pageUrl(page - 1) : null,
    next: page < pages ? pageUrl(page + 1) : null,
    pageLinks: Array.from({ length: pages }, (_, i) => ({
      page: i + 1,
      url: pageUrl(i + 1),
    })),
  };
}
export function getMenuItem(id) {
  const item = menuItems.find((x) => x.id === id);
  if (!item) return null;
  return {
    ...item,
    currency: "USD",
    categoryName: categories.find((x) => x.id === item.category).name,
    related: menuItems
      .filter((x) => x.category === item.category && x.id !== id)
      .slice(0, 3)
      .map(summary),
  };
}
