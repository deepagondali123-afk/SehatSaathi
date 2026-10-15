
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  CalendarCheck,
  HeartHandshake,
} from 'lucide-react';
import heroImage from '../assets/hero.png';

const Hero = () => {
  return (
    <section className="ss-hero" id="home">
      <div className="ss-hero-container">
        <div className="ss-hero-grid">
          <div className="ss-hero-content">
            <div className="ss-eyebrow">
              <HeartHandshake size={17} />
              YOUR FAMILY'S HEALTHCARE COMPANION
            </div>

            <h1 className="ss-hero-title">
              Care that stays close,
              <span> even when you're far away.</span>
            </h1>

            <p className="ss-hero-description">
              From understanding health concerns to organizing medical
              records and managing medicines, Sehat Saathi helps families
              take the next step with greater confidence.
            </p>

            <div className="ss-hero-actions">
              <a href="/login" className="ss-button-primary">
                Start Your Care Journey <ArrowRight size={18} />
              </a>
              <a href="#how-it-works" className="ss-button-secondary">
                Discover How It Works
              </a>
            </div>

            <div className="ss-hero-note">
              <ShieldCheck size={19} />
              Your family's wellbeing matters, every step of the way.
            </div>
          </div>

          <div className="ss-hero-visual">
            <div className="ss-hero-image-frame">
              <img
                src={heroImage}
                alt="A family caregiver supporting a loved one"
                className="ss-hero-image"
              />
            </div>

            <div className="ss-floating-card">
              <div className="ss-floating-heading">
                <span className="ss-floating-icon">
                  <HeartHandshake size={20} />
                </span>
                <span>
                  <strong>Your care, in one place</strong>
                  <small>A little more peace of mind</small>
                </span>
              </div>

              <div className="ss-care-row">
                <FileText size={18} />
                <span>Medical records</span>
                <b>Organized</b>
              </div>

              <div className="ss-care-row">
                <CalendarCheck size={18} />
                <span>Medicine reminders</span>
                <b>Stay on track</b>
              </div>
            </div>

            <span className="ss-hero-sparkle" aria-hidden="true">✳</span>
          </div>
        </div>

        <div className="ss-hero-bottom">
          <span>COMPASSION FIRST</span>
          <i />
          <span>YOUR CARE, CONNECTED</span>
          <i />
          <span>ONE STEP AT A TIME</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
