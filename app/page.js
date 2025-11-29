import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <i className="fa-solid fa-truck-fast"></i> FLEETGUARD
          </div>
          <div className="nav-links">
            <a href="#features">Platform</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
          </div>
          <Link href="/login" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="badge badge-blue" style={{ marginBottom: '1.5rem' }}>
              New: AI Predictive Maintenance
            </span>
            <h1>
              Intelligent Fleet Diagnostics for <span className="text-gradient">Modern Logistics</span>
            </h1>
            <p>
              Reduce downtime by 40% with our AI-powered inspection platform. Real-time health monitoring, cost prediction, and automated maintenance scheduling.
            </p>

            <div className="hero-actions">
              <Link href="/login" className="btn btn-primary">
                Start Free Inspection <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <a href="#" className="btn btn-secondary">
                <i className="fa-solid fa-play"></i> Watch Demo
              </a>
            </div>

            <div className="trust-badges">
              <span>Trusted by:</span>
              <span>
                <i className="fa-brands fa-aws"></i> AWS Logistics
              </span>
              <span>
                <i className="fa-solid fa-cube"></i> Maersk
              </span>
              <span>
                <i className="fa-solid fa-truck"></i> DHL
              </span>
            </div>
          </div>

          {/* CSS-Only Dashboard Visual */}
          <div className="hero-visual">
            <div className="float-card alert">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-warning)' }}></i>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Brake Pad Warning</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Vehicle #402 • Critical</div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dash-header">
                <div style={{ fontWeight: 700 }}>Fleet Health Overview</div>
                <div style={{ color: 'var(--color-success)', fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-circle"></i> Live
                </div>
              </div>
              <div className="dash-stat-grid">
                <div className="stat-box">
                  <div className="label">Active Vehicles</div>
                  <div className="value">1,248</div>
                  <div className="trend up">
                    <i className="fa-solid fa-arrow-trend-up"></i> +12%
                  </div>
                </div>
                <div className="stat-box">
                  <div className="label">Maintenance Cost</div>
                  <div className="value">$42k</div>
                  <div className="trend down">
                    <i className="fa-solid fa-arrow-trend-down"></i> -8%
                  </div>
                </div>
              </div>
              <div className="graph-placeholder">
                <div className="graph-line"></div>
              </div>
            </div>

            <div className="float-card success">
              <i className="fa-solid fa-check-circle" style={{ color: 'var(--color-success)' }}></i>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Service Completed</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Saved $450 on labor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container stats-container">
          <div className="stat-item">
            <h3>2.5M+</h3>
            <p>Inspections Analyzed</p>
          </div>
          <div className="stat-item">
            <h3>$12M</h3>
            <p>Client Savings</p>
          </div>
          <div className="stat-item">
            <h3>99.9%</h3>
            <p>Uptime Guarantee</p>
          </div>
          <div className="stat-item">
            <h3>450+</h3>
            <p>Enterprise Partners</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-title">
            <span className="badge badge-green" style={{ marginBottom: '1rem' }}>
              Platform Features
            </span>
            <h2>Everything you need to run a high-performance fleet</h2>
            <p>
              Our comprehensive suite of tools helps you manage maintenance, costs, and compliance from a single dashboard.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon-box">
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3>AI Diagnostic Engine</h3>
              <p>
                Our proprietary AI analyzes audio and visual data to detect mechanical issues weeks before they cause a breakdown.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-box">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
              <h3>Predictive Costing</h3>
              <p>
                Get accurate forecasts for upcoming maintenance expenses. Budget with confidence and avoid surprise repair bills.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-box">
                <i className="fa-solid fa-network-wired"></i>
              </div>
              <h3>Fleet Integration</h3>
              <p>Seamlessly connects with your existing telematics hardware and ERP systems via our robust API.</p>
            </div>
            <div className="feature-card">
              <div className="icon-box">
                <i className="fa-solid fa-file-shield"></i>
              </div>
              <h3>Compliance Automation</h3>
              <p>
                Automatically generate DOT-compliant inspection reports and maintain a digital audit trail for every vehicle.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-box">
                <i className="fa-solid fa-mobile-screen"></i>
              </div>
              <h3>Driver Mobile App</h3>
              <p>
                Empower drivers to perform standardized pre-trip inspections and report issues instantly from their smartphones.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-box">
                <i className="fa-solid fa-screwdriver-wrench"></i>
              </div>
              <h3>Vendor Network</h3>
              <p>Access our curated network of certified mechanics and get preferred pricing on parts and labor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-box">
          <h2>Ready to modernize your fleet operations?</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
            Join industry leaders who trust FleetGuard for their critical logistics infrastructure.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login" className="btn btn-primary">
              Start Free Trial
            </Link>
            <a href="#" className="btn btn-secondary">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">FLEETGUARD</div>
              <p>
                Empowering logistics companies with intelligent vehicle diagnostics and predictive maintenance solutions.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#">Features</a>
                </li>
                <li>
                  <a href="#">Integrations</a>
                </li>
                <li>
                  <a href="#">Enterprise</a>
                </li>
                <li>
                  <a href="#">Security</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Cookie Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>&copy; 2025 FleetGuard Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
