import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { japanHelpDeskServices } from "../data/japanHelpDeskData";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isJapanHelpOpen, setIsJapanHelpOpen] = useState(false);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsGlobalOpen(false);
    setIsServicesOpen(false);
    setIsJapanHelpOpen(false);
  }, [location.pathname]);

  const searchItems = [
    { label: "Home", to: "/" },
    { label: "News & Events", to: "/news-events" },
    { label: "About Us", to: "/about" },
    { label: "Leadership", to: "/leadership" },
    { label: "Insights", to: "/insights" },
    { label: "Our Clients", to: "/our-clients" },
    { label: "Careers", to: "/careers" },
    { label: "Contact Us", to: "/contact" },
    { label: "Japan Help Desk", to: "/japan-help-desk" },
    ...japanHelpDeskServices.map((service) => ({
      label: service.title,
      to: `/japan-help-desk/${service.slug}`,
    })),
    { label: "Managed Services", to: "/managed-services" },
    { label: "Assurance", to: "/assurance" },
    { label: "Client Accounting Services", to: "/client-accounting" },
    { label: "People Practice", to: "/people-practice" },
    { label: "Business Services", to: "/business-services" },
    { label: "Compliance Management", to: "/service-hub/compliance-management" },
    { label: "Audit Services", to: "/service-hub/audit-services" },
    { label: "Accounting Advisory", to: "/service-hub/accounting-advisory" },
    { label: "Quality Enablement", to: "/service-hub/quality-enablement" },
    { label: "Internal Audit", to: "/service-hub/internal-audit" },
    { label: "SOX Compliance", to: "/service-hub/sox-compliance" },
    { label: "Technology Risk", to: "/service-hub/technology-risk" },
    { label: "Process Transformation", to: "/service-hub/process-transformation" },
    { label: "Financial Advisory", to: "/service-hub/financial-advisory" },
    { label: "Startup Advisory", to: "/service-hub/startup-advisory" },
    { label: "BPM Solutions", to: "/service-hub/bpm-solutions" },
    { label: "Virtual CFO Services", to: "/service-hub/virtual-cfo-services" },
    { label: "Digital Enablement", to: "/service-hub/digital-enablement" },
    { label: "Data Analytics", to: "/service-hub/data-analytics" },
    { label: "Intelligent Automation", to: "/service-hub/intelligent-automation" },
    { label: "Enterprise Solutions", to: "/service-hub/enterprise-solutions" },
    { label: "Engineering Solutions", to: "/services/engineering-solutions" },
    { label: "Staff Augmentation", to: "/services/staff-augmentation" },
    { label: "Health Care Services", to: "/services/health-care-services" },
    { label: "Computer Technology", to: "/services/computer-technology" },
    { label: "Business Solutions", to: "/services/business-solutions" },
    { label: "Product Manufacturing", to: "/services/product-manufacturing" },
    { label: "India Contact", to: "/contact/india" },
    { label: "Singapore Contact", to: "/contact/singapore" },
  ];

  const globalLocations = [
    {
      label: "India",
      flag: "IN",
      flagIcon: "https://flagcdn.com/w40/in.png",
      to: "/contact/india",
    },
    {
      label: "Singapore",
      flag: "SG",
      flagIcon: "https://flagcdn.com/w40/sg.png",
      to: "/contact/singapore",
    },
  ];

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const closeAllMenus = () => {
    closeSearch();
    setIsGlobalOpen(false);
    setIsServicesOpen(false);
    setIsJapanHelpOpen(false);
  };

  const handleSearchToggle = (event) => {
    event.preventDefault();
    setIsSearchOpen((prev) => {
      const nextIsOpen = !prev;
      if (nextIsOpen) {
        setIsGlobalOpen(false);
        setIsServicesOpen(false);
        setIsJapanHelpOpen(false);
      } else {
        setSearchQuery("");
      }
      return nextIsOpen;
    });
  };

  const handleGlobalToggle = (event) => {
    event.preventDefault();
    setIsGlobalOpen((prev) => {
      const nextIsOpen = !prev;
      if (nextIsOpen) {
        closeSearch();
        setIsServicesOpen(false);
        setIsJapanHelpOpen(false);
      }
      return nextIsOpen;
    });
  };

  const handleServicesToggle = () => {
    setIsServicesOpen((prev) => {
      const nextIsOpen = !prev;
      if (nextIsOpen) {
        closeSearch();
        setIsGlobalOpen(false);
        setIsJapanHelpOpen(false);
      }
      return nextIsOpen;
    });
  };

  const handleJapanHelpToggle = () => {
    setIsJapanHelpOpen((prev) => {
      const nextIsOpen = !prev;
      if (nextIsOpen) {
        closeSearch();
        setIsGlobalOpen(false);
        setIsServicesOpen(false);
      }
      return nextIsOpen;
    });
  };

  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return searchItems
      .filter((item) => item.label.toLowerCase().includes(query))
      .slice(0, 7);
  }, [searchQuery]);

  const navigateToSearchResult = (to) => {
    navigate(to);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const navigateAndCloseMenus = (event, to) => {
    event.preventDefault();
    closeAllMenus();
    navigate(to);
  };

  return (
    <header className="navbar-shell">
      <div className="navbar-top-row">
        <Link to="/" className="brand-link" aria-label="Talme Home">
          <img src="/logo.png" alt="Talme Logo" className="brand-logo" />
        </Link>

        <nav className="navbar-top" aria-label="Top navigation">
          <ul className="top-links">
            <li><a href="/">Home</a></li>
            <li><Link to="/news-events" onPointerDown={closeAllMenus} onClick={closeAllMenus}>News &amp; Events</Link></li>
            <li><Link to="/about" onPointerDown={closeAllMenus} onClick={closeAllMenus}>About Us</Link></li>
            <li><Link to="/leadership" onPointerDown={closeAllMenus} onClick={closeAllMenus}>Leadership</Link></li>
            <li><Link to="/insights" onPointerDown={closeAllMenus} onClick={closeAllMenus}>Insights</Link></li>
            <li><Link to="/our-clients" onPointerDown={closeAllMenus} onClick={closeAllMenus}>Our Clients</Link></li>
            <li><Link to="/careers" onPointerDown={closeAllMenus} onClick={closeAllMenus}>Careers</Link></li>
            <li><Link to="/contact" onPointerDown={closeAllMenus} onClick={closeAllMenus}>Contact Us</Link></li>
            <li className="search-link">
              <button
                type="button"
                className="search-toggle"
                aria-label="Toggle search"
                aria-expanded={isSearchOpen}
                onClick={handleSearchToggle}
              >
                Search
              </button>
              {isSearchOpen && (
                <div className="search-box">
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search pages and services..."
                    aria-label="Search input"
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && filteredSearchItems.length > 0) {
                        navigateToSearchResult(filteredSearchItems[0].to);
                      }
                    }}
                  />
                  {searchQuery.trim() && (
                    <ul className="search-results">
                      {filteredSearchItems.length > 0 ? (
                        filteredSearchItems.map((item) => (
                          <li key={item.to}>
                            <button
                              type="button"
                              onClick={() => navigateToSearchResult(item.to)}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="search-no-result">No matching pages found</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </li>
            <li className="global-link">
              <button
                type="button"
                className="global-toggle"
                aria-label="Toggle global locations"
                aria-expanded={isGlobalOpen}
                onClick={handleGlobalToggle}
              >
                GLOBAL <span className="arrow">&#9662;</span>
              </button>
              {isGlobalOpen && (
                <ul className="global-menu">
                  {globalLocations.map((globalLocation) => (
                    <li key={globalLocation.flag}>
                      <Link
                        to={globalLocation.to}
                        onClick={(event) => navigateAndCloseMenus(event, globalLocation.to)}
                      >
                        <img
                          className="global-flag"
                          src={globalLocation.flagIcon}
                          alt={`${globalLocation.label} flag`}
                        />
                        <span className="global-location-label">{globalLocation.label}</span>
                        <span className="global-location-code">{globalLocation.flag}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <a href="https://hrms.talme.in/" target="_blank" rel="noreferrer">
                INTRANET
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="navbar-divider" />

      <nav className="navbar-bottom" aria-label="Service navigation">
        <ul className="service-links">
          <li className={`japan-dropdown ${isJapanHelpOpen ? "open" : ""}`}>
            <button
              type="button"
              className="japan-toggle"
              aria-expanded={isJapanHelpOpen}
              onClick={handleJapanHelpToggle}
            >
              JAPAN HELP DESK <span className="arrow-up">&#94;</span>
            </button>
            <ul className="japan-menu">
              {japanHelpDeskServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/japan-help-desk/${service.slug}`}
                    onPointerDown={closeAllMenus} onClick={closeAllMenus}
                  >
                    {service.title.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li><Link to="/managed-services" onPointerDown={closeAllMenus} onClick={closeAllMenus}>MANAGED SERVICES</Link></li>
          <li><Link to="/assurance" onPointerDown={closeAllMenus} onClick={closeAllMenus}>ASSURANCE</Link></li>
          <li className={`services-dropdown ${isServicesOpen ? "open" : ""}`}>
            <button
              type="button"
              className="services-toggle"
              aria-expanded={isServicesOpen}
              onClick={handleServicesToggle}
            >
              SERVICES <span className="arrow-up">&#94;</span>
            </button>
            <ul className="services-menu">
              <li><Link to="/services/engineering-solutions" onPointerDown={closeAllMenus} onClick={closeAllMenus}>ENGINEERING SOLUTIONS</Link></li>
              <li><Link to="/services/staff-augmentation" onPointerDown={closeAllMenus} onClick={closeAllMenus}>STAFF AUGMENTATION</Link></li>
              <li><Link to="/services/health-care-services" onPointerDown={closeAllMenus} onClick={closeAllMenus}>HEALTH CARE SERVICES</Link></li>
              <li><Link to="/services/computer-technology" onPointerDown={closeAllMenus} onClick={closeAllMenus}>COMPUTER TECHNOLOGY</Link></li>
              <li><Link to="/services/business-solutions" onPointerDown={closeAllMenus} onClick={closeAllMenus}>BUSINESS SOLUTIONS</Link></li>
              <li><Link to="/services/product-manufacturing" onPointerDown={closeAllMenus} onClick={closeAllMenus}>PRODUCT MANUFACTURING</Link></li>
            </ul>
          </li>
          <li><Link to="/service-hub/financial-advisory" onPointerDown={closeAllMenus} onClick={closeAllMenus}>CONSULTING</Link></li>
          <li><Link to="/service-hub/digital-enablement" onPointerDown={closeAllMenus} onClick={closeAllMenus}>DIGITAL</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;