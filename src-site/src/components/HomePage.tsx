import React from "react";
import Link from "./Link";
import { menuItems } from "../utils/menuItems";
import Img from "./Img";
import { JSX } from "react";

function HomePage(): JSX.Element {
  // Group menu items by category
  const categorizedMenu = menuItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof menuItems>,
  );

  const categoryTitles = {
    appetizers: "Appetizers",
    mains: "Main Courses",
    drinks: "Beverages",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 warm-gradient min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1
          className="text-6xl font-bold mb-6"
          style={{ color: "var(--warm-brown)" }}
        >
          Welcome to HornPub
        </h1>
        <p className="text-2xl mb-8" style={{ color: "var(--text-secondary)" }}>
          Where Boring Puns Meet Mediocre Food and Ho-Hum Music
        </p>
        <div
          className="w-32 h-2 mx-auto rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--warm-orange), var(--warm-yellow))",
          }}
        ></div>
      </div>

      {/* Menu by Category */}
      {Object.entries(categorizedMenu).map(([category, items]) => (
        <div key={category} className="mb-16">
          <h2
            className="text-4xl font-bold mb-8 text-center"
            style={{ color: "var(--warm-brown-light)" }}
          >
            {categoryTitles[category as keyof typeof categoryTitles] ||
              category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="warm-card-gradient rounded-xl shadow-lg overflow-hidden transition-all duration-300 flex flex-col hover:shadow-xl transform hover:scale-105"
                style={{ border: "1px solid var(--border-warm)" }}
              >
                <Link to={`/menu/${item.id}`} className="block overflow-hidden">
                  <Img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                </Link>

                <div className="p-6 flex-grow flex flex-col">
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: "var(--warm-brown)" }}
                  >
                    {item.name}
                  </h3>
                  <p
                    className="text-sm mb-4 flex-grow leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: "var(--warm-orange)" }}
                    >
                      ${item.price}
                    </span>
                    <Link
                      to={`/menu/${item.id}`}
                      className="btn-warm-primary px-6 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* About Section */}
      <div
        className="warm-card-gradient rounded-xl p-10 mt-16 shadow-lg"
        style={{ border: "1px solid var(--border-warm)" }}
      >
        <div className="text-center">
          <h2
            className="text-4xl font-bold mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            About HornPub
          </h2>
          <p
            className="text-lg leading-relaxed max-w-4xl mx-auto mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Located in the heart of the city, HornPub combines the warm
            atmosphere of a traditional pub with the soulful sounds of brass
            band music. Our menu features comfort food classics with a musical
            twist, perfect for enjoying with friends while listening to live
            performances every weekend.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div
              className="text-center p-6 rounded-lg"
              style={{ backgroundColor: "var(--warm-cream)" }}
            >
              <div
                className="text-4xl font-bold mb-3"
                style={{ color: "var(--warm-orange)" }}
              >
                Live Music
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Professional brass bands every weekend
              </p>
            </div>

            <div
              className="text-center p-6 rounded-lg"
              style={{ backgroundColor: "var(--warm-cream)" }}
            >
              <div
                className="text-4xl font-bold mb-3"
                style={{ color: "var(--warm-orange)" }}
              >
                Craft Brews
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Locally sourced beer and spirits
              </p>
            </div>

            <div
              className="text-center p-6 rounded-lg"
              style={{ backgroundColor: "var(--warm-cream)" }}
            >
              <div
                className="text-4xl font-bold mb-3"
                style={{ color: "var(--warm-orange)" }}
              >
                Fresh Food
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Made-to-order comfort food classics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
