import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
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