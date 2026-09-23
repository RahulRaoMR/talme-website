import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-columns">
        <section className="footer-column footer-services-column is-open">
          <button type="button" className="footer-column-toggle" aria-expanded="true">
            <h4>Services</h4>
            <span>-</span>
          </button>
          <div className="footer-column-links footer-services-links">
            <Link to="/services/engineering-solutions">Engineering Solutions</Link>
            <Link to="/services/staff-augmentation">Staff Augmentation</Link>
            <Link to="/services/health-care-services">Health Care Services</Link>
            <Link to="/services/computer-technology">Computer Technology</Link>
            <Link to="/services/business-solutions">Business Solutions</Link>
            <Link to="/services/product-manufacturing">Product Manufacturing</Link>
          </div>
        </section>
      </div>

      <div className="footer-social">
        <a href="https://wa.me/918048795189" target="_blank" rel="noreferrer">
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

        <a
          href="https://www.facebook.com/share/1AZNp8ciy4/?mibextid=wwXIfr"
          target="_blank"
          rel="noreferrer"
        >
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
