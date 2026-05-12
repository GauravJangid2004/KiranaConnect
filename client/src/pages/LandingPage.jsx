import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ShieldCheck, Zap, PackageSearch, Clock,
  CheckCircle, XCircle,
  Truck, BarChart3, Bell, Lock, Database, ShoppingCart, ClipboardCheck
} from "lucide-react";
import "./LandingPage.css";

import logoImg from "@assets/logo.jpg";
import onlineStoreImg from "@assets/online-store.jpg";
import mobileDeliveryImg from "@assets/mobile-delivery.jpg";
import fruitBasketImg from "@assets/fruit-basket.jpg";
import handshakeImg from "@assets/handshake.jpg";
import warehouseSupplyImg from "@assets/warehouse-supply.jpg";
import b2bPortalImg from "@assets/b2b-portal.jpg";
import workersImg from "@assets/workers.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const stats = [
  { value: '500+', label: 'Wholesalers' },
  { value: '6h', label: 'Dispatch Cycle' },
  { value: '99.9%', label: 'Order Accuracy' },
];

const features = [
  {
    icon: Zap,
    title: 'Live Wholesale Prices',
    description: 'Tiered slab pricing auto-applies for verified kirana buyers.',
  },
  {
    icon: PackageSearch,
    title: 'Real-Time Catalogue',
    description: 'Redis-cached product discovery with performance built for scale.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    description: 'JWT-based dual-role sign in for shop owners and wholesalers.',
  },
  {
    icon: Truck,
    title: 'Automated Dispatch',
    description: 'Batch ordering workflows build the next shipment window.',
  },
  {
    icon: Bell,
    title: 'Live Alerts',
    description: 'Notifications keep buyers and distributors synchronized.',
  },
  {
    icon: BarChart3,
    title: 'Performance Insights',
    description: 'Operational data surfaced for inventory and orders.',
  },
];

const gallery = [
  { src: onlineStoreImg, label: 'Digital Ordering' },
  { src: mobileDeliveryImg, label: 'Mobile Delivery' },
  { src: fruitBasketImg, label: 'Fresh Produce' },
  { src: b2bPortalImg, label: 'B2B Portal' },
];

const workflowSteps = [
  { number: '01', icon: Lock, title: 'Login & Role Check', text: 'Secure JWT authentication identifies each buyer or wholesaler before they enter the workspace.', accent: '#60A5FA' },
  { number: '02', icon: Database, title: 'Browse Wholesale Catalogue', text: 'Redis-cached product listings surface availability, slabs, and buyer-specific rates quickly.', accent: '#34D399' },
  { number: '03', icon: ShoppingCart, title: 'Place Optimized Order', text: 'Cart validation checks minimum quantities, inventory rules, and order readiness before checkout.', accent: '#A78BFA' },
  { number: '04', icon: ClipboardCheck, title: 'Atomic Stock Validation', text: 'Backend stock updates protect inventory from double selling under concurrent demand.', accent: '#FB923C' },
  { number: '05', icon: Bell, title: 'Wholesaler Alert', text: 'Live order events notify the distributor dashboard the moment a store confirms demand.', accent: '#F472B6' },
  { number: '06', icon: Truck, title: 'Batch Dispatch', text: 'Orders move into the next dispatch window with delivery-ready manifests and tracking context.', accent: '#22D3EE' },
];

