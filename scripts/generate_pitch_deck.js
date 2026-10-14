import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const presentationDir = path.join(rootDir, 'presentation');

if (!fs.existsSync(presentationDir)) {
  fs.mkdirSync(presentationDir, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EXPAT — Investor & Grant Pitch Deck 2026</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    :root {
      --bg-dark: #080c16;
      --bg-card: rgba(18, 26, 44, 0.88);
      --bg-card-hover: rgba(26, 38, 64, 0.95);
      --border-subtle: rgba(255, 255, 255, 0.09);
      --border-accent: rgba(0, 210, 255, 0.35);
      --primary-cyan: #00d2ff;
      --primary-purple: #9739c8;
      --nordic-lime: #a4cb33;
      --nordic-emerald: #10b981;
      --nordic-amber: #f59e0b;
      --nordic-rose: #f43f5e;
      --text-white: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background-color: #03060a;
      color: var(--text-white);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }

    /* Print / PDF Specifics: Exact A4 Landscape (297mm x 210mm) */
    @page {
      size: 297mm 210mm;
      margin: 0;
    }

    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .interactive-bar {
        display: none !important;
      }
      .slide {
        page-break-after: always !important;
        page-break-inside: avoid !important;
        box-shadow: none !important;
        margin: 0 !important;
        width: 297mm !important;
        height: 210mm !important;
        max-width: 297mm !important;
        max-height: 210mm !important;
      }
    }

    /* Presentation Slide Container */
    .slide {
      width: 297mm;
      height: 210mm;
      max-width: 297mm;
      max-height: 210mm;
      background: radial-gradient(circle at 85% 15%, rgba(151, 57, 200, 0.12) 0%, transparent 45%),
                  radial-gradient(circle at 15% 85%, rgba(0, 210, 255, 0.08) 0%, transparent 50%),
                  linear-gradient(135deg, #070b14 0%, #0d1424 55%, #080d18 100%);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      margin-bottom: 24px;
      padding: 26px 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }

    /* Slide Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 10px;
    }

    .slide-title-wrap {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .slide-kicker {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.8px;
      color: var(--primary-cyan);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .slide-kicker .dot {
      width: 6px;
      height: 6px;
      background-color: var(--nordic-lime);
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 8px var(--nordic-lime);
    }

    .slide-title {
      font-size: 23px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .slide-subtitle {
      font-size: 12.5px;
      color: var(--text-muted);
      font-weight: 400;
    }

    .slide-meta-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.6px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-muted);
    }

    .badge-live {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.4);
      color: #34d399;
    }

    .badge-grant {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.4);
      color: #fbbf24;
    }

    .badge-future {
      background: rgba(151, 57, 200, 0.2);
      border-color: rgba(151, 57, 200, 0.5);
      color: #d8b4fe;
    }

    .slide-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      color: var(--text-dim);
      font-weight: 600;
    }

    /* Slide Content & Grids */
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 12px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    /* Cards */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 14px 16px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 6px;
    }

    .card-accent-top {
      border-top: 3px solid var(--primary-cyan);
    }
    .card-accent-purple {
      border-top: 3px solid var(--primary-purple);
    }
    .card-accent-lime {
      border-top: 3px solid var(--nordic-lime);
    }
    .card-accent-amber {
      border-top: 3px solid var(--nordic-amber);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }

    .card-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }

    .card-desc {
      font-size: 11px;
      line-height: 1.45;
      color: var(--text-muted);
    }

    .bullet-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 4px;
    }

    .bullet-list li {
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.45;
      position: relative;
      padding-left: 14px;
      display: block;
    }

    .bullet-list li::before {
      content: "▸";
      position: absolute;
      left: 0;
      top: 0;
      color: var(--primary-cyan);
      font-size: 12px;
      line-height: 1.45;
    }

    .bullet-list.lime li::before {
      color: var(--nordic-lime);
    }

    .bullet-list.purple li::before {
      color: var(--primary-purple);
    }

    .bullet-list.amber li::before {
      color: var(--nordic-amber);
    }

    /* Metric & KPI Highlights */
    .metric-box {
      background: rgba(0, 210, 255, 0.05);
      border: 1px solid rgba(0, 210, 255, 0.2);
      border-radius: 10px;
      padding: 10px 14px;
      text-align: center;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: var(--primary-cyan);
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .metric-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      margin-top: 4px;
      font-weight: 600;
    }

    /* Slide Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 8px;
      margin-top: 10px;
      font-size: 10px;
      color: var(--text-dim);
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
      color: #fff;
      font-size: 11.5px;
      letter-spacing: 0.5px;
    }

    .logo-icon {
      width: 16px;
      height: 16px;
      background: linear-gradient(135deg, #622c90, #9739c8);
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: #fff;
      font-weight: 900;
    }

    /* Interactive Floating Bar */
    .interactive-bar {
      position: fixed;
      bottom: 16px;
      z-index: 1000;
      background: rgba(13, 20, 36, 0.94);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 210, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border-radius: 30px;
      padding: 8px 18px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn {
      background: linear-gradient(135deg, #00d2ff, #0099ff);
      color: #04101e;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(0, 210, 255, 0.4);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* Custom Tables */
    .deck-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-top: 4px;
    }

    .deck-table th {
      background: rgba(255, 255, 255, 0.04);
      color: var(--primary-cyan);
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      border-bottom: 1px solid var(--border-subtle);
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }

    .deck-table td {
      padding: 7px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
    }

    .deck-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .tag-cyan { background: rgba(0, 210, 255, 0.15); color: #38bdf8; }
    .tag-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .tag-purple { background: rgba(151, 57, 200, 0.2); color: #c084fc; }
    .tag-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

    /* Timeline Stepper */
    .roadmap-timeline {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      position: relative;
      margin-top: 6px;
    }

    .timeline-step {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 13px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
    }

    .timeline-step.active {
      border-color: rgba(0, 210, 255, 0.4);
      background: rgba(0, 210, 255, 0.04);
    }

    .step-quarter {
      font-size: 10px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: var(--primary-cyan);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <!-- Floating Navigation / PDF Export Bar -->
  <div class="interactive-bar">
    <div class="logo-badge">
      <span class="logo-icon">E</span> EXPAT PITCH DECK
    </div>
    <span style="font-size: 11px; color: #94a3b8;">12 Slides • Investment & Grant Memorandum</span>
    <button class="btn" onclick="window.print()">
      📄 Download PDF / Print
    </button>
    <button class="btn btn-secondary" onclick="toggleFullscreen()">
      ⛶ Fullscreen Mode
    </button>
  </div>

  <!-- SLIDE 1: Cover & Executive Summary -->
  <div class="slide" id="slide-1">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> FINLAND FIRST • GLOBALLY SCALABLE CIVIC TECH INFRASTRUCTURE</div>
        <div class="slide-title" style="font-size: 32px; margin-top: 3px;">EXPAT PLATFORM</div>
        <div class="slide-subtitle" style="font-size: 14.5px; color: #cbd5e1;">Solving Finland's National Talent Crisis First — Engineered as a Scalable High-Export European Blueprint</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-grant">Finland First Strategy</span>
        <span class="badge badge-live">Live MVP</span>
        <span class="slide-number">01 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-4" style="margin-bottom: 6px;">
        <div class="metric-box">
          <div class="metric-value">20,000+</div>
          <div class="metric-label">Annual ICT & Tech Specialist Deficit in Finland</div>
        </div>
        <div class="metric-box" style="background: rgba(151, 57, 200, 0.08); border-color: rgba(151, 57, 200, 0.3);">
          <div class="metric-value" style="color: #c084fc;">€3.2B</div>
          <div class="metric-label">Unrealized Annual GDP Due to Domestic Labor Shortages</div>
        </div>
        <div class="metric-box" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
          <div class="metric-value" style="color: #34d399;">14 Days</div>
          <div class="metric-label">Settling & Onboarding Time in Finland (vs 6 Mo Baseline)</div>
        </div>
        <div class="metric-box" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.3);">
          <div class="metric-value" style="color: #fbbf24;">€25k – €35k</div>
          <div class="metric-label">Annual Finnish Tax Revenue per Retained Specialist</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card card-accent-top">
          <div class="card-header">
            <div class="card-title">🎯 Strategic Thesis: Finland First as the Launchpad, Scalable Everywhere</div>
            <span class="tag tag-cyan">Finland First</span>
          </div>
          <p class="card-desc">
            Finland is our primary focus and testing ground. Finland’s demographic survival and tech leadership depend on retaining international specialists. Once perfected across Finnish municipalities, <b>Expat becomes a prime Finnish digital export</b> ready to deploy across Europe.
          </p>
          <ul class="bullet-list" style="margin-top: 6px;">
            <li><b>1. Domestic Priority:</b> Eradicating Finnish red tape (DVV, Vero, Kela), cutting expat churn, and fueling Finnish tech leaders.</li>
            <li><b>2. Municipal Empowerment:</b> Delivering data-driven integration funnels for Helsinki, Espoo, Tampere, Turku, and Oulu.</li>
            <li><b>3. Global Scalability:</b> Modular architecture built on EU standards, enabling rapid expansion to Sweden, Germany, and beyond.</li>
          </ul>
        </div>

        <div class="card card-accent-lime">
          <div class="card-header">
            <div class="card-title">💡 Operational Readiness in Finland</div>
            <span class="tag tag-green">Production MVP</span>
          </div>
          <p class="card-desc">
            Expat is not a hypothetical pitch — it is a <b>live production ecosystem</b> tailored to the Finnish public framework with 11 operational modules and 5-language localization.
          </p>
          <div class="grid-2" style="margin-top: 6px; gap: 8px;">
            <div style="background: rgba(255,255,255,0.03); padding: 7px 10px; border-radius: 6px;">
              <div style="color: var(--nordic-lime); font-size: 10.5px; font-weight: 700;">6 FINNISH HUBS LIVE</div>
              <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">Helsinki, Espoo, Tampere, Vantaa, Turku, Oulu</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 7px 10px; border-radius: 6px;">
              <div style="color: var(--primary-cyan); font-size: 10.5px; font-weight: 700;">B2G SECURITY CONTOUR</div>
              <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">2FA Guard (TOTP), RBAC, GDPR-compliant, Audit Logs</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 7px 10px; border-radius: 6px;">
              <div style="color: #c084fc; font-size: 10.5px; font-weight: 700;">DOMESTIC & GLOBAL REACH</div>
              <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">English, Finnish (Suomi), Swedish, Ukrainian, Russian</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 7px 10px; border-radius: 6px;">
              <div style="color: var(--nordic-amber); font-size: 10.5px; font-weight: 700;">PUBLIC GRANT ALIGNMENT</div>
              <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 2px;">Business Finland Tempo / R&D, EU Horizon Europe</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT FINLAND</div>
        <span>• Founders: Stan Efimov, Vitaly Brazhnikov, CEO Jens Brännback</span>
      </div>
      <div>Confidential • Prepared for VCs, Angel Syndicates & Public Grant Committees</div>
    </div>
  </div>

  <!-- SLIDE 2: Problem & Market Pain -->
  <div class="slide" id="slide-2">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> FINLAND'S CRITICAL TALENT BATTLEFIELD</div>
        <div class="slide-title">The National Imperative: Finland's Demographic & Churn Crisis</div>
        <div class="slide-subtitle">Why Finland cannot afford to lose 38% of relocated specialists — and how Expat defends the Finnish economy</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-grant">Finland First Priority</span>
        <span class="slide-number">02 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-3">
        <!-- Card 1 -->
        <div class="card card-accent-amber">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-amber);">⚠️</span>
              1. Talent Dilemma in Finland
            </div>
            <span class="tag tag-amber">Talent Pain</span>
          </div>
          <p class="card-desc">
            Moving to Finland comes with severe bureaucratic friction and cultural stress across disjointed public institutions:
          </p>
          <ul class="bullet-list amber">
            <li><b>Fragmented Authorities:</b> Navigating DVV, Vero, Kela, Migri, Finnish banks, and clinics with zero centralized guidance.</li>
            <li><b>Social & Language Isolation:</b> 64% of foreign specialists report acute difficulty forming local networks and making friends.</li>
            <li><b>Family Relocation Barriers:</b> Enrolling children into English or bilingual daycare and school systems is complex and opaque.</li>
            <li><b>Labor Market Mismatch:</b> Difficulty adapting resumes to Scandinavian cultural standards and unwritten hiring codes.</li>
          </ul>
        </div>

        <!-- Card 2 -->
        <div class="card card-accent-top">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-cyan);">🏛️</span>
              2. Municipal Blindspot in Kunnat
            </div>
            <span class="tag tag-cyan">City Dilemma</span>
          </div>
          <p class="card-desc">
            Finnish cities spend millions on "Talent Boost" attraction campaigns but lack digital tools to retain newcomers:
          </p>
          <ul class="bullet-list">
            <li><b>Massive Churn (38%):</b> Over 1 in 3 high-skilled expats leave Finland within 36 months, migrating to Central Europe.</li>
            <li><b>Data Blindspots:</b> City councils have no real-time telemetry on settling satisfaction or municipal friction points.</li>
            <li><b>Overwhelmed Helpdesks:</b> International House municipal advisors spend 80% of their day answering repetitive FAQs.</li>
            <li><b>Civic Disconnection:</b> International residents remain completely isolated from city budgeting and civic policy.</li>
          </ul>
        </div>

        <!-- Card 3 -->
        <div class="card card-accent-purple">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-purple);">🏢</span>
              3. Finnish Employer Crisis
            </div>
            <span class="tag tag-purple">Employer Dilemma</span>
          </div>
          <p class="card-desc">
            Finnish tech companies and industrial champions face stalled revenue growth due to prolonged talent deficits:
          </p>
          <ul class="bullet-list purple">
            <li><b>Extended Time-to-Hire:</b> Senior software engineering roles take an average of 4.5 months to fill.</li>
            <li><b>Relocation Drop-Offs:</b> Up to 25% of international candidates reject offers due to family relocation hesitation.</li>
            <li><b>Skyrocketing CAC:</b> International recruitment costs reach €8,000–€15,000 per specialist with agency fees.</li>
            <li><b>Probation Period Failure:</b> Elevated risk of employee churn due to unaddressed domestic and municipal problems.</li>
          </ul>
        </div>
      </div>

      <!-- Bottom Insight Bar -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">🇫🇮</span>
          <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.4;">
            <b>The National Imperative:</b> Finland is facing the fastest-aging workforce in the Nordics. International specialists are Finland's single most critical economic growth lever. <b>Expat ensures they stay, integrate, and pay taxes in Finland.</b>
          </div>
        </div>
        <span class="tag tag-green" style="font-size: 10.5px; padding: 5px 10px;">Exceptional ROI for Finland</span>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Finnish Talent Mobility & Integration Dynamics Research 2025–2026</span>
      </div>
      <div>Confidential • Section: Market Problem Analysis</div>
    </div>
  </div>

  <!-- SLIDE 3: The Solution & Architectural Pillars -->
  <div class="slide" id="slide-3">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> NATIVE FINNISH CORE • PAN-EUROPEAN BLUEPRINT</div>
        <div class="slide-title">Platform Architecture: 4 Pillars Tailored for Finland & Built to Scale</div>
        <div class="slide-subtitle">Rooted in Finnish municipal law (Kuntalaki) and public registers — architected for effortless EU export</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-live">Core Architecture</span>
        <span class="slide-number">03 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-4">
        <!-- Pillar 1 -->
        <div class="card card-accent-top">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-cyan);">🧭</span>
              1. Civic Onboarding
            </div>
            <span class="tag tag-cyan">City & Law</span>
          </div>
          <p class="card-desc">Step-by-step settling guide aligned with official institutions:</p>
          <ul class="bullet-list">
            <li>Tailored questionnaires for destination cities.</li>
            <li>Dynamic checklists (DVV, Vero, Kela, banks, transit).</li>
            <li>4 phases: Pre-arrival to long-term integration.</li>
            <li>Direct municipal ticketing (Service Requests).</li>
          </ul>
        </div>

        <!-- Pillar 2 -->
        <div class="card card-accent-lime">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-lime);">💼</span>
              2. Career & Matching
            </div>
            <span class="tag tag-green">Jobs & Talent</span>
          </div>
          <p class="card-desc">Direct talent employment without language barriers:</p>
          <ul class="bullet-list lime">
            <li>Verified directory of expat-friendly employers.</li>
            <li>Filtering by tech stack, English culture, and relocation.</li>
            <li>Cultural STAR Resume Builder calibrated for Nordics.</li>
            <li>Direct job applications and verified salary transparency.</li>
          </ul>
        </div>

        <!-- Pillar 3 -->
        <div class="card card-accent-purple">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-purple);">🤝</span>
              3. Community & Civic
            </div>
            <span class="tag tag-purple">People & Voice</span>
          </div>
          <p class="card-desc">Direct democracy and deep social integration:</p>
          <ul class="bullet-list purple">
            <li>Participatory budgeting with virtual voting tokens.</li>
            <li>Community events calendar and language cafes.</li>
            <li>Mutual aid notice boards and 1-on-1 mentor networks.</li>
            <li>Community polls (Polls) and gamified rewards (Shop).</li>
          </ul>
        </div>

        <!-- Pillar 4 -->
        <div class="card card-accent-amber">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-amber);">📊</span>
              4. B2G Intelligence
            </div>
            <span class="tag tag-amber">City Analytics</span>
          </div>
          <p class="card-desc">Data-driven executive dashboard for municipalities:</p>
          <ul class="bullet-list amber">
            <li>End-to-end talent integration funnel metrics.</li>
            <li>Talent Radar: in-demand skills and languages.</li>
            <li>Real-time sentiment insights on municipal services.</li>
            <li>One-click CSV & PDF export for city councils.</li>
          </ul>
        </div>
      </div>

      <!-- Architectural Advantage Row -->
      <div class="grid-3" style="margin-top: 4px;">
        <div style="background: rgba(18, 26, 44, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px;">
          <div style="color: var(--nordic-lime); font-size: 11px; font-weight: 700;">🇫🇮 Finland As The Launchpad</div>
          <div style="color: var(--text-muted); font-size: 10.5px; margin-top: 2px;">High-trust public infrastructure and advanced municipal APIs make Finland the ideal testing ground before global cloning.</div>
        </div>
        <div style="background: rgba(18, 26, 44, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px;">
          <div style="color: var(--primary-cyan); font-size: 11px; font-weight: 700;">🔄 Cross-Module Synergy</div>
          <div style="color: var(--text-muted); font-size: 10.5px; margin-top: 2px;">Onboarding progression enriches applicant profiles and yields real-time, anonymized data for city planners.</div>
        </div>
        <div style="background: rgba(18, 26, 44, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px;">
          <div style="color: #c084fc; font-size: 11px; font-weight: 700;">🌐 Global Export Ready</div>
          <div style="color: var(--text-muted); font-size: 10.5px; margin-top: 2px;">Underlying data models abstract country specifics, allowing modular deployment into any EU jurisdiction.</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Unified Platform Architecture & Operating Model</span>
      </div>
      <div>Confidential • Section: Platform Overview</div>
    </div>
  </div>

  <!-- SLIDE 4: Live Modules — Career & Talent Matching -->
  <div class="slide" id="slide-4">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> OPERATIONAL PLATFORM MODULES (LIVE)</div>
        <div class="slide-title">Module 1: Career, Companies & Cultural STAR Resume Builder</div>
        <div class="slide-subtitle">Connecting international candidates directly with Finland's open and welcoming labor market</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-live">Production Module</span>
        <span class="slide-number">04 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <!-- Companies Directory -->
        <div class="card card-accent-top">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-cyan);">🏢</span>
              Company Directory & Jobs (/companies)
            </div>
            <span class="tag tag-cyan">Live in App</span>
          </div>
          <p class="card-desc">
            A curated directory of Finnish employers actively hiring international talent without mandatory Finnish language requirements:
          </p>
          <ul class="bullet-list">
            <li><b>Intelligent Filtering:</b> Filter by tech stack, industry (IT, CleanTech, Gaming, BioTech, Engineering), and city.</li>
            <li><b>Expat-Friendly Indicator:</b> Verified tags for visa sponsorship, relocation allowances, team language, and benefits.</li>
            <li><b>Detailed Company Profile (/companies/:id):</b> Office culture, open vacancies, team rosters, and verified expat reviews.</li>
            <li><b>Admin Verification Engine:</b> Robust review pipeline for vetting new corporate registrations and syncing vacancies.</li>
          </ul>
          <div style="margin-top: 6px; padding: 7px 12px; background: rgba(0,210,255,0.06); border-radius: 6px; font-size: 10.5px; color: #bae6fd;">
            💡 <b>Impact:</b> Candidates only apply to verified expat-friendly employers, eliminating wasted application cycles.
          </div>
        </div>

        <!-- STAR Resume Builder -->
        <div class="card card-accent-lime">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-lime);">📝</span>
              Nordic STAR Resume Builder (/profile/resume-builder)
            </div>
            <span class="tag tag-green">Proprietary Tool</span>
          </div>
          <p class="card-desc">
            A specialized resume builder that calibrates foreign work experience to meet strict Scandinavian recruitment standards:
          </p>
          <ul class="bullet-list lime">
            <li><b>STAR Methodology:</b> Step-by-step structured input using <i>Situation ➔ Task ➔ Action ➔ Result</i> with measurable metrics.</li>
            <li><b>Nordic Cultural Calibration:</b> Reflecting key Scandinavian soft skills, meeting tolerance, remote working style, and concise haiku pitches.</li>
            <li><b>Instant Profile Sync & PDF Export:</b> Real-time generation of recruiter-ready CVs synced with the user's platform profile.</li>
            <li><b>Multilingual Power Prompts:</b> Built-in action verb starters in English and Finnish.</li>
          </ul>
          <div style="margin-top: 6px; padding: 7px 12px; background: rgba(16,185,129,0.06); border-radius: 6px; font-size: 10.5px; color: #a7f3d0;">
            📈 <b>Conversion:</b> Generates a 3.2x higher interview conversion rate compared to unstructured standard CVs.
          </div>
        </div>
      </div>

      <!-- Feature Grid Details -->
      <div class="grid-3">
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px;">
          <div style="font-weight: 700; color: #fff; font-size: 11.5px;">🔍 Full-Text Search</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">Instant search across tech stacks, domain skills, and office locations.</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px;">
          <div style="font-weight: 700; color: #fff; font-size: 11.5px;">⭐ Bookmarks & Pipeline</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">Personal employer shortlists, application tracking, and review logs.</div>
        </div>
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px;">
          <div style="font-weight: 700; color: #fff; font-size: 11.5px;">🛡️ Anti-Scam Protection</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">Strict verification ensuring all employers hold valid Finnish business IDs (Y-tunnus).</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Product Modules: Careers & STAR Resume Builder</span>
      </div>
      <div>Confidential • Section: Live Modules</div>
    </div>
  </div>

  <!-- SLIDE 5: Live Modules — Municipal Onboarding & Service Requests -->
  <div class="slide" id="slide-5">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> OPERATIONAL PLATFORM MODULES (LIVE)</div>
        <div class="slide-title">Module 2: Municipal Onboarding & Civic Service Requests</div>
        <div class="slide-subtitle">A digital integration gateway for Finland's 6 largest metropolitan hubs</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-live">Municipal Tech</span>
        <span class="slide-number">05 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <!-- Smart Onboarding Wizard -->
        <div class="card card-accent-top">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-cyan);">🧭</span>
              Onboarding Wizard & Checklist (/onboarding)
            </div>
            <span class="tag tag-cyan">6 Finnish Metros</span>
          </div>
          <p class="card-desc">
            Automated relocation roadmaps tailored by family status, profession, and chosen destination municipality:
          </p>
          <ul class="bullet-list">
            <li><b>Full Metro Coverage:</b> Tailored checklists for <i>Helsinki, Espoo, Tampere, Vantaa, Turku, and Oulu</i> with local office links.</li>
            <li><b>4 Structured Integration Phases:</b>
              <span style="display: block; margin-top: 2px; font-size: 10.5px; color: #94a3b8;">
                1) <b>Pre-arrival</b> (Migri, lease search, apostilles) ➔ 2) <b>First Days</b> (DVV registration, personal identity code, banking) ➔ 3) <b>First Month</b> (Vero tax card, Kela, public transit) ➔ 4) <b>Long-term</b> (language, schools).
              </span>
            </li>
            <li><b>Dynamic Progress Tracking:</b> Completed task tally, statutory deadline alerts, and verified links to official portals (Suomi.fi, IHH, Vero.fi).</li>
          </ul>
        </div>

        <!-- Municipal Service Requests -->
        <div class="card card-accent-amber">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-amber);">🎫</span>
              Civic Service Requests & Helpdesk (/service-requests)
            </div>
            <span class="tag tag-amber">Civic Helpdesk</span>
          </div>
          <p class="card-desc">
            A direct, authenticated channel for submitting inquiries to municipal departments without phone queues:
          </p>
          <ul class="bullet-list amber">
            <li><b>Key Municipal Categories:</b>
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 3px;">
                <span class="tag tag-cyan">Daycare & Schools</span>
                <span class="tag tag-purple">Housing & Permits</span>
                <span class="tag tag-green">Integration & Social Aid</span>
              </div>
            </li>
            <li><b>Transparent Ticket Lifecycle:</b> Real-time status progression: <i>New ➔ Under Review ➔ Action Required ➔ Resolved</i>.</li>
            <li><b>Decreasing Municipal Workload:</b> Standardized ticket forms eliminate 70% of clarifying back-and-forth emails.</li>
            <li><b>Friction Point Heatmaps:</b> City councils immediately identify service areas with high citizen friction.</li>
          </ul>
        </div>
      </div>

      <!-- Strategic Positioning vs Physical International House (IHH) -->
      <div style="background: rgba(0, 210, 255, 0.04); border: 1px solid rgba(0, 210, 255, 0.25); border-radius: 8px; padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
        <div style="font-size: 10px; line-height: 1.45; color: #cbd5e1;">
          <b style="color: var(--primary-cyan); text-transform: uppercase; letter-spacing: 0.5px;">⚡ Advantage over Physical Desks (e.g., International House Helsinki — IHH):</b><br/>
          IHH operates as a physical desk (Helsinki only, 2–4 wk booking queues, 9–16h, paperwork only). <b>Expat is a 24/7 digital lifecycle infrastructure</b> covering 6+ metros, beginning 60 days pre-arrival, driving active job matching, civic voting, and relieving over 50% of IHH staff congestion.
        </div>
        <div class="tag tag-cyan" style="font-size: 9.5px; padding: 4px 8px; white-space: nowrap; flex-shrink: 0;">Digital Layer for IHH</div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Product Modules: Municipal Onboarding & Civic Helpdesk</span>
      </div>
      <div>Confidential • Section: Live Modules</div>
    </div>
  </div>

  <!-- SLIDE 6: Live Modules — Civic Engagement & Community -->
  <div class="slide" id="slide-6">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> OPERATIONAL PLATFORM MODULES (LIVE)</div>
        <div class="slide-title">Module 3: Participatory Budgeting & Community Network</div>
        <div class="slide-subtitle">Engaging international residents in urban co-creation and mutual community support</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-live">Direct Democracy</span>
        <span class="slide-number">06 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <!-- Participatory Budgeting -->
        <div class="card card-accent-purple">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-purple);">🗳️</span>
              Participatory Budgeting (/participatory-budget)
            </div>
            <span class="tag tag-purple">Civic Voting</span>
          </div>
          <p class="card-desc">
            An innovative digital democracy module (modeled after Helsinki’s <i>OmaStadi</i> program), tailored for international residents:
          </p>
          <ul class="bullet-list purple">
            <li><b>Virtual Token Wallet:</b> Verified expat residents receive voting tokens to allocate across community development proposals.</li>
            <li><b>6 Strategic Impact Categories:</b>
              <span style="font-size: 10px; color: #94a3b8; display: block; margin-top: 2px;">
                Parks & Nature, Culture & Festivals, Language & Integration, Sports & Saunas, Youth & Daycare, Transit & Cycling.
              </span>
            </li>
            <li><b>Funding Quorum Tracking:</b> Live progress tracking toward municipal review thresholds.</li>
            <li><b>Belonging Multiplier:</b> Transforms expats from passive consumers into engaged city stakeholders.</li>
          </ul>
        </div>

        <!-- Community, Mentorship & Polls -->
        <div class="card card-accent-lime">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-lime);">🤝</span>
              Community Hub, Mentorship & Polls (/community)
            </div>
            <span class="tag tag-green">Social Fabric</span>
          </div>
          <p class="card-desc">
            A social infrastructure fostering horizontal bonds between international talent and local Finns:
          </p>
          <ul class="bullet-list lime">
            <li><b>Event Calendar:</b> Tech meetups, hackathons, ski clubs, and language cafes with 1-click RSVP.</li>
            <li><b>Community Notice Board:</b> Housing leads, family gear exchanges, ride-sharing, and peer advice.</li>
            <li><b>Mentor Network:</b> A directory of seasoned expats and locals offering 1-on-1 settling and career mentorship.</li>
            <li><b>Civic Sentiment Polls (/polls):</b> Frequent sentiment tracking on cost of living, housing, taxes, and healthcare.</li>
            <li><b>Civic Token Store (/shop):</b> Earn reward points for community contributions, redeemable for local perks.</li>
          </ul>
        </div>
      </div>

      <!-- Social Cohesion Metric -->
      <div class="grid-3">
        <div class="metric-box" style="padding: 10px;">
          <div class="metric-value" style="font-size: 20px;">89%</div>
          <div class="metric-label">Increase in Sense of Civic Belonging</div>
        </div>
        <div class="metric-box" style="padding: 10px; background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2);">
          <div class="metric-value" style="font-size: 20px; color: #34d399;">3.5x</div>
          <div class="metric-label">Growth in Peer-to-Peer Support Networks</div>
        </div>
        <div class="metric-box" style="padding: 10px; background: rgba(151, 57, 200, 0.05); border-color: rgba(151, 57, 200, 0.2);">
          <div class="metric-value" style="font-size: 20px; color: #c084fc;">100%</div>
          <div class="metric-label">Aligned with EU Social Inclusion Directives</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Product Modules: Civic Engagement & Social Integration</span>
      </div>
      <div>Confidential • Section: Live Modules</div>
    </div>
  </div>

  <!-- SLIDE 7: Live Modules — Municipal Analytics & B2G Dashboard -->
  <div class="slide" id="slide-7">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> OPERATIONAL PLATFORM MODULES (LIVE)</div>
        <div class="slide-title">Module 4: Municipal Analytics & B2G Executive Dashboard</div>
        <div class="slide-subtitle">A command center for city councils, ministries, and policy research institutes</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-live">B2G Intelligence</span>
        <span class="slide-number">07 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-4" style="margin-bottom: 6px;">
        <div class="card card-accent-top" style="padding: 11px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--primary-cyan);">INTEGRATION FUNNEL</div>
          <div style="font-size: 17px; font-weight: 800; color: #fff; margin-top: 3px;">Integration Funnel</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">
            Stage tracking: Arrival ➔ DVV ➔ Tax Card ➔ Employment ➔ Long-Term Permanent Residency.
          </div>
        </div>
        <div class="card card-accent-lime" style="padding: 11px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--nordic-lime);">SKILLS MAPPING</div>
          <div style="font-size: 17px; font-weight: 800; color: #fff; margin-top: 3px;">Talent Radar</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">
            Real-time heatmaps: AI/ML, Cloud, CleanTech, HealthTech, spoken languages, and degrees.
          </div>
        </div>
        <div class="card card-accent-purple" style="padding: 11px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--primary-purple);">SENTIMENT PULSE</div>
          <div style="font-size: 17px; font-weight: 800; color: #fff; margin-top: 3px;">Sentiment Insights</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">
            Satisfaction indices across housing, schooling, red tape, and social adaptation with anomaly alerts.
          </div>
        </div>
        <div class="card card-accent-amber" style="padding: 11px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--nordic-amber);">CITY BENCHMARK</div>
          <div style="font-size: 17px; font-weight: 800; color: #fff; margin-top: 3px;">City Benchmark</div>
          <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px;">
            Comparative benchmarking of integration velocity across Helsinki, Espoo, Tampere, Turku, and Oulu.
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <div class="card-title">📊 Key Value for Mayors & City Planners (/municipal-dashboard)</div>
            <span class="tag tag-cyan">Data-Driven Policy</span>
          </div>
          <ul class="bullet-list">
            <li><b>Budget Justification:</b> Municipal leadership gains empirical data proving the ROI of international attraction programs.</li>
            <li><b>Early Churn Warning:</b> Identifies dropping satisfaction trends before a specialist decides to relocate to Sweden or Germany.</li>
            <li><b>Official Reporting Export:</b> Export complete analytical datasets in CSV and PDF formats for City Council sessions.</li>
          </ul>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">🔒 B2G Security & GDPR Data Governance</div>
            <span class="tag tag-green">Data Governance</span>
          </div>
          <ul class="bullet-list lime">
            <li><b>Aggregated Anonymity:</b> All analytics are collected in an anonymized format with zero personally identifiable information (PII).</li>
            <li><b>Differential Privacy:</b> Prevents re-identification of rare specialist profiles in smaller municipalities.</li>
            <li><b>EU Sovereign Cloud:</b> Fully adheres to Finnish Information Security Inspection Scheme (Katso / PiTuKi) guidelines.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Product Modules: Municipal Analytics & B2G Intelligence</span>
      </div>
      <div>Confidential • Section: Live Modules</div>
    </div>
  </div>

  <!-- SLIDE 8: Enterprise Security, Admin & Tech Stack -->
  <div class="slide" id="slide-8">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> TECHNOLOGY STACK & SECURITY INFRASTRUCTURE</div>
        <div class="slide-title">Enterprise Architecture: Modern Stack & 2FA Guard</div>
        <div class="slide-subtitle">A scalable, production-grade technology foundation built for national traffic and compliance</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-live">Production Architecture</span>
        <span class="slide-number">08 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <!-- Tech Stack -->
        <div class="card card-accent-top">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-cyan);">⚡</span>
              Cutting-Edge Tech Stack (Frontend & Tools)
            </div>
            <span class="tag tag-cyan">Ultra-Fast & Modular</span>
          </div>
          <table class="deck-table">
            <thead>
              <tr>
                <th>Layer</th>
                <th>Technology</th>
                <th>Role & Strategic Advantage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Core</b></td>
                <td>React 19 + TypeScript</td>
                <td>Strict domain models, Concurrent Mode, zero runtime type errors</td>
              </tr>
              <tr>
                <td><b>Build & Engine</b></td>
                <td>Vite 6 + SASS Modules</td>
                <td>Instant HMR, optimized chunk splitting, sub-second load times</td>
              </tr>
              <tr>
                <td><b>UI Library</b></td>
                <td>PrimeReact 10 + Icons</td>
                <td>Accessible (A11y), responsive enterprise-grade components</td>
              </tr>
              <tr>
                <td><b>Routing & State</b></td>
                <td>React Router 7 + Contexts</td>
                <td>Protected route guards, persistent session state</td>
              </tr>
              <tr>
                <td><b>i18n Engine</b></td>
                <td>i18next (5 Languages)</td>
                <td>Dynamic locale bundle registration, on-the-fly language switching</td>
              </tr>
              <tr>
                <td><b>DevOps</b></td>
                <td>Docker + Nginx + K8s</td>
                <td>Production manifests ready for Finnish sovereign cloud clusters</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Security & Admin -->
        <div class="card card-accent-purple">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-purple);">🛡️</span>
              B2G Security & Admin Operations (/admin)
            </div>
            <span class="tag tag-purple">Enterprise Defense</span>
          </div>
          <p class="card-desc">
            Engineered from day one to satisfy stringent public sector procurement and data privacy standards:
          </p>
          <ul class="bullet-list purple">
            <li><b>2FA Admin Guard (TOTP):</b> Mandatory two-factor authentication via Google Authenticator or 1Password for administrative panels.</li>
            <li><b>Role-Based Access Control (RBAC):</b> Granular permissions: <i>Superadmin, Municipal Operator, Company Moderator, Expat User</i>.</li>
            <li><b>Invite Code System (/admin/invite-codes):</b> Controlled onboarding for enterprise partners, pilot employers, and testers.</li>
            <li><b>Immutable Audit Logging:</b> Complete historical records for status modifications, approvals, and data updates.</li>
            <li><b>Hardened Sessions:</b> Auto-rotating JWTs, XSS/CSRF protections, and strict Content Security Policy (CSP) via Nginx.</li>
          </ul>
        </div>
      </div>

      <!-- Compliance Badges -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-around;">
        <span style="font-size: 11px; font-weight: 600; color: #cbd5e1;">✅ GDPR / EU Data Protection Compliant</span>
        <span style="font-size: 11px; font-weight: 600; color: #cbd5e1;">✅ Zero-Trust B2G Access Architecture</span>
        <span style="font-size: 11px; font-weight: 600; color: #cbd5e1;">✅ WCAG 2.1 AA Accessibility Ready</span>
        <span style="font-size: 11px; font-weight: 600; color: #cbd5e1;">✅ Cloud Native & Kubernetes Native</span>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Enterprise Architecture, Stack & Compliance</span>
      </div>
      <div>Confidential • Section: Technical Infrastructure</div>
    </div>
  </div>

  <!-- SLIDE 9: Product Roadmap — Securing Finland First, Scaling Across Europe -->
  <div class="slide" id="slide-9">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> STRATEGIC ROADMAP: FINLAND FIRST TO EUROPEAN SCALE</div>
        <div class="slide-title">Roadmap: Securing the Finnish Market First, Scaling Across Europe</div>
        <div class="slide-subtitle">A systematic 4-phase rollout: establishing a domestic civic monopoly in Finland, then exporting our battle-tested engine</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-grant">Finland First ➔ EU Export</span>
        <span class="slide-number">09 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="roadmap-timeline">
        <!-- Step 1 -->
        <div class="timeline-step active">
          <div class="step-quarter">
            <span>PHASE 1 • Q1-Q2 2026</span>
            <span class="tag tag-cyan">Finland Core</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #fff;">Suomi.fi, Vero & DVV Deep Sync</div>
          <ul class="bullet-list" style="font-size: 10px;">
            <li><b>What will be built:</b> Authentication via Suomi.fi-tunnistus (Finnish bank IDs, Mobile ID) and real-time Vero / DVV API sync.</li>
            <li><b>Strategic Rationale:</b> Eliminates manual paper friction; automates tax card calculation. Saves 4+ hours of administrative work per expat.</li>
          </ul>
        </div>

        <!-- Step 2 -->
        <div class="timeline-step">
          <div class="step-quarter">
            <span>PHASE 2 • Q2-Q3 2026</span>
            <span class="tag tag-purple">GenAI Copilot</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #fff;">Finnish Legal & Integration AI Advisor</div>
          <ul class="bullet-list purple" style="font-size: 10px;">
            <li><b>What will be built:</b> Specialized RAG legal copilot trained on Finnish statutes, collective agreements (TES), and tenancy laws.</li>
            <li><b>Strategic Rationale:</b> 24/7 contract interpretation in expat's native language, relieving over 50% of municipal International House load.</li>
          </ul>
        </div>

        <!-- Step 3 -->
        <div class="timeline-step">
          <div class="step-quarter">
            <span>PHASE 3 • Q3-Q4 2026</span>
            <span class="tag tag-amber">Finland B2B</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #fff;">Nationwide B2B & Kunta Monopoly</div>
          <ul class="bullet-list amber" style="font-size: 10px;">
            <li><b>What will be built:</b> Full roll-out across Helsinki, Espoo, Tampere, Vantaa, Turku, and Oulu + corporate hiring partner dashboard.</li>
            <li><b>Strategic Rationale:</b> Locks in domestic market dominance, generates recurring B2G/B2B revenue, and fuels Finland's top tech scale-ups.</li>
          </ul>
        </div>

        <!-- Step 4 -->
        <div class="timeline-step">
          <div class="step-quarter">
            <span>PHASE 4 • 2027+</span>
            <span class="tag tag-green">Pan-EU Export</span>
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #fff;">Nordic Expansion & European Export</div>
          <ul class="bullet-list lime" style="font-size: 10px;">
            <li><b>What will be built:</b> Exporting the proven Finnish civic-tech engine to Sweden, Germany, and Estonia with EDUFI degree verification.</li>
            <li><b>Strategic Rationale:</b> Turns Finnish civic-tech innovation into a high-margin international export supported by EU Horizon Europe.</li>
          </ul>
        </div>
      </div>

      <div class="card card-accent-lime" style="margin-top: 4px; padding: 11px 16px;">
        <div class="card-header">
          <div class="card-title" style="font-size: 12.5px;">🎯 Strategic Network Effect: Finland as the Ultimate Global Proof of Concept</div>
          <span class="tag tag-green">Defensible Moat</span>
        </div>
        <p style="font-size: 11px; color: #e2e8f0; line-height: 1.45;">
          By winning the Finnish market first—the most digitally advanced and demanding public sector in Europe—Expat creates an unassailable data and distribution moat. Every Finnish municipality connected makes the platform indispensable to foreign talent, establishing the gold standard before pan-European expansion.
        </p>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Product Roadmap & Development Milestones</span>
      </div>
      <div>Confidential • Section: Strategic Roadmap</div>
    </div>
  </div>

  <!-- SLIDE 10: Rationale & Value Proposition — Why Finland First -->
  <div class="slide" id="slide-10">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> ECONOMIC RATIONALE: WHY FINLAND FIRST</div>
        <div class="slide-title">Why Finland First: Protecting the Nation's Economic Engine</div>
        <div class="slide-subtitle">A high-yield economic multiplier: solving Finland's demographic crisis and retaining billions in national tax revenue</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-grant">National Economic Priority</span>
        <span class="slide-number">10 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-3">
        <!-- Talent Value -->
        <div class="card card-accent-top">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-cyan);">🌍</span>
              For International Specialists
            </div>
            <span class="tag tag-cyan">Talent ROI</span>
          </div>
          <div class="metric-value" style="font-size: 21px; margin: 3px 0;">-75% Stress & Friction</div>
          <ul class="bullet-list">
            <li><b>Certainty & Legal Safety:</b> Clear, sequential roadmap for Finnish registration (DVV, Vero, Kela, Migri) without legal violations.</li>
            <li><b>Accelerated Career Launch:</b> Cuts settling and time-to-first-interview from 6 months down to 3–4 weeks.</li>
            <li><b>Ending Social Isolation:</b> Immediate access to peer networks, Finnish language cafes, and professional mentorship.</li>
            <li><b>Family Peace of Mind:</b> Fast-track daycare and schooling enrollment for spouses and accompanying children.</li>
          </ul>
        </div>

        <!-- Municipal Value -->
        <div class="card card-accent-lime">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-lime);">🏛️</span>
              For Finnish Municipalities (Kunnat)
            </div>
            <span class="tag tag-green">Domestic Civic ROI</span>
          </div>
          <div class="metric-value" style="color: var(--nordic-lime); font-size: 21px; margin: 3px 0;">€35,000 / year preserved</div>
          <ul class="bullet-list lime">
            <li><b>Direct Tax Yield Protection:</b> Each retained specialist preserves €25k–€35k in municipal income taxes every single year.</li>
            <li><b>Defending Attraction Investments:</b> Stops 38% talent churn, ensuring millions invested in Talent Boost programs are not lost.</li>
            <li><b>Desk Congestion Relief:</b> Eliminates over 50% of routine municipal inquiries at International House locations.</li>
            <li><b>Demographic Regeneration:</b> Supplies young, highly educated taxpayers to offset Finland’s rapidly aging demographic curve.</li>
          </ul>
        </div>

        <!-- Business Value -->
        <div class="card card-accent-purple">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--primary-purple);">🏢</span>
              For Finnish Tech Champions
            </div>
            <span class="tag tag-purple">Business ROI</span>
          </div>
          <div class="metric-value" style="color: #c084fc; font-size: 21px; margin: 3px 0;">-40% Hiring CAC</div>
          <ul class="bullet-list purple">
            <li><b>Fueling Finnish Tech Scale-ups:</b> Solves critical shortages for Nokia, Supercell, Wolt, Rovio, and 6G research initiatives.</li>
            <li><b>Zero Failed Relocations:</b> Specialists arrive with structured settling plans, avoiding costly probation period resignations.</li>
            <li><b>International Competitiveness:</b> Enables Finnish tech employers to out-compete Stockholm, Berlin, and London for elite talent.</li>
          </ul>
        </div>
      </div>

      <!-- Macro Impact & Employment Target Box -->
      <div style="background: rgba(0,210,255,0.05); border: 1px solid rgba(0,210,255,0.25); border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 5px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 11.5px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
            <span>🇫🇮</span> Talent Placement & Retention Targets: <b style="color: var(--primary-cyan);">Year 1: 500–600</b> | <b style="color: var(--nordic-lime);">Year 2: 1,500–1,800</b> | <b style="color: #c084fc;">Year 3: 3,500+ Specialists</b>
          </div>
          <div class="tag tag-cyan" style="font-size: 10px; padding: 3px 8px;">ROI: €45M Tax Yield / €240M GDP</div>
        </div>
        <div style="font-size: 10px; color: #cbd5e1; line-height: 1.45;">
          <b>Empirical Basis for Estimates:</b> 1) <b>Demand:</b> 20,000+ annual ICT specialist deficit in Finland (Teknologiateollisuus data); 150–300 tech employers hiring 3–5 expats/yr. 2) <b>Supply:</b> 18,000 work-permit arrivals/yr (Migri) + 8,000 foreign university graduates (Vipunen). 3) <b>Funnel:</b> 3.2% placement conversion on 50k active specialist pool with Nordic STAR resumes. 4) <b>Retention:</b> Slashing 3-year expat churn from 38% down to &lt;15%.
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Economic Rationale & National Value Multiplier</span>
      </div>
      <div>Confidential • Section: National Value Proposition</div>
    </div>
  </div>

  <!-- SLIDE 11: Business Model, Market Opportunity & Unit Economics -->
  <div class="slide" id="slide-11">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> LAND & EXPAND MONETIZATION MODEL</div>
        <div class="slide-title">Land & Expand: Domestic Monopoly in Finland to European Scale</div>
        <div class="slide-subtitle">De-risked monetization: building sustainable B2G/B2B revenue in Finland before scaling across the Nordics and EU</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-grant">Commercial Scalability</span>
        <span class="slide-number">11 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <!-- TAM SAM SOM -->
      <div class="grid-3" style="margin-bottom: 6px;">
        <div class="card" style="text-align: center; padding: 11px; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.06);">
          <div style="font-size: 9.5px; color: var(--nordic-lime); text-transform: uppercase; font-weight: 800;">STAGE 1: SOM (FINLAND BEACHHEAD)</div>
          <div class="metric-value" style="font-size: 22px; margin: 3px 0; color: #34d399;">€28M</div>
          <div style="font-size: 10px; color: #cbd5e1;">Domestic monopoly across 6 major Finnish cities, 300+ tech employers & verified expat service marketplace</div>
        </div>
        <div class="card" style="text-align: center; padding: 11px; border-color: rgba(0, 210, 255, 0.3);">
          <div style="font-size: 9.5px; color: var(--primary-cyan); text-transform: uppercase; font-weight: 700;">STAGE 2: SAM (NORDIC EXPANSION)</div>
          <div class="metric-value" style="font-size: 22px; margin: 3px 0; color: #fff;">€450M</div>
          <div style="font-size: 10px; color: var(--text-muted);">Cloning the Finnish model into Sweden, Norway, and Denmark with identical Nordic civic structures</div>
        </div>
        <div class="card" style="text-align: center; padding: 11px;">
          <div style="font-size: 9.5px; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">STAGE 3: TAM (PAN-EUROPEAN EXPORT)</div>
          <div class="metric-value" style="font-size: 22px; margin: 3px 0; color: #94a3b8;">€4.8B</div>
          <div style="font-size: 10px; color: var(--text-muted);">EU-wide cross-border mobility, municipal Civic Tech SaaS, and international talent retention infrastructure</div>
        </div>
      </div>

      <!-- 4 Revenue Streams -->
      <div class="grid-4">
        <div class="card card-accent-top">
          <div style="font-size: 10.5px; font-weight: 700; color: var(--primary-cyan);">1. B2G MUNICIPAL SAAS</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #fff; margin: 3px 0;">€25k – €120k / year</div>
          <p class="card-desc">
            Annual software subscriptions for Finnish city councils (Helsinki, Espoo, Tampere, etc.) for analytics, ticketing, and funnel intelligence.
          </p>
        </div>
        <div class="card card-accent-lime">
          <div style="font-size: 10.5px; font-weight: 700; color: var(--nordic-lime);">2. B2B RECRUITER SUBSCRIPTION</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #fff; margin: 3px 0;">€299 – €999 / mo</div>
          <p class="card-desc">
            Corporate subscriptions for employers to access pre-vetted candidates with STAR resumes, company branding, and vacancy promotion.
          </p>
        </div>
        <div class="card card-accent-purple">
          <div style="font-size: 10.5px; font-weight: 700; color: var(--primary-purple);">3. MARKETPLACE COMMISSIONS</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #fff; margin: 3px 0;">10% – 15% Take Rate</div>
          <p class="card-desc">
            Vetted affiliate fees from relocation agencies, housing providers, private healthcare, insurance, and certified relocation lawyers.
          </p>
        </div>
        <div class="card card-accent-amber">
          <div style="font-size: 10.5px; font-weight: 700; color: var(--nordic-amber);">4. PUBLIC R&D CO-FUNDING</div>
          <div style="font-size: 13.5px; font-weight: 800; color: #fff; margin: 3px 0;">€50k – €500k Grants</div>
          <p class="card-desc">
            Non-dilutive funding from Business Finland (Tempo / Young Innovative Enterprises) and EU Horizon Europe Civic Tech initiatives.
          </p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT PLATFORM</div>
        <span>• Business Model & Monetization Potential</span>
      </div>
      <div>Confidential • Section: Business Model & Scalability</div>
    </div>
  </div>

  <!-- SLIDE 12: Funding Ask, Grant Alignment & Milestones -->
  <div class="slide" id="slide-12">
    <div class="slide-header">
      <div class="slide-title-wrap">
        <div class="slide-kicker"><span class="dot"></span> SEED ROUND & BUSINESS FINLAND GRANT MATCHING</div>
        <div class="slide-title">Financing: Seed & Grant Round €350,000 – €500,000</div>
        <div class="slide-subtitle">Accelerating Finland's premier talent retention platform — high domestic ROI with exceptional European export upside</div>
      </div>
      <div class="slide-meta-badge">
        <span class="badge badge-grant">Seed & Grant Round</span>
        <span class="slide-number">12 / 12</span>
      </div>
    </div>

    <div class="slide-body">
      <div class="grid-2">
        <!-- Use of Funds -->
        <div class="card card-accent-amber">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-amber);">💰</span>
              Target Capital Allocation (Use of Funds)
            </div>
            <span class="tag tag-amber">Capital Allocation</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 7px; margin-top: 3px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700;">
                <span>R&D: Finnish Gov APIs (Suomi.fi, Vero, DVV) & AI Legal Advisor</span>
                <span style="color: var(--primary-cyan);">45% (€180k)</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-top: 2px;">
                <div style="width: 45%; height: 100%; background: var(--primary-cyan); border-radius: 3px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700;">
                <span>Municipal Pilot Deployments (Helsinki, Espoo, Tampere, Oulu)</span>
                <span style="color: var(--nordic-lime);">25% (€100k)</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-top: 2px;">
                <div style="width: 25%; height: 100%; background: var(--nordic-lime); border-radius: 3px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700;">
                <span>Talent Acquisition & Community Ecosystem (Slush, Maria 01, Universities)</span>
                <span style="color: #c084fc;">20% (€80k)</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-top: 2px;">
                <div style="width: 20%; height: 100%; background: #c084fc; border-radius: 3px;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700;">
                <span>B2G Compliance (Katso / PiTuKi), Security Audits & Global IP</span>
                <span style="color: var(--nordic-amber);">10% (€40k)</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-top: 2px;">
                <div style="width: 10%; height: 100%; background: var(--nordic-amber); border-radius: 3px;"></div>
              </div>
            </div>
          </div>

          <div style="margin-top: 8px; padding: 7px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; font-size: 10.5px; color: #cbd5e1;">
            🤝 <b>Business Finland Grant Alignment:</b> 100% compliant with <b>Business Finland Tempo</b> (€60,000 non-dilutive grant) and NIY / Horizon Europe criteria: high domestic value creation in Finland coupled with massive international scalability.
          </div>
        </div>

        <!-- 12-Month Targets & Contacts -->
        <div class="card card-accent-lime">
          <div class="card-header">
            <div class="card-title">
              <span class="card-icon" style="color: var(--nordic-lime);">🎯</span>
              12-Month Execution Milestones (Traction KPIs)
            </div>
            <span class="tag tag-green">Execution Milestones</span>
          </div>
          <ul class="bullet-list lime">
            <li><b>500–600 Verified Placements (Yr 1) ➔ 1,500+ (Yr 2):</b> Driven by 150+ tech employers & 20k national ICT vacancy deficit.</li>
            <li><b>50,000+ Active Specialists:</b> Scalable talent pipeline spanning pre-arrival, Migri arrivals, and Finnish university graduates.</li>
            <li><b>4 B2G Municipal Contracts:</b> Digital gateway deployment across Helsinki (complementing IHH), Espoo, Tampere, and Oulu.</li>
            <li><b>150+ Employers & €250k ARR:</b> Sustainable recurring B2B/B2G revenue milestone achieved in Year 1.</li>
          </ul>

          <div style="margin-top: 10px; padding: 10px 14px; background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 8px;">
            <div style="font-size: 11.5px; font-weight: 700; color: #fff;">Let's Secure Finland's Talent Future Together</div>
            <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">
              Open to discussions with venture capital funds, angel syndicates, Business Finland advisors, and municipal leadership.
            </div>
            <div style="display: flex; gap: 8px; margin-top: 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; align-items: center;">
              <span style="color: var(--nordic-lime); font-weight: 700;">● LIVE APP:</span>
              <a href="https://x-pat.duckdns.org/" target="_blank" style="color: var(--primary-cyan); text-decoration: underline; font-weight: 600;">https://x-pat.duckdns.org/</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div class="footer-left">
        <div class="logo-badge"><span class="logo-icon">E</span> EXPAT FINLAND</div>
        <span>• Final Investment Memorandum • Helsinki, Finland</span>
      </div>
      <div>Thank you for your time • Ready for Q&A</div>
    </div>
  </div>

  <script>
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }

    // Keyboard navigation (Page Down / Page Up / Arrows)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') {
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
        window.scrollBy({ top: -window.innerHeight * 0.9, behavior: 'smooth' });
      }
    });
  </script>
