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
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Menu Item Not Found
          </h1>
          <p
            className="text-lg sm:text-xl mb-8"
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
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {showNotification && (
          <Notification
            message={`${quantity > 1 ? `${quantity}x ` : ""}${menuItem.name} added to your order!`}
            onClose={() => setShowNotification(false)}
            type="success"
            duration={3000}
            link="/cart"
          />
        )}

        {/* Mobile-first stacked layout */}
        <div className="space-y-6 lg:space-y-8">
          {/* Image Section - Full width on mobile */}
          <div className="relative">
            <Img
              src={menuItem.image}
              alt={menuItem.name}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl shadow-lg"
            />

            {/* Category badge - positioned over image */}
            <div className="absolute top-4 left-4">
              <span
                className="px-4 py-2 rounded-full font-bold text-sm sm:text-base text-white shadow-lg"
                style={{ backgroundColor: "var(--warm-orange)" }}
              >
                {getCategoryDisplayName(menuItem.category)}
              </span>
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="text-center sm:text-left">
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style={{ color: "var(--warm-brown)" }}
              >
                {menuItem.name}
              </h1>
              <p
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: "var(--warm-orange)" }}
              >
                ${menuItem.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div
              className="warm-card-gradient p-6 sm:p-8 rounded-xl shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h2
                className="text-xl sm:text-2xl font-semibold mb-4"
                style={{ color: "var(--warm-brown)" }}
              >
                Description
              </h2>
              <p
                className="text-base sm:text-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {menuItem.description}
              </p>
            </div>

            {/* Quantity Selection & Add to Order */}
            <div
              className="warm-card-gradient p-6 sm:p-8 rounded-xl shadow-lg space-y-6"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h3
                className="text-lg sm:text-xl font-semibold text-center sm:text-left"
                style={{ color: "var(--warm-brown)" }}
              >
                How many would you like?
              </h3>

              {/* Quantity controls - centered on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center justify-center sm:justify-start">
                  <span
                    className="text-base font-medium mr-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Quantity:
                  </span>
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
                      className="px-5 py-4 font-bold text-xl transition-colors disabled:opacity-50"
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
                      className="px-8 py-4 font-bold text-2xl min-w-[80px] text-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      disabled={quantity >= 10}
                      className="px-5 py-4 font-bold text-xl transition-colors disabled:opacity-50"
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
                </div>

                {/* Total price - prominent display */}
                <div className="text-center sm:text-right">
                  <div
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Total:
                  </div>
                  <div
                    className="font-bold text-2xl sm:text-3xl"
                    style={{ color: "var(--warm-orange)" }}
                  >
                    ${(menuItem.price * quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Stacked for better mobile UX */}
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={handleAddToOrder}
                className="w-full btn-warm-primary px-8 py-4 sm:py-5 rounded-lg transition-all duration-300 font-bold text-lg sm:text-xl shadow-lg transform hover:scale-105"
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
                className="w-full block text-center px-8 py-4 rounded-lg transition-colors font-medium text-base sm:text-lg border-2"
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
              className="warm-card-gradient p-4 sm:p-6 rounded-lg shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <div className="space-y-2 text-center sm:text-left">
                <p
                  className="text-base sm:text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: "var(--warm-orange)" }}
                  >
                    Kitchen Hours:
                  </span>{" "}
                  11:00 AM - 10:00 PM Daily
                </p>
                <p
                  className="text-sm sm:text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Have dietary restrictions? Ask your server about
                  modifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items Section - Mobile optimized */}
        <div className="mt-12 lg:mt-20">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-8 text-center"
            style={{ color: "var(--warm-brown)" }}
          >
            You Might Also Like
          </h2>

          {/* Single column on mobile, progressive enhancement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    <div className="p-4 sm:p-6">
                      <h3
                        className="font-semibold text-base sm:text-lg mb-2"
                        style={{ color: "var(--warm-brown)" }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="font-bold text-lg sm:text-xl"
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
