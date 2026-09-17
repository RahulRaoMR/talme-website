import "./OurClientsPage.css";

const clientLogos = [
  { name: "L&T Technology Services", logo: "https://logo.clearbit.com/ltts.com" },
  { name: "PAMP Technologies", logo: "https://logo.clearbit.com/pamp.com" },
  { name: "VVDN Technologies", logo: "https://logo.clearbit.com/vvdntech.com" },
  { name: "HL Klemove", logo: "https://logo.clearbit.com/hlklemove.com" },
  { name: "Yokogawa", logo: "https://logo.clearbit.com/yokogawa.com" },
  { name: "SLK", logo: "https://logo.clearbit.com/slksoftware.com" },
  { name: "Edwards", logo: "https://logo.clearbit.com/edwardsvacuum.com" },
  { name: "MindIT", logo: "https://logo.clearbit.com/mindit.io" },
  { name: "Leadsoc", logo: "https://logo.clearbit.com/leadsoc.com" },
  { name: "Enparadigm", logo: "https://logo.clearbit.com/enparadigm.com" },
  { name: "ThoughtFocus", logo: "https://logo.clearbit.com/thoughtfocus.com" },
  { name: "Quinnel Soft", logo: "https://logo.clearbit.com/quinnelsoft.com" },
  { name: "Aquimo", logo: "https://logo.clearbit.com/aquimo.com" },
];

function OurClientsPage() {
  return (
    <main className="clients-page">
      <section className="clients-hero">
        <p>Trust and Partnerships</p>
        <h1>Our Clients</h1>
        <p>
          We support enterprise and growth organizations with engineering,
          operations, staffing, and transformation services.
        </p>
      </section>

      <section className="clients-grid-wrap">
        <h2>Organizations We Work With</h2>
        <div className="clients-board">
          {clientLogos.map((client) => (
            <article className="client-logo-item" key={client.name}>
              <img
                src={client.logo}
                alt={client.name}
                loading="lazy"
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.dataset.fallbackApplied === "true") return;
                  img.dataset.fallbackApplied = "true";
                  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    client.name
                  )}&background=0b244a&color=ffffff&bold=true&size=200&format=svg`;
                }}
              />
              <p>{client.name}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default OurClientsPage;
