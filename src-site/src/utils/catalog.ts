import { useEffect, useState } from "react";
export interface MenuCard {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  blurb: string;
  badge: string | null;
  url: string;
}
export interface Category {
  id: string;
  name: string;
  intro: string;
  count: number;
}
export interface MenuPage {
  items: MenuCard[];
  total: number;
  catalogTotal: number;
  page: number;
  pages: number;
  pageSize: number;
  category: string;
  query: string;
  sort: string;
  categories: Category[];
  previous: string | null;
  next: string | null;
  pageLinks: { page: number; url: string }[];
}
export interface MenuDetail extends MenuCard {
  sku: string;
  description: string;
  serving: string;
  details: string;
  categoryName: string;
  related: MenuCard[];
}
export function useCatalog<T>(url: string) {
  const [state, setState] = useState<{
    data: T | null;
    error: string;
    loading: boolean;
  }>({ data: null, error: "", loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: "", loading: true });
    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          window.location.assign(
            "/verify?next=" +
              encodeURIComponent(location.pathname + location.search),
          );
          throw Error("Please verify again.");
        }
        if (!r.ok)
          throw Error(
            r.status === 404
              ? "That item isn’t on the menu."
              : "We couldn’t load this selection. Try another page.",
          );
        return r.json();
      })
      .then((data) => setState({ data, error: "", loading: false }))
      .catch((e) => {
        if (e.name !== "AbortError")
          setState({ data: null, error: e.message, loading: false });
      });
    return () => controller.abort();
  }, [url]);
  return state;
}
export function navigate(url: string) {
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
export function menuThumbnail(image: string) {
  return image.replace(/^\/menu\/([a-z0-9-]+\.webp)$/u, "/menu/thumbs/$1");
}
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
