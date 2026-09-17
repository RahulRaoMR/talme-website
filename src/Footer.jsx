import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-columns">
        <div className="footer-column">
          <h4>MANAGED SERVICES</h4>
          <p>Client Accounting Services</p>
          <p>People Practice</p>
          <p>Business Services</p>
          <p>Compliance Management</p>
        </div>

        <div className="footer-column">
          <h4>DIGITAL</h4>
          <p>Digital Enablement</p>
          <p>Data Analytics</p>
          <p>Intelligent Automation</p>
          <p>Enterprise Solutions</p>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 TALME Technologies. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;