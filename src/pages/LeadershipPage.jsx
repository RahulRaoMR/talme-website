import { useState } from "react";
import { FaLinkedinIn } from "react-icons/fa";
import "./LeadershipPage.css";

const ADMIN_STORAGE_KEY = "talme-leadership-admin-key";
const LEADERSHIP_STORAGE_KEY = "talme-leadership-members";
const LEADERSHIP_ADMIN_KEY =
  import.meta.env.VITE_LEADERSHIP_ADMIN_KEY ||
  import.meta.env.VITE_SITE_ADMIN_KEY ||
  "talme-admin";

const EMPTY_FORM = {
  name: "",
  role: "",
  linkedinUrl: "",
  imageUrl: "",
};

const seedLeaders = [];


function readStoredLeaders() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEADERSHIP_STORAGE_KEY) || "null");
    return Array.isArray(parsed) ? parsed : seedLeaders;
  } catch {
    return seedLeaders;
  }
}

function saveStoredLeaders(leaders) {
  window.localStorage.setItem(LEADERSHIP_STORAGE_KEY, JSON.stringify(leaders));
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function normalizeLinkedinUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function LeadershipPage() {
  const [leaders, setLeaders] = useState(readStoredLeaders);
  const [adminKey, setAdminKey] = useState(
    () => window.localStorage.getItem(ADMIN_STORAGE_KEY) || ""
  );
  const [draftKey, setDraftKey] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const isAdmin = Boolean(adminKey);

  function persist(nextLeaders) {
    setLeaders(nextLeaders);
    saveStoredLeaders(nextLeaders);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId("");
  }

  function handleAdminLogin(event) {
    event.preventDefault();

    if (draftKey.trim() !== LEADERSHIP_ADMIN_KEY) {
      setMessage("Invalid admin key.");
      return;
    }

    window.localStorage.setItem(ADMIN_STORAGE_KEY, draftKey.trim());
    setAdminKey(draftKey.trim());
    setDraftKey("");
    setMessage("");
  }

  function handleAdminLogout() {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdminKey("");
    resetForm();
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = await readImageAsDataUrl(file);
    setForm((current) => ({ ...current, imageUrl }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const role = form.role.trim();
    const linkedinUrl = normalizeLinkedinUrl(form.linkedinUrl);

    if (!name || !role || !form.imageUrl) {
      setMessage("Name, role, and photo are required.");
      return;
    }

    const nextLeader = {
      id: editingId || `leader-${Date.now()}`,
      name,
      role,
      linkedinUrl,
      imageUrl: form.imageUrl,
    };

    const nextLeaders = editingId
      ? leaders.map((leader) => (leader.id === editingId ? nextLeader : leader))
      : [...leaders, nextLeader];

    persist(nextLeaders);
    resetForm();
    setMessage("");
  }

  function startEditing(leader) {
    setEditingId(leader.id);
    setForm({
      name: leader.name,
      role: leader.role,
      linkedinUrl: leader.linkedinUrl || "",
      imageUrl: leader.imageUrl,
    });
    setMessage("");
  }

  function deleteLeader(id) {
    persist(leaders.filter((leader) => leader.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <main className="leadership-page">
      <section className="leadership-hero">
        <p>Leadership</p>
        <h1>Meet Our Leadership</h1>
        <span>
          The people guiding TALME with industry experience, delivery discipline, and client focus.
        </span>
      </section>

      <section className="leadership-admin-panel" aria-label="Leadership admin">
        {!isAdmin ? (
          <form onSubmit={handleAdminLogin} className="leadership-key-form">
            <label htmlFor="leadership-admin-key">Admin key</label>
            <input
              id="leadership-admin-key"
              type="password"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="Enter admin key"
            />
            <button type="submit">Manage Leadership</button>
          </form>
        ) : (
          <>
            <div className="leadership-admin-bar">
              <strong>{editingId ? "Editing leader" : "Admin mode enabled"}</strong>
              <button type="button" onClick={handleAdminLogout}>
                Log out
              </button>
            </div>

            <form className="leadership-form" onSubmit={handleSubmit}>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Name"
              />
              <input
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                placeholder="Role / designation"
              />
              <input
                value={form.linkedinUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, linkedinUrl: event.target.value }))
                }
                placeholder="LinkedIn URL (optional)"
              />
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {form.imageUrl ? (
                <img className="leadership-preview" src={form.imageUrl} alt="" />
              ) : null}
              <div className="leadership-form-actions">
                <button type="submit">{editingId ? "Update Leader" : "Add Leader"}</button>
                {editingId ? (
                  <button type="button" onClick={resetForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </>
        )}
        {message ? <p className="leadership-message">{message}</p> : null}
      </section>

      <section className="leadership-grid" aria-label="Leadership team">
        {leaders.map((leader) => {
          const hasLinkedin = Boolean(leader.linkedinUrl);
          const photoContent = (
            <>
              <img src={leader.imageUrl} alt={leader.name} />
              <span className="leader-hover-panel">
                <strong>{leader.name}</strong>
                <small>{leader.role}</small>
              </span>
              {hasLinkedin ? (
                <span className="leader-linkedin" aria-hidden="true">
                  <FaLinkedinIn />
                </span>
              ) : null}
            </>
          );

          return (
          <article className="leader-card" key={leader.id}>
            {hasLinkedin ? (
              <a
                className="leader-photo-link"
                href={leader.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${leader.name} LinkedIn profile`}
              >
                {photoContent}
              </a>
            ) : (
              <div className="leader-photo-link leader-photo-static">{photoContent}</div>
            )}
            <div className="leader-copy">
              <h2>{leader.name}</h2>
              <p>{leader.role}</p>
              {isAdmin ? (
                <div className="leader-actions">
                  <button type="button" onClick={() => startEditing(leader)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteLeader(leader.id)}>
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </article>
          );
        })}
      </section>
    </main>
  );
}

export default LeadershipPage;
