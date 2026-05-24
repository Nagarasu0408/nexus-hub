import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { dashboardAPI, workflowsAPI } from '../api/client';
import { Badge, HealthBar, Spinner } from '../components/UI';

function useCounter(target, dur = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setV(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return v;
}

export default function Dashboard({ onNav }) {
  const { stats, setStats, chartData, setChartData, activity, setActivity, workflows, setWorkflows } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const r1 = useCounter(stats.totalRuns || 2847);
  const r2 = useCounter(stats.active    || 127);
  const r3 = useCounter(stats.successRate || 99);
  const r4 = useCounter(stats.hoursSaved  || 1286);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, c, w] = await Promise.all([
          dashboardAPI.stats(),
          dashboardAPI.activity(),
          dashboardAPI.chart(),
          workflowsAPI.getAll({ sort: '-updatedAt' }),
        ]);
        setStats(s.data.stats);
        setActivity(a.data.activity);
        setChartData(c.data.chart);
        setWorkflows(w.data.workflows);
      } catch {
        // Use default demo data if API not connected
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tabs = ['All', 'RPA', 'iPaaS', 'BPM', 'Open Source'];
  const maxChart = Math.max(...(chartData.length ? chartData.map(d => d.count) : [127]));
  const chart = chartData.length ? chartData : [
    {date:'Mon',count:42},{date:'Tue',count:67},{date:'Wed',count:55},
    {date:'Thu',count:89},{date:'Fri',count:103},{date:'Sat',count:78},{date:'Sun',count:127}
  ];

  const DEMO_TOOLS = [
    {toolKey:'pa',name:'Power Automate',short:'PA',color:'#0078D4',flowCount:23},
    {toolKey:'ui',name:'UiPath',short:'UI',color:'#F56C2E',flowCount:15},
    {toolKey:'zp',name:'Zapier',short:'ZP',color:'#FF4A00',flowCount:42},
    {toolKey:'mk',name:'Make',short:'MK',color:'#9B59B6',flowCount:18},
    {toolKey:'n8',name:'n8n',short:'n8',color:'#EA4B71',flowCount:31},
    {toolKey:'wk',name:'Workato',short:'WK',color:'#7C3AED',flowCount:8},
  ];

  const DEMO_FLOWS = [
    {_id:'1',name:'Invoice Processing Pipeline',toolName:'UiPath',category:'RPA',status:'running',runs:1247,health:98,lastRun:new Date()},
    {_id:'2',name:'CRM Lead Sync',toolName:'Zapier',category:'iPaaS',status:'running',runs:8932,health:100,lastRun:new Date()},
    {_id:'3',name:'Employee Onboarding',toolName:'Power Automate',category:'BPM',status:'running',runs:234,health:95,lastRun:new Date()},
    {_id:'4',name:'Daily Report Generation',toolName:'n8n',category:'Open Source',status:'scheduled',runs:180,health:100,lastRun:new Date()},
    {_id:'5',name:'Order Fulfillment Bot',toolName:'Make',category:'iPaaS',status:'warning',runs:3421,health:78,lastRun:new Date()},
  ];

  const DEMO_ACTIVITY = [
    {_id:1,message:'Invoice Processing completed run #1,247',tool:'UiPath',type:'success',createdAt:new Date()},
    {_id:2,message:'CRM Lead Sync transferred 14 new leads',tool:'Zapier',type:'success',createdAt:new Date(Date.now()-120000)},
    {_id:3,message:'Order Fulfillment — API rate limit warning',tool:'Make',type:'warning',createdAt:new Date(Date.now()-480000)},
    {_id:4,message:'Social Media Analytics: 2,341 rows exported',tool:'Workato',type:'success',createdAt:new Date(Date.now()-900000)},
    {_id:5,message:'Employee Onboarding: 3 accounts provisioned',tool:'Power Automate',type:'success',createdAt:new Date(Date.now()-3600000)},
    {_id:6,message:'Daily Report emailed to 12 stakeholders',tool:'n8n',type:'info',createdAt:new Date(Date.now()-7200000)},
  ];

  const displayFlows = workflows.length ? workflows.slice(0,5) : DEMO_FLOWS;
  const displayActivity = activity.length ? activity : DEMO_ACTIVITY;

  const timeAgo = (date) => {
    const sec = Math.floor((Date.now() - new Date(date)) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
    return `${Math.floor(sec/86400)}d ago`;
  };

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab-btn${activeTab===t?' active':''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          {label:'Total Runs Today', val:r1.toLocaleString(), delta:'▲ 12% vs yesterday', dc:'delta-up', ac:'var(--cyan)'},
          {label:'Active Workflows',  val:r2, delta:'▲ 3 new this week', dc:'delta-up', ac:'var(--green)'},
          {label:'Success Rate', val:r3, suf:'%', delta:'⚠ 1 flow degraded', dc:'delta-warn', ac:'var(--amber)'},
          {label:'Hours Saved / Month', val:r4, suf:'h', delta:'▲ 234h vs last month', dc:'delta-up', ac:'var(--purple)'},
        ].map((s, i) => (
          <div key={i} className={`stat-card fade-up-${i+1}`} style={{'--accent':s.ac}}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-val">{s.val}<small>{s.suf}</small></div>
            <div className={`stat-delta ${s.dc}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Connected tools */}
      <div className="section-hdr">
        <div className="section-title">Connected Tool Ecosystem</div>
        <button className="section-link" onClick={() => onNav('tools')}>Manage all tools →</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:18}}>
        {DEMO_TOOLS.map(t => (
          <div key={t.toolKey} style={{background:'var(--s2)',border:'1px solid var(--b1)',borderRadius:10,padding:'11px 8px',textAlign:'center',cursor:'pointer',transition:'.2s'}}
            onClick={() => onNav('tools')}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--b1)';e.currentTarget.style.transform='none'}}>
            <div style={{fontSize:7,color:'var(--t3)',textAlign:'right',marginBottom:2,fontFamily:'var(--mono)'}}>{t.flowCount}</div>
            <div style={{width:36,height:36,borderRadius:8,background:t.color,margin:'0 auto 7px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',fontFamily:'var(--mono)'}}>{t.short}</div>
            <div style={{fontSize:9,fontWeight:700,color:'var(--t1)',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</div>
            <div style={{fontSize:8,color:'var(--green)',display:'flex',alignItems:'center',justifyContent:'center',gap:2}}>
              <span style={{width:5,height:5,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}/>Active
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: workflows + activity */}
      <div className="grid-auto">
        <div>
          <div className="section-hdr">
            <div className="section-title">Active Workflows</div>
            <button className="section-link" onClick={() => onNav('flows')}>View all →</button>
          </div>
          <div className="card card-pad" style={{marginBottom:14}}>
            <table className="data-table">
              <thead><tr><th>Workflow</th><th>Status</th><th>Runs</th><th>Health</th><th>Last Run</th></tr></thead>
              <tbody>
                {displayFlows.map(w => (
                  <tr key={w._id} onClick={() => onNav('flows')}>
                    <td>
                      <div style={{fontWeight:700,fontSize:11}}>{w.name}</div>
                      <div style={{fontSize:9,color:'var(--t3)'}}>{w.toolName} · {w.category}</div>
                    </td>
                    <td><Badge status={w.status}/></td>
                    <td><span className="mono" style={{fontSize:11,color:'var(--t2)'}}>{(w.runs||0).toLocaleString()}</span></td>
                    <td><HealthBar pct={w.health||100}/></td>
                    <td><span style={{fontSize:10,color:'var(--t3)'}}>{timeAgo(w.lastRun||new Date())}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="card card-pad">
            <div className="section-hdr" style={{marginBottom:10}}>
              <div className="section-title">Runs — Last 7 Days</div>
              <span style={{fontSize:11,color:'var(--t3)'}}>Total: {chart.reduce((a,b)=>a+b.count,0)}</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 420 80">
              {chart.map((d,i) => {
                const bh = Math.max(4, (d.count/maxChart)*62);
                const x  = i*57 + 8;
                const isLast = i === chart.length - 1;
                return (
                  <g key={i}>
                    <rect x={x} y={72-bh} width={42} height={bh} rx={4}
                      fill={isLast ? 'var(--cyan)' : 'var(--b1)'} opacity={isLast?1:.8}/>
                    <text x={x+21} y={79} textAnchor="middle" fontSize={8} fill="var(--t3)">{d.date}</text>
                    <text x={x+21} y={70-bh} textAnchor="middle" fontSize={8} fill={isLast?'var(--cyan)':'var(--t2)'}>{d.count}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <div className="section-hdr">
            <div className="section-title">Live Activity</div>
            <div className="live-badge"><div className="live-dot"/>LIVE</div>
          </div>
          <div className="card card-pad">
            {displayActivity.slice(0,8).map((a,i) => (
              <div key={a._id||i} className="feed-item">
                <div className="feed-dot" style={{background: a.type==='success'?'var(--green)':a.type==='warning'?'var(--amber)':a.type==='error'?'var(--red)':'var(--blue)'}}/>
                <div>
                  <div className="feed-msg">{a.message}</div>
                  <div className="feed-meta">
                    <span>{timeAgo(a.createdAt)}</span>
                    <span style={{color:'var(--t2)'}}>{a.tool||a.toolKey}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