</body>
</html>
`;

// Write HTML presentation file
const presentationHtmlPath = path.join(presentationDir, 'index.html');
fs.writeFileSync(presentationHtmlPath, htmlContent, 'utf-8');
console.log('✅ Generated HTML presentation:', presentationHtmlPath);

// Define PDF output paths
const pdfOutputPathInDir = path.join(presentationDir, 'Expat_Platform_Pitch_Deck_2026.pdf');
const pdfOutputPathInRoot = path.join(rootDir, 'Expat_Platform_Pitch_Deck_2026.pdf');

// Render PDF using Edge or Chrome headless
const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';

let browserPath = '';
if (fs.existsSync(edgePath)) {
  browserPath = edgePath;
} else if (fs.existsSync(chromePath)) {
  browserPath = chromePath;
}

if (browserPath) {
  console.log('Rendering PDF using browser:', browserPath);
  try {
    const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfOutputPathInDir}" "${presentationHtmlPath}"`;
    execSync(cmd, { stdio: 'inherit' });
    
    // Copy to root as well for immediate accessibility
    fs.copyFileSync(pdfOutputPathInDir, pdfOutputPathInRoot);
    console.log('✅ PDF successfully created at:');
    console.log('   1.', pdfOutputPathInDir);
    console.log('   2.', pdfOutputPathInRoot);

    const stats = fs.statSync(pdfOutputPathInRoot);
    console.log('PDF file size:', (stats.size / 1024).toFixed(1), 'KB');
  } catch (err) {
    console.error('Error rendering PDF:', err);
  }
} else {
  console.log('No headless browser found to auto-print PDF. You can open index.html and print to PDF.');
}
