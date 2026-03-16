import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { insightsData } from "../data/insightsData";
import { servicePagesData } from "../data/servicePagesData";
import { serviceHubDetails } from "../data/serviceHubData";

const SITE_URL = "https://talme.in";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

const defaultMeta = {
  title: "Talme | Engineering Services",
  description:
    "Talme Technologies provides engineering services, IT consulting, and staffing solutions for global enterprises.",
  keywords:
    "Talme Technologies, engineering services, IT consulting, staffing solutions, automotive engineering, digital transformation, aerospace data services, oil and gas data services, client accounting services",
  image: DEFAULT_IMAGE,
};

const canonicalRouteMap = {
  "/services": "/",
  "/about-us": "/about",
  "/clients": "/our-clients",
  "/contact-us": "/contact",
  "/business-solutions": "/services/business-solutions",
  "/staff-augmentation": "/services/staff-augmentation",
  "/engineering-solutions": "/services/engineering-solutions",
  "/health-care-services": "/services/health-care-services",
  "/computer-technology": "/services/computer-technology",
  "/it-data": "/services/computer-technology",
  "/product-manufacturing": "/services/product-manufacturing",
  "/oem-data": "/services/product-manufacturing",
  "/oem-engineering-data": "/services/product-manufacturing",
  "/automotive-data": "/services/engineering-solutions",
  "/automotive-engineering-services": "/services/engineering-solutions",
  "/aerospace-data": "/services/engineering-solutions",
  "/aerospace-engineering-services": "/services/engineering-solutions",
  "/oil-gas-data": "/services/engineering-solutions",
  "/oil-and-gas-data": "/services/engineering-solutions",
  "/electrical-data": "/services/engineering-solutions",
  "/electrical-engineering-services": "/services/engineering-solutions",
  "/information-technology-services": "/services/computer-technology",
  "/client-accounting-services": "/client-accounting",
  "/clients-accounting-services": "/client-accounting",
  "/job-description": "/careers",
  "/job-descriptions": "/careers",
};

