import React, { JSX, useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { menuItems } from "../utils/menuItems";
import Notification from "./Notification";
import Img from "./Img";

interface MenuItemPageProps {
  menuItemId: number;
}

function MenuItemPage({ menuItemId }: MenuItemPageProps): JSX.Element {
  const { addToCart } = useContext(CartContext)!;
  const menuItem = menuItems.find((item) => item.id === menuItemId);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  if (!menuItem) {
    return (
      <div className="warm-gradient min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1
            className="text-4xl font-bold mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Menu Item Not Found
          </h1>
          <p
            className="text-xl mb-12"
            style={{ color: "var(--text-secondary)" }}
          >
            Sorry, we couldn't find that item on our menu. Please browse our
            available options.
          </p>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:scale-105 inline-block"
          >
            Back to Menu
          </a>
        </div>
      </div>
    );
  }

  const handleAddToOrder = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
      });
    }

    setShowNotification(true);
    setQuantity(1); // Reset quantity after adding
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap = {
      appetizers: "Appetizer",
      mains: "Main Course",
      drinks: "Beverage",
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  return (
    <div className="warm-gradient min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {showNotification && (
          <Notification
            message={`${quantity > 1 ? `${quantity}x ` : ""}${menuItem.name} added to your order!`}
            onClose={() => setShowNotification(false)}
            type="success"
            duration={3000}
            link="/cart"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Section */}
          <div className="space-y-6">
            <div
              className="warm-card-gradient rounded-xl p-4 shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <Img
                src={menuItem.image}
                alt={menuItem.name}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Category Badge */}
            <div className="flex justify-center">
              <span
                className="px-6 py-3 rounded-full font-bold text-lg text-white"
                style={{ backgroundColor: "var(--warm-orange)" }}
              >
                {getCategoryDisplayName(menuItem.category)}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h1
                className="text-5xl font-bold mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                {menuItem.name}
              </h1>
              <p
                className="text-4xl font-bold mb-8"
                style={{ color: "var(--warm-orange)" }}
              >
                ${menuItem.price.toFixed(2)}
              </p>
            </div>

            <div
              className="warm-card-gradient p-8 rounded-xl shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h2
                className="text-2xl font-semibold mb-4"
                style={{ color: "var(--warm-brown)" }}
              >
                Description
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {menuItem.description}
              </p>
            </div>

            {/* Quantity and Add to Order */}
            <div
              className="warm-card-gradient p-8 rounded-xl shadow-lg space-y-6"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--warm-brown)" }}
              >
                Quantity
              </h3>

              <div className="flex items-center space-x-6">
                <div
                  className="flex items-center rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: "var(--warm-white)",
                    border: "2px solid var(--border-warm)",
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-6 py-4 font-bold text-xl transition-colors disabled:opacity-50"
                    style={{
                      color: "var(--text-secondary)",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor =
                          "var(--warm-cream)";
                        e.currentTarget.style.color = "var(--warm-brown)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    -
                  </button>
                  <span
                    className="px-8 py-4 font-bold text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className="px-6 py-4 font-bold text-xl transition-colors disabled:opacity-50"
                    style={{
                      color: "var(--text-secondary)",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.backgroundColor =
                          "var(--warm-cream)";
                        e.currentTarget.style.color = "var(--warm-brown)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    +
                  </button>
                </div>

                <div
                  className="text-xl"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total:{" "}
                  <span
                    className="font-bold text-2xl"
                    style={{ color: "var(--warm-orange)" }}
                  >
                    ${(menuItem.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToOrder}
                className="w-full btn-warm-primary px-10 py-5 rounded-lg transition-all duration-300 font-bold text-xl shadow-lg transform hover:scale-105"
              >
                Add to Order
              </button>

              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, "", "/");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="w-full block text-center px-10 py-4 rounded-lg transition-colors font-medium text-lg border-2"
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
                Back to Menu
              </a>
            </div>

            {/* Additional Info */}
            <div
              className="warm-card-gradient p-6 rounded-lg shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <p
                className="text-center text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--warm-orange)" }}
                >
                  Kitchen Hours:
                </span>
                11:00 AM - 10:00 PM Daily
              </p>
              <p
                className="text-center mt-3 text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                Have dietary restrictions? Ask your server about modifications.
              </p>
            </div>
          </div>
        </div>

        {/* Related Items Section */}
        <div className="mt-20">
          <h2
            className="text-3xl font-bold mb-10 text-center"
            style={{ color: "var(--warm-brown)" }}
          >
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {menuItems
              .filter(
                (item) =>
                  item.id !== menuItem.id &&
                  item.category === menuItem.category,
              )
              .slice(0, 3)
              .map((item) => (
                <div
                  key={item.id}
                  className="warm-card-gradient rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ border: "1px solid var(--border-warm)" }}
                >
                  <a
                    href={`/menu/${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, "", `/menu/${item.id}`);
                      window.dispatchEvent(new PopStateEvent("popstate"));
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-6">
                      <h3
                        className="font-semibold text-lg mb-2"
                        style={{ color: "var(--warm-brown)" }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="font-bold text-xl"
                        style={{ color: "var(--warm-orange)" }}
                      >
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuItemPage;
