import { createElement } from "react";
import CountUp from "react-countup";
import "./Services.css";
import {
  FaBoxOpen,
  FaCar,
  FaCogs,
  FaDesktop,
  FaMicrochip,
  FaRocket,
  FaIndustry,
  FaTools,
} from "react-icons/fa";

const serviceItems = [
  { label: "Product Life Cycle Management", Icon: FaBoxOpen },
  { label: "Automotive Engineering", Icon: FaCar },
  { label: "Engineering Software Services", Icon: FaDesktop },
  { label: "Mechanical Engineering Services", Icon: FaCogs },
  { label: "VLSI Services", Icon: FaMicrochip },
  { label: "Aerospace Engineering Services", Icon: FaRocket },
  { label: "Oil and Gas Services", Icon: FaIndustry },
  { label: "Original Equipment Manufacture (OEM)", Icon: FaTools },
];

function Services() {
  return (
    <section className="services" id="home-services">
      <div className="services-header">
        <h2 className="services-heading">Our Services</h2>
        <p>
          End-to-end capabilities across engineering, digital, and workforce
          operations for enterprise growth.
        </p>
      </div>

      <div className="stats-section">
        <div className="stat-box">
          <h3>
            <CountUp end={500} duration={3} enableScrollSpy scrollSpyOnce />+
          </h3>
          <p>Projects Completed</p>
        </div>

        <div className="stat-box">
          <h3>
            <CountUp end={3} duration={3} enableScrollSpy scrollSpyOnce />
          </h3>
          <p>Global Offices</p>
        </div>

        <div className="stat-box">
          <h3>
            <CountUp end={12} duration={3} enableScrollSpy scrollSpyOnce />+
          </h3>
          <p>Years of Experience</p>
        </div>

        <div className="stat-box">
          <h3>
            <CountUp
              end={300}
              duration={3}
              separator=","
              enableScrollSpy
              scrollSpyOnce
            />
            +
          </h3>
          <p>Employees</p>
        </div>
      </div>

      <div className="services-grid">
        {serviceItems.map(({ label, Icon }) => (
          <article className="service-card" key={label}>
            <span className="icon-wrap">
              {createElement(Icon, { className: "icon" })}
            </span>
            <p>{label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Services;
