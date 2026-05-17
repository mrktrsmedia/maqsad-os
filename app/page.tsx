// @ts-nocheck
'use client'

export const dynamic = 'force-dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PAGE_CSS = `
    :root {
      --black: #0b1a2e;
      --dark: #0f1f35;
      --surface: #12243d;
      --border: #1e3454;
      --border-light: #284266;
      --gold: #c9a96e;
      --gold-dim: #7a5f38;
      --gold-glow: rgba(201, 169, 110, 0.08);
      --gold-glow-strong: rgba(201, 169, 110, 0.18);
      --text: #f0ede6;
      --text-muted: #888075;
      --text-dim: #2a4060;
      --red: #c95555;
      --white: #f0ede6;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      background: var(--black);
      color: var(--text);
      font-family: 'Barlow', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      overflow-x: hidden;
      cursor: none;
    }

    /* CUSTOM CURSOR */
    .cursor {
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--gold);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transition: transform 0.1s;
      mix-blend-mode: screen;
    }

    .cursor-ring {
      position: fixed;
      width: 32px;
      height: 32px;
      border: 1px solid rgba(201, 169, 110, 0.4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transition: all 0.15s ease;
    }

    /* GRAIN */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
    }

    /* NAV */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 20px 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid transparent;
      transition: all 0.4s;
    }

    nav.scrolled {
      background: rgba(11, 26, 46, 0.95);
      backdrop-filter: blur(12px);
      border-bottom-color: var(--border);
    }


    /* LOGO STYLES */
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--gold);
      text-decoration: none;
    }

    .nav-logo-img {
      width: 38px;
      height: 38px;
      object-fit: contain;
    }

    .nav-logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .nav-logo-name {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
    }

    .nav-logo-sub {
      font-family: 'Barlow', sans-serif;
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* HERO LOGO */
    .hero-logo-badge {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 44px;
      opacity: 0;
      animation: fadeUp 0.8s 0.1s forwards;
    }

    .hero-logo-icon {
      width: 80px;
      height: 80px;
      object-fit: contain;
      filter: drop-shadow(0 0 30px rgba(201, 169, 110, 0.3));
      animation: logoPulse 4s ease-in-out infinite;
    }

    .hero-logo-lockup {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .hero-logo-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--gold);
      line-height: 1;
    }

    .hero-logo-subtitle {
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    @keyframes logoPulse {

      0%,
      100% {
        filter: drop-shadow(0 0 20px rgba(201, 169, 110, 0.2));
      }

      50% {
        filter: drop-shadow(0 0 40px rgba(201, 169, 110, 0.45));
      }
    }

    /* FOOTER LOGO */
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
    }

    .footer-logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
      opacity: 0.8;
    }


    .nav-links {
      display: flex;
      align-items: center;
      gap: 40px;
      list-style: none;
    }

    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: var(--text);
    }

    .nav-cta {
      background: var(--gold);
      color: #000 !important;
      padding: 10px 24px;
      font-weight: 700 !important;
      letter-spacing: 0.06em !important;
      transition: background 0.2s !important;
    }

    .nav-cta:hover {
      background: #d4b47a !important;
      color: #000 !important;
    }

    .nav-signin {
      color: var(--text-muted);
      border: 1px solid var(--border-light);
      padding: 10px 22px;
      border-radius: 999px;
      transition: all 0.2s;
    }

    .nav-signin:hover {
      color: var(--text);
      border-color: var(--gold);
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      opacity: 0;
      animation: fadeUp 0.8s 0.65s forwards;
    }

    .hero-signin {
      background: transparent;
      color: var(--text-muted);
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 18px 44px;
      border: 1px solid var(--border-light);
      cursor: none;
      text-decoration: none;
      display: inline-block;
      transition: all 0.25s;
    }

    .hero-signin:hover {
      color: var(--text);
      border-color: var(--text);
    }

    /* SECTIONS */
    section {
      position: relative;
    }

    /* ── HERO ── */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 140px 60px 100px;
      position: relative;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 80% 50%, rgba(201, 169, 110, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 50% 70% at 20% 30%, rgba(11, 26, 46, 0.6) 0%, transparent 60%),
        radial-gradient(ellipse 40% 60% at 10% 80%, rgba(201, 169, 110, 0.04) 0%, transparent 60%);
    }

    .hero-line {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom, transparent, var(--border), transparent);
      left: 55%;
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 36px;
      opacity: 0;
      animation: fadeUp 0.8s 0.2s forwards;
    }

    .hero-tag::before {
      content: '';
      width: 32px;
      height: 1px;
      background: var(--gold);
    }

    .hero-headline {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(64px, 8vw, 110px);
      font-weight: 900;
      line-height: 0.92;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      max-width: 700px;
      margin-bottom: 36px;
      opacity: 0;
      animation: fadeUp 0.8s 0.35s forwards;
    }

    .hero-headline .gold {
      color: var(--gold);
    }

    .hero-headline .outline {
      -webkit-text-stroke: 1px var(--text-muted);
      color: transparent;
    }

    .hero-sub {
      font-size: 18px;
      font-weight: 300;
      color: var(--text-muted);
      max-width: 520px;
      line-height: 1.8;
      margin-bottom: 52px;
      opacity: 0;
      animation: fadeUp 0.8s 0.5s forwards;
    }

    .hero-sub strong {
      color: var(--text);
      font-weight: 600;
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 20px;
      opacity: 0;
      animation: fadeUp 0.8s 0.65s forwards;
    }

    .btn-primary {
      background: var(--gold);
      color: #000;
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 18px 44px;
      border: none;
      cursor: none;
      text-decoration: none;
      display: inline-block;
      transition: all 0.25s;
      position: relative;
      overflow: hidden;
    }

    .btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(-100%);
      transition: transform 0.3s;
    }

    .btn-primary:hover::before {
      transform: translateX(0);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-muted);
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 18px 44px;
      border: 1px solid var(--border-light);
      cursor: none;
      text-decoration: none;
      display: inline-block;
      transition: all 0.25s;
    }

    .btn-ghost:hover {
      color: var(--text);
      border-color: var(--text-muted);
    }

    .urgency-tag {
      font-size: 11px;
      color: var(--red);
      letter-spacing: 0.1em;
      margin-top: 16px;
      font-weight: 600;
    }

    .urgency-tag span {
      color: var(--text-muted);
      font-weight: 400;
    }

    /* HERO RIGHT PANEL */
    .hero-right {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 42%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
      opacity: 0;
      animation: fadeIn 1.2s 0.8s forwards;
    }

    .hero-stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
      width: 100%;
      max-width: 380px;
    }

    .hero-stat {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 28px 24px;
      position: relative;
      overflow: hidden;
    }

    .hero-stat::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gold);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.4s;
    }

    .hero-stat:hover::before {
      transform: scaleX(1);
    }

    .hs-num {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 44px;
      font-weight: 900;
      color: var(--gold);
      line-height: 1;
    }

    .hs-label {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 6px;
      letter-spacing: 0.06em;
      line-height: 1.4;
    }

    /* TICKER */
    .ticker {
      background: var(--gold);
      padding: 14px 0;
      overflow: hidden;
      position: relative;
    }

    .ticker-track {
      display: flex;
      gap: 0;
      animation: ticker 30s linear infinite;
      white-space: nowrap;
    }

    .ticker-item {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #000;
      padding: 0 40px;
      flex-shrink: 0;
    }

    .ticker-sep {
      color: rgba(0, 0, 0, 0.3);
      padding: 0;
    }

    @keyframes ticker {
      0% {
        transform: translateX(0);
      }

      100% {
        transform: translateX(-50%);
      }
    }

    /* PROBLEM SECTION */
    .problem {
      padding: 120px 60px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .section-label::before {
      content: '';
      width: 24px;
      height: 1px;
      background: var(--gold);
    }

    .section-headline {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(36px, 5vw, 62px);
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 24px;
    }

    .section-headline em {
      font-style: italic;
      color: var(--gold);
    }

    .problem-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      margin-top: 60px;
      align-items: start;
    }

    .problem-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .problem-item {
      border-bottom: 1px solid var(--border);
      padding: 24px 0;
      display: flex;
      gap: 20px;
      align-items: flex-start;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s;
    }

    .problem-item.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .p-num {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 42px;
      font-weight: 900;
      color: var(--text-dim);
      line-height: 1;
      flex-shrink: 0;
      width: 48px;
    }

    .p-text {
      font-size: 16px;
      color: var(--text-muted);
      line-height: 1.7;
    }

    .p-text strong {
      color: var(--text);
      font-weight: 600;
    }

    .problem-right {
      position: sticky;
      top: 120px;
    }

    .quote-block {
      border-left: 2px solid var(--gold);
      padding: 32px 36px;
      background: var(--surface);
      margin-bottom: 24px;
    }

    .quote-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-style: italic;
      font-weight: 400;
      line-height: 1.5;
      color: var(--text);
      margin-bottom: 16px;
    }

    .quote-attr {
      font-size: 12px;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    /* WHAT IS IT */
    .what {
      padding: 120px 60px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .what-inner {
      max-width: 1200px;
      margin: 0 auto;
    }

    .what-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 100px;
      align-items: center;
      margin-top: 60px;
    }

    .what-body {
      font-size: 18px;
      color: var(--text-muted);
      line-height: 1.9;
    }

    .what-body p {
      margin-bottom: 24px;
    }

    .what-body strong {
      color: var(--text);
      font-weight: 600;
    }

    .module-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .module-item {
      background: var(--black);
      border: 1px solid var(--border);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: none;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }

    .module-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--gold);
      transform: scaleY(0);
      transition: transform 0.2s;
    }

    .module-item:hover::before {
      transform: scaleY(1);
    }

    .module-item:hover {
      border-color: var(--border-light);
      padding-left: 28px;
    }

    .m-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      letter-spacing: 0.04em;
    }

    .m-tag {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 600;
    }

    /* HOW IT WORKS */
    .how {
      padding: 120px 60px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      margin-top: 60px;
    }

    .step {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 48px 36px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s;
    }

    .step:hover {
      border-color: var(--gold-dim);
    }

    .step-num {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 100px;
      font-weight: 900;
      color: var(--border);
      line-height: 1;
      position: absolute;
      top: 20px;
      right: 24px;
      transition: color 0.3s;
    }

    .step:hover .step-num {
      color: var(--border-light);
    }

    .step-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 28px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text);
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }

    .step-body {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.75;
      position: relative;
      z-index: 1;
    }

    .step-body strong {
      color: var(--text);
    }

    /* SOCIAL PROOF */
    .proof {
      padding: 120px 60px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .proof-inner {
      max-width: 1200px;
      margin: 0 auto;
    }

    .proof-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      margin-top: 60px;
    }

    .proof-card {
      background: var(--black);
      border: 1px solid var(--border);
      padding: 40px 32px;
      position: relative;
    }

    .proof-card::before {
      content: '"';
      font-family: 'Cormorant Garamond', serif;
      font-size: 80px;
      color: var(--gold);
      position: absolute;
      top: 16px;
      left: 24px;
      line-height: 1;
      opacity: 0.4;
    }

    .proof-text {
      font-size: 16px;
      line-height: 1.75;
      color: var(--text-muted);
      margin-bottom: 28px;
      margin-top: 24px;
    }

    .proof-text strong {
      color: var(--text);
      font-weight: 600;
    }

    .proof-author {
      border-top: 1px solid var(--border);
      padding-top: 20px;
    }

    .proof-name {
      font-weight: 700;
      font-size: 14px;
      color: var(--text);
      letter-spacing: 0.04em;
    }

    .proof-role {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      letter-spacing: 0.06em;
    }

    .proof-numbers {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2px;
      margin-top: 2px;
    }

    .proof-num-card {
      background: var(--black);
      border: 1px solid var(--border);
      padding: 40px 32px;
      text-align: center;
    }

    .pnc-num {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 60px;
      font-weight: 900;
      color: var(--gold);
      line-height: 1;
    }

    .pnc-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 8px;
      line-height: 1.4;
    }

    /* FEATURES */
    .features {
      padding: 120px 60px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
      padding: 80px 0;
      border-bottom: 1px solid var(--border);
    }

    .feature-row:first-of-type {
      padding-top: 60px;
    }

    .feature-row:last-of-type {
      border-bottom: none;
    }

    .feature-row.reverse {
      direction: rtl;
    }

    .feature-row.reverse>* {
      direction: ltr;
    }

    .feature-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 16px;
    }

    .feature-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 42px;
      font-weight: 900;
      text-transform: uppercase;
      line-height: 1;
      margin-bottom: 20px;
      letter-spacing: 0.02em;
    }

    .feature-body {
      font-size: 16px;
      color: var(--text-muted);
      line-height: 1.85;
      margin-bottom: 24px;
    }

    .feature-body strong {
      color: var(--text);
    }

    .feature-points {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .feature-points li {
      font-size: 14px;
      color: var(--text-muted);
      padding-left: 20px;
      position: relative;
    }

    .feature-points li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 9px;
      width: 8px;
      height: 1px;
      background: var(--gold);
    }

    .feature-points li strong {
      color: var(--text);
    }

    .feature-visual {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 40px;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: center;
    }

    .fv-bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .fv-label {
      font-size: 11px;
      color: var(--text-muted);
      width: 100px;
      flex-shrink: 0;
    }

    .fv-track {
      flex: 1;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
    }

    .fv-fill {
      height: 100%;
      background: var(--gold);
      border-radius: 2px;
      animation: barGrow 1.2s ease both;
    }

    @keyframes barGrow {
      from {
        width: 0 !important;
      }
    }

    .fv-pct {
      font-size: 11px;
      color: var(--gold);
      width: 32px;
      text-align: right;
    }

    .fv-stat {
      background: var(--black);
      border: 1px solid var(--border);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .fv-stat-num {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 32px;
      font-weight: 900;
      color: var(--gold);
    }

    .fv-stat-label {
      font-size: 12px;
      color: var(--text-muted);
      text-align: right;
      line-height: 1.4;
    }

    /* PRICING */
    .pricing {
      padding: 120px 60px;
      background: var(--surface);
      border-top: 1px solid var(--border);
    }

    .pricing-inner {
      max-width: 1100px;
      margin: 0 auto;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: 1fr 1.1fr 1fr;
      gap: 2px;
      margin-top: 60px;
    }

    .price-card {
      background: var(--black);
      border: 1px solid var(--border);
      padding: 48px 36px;
      position: relative;
      transition: border-color 0.3s;
    }

    .price-card:hover {
      border-color: var(--gold-dim);
    }

    .price-card.featured {
      background: var(--dark);
      border-color: var(--gold-dim);
    }

    .price-card.featured::before {
      content: 'MOST POPULAR';
      position: absolute;
      top: -1px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--gold);
      color: #000;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      padding: 6px 20px;
    }

    .price-tier {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    .price-amount {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 68px;
      font-weight: 900;
      line-height: 1;
      color: var(--text);
    }

    .price-amount sup {
      font-size: 24px;
      vertical-align: super;
      color: var(--text-muted);
    }

    .price-amount .period {
      font-size: 18px;
      color: var(--text-muted);
      font-weight: 300;
    }

    .price-desc {
      font-size: 14px;
      color: var(--text-muted);
      margin: 20px 0 28px;
      line-height: 1.6;
    }

    .price-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 36px;
    }

    .price-features li {
      font-size: 14px;
      color: var(--text-muted);
      padding-left: 20px;
      position: relative;
    }

    .price-features li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 9px;
      width: 8px;
      height: 1px;
      background: var(--gold);
    }

    .price-features li strong {
      color: var(--text);
    }

    .price-urgency {
      font-size: 11px;
      color: var(--red);
      margin-top: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
    }

    /* CTA SECTION */
    .cta-section {
      padding: 160px 60px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .cta-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201, 169, 110, 0.07) 0%, transparent 70%);
    }

    .cta-section .section-label {
      justify-content: center;
    }

    .cta-headline {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(56px, 7vw, 96px);
      font-weight: 900;
      text-transform: uppercase;
      line-height: 0.92;
      max-width: 900px;
      margin: 0 auto 40px;
      letter-spacing: -0.01em;
    }

    .cta-sub {
      font-size: 18px;
      color: var(--text-muted);
      max-width: 560px;
      margin: 0 auto 52px;
      line-height: 1.8;
    }

    .cta-sub strong {
      color: var(--text);
    }

    .email-form {
      display: flex;
      gap: 0;
      max-width: 520px;
      margin: 0 auto 16px;
    }

    .email-input {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border-light);
      border-right: none;
      color: var(--text);
      font-family: 'Barlow', sans-serif;
      font-size: 15px;
      padding: 18px 24px;
      outline: none;
      transition: border-color 0.2s;
    }

    .email-input:focus {
      border-color: var(--gold-dim);
    }

    .email-input::placeholder {
      color: var(--text-muted);
    }

    .email-btn {
      background: var(--gold);
      color: #000;
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 18px 36px;
      border: none;
      cursor: none;
      white-space: nowrap;
      transition: background 0.2s;
    }

    .email-btn:hover {
      background: #d4b47a;
    }

    .form-note {
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.06em;
    }

    .spots-counter {
      display: inline-block;
      background: rgba(201, 92, 92, 0.1);
      border: 1px solid rgba(201, 92, 92, 0.3);
      color: var(--red);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 6px 16px;
      margin-bottom: 40px;
      animation: pulse 2s ease infinite;
    }

    @keyframes pulse {

      0%,
      100% {
        opacity: 1;
      }

      50% {
        opacity: 0.7;
      }
    }

    /* OBJECTIONS */
    .objections {
      padding: 100px 60px;
      max-width: 900px;
      margin: 0 auto;
    }

    .obj-item {
      padding: 40px 0;
      border-bottom: 1px solid var(--border);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
    }

    .obj-q {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-style: italic;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .obj-a {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.8;
    }

    .obj-a strong {
      color: var(--text);
    }

    /* FOOTER */
    footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }



    .footer-social {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--gold);
      text-decoration: none;
      font-weight: 500;
      margin-top: 10px;
      margin-bottom: 20px;
      transition: opacity 0.2s;
    }

    .footer-social:hover {
      opacity: 0.8;
    }

    .footer-text {
      font-size: 13px;
      color: var(--text-muted);
      letter-spacing: 0.06em;
    }

    /* ANIMATIONS */
    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(24px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    /* SCROLL REVEAL */
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.7s ease, transform 0.7s ease;
    }

    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .reveal-delay-1 {
      transition-delay: 0.1s;
    }

    .reveal-delay-2 {
      transition-delay: 0.2s;
    }

    .reveal-delay-3 {
      transition-delay: 0.3s;
    }

    /* INLINE CTA STRIP */
    .cta-strip {
      background: var(--gold);
      padding: 32px 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
    }

    .cta-strip-text {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 26px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #000;
      flex: 1;
    }

    .cta-strip-sub {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      max-width: 400px;
      flex: 1;
      line-height: 1.5;
    }

    .btn-dark {
      background: #000;
      color: var(--gold);
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 16px 36px;
      border: none;
      cursor: none;
      white-space: nowrap;
      text-decoration: none;
      display: inline-block;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .btn-dark:hover {
      opacity: 0.85;
    }

    /* MOBILE */
    @media (max-width: 900px) {
      nav {
        padding: 16px 24px;
      }

      .nav-logo-img {
        width: 30px;
        height: 30px;
      }

      .nav-logo-name {
        font-size: 16px;
      }

      .nav-logo-sub {
        font-size: 8px;
      }

      .hero-logo-icon {
        width: 56px;
        height: 56px;
      }

      .hero-logo-title {
        font-size: 26px;
      }

      .hero-logo-subtitle {
        font-size: 10px;
        letter-spacing: 0.3em;
      }

      .nav-links {
        display: none;
      }

      .hero {
        padding: 100px 24px 60px;
      }

      .hero-right {
        display: none;
      }

      .hero-headline {
        font-size: 56px;
      }

      .problem {
        padding: 80px 24px;
      }

      .problem-grid {
        grid-template-columns: 1fr;
      }

      .what {
        padding: 80px 24px;
      }

      .what-split {
        grid-template-columns: 1fr;
        gap: 40px;
      }

      .how {
        padding: 80px 24px;
      }

      .steps {
        grid-template-columns: 1fr;
      }

      .proof {
        padding: 80px 24px;
      }

      .proof-grid {
        grid-template-columns: 1fr;
      }

      .proof-numbers {
        grid-template-columns: 1fr 1fr;
      }

      .features {
        padding: 80px 24px;
      }

      .feature-row {
        grid-template-columns: 1fr;
        gap: 40px;
      }

      .feature-row.reverse {
        direction: ltr;
      }

      .pricing {
        padding: 80px 24px;
      }

      .pricing-grid {
        grid-template-columns: 1fr;
      }

      .cta-section {
        padding: 100px 24px;
      }

      .email-form {
        flex-direction: column;
      }

      .email-input {
        border-right: 1px solid var(--border-light);
      }

      .cta-strip {
        flex-direction: column;
        padding: 32px 24px;
        text-align: center;
      }

      .objections {
        padding: 80px 24px;
      }

      .obj-item {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      footer {
        flex-direction: column;
        gap: 20px;
        text-align: center;
        padding: 40px 24px;
      }
    }
  `

const PAGE_HTML = `<div class="cursor" id="cursor"></div>
  <div class="cursor-ring" id="cursorRing"></div>

  <!-- NAV -->
  <nav id="nav">
    <a href="/" class="nav-logo">
      <img
        src="/logo.jpeg"
        alt="Maqsad Logo" class="nav-logo-img">
      <div class="nav-logo-text">
        <span class="nav-logo-name">Maqsad</span>
        <span class="nav-logo-sub">Life OS</span>
      </div>
    </a>
    <ul class="nav-links">
      <li><a href="#what">The System</a></li>
      <li><a href="#proof">Results</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="/login" class="nav-signin">Sign In</a></li>
      <li><a href="#cta" class="nav-cta">Join Now</a></li>
    </ul>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-line"></div>

    <div class="hero-tag">The only life OS built for those who refuse to settle</div>

    <h1 class="hero-headline">
      Your life<br>
      <span class="gold">tracked.</span><br>
      <span class="outline">dominated.</span>
    </h1>

    <p class="hero-sub">
      <strong>Every high-performing individual you admire runs on a system.</strong> They do not rely on motivation.
      They do
      not journal occasionally. They do not guess how their week went. They track everything, fix the gaps, and compound
      daily. Now you can run the exact same system starting tonight.
    </p>

    <div class="hero-cta-group">
      <a href="#cta" class="btn-primary">Join Now</a>
      <a href="/login" class="hero-signin">Sign In</a>
      <a href="#what" class="btn-ghost">See How It Works</a>
    </div>
    <div class="urgency-tag">Already have an account? <a href="/login" style="color: var(--gold); text-decoration: none;">Sign in</a> · Only 214 early access spots remaining <span>out of 500</span></div>

    <div class="hero-right">
      <div class="hero-stat-grid">
        <div class="hero-stat">
          <div class="hs-num">13</div>
          <div class="hs-label">Life modules tracked daily</div>
        </div>
        <div class="hero-stat">
          <div class="hs-num">91%</div>
          <div class="hs-label">Users hit goals within 60 days</div>
        </div>
        <div class="hero-stat">
          <div class="hs-num">4.7x</div>
          <div class="hs-label">More consistent than solo tracking</div>
        </div>
        <div class="hero-stat">
          <div class="hs-num">Zero</div>
          <div class="hs-label">Generic productivity fluff. Ever.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- TICKER -->
  <div class="ticker">
    <div class="ticker-track" id="tickerTrack">
      <span class="ticker-item">Faith</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Business</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Body</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Finance</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Relationships</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Learning</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Habits</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Outreach</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Spirituality</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Nutrition</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Gym</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Discipline</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Faith</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Business</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Body</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Finance</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Relationships</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Learning</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Habits</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Outreach</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Spirituality</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Nutrition</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Gym</span><span class="ticker-item ticker-sep">.</span>
      <span class="ticker-item">Discipline</span><span class="ticker-item ticker-sep">.</span>
    </div>
  </div>

  <!-- PROBLEM -->
  <section class="problem">
    <div class="section-label">The Problem Nobody Admits</div>
    <h2 class="section-headline">You are not lazy.<br>You are <em>untracked.</em></h2>

    <div class="problem-grid">
      <div class="problem-list">
        <div class="problem-item reveal">
          <div class="p-num">01</div>
          <div class="p-text">You work hard but you cannot tell me <strong>exactly</strong> what moved last week. You
            have a feeling. A feeling is not data. Data changes behavior. Feelings fade by Tuesday.</div>
        </div>
        <div class="problem-item reveal reveal-delay-1">
          <div class="p-num">02</div>
          <div class="p-text">You track your gym or your money but never both. <strong>A person who wins in one area
              while
              bleeding in another is not winning.</strong> They are rotating which area they are losing.</div>
        </div>
        <div class="problem-item reveal reveal-delay-2">
          <div class="p-num">03</div>
          <div class="p-text">The apps you use were built for everyone, which means they were built for <strong>no one
              in particular.</strong> A Muslim entrepreneur running two offices and planning a marriage needs something
            built for exactly that life.</div>
        </div>
        <div class="problem-item reveal reveal-delay-3">
          <div class="p-num">04</div>
          <div class="p-text">You have planned the same goals three years in a row. The plans are not the problem.
            <strong>The absence of a daily feedback loop is.</strong> Without it you repeat the cycle indefinitely.
          </div>
        </div>
      </div>

      <div class="problem-right reveal">
        <div class="quote-block">
          <div class="quote-text">"You do not rise to the level of your goals. You fall to the level of your systems."
          </div>
          <div class="quote-attr">James Clear, Atomic Habits</div>
        </div>
        <div class="quote-block">
          <div class="quote-text">"What gets measured, gets managed. What never gets measured, never changes."</div>
          <div class="quote-attr">Peter Drucker</div>
        </div>
      </div>
    </div>
  </section>

  <!-- INLINE CTA STRIP 1 -->
  <div class="cta-strip reveal">
    <div class="cta-strip-text">Ready to stop guessing and start knowing?</div>
    <div class="cta-strip-sub">Maqsad gives you the full picture of your life every single day. No more vague weeks.
    </div>
    <a href="#cta" class="btn-dark">Claim Your Spot</a>
  </div>

  <!-- WHAT IS IT -->
  <section class="what" id="what">
    <div class="what-inner">
      <div class="section-label">What Maqsad Is</div>
      <h2 class="section-headline reveal">The first life OS built<br>for <em>the complete individual.</em></h2>

      <div class="what-split">
        <div class="what-body reveal">
          <p>Maqsad is not another habit tracker. It is not a journal app. It is not a to-do list with a premium
            subscription. <strong>It is the closest thing to having a personal performance director sitting beside you
              every day</strong>, watching everything, catching the gaps, and refusing to let you slide.</p>
          <p>Built specifically for those who carry big responsibilities: faith, business, body, finances,
            relationships.
            Those who need one place where everything is visible and nothing is excused away.</p>
          <p>The AI at the core of Maqsad reads your actual data across all 13 modules and gives you weekly insights
            that no generic app can produce. <strong>It knows your Fajr rate is connected to your gym consistency. It
              knows your best outreach weeks follow your highest-prayer weeks.</strong> It finds the patterns you miss
            because you are too close to your own life to see them.</p>
          <p>This is not a tool for beginners. This is for those who are already serious and want the infrastructure to
            match their ambition.</p>
        </div>

        <div class="module-list reveal">
          <div class="module-item"><span class="m-name">Faith and Prayer Tracker</span><span class="m-tag">Soul</span>
          </div>
          <div class="module-item"><span class="m-name">Business Outreach Pipeline</span><span
              class="m-tag">Business</span></div>
          <div class="module-item"><span class="m-name">Gym and Body Metrics</span><span class="m-tag">Body</span></div>
          <div class="module-item"><span class="m-name">Diet, Macros and Fasting</span><span class="m-tag">Body</span>
          </div>
          <div class="module-item"><span class="m-name">Finance and Revenue Tracking</span><span
              class="m-tag">Wealth</span></div>
          <div class="module-item"><span class="m-name">Learning and Reading Log</span><span class="m-tag">Mind</span>
          </div>
          <div class="module-item"><span class="m-name">Habits and Systems Builder</span><span
              class="m-tag">Discipline</span></div>
          <div class="module-item"><span class="m-name">Relationship Health Monitor</span><span
              class="m-tag">Life</span></div>
          <div class="module-item"><span class="m-name">Weekly Move Review</span><span class="m-tag">Progress</span>
          </div>
          <div class="module-item"><span class="m-name">AI Mirror Backsight</span><span class="m-tag">Truth</span></div>
          <div class="module-item"><span class="m-name">Quitting Tracker</span><span class="m-tag">Clarity</span></div>
          <div class="module-item"><span class="m-name">Spirituality and Dhikr Log</span><span class="m-tag">Soul</span>
          </div>
          <div class="module-item"><span class="m-name">Daily Score and Streaks</span><span class="m-tag">All</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="how">
    <div class="section-label">How It Works</div>
    <h2 class="section-headline reveal">Up and running<br><em>in under 4 minutes.</em></h2>

    <div class="steps">
      <div class="step reveal">
        <div class="step-num">01</div>
        <div class="step-title">Set Your Pillars</div>
        <div class="step-body">Tell Maqsad what your life is built around. Prayer times. Business targets. Gym days.
          <strong>The system calibrates to you</strong>, not to some generic productivity framework built for a
          22-year-old in San Francisco.
        </div>
      </div>
      <div class="step reveal reveal-delay-1">
        <div class="step-num">02</div>
        <div class="step-title">Log Everything Daily</div>
        <div class="step-body">Takes 8 minutes. Quick-log anything at any point in the day. <strong>Prayers, meals,
            lifts, calls made, pages read, money in and out.</strong> The friction is so low you will actually do it.
          And because you do it, you will change.</div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-num">03</div>
        <div class="step-title">Get the Honest Picture</div>
        <div class="step-body">Every Sunday, your AI weekly debrief lands. It reads your data across all 13 modules and
          tells you the truth. <strong>Not what you want to hear. What you need to act on.</strong> The pattern you
          missed. The area you told yourself was fine but was not.</div>
      </div>
    </div>
  </section>

  <!-- INLINE CTA STRIP 2 -->
  <div class="cta-strip reveal">
    <div class="cta-strip-text">Your first insight lands within 7 days of joining.</div>
    <div class="cta-strip-sub">Most users say week one alone is worth the entire subscription. That is not a sales line.
      That is what the data shows.</div>
    <a href="#cta" class="btn-dark">Start Free Now</a>
  </div>

  <!-- PROOF -->
  <section class="proof" id="proof">
    <div class="proof-inner">
      <div class="section-label">Results From Real Users</div>
      <h2 class="section-headline reveal">The kind of change that<br><em>compounds for years.</em></h2>

      <div class="proof-numbers reveal">
        <div class="proof-num-card">
          <div class="pnc-num">91%</div>
          <div class="pnc-label">Hit their primary goal within 60 days</div>
        </div>
        <div class="proof-num-card">
          <div class="pnc-num">4.7x</div>
          <div class="pnc-label">More consistent than before joining</div>
        </div>
        <div class="proof-num-card">
          <div class="pnc-num">8 min</div>
          <div class="pnc-label">Average daily logging time</div>
        </div>
        <div class="proof-num-card">
          <div class="pnc-num">3,800+</div>
          <div class="pnc-label">People across 34 countries on the waitlist</div>
        </div>
      </div>

      <div class="proof-grid" style="margin-top: 2px;">
        <div class="proof-card reveal">
          <div class="proof-text">I ran three businesses and prayed maybe twice a week. I told myself I was too busy.
            <strong>The backsight section of Maqsad showed me I had 4 hours of daily scroll time I called rest.</strong>
            That was 8 weeks ago. I have not missed Fajr since.
          </div>
          <div class="proof-author">
            <div class="proof-name">Tariq M.</div>
            <div class="proof-role">E-commerce founder, Dubai</div>
          </div>
        </div>
        <div class="proof-card reveal reveal-delay-1">
          <div class="proof-text">The AI weekly debrief is unlike anything I have experienced. It does not compliment
            you. <strong>It tells you that your lowest revenue weeks follow your worst gym attendance.</strong> Once you
            see that pattern, you cannot unsee it. My gym consistency tripled.</div>
          <div class="proof-author">
            <div class="proof-name">Bilal R.</div>
            <div class="proof-role">Agency owner, Manchester</div>
          </div>
        </div>
        <div class="proof-card reveal reveal-delay-2">
          <div class="proof-text">I had used Notion, Obsidian, five different habit apps. None of them talked to each
            other. <strong>Maqsad is the first system where I can see that my relationship health score drops when my
              finance stress rises.</strong> The connections were always there. I just could not see them.</div>
          <div class="proof-author">
            <div class="proof-name">Omar S.</div>
            <div class="proof-role">Consultant, Karachi</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="features">
    <div class="section-label">Built Different</div>
    <h2 class="section-headline reveal">Three things<br><em>no other app does.</em></h2>

    <div class="feature-row">
      <div class="reveal">
        <div class="feature-tag">Unique to Maqsad</div>
        <div class="feature-title">The AI Mirror</div>
        <div class="feature-body">
          Every other app shows you your data. Maqsad reads it, finds the hidden connections, and tells you what it
          means for who you are becoming. <strong>Your patterns are not random. Your Fajr rate, your gym days, your
            sales calls, your scrolling time</strong> are all linked in ways you cannot see from inside your own life.
        </div>
        <ul class="feature-points">
          <li><strong>Cross-module pattern detection</strong> across all 13 areas of your life</li>
          <li><strong>Personality and blind spot analysis</strong> based on your actual behavior</li>
          <li><strong>Weekly honest debrief</strong> that does not soften the truth</li>
          <li><strong>Ask-the-Mirror prompts</strong> for real-time self-interrogation</li>
        </ul>
      </div>
      <div class="feature-visual reveal reveal-delay-1">
        <div class="fv-bar-row">
          <div class="fv-label">Faith</div>
          <div class="fv-track">
            <div class="fv-fill" style="width:78%"></div>
          </div>
          <div class="fv-pct">78%</div>
        </div>
        <div class="fv-bar-row">
          <div class="fv-label">Business</div>
          <div class="fv-track">
            <div class="fv-fill" style="width:55%"></div>
          </div>
          <div class="fv-pct">55%</div>
        </div>
        <div class="fv-bar-row">
          <div class="fv-label">Body</div>
          <div class="fv-track">
            <div class="fv-fill" style="width:90%"></div>
          </div>
          <div class="fv-pct">90%</div>
        </div>
        <div class="fv-bar-row">
          <div class="fv-label">Finance</div>
          <div class="fv-track">
            <div class="fv-fill" style="width:48%"></div>
          </div>
          <div class="fv-pct">48%</div>
        </div>
        <div class="fv-bar-row">
          <div class="fv-label">Learning</div>
          <div class="fv-track">
            <div class="fv-fill" style="width:40%"></div>
          </div>
          <div class="fv-pct">40%</div>
        </div>
        <div style="border-top: 1px solid var(--border); padding-top: 20px; margin-top: 8px;">
          <div
            style="font-size:12px; color:var(--gold); letter-spacing:0.08em; margin-bottom:10px; text-transform:uppercase; font-weight:600;">
            AI Mirror Insight</div>
          <div style="font-size:14px; color:var(--text-muted); line-height:1.7; font-style:italic;">"Your body score is
            your highest. Your business is your lowest. You use the gym as productive avoidance. The calls you avoid are
            worth more than the sets you complete."</div>
        </div>
      </div>
    </div>

    <div class="feature-row reverse">
      <div class="reveal">
        <div class="feature-tag">Only on Maqsad</div>
        <div class="feature-title">The Backsight</div>
        <div class="feature-body">
          <strong>Most apps help you plan forward. Maqsad forces you to look back honestly.</strong> The backsight is
          not a reflection journal. It is an honest reckoning. A yearly timeline of where you said you would be versus
          where you actually are.
        </div>
        <ul class="feature-points">
          <li><strong>Year-over-year gap analysis</strong> so you see the real pattern</li>
          <li><strong>Hard questions you must answer</strong> before moving to the next week</li>
          <li><strong>Root cause identification</strong> rather than surface-level metrics</li>
          <li><strong>The three-word shift</strong> tailored to your specific blind spot</li>
        </ul>
      </div>
      <div class="feature-visual reveal reveal-delay-1">
        <div class="fv-stat">
          <div>
            <div
              style="font-size:11px; color:var(--text-muted); margin-bottom:4px; letter-spacing:0.1em; text-transform:uppercase;">
              Where you planned to be</div>
            <div style="font-size:15px; color:var(--text);">3 new clients by March</div>
          </div>
          <div class="fv-stat-num" style="color:var(--red);">0</div>
        </div>
        <div class="fv-stat">
          <div>
            <div
              style="font-size:11px; color:var(--text-muted); margin-bottom:4px; letter-spacing:0.1em; text-transform:uppercase;">
              Root cause identified</div>
            <div style="font-size:15px; color:var(--text);">Builder, not seller</div>
          </div>
          <div class="fv-stat-num" style="color:var(--gold);">!</div>
        </div>
        <div style="padding: 20px; background: var(--black); border: 1px solid rgba(201,92,92,0.2); margin-top: 0;">
          <div
            style="font-size:11px; color:var(--red); letter-spacing:0.12em; text-transform:uppercase; margin-bottom:8px; font-weight:700;">
            Pattern Detected</div>
          <div style="font-size:13px; color:var(--text-muted); line-height:1.7;">"You plan at 100%. You execute at 55%.
            The gap is not capability. It is avoidance dressed as busyness."</div>
        </div>
      </div>
    </div>

    <div class="feature-row">
      <div class="reveal">
        <div class="feature-tag">Faith First</div>
        <div class="feature-title">Built for Muslims</div>
        <div class="feature-body">
          <strong>No other performance system integrates Fajr with finances. No other app connects your Dhikr count to
            your discipline score.</strong> Maqsad was built from the ground up for those whose faith is not separate
          from
          their ambition but is the foundation of it.
        </div>
        <ul class="feature-points">
          <li><strong>5 daily prayer tracking</strong> with weekly compliance rates</li>
          <li><strong>Ramadan fasting mode</strong> with Suhoor and Iftar logging</li>
          <li><strong>Quran and Dhikr counters</strong> integrated with daily scoring</li>
          <li><strong>Fajr-discipline correlation</strong> tracked and surfaced every week</li>
        </ul>
      </div>
      <div class="feature-visual reveal reveal-delay-1" style="text-align:center; justify-content:flex-start; gap:0;">
        <div
          style="font-size:12px; color:var(--gold); letter-spacing:0.15em; text-transform:uppercase; font-weight:700; margin-bottom:16px; text-align:left;">
          Prayers Today</div>
        <div style="display:flex; gap:8px; width:100%;">
          <div
            style="flex:1; padding:16px 8px; background:var(--gold); text-align:center; font-size:11px; font-weight:700; color:#000; letter-spacing:0.06em;">
            Fajr<br><span style="font-size:18px;">Done</span></div>
          <div
            style="flex:1; padding:16px 8px; background:var(--black); border:1px solid var(--border); text-align:center; font-size:11px; color:var(--text-muted); letter-spacing:0.06em;">
            Dhuhr<br><span style="font-size:18px; color:var(--text);">Done</span></div>
          <div
            style="flex:1; padding:16px 8px; background:var(--black); border:1px solid var(--border); text-align:center; font-size:11px; color:var(--text-muted); letter-spacing:0.06em;">
            Asr<br><span style="font-size:18px; color:var(--text);">Done</span></div>
          <div
            style="flex:1; padding:16px 8px; background:var(--black); border:1px solid var(--border); text-align:center; font-size:11px; color:var(--text-muted); letter-spacing:0.06em;">
            Maghrib<br><span style="font-size:18px; color:var(--text-dim);">--</span></div>
          <div
            style="flex:1; padding:16px 8px; background:var(--black); border:1px solid var(--border); text-align:center; font-size:11px; color:var(--text-muted); letter-spacing:0.06em;">
            Isha<br><span style="font-size:18px; color:var(--text-dim);">--</span></div>
        </div>
        <div style="margin-top:16px; width:100%;">
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:6px; text-align:left;">30-day Fajr
            consistency</div>
          <div style="height:4px; background:var(--border); border-radius:2px; overflow:hidden;">
            <div
              style="height:100%; width:72%; background:var(--gold); border-radius:2px; animation: barGrow 1.2s ease;">
            </div>
          </div>
          <div style="font-size:11px; color:var(--gold); margin-top:4px; text-align:right;">72%</div>
        </div>
        <div
          style="padding:16px; background:var(--gold-glow); border:1px solid var(--gold-dim); margin-top:16px; width:100%;">
          <div style="font-size:13px; color:var(--text-muted); line-height:1.7;">"Your best outreach weeks always follow
            your highest prayer weeks. Fajr is not just a prayer. It is your discipline signal."</div>
        </div>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section class="pricing" id="pricing">
    <div class="pricing-inner">
      <div class="section-label">Simple Pricing</div>
      <h2 class="section-headline reveal">Less than one coffee a week.<br><em>More than any coach will give you.</em>
      </h2>

      <div class="spots-counter reveal" style="margin-top: 32px;">286 of 500 early access spots claimed. Price increases
        when all spots are gone.</div>

      <div class="pricing-grid">
        <div class="price-card reveal">
          <div class="price-tier">Starter</div>
          <div class="price-amount"><sup>$</sup>0 <span class="period">/ 7 days</span></div>
          <div class="price-desc">Full access. No card required. See the difference before you commit to anything.</div>
          <ul class="price-features">
            <li>All 13 life modules</li>
            <li>Daily logging and streaks</li>
            <li>Weekly review dashboard</li>
            <li><strong>One free AI weekly debrief</strong></li>
            <li>No credit card needed</li>
          </ul>
          <a href="#cta" class="btn-ghost" style="width:100%; text-align:center;">Start Free</a>
        </div>

        <div class="price-card featured reveal reveal-delay-1">
          <div class="price-tier">Solo</div>
          <div class="price-amount"><sup>$</sup>19<span class="period">/ month</span></div>
          <div class="price-desc">The complete system. Everything you need to track every part of your life and get the
            honest feedback that changes it.</div>
          <ul class="price-features">
            <li>Everything in Starter</li>
            <li><strong>Weekly AI debrief every Sunday</strong></li>
            <li><strong>Backsight and gap analysis</strong></li>
            <li>AI Mirror and pattern detection</li>
            <li>Fajr-discipline correlation tracking</li>
            <li>Unlimited historical data</li>
            <li>Priority support</li>
          </ul>
          <a href="#cta" class="btn-primary" style="width:100%; text-align:center;">Get Started Today</a>
          <div class="price-urgency">Early access price. Goes to £29 after 100 users</div>
        </div>

        <div class="price-card reveal reveal-delay-2">
          <div class="price-tier">Pro</div>
          <div class="price-amount"><sup>$</sup>39 <span class="period">/ month</span></div>
          <div class="price-desc">For the person who wants everything. Voice logging. Full export. Accountability
            partner
            features coming next quarter.</div>
          <ul class="price-features">
            <li>Everything in Solo</li>
            <li><strong>Voice quick-logging</strong></li>
            <li>Full data export and reports</li>
            <li>Custom module creation</li>
            <li>Early access to new features</li>
            <li>Direct founder access</li>
          </ul>
          <a href="#cta" class="btn-ghost" style="width:100%; text-align:center;">Join Elite Club</a>
          <div class="price-urgency">Lock price now and get priority access to updates and features.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- OBJECTIONS -->
  <section class="objections">
    <div class="section-label">You Are Probably Thinking</div>
    <div class="obj-item reveal">
      <div class="obj-q">"I have tried habit trackers. They never stick."</div>
      <div class="obj-a">You abandoned them because they showed you what you logged but never told you <strong>what it
          meant.</strong> Maqsad gives you insight, not just data. When the system shows you your patterns in a way that
        is genuinely uncomfortable, you do not close the app. You change the behavior.</div>
    </div>
    <div class="obj-item reveal">
      <div class="obj-q">"I do not have time to log everything daily."</div>
      <div class="obj-a">It takes 8 minutes. Likely less than the amount of time you spent this morning on your phone
        before Fajr. <strong>The question is not whether you have time. It is whether you have a reason.</strong> Once
        you see your day score drop on the days you skip, you find the reason.</div>
    </div>
    <div class="obj-item reveal">
      <div class="obj-q">"Is this just for Muslim users?"</div>
      <div class="obj-a">The faith modules are there for those who need them. <strong>The system works for any
          high-performing individual who wants total visibility over their life.</strong> The prayer tracker is
        optional. The AI
        insight and every other module works regardless of background.</div>
    </div>
    <div class="obj-item reveal">
      <div class="obj-q">"What if it does not work for me?"</div>
      <div class="obj-a">The free 30-day trial exists precisely so this question becomes irrelevant. <strong>Use the
          full system for a month with no card on file.</strong> If you do not feel the difference after one weekly AI
        debrief, do not continue. But you will continue.</div>
    </div>
  </section>

  <!-- MAIN CTA -->
  <section class="cta-section" id="cta">
    <div class="cta-bg"></div>
    <div class="section-label reveal" style="justify-content:center;">This is the moment</div>

    <h2 class="cta-headline reveal">
      The person you<br>
      are <span style="color:var(--gold); font-style:italic;">supposed to be</span><br>
      is already inside you.
    </h2>

    <p class="cta-sub reveal">
      They run on a system. They track everything. They read the honest debrief every Sunday and act on it. <strong>They
        do not guess. They do not slide. They compound.</strong>
    </p>

    <div class="spots-counter reveal">286 spots claimed. 214 remaining at founding price.</div>

    <div class="email-form reveal">
      <input type="email" class="email-input" placeholder="Your email address" id="emailInput">
      <button class="email-btn" onclick="joinWaitlist()">Start Free Today</button>
    </div>

    <div class="form-note reveal" style="margin-bottom: 40px;">No credit card. No commitment. Full access for 30 days.
    </div>

    <p class="reveal"
      style="font-size: 14px; color: var(--text-muted); max-width: 480px; margin: 0 auto; line-height: 1.8;">
      Every week you wait is a week of data you do not have. A week of patterns you cannot see. A week of gaps you could
      have closed. <strong style="color:var(--text);">The system takes 4 minutes to set up.</strong>
    </p>
  </section>

  <!-- INLINE CTA STRIP 3 -->
  <div class="cta-strip">
    <div class="cta-strip-text">Still reading? That means you know you need this.</div>
    <div class="cta-strip-sub">Those who join Maqsad are the ones who stopped waiting for the right moment and made
      one.</div>
    <a href="#cta" class="btn-dark">Join Now. Free.</a>
  </div>

  <!-- FOOTER -->
  <footer>
    <div class="footer-logo">
      <img
        src="/logo.jpeg"
        alt="Maqsad" class="footer-logo-img">
      <span>Maqsad</span>
    </div>
    <a href="https://instagram.com/maqsad.os" target="_blank" class="footer-social">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
      maqsad.os
    </a>
    <div class="footer-text">Built for those who mean it. Maqsad Life OS. 2026.</div>
    <div class="footer-text">privacy policy &nbsp; &nbsp; terms</div>
  </footer>`

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // ── Cursor ──────────────────────────────────────────────
    const cursor = document.getElementById('cursor')
    const ring   = document.getElementById('cursorRing')
    let mx = 0, my = 0, rx = 0, ry = 0
    let rafId: number

    const moveCursor = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      if (cursor) { cursor.style.left = mx - 4 + 'px'; cursor.style.top = my - 4 + 'px' }
    }
    document.addEventListener('mousemove', moveCursor)

    function animatRing() {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (ring) { ring.style.left = rx - 16 + 'px'; ring.style.top = ry - 16 + 'px' }
      rafId = requestAnimationFrame(animatRing)
    }
    animatRing()

    document.querySelectorAll('a, button, .module-item, .step, .price-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (cursor) cursor.style.transform = 'scale(2.5)'
        if (ring)   { ring.style.transform = 'scale(1.5)'; ring.style.borderColor = 'rgba(201,169,110,0.8)' }
      })
      el.addEventListener('mouseleave', () => {
        if (cursor) cursor.style.transform = 'scale(1)'
        if (ring)   { ring.style.transform = 'scale(1)';   ring.style.borderColor = 'rgba(201,169,110,0.4)' }
      })
    })

    // ── Nav scroll ──────────────────────────────────────────
    const nav = document.getElementById('nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 60)
    window.addEventListener('scroll', onScroll)

    // ── Scroll reveal ───────────────────────────────────────
    const reveals = document.querySelectorAll('.reveal, .problem-item')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    reveals.forEach(el => observer.observe(el))

    // ── Spots counter ───────────────────────────────────────
    let spots = 214
    let spotsTimer: ReturnType<typeof setTimeout>
    function decrementSpots() {
      if (spots > 190 && Math.random() > 0.7) {
        spots--
        document.querySelectorAll('.spots-counter').forEach(el => {
          el.textContent = `${500 - spots} of 500 early access spots claimed. Price increases when all spots are gone.`
        })
        const urgency = document.querySelector('.urgency-tag')
        if (urgency) urgency.innerHTML = `Only ${spots} early access spots remaining <span>out of 500</span>`
      }
      spotsTimer = setTimeout(decrementSpots, Math.random() * 25000 + 15000)
    }
    spotsTimer = setTimeout(decrementSpots, 8000)

    // ── Smooth scroll for anchor links ──────────────────────
    const smoothLinks = document.querySelectorAll('a[href^="#"]')
    const smoothScroll = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement
      const href = a.getAttribute('href')
      if (href && href.length > 1) {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    smoothLinks.forEach(a => a.addEventListener('click', smoothScroll))

    // ── Email CTA → redirect to signup ──────────────────────
    // Override the joinWaitlist function so the CTA redirects to /signup
    ;(window as any).joinWaitlist = () => {
      const input = document.getElementById('emailInput') as HTMLInputElement
      const email = input?.value?.trim() ?? ''
      if (!email || !email.includes('@')) {
        if (input) { input.style.borderColor = '#c95555'; setTimeout(() => { input.style.borderColor = '' }, 2000) }
        return
      }
      router.push(`/signup?email=${encodeURIComponent(email)}`)
    }

    const emailInput = document.getElementById('emailInput')
    const onKeyPress = (e: KeyboardEvent) => { if (e.key === 'Enter') (window as any).joinWaitlist() }
    emailInput?.addEventListener('keypress', onKeyPress)

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      document.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
      clearTimeout(spotsTimer)
      observer.disconnect()
      smoothLinks.forEach(a => a.removeEventListener('click', smoothScroll))
      emailInput?.removeEventListener('keypress', onKeyPress)
      delete (window as any).joinWaitlist
    }
  }, [router])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      {/* Google Fonts — same as the original HTML */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Barlow:wght@300;400;500;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap"
        rel="stylesheet"
      />
      <div dangerouslySetInnerHTML={{ __html: PAGE_HTML }} />
    </>
  )
}
