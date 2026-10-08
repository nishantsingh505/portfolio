'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Subtle WebGL background constellation
const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false });

export default function Home() {
  // ── Observability & Interactive States ──
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('whoami');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [euTime, setEuTime] = useState({ cet: '12:00', bst: '11:00' });

  // Initialize theme from storage (default to 'dark' for the twist of darkness)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('portfolio-theme') : null;
    const initialTheme = saved || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('portfolio-theme', next);
    } catch (e) {}
  };
  const [logs, setLogs] = useState([
    { time: '16:14:02', level: 'sys', msg: 'Gradus.live streaming engine operational.' },
    { time: '16:14:03', level: 'ok', msg: 'WebSocket cluster healthy: 10,480 concurrent learners.' },
    { time: '16:14:05', level: 'info', msg: 'Shopify Storefront API: checkout sync latency < 180ms.' },
    { time: '16:14:08', level: 'ok', msg: 'Flutter & React Expo mobile clients connected.' },
    { time: '16:14:10', level: 'info', msg: 'Lighthouse PageSpeed benchmark: 98/100 verified.' }
  ]);
  const [metrics, setMetrics] = useState({
    activeUsers: 10420,
    uptime: 99.5,
    pageSpeed: 98,
    transactions: 52400
  });
  const [metricHistory, setMetricHistory] = useState(
    Array.from({ length: 30 }, (_, i) => 95 + Math.sin(i * 0.5) * 3 + Math.random() * 2)
  );

  // European Timezones Clock Loop (CET & BST)
  useEffect(() => {
    const updateTimes = () => {
      try {
        const now = new Date();
        const cet = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(now);
        const bst = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/London',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(now);
        setEuTime({ cet, bst });
      } catch (e) {
        // graceful fallback
      }
    };
    updateTimes();
    const timer = setInterval(updateTimes, 10000);
    return () => clearInterval(timer);
  }, []);

  // Window scroll listener for elevated navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Telemetry Log & Metrics Simulator Loops
  useEffect(() => {
    const logPool = [
      { level: 'ok', msg: 'Gradus live session room #402 opened with sub-50ms audio latency.' },
      { level: 'info', msg: 'Shopify Liquid theme assets served from CDN with sub-2s load time.' },
      { level: 'sys', msg: 'MongoDB Atlas aggregation pipeline optimized for 10K+ DAU.' },
      { level: 'ok', msg: 'Mobile build pipeline: React Expo & Flutter assets compiled cleanly.' },
      { level: 'info', msg: 'Wanderlust Mapbox GL geocoding query resolved in 14ms.' },
      { level: 'ok', msg: 'WebSocket health check passed: 99.5% uptime maintained.' },
      { level: 'sys', msg: 'Custom Shopify checkout flow verified: cart abandonment down 18%.' },
      { level: 'info', msg: 'RESTful API latency stable at 45ms across all micro-endpoints.' }
    ];

    const logsInterval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLogs((prevLogs) => {
        const updated = [...prevLogs, { time: timeStr, level: randomLog.level, msg: randomLog.msg }];
        if (updated.length > 8) updated.shift();
        return updated;
      });
    }, 2200);

    const metricsInterval = setInterval(() => {
      setMetrics((prev) => {
        const deltaUsers = Math.floor((Math.random() - 0.5) * 80);
        return {
          activeUsers: Math.max(9800, Math.min(12000, prev.activeUsers + deltaUsers)),
          uptime: 99.5,
          pageSpeed: 98,
          transactions: prev.transactions + (Math.random() > 0.4 ? 1 : 0)
        };
      });

      setMetricHistory((prevHistory) => {
        const nextVal = prevHistory[prevHistory.length - 1] + (Math.random() - 0.5) * 3;
        const boundedVal = Math.max(88, Math.min(100, nextVal));
        return [...prevHistory.slice(1), boundedVal];
      });
    }, 350);

    return () => {
      clearInterval(logsInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const generateSvgPath = () => {
    if (metricHistory.length === 0) return '';
    return metricHistory
      .map((val, i) => {
        const x = (i * (450 / 29)).toFixed(1);
        const y = (160 - (val - 80) * (140 / 20)).toFixed(1);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const generateSvgAreaPath = () => {
    if (metricHistory.length === 0) return '';
    const linePath = generateSvgPath();
    return `${linePath} L 450 160 L 0 160 Z`;
  };

  // ── Typing Effect ──
  const initTyping = useCallback(() => {
    const el = document.getElementById('typing-text');
    if (!el) return;
    const words = [
      'Real-Time WebSockets (10K+ Concurrent)',
      'Full-Stack Web (React & Next.js)',
      'Cross-Platform Mobile (Flutter & React Expo)',
      'Custom Shopify Liquid & Storefront APIs',
      'Scalable MVC & RESTful API Engineering',
    ];
    let wi = 0,
      ci = 0,
      deleting = false;
    function type() {
      const w = words[wi];
      el.textContent = w.substring(0, ci);
      if (!deleting) {
        ci++;
        if (ci > w.length) {
          deleting = true;
          setTimeout(type, 2000);
          return;
        }
      } else {
        ci--;
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
        }
      }
      setTimeout(type, deleting ? 30 : 65);
    }
    type();
  }, []);

  useEffect(() => {
    initTyping();
  }, [initTyping]);

  return (
    <>
      {/* Background Technical Grid & Subtle 3D Wireframe */}
      <div className="tech-grid-bg" aria-hidden="true"></div>
      <ThreeScene />

      {/* Unified Modern Floating Navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-inner">
          <div className="nav-left">
            <a href="#" className="nav-logo">
              <span className="nav-logo-badge mono">NS</span>
              <div className="nav-logo-meta">
                <span className="nav-logo-name">Nishant Singh</span>
                <span className="nav-logo-sub">Senior SWE</span>
              </div>
            </a>
            <div className="nav-status-pill mono">
              <span className="status-dot"></span>
              <span>Available (CET {euTime.cet} / IST)</span>
            </div>
          </div>

          <ul className="nav-links" id="nav-links">
            <li>
              <a href="#architecture">01. Architecture</a>
            </li>
            <li>
              <a href="#systems">02. Systems</a>
            </li>
            <li>
              <a href="#experience">03. Experience</a>
            </li>
            <li>
              <a href="#arsenal">04. Arsenal</a>
            </li>
            <li>
              <a href="#education">05. Education</a>
            </li>
          </ul>

          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle visual theme"
            >
              <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
            </button>
            <a
              href="mailto:Nishantsingh23@icloud.com"
              className="btn-sm btn-secondary-sm mono"
              title="Send email to Nishantsingh23@icloud.com"
            >
              <i className="fas fa-envelope"></i>
              <span>Email</span>
            </a>
            <a href="#contact" className="btn-sm btn-primary-sm">
              Contact
            </a>
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="mobile-menu-links">
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)}>01. Architecture</a>
              <a href="#systems" onClick={() => setMobileMenuOpen(false)}>02. Systems</a>
              <a href="#experience" onClick={() => setMobileMenuOpen(false)}>03. Experience</a>
              <a href="#arsenal" onClick={() => setMobileMenuOpen(false)}>04. Arsenal</a>
              <a href="#education" onClick={() => setMobileMenuOpen(false)}>05. Education</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>06. Initiate Contact</a>
            </div>
            <div className="mobile-menu-footer">
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="btn-mobile-contact mono">
                <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
                <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
              <a
                href="mailto:Nishantsingh23@icloud.com"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-mobile-contact mono"
              >
                <i className="fas fa-envelope"></i>
                <span>Nishantsingh23@icloud.com</span>
              </a>
              <a
                href="tel:+918710055551"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-mobile-contact mono"
              >
                <i className="fas fa-phone"></i>
                <span>+91 8710055551</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Option 3: Modern Editorial Minimalist Hero */}
      <section className="hero hero-editorial" id="hero">
        <div className="hero-content hero-editorial-content">
          
          {/* Top Status & Role Pill */}
          <div className="hero-editorial-badge">
            <span className="live-radar-ping" aria-hidden="true">
              <span className="ping-dot"></span>
              <span className="ping-ring"></span>
            </span>
            <span className="badge-role mono">SENIOR SWE @ GRADUS</span>
            <span className="badge-sep">•</span>
            <span className="badge-desc">High-Concurrency Systems &amp; Mobile</span>
            <span className="badge-sep">•</span>
            <span className="badge-tz mono">CET {euTime.cet} / IST</span>
          </div>

          {/* Main Editorial Headline */}
          <h1 className="hero-editorial-title">
            Architecting high-concurrency systems, cross-platform mobile &amp;{' '}
            <span className="editorial-gradient">scalable digital platforms.</span>
          </h1>

          {/* Editorial Sub-Narrative */}
          <p className="hero-editorial-lead">
            Full-stack systems engineer with production experience architecting real-time WebSocket platforms serving 10,000+ concurrent learners, high-performance Flutter and React Expo applications, and custom headless Shopify storefronts engineered for sub-second latency.
          </p>

          {/* Architectural Specialization Badges */}
          <div className="hero-editorial-tags">
            <span className="editorial-tag"><i className="fas fa-bolt text-cyan"></i> 10K+ WebSocket Cluster</span>
            <span className="editorial-tag"><i className="fas fa-mobile-alt text-indigo"></i> Flutter &amp; React Expo</span>
            <span className="editorial-tag"><i className="fas fa-shopping-bag text-emerald"></i> Headless Shopify Storefronts</span>
            <span className="editorial-tag"><i className="fas fa-network-wired text-amber"></i> Distributed REST &amp; MVC</span>
            <span className="editorial-tag"><i className="fas fa-tachometer-alt text-rose"></i> 98/100 PageSpeed Performance</span>
          </div>

          {/* Actions & Contact Dock */}
          <div className="hero-editorial-actions">
            <div className="editorial-cta-group">
              <a href="#systems" className="editorial-btn-primary">
                <span>Explore Systems</span>
                <i className="fas fa-arrow-right"></i>
              </a>
              <a href="#contact" className="editorial-btn-secondary">
                <i className="fas fa-paper-plane"></i>
                <span>Initiate Contact</span>
              </a>
            </div>

            <div className="editorial-dock-chips">
              <a
                href="mailto:Nishantsingh23@icloud.com"
                className="dock-chip mono"
                title="Send email to Nishantsingh23@icloud.com"
              >
                <i className="fas fa-envelope text-cyan"></i>
                <span className="dock-chip-label">Nishantsingh23@icloud.com</span>
                <i className="fas fa-arrow-up-right-from-square dock-arrow"></i>
              </a>

              <a
                href="tel:+918710055551"
                className="dock-chip mono"
                title="Call +91 8710055551"
              >
                <i className="fas fa-phone text-emerald"></i>
                <span className="dock-chip-label">+91 8710055551</span>
                <i className="fas fa-arrow-up-right-from-square dock-arrow"></i>
              </a>

              <a
                href="https://github.com/nishantsingh5"
                target="_blank"
                rel="noopener noreferrer"
                className="dock-icon-link"
                title="View GitHub Profile"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/nishantsingh5"
                target="_blank"
                rel="noopener noreferrer"
                className="dock-icon-link"
                title="View LinkedIn Profile"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Floating Glass Benchmarks Dock */}
          <div className="hero-editorial-metrics">
            <div className="metric-cell">
              <div className="metric-cell-top">
                <span className="metric-pulse-dot dot-cyan"></span>
                <span className="metric-tag mono">GRADUS.LIVE</span>
              </div>
              <div className="metric-val mono">10,000+</div>
              <div className="metric-title">Concurrent Users</div>
              <div className="metric-foot mono">WebSocket Architecture</div>
            </div>

            <div className="metric-cell">
              <div className="metric-cell-top">
                <span className="metric-pulse-dot dot-emerald"></span>
                <span className="metric-tag mono">RELIABILITY</span>
              </div>
              <div className="metric-val mono">99.5%</div>
              <div className="metric-title">WebSocket SLA</div>
              <div className="metric-foot mono">Zero Dropped Sessions</div>
            </div>

            <div className="metric-cell">
              <div className="metric-cell-top">
                <span className="metric-pulse-dot dot-indigo"></span>
                <span className="metric-tag mono">SHOPIFY API</span>
              </div>
              <div className="metric-val mono">50,000+</div>
              <div className="metric-title">Monthly E-Com Txns</div>
              <div className="metric-foot mono">Storefront &amp; Liquid</div>
            </div>

            <div className="metric-cell">
              <div className="metric-cell-top">
                <span className="metric-pulse-dot dot-amber"></span>
                <span className="metric-tag mono">LIGHTHOUSE</span>
              </div>
              <div className="metric-val mono">98 / 100</div>
              <div className="metric-title">PageSpeed Score</div>
              <div className="metric-foot mono">Sub-2s First Paint</div>
            </div>
          </div>

        </div>
      </section>


      {/* Section 01: Core Architecture Competencies (4-Quadrant Grid) */}
      <section className="section" id="architecture">
        <div className="section-header left-aligned">
          <span className="section-tag mono">01 // CORE ARCHITECTURE DOMAINS</span>
          <h2 className="section-title">
            Engineering Competencies &amp; System Disciplines
          </h2>
          <p className="section-subtitle">
            Rigorous technical execution across real-time systems, scalable APIs, cross-platform mobile frameworks, and high-performance e-commerce engines.
          </p>
        </div>

        <div className="architecture-quad-grid">
          {/* Quadrant 1 */}
          <div className="arch-card">
            <div>
              <div className="arch-card-top">
                <div className="arch-icon">
                  <i className="fas fa-network-wired"></i>
                </div>
                <span className="arch-protocol-badge mono">PROTOCOL: WSS / REALTIME</span>
              </div>
              <h3 className="arch-title">Real-Time WebSocket &amp; Streaming Architecture</h3>
              <p className="arch-desc">
                Architected live interactive audio/video classrooms and chat infrastructure supporting 10,000+ concurrent active learners with 99.5% session uptime and sub-50ms transmission latency.
              </p>
            </div>
            <div className="arch-specs mono">
              <div className="spec-row">
                <span className="spec-key">CONCURRENCY:</span>
                <span className="spec-val">10,000+ Active Nodes</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">SESSION SLA:</span>
                <span className="spec-val">99.5% Uptime</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">ENGAGEMENT IMPACT:</span>
                <span className="spec-val">+35% Platform Boost</span>
              </div>
            </div>
          </div>

          {/* Quadrant 2 */}
          <div className="arch-card">
            <div>
              <div className="arch-card-top">
                <div className="arch-icon" style={{ color: 'var(--accent-indigo)' }}>
                  <i className="fas fa-cubes"></i>
                </div>
                <span className="arch-protocol-badge mono">PATTERN: MVC / RESTful</span>
              </div>
              <h3 className="arch-title">Full-Stack Web &amp; Scalable RESTful APIs</h3>
              <p className="arch-desc">
                Engineered robust microservices and serverless architectures using Node.js, Express, MongoDB Atlas, and Next.js. Implemented centralized error handling, JWT auth, and query optimization.
              </p>
            </div>
            <div className="arch-specs mono">
              <div className="spec-row">
                <span className="spec-key">LATENCY REDUCTION:</span>
                <span className="spec-val">-40% Query Response</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">TRAFFIC SCALE:</span>
                <span className="spec-val">10K+ Daily Active Users</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">FRONTEND SPEED:</span>
                <span className="spec-val">-30% Page Load Time</span>
              </div>
            </div>
          </div>

          {/* Quadrant 3 */}
          <div className="arch-card">
            <div>
              <div className="arch-card-top">
                <div className="arch-icon" style={{ color: 'var(--accent-emerald)' }}>
                  <i className="fas fa-mobile-screen"></i>
                </div>
                <span className="arch-protocol-badge mono">RUNTIMES: FLUTTER &amp; EXPO</span>
              </div>
              <h3 className="arch-title">Cross-Platform Mobile Deployments</h3>
              <p className="arch-desc">
                Architected and deployed production mobile clients using Flutter, React Expo, and React Native. Accelerated mobile development cycles by 40% while ensuring single-codebase parity across iOS and Android.
              </p>
            </div>
            <div className="arch-specs mono">
              <div className="spec-row">
                <span className="spec-key">DEVELOPMENT TIME:</span>
                <span className="spec-val">-40% Faster Release</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">DEPLOYMENTS:</span>
                <span className="spec-val">iOS + Android Parity</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">CLIENT CODEBASE:</span>
                <span className="spec-val">Flutter &amp; React Expo</span>
              </div>
            </div>
          </div>

          {/* Quadrant 4 */}
          <div className="arch-card">
            <div>
              <div className="arch-card-top">
                <div className="arch-icon" style={{ color: 'var(--accent-amber)' }}>
                  <i className="fas fa-store"></i>
                </div>
                <span className="arch-protocol-badge mono">ECOSYSTEM: SHOPIFY LIQUID</span>
              </div>
              <h3 className="arch-title">E-Commerce Performance &amp; Custom Shopify</h3>
              <p className="arch-desc">
                Developed 12+ custom Shopify platforms using Liquid and Storefront API. Designed instant cart drawers, custom checkout flows, and sub-2s asset delivery, driving client conversions by up to 20%.
              </p>
            </div>
            <div className="arch-specs mono">
              <div className="spec-row">
                <span className="spec-key">CONVERSION RATE:</span>
                <span className="spec-val">+20% Client Lift</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">LIGHTHOUSE BENCHMARK:</span>
                <span className="spec-val">98+ PageSpeed Score</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">TXN VOLUME:</span>
                <span className="spec-val">50K+ Monthly Txns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: Production Systems & Case Studies */}
      <section className="section" id="systems">
        <div className="section-header left-aligned">
          <span className="section-tag mono">02 // PRODUCTION CASE STUDIES</span>
          <h2 className="section-title">
            Deployed Systems &amp; Technical Case Studies
          </h2>
          <p className="section-subtitle">
            Production web platforms, real-time EdTech infrastructure, and high-performance custom e-commerce applications.
          </p>
        </div>

        <div className="systems-showcase-grid">
          
          {/* System 1: Gradus.live */}
          <div className="system-spec-card">
            <div className="system-card-header mono">
              <span className="system-node-id">SYSTEM_01 // GRADUS.LIVE</span>
              <span className="system-status-pill">
                <span className="status-dot"></span> LIVE PLATFORM
              </span>
            </div>
            <div className="system-card-body">
              <h3 className="system-title">Gradus.live — EdTech &amp; Real-Time LMS</h3>
              <p className="system-summary">
                Architected and scaled a full-stack online learning platform serving 10,000+ learners. Engineered live classes with WebSocket real-time chat, video streaming, interactive quizzes, progress tracking, and automated subscription billing boosting platform revenue by 50% in 6 months.
              </p>
              <div className="system-kpi-strip mono">
                <div className="kpi-unit">
                  <span className="kpi-unit-val">10K+</span>
                  <span className="kpi-unit-lbl">Active Learners</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">99.5%</span>
                  <span className="kpi-unit-lbl">Session Uptime</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">+35%</span>
                  <span className="kpi-unit-lbl">Engagement Lift</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">+50%</span>
                  <span className="kpi-unit-lbl">Revenue Growth</span>
                </div>
              </div>
              <div className="system-tech-stack mono">
                <span className="tech-chip">React.js</span>
                <span className="tech-chip">Next.js</span>
                <span className="tech-chip">Node.js</span>
                <span className="tech-chip">WebSockets</span>
                <span className="tech-chip">Flutter</span>
                <span className="tech-chip">Stripe</span>
              </div>
              <div className="system-card-footer mono">
                <span>ROLE: Senior Software Engineer</span>
                <span>STATUS: Production</span>
              </div>
            </div>
          </div>

          {/* System 2: Wanderlust */}
          <div className="system-spec-card">
            <div className="system-card-header mono">
              <span className="system-node-id">SYSTEM_02 // WANDERLUST_AIRBNB</span>
              <span className="system-status-pill">
                <span className="status-dot"></span> ARCHITECTED
              </span>
            </div>
            <div className="system-card-body">
              <h3 className="system-title">Wanderlust — Travel &amp; Booking Platform</h3>
              <p className="system-summary">
                Architected a distributed full-stack travel accommodation platform managing 500+ listings. Designed a RESTful API architecture with comprehensive CRUD operations, reducing backend latency by 40%. Implemented MVC pattern, RBAC middleware, Mapbox GL geo-querying, and Cloudinary image pipelines.
              </p>
              <div className="system-kpi-strip mono">
                <div className="kpi-unit">
                  <span className="kpi-unit-val">500+</span>
                  <span className="kpi-unit-lbl">Listings Managed</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">-40%</span>
                  <span className="kpi-unit-lbl">Response Latency</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">100%</span>
                  <span className="kpi-unit-lbl">RBAC Security</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">CDN</span>
                  <span className="kpi-unit-lbl">Cloudinary Optimized</span>
                </div>
              </div>
              <div className="system-tech-stack mono">
                <span className="tech-chip">Node.js</span>
                <span className="tech-chip">Express.js</span>
                <span className="tech-chip">MongoDB</span>
                <span className="tech-chip">Mapbox GL</span>
                <span className="tech-chip">Cloudinary</span>
                <span className="tech-chip">MVC</span>
              </div>
              <div className="system-card-footer mono">
                <span>PATTERN: MVC + REST API</span>
                <span>STATUS: Completed</span>
              </div>
            </div>
          </div>

          {/* System 3: Shopify Enterprise Suite */}
          <div className="system-spec-card">
            <div className="system-card-header mono">
              <span className="system-node-id">SYSTEM_03 // SHOPIFY_ECOMMERCE</span>
              <span className="system-status-pill">
                <span className="status-dot"></span> 12+ STORES
              </span>
            </div>
            <div className="system-card-body">
              <h3 className="system-title">Shopify Commercial E-Commerce Suite</h3>
              <p className="system-summary">
                Engineered 12+ full-stack e-commerce stores with custom Liquid themes and Storefront API integrations for brands including Velvetimperial, Lechery, Redvanda, Mialma, Leafio, and Doritales. Achieved sub-2s load times, 98+ PageSpeed scores, and reduced cart abandonment by 18%.
              </p>
              <div className="system-kpi-strip mono">
                <div className="kpi-unit">
                  <span className="kpi-unit-val">50K+</span>
                  <span className="kpi-unit-lbl">Monthly Transactions</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">98+</span>
                  <span className="kpi-unit-lbl">PageSpeed Score</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">+20%</span>
                  <span className="kpi-unit-lbl">Conversion Rate</span>
                </div>
                <div className="kpi-unit">
                  <span className="kpi-unit-val">&lt; 1.8s</span>
                  <span className="kpi-unit-lbl">Global Load Time</span>
                </div>
              </div>
              <div className="system-tech-stack mono">
                <span className="tech-chip">Shopify Liquid</span>
                <span className="tech-chip">Storefront API</span>
                <span className="tech-chip">Tailwind CSS</span>
                <span className="tech-chip">App Ecosystem</span>
                <span className="tech-chip">Core Web Vitals</span>
              </div>
              <div className="system-card-footer mono">
                <span>SCALE: 12 Commercial Brands</span>
                <span>STATUS: Active Stores</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 03: Professional Experience Log */}
      <section className="section" id="experience">
        <div className="section-header left-aligned">
          <span className="section-tag mono">03 // PRODUCTION TRACK RECORD</span>
          <h2 className="section-title">
            Professional Experience &amp; Engineering History
          </h2>
          <p className="section-subtitle">
            Chronological log of full-stack engineering, sprint leadership, architectural deployments, and quantifiable technical outcomes.
          </p>
        </div>

        <div className="experience-log-container">
          
          {/* Role 1: Gradus */}
          <div className="experience-log-entry">
            <div className="log-meta-sidebar">
              <div className="log-company-name">Gradus</div>
              <div className="log-tenure mono">Nov 2025 — Present</div>
              <div className="log-role-badge mono">Senior Software Engineer</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>
                Production EdTech platform serving 10K+ concurrent learners with live interactive classes and LMS features.
              </div>
            </div>
            <div className="log-details-content">
              <ul className="log-bullet-list">
                <li>
                  Architected and deployed a live interactive classes feature serving <strong>10,000+ active learners</strong>, boosting platform engagement metrics by <strong>35%</strong>.
                </li>
                <li>
                  Engineered cross-platform mobile applications in <strong>Flutter and React Expo</strong>, consolidating codebase logic and reducing mobile development time by <strong>40%</strong>.
                </li>
                <li>
                  Led sprint planning cycles and collaborated across <strong>5+ cross-functional engineering teams</strong> to ship critical LMS features ahead of product schedules.
                </li>
                <li>
                  Integrated <strong>WebSocket-based real-time communication</strong> for classroom audio, video, and chat, maintaining <strong>99.5% session uptime</strong>.
                </li>
              </ul>
            </div>
          </div>

          {/* Role 2: Webquick India */}
          <div className="experience-log-entry">
            <div className="log-meta-sidebar">
              <div className="log-company-name">Webquick India Pvt Ltd</div>
              <div className="log-tenure mono">Jan 2025 — Dec 2025</div>
              <div className="log-role-badge mono">Freelance Shopify Developer</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>
                Remote e-commerce agency specializing in high-performance Shopify stores and MERN stack integrations.
              </div>
            </div>
            <div className="log-details-content">
              <ul className="log-bullet-list">
                <li>
                  Engineered <strong>12+ full-stack e-commerce applications</strong> leveraging the MERN stack alongside bespoke Shopify platform integrations.
                </li>
                <li>
                  Redesigned and optimized Shopify themes with <strong>Liquid</strong>, increasing client conversion rates by up to <strong>20%</strong>.
                </li>
                <li>
                  Leveraged the <strong>Shopify Storefront API</strong> to build scalable headless architectures handling <strong>50,000+ monthly transactions</strong>.
                </li>
                <li>
                  Achieved <strong>95+ Google Lighthouse performance scores</strong> through aggressive asset bundling, image compression, and code splitting.
                </li>
              </ul>
            </div>
          </div>

          {/* Role 3: Taiiki Media */}
          <div className="experience-log-entry">
            <div className="log-meta-sidebar">
              <div className="log-company-name">Taiiki Media Pvt Ltd</div>
              <div className="log-tenure mono">Jun 2025 — Aug 2025</div>
              <div className="log-role-badge mono">FullStack Developer</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>
                Digital engineering firm delivering scalable web platforms and high-throughput content management systems.
              </div>
            </div>
            <div className="log-details-content">
              <ul className="log-bullet-list">
                <li>
                  Developed <strong>5+ production-ready frontend architectures</strong> with React, Next.js, and Tailwind CSS, reducing initial page load times by <strong>30%</strong>.
                </li>
                <li>
                  Built high-performance RESTful APIs with <strong>Node.js, Express, and MongoDB</strong>, supporting <strong>10,000+ daily active users</strong> with sub-50ms latency.
                </li>
                <li>
                  Engineered custom administrative dashboards and role-based controls that streamlined operational content workflows by <strong>50%</strong>.
                </li>
                <li>
                  Translated complex architectural wireframes and Figma specifications into pixel-perfect, accessible web interfaces with 100% fidelity.
                </li>
              </ul>
            </div>
          </div>

          {/* Role 4: Oh! Puhleeez Agency */}
          <div className="experience-log-entry">
            <div className="log-meta-sidebar">
              <div className="log-company-name">Oh! Puhleeez Agency</div>
              <div className="log-tenure mono">Jan 2024 — Dec 2024</div>
              <div className="log-role-badge mono">Web Developer</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--t3)' }}>
                New Delhi branding and technology agency building custom client platforms and headless web apps.
              </div>
            </div>
            <div className="log-details-content">
              <ul className="log-bullet-list">
                <li>
                  Designed and launched <strong>10+ responsive brand websites</strong>, increasing client web traffic by an average of <strong>40%</strong> within 3 months of rollout.
                </li>
                <li>
                  Managed end-to-end technical lifecycles from wireframing, architecture, API integration to cloud deployment, delivering all projects on deadline.
                </li>
                <li>
                  Optimized Core Web Vitals and search crawler indices, boosting organic search visibility by <strong>60%</strong>.
                </li>
                <li>
                  Integrated modern headless CMS architectures, empowering client marketing teams to update content autonomously without developer intervention.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Section 04: Technical Arsenal & Skill Matrix */}
      <section className="section" id="arsenal">
        <div className="section-header left-aligned">
          <span className="section-tag mono">04 // TECHNICAL SPECIFICATION MATRIX</span>
          <h2 className="section-title">
            Technical Arsenal &amp; Core Tooling
          </h2>
          <p className="section-subtitle">
            Systematic inventory of languages, runtimes, database engines, mobile frameworks, and cloud deployment pipelines.
          </p>
        </div>

        <div className="arsenal-matrix-grid">
          {/* Column 1: Frontend & Mobile */}
          <div className="arsenal-column">
            <div className="column-header">
              <i className="fas fa-layer-group"></i>
              <span className="column-title">Frontend &amp; Mobile</span>
            </div>
            <div className="arsenal-item-list mono">
              <div className="arsenal-item"><span>React.js / Next.js</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>Flutter</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>React Expo / Native</span><span className="item-level">PROFICIENT</span></div>
              <div className="arsenal-item"><span>JavaScript (ES6+)</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>Tailwind CSS</span><span className="item-level">EXPERT</span></div>
              <div className="arsenal-item"><span>HTML5 &amp; CSS3</span><span className="item-level">EXPERT</span></div>
              <div className="arsenal-item"><span>Gsap.js Animations</span><span className="item-level">ADVANCED</span></div>
            </div>
          </div>

          {/* Column 2: Backend & Realtime */}
          <div className="arsenal-column">
            <div className="column-header">
              <i className="fas fa-server"></i>
              <span className="column-title">Backend &amp; Real-Time</span>
            </div>
            <div className="arsenal-item-list mono">
              <div className="arsenal-item"><span>Node.js</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>Express.js</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>WebSockets (WSS)</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>RESTful API Design</span><span className="item-level">EXPERT</span></div>
              <div className="arsenal-item"><span>MVC Architecture</span><span className="item-level">EXPERT</span></div>
              <div className="arsenal-item"><span>Python</span><span className="item-level">PROFICIENT</span></div>
              <div className="arsenal-item"><span>PHP</span><span className="item-level">PROFICIENT</span></div>
            </div>
          </div>

          {/* Column 3: E-Commerce */}
          <div className="arsenal-column">
            <div className="column-header">
              <i className="fas fa-cart-shopping"></i>
              <span className="column-title">E-Commerce &amp; Performance</span>
            </div>
            <div className="arsenal-item-list mono">
              <div className="arsenal-item"><span>Shopify Liquid</span><span className="item-level">EXPERT</span></div>
              <div className="arsenal-item"><span>Storefront API</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>Custom Themes</span><span className="item-level">EXPERT</span></div>
              <div className="arsenal-item"><span>Headless CMS</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>PageSpeed Tuning</span><span className="item-level">98+ SCORE</span></div>
              <div className="arsenal-item"><span>Checkout Optimization</span><span className="item-level">PROVEN</span></div>
              <div className="arsenal-item"><span>App Integrations</span><span className="item-level">ADVANCED</span></div>
            </div>
          </div>

          {/* Column 4: Databases & Cloud */}
          <div className="arsenal-column">
            <div className="column-header">
              <i className="fas fa-database"></i>
              <span className="column-title">Databases &amp; DevOps</span>
            </div>
            <div className="arsenal-item-list mono">
              <div className="arsenal-item"><span>MongoDB &amp; Atlas</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>MySQL</span><span className="item-level">PROFICIENT</span></div>
              <div className="arsenal-item"><span>Render Deployment</span><span className="item-level">PROFICIENT</span></div>
              <div className="arsenal-item"><span>GitLab &amp; GitHub</span><span className="item-level">EXPERT</span></div>
              <div className="arsenal-item"><span>AI Integrations</span><span className="item-level">ACTIVE</span></div>
              <div className="arsenal-item"><span>Cloudinary CDN</span><span className="item-level">ADVANCED</span></div>
              <div className="arsenal-item"><span>Mapbox GL</span><span className="item-level">PROFICIENT</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 05: Academic Foundation & Certifications */}
      <section className="section" id="education">
        <div className="section-header left-aligned">
          <span className="section-tag mono">05 // ACADEMIC CREDENTIALS</span>
          <h2 className="section-title">
            Education &amp; Professional Certifications
          </h2>
          <p className="section-subtitle">
            Formal foundations in Computer Science, software engineering degrees, and specialized full-stack development certifications.
          </p>
        </div>

        <div className="credentials-grid">
          <div className="credential-card">
            <div className="credential-icon-box">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="credential-body">
              <div className="credential-degree">Master of Computer Applications (MCA)</div>
              <div className="credential-institution">Chandigarh University</div>
              <div className="credential-period mono">JULY 2026 — JULY 2028 (ENROLLED)</div>
            </div>
          </div>

          <div className="credential-card">
            <div className="credential-icon-box">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="credential-body">
              <div className="credential-degree">Bachelor of Computer Applications (BCA)</div>
              <div className="credential-institution">IGNOU, New Delhi</div>
              <div className="credential-period mono">JULY 2020 — DEC 2023</div>
            </div>
          </div>

          <div className="credential-card">
            <div className="credential-icon-box">
              <i className="fas fa-laptop-code"></i>
            </div>
            <div className="credential-body">
              <div className="credential-degree">Bachelor of Science in Computer Science (B.Sc CS)</div>
              <div className="credential-institution">Kurukshetra University (KUK)</div>
              <div className="credential-period mono">JULY 2020 — DEC 2023</div>
            </div>
          </div>

          <div className="credential-card">
            <div className="credential-icon-box">
              <i className="fas fa-certificate"></i>
            </div>
            <div className="credential-body">
              <div className="credential-degree">MERN Stack Development Certification</div>
              <div className="credential-institution">Apna College (apnacollege.in)</div>
              <div className="credential-period mono">OCT 2023 — MARCH 2024</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 06: Engineering Consultation & Contact */}
      <section className="section" id="contact">
        <div className="section-header left-aligned">
          <span className="section-tag mono">06 // DIRECT CONTACT HANDSHAKE</span>
          <h2 className="section-title">
            Initiate Technical Engagement
          </h2>
          <p className="section-subtitle">
            Available for Senior Full-Stack Engineering roles, Cross-Platform Mobile Deployments, and Custom High-Converting Shopify Contracts. Full European timezone overlap (CET / BST).
          </p>
        </div>

        <div className="contact-container">
          {/* Left: Direct Channel Buttons */}
          <div className="contact-meta-pane">
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '0.75rem' }}>
                Direct Engineering Line
              </h3>
              <p style={{ color: 'var(--t2)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                Whether you need a high-scale real-time platform architected, a cross-platform mobile deployment delivered, or high-performance Shopify e-commerce built, connect directly below.
              </p>
            </div>

            <div className="contact-channels">
              <a 
                href="mailto:Nishantsingh23@icloud.com"
                className="contact-row-btn"
                title="Send an email to Nishantsingh23@icloud.com"
              >
                <div className="channel-left">
                  <div className="channel-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="channel-info">
                    <span className="channel-label mono">DIRECT EMAIL</span>
                    <span className="channel-val mono">Nishantsingh23@icloud.com</span>
                  </div>
                </div>
                <div className="action-pill mono">
                  <i className="fas fa-arrow-up-right-from-square"></i>
                  <span>Send</span>
                </div>
              </a>

              <a 
                href="tel:+918710055551"
                className="contact-row-btn"
                title="Call or WhatsApp +91 8710055551"
              >
                <div className="channel-left">
                  <div className="channel-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="channel-info">
                    <span className="channel-label mono">PHONE &amp; WHATSAPP</span>
                    <span className="channel-val mono">+91 8710055551</span>
                  </div>
                </div>
                <div className="action-pill mono">
                  <i className="fas fa-arrow-up-right-from-square"></i>
                  <span>Call</span>
                </div>
              </a>

              <a
                href="https://github.com/nishantsingh5"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row-btn"
                title="Open GitHub Profile"
              >
                <div className="channel-left">
                  <div className="channel-icon">
                    <i className="fab fa-github"></i>
                  </div>
                  <div className="channel-info">
                    <span className="channel-label mono">GITHUB PROFILE</span>
                    <span className="channel-val mono">github.com/nishantsingh5</span>
                  </div>
                </div>
                <div className="action-pill mono">
                  <i className="fas fa-arrow-up-right-from-square"></i>
                  <span>Open</span>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/in/nishantsingh5"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-row-btn"
                title="Open LinkedIn Profile"
              >
                <div className="channel-left">
                  <div className="channel-icon">
                    <i className="fab fa-linkedin-in"></i>
                  </div>
                  <div className="channel-info">
                    <span className="channel-label mono">LINKEDIN NETWORK</span>
                    <span className="channel-val mono">linkedin.com/in/nishantsingh5</span>
                  </div>
                </div>
                <div className="action-pill mono">
                  <i className="fas fa-arrow-up-right-from-square"></i>
                  <span>Open</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right: Technical Inquiry Form */}
          <form
            className="contact-form-box"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you! Inquiry received. Nishant will respond within 24 hours.');
              e.target.reset();
            }}
          >
            <div className="form-field">
              <label htmlFor="name" className="mono">CLIENT NAME &amp; ORGANIZATION</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Liam Berg — Zurich Tech"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email" className="mono">WORK EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="liam@company.eu"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="scope" className="mono">ENGINEERING SCOPE</label>
              <input
                type="text"
                id="scope"
                name="scope"
                placeholder="e.g. Next.js App, Flutter Mobile, or Shopify E-Commerce"
              />
            </div>
            <div className="form-field">
              <label htmlFor="message" className="mono">SYSTEM REQUIREMENTS &amp; TIMELINE</label>
              <textarea
                id="message"
                name="message"
                placeholder="Describe your tech stack, concurrency goals, or project timeline..."
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-submit mono">
              SUBMIT ARCHITECTURE INQUIRY →
            </button>
          </form>
        </div>
      </section>

      {/* Technical Footer */}
      <footer className="tech-footer">
        <div className="footer-inner">
          <div className="mono">
            © 2026 NISHANT SINGH. ENGINEERED WITH NEXT.JS TURBOPACK &amp; TYPESCRIPT.
          </div>
          <div className="footer-links-group mono">
            <a href="https://github.com/nishantsingh5" target="_blank" rel="noopener noreferrer">GITHUB</a>
            <a href="https://www.linkedin.com/in/nishantsingh5" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
            <a href="mailto:Nishantsingh23@icloud.com">EMAIL</a>
            <a href="#hero">TOP ↑</a>
          </div>
        </div>
      </footer>
    </>
  );
}
