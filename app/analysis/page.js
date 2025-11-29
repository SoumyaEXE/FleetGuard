'use client';

import Link from 'next/link';

import { useState } from 'react';

export default function AnalysisPage() {
  const [openSections, setOpenSections] = useState({
    engine: false,
    brakes: true, // Default open as per HTML
    electrical: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="analysis-body">
      <div className="analysis-container">
        {/* Header */}
        <header className="analysis-header">
          <div className="header-info">
            <h1>AI Diagnostic Analysis</h1>
            <div className="vehicle-card-mini">
              <span><i className="fa-solid fa-truck"></i> Logistics Unit #402</span>
              <span><i className="fa-solid fa-calendar"></i> Nov 25, 2025</span>
              <span><i className="fa-solid fa-hashtag"></i> VIN: 1HG...928</span>
            </div>
          </div>
          <div className="health-score-container">
            <div className="health-circle">
              <span>82%</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Overall Health</span>
          </div>
        </header>

        {/* AI Insights Banner */}
        <div className="ai-insight-box" style={{ marginBottom: '2rem', background: '#eef2ff', borderColor: 'var(--color-accent)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}><i className="fa-solid fa-lightbulb" style={{ color: 'var(--color-warning)' }}></i> AI Recommendations</h3>
          <p>Based on your driving patterns, bundling the <strong>brake pad replacement</strong> with your upcoming <strong>50,000 km service</strong> will save approximately <strong>15%</strong> on labor costs.</p>
        </div>

        {/* 3 Column Layout */}
        <div className="analysis-grid">
          {/* Column 1: Urgent */}
          <div className="analysis-col col-urgent">
            <div className="col-header">
              <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-warning)' }}></i>
              <h2 style={{ color: 'var(--color-warning)' }}>Immediate Attention</h2>
            </div>
            
            <div className="issue-card">
              <div className="issue-header">
                <span className="issue-title"><i className="fa-solid fa-circle-exclamation" style={{ color: 'var(--color-warning)' }}></i> Worn Brake Pads</span>
                <span className="badge-urgent">CRITICAL</span>
              </div>
              <p className="issue-desc">Front brake pads are at 15% life. Metal-on-metal contact risk high.</p>
              <div className="issue-meta">
                <span>$180 - $250</span>
                <span>Within 24h</span>
              </div>
              <button className="btn btn-primary btn-sm">Book Service</button>
            </div>

            <div className="issue-card">
              <div className="issue-header">
                <span className="issue-title"><i className="fa-solid fa-droplet" style={{ color: 'var(--color-warning)' }}></i> Oil Leak</span>
                <span className="badge-urgent">HIGH</span>
              </div>
              <p className="issue-desc">Active oil leak detected near gasket. Fluid levels dropping.</p>
              <div className="issue-meta">
                <span>$120 - $300</span>
                <span>Within 48h</span>
              </div>
              <button className="btn btn-primary btn-sm">Book Service</button>
            </div>
          </div>

          {/* Column 2: Upcoming */}
          <div className="analysis-col col-upcoming">
            <div className="col-header">
              <i className="fa-solid fa-clock" style={{ color: 'var(--color-warning)' }}></i>
              <h2>Upcoming Maintenance</h2>
            </div>

            <div className="issue-card">
              <div className="issue-header">
                <span className="issue-title"><i className="fa-solid fa-filter" style={{ color: '#bfa100' }}></i> Air Filter</span>
                <span className="badge-medium">MEDIUM</span>
              </div>
              <p className="issue-desc">Engine air intake flow reduced by 20%. Replacement recommended.</p>
              <div className="issue-meta">
                <span>$40 - $60</span>
                <span>2-4 Weeks</span>
              </div>
            </div>

            <div className="issue-card">
              <div className="issue-header">
                <span className="issue-title"><i className="fa-solid fa-rotate" style={{ color: '#bfa100' }}></i> Tyre Rotation</span>
                <span className="badge-medium">MEDIUM</span>
              </div>
              <p className="issue-desc">Uneven wear pattern detected on front left tyre.</p>
              <div className="issue-meta">
                <span>$30 - $50</span>
                <span>1 Month</span>
              </div>
            </div>
          </div>

          {/* Column 3: Good Health */}
          <div className="analysis-col col-good">
            <div className="col-header">
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-success)' }}></i>
              <h2 style={{ color: 'var(--color-success)' }}>Systems OK</h2>
            </div>

            <div className="issue-card good">
              <div className="issue-header">
                <span className="issue-title"><i className="fa-solid fa-car-battery" style={{ color: 'var(--color-success)' }}></i> Battery Health</span>
                <span className="badge-good">GOOD</span>
              </div>
              <p className="issue-desc">Battery voltage at 12.6V. Alternator charging normally.</p>
            </div>

            <div className="issue-card good">
              <div className="issue-header">
                <span className="issue-title"><i className="fa-solid fa-temperature-three-quarters" style={{ color: 'var(--color-success)' }}></i> Engine Temp</span>
                <span className="badge-good">OPTIMAL</span>
              </div>
              <p className="issue-desc">Cooling system operating efficiently at 90°C.</p>
            </div>

            <div className="issue-card good">
              <div className="issue-header">
                <span className="issue-title"><i className="fa-solid fa-gears" style={{ color: 'var(--color-success)' }}></i> Transmission</span>
                <span className="badge-good">SMOOTH</span>
              </div>
              <p className="issue-desc">No slip or rough shifting detected during analysis.</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Accordions */}
        <h2 style={{ marginBottom: '1.5rem', marginTop: '3rem', fontFamily: 'var(--font-montserrat)' }}>System Breakdown</h2>

        <div className="accordion-section">
          <div className="accordion-header" onClick={() => toggleSection('engine')}>
            <div className="acc-title">
              <i className="fa-solid fa-gears"></i> Engine & Transmission
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="health-bar-mini"><div className="bar-fill warning" style={{ width: '70%' }}></div></div>
              <i className={`fa-solid fa-chevron-down ${openSections.engine ? 'fa-rotate-180' : ''}`} style={{ transition: 'transform 0.3s' }}></i>
            </div>
          </div>
          <div className={`accordion-content ${openSections.engine ? 'open' : ''}`}>
            <ul className="check-list">
              <li className="check-item"><i className="fa-solid fa-check"></i> Transmission shifting smooth</li>
              <li className="check-item"><i className="fa-solid fa-triangle-exclamation"></i> Minor valve cover gasket seepage</li>
              <li className="check-item"><i className="fa-solid fa-check"></i> No unusual knocking sounds</li>
            </ul>
            <div className="ai-insight-box">
              <strong>AI Analysis:</strong> Audio spectrum analysis confirms normal combustion cycles, but visual inspection suggests early signs of gasket wear. Monitor oil levels weekly.
            </div>
          </div>
        </div>

        <div className="accordion-section">
          <div className="accordion-header" onClick={() => toggleSection('brakes')}>
            <div className="acc-title">
              <i className="fa-solid fa-circle-notch"></i> Brakes & Tyres
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="health-bar-mini"><div className="bar-fill danger" style={{ width: '40%' }}></div></div>
              <i className={`fa-solid fa-chevron-down ${openSections.brakes ? 'fa-rotate-180' : ''}`} style={{ transition: 'transform 0.3s' }}></i>
            </div>
          </div>
          <div className={`accordion-content ${openSections.brakes ? 'open' : ''}`}>
            <ul className="check-list">
              <li className="check-item"><i className="fa-solid fa-xmark"></i> Front brake pads &lt; 3mm</li>
              <li className="check-item"><i className="fa-solid fa-triangle-exclamation"></i> Left front tyre uneven wear</li>
              <li className="check-item"><i className="fa-solid fa-check"></i> Rear drums functional</li>
            </ul>
            <div className="ai-insight-box">
              <strong>AI Analysis:</strong> High-frequency squeal reported matches wear indicator sound profile. Immediate replacement required to prevent rotor damage.
            </div>
            <div className="file-preview-grid" style={{ marginTop: '1rem' }}>
              <div className="file-thumbnail"><img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=200" alt="Brake" /></div>
            </div>
          </div>
        </div>

        <div className="accordion-section">
          <div className="accordion-header" onClick={() => toggleSection('electrical')}>
            <div className="acc-title">
              <i className="fa-solid fa-plug"></i> Electrical System
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="health-bar-mini"><div className="bar-fill" style={{ width: '95%' }}></div></div>
              <i className={`fa-solid fa-chevron-down ${openSections.electrical ? 'fa-rotate-180' : ''}`} style={{ transition: 'transform 0.3s' }}></i>
            </div>
          </div>
          <div className={`accordion-content ${openSections.electrical ? 'open' : ''}`}>
            <ul className="check-list">
              <li className="check-item"><i className="fa-solid fa-check"></i> Battery voltage optimal (12.6V)</li>
              <li className="check-item"><i className="fa-solid fa-check"></i> Alternator charging correctly</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', marginBottom: '100px' }}>
          <Link href="/dashboard" className="btn btn-secondary">
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Cost Summary Card */}
      <div className="cost-summary-card">
        <h3 style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase' }}>Total Estimated Cost</h3>
        <div className="cost-total">$370 - $660</div>
        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>Includes parts & labor</div>
        
        <div className="cost-actions">
          <button className="btn btn-primary" style={{ width: '100%' }}>Schedule Appointment</button>
          <button className="btn btn-secondary" style={{ width: '100%', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>Share with Mechanic</button>
          <button className="btn" style={{ width: '100%', background: '#333', color: '#fff' }}>Download Report</button>
        </div>
      </div>
    </div>
  );
}
