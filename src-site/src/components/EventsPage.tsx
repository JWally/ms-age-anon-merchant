import React from "react";
import { JSX } from "react";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  band: string;
  description: string;
  ticketPrice?: number;
}

const upcomingEvents: Event[] = [
  {
    id: 1,
    title: "Jazz Night Fridays",
    date: "Every Friday",
    time: "8:00 PM - 11:00 PM",
    band: "The HornPub House Band",
    description:
      "Join us every Friday for smooth jazz performances featuring saxophone, trumpet, and trombone. Perfect accompaniment to dinner and drinks.",
  },
  {
    id: 2,
    title: "Saturday Swing Sessions",
    date: "Every Saturday",
    time: "9:00 PM - 12:00 AM",
    band: "Rotating Guest Bands",
    description:
      "Dance the night away to classic swing music. We feature different brass ensembles each week, from big band to smaller combos.",
  },
  {
    id: 3,
    title: "Sunday Brunch & Blues",
    date: "Every Sunday",
    time: "11:00 AM - 2:00 PM",
    band: "Blue Note Trio",
    description:
      "Start your Sunday right with bottomless mimosas and soulful blues featuring trumpet, piano, and upright bass.",
  },
  {
    id: 4,
    title: "Monthly Brass Battle",
    date: "First Thursday of Each Month",
    time: "7:00 PM - 10:00 PM",
    band: "Local Brass Bands",
    description:
      "Local brass bands compete in friendly musical battles. Audience votes for their favorite performance. Winner gets bragging rights and free dinner!",
    ticketPrice: 15,
  },
  {
    id: 5,
    title: "New Orleans Night",
    date: "March 15, 2025",
    time: "7:00 PM - 11:00 PM",
    band: "Bayou Brass Band",
    description:
      "Transport yourself to the French Quarter with authentic New Orleans jazz, Creole cuisine specials, and Mardi Gras atmosphere.",
    ticketPrice: 25,
  },
  {
    id: 6,
    title: "Big Band Spectacular",
    date: "March 22, 2025",
    time: "6:00 PM - 10:00 PM",
    band: "Metro City Big Band",
    description:
      "A full 18-piece big band takes the stage for an evening of classic swing standards and Glenn Miller favorites.",
    ticketPrice: 30,
  },
];

function EventsPage(): JSX.Element {
  return (
    <div className="warm-gradient min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Live Music & Events
          </h1>
          <p
            className="text-xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Experience the best in brass band music while enjoying our delicious
            food and craft beverages. From intimate jazz sessions to full big
            band spectaculars, there's always something happening at HornPub.
          </p>
        </div>

        {/* Regular Events */}
        <div className="mb-16">
          <h2
            className="text-4xl font-bold mb-10 text-center"
            style={{ color: "var(--warm-brown-light)" }}
          >
            Weekly Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents
              .filter((event) => event.date.includes("Every"))
              .map((event) => (
                <div
                  key={event.id}
                  className="warm-card-gradient rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ border: "1px solid var(--border-warm)" }}
                >
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{ color: "var(--warm-brown)" }}
                  >
                    {event.title}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={{ color: "var(--warm-orange)" }}
                      >
                        When:
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {event.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={{ color: "var(--warm-orange)" }}
                      >
                        Time:
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {event.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={{ color: "var(--warm-orange)" }}
                      >
                        Band:
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {event.band}
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {event.description}
                  </p>

                  {!event.ticketPrice && (
                    <div className="text-center">
                      <span
                        className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: "var(--warm-orange)" }}
                      >
                        No Cover Charge
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Special Events */}
        <div className="mb-16">
          <h2
            className="text-4xl font-bold mb-10 text-center"
            style={{ color: "var(--warm-brown-light)" }}
          >
            Special Events
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {upcomingEvents
              .filter((event) => !event.date.includes("Every"))
              .map((event) => (
                <div
                  key={event.id}
                  className="warm-card-gradient rounded-xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ border: "1px solid var(--border-warm)" }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3
                      className="text-3xl font-bold"
                      style={{ color: "var(--warm-brown)" }}
                    >
                      {event.title}
                    </h3>
                    {event.ticketPrice && (
                      <span
                        className="px-4 py-2 rounded-full font-bold text-white text-lg"
                        style={{ backgroundColor: "var(--warm-orange)" }}
                      >
                        ${event.ticketPrice}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <span
                        className="font-semibold block mb-2"
                        style={{ color: "var(--warm-orange)" }}
                      >
                        Date:
                      </span>
                      <div style={{ color: "var(--text-primary)" }}>
                        {event.date}
                      </div>
                    </div>
                    <div>
                      <span
                        className="font-semibold block mb-2"
                        style={{ color: "var(--warm-orange)" }}
                      >
                        Time:
                      </span>
                      <div style={{ color: "var(--text-primary)" }}>
                        {event.time}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span
                      className="font-semibold block mb-2"
                      style={{ color: "var(--warm-orange)" }}
                    >
                      Featuring:
                    </span>
                    <div
                      className="font-medium text-lg"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {event.band}
                    </div>
                  </div>

                  <p
                    className="leading-relaxed mb-8"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {event.description}
                  </p>

                  <div className="flex gap-4">
                    <button className="flex-1 btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:scale-105">
                      {event.ticketPrice ? "Buy Tickets" : "Learn More"}
                    </button>
                    <button
                      className="px-8 py-4 rounded-lg transition-colors font-medium border-2"
                      style={{
                        backgroundColor: "transparent",
                        borderColor: "var(--border-warm)",
                        color: "var(--text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--warm-cream)";
                        e.currentTarget.style.color = "var(--warm-brown)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Info Section */}
        <div
          className="warm-card-gradient rounded-xl p-10 shadow-lg"
          style={{ border: "1px solid var(--border-warm)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3
                className="text-3xl font-bold mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                Performance Space
              </h3>
              <div
                className="space-y-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <p>• Intimate setting with excellent acoustics</p>
                <p>• Tables positioned for optimal viewing</p>
                <p>• Full bar service during performances</p>
                <p>• Kitchen open until 10 PM on show nights</p>
                <p>• Reservations recommended for show nights</p>
              </div>
            </div>

            <div>
              <h3
                className="text-3xl font-bold mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                Private Events
              </h3>
              <div
                className="space-y-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <p>• Book our space for private parties</p>
                <p>• Corporate events and celebrations</p>
                <p>• Custom music arrangements available</p>
                <p>• Catering packages for groups</p>
                <p>• Contact us for availability and pricing</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p
              className="mb-6 text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Want to perform at HornPub? We're always looking for talented
              brass musicians and bands.
            </p>
            <button className="btn-warm-primary px-10 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:scale-105">
              Submit Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
