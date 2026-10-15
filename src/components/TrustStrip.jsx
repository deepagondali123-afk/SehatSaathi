
import { HeartHandshake, FileHeart, ShieldCheck } from 'lucide-react';

const items = [
  { icon: HeartHandshake, text: 'Care That Connects Families' },
  { icon: FileHeart, text: 'Health Information in One Place' },
  { icon: ShieldCheck, text: 'Support at Every Step' },
];

const TrustStrip = () => (
  <section className="ss-trust-strip">
    {items.map(({ icon: Icon, text }) => (
      <div className="ss-trust-item" key={text}>
        <Icon size={22} />
        <span>{text}</span>
      </div>
    ))}
  </section>
);

export default TrustStrip;
