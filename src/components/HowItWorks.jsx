
import { UserRound, ClipboardList, Stethoscope } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserRound,
    title: 'Create Your Care Profile',
    description:
      'Start by organizing relevant health information and medical records.',
  },
  {
    number: '02',
    icon: ClipboardList,
    title: 'Get Organized Support',
    description:
      'Access reminders, important health information and AI-assisted guidance.',
  },
  {
    number: '03',
    icon: Stethoscope,
    title: 'Take the Next Step',
    description:
      'Use the information to prepare for a conversation with a qualified healthcare professional.',
  },
];

const HowItWorks = () => (
  <section className="ss-section ss-how" id="how-it-works">
    <div className="ss-section-heading">
      <span className="ss-eyebrow">YOUR JOURNEY, SIMPLIFIED</span>
      <h2>Small steps. <em>Better organized care.</em></h2>
      <p>Getting started with your healthcare journey can feel simpler.</p>
    </div>

    <div className="ss-steps">
      {steps.map(({ number, icon: Icon, title, description }) => (
        <article className="ss-step" key={number}>
          <div className="ss-step-icon"><Icon size={27} /></div>
          <span className="ss-step-number">STEP {number}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </article>
      ))}
    </div>
  </section>
);

export default HowItWorks;