function ActionButton({ variant = 'primary', children, title, ...props }) {
  const computedTitle =
    title ??
    (typeof children === "string" ? children : "Action");

  return (
    <button
      type="button"
      title={computedTitle}
      aria-label={computedTitle}
      className={`landing-btn ${variant === 'outline' ? 'landing-btn-outline' : 'landing-btn-primary'}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function LandingPage({ onGetStarted, onLogin }) {
  const hasLogin = typeof onLogin === 'function';

  const marqueeItems = useMemo(
    () => [
      'JWT Authentication',
      'Redis Caching',
      'Atomic Stock Control',
      'Socket.io Real-Time',
      'Dispatch Automation',
      'MongoDB Aggregation',
      'Role-Based Access',
      'Batch Processing',
    ],
    []
  );

  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">
            <img src={logoImg} alt="KiranaConnect" className="landing-logo" />
            <div>
              <span className="landing-title">Kirana<span>Connect</span></span>
            </div>
          </div>

          <nav className="landing-nav">
            <a href="#problem">Problem</a>
            <a href="#features">Features</a>
            <a href="#workflow">How It Works</a>
            <a href="#tech">Tech Stack</a>
            <a href="#team">Team</a>
          </nav>

          <div className="landing-actions">
            {hasLogin && (
              <button type="button" className="landing-link" onClick={onLogin}>
                Log in
              </button>
            )}
            <ActionButton onClick={onGetStarted}>
              Get Started <ArrowRight className="landing-icon" />
            </ActionButton>
          </div>
        </div>
      </header>

      <main className="landing-main">
        {/* HERO */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="landing-badge">
              <span className="landing-badge-dot" />
              Hyperlocal B2B Wholesale Platform
            </motion.div>
            <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp} className="landing-hero-title">
              Connect Kirana Stores with Wholesalers - <span>Instantly.</span>
            </motion.h1>
            <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp} className="landing-hero-text">
              KiranaConnect digitizes the wholesale flow from secure authentication and product discovery to order batching and live fulfilment tracking.
            </motion.p>
            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="landing-hero-buttons">
              <ActionButton onClick={onGetStarted}>Open Platform <ArrowRight className="landing-icon" /></ActionButton>
              <ActionButton variant="outline">View Documentation</ActionButton>
            </motion.div>
            <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="landing-stats-row">
              {stats.map((stat) => (
                <div key={stat.label} className="landing-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

            <div className="landing-hero-image-wrapper">
            <img src={workersImg} alt="Warehouse fulfillment" className="landing-hero-image" loading="eager" />
            <div className="landing-hero-overlay" />
            <div className="landing-hero-cards">
              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="landing-info-card card-glow">
                <BarChart3 className="landing-card-icon" />
                <div>
                  <p>Redis Cache</p>
                  <strong>98.2% hit rate</strong>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.85 }} className="landing-info-card card-glow secondary">
                <Truck className="landing-card-icon" />
                <div>
                  <p>Dispatch Window</p>
                  <strong>Next in 6 hours</strong>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }} className="landing-info-card card-glow tertiary">
                <Bell className="landing-card-icon" />
                <div>
                  <p>Live Notifications</p>
                  <strong>Realtime updates</strong>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="landing-marquee">
          <div className="landing-marquee-track">
            {Array(3).fill(marqueeItems).flat().map((item, idx) => (
              <span key={`${item}-${idx}`} className="landing-marquee-item">
                <span className="landing-marquee-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <section id="problem" className="landing-section landing-white">
          <div className="landing-section-inner">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="landing-section-heading">
              <p className="landing-section-label">The Challenge</p>
              <h2>Traditional wholesale is stuck in 1995</h2>
              <p>Phone calls, WhatsApp threads and guesswork - KiranaConnect replaces the chaos with precision.</p>
            </motion.div>

            <div className="landing-problem-grid">
              <motion.article initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="landing-card landing-card-alt red">
                <div className="landing-card-top">
                  <img src={mobileDeliveryImg} alt="Old process" className="landing-card-image" />
                  <div className="landing-card-badge red">The Old Way</div>
                </div>
                <div className="landing-card-body">
                  {[
                    'Phone calls and WhatsApp messages lost in noise',
                    'Manual inventory tracking leads to frequent stockouts',
                    'Unpredictable delivery and middlemen overhead',
                    'No real-time visibility into availability',
                  ].map((text) => (
                    <div key={text} className="landing-list-item">
                      <XCircle className="landing-list-icon" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </motion.article>

              <motion.article initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="landing-card landing-card-alt green">
                <div className="landing-card-top">
                  <img src={onlineStoreImg} alt="Modern marketplace" className="landing-card-image" />
                  <div className="landing-card-badge green">The KiranaConnect Way</div>
                </div>
                <div className="landing-card-body">
                  {[
                    'Instant ordering directly from verified wholesalers',
                    'Atomic stock management with no oversells',
                    'Predictable 6-hour dispatch windows',
                    'Redis performance for catalogue speed',
                  ].map((text) => (
                    <div key={text} className="landing-list-item">
                      <CheckCircle className="landing-list-icon" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section dark-bg">
          <div className="landing-section-inner">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="landing-section-heading text-white">
              <p className="landing-section-label accent">Platform Features</p>
              <h2>Precision engineered for hyperlocal B2B scale</h2>
            </motion.div>

            <div className="landing-feature-grid">
              {features.map((feature, index) => (
                <motion.div key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index} variants={fadeUp} className="landing-feature-card">
                  <feature.icon className="landing-feature-icon" />
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="landing-tech-row">
              <div>
                <p className="landing-section-label accent">Built for the Real World</p>
                <h3>Supporting warehouses of every scale.</h3>
              </div>
              <ActionButton onClick={onGetStarted}>Explore Features <ArrowRight className="landing-icon" /></ActionButton>
            </div>
          </div>
        </section>

        <section id="workflow" className="landing-section workflow-section">
          <div className="landing-section-inner">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="landing-section-heading workflow-heading">
              <p className="landing-section-label accent">End-to-End Flow</p>
              <h2 className="workflow-title">From app open to doorstep delivery — every step engineered for precision and reliability.</h2>
              <p>Designed as an operational pipeline with clear checkpoints and real commerce imagery.</p>
            </motion.div>

            <div className="workflow-layout">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="workflow-visual">
                <img src={warehouseSupplyImg} alt="Wholesale dispatch workflow" loading="lazy" />
              </motion.div>

              <div className="workflow-list">
                {workflowSteps.map((step, index) => (
                  <motion.article
                    key={step.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={index * 0.2}
                    variants={fadeUp}
                    className="workflow-step"
                    style={{ '--step-accent': step.accent }}
                  >
                    <div className="workflow-step-rail">
                      <span>{step.number}</span>
                      <div><step.icon /></div>
                    </div>
                    <div className="workflow-step-content">
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="workflow-image-strip">
              <div>
                <img src={onlineStoreImg} alt="Digital ordering interface" />
                <span>Digital ordering</span>
              </div>
              <div>
                <img src={handshakeImg} alt="Wholesaler buyer agreement" />
                <span>Verified partners</span>
              </div>
              <div>
                <img src={mobileDeliveryImg} alt="Mobile delivery coordination" />
                <span>Mobile delivery</span>
              </div>
            </div>
          </div>
        </section>

        <section id="tech" className="landing-section tech-section">
          <div className="landing-section-inner">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="landing-section-heading text-white">
              <p className="landing-section-label accent">Engineering Stack</p>
              <h2>Built on a practical MERN foundation for real-time wholesale operations.</h2>
            </motion.div>
            <div className="tech-grid">
              {[
                { title: 'Frontend Workspace', image: onlineStoreImg, text: 'React, Vite, and motion-led interfaces for fast catalogue and order flows.' },
                { title: 'Backend Control', image: warehouseSupplyImg, text: 'Node and Express routes coordinate auth, protected roles, and order lifecycle APIs.' },
                { title: 'Secure Sessions', image: b2bPortalImg, text: 'JWT sessions and bcrypt hashing keep shop owner and wholesaler access separated.' },
              ].map((item, index) => (
                <motion.article key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index} variants={fadeUp} className="tech-card">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <img src={handshakeImg} alt="Wholesale partnership" />
          <div className="landing-cta-content">
            <h2>Ready to digitize your wholesale operations?</h2>
            <p>Bring stores, wholesalers, orders, and dispatch updates into one connected workflow.</p>
            <ActionButton onClick={onGetStarted}>Create Account <ArrowRight className="landing-icon" /></ActionButton>
          </div>
        </section>

        <section id="team" className="landing-section landing-team">
          <div className="landing-section-inner">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="landing-section-heading landing-team-heading"
            >
              <p className="landing-section-label">Built By</p>
              <h2>The Engineering Team</h2>
              <p>Four engineers. Four critical domains. One platform.</p>
            </motion.div>

            <div className="landing-team-grid">
              {[
                { role: 'Auth & JWT', domain: 'Authentication Systems', icon: Lock, accent: '#3B82F6', from: '#DBEAFE', to: '#EFF6FF' },
                { role: 'Redis & Catalogue', domain: 'Database Optimization', icon: Zap, accent: '#F59E0B', from: '#FEF3C7', to: '#FFFBEB' },
                { role: 'Orders & Stock', domain: 'Backend Architecture', icon: PackageSearch, accent: '#059669', from: '#D1FAE5', to: '#ECFDF5' },
                { role: 'Batching & Realtime', domain: 'Distributed Commerce', icon: Bell, accent: '#EF4444', from: '#FEE2E2', to: '#FFF5F5' },
              ].map((m, i) => (
                <motion.div
                  key={m.role}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i * 0.5}
                  variants={fadeUp}
                  className="landing-team-card"
                >
                  <div className="landing-team-top" style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}>
                    <div className="landing-team-icon" style={{ background: `${m.accent}20`, border: `1.5px solid ${m.accent}30` }}>
                      <m.icon className="landing-team-icon-svg" style={{ color: m.accent }} />
                    </div>
                  </div>

                  <div className="landing-team-body">
                    <p className="landing-team-member">Member {i + 1}</p>
                    <h3 className="landing-team-role">{m.role}</h3>
                    <p className="landing-team-domain">{m.domain}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section gallery-section">
          <div className="landing-gallery-grid">
            {gallery.map((item) => (
              <div key={item.label} className="landing-gallery-card">
                <img src={item.src} alt={item.label} className="landing-gallery-image" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <p className="landing-footer-brand">Kirana<span className="landing-footer-accent">Connect</span></p>
            <p>Hyperlocal B2B Wholesale Platform</p>
          </div>
          <div className="landing-footer-badges">
            <span>Built for MERN</span>
            <span>Real-time Sync</span>
            <span>Atomic Stock</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

