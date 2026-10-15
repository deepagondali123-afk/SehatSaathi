
import { ArrowRight, HeartHandshake } from 'lucide-react';

const FinalCTA = () => (
  <section className="ss-final-cta">
    <div className="ss-cta-icon"><HeartHandshake size={29} /></div>
    <span className="ss-cta-eyebrow">CARE HAS NO DISTANCE</span>
    <h2>Be there for their health, <em>even from miles away.</em></h2>
    <p>Start building a more organized and connected care journey for your family.</p>
    <a href="/login" className="ss-cta-button">
      Get Started <ArrowRight size={18} />
    </a>
  </section>
);

export default FinalCTA;
