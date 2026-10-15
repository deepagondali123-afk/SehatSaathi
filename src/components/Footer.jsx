
import { Heart } from 'lucide-react';

const Footer = () => (
  <footer className="ss-footer">
    <div className="ss-footer-main">
      <div className="ss-footer-brand">
        <a href="#home" className="ss-brand">
          <span className="ss-brand-icon"><Heart size={21} fill="currentColor" /></span>
          <span>Sehat <b>Saathi</b></span>
        </a>
        <p>
          Thoughtful technology for a more organized, connected family
          healthcare journey.
        </p>
      </div>

      <div className="ss-footer-column">
        <h4>Explore</h4>
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#our-mission">Our Mission</a>
      </div>

      <div className="ss-footer-column">
        <h4>Get Started</h4>
        <a href="/login">Login</a>
        <a href="/login">Create an Account</a>
      </div>
    </div>

    <div className="ss-footer-disclaimer">
      Sehat Saathi provides supportive health information and does not replace
      professional medical advice, diagnosis or treatment.
    </div>

    <div className="ss-footer-bottom">
      <span>© {new Date().getFullYear()} Sehat Saathi</span>
      <span>Made with care, for families.</span>
    </div>
  </footer>
);

export default Footer;
