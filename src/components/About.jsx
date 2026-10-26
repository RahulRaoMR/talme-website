import "./About.css";

function About() {
  return (
    <section className="about">
      <div className="about-container">
        <h1 className="about-title">About TALME</h1>
        <p className="about-subtitle">
          Engineering-led talent and delivery partner focused on measurable
          outcomes, speed, and long-term client value.
        </p>

        <div className="about-hero-grid">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1400&q=80"
            alt="Corporate engineering office"
          />
          <img
            src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80"
            alt="Executive meeting and planning"
          />
        </div>

        <div className="about-highlights">
          <div className="about-highlight">
            <strong>12+ Years</strong>
            <span>Industry and engineering experience</span>
          </div>
          <div className="about-highlight">
            <strong>500+ Projects</strong>
            <span>Delivered across multiple sectors</span>
          </div>
          <div className="about-highlight">
            <strong>Global Reach</strong>
            <span>Talent support across industries and regions</span>
          </div>
        </div>

        <div className="about-content">
          <p>
            TALME is a reputable engineering business specializing in providing
            recruitment services to our clients. We understand the importance of
            having the right people in the right roles and are committed to
            helping our clients find the best talent for their engineering
            needs.
          </p>

          <p>
            Our recruitment services are flexible and tailored to meet the
            unique needs of each client. We work closely with our clients to
            understand their requirements and deliver personalized recruitment
            solutions - from identifying potential candidates to conducting
            interviews and finalizing job offers.
          </p>

          <h2>Our Network & Industry Reach</h2>

          <p>
            We have an extensive network within the engineering industry,
            including top engineering schools, universities, professional
            organizations, and associations. This enables us to access a wide
            talent pool across various industries and locations.
          </p>

          <h2>Our Recruitment Services Include:</h2>

          <ul className="about-list">
            <li>
              <strong>Job Advertising:</strong> Creating compelling job postings
              and promoting them across websites, job boards, and social media.
            </li>
            <li>
              <strong>Candidate Sourcing:</strong> Database searches,
              networking, and headhunting to identify ideal candidates.
            </li>
            <li>
              <strong>Screening & Assessment:</strong> Interviews, background
              checks, and reference verifications.
            </li>
            <li>
              <strong>Job Offers:</strong> Supporting offer negotiations
              including salary and benefits.
            </li>
            <li>
              <strong>Onboarding:</strong> Ensuring a smooth transition for new
              hires.
            </li>
          </ul>

          <h2>Beyond Recruitment</h2>

          <p>
            In addition to recruitment, we offer engineering services including
            product design and development, prototyping, testing, and
            manufacturing. Our experience spans industries such as automotive,
            aerospace, medical, and consumer products.
          </p>

          <h2>Our Commitment</h2>

          <p>
            At TALME, we take a collaborative approach, working closely with
            clients to understand their goals and deliver innovative solutions.
            We are passionate about engineering and committed to exceeding
            expectations.
          </p>

          <p className="about-closing">
            Thank you for considering TALME as your engineering partner. We look
            forward to supporting your business growth.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
