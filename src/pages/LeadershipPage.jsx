import { useEffect, useState } from "react";
import { FaLinkedinIn } from "react-icons/fa";
import "./LeadershipPage.css";

const ADMIN_STORAGE_KEY = "talme-leadership-admin-key";
const LEGACY_LEADERSHIP_STORAGE_KEY = "talme-leadership-members";
const LEADERSHIP_API_URL = "/api/leadership";

const EMPTY_FORM = {
  name: "",
  role: "",
  linkedinUrl: "",
  imageUrl: "",
};

const seedLeaders = [];

function getLeaderApiUrl(id) {
  return `${LEADERSHIP_API_URL}?id=${encodeURIComponent(id)}`;
}

function readLegacyStoredLeaders() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(LEGACY_LEADERSHIP_STORAGE_KEY) || "null"
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readJsonResponse(response, fallbackMessage) {
  const rawResponse = await response.text();

  if (!rawResponse) {
    return { error: fallbackMessage };
  }

  try {
    return JSON.parse(rawResponse);
  } catch {
    return { error: fallbackMessage };
  }
}

function isAdminAuthError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === "Invalid admin key." ||
    error.message === "Website admin key is not configured."
  );
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

async function saveLeaderToApi(leader, adminKey, isEditing = false) {
  const response = await fetch(isEditing ? getLeaderApiUrl(leader.id) : LEADERSHIP_API_URL, {
    method: isEditing ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
    body: JSON.stringify(leader),
  });
  const result = await readJsonResponse(
    response,
    isEditing ? "Unable to update shared leader." : "Unable to save shared leader."
  );

  if (!response.ok) {
    throw new Error(
      result.error ||
        (isEditing ? "Unable to update shared leader." : "Unable to save shared leader.")
    );
  }

  return result;
}

async function migrateLegacyLeaders(leaders, adminKey) {
  const migratedLeaders = [];

  for (const leader of leaders) {
    const migratedLeader = await saveLeaderToApi(
      {
        id: leader.id,
        name: leader.name,
        role: leader.role,
        linkedinUrl: leader.linkedinUrl || "",
        imageUrl: leader.imageUrl,
      },
      adminKey
    );
    migratedLeaders.push(migratedLeader);
  }

  window.localStorage.removeItem(LEGACY_LEADERSHIP_STORAGE_KEY);
  return migratedLeaders;
}

function LeadershipPage() {
  const [leaders, setLeaders] = useState(seedLeaders);
  const [adminKey, setAdminKey] = useState(
    () => window.localStorage.getItem(ADMIN_STORAGE_KEY) || ""
  );
  const [draftKey, setDraftKey] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isAdmin = Boolean(adminKey);

  useEffect(() => {
    let isActive = true;

    async function loadLeaders() {
      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch(LEADERSHIP_API_URL);
        const result = await readJsonResponse(response, "Unable to load shared leadership.");

        if (!response.ok || !Array.isArray(result)) {
          throw new Error(result.error || "Unable to load shared leadership.");
        }

        let nextLeaders = result;
        const legacyLeaders = readLegacyStoredLeaders();

        if (nextLeaders.length === 0 && legacyLeaders.length > 0 && adminKey) {
          nextLeaders = await migrateLegacyLeaders(legacyLeaders, adminKey);
        }

        if (isActive) {
          setLeaders(nextLeaders);
          setMessage("");
        }
      } catch (error) {
        const legacyLeaders = readLegacyStoredLeaders();

        if (isActive) {
          if (legacyLeaders.length > 0) {
            setLeaders(legacyLeaders);
            setMessage(
              "Shared leadership data is temporarily unavailable. Showing leaders saved on this device."
            );
          } else {
            setLeaders(seedLeaders);
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to load shared leadership."
            );
          }
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadLeaders();

    return () => {
      isActive = false;
    };
  }, [adminKey]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId("");
  }

  async function handleAdminLogin(event) {
    event.preventDefault();
    const key = draftKey.trim();
    if (!key) return;

    try {
      const response = await fetch(LEADERSHIP_API_URL, {
        headers: {
          "x-admin-key": key,
        },
      });
      const result = await readJsonResponse(response, "Invalid admin key.");

      if (!response.ok || !Array.isArray(result)) {
        throw new Error(result.error || "Invalid admin key.");
      }

      let nextLeaders = result;
      const legacyLeaders = readLegacyStoredLeaders();

      if (nextLeaders.length === 0 && legacyLeaders.length > 0) {
        nextLeaders = await migrateLegacyLeaders(legacyLeaders, key);
      }

      window.localStorage.setItem(ADMIN_STORAGE_KEY, key);
      setAdminKey(key);
      setDraftKey("");
      setLeaders(nextLeaders);
      setMessage("");
    } catch (error) {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      setAdminKey("");
      setMessage(error instanceof Error ? error.message : "Unable to verify admin login.");
    }
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

  async function handleSubmit(event) {
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

    setIsSaving(true);
    setMessage("");

    try {
      const savedLeader = await saveLeaderToApi(nextLeader, adminKey, Boolean(editingId));
      setLeaders((current) =>
        editingId
          ? current.map((leader) => (leader.id === editingId ? savedLeader : leader))
          : [...current, savedLeader]
      );
      resetForm();
      setMessage("Leader saved for all devices.");
    } catch (error) {
      if (isAdminAuthError(error)) {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        setAdminKey("");
      }

      setMessage(error instanceof Error ? error.message : "Unable to save shared leader.");
    } finally {
      setIsSaving(false);
    }
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

  async function deleteLeader(id) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(getLeaderApiUrl(id), {
        method: "DELETE",
        headers: {
          "x-admin-key": adminKey,
        },
      });
      const result = await readJsonResponse(response, "Unable to delete shared leader.");

      if (!response.ok && response.status !== 404) {
        throw new Error(result.error || "Unable to delete shared leader.");
      }

      setLeaders((current) => current.filter((leader) => leader.id !== id));
      if (editingId === id) resetForm();
      setMessage("Leader deleted for all devices.");
    } catch (error) {
      if (isAdminAuthError(error)) {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        setAdminKey("");
      }

      setMessage(error instanceof Error ? error.message : "Unable to delete shared leader.");
    } finally {
      setIsSaving(false);
    }
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
                <button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingId ? "Update Leader" : "Add Leader"}
                </button>
                {editingId ? (
                  <button type="button" onClick={resetForm} disabled={isSaving}>
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
        {isLoading ? <p className="leadership-message">Loading leadership...</p> : null}
        {!isLoading && leaders.map((leader) => {
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
                    <button type="button" onClick={() => startEditing(leader)} disabled={isSaving}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteLeader(leader.id)} disabled={isSaving}>
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