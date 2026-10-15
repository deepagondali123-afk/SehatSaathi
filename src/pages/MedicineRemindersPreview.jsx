import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, Pill, Hospital, MessageCircleHeart, FileHeart,
  CalendarDays, Settings, HeartPulse, Bell, Search, Menu, X,
  ChevronRight, Clock, CheckCircle2, Activity, UserRound, Plus,
  ShieldCheck, Volume2, VolumeX, Trash2, Pause, Play, AlarmClock
} from "lucide-react";

const C = {
  green: "#073B32",
  beige: "#C9AD91",
  cream: "#F5F0E7",
  ivory: "#FFFEFA",
  sage: "#A6B8A4",
  gold: "#EFC477",
  text: "#18332E",
  muted: "#6E756D",
  danger: "#8A2D1F",
  border: "#E5DED3",
  softGreen: "#E8EEE7",
};

const STORAGE_KEY = "sehat-saathi-medicines-v1";

const initialMedicines = [
  { id: 1, name: "Vitamin D", dose: "1 tablet", time: "08:00", status: "Upcoming", enabled: true, lastAlert: "" },
  { id: 2, name: "Daily medicine", dose: "1 tablet", time: "14:00", status: "Upcoming", enabled: true, lastAlert: "" },
  { id: 3, name: "Evening medicine", dose: "1 tablet", time: "20:00", status: "Upcoming", enabled: true, lastAlert: "" },
];

const menus = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Medicine Reminders", icon: Pill, path: "/medicines" },
  { label: "Find Hospitals", icon: Hospital, path: "/hospitals" },
  { label: "Health Chatbot", icon: MessageCircleHeart, path: "/chat" },
  { label: "My Health Records", icon: FileHeart, path: "/records" },
  { label: "Appointments", icon: CalendarDays, path: "/appointments" },
];

function loadMedicines() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialMedicines;
  } catch {
    return initialMedicines;
  }
}

function formatTime(value) {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function playReminderSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    [0, 0.28, 0.56].forEach((offset) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.16, now + offset + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.22);
    });
    window.setTimeout(() => ctx.close(), 1300);
    return true;
  } catch {
    return false;
  }
}

