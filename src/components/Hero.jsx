import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-video-bg" aria-hidden="true">
        <div className="hero-video-sky" />
        <div className="hero-video-building">
          {Array.from({ length: 30 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="hero-video-lines" />
        <div className="hero-video-wordmark">TALME</div>
      </div>
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-kicker">Engineering. Talent. Transformation.</span>
          <h1>TALME</h1>
          <h2>Corporate delivery engineered for visible outcomes.</h2>
          <p>
            TALME partners with ambitious enterprises to strengthen delivery,
            accelerate execution, and build scalable operating models across
            engineering, staffing, and digital transformation.
          </p>

          <div className="hero-actions">
            <Link to="/managed-services" className="hero-btn hero-btn-primary">
              Explore Capabilities
            </Link>
            <Link to="/contact" className="hero-btn hero-btn-secondary">
              Speak With TALME
            </Link>
          </div>

          <div className="hero-trust">
            <div>
              <strong>500+</strong>
              <span>Projects</span>
            </div>
            <div>
              <strong>12+</strong>
              <span>Years</span>
            </div>
            <div>
              <strong>Global</strong>
              <span>Delivery Reach</span>
            </div>
          </div>
        </div>

        <aside className="hero-panel">
          <div className="hero-panel-card hero-panel-card-primary">
            <span className="hero-panel-label">Executive Snapshot</span>
            <h2>Premium execution for enterprises that expect precision.</h2>
            <p>
              TALME blends engineering depth, structured governance, and
              delivery discipline to support scale with confidence.
            </p>
          </div>

          <div className="hero-panel-grid">
            <article className="hero-panel-card">
              <span className="hero-panel-metric">Boardroom Ready</span>
              <p>Operational visibility, decision support, and disciplined execution.</p>
            </article>
            <article className="hero-panel-card">
              <span className="hero-panel-metric">Global Reach</span>
              <p>Cross-border support models for delivery continuity and scale.</p>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Hero;
