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
          <div className="japan-help-hero-points">
            {[...activeService.deliverables, ...activeService.capabilities].slice(0, 6).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
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
            <strong>{service.title}</strong>
            <small>{service.summary}</small>
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

      <section className="japan-help-expanded-scope">
        <div className="japan-help-section-heading">
          <span>Detailed Scope</span>
          <h2>More information about {activeService.title}</h2>
          <p>
            This section explains how the service is handled in practical
            business terms, so teams can understand what TALME coordinates,
            what gets tracked, and how the engagement moves forward.
          </p>
        </div>
        <div className="japan-help-scope-grid">
          {activeService.capabilities.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>
                TALME treats this as a structured workstream with clear inputs,
                responsible owners, practical checkpoints, and documentation
                support. The objective is to reduce confusion, keep stakeholder
                communication clear, and move the requirement from discussion to
                execution with measurable progress.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="japan-help-info-wall">
        <article>
          <span>Execution Model</span>
          <h2>What the engagement covers</h2>
          <p>{activeService.approach[0]}</p>
          <p>{activeService.approach[1]}</p>
        </article>
        <article>
          <span>Operating Control</span>
          <h2>How progress is managed</h2>
          <p>{activeService.approach[2]}</p>
          <p>
            TALME keeps communication structured through clear ownership,
            practical timelines, review points, and follow-up actions for every
            Japan-linked requirement.
          </p>
        </article>
        <article>
          <span>Business Fit</span>
          <h2>Where this creates value</h2>
          <p>{activeService.idealFor}</p>
          <p>
            The service is useful when teams need local coordination, stronger
            documentation, dependable communication, and senior visibility
            without building every process from scratch.
          </p>
        </article>
      </section>

      <section className="japan-help-process">
        <div className="japan-help-section-heading">
          <span>Delivery Flow</span>
          <h2>How TALME moves the work from request to completion</h2>
        </div>
        <div className="japan-help-process-grid">
          <article>
            <strong>01</strong>
            <h3>Requirement Review</h3>
            <p>
              TALME confirms the business objective, stakeholders, geography,
              timeline, expected output, and any Japan-specific coordination
              needs before execution starts.
            </p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Plan and Documentation</h3>
            <p>
              The team prepares checklists, required documents, meeting notes,
              role definitions, vendor inputs, or travel information depending
              on the selected service.
            </p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Coordination and Tracking</h3>
            <p>
              Progress is managed through updates, follow-ups, owner mapping,
              issue tracking, and clear communication between TALME, clients,
              partners, candidates, vendors, or visiting teams.
            </p>
          </article>
          <article>
            <strong>04</strong>
            <h3>Closure and Next Actions</h3>
            <p>
              TALME closes the work with a summary of actions completed,
              pending decisions, recommended next steps, and practical handover
              notes for continued execution.
            </p>
          </article>
        </div>
      </section>

      <section className="japan-help-text-section">
        <div className="japan-help-section-heading">
          <span>Service Detail</span>
          <h2>In-depth information for {activeService.title}</h2>
        </div>
        <div className="japan-help-text-columns">
          <article>
            <h3>Business context</h3>
            <p>
              {activeService.title} is designed for organizations that need
              dependable Japan-linked support without losing time in fragmented
              coordination. Many cross-border initiatives slow down because
              business teams, HR teams, technical stakeholders, vendors, and
              local contacts are working from different assumptions. TALME
              brings these moving parts into one managed workflow so the
              requirement can be understood, organized, tracked, and completed
              with clearer ownership.
            </p>
            <p>
              The service is especially useful when a company needs practical
              execution support instead of only high-level advice. TALME helps
              convert the requirement into action items, confirms what
              information is needed, aligns the right stakeholders, and keeps
              the engagement focused on business outcomes such as speed,
              clarity, compliance discipline, communication quality, and
              readiness for the next decision.
            </p>
          </article>
          <article>
            <h3>How the work is handled</h3>
            <p>
              The engagement begins with a review of the business objective,
              timeline, decision makers, dependencies, current gaps, and the
              practical result expected from the work. Based on that review,
              TALME creates a structured plan covering the required information,
              coordination steps, documentation, communication rhythm, and
              follow-up process. This makes the service easier for management
              teams to monitor and easier for operating teams to execute.
            </p>
            <p>
              During delivery, TALME supports activities connected to{" "}
              {activeService.capabilities.join(", ")}. Each activity is handled
              with attention to accuracy, stakeholder communication, and
              operational usefulness. The goal is not only to complete tasks,
              but to give the client a clearer view of status, risks, pending
              inputs, and the next practical step.
            </p>
          </article>
          <article>
            <h3>What clients can expect</h3>
            <p>
              Clients can expect working outputs such as{" "}
              {activeService.deliverables.join(", ")}. These outputs help teams
              avoid scattered information, repeated follow-ups, unclear
              responsibilities, and slow decision cycles. TALME keeps the
              service grounded in usable documentation and structured
              communication so the work can continue smoothly even when several
              parties are involved.
            </p>
            <p>
              The expected value includes {activeService.outcomes.join(", ")}.
              For TALME, a successful engagement means the client has a better
              operating view, fewer coordination gaps, stronger follow-through,
              and enough information to move confidently into the next stage of
              market entry, hiring, compliance, sourcing, travel, interpretation,
              or business development.
            </p>
          </article>
        </div>
      </section>

      <section className="japan-help-detail-stack">
        <article className="japan-help-detail-card japan-help-detail-card-wide">
          <span>How TALME Supports</span>
          <h2>Practical execution from first discussion to operational follow-through.</h2>
          {activeService.approach.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </article>

        <article className="japan-help-detail-card">
          <span>What You Receive</span>
          <h2>Key Deliverables</h2>
          <ul>
            {activeService.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="japan-help-detail-card japan-help-fit-card">
          <span>Ideal For</span>
          <h2>Where This Service Fits Best</h2>
          <p>{activeService.idealFor}</p>
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
          <ul>
            {[...activeService.outcomes, ...activeService.deliverables].slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default JapanHelpDeskPage;
