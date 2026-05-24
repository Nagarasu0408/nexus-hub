import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { toolsAPI } from '../api/client';

const TOOL_CATALOG = [
  {id:'pa',name:'Power Automate',short:'PA',color:'#0078D4',cat:'Microsoft',desc:'Microsoft cloud automation, 500+ connectors',flows:0},
  {id:'ui',name:'UiPath',short:'UI',color:'#F56C2E',cat:'RPA',desc:'Enterprise-grade robotic process automation',flows:0},
  {id:'zp',name:'Zapier',short:'ZP',color:'#FF4A00',cat:'iPaaS',desc:'Connect 6,000+ apps without code',flows:0},
  {id:'mk',name:'Make',short:'MK',color:'#9B59B6',cat:'iPaaS',desc:'Visual automation with advanced logic',flows:0},
  {id:'n8',name:'n8n',short:'n8',color:'#EA4B71',cat:'Open Source',desc:'Fair-code self-hosted workflow automation',flows:0},
  {id:'wk',name:'Workato',short:'WK',color:'#7C3AED',cat:'iPaaS',desc:'Enterprise integration & automation',flows:0},
  {id:'aa',name:'Auto Anywhere',short:'AA',color:'#FF6B35',cat:'RPA',desc:'Intelligent automation with AI + RPA',flows:0},
  {id:'bp',name:'Blue Prism',short:'BP',color:'#1E88E5',cat:'RPA',desc:'Intelligent digital workforce platform',flows:0},
  {id:'sn',name:'ServiceNow',short:'SN',color:'#81C784',cat:'ITSM',desc:'Digital workflow automation for IT ops',flows:0},
  {id:'tr',name:'Tray.io',short:'TR',color:'#0EA5E9',cat:'iPaaS',desc:'General automation with API integration',flows:0},
  {id:'pg',name:'Pega',short:'PG',color:'#C2410C',cat:'BPM',desc:'Business process management & decisioning',flows:0},
  {id:'wf',name:'WorkFusion',short:'WF',color:'#06B6D4',cat:'RPA',desc:'AI-powered intelligent automation',flows:0},
];

export default function ToolHub() {
  const { tools, setTools, showToast, updateToolStatus } = useStore();
  const [cat, setCat] = useState('All');
  const [toolStates, setToolStates] = useState({});

  const cats = ['All','RPA','iPaaS','Microsoft','Open Source','ITSM','BPM'];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await toolsAPI.getAll();
        setTools(res.data.tools);
        const states = {};
        res.data.tools.forEach(t => { states[t.toolKey] = t.status; });
        setToolStates(states);
      } catch {
        // Demo mode - init with all tools inactive
        const states = {};
        TOOL_CATALOG.slice(0,6).forEach(t => { states[t.id] = 'connected'; });
        TOOL_CATALOG.slice(6).forEach(t => { states[t.id] = 'inactive'; });
        setToolStates(states);
      }
    };
    load();
  }, []);

  const filtered = cat === 'All' ? TOOL_CATALOG : TOOL_CATALOG.filter(t => t.cat === cat);
  const connCount = Object.values(toolStates).filter(s => s === 'connected').length;

  const toggleTool = async (toolKey, currentStatus) => {
    const newStatus = currentStatus === 'connected' ? 'inactive' : currentStatus === 'inactive' ? 'pending' : 'connected';
    setToolStates(prev => ({ ...prev, [toolKey]: newStatus }));

    try {
      if (currentStatus === 'connected') {
        await toolsAPI.disconnect(toolKey);
        showToast('🔌 Tool disconnected', 'warn');
      } else {
        await toolsAPI.connect(toolKey);
        showToast('✓ Tool connected!', 'success');
        setToolStates(prev => ({ ...prev, [toolKey]: 'connected' }));
      }
    } catch (err) {
      showToast('Connection failed', 'error');
      setToolStates(prev => ({ ...prev, [toolKey]: currentStatus }));
    }
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>Automation Tool Hub</div>
          <div style={{fontSize:12,color:'var(--t3)'}}>
            <span style={{color:'var(--green)',fontWeight:700}}>{connCount}</span> connected ·
            <span style={{marginLeft:6}}>{TOOL_CATALOG.length - connCount} available to connect</span>
          </div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <span style={{padding:'4px 12px',borderRadius:20,background:'rgba(16,185,129,.1)',color:'var(--green)',fontSize:10,fontWeight:800,border:'1px solid rgba(16,185,129,.2)'}}>
            {connCount} Active
          </span>
          <span style={{padding:'4px 12px',borderRadius:20,background:'rgba(78,96,128,.08)',color:'var(--t3)',fontSize:10,fontWeight:800,border:'1px solid var(--b1)'}}>
            {TOOL_CATALOG.length - connCount} Inactive
          </span>
        </div>
      </div>

      {/* Category filter */}
      <div className="cat-filter">
        {cats.map(c => (
          <button key={c} className={`cat-btn${cat===c?' active':''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* Tool grid */}
      <div className="tool-grid">
        {filtered.map(t => {
          const st = toolStates[t.id] || 'inactive';
          const btnCfg = {
            connected: {cls:'cb-connected',txt:'✓ Connected'},
            inactive: {cls:'cb-inactive',txt:'+ Connect'},
            pending: {cls:'cb-pending',txt:'⏳ Connecting...'},
          };
          const btn = btnCfg[st];
          return (
            <div key={t.id} className="tool-card" style={{'--card-color':t.color,'--card-glow':`${t.color}55`}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                <div className="tool-icon" style={{background:t.color}}>{t.short}</div>
                <span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 8px',borderRadius:10,fontSize:8,fontWeight:800,textTransform:'uppercase',background:st==='connected'?'rgba(16,185,129,.12)':st==='pending'?'rgba(245,158,11,.1)':'rgba(78,96,128,.08)',color:st==='connected'?'var(--green)':st==='pending'?'var(--amber)':'var(--t3)'}}>
                  <span style={{width:5,height:5,borderRadius:'50%',background:'currentColor'}}/>
                  {st==='connected'?'● Connected':st==='pending'?'◌ Pending':'○ Inactive'}
                </span>
              </div>
              <div className="tool-name">{t.name}</div>
              <div className="tool-cat">{t.cat}</div>
              <div className="tool-desc">{t.desc}</div>
              {st==='connected' && <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--t3)',marginBottom:10}}>{t.flows||0} active flows</div>}
              <button className={`connect-btn ${btn.cls}`} onClick={() => toggleTool(t.id, st)} disabled={st==='pending'}>
                {btn.txt}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
