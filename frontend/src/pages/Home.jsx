import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CheckCircle2, FileText, ShieldCheck, Sparkles, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure by Design',
    description: 'Role-based access, protected routes, and secure authentication to keep medical information safe.',
  },
  {
    icon: FileText,
    title: 'Smart Report Management',
    description: 'Upload, organize, and access reports quickly across patients and staff workflows.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Manage staff accounts, responsibilities, and operations from one unified admin workspace.',
  },
];

const HIGHLIGHTS = [
  'OTP-based authentication and verification',
  'Admin, staff, and patient role separation',
  'Fast dashboard experience with modern UI',
];

export default function Home() {
  return (
    <div className="home-shell">
      <div className="home-bg-orb home-bg-orb-one" />
      <div className="home-bg-orb home-bg-orb-two" />

      <header className="home-topbar animate-fade-in">
        <div className="home-brand">
          <div className="home-brand-icon">
            <Activity size={18} />
          </div>
          <span className="home-brand-name">MediVault</span>
        </div>

        <div className="home-topbar-actions">
          <Link to="/login" className="mv-btn mv-btn-ghost mv-btn-sm">Login</Link>
          <Link to="/signup" className="mv-btn mv-btn-primary mv-btn-sm">Get Started</Link>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <p className="home-hero-kicker animate-fade-up">
            <Sparkles size={14} /> Modern Medical Record Workflow
          </p>

          <h1 className="home-hero-title animate-fade-up delay-100">
            One secure platform to manage
            <span> patients, staff, and reports</span>
          </h1>

          <p className="home-hero-sub animate-fade-up delay-150">
            MediVault helps healthcare teams streamline operations with role-based dashboards,
            secure report handling, and intuitive admin tools.
          </p>

          <div className="home-hero-actions animate-fade-up delay-200">
            <Link to="/signup" className="mv-btn mv-btn-primary mv-btn-lg">
              Create Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="mv-btn mv-btn-outline mv-btn-lg">Sign In</Link>
          </div>

          <div className="home-highlight-list animate-fade-up delay-300">
            {HIGHLIGHTS.map((item) => (
              <div key={item} className="home-highlight-item">
                <CheckCircle2 size={15} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="home-feature-grid">
          {FEATURES.map(({ icon: Icon, title, description }, idx) => (
            <article
              key={title}
              className={`home-feature-card animate-fade-up delay-${(idx + 1) * 100}`}
            >
              <div className="home-feature-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className="home-cta animate-scale-in delay-300">
          <div>
            <h2>Ready to simplify your hospital workflow?</h2>
            <p>Start with MediVault and modernize your day-to-day operations.</p>
          </div>
          <div className="home-cta-actions">
            <Link to="/signup" className="mv-btn mv-btn-primary">Create Free Account</Link>
            <Link to="/login" className="mv-btn mv-btn-ghost">I already have an account</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
