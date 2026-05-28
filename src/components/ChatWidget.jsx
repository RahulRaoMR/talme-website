import { useState } from "react";
import "./ChatWidget.css";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("inbox");
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });

  const openWidget = () => {
    setIsOpen(true);
  };

  const closeWidget = () => {
    setIsOpen(false);
    setView("inbox");
    setSubmitState({ status: "idle", message: "" });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({ status: "sending", message: "Sending your message..." });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitState({
        status: "success",
        message: "Message sent successfully. Our HR team will contact you soon.",
      });
      setFormData({
        name: "",
        message: "",
      });
    } catch {
      setSubmitState({
        status: "error",
        message: "Unable to send now. Please try again in a moment.",
      });
    }
  };

  return (
    <div className="chat-widget-shell" aria-live="polite">
      {isOpen && (
        <aside className="chat-panel" aria-label="Contact chat panel">
          <header className="chat-header">
            {view === "form" ? (
              <button
                type="button"
                className="chat-header-icon"
                onClick={() => setView("inbox")}
                aria-label="Back to recent conversations"
              >
                &#8249;
              </button>
            ) : (
              <span className="chat-header-space" aria-hidden="true" />
            )}

            <div className="chat-header-center">
              <h3>Contact Us</h3>
              <p>We&apos;ll respond as soon as we can.</p>
            </div>

            <button
              type="button"
              className="chat-header-icon"
              onClick={closeWidget}
              aria-label="Close chat"
            >
              &#709;
            </button>
          </header>

          {view === "inbox" ? (
            <>
              <section className="chat-avatar-row">
                <div className="chat-avatar">👤</div>
              </section>

              <section className="chat-history-card">
                <h4>Recent Conversations</h4>
                <article className="chat-history-item">
                  <p className="chat-history-title">Talme Technologies</p>
                  <p className="chat-history-text">
                    Let me know if you have any questions!
                  </p>
                </article>
                <article className="chat-history-item muted">
                  <p className="chat-history-title">Talme Technologies</p>
                  <p className="chat-history-text">hi</p>
                </article>
              </section>

              <div className="chat-action-row">
                <button
                  type="button"
                  className="chat-primary-btn"
                  onClick={() => setView("form")}
                >
                  Send a Message
                </button>
              </div>
            </>
          ) : (
            <section className="chat-form-wrap">
              <div className="chat-bubble">hi</div>
              <p className="chat-meta">Now</p>

              <form className="chat-form-card" onSubmit={handleSubmit}>
                <p>We just need some more information from you to proceed:</p>
                <label htmlFor="chat-name">Name</label>
                <input
                  id="chat-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="chat-message">Message</label>
                <textarea
                  id="chat-message"
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
                <button type="submit" className="chat-primary-btn">
                  {submitState.status === "sending" ? "Sending..." : "Send"}
                </button>
                {submitState.status !== "idle" && (
                  <p className={`chat-submit-note ${submitState.status}`}>
                    {submitState.message}
                  </p>
                )}
              </form>
            </section>
          )}
        </aside>
      )}

      <button
        type="button"
        className={`chat-launcher ${isOpen ? "open" : ""}`}
        onClick={isOpen ? closeWidget : openWidget}
        aria-label={isOpen ? "Close chat widget" : "Open chat widget"}
      >
        {isOpen ? (
          <>
            <span className="chat-close-mark">&#10005;</span>
          </>
        ) : (
          <>
            <span className="chat-message-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <path d="M7 7.5h10a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 17 17.5h-6.4l-3.8 3V17.5H7A2.5 2.5 0 0 1 4.5 15v-5A2.5 2.5 0 0 1 7 7.5Z" />
              </svg>
            </span>
          </>
        )}
      </button>
    </div>
  );
}

export default ChatWidget;
