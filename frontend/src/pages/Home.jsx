import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
  Heart,
  Lock,
  Send,
  BarChart3,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Clock,
  Dot,
} from 'lucide-react';
import { submitContactMessage } from '../services/contactService';

/* ─── Data ──────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure by Design',
    description:
      'Role-based access, protected routes, and secure authentication keep every medical record safe and compliant.',
    color: '#00c2a8',
    delay: 0,
  },
  {
    icon: FileText,
    title: 'Smart Report Management',
    description:
      'Upload, organise, and retrieve reports instantly across patients and staff with lightning-fast search.',
    color: '#3b82f6',
    delay: 100,
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Manage staff accounts, roles, and responsibilities from one unified admin workspace.',
    color: '#a78bfa',
    delay: 200,
  },
  {
    icon: BarChart3,
    title: 'Insightful Analytics',
    description:
      'Track patient flow, report volumes, and operational health with real-time dashboard metrics.',
    color: '#f59e0b',
    delay: 300,
  },
];

const HIGHLIGHTS = [
  'OTP-based authentication & verification',
  'Admin, staff, and patient role separation',
  'HIPAA-aligned data handling',
  'Fast, modern dashboard experience',
];

const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '256-bit', label: 'Encryption' },
  { value: '3 Roles', label: 'Access Tiers' },
  { value: '<0.5s', label: 'Load Time' },
];

const FAQS = [
  {
    question: 'How quickly will support respond to my request?',
    answer:
      'Most requests receive a response within 24 hours. Urgent report issues are prioritized for faster handling.',
  },
  {
    question: 'Can both patients and staff submit support requests?',
    answer:
      'Yes. The support form is available for both patients and staff and routes your request based on role and issue type.',
  },
  {
    question: 'What should I include when reporting a bug?',
    answer:
      'Please include what happened, the expected result, and any relevant details such as browser/device and time of issue.',
  },
  {
    question: 'Is my support message and personal data secure?',
    answer:
      'Absolutely. Contact messages are stored securely in our protected database with strict role-based access controls.',
  },
];

const CONTACT_INITIAL_STATE = {
  name: '',
  email: '',
  role: 'Patient',
  issueType: 'Bug',
  message: '',
};

/* ─── Animated counter hook ─────────────────────────────── */
function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

