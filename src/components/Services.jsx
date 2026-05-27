import { createElement } from "react";
import CountUp from "react-countup";
import "./Services.css";
import {
  FaHeartbeat,
  FaLaptopCode,
  FaCogs,
  FaGlobe,
  FaBoxOpen,
  FaVideo,
  FaRobot,
  FaDesktop,
  FaMicrochip,
  FaCar,
  FaCloud,
  FaRocket,
  FaLightbulb,
  FaIndustry,
  FaTools,
  FaCog,
} from "react-icons/fa";

const serviceItems = [
  { label: "Healthcare Services", Icon: FaHeartbeat },
  { label: "IT Services", Icon: FaLaptopCode },
  { label: "Mechanical Engineering Services", Icon: FaCogs },
  { label: "Outsourcing and Offshoring Services", Icon: FaGlobe },
  { label: "Product Life Cycle Management", Icon: FaBoxOpen },
  { label: "Video Interviewing", Icon: FaVideo },
  { label: "Robotic Process Automation", Icon: FaRobot },
  { label: "Engineering Software Solutions", Icon: FaDesktop },
  { label: "VLSI Services", Icon: FaMicrochip },
  { label: "Automotive Services", Icon: FaCar },
  { label: "Cloud Engineering Services", Icon: FaCloud },
  { label: "Aerospace Engineering Services", Icon: FaRocket },
  { label: "Business Solutions", Icon: FaLightbulb },
  { label: "Oil and Gas Services", Icon: FaIndustry },
  { label: "Original Equipment Manufacture (OEM)", Icon: FaTools },
  { label: "Other Engineering Services", Icon: FaCog },
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

      <div className="stats-section">
        <div className="stat-box">
          <h3>
            <CountUp end={500} duration={3} enableScrollSpy scrollSpyOnce />+
          </h3>
          <p>Projects Completed</p>
        </div>

        <div className="stat-box">
          <h3>
            <CountUp end={2} duration={3} enableScrollSpy scrollSpyOnce />
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
    </section>
  );
}

export default Services;
