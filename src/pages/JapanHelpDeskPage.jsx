import { Link, Navigate, useParams } from "react-router-dom";
import { getJapanHelpDeskService, japanHelpDeskServices } from "../data/japanHelpDeskData";
import "./JapanHelpDeskPage.css";

function JapanHelpDeskPage() {
  const { slug } = useParams();
  const activeService = slug
    ? getJapanHelpDeskService(slug)
    : japanHelpDeskServices[0];

  if (!activeService) {
    return <Navigate to="/japan-help-desk" replace />;
  }

  return (
    <main className="japan-help-page">
      <section className="japan-help-hero">
        <div className="japan-help-hero-copy">
          <p className="japan-help-kicker">Japan Help Desk</p>
          <h1>{activeService.title}</h1>
          <p>{activeService.summary}</p>
          <div className="japan-help-actions">
            <Link to="/contact" className="japan-help-primary">Talk to TALME</Link>
            <a href="#japan-help-services" className="japan-help-secondary">View Services</a>
          </div>
        </div>
        <div className="japan-help-hero-media">
          <img src={activeService.image} alt={`${activeService.title} support`} />
        </div>
      </section>

      <nav id="japan-help-services" className="japan-help-service-strip" aria-label="Japan Help Desk services">
        {japanHelpDeskServices.map((service) => (
          <Link
            key={service.slug}
            to={`/japan-help-desk/${service.slug}`}
            className={service.slug === activeService.slug ? "active" : ""}
          >
            {service.title}
          </Link>
        ))}
      </nav>

      <section className="japan-help-overview">
        <article className="japan-help-panel japan-help-panel-lead">
          <span>Cross-border execution</span>
          <h2>Built for Japan-linked growth, hiring, visits, and operating support.</h2>
          {activeService.overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <aside className="japan-help-snapshot">
          <h3>Service Snapshot</h3>
          <dl>
            <div>
              <dt>Region</dt>
              <dd>Japan, India, Singapore</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Advisory, coordination, staffing, compliance</dd>
            </div>
            <div>
              <dt>Best for</dt>
              <dd>Expansion teams, HR leaders, engineering firms, visiting delegations</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="japan-help-content-grid">
        <article>
          <h2>Core Capabilities</h2>
          <ul>
            {activeService.capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Business Outcomes</h2>
          <ul>
            {activeService.outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="japan-help-gallery" aria-label="Japan Help Desk visual highlights">
        <img src={activeService.image} alt="Japan Help Desk business support" />
        <div>
          <h2>Designed for senior, practical execution.</h2>
          <p>
            TALME combines business advisory, people operations, technical staffing,
            language support, and visit coordination into one dependable Japan Help Desk.
          </p>
        </div>
      </section>
    </main>
  );
}

export default JapanHelpDeskPage;