/* ─── Component ─────────────────────────────────────────── */
export default function Home() {
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const featuresVisible = useInView(featuresRef);
  const statsVisible = useInView(statsRef);
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState(CONTACT_INITIAL_STATE);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setContactLoading(true);
    setContactStatus({ type: '', message: '' });

    try {
      const response = await submitContactMessage(contactForm);
      setContactStatus({
        type: 'success',
        message: response?.message || 'Support request submitted successfully.',
      });
      setContactForm(CONTACT_INITIAL_STATE);
    } catch (error) {
      setContactStatus({
        type: 'error',
        message: error.message || 'Unable to submit your request right now. Please try again.',
      });
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --bg: #f4f8ff;
          --bg2: #eaf2ff;
          --surface: rgba(255,255,255,0.84);
          --border: rgba(15,32,64,0.12);
          --teal: #00c2a8;
          --teal-dim: rgba(0,194,168,0.12);
          --blue: #3b82f6;
          --text: #0f2040;
          --muted: #5f728f;
          --font-display: 'DM Sans', 'Segoe UI', sans-serif;
          --font-body: 'DM Sans', 'Segoe UI', sans-serif;
          --radius: 16px;
          --radius-sm: 10px;
          --shadow-glow: 0 0 40px rgba(0,194,168,0.15);
        }

        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Keyframes ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-30px) scale(1.04); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes borderGlow {
          0%,100% { border-color: rgba(0,194,168,0.2); }
          50%      { border-color: rgba(0,194,168,0.6); box-shadow: 0 0 20px rgba(0,194,168,0.2); }
        }

        /* ── Utility animations ── */
        .anim-fade-up { animation: fadeUp 0.7s ease both; }
        .anim-fade-in { animation: fadeIn 0.6s ease both; }
        .anim-scale-in { animation: scaleIn 0.7s ease both; }
        .d0  { animation-delay: 0ms; }
        .d100{ animation-delay: 100ms; }
        .d200{ animation-delay: 200ms; }
        .d300{ animation-delay: 300ms; }
        .d400{ animation-delay: 400ms; }
        .d500{ animation-delay: 500ms; }
        .d600{ animation-delay: 600ms; }

        .vis-fade { opacity: 0; transition: opacity 0.6s ease, transform 0.6s ease; transform: translateY(20px); }
        .vis-fade.show { opacity: 1; transform: translateY(0); }

        /* ── Orbs ── */
        .orbs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: orbFloat 8s ease-in-out infinite;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,194,168,0.18) 0%, transparent 70%);
          top: -200px; right: -150px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%);
          bottom: 100px; left: -150px;
          animation-delay: 3s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%);
          top: 40%; left: 50%;
          animation-delay: 5s;
        }

        /* ── Dot grid ── */
        .dot-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── Layout ── */
        .mv-wrap { position: relative; z-index: 1; min-height: 100vh; }

        /* ── Navbar ── */
        .mv-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          height: 68px;
          transition: background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease;
          border-bottom: 1px solid transparent;
        }
        .mv-nav.scrolled {
          background: rgba(255,255,255,0.86);
          backdrop-filter: blur(20px);
          border-color: var(--border);
        }
        .mv-brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; color: inherit;
        }
        .mv-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--teal), #00a896);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          box-shadow: 0 0 16px rgba(0,194,168,0.4);
          position: relative;
        }
        .mv-brand-icon::after {
          content: '';
          position: absolute; inset: -3px;
          border-radius: 13px;
          border: 1px solid rgba(0,194,168,0.3);
          animation: pulse-ring 2.5s ease-out infinite;
        }
        .mv-brand-name {
          font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em;
          background: linear-gradient(90deg, var(--text) 60%, var(--teal));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mv-nav-actions { display: flex; align-items: center; gap: 10px; }

        /* ── Buttons ── */
        .mv-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-body); font-weight: 600;
          border-radius: 10px; cursor: pointer;
          text-decoration: none; transition: all 0.2s ease;
          white-space: nowrap; border: none;
        }
        .mv-btn-sm { font-size: 0.875rem; padding: 8px 18px; }
        .mv-btn-md { font-size: 0.95rem;  padding: 11px 24px; }
        .mv-btn-lg { font-size: 1rem;     padding: 14px 30px; border-radius: 12px; }

        .mv-btn-ghost {
          background: transparent; color: var(--muted);
          border: 1px solid var(--border);
        }
        .mv-btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); background: var(--surface); }

        .mv-btn-outline {
          background: transparent; color: var(--text);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .mv-btn-outline:hover { border-color: var(--teal); color: var(--teal); box-shadow: 0 0 12px rgba(0,194,168,0.15); }

        .mv-btn-primary {
          background: linear-gradient(135deg, var(--teal) 0%, #00a896 100%);
          color: #03191c;
          box-shadow: 0 4px 20px rgba(0,194,168,0.35);
        }
        .mv-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,194,168,0.45);
          filter: brightness(1.08);
        }
        .mv-btn-primary:active { transform: translateY(0); }

        /* ── Hero ── */
        .mv-hero {
          padding: 160px clamp(1.5rem, 5vw, 4rem) 100px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 0;
          max-width: 900px; margin: 0 auto;
        }
        .mv-kicker {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--teal);
          background: var(--teal-dim);
          border: 1px solid rgba(0,194,168,0.25);
          padding: 6px 14px; border-radius: 999px;
          margin-bottom: 28px;
          animation: borderGlow 4s ease-in-out infinite;
        }
        .mv-hero-title {
          font-size: clamp(2.4rem, 6vw, 4rem);
          font-weight: 700;
          line-height: 1.12;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 22px;
        }
        .mv-hero-title .accent {
          background: linear-gradient(90deg, var(--teal) 0%, #3b82f6 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .mv-hero-sub {
          font-size: clamp(1rem, 2.2vw, 1.15rem);
          color: var(--muted); line-height: 1.7;
          max-width: 580px;
          margin-bottom: 40px;
        }
        .mv-highlights {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 22px;
          margin-top: 8px;
        }
        .mv-highlight-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 0.85rem; color: var(--muted);
        }
        .mv-highlight-item svg { color: var(--teal); flex-shrink: 0; }

        /* ── Scroll hint ── */
        .mv-scroll-hint {
          margin-top: 70px; display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: var(--muted); font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase;
          animation: fadeIn 1s ease 1.2s both;
        }
        .mv-scroll-hint svg { animation: orbFloat 2s ease-in-out infinite; }

        /* ── Stats bar ── */
        .mv-stats {
          display: flex; justify-content: center; flex-wrap: wrap; gap: 0;
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 80px;
        }
        .mv-stat {
          flex: 1; min-width: 120px;
          padding: 28px 24px; text-align: center;
          border-right: 1px solid var(--border);
          transition: background 0.2s;
        }
        .mv-stat:last-child { border-right: none; }
        .mv-stat:hover { background: rgba(0,194,168,0.05); }
        .mv-stat-value {
          font-size: 1.8rem; font-weight: 700; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #fff, var(--teal));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mv-stat-label { font-size: 0.8rem; color: var(--muted); margin-top: 4px; }

        /* ── Features ── */
        .mv-section {
          padding: 0 clamp(1.5rem, 5vw, 5rem) 80px;
          max-width: 1200px; margin: 0 auto;
        }
        .mv-section-label {
          text-align: center; margin-bottom: 56px;
        }
        .mv-section-tag {
          display: inline-block; font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--teal); margin-bottom: 12px;
        }
        .mv-section-title {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 700; letter-spacing: -0.03em; color: var(--text);
          line-height: 1.2;
        }
        .mv-section-sub {
          color: var(--muted); margin-top: 10px; font-size: 0.95rem;
          max-width: 520px; margin-left: auto; margin-right: auto; line-height: 1.6;
        }

        .mv-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }
        .mv-feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
          position: relative; overflow: hidden;
          cursor: default;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .mv-feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--card-color, var(--teal)), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .mv-feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(15,32,64,0.18);
          box-shadow: 0 14px 36px rgba(15,32,64,0.14);
        }
        .mv-feature-card:hover::before { opacity: 1; }
        .mv-feature-icon {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
          transition: transform 0.3s;
        }
        .mv-feature-card:hover .mv-feature-icon { transform: scale(1.1) rotate(-3deg); }
        .mv-feature-card h3 {
          font-size: 1.05rem; font-weight: 600; margin-bottom: 8px; color: var(--text);
        }
        .mv-feature-card p {
          font-size: 0.9rem; color: var(--muted); line-height: 1.65;
        }
        .mv-feature-card .mv-card-glow {
          position: absolute; bottom: -30px; right: -30px;
          width: 120px; height: 120px; border-radius: 50%;
          filter: blur(40px); opacity: 0.12;
          transition: opacity 0.3s;
        }
        .mv-feature-card:hover .mv-card-glow { opacity: 0.25; }

        /* ── CTA section ── */
        .mv-cta-section {
          padding: 0 clamp(1.5rem, 5vw, 5rem) 100px;
        }
        .mv-cta {
          max-width: 900px; margin: 0 auto;
          background: linear-gradient(135deg, rgba(0,194,168,0.08), rgba(59,130,246,0.06));
          border: 1px solid rgba(0,194,168,0.18);
          border-radius: 24px;
          padding: clamp(40px, 6vw, 64px);
          text-align: center;
          position: relative; overflow: hidden;
          box-shadow: 0 0 80px rgba(0,194,168,0.07);
        }
        .mv-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(0,194,168,0.1), transparent 60%);
        }
        .mv-cta-inner { position: relative; }
        .mv-cta h2 {
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 700; letter-spacing: -0.03em; color: var(--text);
          margin-bottom: 12px;
        }
        .mv-cta p {
          color: var(--muted); font-size: 1rem; margin-bottom: 32px; line-height: 1.6;
        }
        .mv-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── Ticker ── */
        .mv-ticker {
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 14px 0; margin-bottom: 0;
          background: rgba(255,255,255,0.015);
        }
        .mv-ticker-track {
          display: flex; gap: 0;
          width: max-content;
          animation: ticker 30s linear infinite;
        }
        .mv-ticker-item {
          display: flex; align-items: center; gap: 8px;
          padding: 0 40px; font-size: 0.8rem;
          color: var(--muted); letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .mv-ticker-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--teal); flex-shrink: 0;
        }

        /* ── Footer ── */
        .mv-footer {
          border-top: 1px solid var(--border);
          padding: 28px clamp(1.5rem, 5vw, 5rem);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          color: var(--muted); font-size: 0.82rem;
        }
        .mv-footer-brand {
          display: flex; align-items: center; gap: 8px;
          font-weight: 600; color: var(--text);
          text-decoration: none;
        }
        .mv-footer-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: linear-gradient(135deg, var(--teal), #00a896);
          display: flex; align-items: center; justify-content: center; color: #fff;
        }
        .mv-footer-links { display: flex; gap: 20px; }
        .mv-footer-links a {
          color: var(--muted); text-decoration: none; transition: color 0.2s;
        }
        .mv-footer-links a:hover { color: var(--text); }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .mv-nav {
            height: auto;
            padding-top: 12px;
            padding-bottom: 12px;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .mv-brand {
            align-self: flex-start;
          }

          .mv-nav-actions {
            width: 100%;
            justify-content: space-between;
            gap: 8px;
          }

          .mv-nav-actions .mv-btn {
            flex: 1;
            justify-content: center;
            padding-left: 12px;
            padding-right: 12px;
            font-size: 0.8rem;
          }

          .mv-hero {
            padding-top: 150px;
            padding-bottom: 80px;
          }

          .mv-hero-title {
            font-size: clamp(2.1rem, 10vw, 3rem);
          }

          .mv-hero-sub {
            margin-bottom: 28px;
          }

          .mv-highlights {
            justify-content: flex-start;
            gap: 10px 14px;
          }

          .mv-scroll-hint {
            margin-top: 56px;
          }

          .mv-cta-btns {
            flex-direction: column;
          }

          .mv-cta-btns .mv-btn {
            width: 100%;
            justify-content: center;
          }

          .mv-footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .mv-footer-links {
            justify-content: center;
            flex-wrap: wrap;
            gap: 14px;
          }

          .mv-stat { border-right: none; border-bottom: 1px solid var(--border); }
          .mv-stat:last-child { border-bottom: none; }
        }

        @media (max-width: 420px) {
          .mv-nav-actions {
            flex-direction: column;
          }

          .mv-nav-actions .mv-btn {
            width: 100%;
          }

          .mv-cta {
            padding-left: 22px;
            padding-right: 22px;
          }

          .mv-cta p {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="dot-grid" />

      <div className="mv-wrap">
        {/* ── Navbar ── */}
        <header className={`mv-nav anim-fade-in d0 ${scrolled ? 'scrolled' : ''}`}>
          <Link to="/" className="mv-brand">
            <div className="mv-brand-icon">
              <Activity size={17} />
            </div>
            <span className="mv-brand-name">MediVault</span>
          </Link>
          <nav className="mv-nav-actions">
            <Link to="/login" className="mv-btn mv-btn-ghost mv-btn-sm">Sign In</Link>
            <Link to="/signup" className="mv-btn mv-btn-primary mv-btn-sm">
              Get Started <ArrowRight size={14} />
            </Link>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section className="mv-hero">
          <span className="mv-kicker anim-fade-up d100">
            <Sparkles size={13} /> Modern Medical Record Workflow
          </span>
          <h1 className="mv-hero-title anim-fade-up d200">
            One secure platform for<br />
            <span className="accent">patients, staff & reports</span>
          </h1>
          <p className="mv-hero-sub anim-fade-up d300">
            MediVault streamlines healthcare operations with role-based dashboards,
            secure report handling, and intuitive admin tools built for modern teams.
          </p>
          <div className="mv-highlights anim-fade-up d500">
            {HIGHLIGHTS.map((h) => (
              <div key={h} className="mv-highlight-item">
                <CheckCircle2 size={14} />
                <span>{h}</span>
              </div>
            ))}
          </div>
          <div className="mv-scroll-hint">
            <span>Explore</span>
            <ChevronDown size={16} />
          </div>
        </section>

        {/* ── Ticker ── */}
        <div className="mv-ticker">
          <div className="mv-ticker-track">
            {[...Array(2)].map((_, t) =>
              ['Secure Healthcare Platform', 'HIPAA-Aligned Data Handling', 'Role-Based Access Control',
               'OTP Verification', 'Admin Dashboard', 'Staff Management', 'Patient Records',
               'Fast & Reliable', 'Modern UI'].map((item) => (
                <div key={`${t}-${item}`} className="mv-ticker-item">
                  <span className="mv-ticker-dot" />
                  {item}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div
          ref={statsRef}
          className="mv-stats"
          style={{ marginTop: 0 }}
        >
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className="mv-stat vis-fade"
              style={{
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
              }}
            >
              <div className="mv-stat-value">{value}</div>
              <div className="mv-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Features ── */}
        <div className="mv-section" ref={featuresRef}>
          <div className="mv-section-label">
            <span className="mv-section-tag">Core Capabilities</span>
            <h2 className="mv-section-title">Everything your team needs</h2>
            <p className="mv-section-sub">
              Built for hospitals and clinics that demand reliability, security, and speed in one place.
            </p>
          </div>
          <div className="mv-feature-grid">
            {FEATURES.map(({ icon: Icon, title, description, color, delay }, i) => (
              <article
                key={title}
                className="mv-feature-card"
                style={{
                  '--card-color': color,
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
                }}
              >
                <div
                  className="mv-feature-icon"
                  style={{ background: `${color}1a`, color }}
                >
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="mv-card-glow" style={{ background: color }} />
              </article>
            ))}
          </div>
        </div>

        {/* ── Support & Help Center ── */}
        <section
          id="support-help-center"
          className="w-full py-16 sm:py-24 lg:py-32 bg-linear-to-b from-transparent to-slate-900/40"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
            {/* Heading */}
            <div className="text-center mb-10 sm:mb-14 lg:mb-18">
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-semibold tracking-widest">
                ● GET IN TOUCH
              </span>

              <h2 className="mt-5 sm:mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                We&apos;re here to{' '}
                <span className="bg-linear-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  help you
                </span>
              </h2>

              <p className="mt-3 sm:mt-4 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                Questions, feedback, or issues — our support team responds quickly.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
              {/* LEFT: Contact Info */}
              <div className="space-y-4 sm:space-y-5">
                {/* Email */}
                <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-teal-500/40 transition">
                  <p className="text-xs text-slate-500 uppercase">Email</p>
                  <p className="text-base sm:text-lg font-semibold text-white mt-2 break-all sm:break-normal">
                    support@medivault.health
                  </p>
                  <p className="text-sm text-slate-400">We reply within 24h</p>
                </div>

                {/* Phone */}
                <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-teal-500/40 transition">
                  <p className="text-xs text-slate-500 uppercase">Phone</p>
                  <p className="text-base sm:text-lg font-semibold text-white mt-2">+91 98765 43210</p>
                  <p className="text-sm text-slate-400">Mon–Fri, 9AM–6PM</p>
                </div>

                {/* Office */}
                <div className="p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-teal-500/40 transition">
                  <p className="text-xs text-slate-500 uppercase">Office</p>
                  <p className="text-base sm:text-lg font-semibold text-white mt-2">Sector 62, Noida</p>
                  <p className="text-sm text-slate-400">India</p>
                </div>

                {/* Status */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-teal-500/30 bg-teal-500/10 text-sm text-slate-300">
                  🟢 Support team online · avg response 20 min
                </div>
              </div>

              {/* RIGHT: Contact Form */}
              <div className="p-5 sm:p-6 lg:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Send us a Message</h3>
                <p className="text-slate-400 mb-5 sm:mb-6 text-sm sm:text-base">
                  Fill in details and we&apos;ll get back to you.
                </p>

                {/* STATUS MESSAGE */}
                {contactStatus.message && (
                  <div
                    className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                      contactStatus.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                        : 'bg-red-500/10 border border-red-500/30 text-red-300'
                    }`}
                  >
                    {contactStatus.message}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-5">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />

                    <input
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      placeholder="Email Address"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>

                  {/* Role + Issue */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <select
                      name="role"
                      value={contactForm.role}
                      onChange={handleContactChange}
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      <option value="Patient">Patient</option>
                      <option value="Staff">Staff</option>
                    </select>

                    <select
                      name="issueType"
                      value={contactForm.issueType}
                      onChange={handleContactChange}
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    >
                      <option value="" disabled>
                        Select issue
                      </option>
                      <option value="Bug">Bug</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Report Issue">Report Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows={4}
                    placeholder="Tell us your issue..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none"
                  />

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-3 rounded-xl font-semibold bg-linear-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="mv-cta-section">
          <div className="mv-cta anim-scale-in d300">
            <div className="mv-cta-inner">
              <span className="mv-kicker" style={{ margin: '0 auto 20px', display: 'inline-flex' }}>
                <Heart size={13} /> Get Started Today
              </span>
              <h2>Ready to simplify your hospital workflow?</h2>
              <p>
                Join healthcare teams that trust MediVault for day-to-day operations,
                secure data management, and seamless collaboration.
              </p>
              <div className="mv-cta-btns">
                <Link to="/signup" className="mv-btn mv-btn-primary mv-btn-lg">
                  Create Free Account <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="mv-btn mv-btn-outline mv-btn-lg">
                  <Lock size={15} /> Sign In to Existing Account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mv-footer">
          <Link to="/" className="mv-footer-brand">
            <div className="mv-footer-icon"><Activity size={13} /></div>
            MediVault
          </Link>
          <span>© {new Date().getFullYear()} MediVault. Built for healthcare teams.</span>
          <div className="mv-footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#support-help-center">Support</a>
          </div>
        </footer>
      </div>
    </>
  );
}

