import { useEffect, useState } from 'react';
import useStore from '../store/useStore';

const PAGE_TITLES = {
  dash:      <>Dashboard — <em>Overview</em></>,
  tools:     <>Tool Hub — <em>12 Integrations</em></>,
  flows:     <>Workflows — <em>All Automations</em></>,
  builder:   <>Workflow Builder — <em>Visual Editor</em></>,
  ai:        <>AI Assistant — <em>Generate Automations</em></>,
  analytics: <>Analytics — <em>Performance Insights</em></>,
  settings:  <>Settings — <em>Account & Preferences</em></>,
};

export function Header({ page, onNew }) {
  const { user } = useStore();
  return (
    <header className="header">
      <div className="header-title">{PAGE_TITLES[page] || PAGE_TITLES.dash}</div>
      <div className="search-box">
        <span style={{ color: 'var(--t3)', fontSize: 13 }}>🔍</span>
        <input placeholder="Search workflows, tools..." />
      </div>
      <button className="btn btn-ghost btn-sm">📊 Analytics</button>
      <button className="btn btn-primary" onClick={onNew}>
        + New Workflow
      </button>
    </header>
  );
}

export function Toast() {
  const { toast } = useStore();
  return (
    <div className={`toast${toast ? ' visible' : ''}${toast?.type === 'warn' ? ' warn' : ''}${toast?.type === 'error' ? ' error' : ''}`}>
      {toast?.msg}
    </div>
  );
}

// ── Reusable UI helpers ────────────────────────────────────
export function Badge({ status }) {
  const map = {
    running:   { cls: 'badge-run',  dot: true,  txt: 'Running' },
    scheduled: { cls: 'badge-sch',  dot: false, txt: 'Scheduled' },
    warning:   { cls: 'badge-warn', dot: false, txt: '⚠ Warning' },
    paused:    { cls: 'badge-pau',  dot: false, txt: 'Paused' },
    stopped:   { cls: 'badge-pau',  dot: false, txt: 'Stopped' },
  };
  const { cls, dot, txt } = map[status] || map.paused;
  return (
    <span className={`badge ${cls}`}>
      {dot && <span className="blink" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />}
      {txt}
    </span>
  );
}

export function HealthBar({ pct }) {
  const color = pct >= 95 ? 'var(--green)' : pct >= 80 ? 'var(--amber)' : 'var(--red)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <div className="hbar"><div className="hfill" style={{ width: `${pct}%`, background: color }} /></div>
      <span style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{pct}%</span>
    </span>
  );
}

export function Modal({ title, sub, onClose, children, footer }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{title}</div>
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
        {footer && <><hr className="divider"/>{footer}</>}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--b2)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
