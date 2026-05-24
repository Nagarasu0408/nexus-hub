import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api/client';
import useStore from '../store/useStore';

const AI_SUGGESTIONS = [
  {title:'Invoice → ERP Pipeline',desc:'OCR extract invoice fields from email attachments, validate amounts, push to SAP via UiPath bot. Runs every hour.',tags:['UiPath','SAP','OCR']},
  {title:'Lead Scoring + CRM Sync',desc:'Enrich new HubSpot contacts with LinkedIn data, score with AI (0–100), auto-sync to Salesforce if score > 80.',tags:['Zapier','HubSpot']},
  {title:'Employee Offboarding Flow',desc:'On HR system trigger: revoke all SSO access, archive Slack/Drive, disable AD account, email manager report.',tags:['Power Automate','Azure AD']},
  {title:'Inventory Reorder Bot',desc:'Monitor stock levels via ERP webhook. If stock < threshold: auto-raise PO, notify procurement, update sheet.',tags:['n8n','Slack']},
];

export default function AIAssist() {
  const { showToast } = useStore();
  const [msgs, setMsgs] = useState([{role:'ai',text:'👋 Hi Naga! I can generate complete automation workflows for any connected tool.\n\nTry: "Build an invoice processing pipeline" or "Create a Slack alert when orders come in"'}]);
  const [inp, setInp] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, loading]);

  const send = async (text) => {
    const msg = text || inp.trim();
    if (!msg) return;
    setMsgs(prev => [...prev, {role:'me',text:msg}]);
    setInp('');
    setLoading(true);

    try {
      const res = await aiAPI.chat([...msgs.map(m=>({role:m.role,content:m.text})),{role:'user',content:msg}]);
      setMsgs(prev => [...prev, {role:'ai',text:res.data.message}]);
    } catch {
      // Demo response
      const demoResponses = {
        invoice: '✓ Invoice Automation Workflow generated:\n\n→ **Trigger:** Webhook (email attachment)\n→ **Step 1:** OCR extract — vendor, amount, date, PO#\n→ **Step 2:** Validate against ERP database\n→ **Step 3:** If match → approve & post to SAP\n→ **Step 4:** If mismatch → Slack alert to AP\n→ **Action:** Email confirmation to vendor\n\nDeploy to: **UiPath · Power Automate · n8n**',
        slack: '✓ Slack Notification Workflow generated:\n\n→ **Trigger:** Webhook or Cron schedule\n→ **Step 1:** Fetch data from source API\n→ **Step 2:** Format message (Markdown blocks)\n→ **Step 3:** Send to #channel via Slack API\n→ **Step 4:** Log to Google Sheets\n\nDeploy to: **Zapier · Make · n8n**',
        default: `✓ Automation Workflow generated for: "${msg}"\n\n→ **Trigger:** Webhook / Schedule\n→ **Step 1:** Parse input payload\n→ **Step 2:** Apply business logic & transform\n→ **Step 3:** Push to target system\n→ **Step 4:** Send confirmation notification\n→ **Error Handler:** Retry x3 → Slack alert\n\nDeploy to: **Any connected tool**`
      };
      const key = msg.toLowerCase().includes('invoice')?'invoice':msg.toLowerCase().includes('slack')?'slack':'default';
      setMsgs(prev => [...prev, {role:'ai',text:demoResponses[key]}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>AI Automation Assistant</div>
      <div style={{fontSize:12,color:'var(--t3)',marginBottom:16}}>Describe what you want to automate — AI generates the full workflow for any connected tool</div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,height:'calc(100vh - 54px - 120px)',overflow:'hidden'}}>
        {/* Left: Suggestions + Prompts */}
        <div style={{display:'flex',flexDirection:'column',gap:14,overflow:'hidden'}}>
          <div className="card card-pad" style={{flex:1,overflow:'y-auto'}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--purple)',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>✦ AI SUGGESTED AUTOMATIONS</div>
            {AI_SUGGESTIONS.map((s,i) => (
              <div key={i} style={{background:'var(--s3)',border:'1px solid var(--b1)',borderRadius:10,padding:12,marginBottom:8,cursor:'pointer',transition:'.2s'}}
                onClick={() => send(s.title)}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(168,85,247,.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--b1)'; }}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{s.title}</div>
                <div style={{fontSize:10,color:'var(--t2)',lineHeight:1.5,marginBottom:7}}>{s.desc}</div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {s.tags.map(t => <span key={t} style={{display:'inline-block',padding:'2px 7px',borderRadius:4,fontSize:9,fontWeight:700,background:'rgba(168,85,247,.15)',color:'var(--purple)'}}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div className="section-hdr" style={{marginBottom:10}}>
              <div className="section-title">Quick Prompts</div>
            </div>
            {['Send Slack alert when order > ₹10,000','Daily sales report to email every morning','Auto-assign IT tickets by team skill','Sync new leads from form to CRM'].map(p => (
              <div key={p} style={{padding:'7px 10px',borderRadius:7,border:'1px solid var(--b1)',background:'var(--s2)',fontSize:10,color:'var(--t2)',cursor:'pointer',marginBottom:6,transition:'.15s'}}
                onClick={() => send(p)}
                onMouseEnter={e => {e.currentTarget.style.borderColor='rgba(0,212,255,.4)';e.currentTarget.style.color='var(--t1)'}}
                onMouseLeave={e => {e.currentTarget.style.borderColor='var(--b1)';e.currentTarget.style.color='var(--t2)'}}>
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="chat-container">
          <div style={{padding:'12px 14px',borderBottom:'1px solid var(--b1)',display:'flex',alignItems:'center',gap:7}}>
            <span style={{fontSize:12,fontWeight:700}}>AI Chat</span>
            <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:10,background:'rgba(168,85,247,.12)',color:'var(--purple)',border:'1px solid rgba(168,85,247,.2)'}}>✦ NEXUS AI</span>
          </div>
          <div className="chat-messages" ref={chatRef}>
            {msgs.map((m,i) => (
              <div key={i} className={m.role==='ai'?'msg-ai':'msg-me'}>
                {m.text.split('\n').map((line,j) => <div key={j}>{line}</div>)}
              </div>
            ))}
            {loading && (
              <div className="msg-ai">
                <div className="typing-indicator">
                  <span className="typing-dot"/>
                  <span className="typing-dot"/>
                  <span className="typing-dot"/>
                </div>
              </div>
            )}
          </div>
          <div className="chat-input-row">
            <input placeholder="Describe your automation..." value={inp} onChange={e => setInp(e.target.value)}
              onKeyDown={e => e.key==='Enter' && send()}
              style={{flex:1}}/>
            <button className="btn btn-primary" onClick={() => send()} disabled={loading || !inp.trim()}>Send ✦</button>
          </div>
        </div>
      </div>
    </div>
  );
}
