import { Link } from "react-router-dom";
import "./SearchTopics.css";

const topicGroups = [
  {
    title: "Company and Client Pages",
    items: [
      {
        label: "About Us",
        to: "/about",
        description:
          "Learn about Talme Technologies, our delivery approach, engineering focus, and consulting capabilities.",
      },
      {
        label: "Our Clients",
        to: "/our-clients",
        description:
          "Explore how Talme supports clients across engineering, staffing, operations, and transformation programs.",
      },
      {
        label: "Client Accounting Services",
        to: "/client-accounting",
        description:
          "Review Talme client accounting services for reporting, control, compliance, and finance operations support.",
      },
      {
        label: "Job Descriptions and Careers",
        to: "/careers",
        description:
          "Browse careers, job descriptions, and application information for Talme engineering and business roles.",
      },
    ],
  },
  {
    title: "Engineering and Industry Topics",
    items: [
      {
        label: "Aerospace Data Services",
        to: "/services/aerospace",
        description:
          "Aerospace engineering support and structured data services for documentation, validation, and delivery workflows.",
      },
      {
        label: "Automotive Data Services",
        to: "/services/automotive",
        description:
          "Automotive engineering and data-enabled services to improve turnaround time, quality, and process consistency.",
      },
      {
        label: "Semiconductor Services",
        to: "/services/semiconductor",
        description:
          "Semiconductor process, engineering data, quality documentation, and traceability support for high-tech programs.",
      },
      {
        label: "CEIT Services",
        to: "/services/ceit",
        description:
          "Engineering information, technical documentation, and controlled execution support for enterprise programs.",
      },
      {
        label: "PLM Services",
        to: "/services/plm",
        description:
          "Product lifecycle management support for BOM, CAD, change workflows, product data governance, and reporting.",
      },
      {
        label: "Oil and Gas Data Services",
        to: "/services/engineering-solutions",
        description:
          "Oil and gas engineering support and operational data services for controlled, measurable project execution.",
      },
      {
        label: "OEM Data Services",
        to: "/services/product-manufacturing",
        description:
          "OEM data and manufacturing support services built for traceability, documentation quality, and speed.",
      },
      {
        label: "Electrical Data Services",
        to: "/services/engineering-solutions",
        description:
          "Electrical engineering data support, structured project documentation, and enterprise delivery services.",
      },
      {
        label: "Information Technology Services",
        to: "/services/computer-technology",
        description:
          "IT services including application engineering, digital platforms, support operations, and scalable implementation.",
      },
    ],
  },
];

function SearchTopics() {
  return (
    <section className="search-topics" aria-labelledby="search-topics-title">
      <div className="search-topics__intro">
        <p>Search Topics</p>
        <h2 id="search-topics-title">Explore TALME service pages and business topics</h2>
        <p>
          Find Talme pages for client services, engineering industries, business
          capabilities, and careers through these direct links.
        </p>
      </div>

      <div className="search-topics__groups">
        {topicGroups.map((group) => (
          <section className="search-topics__group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="search-topics__grid">
              {group.items.map((item) => (
                <Link className="search-topics__card" key={item.label} to={item.to}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default SearchTopics;
