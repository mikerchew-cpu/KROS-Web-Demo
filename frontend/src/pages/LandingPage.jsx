export default function LandingPage({ onGetStarted, theme, onToggleTheme }) {
  const features = [
    {
      icon: "✦",
      title: "AI-Powered Knowledge Engine",
      desc: "Ask operational questions in plain English or Bahasa Malaysia. Claude and DeepSeek AI instantly retrieve answers from your SKILL.md documents.",
    },
    {
      icon: "◫",
      title: "Skills Library",
      desc: "Browse, search, and manage all operational procedures, SOPs, safety protocols, and compliance documents in one place.",
    },
    {
      icon: "⟳",
      title: "Succession Planning",
      desc: "Track role coverage, identify gaps, and ensure every critical position has a ready-now or ready-in-12 successor.",
    },
    {
      icon: "⚖",
      title: "Regulatory Compliance",
      desc: "Never miss a deadline. Automated calendar for EPF, SOCSO, DOE, DOSH, JMG submissions with direct skill links.",
    },
    {
      icon: "◳",
      title: "Exit Knowledge Capture",
      desc: "AI-facilitated exit interviews that automatically capture and update SKILL.md documents before knowledge walks out.",
    },
    {
      icon: "⬡",
      title: "Real-Time Dashboard",
      desc: "At-a-glance KPIs: skills freshness, succession risk, compliance status, AI usage, and knowledge score across your operation.",
    },
  ];

  return (
    <div className="landing">
      {/* Nav bar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">KR</div>
            <span className="landing-logo-text">KROS</span>
          </div>
          <div className="landing-nav-actions">
            <button className="btn btn-ghost btn-sm" onClick={onToggleTheme}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="btn btn-primary btn-sm" onClick={onGetStarted}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">v2.0 · Claude + DeepSeek</div>
          <h1 className="landing-hero-title">
            Knowledge Retention<br />
            <span className="landing-hero-accent">&amp; Operations System</span>
          </h1>
          <p className="landing-hero-sub">
            AI-powered operational knowledge management for Malaysian mining SMEs.
            Capture, retrieve, and preserve critical procedures — so expertise never walks out the door.
          </p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              Get Started →
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Everything you need to run a smarter operation</h2>
          <p className="landing-section-sub">
            KROS combines AI chat, document management, succession planning, compliance tracking, and knowledge capture into one seamless platform.
          </p>
          <div className="landing-features">
            {features.map((f, i) => (
              <div key={i} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">How it works</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-num">1</div>
              <h3 className="landing-feature-title">Upload your Skills</h3>
              <p className="landing-feature-desc">Drop your SOPs, safety procedures, and compliance documents as Markdown files into the skills folder.</p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <div className="landing-step-num">2</div>
              <h3 className="landing-feature-title">Ask Anything</h3>
              <p className="landing-feature-desc">Staff ask operational questions in plain language. AI routes to Claude or DeepSeek and retrieves answers instantly.</p>
            </div>
            <div className="landing-step-arrow">→</div>
            <div className="landing-step">
              <div className="landing-step-num">3</div>
              <h3 className="landing-feature-title">Never Lose Knowledge</h3>
              <p className="landing-feature-desc">Exit interviews auto-capture expertise. Skills stay fresh. Succession gaps are flagged before they become crises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <h2 className="landing-cta-title">Ready to see it in action?</h2>
          <p className="landing-cta-sub">Try the demo with pre-loaded mining operation data. No setup required.</p>
          <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
            Launch Demo →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-logo">
            <div className="landing-logo-icon" style={{ width: 28, height: 28, fontSize: 12 }}>KR</div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>KROS</span>
          </div>
          <span className="landing-footer-text">
            Knowledge Retention &amp; Operations System v2.0
          </span>
          <span className="landing-footer-text">
            Powered by Anthropic Claude &amp; DeepSeek AI
          </span>
        </div>
      </footer>
    </div>
  );
}
