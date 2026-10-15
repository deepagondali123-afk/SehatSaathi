import { useEffect, useRef, useState } from "react";
import {
  AlarmClock,
  CalendarDays,
  ClipboardList,
  Heart,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Mic,
  Paperclip,
  Pill,
  Plus,
  Send,
  Settings,
  User,
  Users,
} from "lucide-react";

/* ==========================================================================
   Sehat Saathi — AI Care Assistant (frontend-only UI prototype)

   Nothing in this file talks to a server or an AI model.
   To connect the real agent later, replace ONLY the function
   `requestAssistantReply` below. Everything else can stay as it is.
   ========================================================================== */

const DEMO_REPLY_TEXT =
  "Your care assistant will respond here once the agent is connected.";

// ---- Integration point for the real agent (the only place to change) -------
// Receives the user's text and the conversation so far.
// Must return a string (the assistant's reply).
async function requestAssistantReply(userText, conversation) { // eslint-disable-line no-unused-vars
  return DEMO_REPLY_TEXT;
}
// ----------------------------------------------------------------------------

const SUGGESTIONS = [
  { id: "symptoms", icon: HeartPulse, text: "Help me understand my symptoms" },
  { id: "history", icon: ClipboardList, text: "Organize my medical history" },
  { id: "visit", icon: CalendarDays, text: "Help me prepare for a doctor visit" },
  { id: "prescription", icon: Pill, text: "Help me keep track of my prescription" },
];

// "Talk to Sehat AI" is the active item on the /chat page.
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: false },
  { id: "assistant", label: "Talk to Sehat AI", icon: MessageCircle, active: true },
  { id: "history", label: "Medical History", icon: ClipboardList, active: false },
  { id: "hospitals", label: "Find Hospitals", icon: MapPin, active: false },
  { id: "appointments", label: "Appointments", icon: CalendarDays, active: false },
  { id: "reminders", label: "Medicine Reminders", icon: AlarmClock, active: false },
  { id: "family", label: "Family Support", icon: Users, active: false },
  { id: "settings", label: "Settings", icon: Settings, active: false },
];

let messageCounter = 0;
const makeMessageId = () => `msg-${++messageCounter}`;

function createMessage(role, text, extra = {}) {
  return { id: makeMessageId(), role, text, time: new Date(), ...extra };
}

