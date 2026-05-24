import useStore from '../store/useStore';

const NAV = [
  { id: 'dash',    icon: '⬡',  label: 'Dashboard' },
  { id: 'tools',   icon: '⚙',  label: 'Tool Hub' },
  { id: 'flows',   icon: '⚡',  label: 'Workflows' },
  { id: 'builder', icon: '◈',  label: 'Builder' },
  { id: 'ai',      icon: '✦',  label: 'AI Assist' },
  { id: 'analytics',icon: '📊', label: 'Analytics' },
];

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useStore();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'NG';

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">NXS</div>

      {NAV.map((n) => (
        <button
          key={n.id}
          className={`nav-btn${page === n.id ? ' active' : ''}`}
          title={n.label}
          onClick={() => setPage(n.id)}
        >
          {n.icon}
        </button>
      ))}

      <button className="nav-btn" title="Notifications" style={{ marginTop: 6, position: 'relative' }}>
        🔔
        <div className="notif-dot" />
      </button>

      <div className="sidebar-bottom">
        <button className="nav-btn btn-ghost" title="Settings" onClick={() => setPage('settings')} style={{ fontSize: 14 }}>
          ⚙
        </button>
        <div
          className="user-avatar"
          title={`${user?.name || 'User'} — Click to logout`}
          onClick={() => { if (window.confirm('Logout?')) logout(); }}
        >
          {initials}
        </div>
      </div>
    </nav>
  );
}
