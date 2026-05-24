import { useRef, useState } from 'react';
import useStore from '../store/useStore';

const NW = 130, NH = 58;

const PAL_ITEMS = [
  {type:'trigger',icon:'⏰',label:'Schedule',color:'#00D4FF'},
  {type:'trigger',icon:'🔗',label:'Webhook',color:'#3B82F6'},
  {type:'trigger',icon:'📧',label:'Email Trigger',color:'#06B6D4'},
  {type:'action',icon:'📥',label:'Fetch Data',color:'#3B82F6'},
  {type:'action',icon:'💬',label:'Slack Message',color:'#A855F7'},
  {type:'action',icon:'📤',label:'Export File',color:'#10B981'},
  {type:'action',icon:'🗃',label:'DB Query',color:'#7C3AED'},
  {type:'action',icon:'📨',label:'Send Email',color:'#F59E0B'},
  {type:'logic',icon:'◈',label:'Condition',color:'#F59E0B'},
  {type:'logic',icon:'🔄',label:'Loop',color:'#94A3B8'},
  {type:'logic',icon:'⏱',label:'Delay',color:'#94A3B8'},
];

const INIT_NODES = [
  {id:'n1',label:'⏰ Schedule',sub:'Every 1hr',x:40,y:110,color:'#00D4FF',type:'trigger'},
  {id:'n2',label:'📥 Fetch Data',sub:'REST API',x:220,y:110,color:'#3B82F6',type:'action'},
  {id:'n3',label:'◈ Condition',sub:'amount > 1000',x:400,y:110,color:'#F59E0B',type:'condition'},
  {id:'n4',label:'💬 Slack Alert',sub:'#ops-channel',x:570,y:50,color:'#A855F7',type:'action'},
  {id:'n5',label:'📤 Export CSV',sub:'Google Drive',x:570,y:190,color:'#10B981',type:'action'},
];

const INIT_EDGES = [
  {from:'n1',to:'n2'},{from:'n2',to:'n3'},{from:'n3',to:'n4'},{from:'n3',to:'n5'}
];