function createInitialMessages() {
  return [
    createMessage(
      "assistant",
      "Hello! I'm your Sehat Saathi care assistant. I can help you organize your health information and prepare for conversations with your healthcare team."
    ),
    createMessage("user", "I'd like to keep my questions for the doctor in one place.", {
      isSample: true,
    }),
    createMessage(
      "assistant",
      "This is a sample message that shows how replies will look. It is not real advice.",
      { isSample: true }
    ),
  ];
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------ Small components ------------------------- */

function AssistantAvatar() {
  return (
    <span className="ss-avatar" aria-hidden="true">
      <Heart size={16} />
    </span>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <li className={`ss-message ${isUser ? "ss-message--user" : "ss-message--assistant"}`}>
      {!isUser && <AssistantAvatar />}
      <div className="ss-message-body">
        <div className={`ss-bubble ${message.isSample ? "ss-bubble--sample" : ""}`}>
          {message.text}
        </div>
        <div className="ss-meta">
          <span>{isUser ? "You" : "Care assistant"}</span>
          <time dateTime={message.time.toISOString()}>{formatTime(message.time)}</time>
          {message.isSample && <span className="ss-tag">Sample</span>}
          {message.isDemo && <span className="ss-tag ss-tag--gold">Demo placeholder</span>}
        </div>
      </div>
    </li>
  );
}

// Show this while waiting for the real agent. Controlled by `isAssistantTyping`.
function TypingIndicator() {
  return (
    <li className="ss-message ss-message--assistant" aria-live="polite">
      <AssistantAvatar />
      <div className="ss-message-body">
        <div className="ss-bubble ss-typing" role="status" aria-label="Care assistant is typing">
          <span className="ss-dot" />
          <span className="ss-dot" />
          <span className="ss-dot" />
        </div>
      </div>
    </li>
  );
}

function Sidebar({ onNewConversation }) {
  return (
    <aside className="ss-sidebar" aria-label="Sehat Saathi navigation">
      <div className="ss-brand">
        <span className="ss-brand-mark" aria-hidden="true">
          <HeartPulse size={20} />
        </span>
        <span className="ss-brand-name">Sehat Saathi</span>
      </div>

      <h2 className="ss-sidebar-heading">Your Care Companion</h2>

      <nav className="ss-nav" aria-label="Sections">
        {NAV_ITEMS.map(({ id, label, icon: Icon, active }) => (
          <button
            key={id}
            type="button"
            className={`ss-nav-item ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
            aria-disabled={active ? undefined : "true"}
            title={active ? label : `${label} (not available in this preview)`}
            aria-label={label}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="ss-label">{label}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="ss-new-chat"
        onClick={onNewConversation}
        aria-label="New conversation"
      >
        <Plus size={18} aria-hidden="true" />
        <span className="ss-label">New conversation</span>
      </button>

      <div className="ss-profile">
        <span className="ss-profile-avatar" aria-hidden="true">
          <User size={18} />
        </span>
        <span className="ss-profile-name ss-label">My Health Profile</span>
        <button
          type="button"
          className="ss-icon-button ss-label"
          aria-label="Profile settings (coming soon)"
          title="Settings (coming soon)"
          aria-disabled="true"
        >
          <Settings size={18} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

/* ------------------------------ Main page -------------------------------- */

export default function ChatbotPage() {
  const [messages, setMessages] = useState(createInitialMessages);
  const [inputText, setInputText] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const messageListRef = useRef(null);
  const textareaRef = useRef(null);

  const hasUserSentMessage = messages.some((m) => m.role === "user" && !m.isSample);
  const canSend = inputText.trim().length > 0 && !isAssistantTyping;

  // Start at the top (welcome message) until the user sends something,
  // then keep the newest message in view.
  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    list.scrollTop = hasUserSentMessage || isAssistantTyping ? list.scrollHeight : 0;
  }, [messages, isAssistantTyping, hasUserSentMessage]);

  // Grow the text box with its content (up to a limit set in CSS).
  useEffect(() => {
    const box = textareaRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  }, [inputText]);

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text || isAssistantTyping) return;

    const userMessage = createMessage("user", text);
    const conversationSoFar = [...messages, userMessage];
    setMessages(conversationSoFar);
    setInputText("");
    setIsAssistantTyping(true);

    try {
      const replyText = await requestAssistantReply(text, conversationSoFar);
      setMessages((current) => [
        ...current,
        createMessage("assistant", replyText, { isDemo: true }),
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage("assistant", "Something went wrong. Please try again.", { isDemo: true }),
      ]);
    } finally {
      setIsAssistantTyping(false);
    }
  }

  function handleKeyDown(event) {
    // Enter sends; Shift+Enter adds a new line.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendMessage(inputText);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(inputText);
  }

  function startNewConversation() {
    setMessages(createInitialMessages());
    setInputText("");
    setIsAssistantTyping(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="ss-app">
      <style>{CSS}</style>

      <div className="ss-shell">
        <Sidebar onNewConversation={startNewConversation} />

        <main className="ss-chat">
          <header className="ss-chat-header">
            <div>
              <p className="ss-chat-eyebrow">Sehat Saathi</p>
              <h1 className="ss-chat-title">AI Care Assistant</h1>
              <p className="ss-chat-subtitle">
                Let's make your healthcare journey easier, one step at a time.
              </p>
            </div>
            <p className="ss-status" role="status">
              <span className="ss-status-dot" aria-hidden="true" />
              Demo mode: agent not connected
            </p>
          </header>

          <div className="ss-messages" ref={messageListRef} tabIndex={0} aria-label="Conversation">
            <p className="ss-demo-note">
              Messages marked "Sample" or "Demo placeholder" are illustrative UI content, not
              medical advice.
            </p>

            <ol className="ss-message-list" aria-live="polite">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isAssistantTyping && <TypingIndicator />}
            </ol>

            {!hasUserSentMessage && (
              <section className="ss-suggestions" aria-label="Suggested prompts">
                {SUGGESTIONS.map(({ id, icon: Icon, text }) => (
                  <button
                    key={id}
                    type="button"
                    className="ss-suggestion"
                    onClick={() => sendMessage(text)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{text}</span>
                  </button>
                ))}
              </section>
            )}
          </div>

          <form className="ss-composer" onSubmit={handleSubmit}>
            <div className="ss-composer-row">
              <button
                type="button"
                className="ss-icon-button"
                disabled
                aria-label="Attach a document (coming soon)"
                title="Attachments: coming soon"
              >
                <Paperclip size={20} aria-hidden="true" />
              </button>

              <label htmlFor="ss-message-input" className="ss-visually-hidden">
                Message to your care assistant
              </label>
              <textarea
                id="ss-message-input"
                ref={textareaRef}
                className="ss-input"
                rows={1}
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me how I can help..."
              />

              <button
                type="button"
                className="ss-icon-button"
                disabled
                aria-label="Voice input (coming soon)"
                title="Voice: coming soon"
              >
                <Mic size={20} aria-hidden="true" />
              </button>

              <button
                type="submit"
                className="ss-send"
                disabled={!canSend}
                aria-label="Send message"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="ss-disclaimer">
              For health emergencies, contact local emergency services. This demo assistant does
              not provide diagnoses or replace professional medical advice.
            </p>
          </form>
        </main>

      </div>
    </div>
  );
}

/* ------------------------------ Styles ----------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

.ss-app {
  --beige: #C9AD91;
  --cream: #F5F0E7;
  --ivory: #FFFEFA;
  --forest: #073B32;
  --sage: #A6B8A4;
  --gold: #EFC477;
  --text: #18332E;
  --muted: #6E756D;
  --error: #8A2D1F;
  --line: rgba(7, 59, 50, 0.12);
  --shadow: 0 10px 30px rgba(7, 59, 50, 0.10);

  box-sizing: border-box;
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  text-align: left;
  background: var(--beige);
  color: var(--text);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  overflow: hidden;
}
.ss-app *, .ss-app *::before, .ss-app *::after { box-sizing: border-box; }
.ss-app button, .ss-app textarea { font-family: inherit; }
.ss-app :where(h1, h2, h3, p) { margin: 0; }
.ss-app :where(ul, ol) { margin: 0; padding: 0; list-style: none; }

.ss-app :focus-visible { outline: 3px solid var(--forest); outline-offset: 2px; }
.ss-visually-hidden {
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap;
}

/* ---- Shell: sidebar | chat ---- */
.ss-shell {
  height: 100%;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
}

/* ---- Sidebar ---- */
.ss-sidebar {
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
}
.ss-sidebar > * { flex-shrink: 0; }
.ss-brand { display: flex; align-items: center; gap: 10px; padding: 0 6px; }
.ss-brand-mark {
  width: 38px; height: 38px; border-radius: 12px; flex: none;
  background: var(--forest); color: var(--gold);
  display: grid; place-items: center;
}
.ss-brand-name { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 600; color: var(--forest); }
.ss-sidebar-heading { font-size: 14px; font-weight: 500; color: var(--muted); padding: 14px 8px 4px; }

.ss-nav { display: flex; flex-direction: column; gap: 2px; }
.ss-nav-item {
  display: flex; align-items: center; gap: 12px; width: 100%;
  min-height: 42px; padding: 0 12px; border: 0; border-radius: 14px;
  background: transparent; color: var(--text); font-size: 15px; font-weight: 500;
  text-align: left; cursor: pointer;
}
.ss-nav-item[aria-disabled="true"] { cursor: default; color: var(--muted); }
.ss-nav-item:not([aria-disabled="true"]):not(.is-active):hover { background: rgba(166, 184, 164, 0.25); }
.ss-nav-item.is-active { background: var(--forest); color: var(--ivory); }
.ss-nav-item.is-active svg { color: var(--gold); }

.ss-new-chat {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 46px; margin-top: 8px; border-radius: 14px;
  border: 1px solid var(--forest); background: var(--ivory); color: var(--forest);
  font-size: 15px; font-weight: 600; cursor: pointer;
}
.ss-new-chat:hover { background: var(--forest); color: var(--ivory); }

.ss-profile {
  margin-top: auto; display: flex; align-items: center; gap: 10px;
  padding: 8px; border-radius: 16px; background: var(--ivory); border: 1px solid var(--line);
}
.ss-profile { gap: 8px; }
.ss-profile .ss-icon-button { width: 32px; height: 32px; }
.ss-profile-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex: none;
  background: var(--sage); color: var(--forest); display: grid; place-items: center;
}
.ss-profile-name { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.ss-icon-button {
  width: 44px; height: 44px; flex: none; border-radius: 14px; border: 0;
  background: transparent; color: var(--forest);
  display: grid; place-items: center; cursor: pointer;
}
.ss-icon-button:disabled, .ss-icon-button[aria-disabled="true"] { color: var(--muted); opacity: 0.55; cursor: not-allowed; }

/* ---- Chat ---- */
.ss-chat {
  background: var(--ivory);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow);
  display: flex; flex-direction: column;
  min-width: 0; min-height: 0; overflow: hidden;
}
.ss-chat-header {
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px 24px;
  padding: 20px 28px; border-bottom: 1px solid var(--line); background: var(--cream);
}
.ss-chat-header > div { flex: 1 1 300px; min-width: 0; }
.ss-chat-eyebrow { font-size: 14px; font-weight: 600; color: var(--muted); }
.ss-chat-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; line-height: 1.2; font-weight: 600; color: var(--forest); }
.ss-chat-subtitle { margin-top: 4px; color: var(--muted); font-size: 15px; text-wrap: balance; }
.ss-status {
  white-space: nowrap;
  display: inline-flex; align-items: center; gap: 8px; flex: none;
  padding: 6px 12px; border-radius: 999px; background: var(--ivory);
  border: 1px solid var(--line); font-size: 13px; font-weight: 500; color: var(--text);
}
.ss-status-dot { width: 9px; height: 9px; border-radius: 50%; background: #4F8A67; }

.ss-messages { flex: 1; min-height: 0; overflow-y: auto; padding: 22px 28px; }
.ss-demo-note {
  max-width: 640px; margin: 0 auto 20px; text-wrap: balance; padding: 8px 14px; text-align: center;
  font-size: 13px; color: var(--muted); border: 1px dashed var(--sage); border-radius: 12px;
}
.ss-message-list { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: 880px; margin-inline: auto; }
.ss-message { display: flex; gap: 10px; max-width: 100%; }
.ss-message--user { flex-direction: row-reverse; }
.ss-message-body { display: flex; flex-direction: column; gap: 6px; min-width: 0; max-width: min(620px, 82%); }
.ss-message--user .ss-message-body { align-items: flex-end; }

.ss-avatar {
  width: 34px; height: 34px; border-radius: 50%; flex: none;
  background: var(--forest); color: var(--gold); display: grid; place-items: center;
}
.ss-bubble {
  padding: 12px 16px; border-radius: 18px; font-size: 15.5px; line-height: 1.55;
  overflow-wrap: anywhere; white-space: pre-wrap;
}
.ss-message--assistant .ss-bubble { background: var(--cream); border: 1px solid var(--line); border-top-left-radius: 6px; }
.ss-message--user .ss-bubble { background: var(--forest); color: var(--ivory); border: 1px solid var(--forest); border-top-right-radius: 6px; }
.ss-bubble--sample { border-style: dashed !important; }

.ss-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); }
.ss-tag {
  padding: 1px 8px; border-radius: 999px; background: rgba(166, 184, 164, 0.35);
  color: var(--forest); font-weight: 600;
}
.ss-tag--gold { background: rgba(239, 196, 119, 0.45); }

.ss-typing { display: inline-flex; align-items: center; gap: 5px; padding: 15px 18px; }
.ss-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--muted); animation: ss-bounce 1.2s infinite ease-in-out; }
.ss-dot:nth-child(2) { animation-delay: 0.15s; }
.ss-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes ss-bounce { 0%, 60%, 100% { opacity: 0.35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }

.ss-suggestions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 24px; max-width: 880px; margin-inline: auto; }
.ss-suggestion {
  display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 12px 16px;
  text-align: left; font-size: 15px; font-weight: 500; color: var(--text);
  background: var(--ivory); border: 1px solid var(--line); border-radius: 16px; cursor: pointer;
}
.ss-suggestion svg { flex: none; color: var(--forest); }
.ss-suggestion:hover { background: var(--cream); border-color: var(--sage); }

/* ---- Composer ---- */
.ss-composer { padding: 14px 28px 16px; border-top: 1px solid var(--line); background: var(--cream); }
.ss-composer-row {
  display: flex; align-items: flex-end; gap: 6px; padding: 6px; max-width: 880px; margin-inline: auto;
  background: var(--ivory); border: 1px solid var(--line); border-radius: 20px;
}
.ss-composer-row:focus-within { border-color: var(--forest); }
.ss-input {
  flex: 1; min-width: 0; min-height: 44px; max-height: 140px; resize: none;
  border: 0; background: transparent; color: var(--text);
  padding: 10px 6px; font-size: 16px; line-height: 1.45;
}
.ss-input::placeholder { color: var(--muted); }
.ss-input:focus-visible { outline: none; }
.ss-send {
  width: 44px; height: 44px; flex: none; border: 0; border-radius: 14px; cursor: pointer;
  background: var(--forest); color: var(--ivory); display: grid; place-items: center;
}
.ss-send:hover:not(:disabled) { background: #0B4A3F; }
.ss-send:disabled { background: var(--sage); cursor: not-allowed; }
.ss-disclaimer { max-width: 880px; margin-inline: auto; margin-top: 8px; font-size: 12.5px; line-height: 1.4; color: var(--muted); text-align: center; }

/* ---- Tablet: compact icon sidebar ---- */
@media (max-width: 1023px) {
  .ss-shell { grid-template-columns: 76px minmax(0, 1fr); }
  .ss-label, .ss-brand-name, .ss-sidebar-heading { display: none; }
  .ss-sidebar { align-items: center; padding: 16px 10px; }
  .ss-brand { padding: 0; }
  .ss-nav { align-items: center; }
  .ss-nav-item, .ss-new-chat { justify-content: center; width: 48px; padding: 0; }
  .ss-profile { padding: 6px; background: transparent; border: 0; }
}

/* ---- Mobile: single column, brand row + icon row on top ---- */
@media (max-width: 719px) {
  .ss-shell { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); gap: 8px; padding: 8px; }
  .ss-sidebar { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; padding: 8px 10px; border-radius: 18px; overflow: visible; }
  .ss-brand { flex: 1 1 auto; }
  .ss-brand-name { display: inline; }
  .ss-new-chat { order: 2; width: 44px; min-height: 44px; margin: 0; }
  .ss-nav { order: 3; flex: 1 1 100%; display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 2px; }
  .ss-nav-item { width: 100%; min-height: 44px; padding: 0; justify-content: center; }
  .ss-profile { display: none; }
  .ss-chat { border-radius: 18px; }
  .ss-chat-header { padding: 14px 16px; flex-direction: column; align-items: flex-start; gap: 8px; }
  .ss-chat-header > div { flex: 0 1 auto; }
  .ss-chat-title { font-size: 24px; }
  .ss-chat-subtitle { font-size: 14px; }
  .ss-messages { padding: 16px; }
  .ss-message-body { max-width: 88%; }
  .ss-suggestions { grid-template-columns: minmax(0, 1fr); }
  .ss-composer { padding: 10px 16px 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .ss-app *, .ss-app *::before, .ss-app *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`;
