import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { workflowsAPI } from '../api/client';
import { Badge, HealthBar, Modal } from '../components/UI';

export default function Workflows() {
  const { workflows, setWorkflows, showToast } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [selWf, setSelWf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await workflowsAPI.getAll({ status: status !== 'all' ? status : undefined, search: q || undefined });
        setWorkflows(res.data.workflows);
      } catch {
        // Demo data
        const demo = [
          {_id:'1',name:'Invoice Processing Pipeline',toolName:'UiPath',category:'RPA',status:'running',runs:1247,health:98,trigger:'Cron: Every 1hr',description:'Extracts invoice data via OCR, validates fields, pushes to SAP'},
          {_id:'2',name:'CRM Lead Sync',toolName:'Zapier',category:'iPaaS',status:'running',runs:8932,health:100,trigger:'Webhook: HubSpot',description:'Syncs new HubSpot leads to Salesforce'},
          {_id:'3',name:'Employee Onboarding',toolName:'Power Automate',category:'BPM',status:'running',runs:234,health:95,trigger:'Manual / HR',description:'Creates AD accounts, sends welcome emails'},
          {_id:'4',name:'Daily Report Generation',toolName:'n8n',category:'Open Source',status:'scheduled',runs:180,health:100,trigger:'Cron: 08:00 UTC',description:'Aggregates KPI data, generates PDF'},
          {_id:'5',name:'Order Fulfillment Bot',toolName:'Make',category:'iPaaS',status:'warning',runs:3421,health:78,trigger:'Webhook: Shopify',description:'Processes orders, updates inventory'},
          {_id:'6',name:'Social Media Analytics',toolName:'Workato',category:'iPaaS',status:'running',runs:567,health:100,trigger:'Cron: Every 6hr',description:'Pulls engagement data across platforms'},
        ];
        setWorkflows(demo);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, q]);

  const statuses = ['all','running','scheduled','warning','paused','stopped'];
  const filtered = workflows.filter(w => {
    if (q && !w.name.toLowerCase().includes(q.toLowerCase()) && !w.toolName.toLowerCase().includes(q.toLowerCase())) return false;
    if (status !== 'all' && w.status !== status) return false;
    return true;
  });

  const handleToggle = async (id) => {
    try {
      await workflowsAPI.toggle(id);
      setWorkflows(prev => prev.map(w => w._id === id ? {...w, status: w.status === 'running' ? 'paused' : 'running'} : w));
      showToast('✓ Workflow updated');
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workflow?')) return;
    try {
      await workflowsAPI.delete(id);
      setWorkflows(prev => prev.filter(w => w._id !== id));
      showToast('✓ Workflow deleted');
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleExecute = async (id) => {
    try {
      await workflowsAPI.execute(id);
      showToast('▶ Workflow triggered!');
    } catch (err) {
      showToast('Execution failed', 'error');
    }
  };

  const timeAgo = (date) => {
    if (!date) return '—';
    const sec = Math.floor((Date.now() - new Date(date)) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
    return `${Math.floor(sec/86400)}d ago`;
  };

  return (
    <div>
      {/* Filter row */}
      <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
        <div className="wf-srch" style={{maxWidth:280}}>
          <span style={{color:'var(--t3)',fontSize:13}}>🔍</span>
          <input placeholder="Search by name or tool..." value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        {statuses.map(s => (
          <button key={s} className={`flt-btn${status===s?' on':''}`} onClick={() => setStatus(s)}>
            {s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <div style={{marginLeft:'auto',fontSize:11,color:'var(--t3)'}}>{filtered.length} workflows</div>
      </div>

      {/* Table */}
      <div className="card card-pad">
        <table className="data-table" style={{width:'100%'}}>
          <thead>
            <tr>
              <th>#</th><th>Workflow</th><th>Tool</th><th>Category</th><th>Status</th>
              <th>Runs</th><th>Health</th><th>Trigger</th><th>Last Run</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w, i) => (
              <tr key={w._id} onClick={() => setSelWf(w)}>
                <td><span className="mono" style={{fontSize:9,color:'var(--t3)'}}>{String(i+1).padStart(2,'0')}</span></td>
                <td>
                  <div style={{fontWeight:700,fontSize:11}}>{w.name}</div>
                  <div style={{fontSize:9,color:'var(--t3)'}}>...{w.description?.substring(0,40)}</div>
                </td>
                <td><span style={{fontSize:10,color:'var(--t2)'}}>{w.toolName}</span></td>
                <td><span style={{fontSize:10,color:'var(--t3)'}}>{w.category}</span></td>
                <td><Badge status={w.status}/></td>
                <td><span className="mono" style={{fontSize:11,color:'var(--t2)'}}>{(w.runs||0).toLocaleString()}</span></td>
                <td><HealthBar pct={w.health||100}/></td>
                <td><span style={{fontSize:9,color:'var(--t3)',maxWidth:120,display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{w.trigger}</span></td>
                <td><span style={{fontSize:10,color:'var(--t3)'}}>{timeAgo(w.lastRun)}</span></td>
                <td style={{paddingRight:0}}>
                  <div style={{display:'flex',gap:4,opacity:0,transition:'.15s',':hover':{opacity:1}}}>
                    <button className="btn btn-ghost btn-sm" title="Run" onClick={e => { e.stopPropagation(); handleExecute(w._id); }}>▶</button>
                    <button className="btn btn-ghost btn-sm" title="Edit" onClick={e => e.stopPropagation()}>✎</button>
                    <button className="btn btn-danger btn-sm" title="Delete" onClick={e => { e.stopPropagation(); handleDelete(w._id); }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selWf && (
        <Modal title={selWf.name} sub={selWf.description} onClose={() => setSelWf(null)}
          footer={
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" onClick={() => { handleExecute(selWf._id); setSelWf(null); }}>▶ Run Now</button>
              <button className="btn btn-ghost">✎ Edit</button>
              <button className="btn btn-ghost">📊 Logs</button>
            </div>
          }>
          {[
            ['Tool', selWf.toolName],
            ['Category', selWf.category],
            ['Status', <Badge status={selWf.status}/>],
            ['Total Runs', <span className="mono">{(selWf.runs||0).toLocaleString()}</span>],
            ['Health', <HealthBar pct={selWf.health||100}/>],
            ['Trigger', selWf.trigger],
            ['Last Run', timeAgo(selWf.lastRun)],
          ].map(([l, v]) => (
            <div key={l} className="modal-row">
              <div className="modal-label">{l}</div>
              <div>{v}</div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
