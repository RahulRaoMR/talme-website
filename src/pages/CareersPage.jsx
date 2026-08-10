import { useRef, useState } from "react";
import "./CareersPage.css";

const ACCEPTED_FILE_TYPE = "application/pdf";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  role: "",
  message: "",
};

function formatFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CareersPage() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(initialFormState);
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function validateAndSetFile(file) {
    if (!file) {
      return false;
    }

    const isPdf =
      file.type === ACCEPTED_FILE_TYPE || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Please upload your resume as a PDF file.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Please upload a PDF smaller than 5 MB.");
      return false;
    }

    setResumeFile(file);
    setError("");
    return true;
  }

  function handleFileChange(event) {
    validateAndSetFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    validateAndSetFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatusMessage("");

    if (!resumeFile) {
      setError("Please attach your resume in PDF format.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("fullName", formData.fullName.trim());
      payload.append("email", formData.email.trim());
      payload.append("phone", formData.phone.trim());
      payload.append("role", formData.role.trim());
      payload.append("message", formData.message.trim());
      payload.append("resume", resumeFile);

      const response = await fetch("/api/careers", {
        method: "POST",
        body: payload,
      });

      const rawResponse = await response.text();
      let result = {};

      if (rawResponse) {
        try {
          result = JSON.parse(rawResponse);
        } catch {
          result = {
            error: "The server returned an invalid response. Please try again.",
          };
        }
      }

      if (!response.ok) {
        throw new Error(
          result.details || result.error || "Failed to submit your application."
        );
      }

      setStatusMessage(result.message || "Application sent to HR successfully. Our HR team will review your profile.");
      setFormData(initialFormState);
      setResumeFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to submit your application."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="careers-page">
      <div className="careers-container">
        <header className="careers-header">
          <h1>Careers at TALME</h1>
          <p>
            Join a high-performance team where engineering excellence, business
            impact, and continuous learning drive every project.
          </p>
        </header>

        <div className="careers-hero">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
            alt="Corporate team collaborating in office"
          />
          <div className="careers-hero-overlay">
            <span>People and Culture</span>
            <h2>Build Meaningful Work With Enterprise-Grade Teams</h2>
            <p>
              We combine structured mentorship, modern delivery practices, and
              real ownership to help professionals accelerate their careers.
            </p>
          </div>
        </div>

        <div className="careers-grid">
          <article className="careers-info-card">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
              alt="Career growth and leadership discussion"
            />
            <div>
              <h3>Why TALME</h3>
              <p>
                Work on cross-industry programs, collaborate with experienced
                leaders, and grow through real business challenges in
                engineering and digital operations.
              </p>
            </div>
          </article>

          <article className="careers-info-card">
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
              alt="Professional development and planning"
            />
            <div>
              <h3>Learning and Development</h3>
              <p>
                Structured onboarding, role-based capability development, and
                continuous upskilling programs designed for long-term
                professional growth.
              </p>
            </div>
          </article>
        </div>

        <section className="careers-journey">
          <div className="careers-journey-image">
            <img
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1400&q=80"
              alt="Team collaboration and career growth"
            />
          </div>
          <div className="careers-journey-content">
            <h2>Career Journey at TALME</h2>
            <p>
              Our people model is designed for long-term growth. From onboarding
              to leadership readiness, we provide clear career pathways and
              structured support at every stage.
            </p>
            <ul>
              <li>Role-based capability development plans</li>
              <li>Mentorship by domain and delivery leaders</li>
              <li>Cross-functional project exposure</li>
              <li>Performance feedback with growth coaching</li>
            </ul>
          </div>
        </section>

        <section className="careers-benefits">
          <h2>What You Can Expect</h2>
          <div className="benefits-grid">
            <article className="benefit-card">
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
                alt="Corporate mentoring program"
              />
              <h3>Leadership Access</h3>
              <p>Direct mentoring and review cycles with senior professionals.</p>
            </article>
            <article className="benefit-card">
              <img
                src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=1200&q=80"
                alt="Learning and upskilling environment"
              />
              <h3>Continuous Learning</h3>
              <p>Certification support, upskilling tracks, and practical learning.</p>
            </article>
            <article className="benefit-card">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80"
                alt="Modern workplace and collaboration"
              />
              <h3>Modern Work Culture</h3>
              <p>Collaborative teams, transparent communication, and ownership.</p>
            </article>
          </div>
        </section>

        <section className="careers-apply">
          <div className="careers-apply-copy">
            <span className="careers-eyebrow">Apply Now</span>
            <h2>Share your profile with TALME HR</h2>
            <p>
              Submit your basic contact details and upload your latest resume in
              PDF format. Applications are routed directly to{" "}
              <a href="mailto:hr@talme.in">hr@talme.in</a>.
            </p>

            <div className="careers-contact-cards">
              <article>
                <h3>Email</h3>
                <a href="mailto:hr@talme.in">hr@talme.in</a>
              </article>
              <article>
                <h3>Phone</h3>
                <a href="tel:+918048795189">+91 80 4879 5189</a>
              </article>
              <article>
                <h3>Location</h3>
                <p>Bengaluru, India</p>
              </article>
            </div>
          </div>

          <form className="careers-form-card" onSubmit={handleSubmit}>
            <div className="careers-form-grid">
              <label>
                <span>Full name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={updateField}
                  placeholder="Enter your full name"
                  required
                />
              </label>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={updateField}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                <span>Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={updateField}
                  placeholder="+91"
                  required
                />
              </label>
              <label>
                <span>Role applying for</span>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={updateField}
                  placeholder="Frontend Developer"
                  required
                />
              </label>
            </div>

            <label className="careers-message-field">
              <span>Short note</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={updateField}
                placeholder="Tell us briefly about your experience and availability."
                rows="4"
              />
            </label>

            <div
              className={`resume-dropzone ${isDragActive ? "is-active" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                hidden
              />
              <div className="resume-dropzone-icon" aria-hidden="true">
                <span />
              </div>
              <h3>Upload your CV</h3>
              <p>Choose a PDF file or drag and drop it here. Maximum file size: 5 MB.</p>
              <button
                type="button"
                className="resume-browse-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse File
              </button>
            </div>

            {resumeFile ? (
              <div className="resume-file-pill">
                <strong>{resumeFile.name}</strong>
                <span>{formatFileSize(resumeFile.size)}</span>
              </div>
            ) : null}

            {error ? <p className="careers-form-feedback is-error">{error}</p> : null}
            {statusMessage ? (
              <p className="careers-form-feedback is-success">{statusMessage}</p>
            ) : null}

            <button className="careers-submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

export default CareersPage;
