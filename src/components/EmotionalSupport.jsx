
import { Heart, MoveUpRight } from 'lucide-react';

const EmotionalSupport = () => (
  <section className="ss-mission" id="our-mission">
    <div className="ss-mission-decoration" aria-hidden="true">♡</div>

    <div className="ss-mission-content">
      <span className="ss-eyebrow">
        <Heart size={16} /> THE HEART BEHIND SEHAT SAATHI
      </span>

      <h2>
        Being far away shouldn't mean
        <em> feeling helpless.</em>
      </h2>

      <p>
        When children leave their hometowns to study or work, their parents
        may still be managing health concerns on their own. Sehat Saathi aims
        to make everyday care support and health information easier to access,
        even when families are miles apart.
      </p>

      <a href="#features" className="ss-mission-link">
        Discover our approach <MoveUpRight size={17} />
      </a>
    </div>

    <div className="ss-mission-quote">
      <span className="ss-quote-mark">“</span>
      <p>Distance may separate families. Care can still bring them closer.</p>
      <span className="ss-quote-line" />
      <small>THE SEHAT SAATHI PROMISE</small>
    </div>
  </section>
);

export default EmotionalSupport;