const staticRouteMeta = {
  "/": {
    title: "Talme | Engineering Services",
    description:
      "Talme Technologies provides engineering services, IT consulting, staffing solutions, client accounting services, and industry-focused data support.",
  },
  "/services": {
    title: "Services | Talme Technologies",
    description:
      "Explore Talme Technologies engineering, staffing, consulting, and digital services designed for measurable business outcomes.",
  },
  "/business-solutions": {
    title: "Business Solutions | Talme Technologies",
    description:
      "Talme Technologies offers business solutions including digital transformation, consulting, and enterprise IT services.",
  },
  "/staff-augmentation": {
    title: "Staff Augmentation Services | Talme Technologies",
    description:
      "Talme Technologies provides staff augmentation services to help organizations hire top engineering and IT talent.",
  },
  "/information-technology-services": {
    title: "Information Technology Services | Talme Technologies",
    description:
      "Talme Technologies provides IT services including software development, cloud platforms, application support, and enterprise consulting.",
  },
  "/engineering-solutions": {
    title: "Engineering Solutions | Talme Technologies",
    description:
      "Talme Technologies delivers engineering solutions across product design, validation, and lifecycle optimization.",
  },
  "/product-manufacturing": {
    title: "Product Manufacturing | Talme Technologies",
    description:
      "Talme Technologies supports product manufacturing with quality-focused execution, traceability, and process optimization.",
  },
  "/oem-data": {
    title: "OEM Data Services | Talme Technologies",
    description:
      "Talme Technologies provides OEM-focused engineering and manufacturing support for better control, quality, and speed.",
  },
  "/oem-engineering-data": {
    title: "OEM Engineering Data Services | Talme Technologies",
    description:
      "Talme Technologies provides OEM engineering data support, manufacturing workflows, and process-driven delivery services.",
  },
  "/health-care-services": {
    title: "Health Care Services | Talme Technologies",
    description:
      "Talme Technologies offers healthcare services focused on process quality, compliance, and operational continuity.",
  },
  "/automotive-data": {
    title: "Automotive Data Services | Talme Technologies",
    description:
      "Talme Technologies provides automotive engineering and data-enabled services to support delivery quality and speed.",
  },
  "/automotive-engineering-services": {
    title: "Automotive Engineering Services | Talme Technologies",
    description:
      "Talme Technologies provides automotive engineering support, project delivery, and structured data services for scalable execution.",
  },
  "/aerospace-data": {
    title: "Aerospace Data Services | Talme Technologies",
    description:
      "Talme Technologies supports aerospace engineering data, documentation workflows, and process-driven delivery requirements.",
  },
  "/aerospace-engineering-services": {
    title: "Aerospace Engineering Services | Talme Technologies",
    description:
      "Talme Technologies delivers aerospace engineering support and structured data services for precision-led programs.",
  },
  "/oil-gas-data": {
    title: "Oil and Gas Data Services | Talme Technologies",
    description:
      "Talme Technologies provides oil and gas data support, engineering documentation services, and workflow coordination.",
  },
  "/oil-and-gas-data": {
    title: "Oil and Gas Data Services | Talme Technologies",
    description:
      "Talme Technologies provides oil and gas data support, engineering documentation services, and workflow coordination.",
  },
  "/electrical-data": {
    title: "Electrical Data Services | Talme Technologies",
    description:
      "Talme Technologies provides electrical engineering data support, process documentation, and delivery services for enterprise teams.",
  },
  "/electrical-engineering-services": {
    title: "Electrical Engineering Services | Talme Technologies",
    description:
      "Talme Technologies offers electrical engineering services and data-enabled support for quality, speed, and control.",
  },
  "/computer-technology": {
    title: "Computer Technology Services | Talme Technologies",
    description:
      "Talme Technologies offers computer technology services including application engineering and digital platform support.",
  },
  "/it-data": {
    title: "Computer Technology Services | Talme Technologies",
    description:
      "Talme Technologies offers computer technology services including application engineering and digital platform support.",
  },
  "/clients": {
    title: "Our Clients | Talme Technologies",
    description:
      "See how Talme Technologies supports clients with engineering, staffing, and business transformation services.",
  },
  "/our-clients": {
    title: "Our Clients | Talme Technologies",
    description:
      "See how Talme Technologies supports client growth through engineering, IT, and business services.",
  },
  "/legal": {
    title: "Legal | Talme Technologies",
    description:
      "Read legal information, terms, and policy details for Talme Technologies Pvt Ltd.",
  },
  "/about-us": {
    title: "About Us | Talme Technologies",
    description:
      "Talme Technologies Pvt Ltd is a trusted engineering and IT services company providing staffing, consulting and digital transformation solutions.",
  },
  "/managed-services": {
    title: "Managed Services | Talme Technologies",
    description:
      "Talme Technologies managed services improve process reliability, visibility, and scalable business delivery.",
  },
  "/assurance": {
    title: "Assurance Services | Talme Technologies",
    description:
      "Talme Technologies assurance services strengthen governance, controls, and operational confidence.",
  },
  "/business-services": {
    title: "Business Services | Talme Technologies",
    description:
      "Talme Technologies business services optimize operations with control-focused, KPI-driven delivery models.",
  },
  "/people-practice": {
    title: "People Practice | Talme Technologies",
    description:
      "Talme Technologies people practice solutions support hiring, HR operations, and workforce governance.",
  },
  "/about": {
    title: "About TALME | Talme Technologies",
    description:
      "Learn about Talme Technologies, our engineering-led recruitment services, and our global delivery capabilities.",
  },
  "/client-accounting": {
    title: "Client Accounting Services | Talme Technologies",
    description:
      "Talme Technologies client accounting services improve finance controls, reporting speed, and compliance quality.",
  },
  "/client-accounting-services": {
    title: "Client Accounting Services | Talme Technologies",
    description:
      "Talme Technologies client accounting services improve finance controls, reporting speed, and compliance quality.",
  },
  "/clients-accounting-services": {
    title: "Client Accounting Services | Talme Technologies",
    description:
      "Talme Technologies client accounting services improve finance controls, reporting speed, and compliance quality.",
  },
  "/careers": {
    title: "Careers | Talme Technologies",
    description:
      "Explore career opportunities at Talme Technologies across engineering, consulting, and digital domains.",
  },
  "/job-description": {
    title: "Job Descriptions and Careers | Talme Technologies",
    description:
      "Explore job descriptions, open roles, and career opportunities at Talme Technologies across engineering and business domains.",
  },
  "/job-descriptions": {
    title: "Job Descriptions and Careers | Talme Technologies",
    description:
      "Explore job descriptions, open roles, and career opportunities at Talme Technologies across engineering and business domains.",
  },
  "/insights": {
    title: "Insights | Talme Technologies",
    description:
      "Read Talme Technologies insights on engineering talent, operations, and digital transformation.",
  },
  "/news-events": {
    title: "News & Events | Talme Technologies",
    description:
      "Read daily news, announcements, and operating updates from Talme Technologies.",
  },
  "/news-admin": {
    title: "News Admin | Talme Technologies",
    description:
      "Private news management page for Talme Technologies administrators.",
  },
  "/contact": {
    title: "Contact Us | Talme Technologies",
    description:
      "Contact Talme Technologies for engineering services, IT consulting, and staffing solutions.",
  },
  "/contact-us": {
    title: "Contact Us | Talme Technologies",
    description:
      "Reach Talme Technologies for project inquiries, partnerships, and service consultations.",
  },
};

function setMetaAttribute(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setLinkTag(selector, rel, href) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function setJsonLd(id, payload) {
  let element = document.head.querySelector(`script[data-seo-jsonld="${id}"]`);
  if (!element) {
    element = document.createElement("script");
    element.setAttribute("type", "application/ld+json");
    element.setAttribute("data-seo-jsonld", id);
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(payload);
}

function getCanonicalPath(pathname) {
  return canonicalRouteMap[pathname] || pathname;
}

function getPathLabel(segment) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBreadcrumbItems(pathname, title) {
  const segments = pathname.split("/").filter(Boolean);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Talme Technologies",
      item: SITE_URL,
    },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: isLast ? title.replace(/\s+\|\s+Talme Technologies$/, "") : getPathLabel(segment),
      item: `${SITE_URL}${currentPath}`,
    });
  });

  return items;
}

