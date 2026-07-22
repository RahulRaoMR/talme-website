import { useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

const footerSections = [
  {
    title: "Managed Services",
    links: [
      { label: "Client Accounting Services", to: "/client-accounting" },
      { label: "People Practice", to: "/people-practice" },
      { label: "Business Services", to: "/business-services" },
      { label: "Compliance Management", to: "/service-hub/compliance-management" },
    ],
  },
  {
    title: "Assurance",
    links: [
      { label: "Audit Services", to: "/service-hub/audit-services" },
      { label: "Accounting Advisory", to: "/service-hub/accounting-advisory" },
      { label: "Quality Enablement", to: "/service-hub/quality-enablement" },
    ],
  },
  {
    title: "Risk Advisory",
    links: [
      { label: "Internal Audit", to: "/service-hub/internal-audit" },
      { label: "SOX Compliance", to: "/service-hub/sox-compliance" },
      { label: "Technology Risk", to: "/service-hub/technology-risk" },
      { label: "Process Transformation", to: "/service-hub/process-transformation" },
    ],
  },
  {
    title: "Consulting",
    links: [
      { label: "Financial Advisory", to: "/service-hub/financial-advisory" },
      { label: "Startup Advisory", to: "/service-hub/startup-advisory" },
      { label: "BPM Solutions", to: "/service-hub/bpm-solutions" },
      { label: "Virtual CFO Services", to: "/service-hub/virtual-cfo-services" },
    ],
  },
  {
    title: "Digital",
    links: [
      { label: "Digital Enablement", to: "/service-hub/digital-enablement" },
      { label: "Data Analytics", to: "/service-hub/data-analytics" },
      { label: "Intelligent Automation", to: "/service-hub/intelligent-automation" },
      { label: "Enterprise Solutions", to: "/service-hub/enterprise-solutions" },
    ],
  },
];

function Footer() {
  const [openSection, setOpenSection] = useState("Managed Services");

  return (
    <footer className="footer">
      <div className="footer-columns">
        {footerSections.map((section) => {
          const isOpen = openSection === section.title;

          return (
            <section className={`footer-column ${isOpen ? "is-open" : ""}`} key={section.title}>
              <button
                type="button"
                className="footer-column-toggle"
                onClick={() => setOpenSection(isOpen ? "" : section.title)}
                aria-expanded={isOpen}
              >
                <h4>{section.title}</h4>
                <span>{isOpen ? "-" : "+"}</span>
              </button>

              <div className="footer-column-links">
                {section.links.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="footer-social">
  <a
    href="https://wa.me/918048795189"
    target="_blank"
    rel="noreferrer"
  >
    <FaWhatsapp />
  </a>

        <a
          href="https://www.instagram.com/talme_tech?igsh=bm5nbXBydTAwdHNh"
          target="_blank"
          rel="noreferrer"
        >
          <FaInstagram />
        </a>

        <a
          href="https://www.linkedin.com/company/talme-technologies/posts/?feedView=all"
          target="_blank"
          rel="noreferrer"
        >
          <FaLinkedin />
        </a>

        <a href="https://www.facebook.com/share/1AZNp8ciy4/?mibextid=wwXIfr" target="_blank" rel="noreferrer">
          <FaFacebook />
        </a>
      </div>

      <div className="footer-bottom">
        <span>Copyright 2026 TALME Technologies Pvt Ltd. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
