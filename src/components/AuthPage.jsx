import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../lib/authService';
/* ------------------------------------------------------------------ */
/*  Sehat Saathi: self-contained login / signup / forgot-password UI  */
/*  Frontend only. No authentication is connected.                    */
/* ------------------------------------------------------------------ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
.ss-auth {
  --beige:#C9AD91; --cream:#F5F0E7; --ivory:#FFFEFA; --forest:#073B32; --sage:#A6B8A4;
  --gold:#EFC477; --text:#18332E; --muted:#6E756D; --danger:#8A2D1F;
  --serif:'Playfair Display',Georgia,'Times New Roman',serif;
  --sans:'DM Sans',Inter,system-ui,-apple-system,'Segoe UI',sans-serif;
  position:fixed; inset:0; z-index:10; overflow-x:hidden; overflow-y:auto;
  background:var(--beige); color:var(--text); font-family:var(--sans);
  text-align:left; line-height:1.5; padding:clamp(12px,3vw,40px);
}
.ss-auth, .ss-auth *, .ss-auth *::before, .ss-auth *::after { box-sizing:border-box; }
.ss-auth button, .ss-auth input { font:inherit; }
.ss-auth :focus-visible { outline:3px solid var(--gold); outline-offset:2px; }

.ss-shell { max-width:1180px; margin:0 auto; background:var(--cream); border-radius:22px; overflow:hidden;
  display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);
  grid-template-areas:"top card" "bottom card"; grid-template-rows:auto 1fr; }
.ss-top, .ss-bottom { padding-left:clamp(24px,4vw,56px); padding-right:clamp(24px,4vw,56px); position:relative; }
.ss-top { grid-area:top; padding-top:clamp(28px,4vw,48px); display:flex; flex-direction:column; gap:14px; overflow:hidden; }
.ss-bottom { grid-area:bottom; padding-top:16px; padding-bottom:clamp(28px,4vw,48px); display:flex; flex-direction:column; gap:20px; }
.ss-swirl { position:absolute; right:-150px; top:-100px; width:420px; height:420px; border:34px solid rgba(201,173,145,.3); border-radius:50%; pointer-events:none; }
.ss-top > :not(.ss-swirl) { position:relative; }
.ss-brand { display:flex; align-items:center; gap:10px; font-family:var(--serif); font-style:italic; font-weight:600; font-size:1.9rem; color:var(--forest); margin:0; }
.ss-top h2 { font-family:var(--serif); font-weight:700; font-size:clamp(1.9rem,3.4vw,2.8rem); line-height:1.15; margin:8px 0 0; color:var(--forest); max-width:14em; }
.ss-lede { margin:0; font-size:1.05rem; max-width:32em; }
.ss-tagline { margin:0; font-family:var(--serif); font-style:italic; font-size:1.1rem; color:var(--forest); }

.ss-art { width:100%; max-width:520px; height:auto; display:block; border-radius:18px; }
.ss-points { list-style:none; margin:0; padding:0; display:grid; gap:12px; }
.ss-points li { display:flex; align-items:center; gap:12px; font-weight:500; }
.ss-ficon { width:34px; height:34px; border-radius:50%; background:var(--gold); color:var(--forest); display:grid; place-items:center; flex:none; }

.ss-card-wrap { grid-area:card; background:var(--ivory); display:grid; place-items:center; padding:clamp(20px,4vw,56px); }
.ss-card { width:100%; max-width:440px; }
.ss-tabs { display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:4px; background:var(--cream); border-radius:14px; margin-bottom:24px; }
.ss-tab { min-height:44px; border:0; border-radius:10px; background:transparent; color:var(--muted); font-weight:600; cursor:pointer; }
.ss-tab[aria-selected='true'] { background:var(--forest); color:var(--ivory); }
.ss-card h1 { font-family:var(--serif); font-size:2rem; line-height:1.15; margin:0 0 8px; color:var(--forest); }
.ss-sub { margin:0 0 22px; color:var(--muted); }

.ss-btn { width:100%; min-height:52px; padding:0 20px; border-radius:12px; border:1.5px solid transparent; display:inline-flex; align-items:center; justify-content:center; gap:12px; font-weight:600; cursor:pointer; transition:background .15s; }
.ss-btn:disabled { opacity:.7; cursor:not-allowed; }
.ss-btn--google { background:#fff; color:var(--forest); border-color:var(--forest); }
.ss-btn--google:hover:not(:disabled) { background:var(--cream); }
.ss-btn--primary { background:var(--forest); color:var(--ivory); margin-top:6px; }
.ss-btn--primary:hover:not(:disabled) { background:#0a4d41; }
.ss-divider { display:flex; align-items:center; gap:12px; margin:20px 0; color:var(--muted); font-size:.9rem; }
.ss-divider::before, .ss-divider::after { content:''; flex:1; height:1px; background:#e4dccd; }

.ss-field { margin-bottom:16px; }
.ss-field label { display:block; font-weight:500; margin-bottom:6px; font-size:.95rem; }
.ss-row { display:flex; justify-content:space-between; align-items:baseline; gap:12px; }
.ss-input { position:relative; }
.ss-input input { width:100%; min-height:50px; padding:0 14px 0 44px; border-radius:10px; border:1.5px solid #d9d2c4; background:#fff; color:var(--text); }
.ss-input input.has-toggle { padding-right:50px; }
.ss-input input:focus { border-color:var(--forest); }
.ss-input input[aria-invalid='true'] { border-color:var(--danger); }
.ss-lead { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--muted); display:flex; pointer-events:none; }
.ss-toggle { position:absolute; right:4px; top:5px; width:40px; height:40px; border:0; background:transparent; color:var(--muted); border-radius:8px; cursor:pointer; display:grid; place-items:center; }
.ss-toggle:hover { color:var(--forest); }
.ss-hint { color:var(--muted); font-size:.85rem; margin:6px 0 0; }
.ss-err { color:var(--danger); font-size:.88rem; margin:6px 0 0; }
.ss-link { background:none; border:0; padding:0; color:var(--forest); font-weight:600; text-decoration:underline; text-underline-offset:3px; cursor:pointer; font-size:inherit; }
.ss-foot { text-align:center; margin:20px 0 0; color:var(--muted); }
.ss-privacy { text-align:center; margin:12px 0 0; font-size:.85rem; color:var(--muted); }
.ss-alert { padding:12px 14px; border-radius:10px; font-size:.92rem; line-height:1.45; margin:0 0 12px; }
.ss-alert--error { background:#fbeae6; color:var(--danger); }
.ss-alert--info { background:#f3ecd9; color:var(--text); }

.ss-spin { width:18px; height:18px; border:2.5px solid rgba(255,254,250,.4); border-top-color:var(--ivory); border-radius:50%; animation:ss-spin .8s linear infinite; }
.ss-spin--dark { border-color:rgba(7,59,50,.2); border-top-color:var(--forest); }
@keyframes ss-spin { to { transform:rotate(360deg); } }
@media (prefers-reduced-motion:reduce) { .ss-spin { animation-duration:2s; } .ss-btn { transition:none; } }

@media (max-width:860px) {
  .ss-shell { grid-template-columns:1fr; grid-template-areas:"top" "card" "bottom"; grid-template-rows:auto; }
  .ss-swirl { display:none; }
  .ss-top { padding-bottom:24px; }
  .ss-card-wrap { padding:28px 20px; }
  .ss-art { max-width:none; }
}
`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ICON = {
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeOff: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 3l18 18',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  hospital: 'M4 21V7l8-4 8 4v14M10 21v-5h4v5M12 8v4M10 10h4',
  pill: 'M10.5 20.5a5 5 0 0 1-7-7l9-9a5 5 0 0 1 7 7zM8.5 8.5l7 7',
};

const FEATURES = [
  { text: 'Organized medical history', icon: ICON.folder },
  { text: 'Doctor and hospital coordination', icon: ICON.hospital },
  { text: 'Prescription and recovery tracking', icon: ICON.pill },
];

const COPY = {
  login: ['Welcome to Sehat Saathi', 'Sign in to continue your care journey.', 'Sign In'],
  register: ['Create your account', 'Start organizing your care in a few minutes.', 'Create account'],
  forgot: ['Reset your password', "Enter your email and we'll send you a reset link.", 'Send reset link'],
};


const NOT_CONNECTED = {
  login: 'Sign in failed. Please check your Supabase configuration.',
  register: 'Account creation failed. Please check your Supabase configuration.',
  forgot: 'Password reset failed. Please check your Supabase configuration.',
  google: 'Google sign-in failed. Please check your Supabase configuration.',
};


const Svg = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const LogoMark = () => (
  <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="#073B32" />
    <path d="M20 29s-8-4.9-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.1-8 11-8 11z" fill="#EFC477" />
  </svg>
);

// Original illustration: an adult steadying an older parent, a heart above them.
const Illustration = () => (
  <svg className="ss-art" viewBox="0 0 520 300" role="img" aria-label="An adult supporting an older family member, with a heart above them">
    <rect width="520" height="300" rx="18" fill="#A6B8A4" opacity=".45" />
    <circle cx="395" cy="90" r="120" fill="#FFFEFA" opacity=".7" />
    <circle cx="110" cy="250" r="90" fill="#C9AD91" opacity=".35" />
    <path d="M260 92s-30-18-30-40a17 17 0 0 1 30-11 17 17 0 0 1 30 11c0 22-30 40-30 40z" fill="#EFC477" />
    <path d="M150 272v-62a54 54 0 0 1 108 0v62z" fill="#C9AD91" />
    <circle cx="204" cy="150" r="27" fill="#FFFEFA" stroke="#073B32" strokeWidth="3" />
    <path d="M330 272v-86a62 62 0 0 1 124 0v86z" fill="#073B32" />
    <circle cx="392" cy="116" r="31" fill="#FFFEFA" stroke="#073B32" strokeWidth="3" />
    <path d="M338 190q-50-6-96 22" fill="none" stroke="#073B32" strokeWidth="16" strokeLinecap="round" />
    <path d="M40 272c20-40 34-70 30-110M70 200c-24-6-36-22-38-40 22 0 36 14 38 40zM70 180c22-8 32-24 32-42-22 2-32 18-32 42z" fill="none" stroke="#073B32" strokeWidth="3" strokeLinecap="round" opacity=".55" />
    <path d="M0 272h520" stroke="#073B32" strokeWidth="3" opacity=".25" />
  </svg>
);

function Field({ id, label, icon, error, hint, aside, children }) {
  return (
    <div className="ss-field">
      <div className="ss-row">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <div className="ss-input">
        <span className="ss-lead"><Svg d={icon} /></span>
        {children}
      </div>
      {hint && !error && <p className="ss-hint">{hint}</p>}
      {error && <p className="ss-err" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, invalid }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input
        id={id}
        className="has-toggle"
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-err` : undefined}
      />
      <button type="button" className="ss-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
        <Svg d={show ? ICON.eyeOff : ICON.eye} size={20} />
      </button>
    </>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // login | register | forgot
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(null); // 'email' | 'google'
  const lock = useRef(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const switchMode = (next) => { setMode(next); setErrors({}); setMsg(null); };
  const [title, subtitle, cta] = COPY[mode];
  const a11y = (key) => ({ 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `ss-${key}-err` : undefined });

  function validate() {
    const er = {};
    if (mode === 'register' && form.name.trim().length < 2) er.name = 'Enter your full name.';
    if (!form.email.trim()) er.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(form.email.trim())) er.email = 'Enter a valid email address, like name@example.com.';
    if (mode !== 'forgot') {
      if (!form.password) er.password = 'Enter your password.';
      else if (mode === 'register' && form.password.length < 8) er.password = 'Use at least 8 characters.';
    }
    if (mode === 'register' && form.confirm !== form.password) er.confirm = 'The passwords do not match.';
    setErrors(er);
    return Object.keys(er).length === 0;
  }

  // Shows a short loading state, then an honest "not connected" message.
  // Nothing is sent anywhere and no one is ever signed in.
  function attempt(kind, text) {
    if (lock.current) return; // blocks duplicate submissions
    lock.current = true;
    setBusy(kind);
    setMsg(null);
    setTimeout(() => {
      setMsg({ type: 'info', text });
      setBusy(null);
      lock.current = false;
    }, 700);
  }

  
async function onSubmit(e) {
  e.preventDefault();

  if (lock.current || !validate()) return;

  lock.current = true;
  setBusy('email');
  setMsg(null);
  setErrors({});

  try {
    let result;

    if (mode === 'login') {
      result = await authService.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
    } else if (mode === 'register') {
      result = await authService.signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } else {
      result = await authService.resetPassword({
        email: form.email.trim(),
      });
    }

    if (result.error) {
      setMsg({ type: 'error', text: result.error.message });
    } else if (mode === 'register') {
      setMsg({
        type: 'info',
        text: result.data?.session
          ? 'Account created successfully!'
          : 'Account created. Check your email to confirm your account before signing in.',
      });
    } else if (mode === 'forgot') {
      setMsg({
        type: 'info',
        text: 'If an account exists for this email, a password reset link will be sent.',
      });
    }  else {
  setMsg({ type: 'info', text: 'Signed in successfully!' });
  navigate('/dashboard');
}
  } catch (error) {
    setMsg({
      type: 'error',
      text: error.message || 'Something went wrong. Please try again.',
    });
  } finally {
    setBusy(null);
    lock.current = false;
  }
}


  return (
    <div className="ss-auth">
      <style>{STYLES}</style>
      <div className="ss-shell">
        <div className="ss-top">
          <span className="ss-swirl" aria-hidden="true" />
          <p className="ss-brand"><LogoMark />Sehat Saathi</p>
          <h2>Your health deserves a caring companion.</h2>
          <p className="ss-lede">Organize your medical history, coordinate with healthcare professionals, and stay on track with your care.</p>
          <p className="ss-tagline">Your health journey, supported at every step.</p>
        </div>

        <main className="ss-card-wrap">
          <section className="ss-card" aria-labelledby="ss-title">
            {mode !== 'forgot' && (
              <div className="ss-tabs" role="tablist" aria-label="Sign in or create an account">
                <button type="button" role="tab" className="ss-tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>Sign in</button>
                <button type="button" role="tab" className="ss-tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')}>Create account</button>
              </div>
            )}
            <h1 id="ss-title">{title}</h1>
            <p className="ss-sub">{subtitle}</p>

            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  className="ss-btn ss-btn--google"
                  onClick={async () => {
                  setMsg(null);
                  setBusy('google');

                 const { data, error } = await authService.signInWithGoogle();

if (error) {
  setMsg({ type: 'error', text: error.message });
  setBusy(null);
} else if (data?.url) {
  // Google OAuth redirects the browser to Google.
  // Dashboard navigation happens after the OAuth callback succeeds.
} else {
  setBusy(null);
}
               }}
               disabled={!!busy}
               >
                  {busy === 'google' ? <span className="ss-spin ss-spin--dark" aria-hidden="true" /> : <GoogleLogo />}
                  {busy === 'google' ? 'Checking…' : 'Continue with Google'}
                </button>
                <div className="ss-divider"><span>or continue with email</span></div>
              </>
            )}

            <form onSubmit={onSubmit} noValidate>
              {mode === 'register' && (
                <Field id="ss-name" label="Full name" icon={ICON.user} error={errors.name}>
                  <input id="ss-name" autoComplete="name" value={form.name} onChange={set('name')} {...a11y('name')} />
                </Field>
              )}
              <Field id="ss-email" label="Email address" icon={ICON.mail} error={errors.email}>
                <input id="ss-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} {...a11y('email')} />
              </Field>
              {mode !== 'forgot' && (
                <Field
                  id="ss-password"
                  label="Password"
                  icon={ICON.lock}
                  error={errors.password}
                  hint={mode === 'register' ? 'Use at least 8 characters.' : undefined}
                  aside={mode === 'login' && <button type="button" className="ss-link" onClick={() => switchMode('forgot')}>Forgot password?</button>}
                >
                  <PasswordInput id="ss-password" value={form.password} onChange={set('password')} invalid={!!errors.password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                </Field>
              )}
              {mode === 'register' && (
                <Field id="ss-confirm" label="Confirm password" icon={ICON.lock} error={errors.confirm}>
                  <PasswordInput id="ss-confirm" value={form.confirm} onChange={set('confirm')} invalid={!!errors.confirm} autoComplete="new-password" />
                </Field>
              )}

              {msg && <p className={`ss-alert ss-alert--${msg.type}`} role="status">{msg.text}</p>}

              <button type="submit" className="ss-btn ss-btn--primary" disabled={!!busy}>
                {busy === 'email' && <span className="ss-spin" aria-hidden="true" />}
                {busy === 'email' ? 'Please wait…' : cta}
              </button>
            </form>

            <p className="ss-foot">
              {mode === 'login' && <>New to Sehat Saathi? <button type="button" className="ss-link" onClick={() => switchMode('register')}>Create an account.</button></>}
              {mode === 'register' && <>Already have an account? <button type="button" className="ss-link" onClick={() => switchMode('login')}>Sign in.</button></>}
              {mode === 'forgot' && <button type="button" className="ss-link" onClick={() => switchMode('login')}>Back to sign in</button>}
            </p>
            <p className="ss-privacy">Your health information deserves care and privacy.</p>
          </section>
        </main>

        <div className="ss-bottom">
          <Illustration />
          <ul className="ss-points">
            {FEATURES.map((f) => (
              <li key={f.text}><span className="ss-ficon"><Svg d={f.icon} /></span>{f.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}