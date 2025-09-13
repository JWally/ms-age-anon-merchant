/* global HTMLElement, HTMLButtonElement */

export const checkoutFlow = async () => {
  alert("AND HERE...WE...Go!");
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const product: { btn: HTMLElement | null; clicked: boolean } = {
    btn: null,
    clicked: false,
  };
  do {
    product.btn = document.querySelector(
      'a[href="/product/1"]',
    ) as HTMLElement | null;
    await sleep(1_234);
  } while (window.location.pathname === "/" && !product.btn);
  if (product.btn && !product.clicked) {
    product.clicked = true;
    product.btn.click();
    await sleep(1_234);
  }

  const addToCart: { btn: HTMLButtonElement | null; clicked: boolean } = {
    btn: null,
    clicked: false,
  };
  do {
    addToCart.btn = Array.from(document.querySelectorAll("button")).find(
      (btn) => (btn as HTMLButtonElement).innerText.includes("Add To Cart"),
    ) as HTMLButtonElement | null;
    await sleep(1_234);
  } while (window.location.pathname === "/product/1" && !addToCart.btn);
  if (addToCart.btn && !addToCart.clicked) {
    addToCart.clicked = true;
    addToCart.btn.click();
    await sleep(1_234);
  }

  const cart: { btn: HTMLElement | null; clicked: boolean } = {
    btn: null,
    clicked: false,
  };
  do {
    cart.btn = Array.from(document.querySelectorAll('a[href="/cart"]')).find(
      (a) => !(a as HTMLElement).innerText.includes("Cart(0)"),
    ) as HTMLElement | null;
    await sleep(1_234);
  } while (window.location.pathname === "/product/1" && !cart.btn);
  if (cart.btn && !cart.clicked) {
    cart.clicked = true;
    cart.btn.click();
    await sleep(1_234);
  }

  const purchase: { btn: HTMLButtonElement | null; clicked: boolean } = {
    btn: null,
    clicked: false,
  };
  do {
    purchase.btn = Array.from(document.querySelectorAll("button")).find((btn) =>
      (btn as HTMLButtonElement).innerText.includes("PURCHASE"),
    ) as HTMLButtonElement | null;
    await sleep(1_234);
  } while (window.location.pathname === "/cart" && !purchase.btn);
  if (purchase.btn && !purchase.clicked) {
    await sleep(1_234);
    purchase.clicked = true;
    purchase.btn.click();
  }
};
