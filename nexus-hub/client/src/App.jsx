import { useEffect, useState } from 'react';
import useStore from './store/useStore';
import { authAPI } from './api/client';
import { useSocket } from './hooks/useSocket';
import Sidebar from './components/Sidebar';
import { Header, Toast } from './components/UI';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ToolHub from './pages/ToolHub';
import Workflows from './pages/Workflows';
import Builder from './pages/Builder';
import AIAssist from './pages/AIAssist';
import './styles/globals.css';

export default function App() {
  const { user, token, setAuth, logout, showToast } = useStore();
  const [page, setPage] = useState('dash');
  const [loading, setLoading] = useState(true);

  // Initialize socket connection
  useSocket();

  // Load user on mount
  useEffect(() => {
    const load = async () => {
      if (token) {
        try {
          const res = await authAPI.me();
          setAuth(res.data.user, token);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const onNew = () => {
    showToast('✓ Workflow creation dialog opened!');
    setPage('builder');
  };

  const onNav = (p) => setPage(p);

  // Show login page if not authenticated
  if (!token) return <Login />;

  // Show loading screen
  if (loading) {
    return (
      <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:32,fontWeight:800,color:'var(--cyan)',marginBottom:20,animation:'glow 3s ease-in-out infinite'}}>NEXUS</div>
          <div style={{width:40,height:40,border:'3px solid var(--b1)',borderTopColor:'var(--cyan)',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto'}}/>
          <div style={{marginTop:20,fontSize:12,color:'var(--t3)'}}>Loading dashboard...</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes glow{0%,100%{text-shadow:0 0 10px rgba(0,212,255,.5)}50%{text-shadow:0 0 26px rgba(0,212,255,1)}}`}</style>
      </div>
    );
  }

  // Render authenticated app
  return (
    <div className="app hex-bg">
      <Sidebar page={page} setPage={setPage} />
      <div className="main-area">
        <Header page={page} onNew={onNew} />
        <div className="page-content">
          {page === 'dash'      && <Dashboard onNav={onNav} />}
          {page === 'tools'     && <ToolHub />}
          {page === 'flows'     && <Workflows />}
          {page === 'builder'   && <Builder />}
          {page === 'ai'        && <AIAssist />}
          {page === 'analytics' && <div style={{fontSize:14,color:'var(--t2)'}}>📊 Analytics page — coming soon</div>}
          {page === 'settings'  && <div style={{fontSize:14,color:'var(--t2)'}}>⚙ Settings page — coming soon</div>}
        </div>
      </div>
      <Toast />
    </div>
  );
}