function getDynamicRouteMeta(pathname) {
  if (pathname.startsWith("/services/")) {
    const slug = pathname.replace("/services/", "");
    const service = servicePagesData[slug];
    if (service) {
      return {
        title: `${service.title} | Talme Technologies`,
        description: service.intro,
        image: DEFAULT_IMAGE,
      };
    }
  }

  if (pathname.startsWith("/service-hub/")) {
    const slug = pathname.replace("/service-hub/", "");
    const service = serviceHubDetails[slug];
    if (service) {
      return {
        title: `${service.title} | Talme Technologies`,
        description: service.summary,
        image: DEFAULT_IMAGE,
      };
    }
  }

  if (pathname.startsWith("/insights/")) {
    const slug = pathname.replace("/insights/", "");
    const insight = insightsData.find((item) => item.slug === slug);
    if (insight) {
      return {
        title: `${insight.title} | Talme Insights`,
        description: insight.description,
        image: insight.image || DEFAULT_IMAGE,
      };
    }
  }

  if (pathname.startsWith("/contact/")) {
    return {
      title: "Contact Location | Talme Technologies",
      description:
        "Contact Talme Technologies for location-specific support and service inquiries.",
      image: DEFAULT_IMAGE,
    };
  }

  return null;
}

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = normalizePathname(location.pathname);
    const routeMeta =
      staticRouteMeta[pathname] || getDynamicRouteMeta(pathname) || defaultMeta;
    const title = routeMeta.title || defaultMeta.title;
    const description = routeMeta.description || defaultMeta.description;
    const image = routeMeta.image || defaultMeta.image;
    const canonicalPath = getCanonicalPath(pathname);
    const canonicalUrl = `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;
    const robots =
      pathname === "/news-admin"
        ? "noindex,nofollow"
        : canonicalPath !== pathname
          ? "noindex,follow"
          : "index,follow";

    document.title = title;
    setMetaAttribute('meta[name="description"]', "name", "description");
    setMetaAttribute('meta[name="description"]', "content", description);
    setMetaAttribute('meta[name="keywords"]', "name", "keywords");
    setMetaAttribute('meta[name="keywords"]', "content", defaultMeta.keywords);
    setMetaAttribute('meta[name="robots"]', "name", "robots");
    setMetaAttribute('meta[name="robots"]', "content", robots);

    setMetaAttribute('meta[property="og:title"]', "property", "og:title");
    setMetaAttribute('meta[property="og:title"]', "content", title);
    setMetaAttribute(
      'meta[property="og:description"]',
      "property",
      "og:description"
    );
    setMetaAttribute('meta[property="og:description"]', "content", description);
    setMetaAttribute('meta[property="og:url"]', "property", "og:url");
    setMetaAttribute('meta[property="og:url"]', "content", canonicalUrl);
    setMetaAttribute('meta[property="og:site_name"]', "property", "og:site_name");
    setMetaAttribute(
      'meta[property="og:site_name"]',
      "content",
      "Talme Technologies"
    );
    setMetaAttribute('meta[property="og:type"]', "property", "og:type");
    setMetaAttribute('meta[property="og:type"]', "content", "website");
    setMetaAttribute('meta[property="og:image"]', "property", "og:image");
    setMetaAttribute('meta[property="og:image"]', "content", image);

    setMetaAttribute('meta[name="twitter:card"]', "name", "twitter:card");
    setMetaAttribute('meta[name="twitter:card"]', "content", "summary");
    setMetaAttribute('meta[name="twitter:title"]', "name", "twitter:title");
    setMetaAttribute('meta[name="twitter:title"]', "content", title);
    setMetaAttribute(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description"
    );
    setMetaAttribute('meta[name="twitter:description"]', "content", description);
    setMetaAttribute('meta[name="twitter:image"]', "name", "twitter:image");
    setMetaAttribute('meta[name="twitter:image"]', "content", image);

    setLinkTag('link[rel="canonical"]', "canonical", canonicalUrl);

    setJsonLd("website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Talme Technologies",
      alternateName: ["TALME", "talme.in"],
      url: SITE_URL,
      publisher: {
        "@type": "Organization",
        name: "Talme Technologies Pvt Ltd",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_IMAGE,
          width: 229,
          height: 281,
        },
      },
    });

    setJsonLd("organization", {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Talme Technologies Pvt Ltd",
      alternateName: ["Talme Technologies", "TALME"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_IMAGE,
        width: 229,
        height: 281,
      },
      image: DEFAULT_IMAGE,
      sameAs: [
        "https://www.linkedin.com/company/talme-technologies",
        "https://www.instagram.com/talme_tech",
      ],
    });

    setJsonLd("webpage", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: "Talme Technologies",
        url: SITE_URL,
      },
      about: {
        "@type": "Organization",
        name: "Talme Technologies Pvt Ltd",
        url: SITE_URL,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: getBreadcrumbItems(canonicalPath === "/" ? "/" : canonicalPath, title),
      },
    });
  }, [location.pathname]);

  return null;
}

export default SeoManager;
