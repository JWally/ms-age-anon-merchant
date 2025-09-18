import React, { useState } from "react";
import { JSX } from "react";

function ReservationsPage(): JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    specialRequests: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Reservation request submitted! We'll contact you shortly to confirm.",
    );
    console.log("Reservation data:", formData);
  };

  return (
    <div className="warm-gradient min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: "var(--warm-brown)" }}
          >
            Make a Reservation
          </h1>
          <p
            className="text-lg sm:text-xl lg:text-2xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Reserve your table for an unforgettable dining experience
          </p>
        </div>

        {/* Mobile-first stacked layout */}
        <div className="space-y-8">
          {/* Reservation Form - Priority content first on mobile */}
          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h2
              className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8"
              style={{ color: "var(--warm-brown)" }}
            >
              Reservation Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information - Single column on mobile */}
              <div className="space-y-6 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label
                      className="block mb-3 font-medium text-base sm:text-lg"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 sm:py-3 lg:py-4 rounded-lg text-base sm:text-lg border-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--warm-white)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-warm)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--warm-orange)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-warm)";
                      }}
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-3 font-medium text-base sm:text-lg"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 sm:py-3 lg:py-4 rounded-lg text-base sm:text-lg border-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--warm-white)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-warm)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--warm-orange)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-warm)";
                      }}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-3 font-medium text-base sm:text-lg"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 sm:py-3 lg:py-4 rounded-lg text-base sm:text-lg border-2 focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--warm-white)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-warm)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--warm-orange)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border-warm)";
                    }}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Reservation Details - Single column on mobile for better UX */}
              <div className="space-y-6 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label
                      className="block mb-3 font-medium text-base sm:text-lg"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 sm:py-3 lg:py-4 rounded-lg text-base sm:text-lg border-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--warm-white)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-warm)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--warm-orange)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-warm)";
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-3 font-medium text-base sm:text-lg"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Time *
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 sm:py-3 lg:py-4 rounded-lg text-base sm:text-lg border-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--warm-white)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-warm)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--warm-orange)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-warm)";
                      }}
                    >
                      <option value="">Select time</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="17:30">5:30 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block mb-3 font-medium text-base sm:text-lg"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Party Size *
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 sm:py-3 lg:py-4 rounded-lg text-base sm:text-lg border-2 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--warm-white)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-warm)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--warm-orange)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border-warm)";
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num.toString()}>
                          {num} {num === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label
                  className="block mb-3 font-medium text-base sm:text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-4 rounded-lg text-base sm:text-lg border-2 focus:outline-none transition-colors resize-vertical"
                  style={{
                    backgroundColor: "var(--warm-white)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-warm)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--warm-orange)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-warm)";
                  }}
                  placeholder="Allergies, dietary restrictions, special occasions, etc."
                />
              </div>

              {/* Submit Button - Full width for better mobile UX */}
              <button
                type="submit"
                className="w-full btn-warm-primary px-8 py-4 sm:py-5 rounded-lg transition-all duration-300 font-bold text-lg sm:text-xl shadow-lg transform hover:scale-105"
              >
                Request Reservation
              </button>
            </form>
          </div>

          {/* Restaurant Information - Secondary content after form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Hours */}
            <div
              className="warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h3
                className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                Hours
              </h3>
              <div
                className="space-y-3 sm:space-y-4"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Monday - Thursday</span>
                  <span className="font-medium">11 AM - 10 PM</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Friday - Saturday</span>
                  <span className="font-medium">11 AM - 11 PM</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Sunday</span>
                  <span className="font-medium">12 PM - 9 PM</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div
              className="warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h3
                className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                Contact
              </h3>
              <div
                className="space-y-3 sm:space-y-4 text-base sm:text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <div>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--warm-orange)" }}
                  >
                    Phone:
                  </span>{" "}
                  (555) HORN-PUB
                </div>
                <div>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--warm-orange)" }}
                  >
                    Email:
                  </span>{" "}
                  reservations@hornpub.com
                </div>
                <div>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--warm-orange)" }}
                  >
                    Address:
                  </span>
                  <br />
                  <span className="text-sm sm:text-base">
                    123 Music Street
                    <br />
                    Downtown District
                    <br />
                    City, State 12345
                  </span>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div
              className="warm-card-gradient rounded-xl p-6 sm:p-8 shadow-lg sm:col-span-2 lg:col-span-1"
              style={{ border: "1px solid var(--border-warm)" }}
            >
              <h3
                className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6"
                style={{ color: "var(--warm-brown)" }}
              >
                Policies
              </h3>
              <div
                className="text-base sm:text-lg space-y-2 sm:space-y-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <p>• Reservations recommended, especially weekends</p>
                <p>• Large parties (8+) please call directly</p>
                <p>• 15-minute grace period for arrivals</p>
                <p>• Cancellations appreciated with 2+ hours notice</p>
                <p>• Live music Friday & Saturday evenings</p>
              </div>
            </div>
          </div>

          {/* Call-to-Action Section */}
          <div
            className="warm-card-gradient rounded-xl p-6 sm:p-8 lg:p-10 shadow-lg text-center"
            style={{ border: "1px solid var(--border-warm)" }}
          >
            <h3
              className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4"
              style={{ color: "var(--warm-brown)" }}
            >
              Questions About Your Reservation?
            </h3>
            <p
              className="text-base sm:text-lg lg:text-xl mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Our team is here to help make your dining experience perfect. Call
              us directly for immediate assistance or special arrangements.
            </p>
            <a
              href="tel:(555)467-6782"
              className="btn-warm-primary px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg shadow-lg hover:scale-105 inline-block"
            >
              Call (555) HORN-PUB
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationsPage;
