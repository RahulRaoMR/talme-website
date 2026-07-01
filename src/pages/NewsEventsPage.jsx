import { useEffect, useRef, useState } from "react";
import { newsData } from "../data/newsData";
import "./NewsEventsPage.css";

const ADMIN_STORAGE_KEY = "talme-news-admin-key";
const LOCAL_NEWS_STORAGE_KEY = "talme-news-local-items";
const DELETED_NEWS_STORAGE_KEY = "talme-news-deleted-ids";
const EMPTY_FORM_DATA = {
  title: "",
  summary: "",
  isoDate: "",
  imageFile: null,
  imagePreview: "",
  removeImage: false,
};
const MAX_NEWS_IMAGE_SIDE = 1200;
const NEWS_IMAGE_QUALITY = 0.82;
const NEWS_FETCH_TIMEOUT_MS = 8000;
const NEWS_STORAGE_SETUP_MESSAGE =
  "Live news editing needs persistent storage. Add Vercel KV or Upstash REST credentials, then redeploy.";

function getNewsItemApiUrl(id) {
  return `/api/news?id=${encodeURIComponent(id)}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), NEWS_FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}

function readLocalNewsItems() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(LOCAL_NEWS_STORAGE_KEY) || "[]"
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalNewsItems(items) {
  try {
    window.localStorage.setItem(LOCAL_NEWS_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function readDeletedNewsIds() {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(DELETED_NEWS_STORAGE_KEY) || "[]"
    );
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveDeletedNewsIds(ids) {
  try {
    window.localStorage.setItem(
      DELETED_NEWS_STORAGE_KEY,
      JSON.stringify(Array.from(new Set(ids.map(String))))
    );
  } catch {}
}

function filterDeletedNews(items) {
  const deletedIds = new Set(readDeletedNewsIds());
  return items.filter((item) => !deletedIds.has(String(item.id)));
}

function sortByDateDescending(items) {
  return [...items].sort((left, right) => {
    return new Date(right.isoDate).getTime() - new Date(left.isoDate).getTime();
  });
}

function mergeLocalNews(items) {
  const itemMap = new Map();

  [...items, ...readLocalNewsItems()].forEach((item) => {
    if (item?.id) {
      itemMap.set(String(item.id), item);
    }
  });

  return sortByDateDescending(filterDeletedNews(Array.from(itemMap.values())));
}

function saveLocalNewsItem(item) {
  if (!item?.id) return;

  const nextItems = [
    item,
    ...readLocalNewsItems().filter((savedItem) => String(savedItem.id) !== String(item.id)),
  ];
  saveLocalNewsItems(nextItems);
}

function removeLocalNewsItem(id) {
  saveLocalNewsItems(
    readLocalNewsItems().filter((item) => String(item.id) !== String(id))
  );
}

function rememberDeletedNewsId(id) {
  saveDeletedNewsIds([...readDeletedNewsIds(), String(id)]);
}

function forgetDeletedNewsId(id) {
  saveDeletedNewsIds(readDeletedNewsIds().filter((deletedId) => deletedId !== String(id)));
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
    error.message === "News admin key is not configured."
  );
}

function getStorageMode(response) {
  return response.headers.get("x-news-storage-mode") || "";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function prepareNewsImage(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_NEWS_IMAGE_SIDE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve({ file, preview: dataUrl });
          return;
        }

        const preparedFile = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, "") + ".jpg",
          { type: "image/jpeg" }
        );
        resolve({ file: preparedFile, preview: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      NEWS_IMAGE_QUALITY
    );
  });
}

function NewsEventsPage({ adminMode = false }) {
  const today = new Date().toISOString().slice(0, 10);
  const [newsItems, setNewsItems] = useState(() => mergeLocalNews(newsData));
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [adminKey, setAdminKey] = useState(
    () => window.localStorage.getItem(ADMIN_STORAGE_KEY) || ""
  );
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(adminMode);
  const [isDeletingId, setIsDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [canSaveNews, setCanSaveNews] = useState(true);
  const [formData, setFormData] = useState({
    ...EMPTY_FORM_DATA,
    isoDate: today,
  });
  const [imageInputKey, setImageInputKey] = useState(0);
  const formWrapRef = useRef(null);

  useEffect(() => {
    const loadNews = async () => {
      setStatus("loading");
      setErrorMessage("");
      setNoticeMessage("");

      try {
        const response = await fetchWithTimeout("/api/news");
        if (!response.ok) {
          const result = await readJsonResponse(
            response,
            "Unable to load shared news."
          );
          throw new Error(result.error || "Unable to load shared news.");
        }

        const items = await readJsonResponse(response, "Unable to load shared news.");
        if (!Array.isArray(items)) {
          throw new Error("Unable to load shared news.");
        }

        const storageMode = getStorageMode(response);
        setCanSaveNews(storageMode !== "readonly");
        const hasStoredAdminKey = Boolean(
          window.localStorage.getItem(ADMIN_STORAGE_KEY)
        );
        if (storageMode === "readonly" && (adminMode || hasStoredAdminKey)) {
          setNoticeMessage(NEWS_STORAGE_SETUP_MESSAGE);
        }
        setNewsItems(mergeLocalNews(items));
        setStatus("ready");
      } catch (error) {
        if (!adminMode && newsData.length > 0) {
          setNewsItems(mergeLocalNews(newsData));
          setStatus("ready");
          setNoticeMessage(
            "Live news service is temporarily unavailable. Showing the latest published updates."
          );
          return;
        }

        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to connect to the news service."
        );
      }
    };

    loadNews();
  }, [adminMode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      ...EMPTY_FORM_DATA,
      isoDate: today,
    });
    setImageInputKey((prev) => prev + 1);
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: null,
        imagePreview: prev.removeImage ? "" : prev.imagePreview,
      }));
      return;
    }

    setErrorMessage("");

    try {
      const preparedImage = await prepareNewsImage(file);
      setFormData((prev) => ({
        ...prev,
        imageFile: preparedImage.file,
        imagePreview: preparedImage.preview,
        removeImage: false,
      }));
    } catch {
      setErrorMessage("Unable to prepare this image. Please choose another image file.");
      setImageInputKey((prev) => prev + 1);
    }
  };

  const removeSelectedImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: "",
      removeImage: true,
    }));
    setImageInputKey((prev) => prev + 1);
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    const key = adminPassword.trim();
    if (!key) return;

    try {
      const response = await fetch("/api/news", {
        headers: {
          "x-admin-key": key,
        },
      });

      const result = await readJsonResponse(response, "Invalid admin key.");
      if (!response.ok) {
        throw new Error(result.error || "Invalid admin key.");
      }

      const storageMode = getStorageMode(response);
      window.localStorage.setItem(ADMIN_STORAGE_KEY, key);
      setAdminKey(key);
      setAdminPassword("");
      setIsAdminPanelOpen(true);
      setNewsItems(mergeLocalNews(result));
      setCanSaveNews(storageMode !== "readonly");
      setStatus("ready");
      setErrorMessage("");
      setNoticeMessage(storageMode === "readonly" ? NEWS_STORAGE_SETUP_MESSAGE : "");
    } catch (error) {
      if (isAdminAuthError(error)) {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        setAdminKey("");
        setIsAdminPanelOpen(true);
      }

      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      setAdminKey("");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to verify admin login."
      );
    }
  };

  const handleAdminLogout = () => {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdminKey("");
    setAdminPassword("");
    setIsAdminPanelOpen(adminMode);
    setEditingId("");
    resetForm();
    setErrorMessage("");
    setNoticeMessage("");
  };

  const submitNews = async (event) => {
    event.preventDefault();

    const title = formData.title.trim();
    const summary = formData.summary.trim();
    const isoDate = formData.isoDate;

    if (!title || !summary || !isoDate) return;

    if (!canSaveNews) {
      setStatus("error");
      setErrorMessage(NEWS_STORAGE_SETUP_MESSAGE);
      return;
    }

    const payload = new FormData();
    payload.append("title", title);
    payload.append("summary", summary);
    payload.append("isoDate", isoDate);
    payload.append("removeImage", formData.removeImage ? "true" : "false");

    if (formData.imageFile) {
      payload.append("image", formData.imageFile);
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(isEditing ? getNewsItemApiUrl(editingId) : "/api/news", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "x-admin-key": adminKey,
        },
        body: payload,
      });

      const result = await readJsonResponse(
        response,
        isEditing ? "Unable to update shared news." : "Unable to save shared news."
      );
      if (!response.ok) {
        throw new Error(
          result.error ||
            (isEditing ? "Unable to update shared news." : "Unable to save shared news.")
        );
      }

      saveLocalNewsItem(result);
      setNewsItems((prev) =>
        isEditing
          ? prev.map((item) => (item.id === result.id ? result : item))
          : [result, ...prev]
      );
      forgetDeletedNewsId(result.id);
      resetForm();
      setEditingId("");
      setStatus("ready");
    } catch (error) {
      if (isAdminAuthError(error)) {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        setAdminKey("");
        setIsAdminPanelOpen(true);
      }

      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect to the news service."
      );
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      summary: item.summary,
      isoDate: item.isoDate,
      imageFile: null,
      imagePreview: item.imageUrl || "",
      removeImage: false,
    });
    setImageInputKey((prev) => prev + 1);
    setIsAdminPanelOpen(true);
    setErrorMessage("");
    window.requestAnimationFrame(() => {
      formWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const cancelEditing = () => {
    setEditingId("");
    resetForm();
  };

  const deleteNews = async (id) => {
    setIsDeletingId(id);
    setErrorMessage("");

    if (!canSaveNews) {
      rememberDeletedNewsId(id);
      removeLocalNewsItem(id);
      setNewsItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setIsDeletingId("");
      return;
    }

    try {
      const response = await fetch(getNewsItemApiUrl(id), {
        method: "DELETE",
        headers: {
          "x-admin-key": adminKey,
        },
      });

      const result = await readJsonResponse(
        response,
        "Unable to delete shared news."
      );
      if (!response.ok && response.status !== 404) {
        throw new Error(result.error || "Unable to delete shared news.");
      }

      rememberDeletedNewsId(id);
      removeLocalNewsItem(id);
      setNewsItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (error) {
      if (isAdminAuthError(error)) {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        setAdminKey("");
        setIsAdminPanelOpen(true);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect to the news service."
      );
    } finally {
      setIsDeletingId("");
    }
  };

  const isAdmin = Boolean(adminKey);

  return (
    <section className="news-events-page">
      <div className="news-events-container">
        <header className="news-events-header">
          <div className="news-events-header-copy">
            <span className="news-events-kicker">
              {adminMode ? "Admin Updates" : "Latest Updates"}
            </span>
            <h1>{adminMode ? "News Admin" : "Daily Company News"}</h1>
          </div>
          <div className="news-events-header-side">
            <p className="news-events-header-note">
              {adminMode
                ? "Log in with your admin key to add, update, and delete daily news items."
                : "Stay updated with recent TALME announcements, milestones, and daily business updates."}
            </p>
            {!adminMode ? (
              <button
                type="button"
                className="news-events-admin-trigger"
                onClick={() => setIsAdminPanelOpen((prev) => !prev)}
              >
                {isAdmin ? "Manage News" : "Admin Access"}
              </button>
            ) : null}
          </div>
        </header>

        {adminMode || isAdminPanelOpen ? (
          <section
            className="news-events-form-wrap"
            aria-label="Manage daily news"
            ref={formWrapRef}
          >
            {!isAdmin ? (
              <form className="news-events-admin-panel" onSubmit={handleAdminLogin}>
                <label htmlFor="news-admin-key">Admin key</label>
                <input
                  id="news-admin-key"
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  placeholder="Enter admin key"
                />
                <div className="news-events-admin-panel-actions">
                  <button type="submit">Log In</button>
                  {!adminMode ? (
                    <button
                      type="button"
                      className="news-events-admin-cancel"
                      onClick={() => setIsAdminPanelOpen(false)}
                    >
                      Close
                    </button>
                  ) : null}
                </div>
              </form>
            ) : (
              <>
                <div className="news-events-admin-bar">
                  <strong>{editingId ? "Editing news item" : "Admin mode enabled"}</strong>
                  <div className="news-events-admin-bar-actions">
                    {editingId ? (
                      <button type="button" onClick={cancelEditing}>
                        Cancel edit
                      </button>
                    ) : null}
                    <button type="button" onClick={handleAdminLogout}>
                      Log out
                    </button>
                  </div>
                </div>

                <form className="news-events-form" onSubmit={submitNews}>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="News title"
                    className="news-events-input"
                    required
                  />
                  <input
                    type="date"
                    name="isoDate"
                    value={formData.isoDate}
                    onChange={handleChange}
                    className="news-events-input news-events-date-input"
                    required
                  />
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Type today's news or event update here"
                    className="news-events-textarea"
                    rows="4"
                    required
                  />
                  <div className="news-events-image-field">
                    <label htmlFor="news-image">Image upload</label>
                    <input
                      key={imageInputKey}
                      id="news-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {formData.imagePreview ? (
                      <div className="news-events-image-preview">
                        <img src={formData.imagePreview} alt="" />
                        <button type="button" onClick={removeSelectedImage}>
                          Remove image
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className="news-events-button"
                    disabled={!canSaveNews || status === "submitting"}
                  >
                    {status === "submitting"
                      ? editingId
                        ? "Updating..."
                        : "Saving..."
                      : editingId
                        ? "Update News"
                        : "Add News"}
                  </button>
                </form>
              </>
            )}
          </section>
        ) : null}

        {noticeMessage ? (
          <p className="news-events-message news-events-message-warning">
            {noticeMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="news-events-message news-events-message-error">
            {errorMessage}
          </p>
        ) : null}

        <section className="news-events-grid" aria-label="Daily company news">
          {status === "loading" && newsItems.length === 0 ? (
            <p className="news-events-message">Loading news...</p>
          ) : null}

          {newsItems.map((item) => (
            <article
              className={`news-events-card${item.imageUrl ? " news-events-card-with-image" : ""}`}
              key={item.id}
            >
              <div className="news-events-card-head">
                <span className="news-events-card-label">News Brief</span>
                <time className="news-events-date" dateTime={item.isoDate}>
                  {item.date}
                </time>
                {isAdmin ? (
                  <div className="news-events-card-actions">
                    <button
                      type="button"
                      className="news-events-edit"
                      onClick={() => startEditing(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="news-events-delete"
                      onClick={() => deleteNews(item.id)}
                      disabled={isDeletingId === item.id}
                    >
                      {isDeletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="news-events-card-body">
                {item.imageUrl ? (
                  <img
                    className="news-events-card-image"
                    src={item.imageUrl}
                    alt={item.title}
                  />
                ) : null}
                <div className="news-events-card-copy">
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}

export default NewsEventsPage;