export default function MedicineRemindersPreview() {
  const [active, setActive] = useState("Medicine Reminders");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState(loadMedicines);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notice, setNotice] = useState("");
  const [newMedicine, setNewMedicine] = useState({
    name: "", dose: "1 tablet", time: "09:00"
  });
  const audioUnlocked = useRef(false);
  const alertedMinute = useRef("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
  }, [medicines]);

  const enableSound = useCallback(async () => {
    const worked = playReminderSound();
    audioUnlocked.current = worked;
    setSoundEnabled(worked);
    setNotice(worked
      ? "Sound reminders are enabled on this page."
      : "Audio is unavailable. Please check your browser settings.");
    window.setTimeout(() => setNotice(""), 4000);
  }, []);

  useEffect(() => {
    if (!soundEnabled) return undefined;

    const checkReminders = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;

      if (alertedMinute.current === currentTime) return;

      const due = medicines.filter((medicine) =>
        medicine.enabled &&
        medicine.status !== "Taken" &&
        medicine.time === currentTime
      );

      if (due.length) {
        alertedMinute.current = currentTime;
        playReminderSound();
        setNotice(`Reminder: time for ${due.map((m) => m.name).join(", ")}.`);
        if ("Notification" in window && Notification.permission === "granted") {
          due.forEach((medicine) => {
            new Notification("Sehat Saathi medicine reminder", {
              body: `Time to take ${medicine.name} — ${medicine.dose}.`,
            });
          });
        }
      }
    };

    checkReminders();
    const interval = window.setInterval(checkReminders, 10000);
    return () => window.clearInterval(interval);
  }, [medicines, soundEnabled]);

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setNotice("This browser does not support notifications.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotice(permission === "granted"
        ? "Browser notifications enabled."
        : "Notifications were not allowed. Sound reminders can still work.");
    } catch {
      setNotice("Could not enable browser notifications.");
    }
    window.setTimeout(() => setNotice(""), 4000);
  };

  const goTo = (item) => {
    setActive(item.label);
    setSidebarOpen(false);
    if (item.path !== "/medicines") window.location.href = item.path;
  };

  const markTaken = (id) => {
    setMedicines((prev) => prev.map((m) =>
      m.id === id ? { ...m, status: "Taken" } : m
    ));
  };

  const addMedicine = (event) => {
    event.preventDefault();
    if (!newMedicine.name.trim()) return;
    setMedicines((prev) => [...prev, {
      id: Date.now(),
      name: newMedicine.name.trim(),
      dose: newMedicine.dose,
      time: newMedicine.time,
      status: "Upcoming",
      enabled: true,
      lastAlert: "",
    }]);
    setNewMedicine({ name: "", dose: "1 tablet", time: "09:00" });
    setShowForm(false);
    setNotice("Medicine reminder added.");
    window.setTimeout(() => setNotice(""), 3000);
  };

  const toggleReminder = (id) => {
    setMedicines((prev) => prev.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const deleteMedicine = (id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const taken = medicines.filter((m) => m.status === "Taken").length;
  const upcoming = medicines.filter((m) => m.status !== "Taken").length;
  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );
  const progress = medicines.length ? Math.round((taken / medicines.length) * 100) : 0;

  const buttonStyle = {
    border: `1px solid ${C.border}`,
    background: C.ivory,
    color: C.green,
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    fontSize: 12,
  };

  const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, marginBottom: 8 };

  return (
    <div className="ss-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        /* Undo the default Vite template styles (centred, narrow #root, dark body)
           so this page fills the whole browser window. */
        html, body, #root {
          width: 100%; max-width: none; min-height: 100vh;
          margin: 0; padding: 0; text-align: left;
          display: block; place-items: initial;
          background: ${C.cream};
        }
        button, input, select { font: inherit; }
        button:focus-visible, input:focus-visible, select:focus-visible {
          outline: 2px solid ${C.beige}; outline-offset: 2px;
        }

        /* Spacing scale used throughout: 8 / 12 / 16 / 24 / 32 */
        .ss-app { width: 100%; min-height: 100vh; text-align: left; background: ${C.cream}; color: ${C.text}; font-family: 'DM Sans', sans-serif; display: flex; }
        .ss-sidebar { width: 264px; min-width: 264px; height: 100vh; position: sticky; top: 0; overflow-y: auto; background: ${C.green}; color: ${C.ivory}; display: flex; flex-direction: column; padding: 28px 16px 24px; }
        .ss-logo { display: flex; align-items: center; gap: 12px; padding: 0 12px 32px; }
        .ss-logo-icon { width: 43px; height: 43px; border-radius: 14px; background: ${C.beige}; color: ${C.green}; display: grid; place-items: center; flex-shrink: 0; }
        .ss-nav { display: flex; align-items: center; gap: 12px; width: 100%; border: 0; border-radius: 11px; padding: 13px 14px; margin-bottom: 6px; cursor: pointer; text-align: left; font-size: 13px; transition: background .15s; }
        .ss-nav:hover { background: rgba(255,255,255,.1) !important; }
        .ss-main { flex: 1; min-width: 0; padding: 32px 40px 56px; }
        .ss-wrap { width: 100%; max-width: none; margin: 0; }
        .ss-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 32px; }
        .ss-title { font-family: 'Playfair Display', serif; font-size: clamp(25px,3vw,34px); font-weight: 600; line-height: 1.2; margin: 0; color: ${C.green}; }
        .ss-muted { color: ${C.muted}; font-size: 12px; line-height: 1.6; }
        .ss-card { background: ${C.ivory}; border: 1px solid ${C.border}; border-radius: 17px; padding: 24px; min-width: 0; }
        .ss-hero { background: ${C.green}; color: ${C.ivory}; border-radius: 19px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 24px; }
        .ss-stats { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-bottom: 24px; }
        .ss-content { display: grid; grid-template-columns: minmax(0,1.5fr) minmax(260px,1fr); gap: 24px; align-items: start; }
        .ss-side-col { display: flex; flex-direction: column; gap: 24px; }
        .ss-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ss-primary { border: 0; border-radius: 10px; padding: 11px 14px; background: ${C.green}; color: white; display: inline-flex; align-items: center; justify-content: center; gap: 7px; cursor: pointer; font-size: 12px; font-weight: 600; }
        .ss-primary:hover { background: #104b40; }
        .ss-input { width: 100%; padding: 12px; border: 1px solid ${C.border}; border-radius: 10px; background: ${C.ivory}; color: ${C.text}; font-size: 12px; }
        .ss-row { display: flex; align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid ${C.border}; }
        .ss-row:last-child { border-bottom: 0; }
        .ss-mobile-menu { display: none; }
        @media(max-width: 850px) {
          .ss-sidebar { display: none; }
          .ss-sidebar.ss-open { display: flex; position: fixed; inset: 0 auto 0 0; z-index: 30; overflow-y: auto; box-shadow: 12px 0 40px #0003; }
          .ss-mobile-menu { display: inline-flex; }
          .ss-main { padding: 20px 16px 40px; }
          .ss-top { margin-bottom: 24px; }
          .ss-card { padding: 18px; }
          .ss-hero { padding: 22px 20px; margin-bottom: 16px; }
          .ss-stats { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin-bottom: 16px; }
          .ss-content, .ss-side-col { gap: 16px; }
          .ss-content { grid-template-columns: 1fr; }
        }
        @media(max-width: 480px) {
          .ss-form-grid { grid-template-columns: 1fr; }
          .ss-row { flex-wrap: wrap; }
        }
      `}</style>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "#0005", zIndex: 29 }} />
      )}

      <aside className={`ss-sidebar ${sidebarOpen ? "ss-open" : ""}`}>
        <div className="ss-logo">
          <div className="ss-logo-icon"><HeartPulse size={25} /></div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>Sehat Saathi</div>
            <div style={{ color: "#D7C5B2", fontSize: 9, letterSpacing: 1.4, marginTop: 4 }}>YOUR HEALTH COMPANION</div>
          </div>
          <button className="ss-mobile-menu" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" style={{ ...buttonStyle, marginLeft: "auto", background: "transparent", color: C.ivory, borderColor: "#355B51" }}>
            <X size={17} />
          </button>
        </div>

        <div style={{ color: "#C9AD91", fontSize: 10, letterSpacing: 1.5, padding: "0 14px 12px" }}>YOUR SPACE</div>
        <nav aria-label="Main navigation">
          {menus.map((item) => {
            const Icon = item.icon;
            const selected = active === item.label;
            return (
              <button key={item.label} className="ss-nav" onClick={() => goTo(item)}
                style={{ color: selected ? C.green : "#F5F0E7", background: selected ? C.cream : "transparent", fontWeight: selected ? 700 : 500 }}>
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {selected && <ChevronRight size={15} />}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1, minHeight: 24 }} />

        <div style={{ margin: "0 0 16px", borderRadius: 14, padding: 16, background: "#10483D", border: "1px solid #2A5B4F" }}>
          <ShieldCheck size={21} color={C.beige} />
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 12 }}>Your health matters</div>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "#E0E8E1", marginTop: 6 }}>Small steps today can lead to a healthier tomorrow.</div>
        </div>

        <button className="ss-nav" onClick={() => { setActive("Settings"); setSidebarOpen(false); }}
          style={{ color: active === "Settings" ? C.green : C.cream, background: active === "Settings" ? C.cream : "transparent" }}>
          <Settings size={18} /><span style={{ flex: 1 }}>Settings</span>
        </button>

        <div style={{ borderTop: "1px solid #355B51", margin: "16px 8px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
          <div style={{ width: 37, height: 37, borderRadius: "50%", background: C.beige, color: C.green, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <UserRound size={19} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>My Health Space</div>
            <div style={{ fontSize: 10, color: "#D7C5B2", marginTop: 3 }}>Personal wellness</div>
          </div>
        </div>
      </aside>

      <main className="ss-main">
        <div className="ss-wrap">
          <header className="ss-top">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <button className="ss-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" style={buttonStyle}>
                <Menu size={19} />
              </button>
              <div>
                <div className="ss-muted" style={{ letterSpacing: 1.2, marginBottom: 8 }}>YOUR WELLNESS / MEDICINE REMINDERS</div>
                <h1 className="ss-title">Medicine reminders</h1>
                <p className="ss-muted" style={{ margin: "8px 0 0" }}>A little reminder can make a big difference.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <button onClick={requestNotifications} title="Enable browser notifications" style={buttonStyle}><Bell size={17} /></button>
              <button onClick={enableSound} title="Enable reminder sound" style={{ ...buttonStyle, background: soundEnabled ? C.softGreen : C.ivory, borderColor: soundEnabled ? C.sage : C.border }}>
                {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
                <span>{soundEnabled ? "Sound on" : "Enable sound"}</span>
              </button>
            </div>
          </header>

          {notice && (
            <div role="status" style={{ marginBottom: 24, padding: "14px 16px", background: C.softGreen, border: `1px solid ${C.sage}`, borderRadius: 11, color: C.green, fontSize: 12 }}>
              {notice}
            </div>
          )}

          <section className="ss-hero">
            <div style={{ maxWidth: 480 }}>
              <div style={{ color: C.beige, fontSize: 10, letterSpacing: 1.5, marginBottom: 12 }}>YOUR DAILY WELLNESS</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 25, fontWeight: 500, lineHeight: 1.25, margin: "0 0 12px" }}>Care for yourself, one dose at a time.</h2>
              <p style={{ color: "#E5EAE3", fontSize: 12, lineHeight: 1.8, margin: 0 }}>Keep your medicines organised and stay on track with your daily routine.</p>
            </div>
            <div style={{ textAlign: "center", background: "#10483D", border: "1px solid #355B51", borderRadius: 15, padding: "18px 24px", minWidth: 132 }}>
              <div style={{ color: "#D7C5B2", fontSize: 10 }}>DOSES COMPLETED</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0" }}>{taken}<span style={{ fontSize: 16, color: "#D7C5B2" }}>/{medicines.length}</span></div>
              <div style={{ color: C.beige, fontSize: 10 }}>Keep it going</div>
            </div>
          </section>

          <section className="ss-stats">
            {[
              { label: "Total medicines", value: medicines.length, icon: Pill, tint: "#E8EEE7" },
              { label: "Taken today", value: taken, icon: CheckCircle2, tint: "#F0E5D8" },
              { label: "Upcoming doses", value: upcoming, icon: Clock, tint: "#ECEDE5" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="ss-card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 43, height: 43, borderRadius: 13, display: "grid", placeItems: "center", background: item.tint, color: C.green, flexShrink: 0 }}><Icon size={20} /></div>
                  <div><div className="ss-muted">{item.label}</div><div style={{ fontSize: 24, fontWeight: 700, color: C.green, marginTop: 4 }}>{item.value}</div></div>
                </div>
              );
            })}
          </section>

          <section className="ss-content">
            <div className="ss-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: C.green }}>Your medicine schedule</h3>
                  <p className="ss-muted" style={{ margin: "6px 0 0" }}>Manage your daily doses in one place.</p>
                </div>
                <button className="ss-primary" onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Add medicine</button>
              </div>

              {showForm && (
                <form onSubmit={addMedicine} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 13, padding: 16, marginBottom: 24 }}>
                  <label style={labelStyle}>Medicine name</label>
                  <input className="ss-input" required value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} placeholder="Enter medicine name" style={{ marginBottom: 16 }} />
                  <div className="ss-form-grid">
                    <div>
                      <label style={labelStyle}>Dose</label>
                      <select className="ss-input" value={newMedicine.dose} onChange={(e) => setNewMedicine({ ...newMedicine, dose: e.target.value })}>
                        <option>1 tablet</option><option>2 tablets</option><option>5 ml</option><option>1 capsule</option><option>As prescribed</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Reminder time</label>
                      <input className="ss-input" type="time" required value={newMedicine.time} onChange={(e) => setNewMedicine({ ...newMedicine, time: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button className="ss-primary" type="submit">Save reminder</button>
                    <button type="button" onClick={() => setShowForm(false)} style={buttonStyle}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ position: "relative", marginBottom: 12 }}>
                <Search size={16} color={C.muted} style={{ position: "absolute", top: 13, left: 12 }} />
                <input className="ss-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your medicines..." style={{ paddingLeft: 38 }} />
              </div>

              {filtered.length === 0 && <p className="ss-muted" style={{ textAlign: "center", padding: 24, margin: 0 }}>No medicines found.</p>}

              {filtered.map((medicine) => (
                <div key={medicine.id} className="ss-row">
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: C.softGreen, color: C.green, display: "grid", placeItems: "center", flexShrink: 0 }}><Pill size={20} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{medicine.name}</div>
                    <div className="ss-muted" style={{ marginTop: 4 }}>{medicine.dose} · {formatTime(medicine.time)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: medicine.status === "Taken" ? C.green : C.muted, background: medicine.status === "Taken" ? C.softGreen : C.cream, borderRadius: 20, padding: "4px 10px" }}>{medicine.status}</span>
                      {!medicine.enabled && <span style={{ fontSize: 10, color: C.danger }}>Reminder paused</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {medicine.status !== "Taken" && <button onClick={() => markTaken(medicine.id)} style={{ ...buttonStyle, background: C.softGreen, borderColor: C.sage }} title="Mark as taken"><CheckCircle2 size={14} /> Taken</button>}
                    <button onClick={() => toggleReminder(medicine.id)} style={buttonStyle} title={medicine.enabled ? "Pause reminder" : "Resume reminder"}>{medicine.enabled ? <Pause size={14} /> : <Play size={14} />}</button>
                    <button onClick={() => deleteMedicine(medicine.id)} style={{ ...buttonStyle, color: C.danger }} title="Delete reminder"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}

              <p className="ss-muted" style={{ fontSize: 10, lineHeight: 1.7, margin: "20px 0 0" }}>
                Demonstration reminder schedule. Always follow your healthcare professional's instructions for medicines and dosage.
              </p>
            </div>

            <div className="ss-side-col">
              <div className="ss-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "#F0E5D8", color: C.green, display: "grid", placeItems: "center", flexShrink: 0 }}><CalendarDays size={19} /></div>
                  <div><h3 style={{ fontSize: 15, margin: 0, color: C.green }}>Today's progress</h3><p className="ss-muted" style={{ margin: "4px 0 0" }}>Your daily routine</p></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}><span className="ss-muted">Doses completed</span><strong>{progress}%</strong></div>
                <div style={{ height: 8, borderRadius: 10, background: C.cream, overflow: "hidden" }}><div style={{ width: `${progress}%`, height: "100%", background: C.green, borderRadius: 10, transition: "width .3s" }} /></div>
                <p className="ss-muted" style={{ lineHeight: 1.8, margin: "16px 0 0" }}>Every small step towards your health is worth celebrating.</p>
              </div>

              <div className="ss-card" style={{ background: C.softGreen }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}><AlarmClock size={21} color={C.green} /><h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: 0, color: C.green }}>Reminder settings</h3></div>
                <p style={{ color: C.text, fontSize: 12, lineHeight: 1.8, margin: "12px 0 20px" }}>Enable sound to hear a chime when a scheduled medicine is due. Browser notifications are optional.</p>
                <button onClick={enableSound} className="ss-primary" style={{ width: "100%", background: soundEnabled ? "#E8EEE7" : C.green, color: soundEnabled ? C.green : C.ivory, border: soundEnabled ? `1px solid ${C.sage}` : 0 }}>
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  {soundEnabled ? "Sound reminders enabled" : "Enable sound reminders"}
                </button>
                <button onClick={requestNotifications} style={{ ...buttonStyle, width: "100%", marginTop: 12, background: "transparent" }}><Bell size={15} /> Allow browser notifications</button>
              </div>

              <div className="ss-card" style={{ background: "#F0E5D8" }}>
                <HeartPulse size={22} color={C.green} />
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, margin: "12px 0 8px", color: C.green }}>Your wellbeing comes first</h3>
                <p className="ss-muted" style={{ lineHeight: 1.8, margin: 0 }}>Keep your schedule updated and speak with your healthcare professional whenever you have questions about a medicine.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}