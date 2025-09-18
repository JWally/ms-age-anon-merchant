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
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Live Music & Events
          </h1>
          <p
            className="text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Experience the best in brass band music while enjoying our delicious
            food and craft beverages. From intimate jazz sessions to full big
            band spectaculars, there's always something happening at HornPub.
          </p>
        </div>

        {/* Weekly Schedule - Mobile-first single column */}
        <div className="mb-12 sm:mb-16">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-10 text-center"
            style={{ color: "var(--warm-brown-light)" }}
          >
            Weekly Schedule
          </h2>

          {/* Single column on mobile, 2 column on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {upcomingEvents
              .filter((event) => event.date.includes("Every"))
              .map((event) => (
                <div
                  key={event.id}
                  className="warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ border: "1px solid var(--border-warm)" }}
                >
                  <div className="space-y-4">
                    {/* Event title and pricing */}
                    <div className="flex justify-between items-start">
                      <h3
                        className="text-xl sm:text-2xl font-bold flex-1 pr-4"
                        style={{ color: "var(--warm-brown)" }}
                      >
                        {event.title}
                      </h3>
                      {!event.ticketPrice && (
                        <div className="flex-shrink-0">
                          <span
                            className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                            style={{ backgroundColor: "var(--warm-orange)" }}
                          >
                            FREE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event details - stacked for mobile readability */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                        <div>
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "var(--warm-orange)" }}
                          >
                            When:
                          </span>
                          <span
                            className="ml-2 text-sm sm:text-base"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {event.date}
                          </span>
                        </div>
                        <div>
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "var(--warm-orange)" }}
                          >
                            Time:
                          </span>
                          <span
                            className="ml-2 text-sm sm:text-base"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {event.time}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: "var(--warm-orange)" }}
                        >
                          Featuring:
                        </span>
                        <span
                          className="ml-2 text-sm sm:text-base font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {event.band}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Special Events */}
        <div className="mb-12 sm:mb-16">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-10 text-center"
            style={{ color: "var(--warm-brown-light)" }}
          >
            Special Events
          </h2>

          {/* Single column for better mobile experience */}
          <div className="space-y-6 sm:space-y-8">
            {upcomingEvents
              .filter((event) => !event.date.includes("Every"))
              .map((event) => (
                <div
                  key={event.id}
                  className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ border: "1px solid var(--border-warm)" }}
                >
                  <div className="space-y-6">
                    {/* Header with title and price */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <h3
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: "var(--warm-brown)" }}
                      >
                        {event.title}
                      </h3>
                      {event.ticketPrice && (
                        <div className="flex-shrink-0">
                          <span
                            className="px-4 py-2 rounded-full font-bold text-white text-lg sm:text-xl"
                            style={{ backgroundColor: "var(--warm-orange)" }}
                          >
                            ${event.ticketPrice}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event details grid - responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <span
                          className="font-semibold block mb-2 text-sm"
                          style={{ color: "var(--warm-orange)" }}
                        >
                          Date & Time:
                        </span>
                        <div style={{ color: "var(--text-primary)" }}>
                          <div className="font-medium">{event.date}</div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {event.time}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className="font-semibold block mb-2 text-sm"
                          style={{ color: "var(--warm-orange)" }}
                        >
                          Featuring:
                        </span>
                        <div
                          className="font-medium text-base sm:text-lg"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {event.band}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className="leading-relaxed text-base sm:text-lg"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {event.description}
                    </p>

                    {/* Action buttons - stacked on mobile */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button className="flex-1 btn-warm-primary px-6 py-3 sm:py-4 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:scale-105">
                        {event.ticketPrice ? "Buy Tickets" : "Learn More"}
                      </button>
                      <button
                        className="flex-1 sm:flex-initial px-6 py-3 sm:py-4 rounded-lg transition-colors font-medium border-2"
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
                </div>
              ))}
          </div>
        </div>

        {/* Venue & Event Information - Mobile optimized */}
        <div className="space-y-8">
          {/* Performance Space & Private Events - Single column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div
              className="warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h3
                className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                Performance Space
              </h3>
              <div
                className="space-y-3 text-base sm:text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Intimate setting with excellent acoustics</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Tables positioned for optimal viewing</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Full bar service during performances</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Kitchen open until 10 PM on show nights</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Reservations recommended for show nights</span>
                </div>
              </div>
            </div>

            <div
              className="warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h3
                className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                Private Events
              </h3>
              <div
                className="space-y-3 text-base sm:text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Book our space for private parties</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Corporate events and celebrations</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Custom music arrangements available</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Catering packages for groups</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Contact us for availability and pricing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action - Musician Submissions */}
          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg text-center"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h3
              className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
              style={{ color: "var(--warm-brown)" }}
            >
              Want to Perform at HornPub?
            </h3>
            <p
              className="mb-6 sm:mb-8 text-base sm:text-lg max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              We're always looking for talented brass musicians and bands to
              join our lineup. Share your music with our community of music
              lovers.
            </p>
            <button className="btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:scale-105">
              Submit Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
