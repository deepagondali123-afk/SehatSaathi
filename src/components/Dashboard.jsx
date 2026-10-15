
import { useRef, useState } from 'react';
import {
  HeartPulse, LayoutDashboard, MessageCircle, FileText, Hospital,
  CalendarDays, Pill, Users, Settings, LogOut, Bell, Search, Plus,
  ArrowUpRight, Send, Paperclip, MapPin, ChevronRight, Menu, X,
  ShieldCheck, CheckCircle2, FileImage, Trash2, Heart, CalendarCheck,
  UserRound, Languages, AlertCircle, Upload, Clock, Download,
  Activity, Stethoscope, ClipboardList, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assistant', label: 'Talk to Sehat AI', icon: MessageCircle },
  { id: 'records', label: 'Medical History', icon: FileText },
  { id: 'hospitals', label: 'Find Hospitals', icon: Hospital },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'medicines', label: 'Medicine Reminders', icon: Pill },
  { id: 'family', label: 'Family Support', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Fictional records for the prototype. These are not real patient records.
const sampleHistory = [
  {
    id: 1,
    title: 'General Health Check-up',
    category: 'Consultation',
    date: '12 Sep 2026',
    doctor: 'General Physician',
    detail: 'Routine consultation',
    icon: Stethoscope,
    color: 'sage',
    status: 'Sample record',
  },
  {
    id: 2,
    title: 'Complete Blood Count',
    category: 'Lab report',
    date: '28 Aug 2026',
    doctor: 'Diagnostic Laboratory',
    detail: 'Blood test report',
    icon: Activity,
    color: 'gold',
    status: 'Sample record',
  },
  {
    id: 3,
    title: 'Previous Prescription',
    category: 'Prescription',
    date: '15 Aug 2026',
    doctor: 'General Physician',
    detail: 'Consultation prescription',
    icon: FileText,
    color: 'beige',
    status: 'Sample record',
  },
  {
    id: 4,
    title: 'Follow-up Summary',
    category: 'Visit summary',
    date: '02 Aug 2026',
    doctor: 'Outpatient Department',
    detail: 'Previous visit summary',
    icon: ClipboardList,
    color: 'sage',
    status: 'Sample record',
  },
];

const journey = [
  'Review your medical history',
  'Find a nearby hospital or clinic',
  'Request an appointment',
  'Prepare for your doctor visit',
  'Discuss a prescription with a healthcare professional',
  'Organise your medicine reminders',
];

function HealthIllustration({ variant = 'welcome' }) {
  if (variant === 'records') {
    return (
      <svg viewBox="0 0 220 180" role="img" aria-label="Medical records illustration">
        <circle cx="110" cy="90" r="77" fill="#E8EFE5" />
        <rect x="58" y="34" width="88" height="112" rx="12" fill="#FFFEFA" stroke="#B5C9B6" strokeWidth="2" />
        <path d="M80 61h43M80 75h43M80 89h28" stroke="#A6B8A4" strokeWidth="5" strokeLinecap="round" />
        <rect x="92" y="101" width="72" height="54" rx="10" fill="#073B32" />
        <path d="M128 112v32M112 128h32" stroke="#F5F0E7" strokeWidth="6" strokeLinecap="round" />
        <circle cx="158" cy="48" r="18" fill="#EFC477" />
        <path d="M150 48l6 6 11-13" stroke="#073B32" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 260 205" role="img" aria-label="Sehat Saathi healthcare illustration">
      <circle cx="130" cy="100" r="88" fill="#E8EFE5" />
      <circle cx="130" cy="100" r="65" fill="#D8E5D7" />
      <rect x="79" y="46" width="102" height="124" rx="17" fill="#FFFEFA" stroke="#B5C9B6" strokeWidth="2" />
      <rect x="98" y="62" width="64" height="7" rx="3.5" fill="#C9AD91" />
      <path d="M130 87v42M109 108h42" stroke="#073B32" strokeWidth="12" strokeLinecap="round" />
      <circle cx="190" cy="54" r="23" fill="#EFC477" />
      <path d="M179 54l8 8 15-18" stroke="#073B32" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="65" cy="136" r="15" fill="#C9AD91" />
      <path d="M59 136l5 5 8-10" stroke="#FFFEFA" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 58c9-10 18-10 27 0M198 140c8-9 16-9 24 0" stroke="#A6B8A4" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Dashboard() {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [patientName, setPatientName] = useState('Patient');
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatFiles, setChatFiles] = useState([]);
  const [hospitalQuery, setHospitalQuery] = useState('');
  const [location, setLocation] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [familyEmail, setFamilyEmail] = useState('');
  const [familyConsent, setFamilyConsent] = useState(false);
  const [notice, setNotice] = useState('');
  const [language, setLanguage] = useState('English');
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    largeText: false,
  });

  const chatUploadRef = useRef(null);
  const chatEndRef = useRef(null);

  const notify = (message) => setNotice(message);

  
const goTo = (id) => {
  if (id === 'medicine-reminders-preview') {
    navigate('/medicine-reminders-preview');
    return;
  }

  setActive(id);
  setMenuOpen(false);
  setNotice('');
};


  const addChatFiles = (fileList) => {
    const selected = Array.from(fileList || []);
    const accepted = selected.filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.type.startsWith('image/')
    );

    if (!accepted.length) {
      notify('Please choose a prescription image or PDF document.');
      return;
    }

    const additions = accepted.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : '',
    }));

    setChatFiles((old) => [...old, ...additions]);
    notify(
      `${accepted.length} document(s) attached to this demo chat. They have not been analysed or uploaded to a server.`
    );
  };

  const removeChatFile = (id) => {
    setChatFiles((old) => {
      const target = old.find((file) => file.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return old.filter((file) => file.id !== id);
    });
  };

  const sendMessage = (event) => {
    event?.preventDefault();

    const text = chatText.trim();
    if (!text && chatFiles.length === 0) return;

    const attachedFiles = chatFiles.map((file) => ({
      name: file.name,
      size: file.size,
    }));

    setMessages((old) => [
      ...old,
      {
        id: Date.now(),
        role: 'patient',
        text,
        files: attachedFiles,
      },
      {
        id: Date.now() + 1,
        role: 'assistant',
        text: attachedFiles.length
          ? 'I can see that you attached a document in this demo. However, I cannot read or interpret its contents because a medical AI service is not connected yet. Please confirm prescription instructions with your doctor or pharmacist. I can help you navigate the other sections of this prototype.'
          : 'Thanks for sharing. Sehat Saathi is currently a frontend demo and is not connected to a medical AI service. I can help you explore the prototype, but I cannot diagnose symptoms or provide personalised medical decisions. For medical advice, please contact a qualified healthcare professional.',
        files: [],
      },
    ]);

    setChatText('');
    setChatFiles([]);

    requestAnimationFrame(() =>
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    );
  };

  const createAppointmentRequest = (event) => {
    event.preventDefault();

    if (!appointmentDate || !appointmentTime) {
      notify('Please select a preferred date and time.');
      return;
    }

    setAppointmentRequests((old) => [
      ...old,
      {
        id: Date.now(),
        date: appointmentDate,
        time: appointmentTime,
        reason: appointmentReason || 'General consultation',
        status: 'Demo request — not booked',
      },
    ]);

    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentReason('');
    notify('Demo request saved on this page only. No appointment has been booked.');
  };

  const filteredHospitals = [
    {
      name: 'Nearby Government Hospital',
      type: 'Government hospital',
      address: 'Live location details are not connected',
      services: 'Outpatient care · Emergency department',
    },
    {
      name: 'Community Health Centre',
      type: 'Community health centre',
      address: 'Live location details are not connected',
      services: 'Primary care · General consultation',
    },
    {
      name: 'Primary Health Centre',
      type: 'Primary health centre',
      address: 'Live location details are not connected',
      services: 'Basic healthcare · Preventive care',
    },
  ].filter((hospital) =>
    `${hospital.name} ${hospital.type} ${hospital.services}`
      .toLowerCase()
      .includes(hospitalQuery.toLowerCase())
  );

  const pageTitle =
    navItems.find((item) => item.id === active)?.label || 'Dashboard';

  return (
    <div className={`ss-app ${settings.largeText ? 'ss-large-text' : ''}`}>
      <aside className={`ss-app-sidebar ${menuOpen ? 'ss-app-sidebar-open' : ''}`}>
        <Link to="/" className="ss-app-brand">
          <span className="ss-app-brand-mark">
            <HeartPulse size={23} />
          </span>
          <span>Sehat <b>Saathi</b></span>
        </Link>

        <div className="ss-app-side-label">YOUR WORKSPACE</div>

        <nav className="ss-app-nav">
        
{navItems.map(({ id, label, icon: Icon }) => (
  <button
    key={id}
    className={`ss-app-nav-link ${active === id ? 'is-active' : ''}`}
    onClick={() => {
      if (id === 'assistant') {
        navigate('/chat');
      } else {
        goTo(id);
      }
    }}
  >
    <Icon size={19} />
    <span>{label}</span>
    {id === 'assistant' && <span className="ss-nav-dot" />}
  </button>
))}

        </nav>

        <div className="ss-app-sidebar-bottom">
          <div className="ss-sidebar-care-note">
            <Heart size={18} />
            <p>Your health matters. One step at a time.</p>
          </div>

          <div className="ss-app-profile">
            <div className="ss-profile-avatar">
              {patientName.trim().charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="ss-profile-info">
              <b>{patientName || 'Patient'}</b>
              <span>Patient workspace</span>
            </div>
            <Link to="/" title="Return to home" className="ss-logout-icon">
              <LogOut size={17} />
            </Link>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="ss-app-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="ss-app-main">
        <header className="ss-app-topbar">
          <button
            className="ss-app-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle sidebar"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <div className="ss-app-breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={15} />
            <b>{pageTitle}</b>
          </div>

          <div className="ss-app-top-actions">
            <label className="ss-language-select">
              <Languages size={16} />
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label="Interface language"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Kannada</option>
              </select>
            </label>

            <button
              className="ss-app-bell"
              onClick={() => notify('No new notifications in this demo.')}
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>

            <button
              className="ss-top-profile"
              onClick={() => goTo('settings')}
              aria-label="Open profile settings"
            >
              <UserRound size={19} />
            </button>
          </div>
        </header>

        <div className="ss-app-content">
          {notice && (
            <div className="ss-app-notice" role="status">
              <AlertCircle size={18} />
              <span>{notice}</span>
              <button
                onClick={() => setNotice('')}
                aria-label="Dismiss notice"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <>
              <section className="ss-dashboard-welcome ss-professional-welcome">
                <div>
                  <div className="ss-overline">YOUR PERSONAL HEALTH SPACE</div>
                  <h1>Namaste, {patientName || 'friend'} <span>👋</span></h1>
                  <p>
                    Your health journey deserves care, clarity and support.
                  </p>
                  <button
                    className="ss-btn-primary"
                    onClick={() => goTo('assistant')}
                  >
                    <MessageCircle size={18} />
                    Talk to Sehat AI
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="ss-welcome-illustration">
                  <HealthIllustration />
                </div>
              </section>

              <section className="ss-dashboard-cards">
                <button className="ss-overview-card" onClick={() => goTo('records')}>
                  <span className="ss-card-icon sage"><FileText size={21} /></span>
                  <span className="ss-card-label">Medical History</span>
                  <b>04</b>
                  <span className="ss-card-foot">Sample records <ArrowUpRight size={15} /></span>
                </button>

                <button className="ss-overview-card" onClick={() => goTo('appointments')}>
                  <span className="ss-card-icon gold"><CalendarDays size={21} /></span>
                  <span className="ss-card-label">Appointment Requests</span>
                  <b>{appointmentRequests.length.toString().padStart(2, '0')}</b>
                  <span className="ss-card-foot">Demo requests <ArrowUpRight size={15} /></span>
                </button>

                <button
  className="ss-overview-card"

onClick={() => {
  alert("Medicine card clicked!");
  navigate("/medicine-reminders-preview");
}}

>
  <span className="ss-card-icon beige">
    <Pill size={21} />
  </span>

  <span className="ss-card-label">Medicine Reminders</span>

  <b>{remindersEnabled ? 'On' : 'Off'}</b>

  <span className="ss-card-foot">
    Preference only <ArrowUpRight size={15} />
  </span>
</button>

                <button className="ss-overview-card ss-overview-ai" onClick={() => goTo('assistant')}>
                  <span className="ss-card-icon light"><HeartPulse size={21} /></span>
                  <span className="ss-card-label">Health Assistant</span>
                  <b>24/7</b>
                  <span className="ss-card-foot">Demo interface <ArrowUpRight size={15} /></span>
                </button>
              </section>

              <p className="ss-demo-caption">
                Sample dashboard figures are for demonstration only. They are
                not real patient records, confirmed appointments or medication schedules.
              </p>

              <section className="ss-journey-section">
                <div className="ss-section-head">
                  <div>
                    <div className="ss-overline">ONE STEP AT A TIME</div>
                    <h2>Your healthcare journey</h2>
                  </div>
                  <span className="ss-demo-badge">Your care, organised</span>
                </div>

                <p className="ss-section-intro">
                  Find your next step without feeling overwhelmed.
                </p>

                <div className="ss-journey-list">
                  {journey.map((step, index) => (
                    <button
                      key={step}



                      
                      className="ss-journey-step"
                      onClick={() =>
                        goTo(
                          index === 0 || index === 4
                            ? index === 0 ? 'records' : 'assistant'
                            : index === 1 || index === 2
                              ? index === 1 ? 'hospitals' : 'appointments'
                              : 'medicines'
                        )
                      }
                    >
                      <span className="ss-journey-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="ss-journey-text">{step}</span>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </section>

              <section className="ss-dashboard-bottom-grid">
                <article className="ss-care-card">
                  <span className="ss-card-icon sage"><ShieldCheck size={22} /></span>
                  <h3>Your health history, in one place</h3>
                  <p>Keep important medical information easy to find when you need it.</p>
                  <button className="ss-text-link" onClick={() => goTo('records')}>
                    View medical history <ChevronRight size={16} />
                  </button>
                </article>

                <article className="ss-care-card ss-family-card">
                  <span className="ss-card-icon gold"><Users size={22} /></span>
                  <h3>Care, even from far away</h3>
                  <p>Explore a consent-based way to involve a trusted family member.</p>
                  <button className="ss-text-link" onClick={() => goTo('family')}>
                    Explore family support <ChevronRight size={16} />
                  </button>
                </article>
              </section>
            </>
          )}

          {/* SEHAT AI */}
          {active === 'assistant' && (
            <section className="ss-page-section">
              <PageHeading
                eyebrow="YOUR DIGITAL CARE COMPANION"
                title="Talk to Sehat AI"
                description="Share what's on your mind or attach a prescription to your message."
              />

              <div className="ss-ai-disclaimer">
                <ShieldCheck size={18} />
                <span>
                  Prototype only. No medical AI service is connected. Your files
                  are not interpreted, and no diagnosis is provided.
                </span>
              </div>

              <div className="ss-chat-panel ss-professional-chat">
                {messages.length === 0 ? (
                  <div className="ss-chat-welcome ss-chat-welcome-new">
                    <div className="ss-chat-illustration">
                      <HealthIllustration />
                    </div>
                    <span className="ss-ai-greeting"><Sparkles size={15} /> HERE FOR YOU</span>
                    <h3>Namaste! Let's take it one step at a time.</h3>
                    <p>
                      You can type a message or attach a prescription, medical
                      report or image below. You don't have to figure everything
                      out alone.
                    </p>
                    <div className="ss-chat-capabilities">
                      <span><FileText size={16} /> Prescription attachments</span>
                      <span><MessageCircle size={16} /> Ask a question</span>
                      <span><ShieldCheck size={16} /> Patient-first care</span>
                    </div>
                  </div>
                ) : (
                  <div className="ss-chat-messages">
                    {messages.map((message) => (
                      <div key={message.id} className={`ss-chat-message ${message.role}`}>
                        <span>{message.role === 'assistant' ? 'Sehat AI' : 'You'}</span>
                        {message.text && <p>{message.text}</p>}
                        {message.files?.map((file) => (
                          <div className="ss-chat-file-pill" key={file.name}>
                            <FileText size={16} />
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {chatFiles.length > 0 && (
                  <div className="ss-chat-attachments">
                    <div className="ss-overline">ATTACHED TO YOUR MESSAGE</div>
                    {chatFiles.map((file) => (
                      <div className="ss-chat-attachment" key={file.id}>
                        {file.preview ? (
                          <img src={file.preview} alt={`Preview of ${file.name}`} />
                        ) : (
                          <span className="ss-attachment-file-icon"><FileText size={22} /></span>
                        )}
                        <div>
                          <b>{file.name}</b>
                          <span>{(file.size / 1024).toFixed(0)} KB · Demo attachment</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeChatFile(file.id)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form className="ss-chat-input-row ss-chat-input-new" onSubmit={sendMessage}>
                  <input
                    ref={chatUploadRef}
                    hidden
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    multiple
                    onChange={(event) => {
                      addChatFiles(event.target.files);
                      event.target.value = '';
                    }}
                  />

                  <button
                    type="button"
                    className="ss-attach-btn"
                    onClick={() => chatUploadRef.current?.click()}
                    aria-label="Attach a prescription or report"
                    title="Attach a prescription or report"
                  >
                    <Paperclip size={20} />
                  </button>

                  <input
                    value={chatText}
                    onChange={(event) => setChatText(event.target.value)}
                    placeholder="Write your message to Sehat Saathi..."
                    aria-label="Your message"
                  />

                  <button
                    className="ss-send-btn"
                    type="submit"
                    aria-label="Send message"
                    disabled={!chatText.trim() && chatFiles.length === 0}
                  >
                    <Send size={18} />
                  </button>
                </form>

                <p className="ss-chat-footnote">
                  Attachments remain in this demo session only. For emergencies,
                  contact local emergency services. Do not rely on this prototype
                  for medical decisions.
                </p>
              </div>
            </section>
          )}

          {/* MEDICAL HISTORY: HARD-CODED SAMPLE RECORDS, NO UPLOAD FORM */}
          {active === 'records' && (
            <section className="ss-page-section">
              <PageHeading
                eyebrow="YOUR HEALTH, ORGANISED"
                title="Medical history"
                description="A clear timeline of past consultations, reports and prescriptions."
              />

              <div className="ss-history-hero">
                <div className="ss-history-hero-copy">
                  <span className="ss-overline">YOUR HEALTH TIMELINE</span>
                  <h2>Every detail matters.</h2>
                  <p>
                    Keep important health information together so it's easier
                    to prepare for future appointments.
                  </p>
                  <button className="ss-btn-primary" onClick={() => goTo('assistant')}>
                    <Paperclip size={17} /> Discuss a document with Sehat AI
                  </button>
                </div>
                <div className="ss-history-illustration">
                  <HealthIllustration variant="records" />
                </div>
              </div>

              <div className="ss-ai-disclaimer">
                <AlertCircle size={18} />
                <span>
                  The records below are fictional examples for the prototype.
                  They do not represent your personal medical history.
                </span>
              </div>

              <div className="ss-history-summary">
                <div>
                  <span className="ss-card-icon sage"><FileText size={21} /></span>
                  <div><b>04</b><span>Sample records</span></div>
                </div>
                <div>
                  <span className="ss-card-icon gold"><CalendarDays size={21} /></span>
                  <div><b>2026</b><span>Example timeline</span></div>
                </div>
                <div>
                  <span className="ss-card-icon beige"><ShieldCheck size={21} /></span>
                  <div><b>Private</b><span>Demo data only</span></div>
                </div>
              </div>

              <div className="ss-section-head ss-records-head">
                <div>
                  <div className="ss-overline">MEDICAL TIMELINE</div>
                  <h2>Previous health records</h2>
                </div>
                <span className="ss-demo-badge">Sample data</span>
              </div>

              <div className="ss-history-list">
                {sampleHistory.map((record) => {
                  const RecordIcon = record.icon;
                  return (
                    <article className="ss-history-card" key={record.id}>
                      <span className={`ss-history-icon ${record.color}`}>
                        <RecordIcon size={22} />
                      </span>
                      <div className="ss-history-details">
                        <div className="ss-history-title-row">
                          <h3>{record.title}</h3>
                          <span className="ss-history-status">{record.status}</span>
                        </div>
                        <p>{record.detail}</p>
                        <div className="ss-history-meta">
                          <span><CalendarDays size={14} /> {record.date}</span>
                          <span><Stethoscope size={14} /> {record.doctor}</span>
                        </div>
                      </div>
                      <span className="ss-history-category">{record.category}</span>
                    </article>
                  );
                })}
              </div>

              <div className="ss-history-action">
                <div>
                  <h3>Have a new prescription or report?</h3>
                  <p>Attach it to a message in Talk to Sehat AI.</p>
                </div>
                <button className="ss-btn-primary" onClick={() => goTo('assistant')}>
                  <Upload size={17} /> Attach a document
                </button>
              </div>
            </section>
          )}

          {/* HOSPITALS */}
          {active === 'hospitals' && (
            <section className="ss-page-section">
              <PageHeading
                eyebrow="CARE NEAR YOU"
                title="Find hospitals"
                description="Explore care options. Live hospital information is not connected."
              />

              <form className="ss-hospital-search" onSubmit={(event) => event.preventDefault()}>
                <label><MapPin size={18} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter village, town or PIN code" /></label>
                <label><Search size={18} /><input value={hospitalQuery} onChange={(event) => setHospitalQuery(event.target.value)} placeholder="Hospital, clinic or service" /></label>
                <button className="ss-btn-primary" type="submit">Search demo</button>
              </form>

              <div className="ss-ai-disclaimer">
                <AlertCircle size={18} />
                <span>These are illustrative facility types, not verified nearby hospitals. No live directory or location service is connected.</span>
              </div>

              <div className="ss-hospital-list">
                {filteredHospitals.map((hospital) => (
                  <article className="ss-hospital-card" key={hospital.name}>
                    <div className="ss-hospital-icon"><Hospital size={24} /></div>
                    <div className="ss-hospital-info">
                      <span className="ss-hospital-type">{hospital.type}</span>
                      <h3>{hospital.name}</h3>
                      <p><MapPin size={15} /> {location ? `Search area: ${location}` : hospital.address}</p>
                      <span>{hospital.services}</span>
                    </div>
                    <button
  onClick={() =>
    notify(
      'Hospital contact, directions and appointment availability require a verified directory integration.'
    )
  }
>
  View Details
</button>
                  </article>
                ))}
                {filteredHospitals.length === 0 && (
                  <EmptyState icon={Hospital} title="No matching demo facilities" text="Try another hospital or service keyword." />
                )}
              </div>
            </section>
          )}

          {/* APPOINTMENTS */}
          {active === 'appointments' && (
            <section className="ss-page-section">
              <PageHeading
                eyebrow="PLAN YOUR CARE"
                title="Appointments"
                description="Prepare a demo appointment request with your preferred date and time."
              />

              <form className="ss-form-card" onSubmit={createAppointmentRequest}>
                <div className="ss-form-card-heading">
                  <CalendarCheck size={22} />
                  <div><h3>Request an appointment</h3><p>This does not book a real doctor or reserve a time slot.</p></div>
                </div>
                <label>Preferred date<input required type="date" min={new Date().toISOString().slice(0, 10)} value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} /></label>
                <label>Preferred time<select required value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)}><option value="">Choose a time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
                <label>Reason for visit (optional)<textarea value={appointmentReason} onChange={(event) => setAppointmentReason(event.target.value)} placeholder="Briefly describe what you need help with." rows={3} /></label>
                <button className="ss-btn-primary" type="submit"><Plus size={17} /> Save demo request</button>
              </form>

              <div className="ss-section-head ss-records-head"><div><div className="ss-overline">YOUR REQUESTS</div><h2>Appointment requests</h2></div></div>

              {appointmentRequests.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No appointment requests yet" text="Your requests will appear here after you submit the form." />
              ) : (
                <div className="ss-document-list">
                  {appointmentRequests.map((request) => (
                    <article className="ss-document-row" key={request.id}>
                      <span className="ss-document-icon"><CalendarDays size={21} /></span>
                      <div className="ss-document-info"><b>{request.date} · {request.time}</b><span>{request.reason}</span><span>{request.status}</span></div>
                      <span className="ss-demo-badge">Demo</span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MEDICINE REMINDERS */}
          {active === 'medicines' && (
            <section className="ss-page-section">
              <PageHeading
                eyebrow="GENTLE DAILY SUPPORT"
                title="Medicine reminders"
                description="Reminder schedules should always come from a verified prescription or your clinician."
              />

              <div className="ss-ai-disclaimer">
                <ShieldCheck size={18} />
                <span>No medicine names, doses or schedules have been assumed. Confirm unclear instructions with your doctor or pharmacist.</span>
              </div>

              <div className="ss-reminder-panel">
                <div className="ss-reminder-title">
                  <span className="ss-card-icon beige"><Pill size={22} /></span>
                  <div><h3>Reminder notifications</h3><p>Demo preference only; no notifications are scheduled.</p></div>
                </div>
                <label className="ss-toggle-row">
                  <span>Enable reminder preference</span>
                  <input type="checkbox" checked={remindersEnabled} onChange={(event) => {
                    setRemindersEnabled(event.target.checked);
                    notify(event.target.checked ? 'Preference enabled for this session. No notifications will be sent.' : 'Reminder preference disabled.');
                  }} />
                </label>
              </div>

              <EmptyState icon={Pill} title="No medicine schedule available" text="Review your verified prescription with a healthcare professional before creating reminders." actionLabel="Go to medical history" onAction={() => goTo('records')} />
            </section>
          )}

          {/* FAMILY SUPPORT */}
          {active === 'family' && (
            <section className="ss-page-section">
              <PageHeading
                eyebrow="CARE ACROSS DISTANCES"
                title="Family support"
                description="Invite a trusted person to help with your healthcare journey, only with your permission."
              />

              <div className="ss-family-panel">
                <div className="ss-family-illustration"><Users size={34} /></div>
                <h3>You decide who can help</h3>
                <p>Family connection is not currently connected to an account service. This form previews a consent-based invitation flow; it does not send an invitation or share records.</p>
                <form onSubmit={(event) => {
                  event.preventDefault();
                  if (!familyConsent) {
                    notify('Please give consent before preparing a demo invitation.');
                    return;
                  }
                  notify(`Demo invitation prepared for ${familyEmail}. Nothing has been sent.`);
                }} className="ss-family-form">
                  <label>Trusted family member’s email<input required type="email" value={familyEmail} onChange={(event) => setFamilyEmail(event.target.value)} placeholder="family@example.com" /></label>
                  <label className="ss-consent"><input type="checkbox" checked={familyConsent} onChange={(event) => setFamilyConsent(event.target.checked)} /><span>I consent to preparing a demo invitation. I understand no data will be shared by this prototype.</span></label>
                  <button type="submit" className="ss-btn-primary"><Users size={17} /> Prepare demo invitation</button>
                </form>
                <div className="ss-privacy-note"><ShieldCheck size={18} /><span>Medical records should remain private unless the patient explicitly authorises access and appropriate permissions are implemented.</span></div>
              </div>
            </section>
          )}

          {/* SETTINGS */}
          {active === 'settings' && (
            <section className="ss-page-section">
              <PageHeading
                eyebrow="YOUR PREFERENCES"
                title="Settings"
                description="Make your Sehat Saathi experience more comfortable."
              />

              <div className="ss-settings-card">
                <div className="ss-settings-profile">
                  <div className="ss-profile-avatar large">{patientName.trim().charAt(0).toUpperCase() || 'P'}</div>
                  <div><h3>Patient profile</h3><p>Demo profile — not connected to authentication.</p></div>
                </div>
                <label>Display name<input value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="Your name" /></label>
                <label className="ss-toggle-row"><span><b>Notifications preference</b><small>Visual preference only; no notifications are sent.</small></span><input type="checkbox" checked={settings.notifications} onChange={(event) => setSettings((old) => ({ ...old, notifications: event.target.checked }))} /></label>
                <label className="ss-toggle-row"><span><b>Larger text</b><small>Improve readability across the dashboard.</small></span><input type="checkbox" checked={settings.largeText} onChange={(event) => setSettings((old) => ({ ...old, largeText: event.target.checked }))} /></label>
                <label>Preferred language<select value={language} onChange={(event) => setLanguage(event.target.value)}><option>English</option><option>Hindi</option><option>Kannada</option></select></label>
                <div className="ss-ai-disclaimer"><AlertCircle size={18} /><span>Profile settings are stored only in this component's current session and are not saved to an account.</span></div>
              </div>
            </section>
          )}

          <footer className="ss-app-footer">
            <span>© 2026 Sehat Saathi</span>
            <span>Care with compassion <Heart size={14} /></span>
            <Link to="/">Back to home</Link>
          </footer>
        </div>
      </main>
    </div>
  );
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="ss-page-heading">
      <div className="ss-overline">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, actionLabel, onAction }) {
  return (
    <div className="ss-empty-state">
      <span><Icon size={26} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
      {actionLabel && (
        <button className="ss-btn-secondary" onClick={onAction}>
          {actionLabel}<ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
