import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ContactPage.css";

const officeLocations = [
  {
    country: "India",
    offices: [
      {
        label: "India Office",
        address:
          "No.24, Vital Mallya Road, Level 14, Concorde Towers, UB City, Bangalore, Karnataka 560001, India.",
        directions: "https://maps.google.com/?q=UB+City+Bangalore",
      },
      {
        label: "Ahmedabad Office",
        address:
          "Regus - Ahmedabad, Ratnakar 9 Square 11th Floor, A Wing, Ratnakar Nine Square, 1107, opp. ITC Narmada, Keshavbaug, Vastrapur, Ahmedabad, Gujarat 380015.",
        directions: "https://maps.app.goo.gl/9MdAKfGyHyTxQZcp6",
      },
    ],
  },
  {
    country: "Singapore",
    offices: [
      {
        label: "Singapore Office",
        address: "8 Marina View, Singapore 018981.",
        directions: "https://maps.google.com/?q=8+Marina+View+Singapore+018981",
      },
    ],
  },
];

function ContactPage() {
  const { hash } = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    message: "",
    consent: false,
  });
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!hash) return;
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          companyName: formData.companyName.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          consent: formData.consent,
        }),
      });

      const rawResponse = await response.text();
      const result = rawResponse ? JSON.parse(rawResponse) : {};

      if (!response.ok) {
        throw new Error(result.error || "Unable to send your message.");
      }

      setFormData({
        name: "",
        companyName: "",
        email: "",
        message: "",
        consent: false,
      });
      setStatus("success");
      setFeedback("Your message has been sent successfully.");
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error ? error.message : "Unable to send your message."
      );
    }
  };

  return (
    <main className="contact-premium-page">
      <header className="contact-hero">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80"
          alt="Corporate office environment"
        />
        <div className="contact-hero-overlay">
          <h1>Contact Us</h1>
        </div>
      </header>

      <section className="contact-main-grid">
        <div className="contact-left-col">
          <p className="contact-intro">
            For over 20 years, we have built capabilities for partnering with
            global organizations and growth-stage businesses. Our team provides
            enterprise-ready engineering and staffing support across industries.
          </p>

          {officeLocations.map((country) => (
            <section
              key={country.country}
              className="country-block"
              id={country.country.toLowerCase()}
            >
              <h2>{country.country}</h2>
              <div className="office-list">
                {country.offices.map((office) => (
                  <article className="office-card" key={office.label}>
                    <h3>{office.label}</h3>
                    <p>{office.address}</p>
                    <a href={office.directions} target="_blank" rel="noreferrer">
                      Get Directions
                    </a>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="contact-right-col">
          <section className="contact-form-card">
            <h2>Get in touch with us</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name*"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="companyName"
                placeholder="Company Name*"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
              />
              <label className="contact-consent">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                />
                <span>
                  I confirm, I have read and agree to TALME Privacy Notice.
                </span>
              </label>
              <button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending..." : "Send"}
              </button>
            </form>
            {feedback ? (
              <p
                className={`contact-form-feedback ${
                  status === "success" ? "is-success" : "is-error"
                }`}
              >
                {feedback}
              </p>
            ) : null}
          </section>

          <section className="contact-coordinates-card">
            <h3>Contact Coordinates</h3>
            <div className="coordinates-grid">
              <div>
                <p>We can definitely help you.</p>
                <a href="tel:+918048795189">+91 80 4879 5189</a>
              </div>
              <div>
                <p>
                  Whether you are a startup or a large enterprise, we have
                  solutions that can make a difference.
                </p>
                <a href="mailto:info@talme.in">info@talme.in</a>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default ContactPage;
