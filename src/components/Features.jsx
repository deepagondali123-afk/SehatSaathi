
import {
  Brain,
  FileText,
  BellRing,
  UsersRound,
  ArrowUpRight,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    number: '01',
    title: 'AI Health Assistant',
    description:
      'Understand common health concerns and explore sensible next steps with supportive AI guidance.',
  },
  {
    icon: FileText,
    number: '02',
    title: 'Medical Records',
    description:
      'Keep prescriptions, reports and important medical information organized in one place.',
  },
  {
    icon: BellRing,
    number: '03',
    title: 'Medicine Reminders',
    description:
      'Build helpful routines with reminders for your medication schedule.',
  },
  {
    icon: UsersRound,
    number: '04',
    title: 'Family Care Connection',
    description:
      'Make it easier for families living apart to coordinate everyday care and stay informed.',
  },
];

const Features = () => (
  <section className="ss-section ss-features" id="features">
    <div className="ss-section-heading">
      <span className="ss-eyebrow">THOUGHTFULLY DESIGNED FOR YOU</span>
      <h2>Everything you need to <em>care with confidence.</em></h2>
      <p>Simple tools that make managing healthcare feel less overwhelming.</p>
    </div>

    <div className="ss-feature-grid">
      {features.map(({ icon: Icon, number, title, description }) => (
        <article className="ss-feature-card" key={title}>
          <div className="ss-feature-top">
            <span className="ss-feature-icon"><Icon size={25} /></span>
            <span className="ss-feature-number">{number}</span>
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
          <a href="/login" className="ss-feature-link" aria-label={`Explore ${title}`}>
            Explore <ArrowUpRight size={17} />
          </a>
        </article>
      ))}
    </div>
  </section>
);

export default Features;