export default function Builder() {
  const { showToast } = useStore();
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState(INIT_NODES);
  const [edges, setEdges] = useState(INIT_EDGES);
  const [sel, setSel] = useState('n1');
  const [drag, setDrag] = useState(null);
  const [conn, setConn] = useState(null);
  const [deployTargets, setDeployTargets] = useState(['Power Automate','n8n']);

  const selNode = nodes.find(n => n.id === sel);

  const onNodeDown = (e, id) => {
    if (conn) {
      if (conn !== id) {
        setEdges(prev => [...prev, {from:conn,to:id}]);
        showToast('✓ Nodes connected!');
      }
      setConn(null); return;
    }
    e.stopPropagation();
    const r = svgRef.current.getBoundingClientRect();
    const n = nodes.find(x => x.id === id);
    setDrag({id,ox:e.clientX-r.left-n.x,oy:e.clientY-r.top-n.y});
    setSel(id);
  };

  const onSvgMove = (e) => {
    if (!drag) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = Math.max(0,Math.min(e.clientX-r.left-drag.ox,r.width-NW-4));
    const y = Math.max(0,Math.min(e.clientY-r.top-drag.oy,r.height-NH-4));
    setNodes(prev => prev.map(n => n.id===drag.id?{...n,x,y}:n));
  };

  const onSvgUp = () => setDrag(null);

  const addNode = (item) => {
    const id='n'+Date.now();
    setNodes(prev => [...prev,{id,label:`${item.icon} ${item.label}`,sub:'Configure...',x:200+Math.random()*100,y:100+Math.random()*80,color:item.color,type:item.type}]);
    setSel(id);
    showToast(`✓ ${item.label} node added`);
  };

  const delNode = () => {
    setNodes(prev => prev.filter(n => n.id !== sel));
    setEdges(prev => prev.filter(e => e.from !== sel && e.to !== sel));
    setSel(null);
  };

  const getPath = (fid, tid) => {
    const f=nodes.find(n=>n.id===fid), t=nodes.find(n=>n.id===tid);
    if(!f||!t) return '';
    const x1=f.x+NW,y1=f.y+NH/2,x2=t.x,y2=t.y+NH/2,mx=(x1+x2)/2;
    return `M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
  };

  const targets = ['Power Automate','n8n','Zapier','UiPath','Make'];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <div style={{fontSize:11,color:'var(--t3)'}}>
          <span style={{color:'var(--t1)',fontWeight:700}}>{nodes.length} nodes</span> · {edges.length} connections
          {conn && <span style={{color:'var(--amber)',marginLeft:10,fontWeight:700}}>⚡ Click a target node to connect</span>}
        </div>
        <div style={{display:'flex',gap:6}}>
          <button className="btn btn-ghost" onClick={() => { setNodes(INIT_NODES); setEdges(INIT_EDGES); setSel('n1'); showToast('Canvas reset'); }}>↺ Reset</button>
          <button className="btn btn-ghost" onClick={() => showToast('💾 Saving draft...')}>💾 Save</button>
          <button className="btn btn-primary" onClick={() => showToast('✓ Deploying workflow!')}>▶ Deploy</button>
        </div>
      </div>

      <div className="builder-layout">
        {/* Palette */}
        <div className="palette-panel">
          {['trigger','action','logic'].map(sec => (
            <div key={sec}>
              <div className="palette-section">{sec.charAt(0).toUpperCase()+sec.slice(1)}s</div>
              {PAL_ITEMS.filter(p => p.type === sec).map((p, i) => (
                <div key={i} className="palette-item" style={{'--item-color':p.color}} onClick={() => addNode(p)}>
                  <span>{p.icon}</span><span>{p.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="canvas-area">
          <div className="canvas-toolbar">
            <span style={{fontSize:11,fontWeight:700,color:'var(--t2)',flex:1}}>
              {sel ? nodes.find(n=>n.id===sel)?.label : 'Click a node to select'}
            </span>
            {sel && <>
              <button className="btn btn-ghost btn-icon" onClick={() => setConn(sel)} title="Connect">⚡</button>
              <button className="btn btn-danger btn-icon" onClick={delNode} title="Delete">🗑</button>
            </>}
          </div>
          <svg ref={svgRef}
            style={{width:'100%',height:'calc(100% - 41px)',cursor:drag?'grabbing':conn?'crosshair':'default'}}
            onMouseMove={onSvgMove} onMouseUp={onSvgUp}
            onClick={() => { if(!drag && !conn) setSel(null); }}>
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M2 2L8 5L2 8" fill="none" stroke="var(--b2)" strokeWidth="1.5" strokeLinecap="round"/>
              </marker>
              <marker id="arr-sel" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M2 2L8 5L2 8" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"/>
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="var(--bg)"/>
            
            {/* Grid pattern */}
            <defs>
              <pattern id="gdot" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r=".7" fill="var(--b1)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gdot)"/>

            {/* Edges */}
            {edges.map((e,i)=>{
              const isSelEdge = sel&&(e.from===sel||e.to===sel);
              return <path key={i} d={getPath(e.from,e.to)} fill="none" stroke={isSelEdge?'var(--cyan)':'var(--b2)'} strokeWidth={isSelEdge?1.8:1.3} markerEnd={isSelEdge?'url(#arr-sel)':'url(#arr)'}/>;
            })}

            {/* Nodes */}
            {nodes.map(n => {
              const isSel = n.id === sel;
              const isConn = conn === n.id;
              return (
                <g key={n.id} style={{cursor:'grab'}} onMouseDown={e => onNodeDown(e, n.id)}>
                  <rect x={n.x} y={n.y} width={NW} height={NH} rx={10}
                    fill={isSel?'var(--s3)':'var(--s2)'}
                    stroke={isConn?'var(--amber)':isSel?n.color:'var(--b1)'}
                    strokeWidth={isSel||isConn?2:1}
                  />
                  {isSel && <rect x={n.x} y={n.y} width={NW} height={4} rx={10} fill={n.color}/>}
                  <text x={n.x+12} y={n.y+22} fontFamily="var(--font)" fontSize="11" fontWeight="700" fill={isSel?n.color:'var(--t1)'}>{n.label}</text>
                  <text x={n.x+12} y={n.y+38} fontFamily="var(--mono)" fontSize="9" fill="var(--t3)">{n.sub}</text>
                  <rect x={n.x+NW-42} y={n.y+NH-18} width={36} height={12} rx={4} fill={`${n.color}22`}/>
                  <text x={n.x+NW-24} y={n.y+NH-8} textAnchor="middle" fontFamily="var(--font)" fontSize="7" fontWeight="700" fill={n.color} textTransform="uppercase">{n.type}</text>
                  <circle cx={n.x+NW} cy={n.y+NH/2} r={4} fill="var(--bg)" stroke={isSel?n.color:'var(--b2)'} strokeWidth="1.5"/>
                  <circle cx={n.x} cy={n.y+NH/2} r={4} fill="var(--bg)" stroke={isSel?n.color:'var(--b2)'} strokeWidth="1.5"/>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Properties */}
        <div className="properties-panel">
          <div className="props-section">{selNode?'Node Properties':'Properties'}</div>
          {selNode ? (
            <>
              <div className="form-group">
                <div className="form-label">Label</div>
                <input className="input" defaultValue={selNode.label} style={{width:'100%'}}/>
              </div>
              <div className="form-group">
                <div className="form-label">Config</div>
                <input className="input" defaultValue={selNode.sub} style={{width:'100%'}}/>
              </div>
              <div className="form-group">
                <div className="form-label">Type</div>
                <div style={{fontSize:10,fontWeight:700,color:selNode.color,background:`${selNode.color}22`,padding:'4px 9px',borderRadius:6,display:'inline-block'}}>{selNode.type.toUpperCase()}</div>
              </div>
              <hr className="divider"/>
              <div className="props-section">Deploy Target</div>
              {targets.map(t => (
                <div key={t} style={{display:'flex',alignItems:'center',gap:7,marginBottom:6,cursor:'pointer',fontSize:10}} onClick={() => setDeployTargets(prev => prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])}>
                  <div style={{width:14,height:14,borderRadius:3,border:`1px solid ${deployTargets.includes(t)?'var(--cyan)':'var(--b2)'}`,background:deployTargets.includes(t)?'rgba(0,212,255,.15)':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'var(--cyan)',fontWeight:700}}>
                    {deployTargets.includes(t)?'✓':''}
                  </div>
                  <span style={{color:deployTargets.includes(t)?'var(--t1)':'var(--t3)'}}>{t}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{fontSize:10,color:'var(--t3)',lineHeight:1.6}}>Click a node to view & edit properties</div>
          )}
        </div>
      </div>
    </div>
  );
}
