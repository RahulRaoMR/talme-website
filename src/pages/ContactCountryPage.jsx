import { Link, useParams } from "react-router-dom";
import "./ContactCountryPage.css";

const contactByCountry = {
  india: {
    title: "India Offices",
    cityLabel: "India",
    offices: [
      {
        label: "Bangalore Office",
        intro: "Better yet, see us in person!",
        address:
          "No.24, Vital Mallya Road, Level 14, Concorde Towers, UB City, Bangalore, Karnataka 560001, India.",
        hours: "Open today 09:00 am - 05:00 pm",
        directions: "https://maps.google.com/?q=UB+City+Bangalore",
        mapSrc:
          "https://maps.google.com/maps?q=UB%20City%20Bangalore&t=&z=13&ie=UTF8&iwloc=&output=embed",
      },
      {
        label: "Ahmedabad Office",
        intro: "Better yet, see us in person!",
        address:
          "Regus - Ahmedabad, Ratnakar 9 Square 11th Floor, A Wing, Ratnakar Nine Square, 1107, opp. ITC Narmada, Keshavbaug, Vastrapur, Ahmedabad, Gujarat 380015.",
        hours: "Open today 09:00 am - 05:00 pm",
        directions: "https://maps.app.goo.gl/9MdAKfGyHyTxQZcp6",
        mapSrc:
          "https://maps.google.com/maps?q=Regus%20Ahmedabad%20Ratnakar%209%20Square%201107%20opp%20ITC%20Narmada%20Vastrapur%20Ahmedabad%20Gujarat%20380015&t=&z=16&ie=UTF8&iwloc=&output=embed",
      },
    ],
  },

  singapore: {
    title: "Singapore Office",
    cityLabel: "Singapore",
    offices: [
      {
        label: "Singapore Office",
        intro: "Better yet, see us in person!",
        address: "8 Marina Blvd, Singapore 018981.",
        hours: "Open today 09:00 am - 05:00 pm",
        directions: "https://maps.google.com/?q=8+Marina+Blvd+Singapore+018981",
        mapSrc:
          "https://maps.google.com/maps?q=8%20Marina%20Blvd%20Singapore%20018981&t=&z=16&ie=UTF8&iwloc=&output=embed",
      },
    ],
  },
};

function ContactCountryPage() {
  const { country = "" } = useParams();
  const office = contactByCountry[country.toLowerCase()];

  if (!office) {
    return (
      <main className="country-contact-page">
        <section className="country-contact-container not-found">
          <h1>Location Not Found</h1>
          <p>Please choose India or Singapore from GLOBAL.</p>
          <Link to="/contact" className="country-back-link">
            Back to Contact
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="country-contact-page">
      <section className="country-contact-container">
        <header className="country-contact-header">
          <h1>{office.title}</h1>
          <p>Premium contact support for enterprise and growth-stage clients.</p>
        </header>

        <div className="country-contact-list">
          {office.offices.map((location) => (
            <div className="country-contact-card" key={location.label}>
              <div className="country-contact-details">
                <h2>Contact Us</h2>
                <h3>{location.label}</h3>
                <p className="country-intro">{location.intro}</p>
                <p>{location.address}</p>
                <p className="country-hours">{location.hours}</p>
                <a href={location.directions} target="_blank" rel="noreferrer">
                  Get Directions
                </a>
              </div>

              <div className="country-contact-map-wrap">
                <iframe
                  title={`${location.label} map`}
                  src={location.mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="country-contact-map"
                />
              </div>
            </div>
          ))}
        </div>

        <Link to="/contact" className="country-back-link">
          Back to All Locations
        </Link>
      </section>
    </main>
  );
}

export default ContactCountryPage;
