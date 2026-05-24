# NEXUS — Automation Hub

**The unified command center for all automation tools.** Connect Power Automate, UiPath, Zapier, Make, n8n, and 6+ more in one platform. Build, deploy, monitor, and scale workflows across any automation tool.

![NEXUS Dashboard](https://img.shields.io/badge/Status-Full_MERN_Stack-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🚀 Features

- **🔌 Unified Tool Integration** — Connect 12+ automation platforms (Power Automate, UiPath, Zapier, Make, n8n, etc.)
- **⚡ Real-time Monitoring** — Live activity feed, workflow stats, health dashboard
- **◈ Visual Workflow Builder** — Drag-drop nodes, no-code workflow design
- **✦ AI-Powered Workflow Generation** — Claude AI generates complete workflows from natural language
- **📊 Analytics & Insights** — Track runs, success rates, hours saved, performance trends
- **🔒 Secure Authentication** — JWT-based auth with role-based access control
- **📡 Real-time Updates** — Socket.io for live notifications and activity streams
- **🎯 Multi-tool Deployment** — Deploy workflows once, run on any connected tool

---

## 📁 Project Structure

```
nexus-hub/
├── server/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js         # MongoDB connection
│   │   │   └── toolCatalog.js # Tool definitions
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── index.js       # Workflow, ConnectedTool, Execution, Activity
│   │   ├── routes/
│   │   │   ├── auth.js        # Auth endpoints
│   │   │   ├── tools.js       # Tool management
│   │   │   ├── workflows.js   # Workflow CRUD
│   │   │   ├── dashboard.js   # Stats & analytics
│   │   │   └── ai.js          # Claude AI integration
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT protection
│   │   ├── socket/
│   │   │   └── index.js       # Real-time events
│   │   └── server.js          # Express entry point
│   ├── .env.example
│   └── package.json
│
└── client/                    # React/Vite Frontend
    ├── src/
    │   ├── api/
    │   │   └── client.js      # Axios instance + API methods
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── UI.jsx         # Reusable components (Badge, Modal, etc.)
    │   ├── hooks/
    │   │   └── useSocket.js   # Socket.io integration
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ToolHub.jsx
    │   │   ├── Workflows.jsx
    │   │   ├── Builder.jsx
    │   │   └── AIAssist.jsx
    │   ├── store/
    │   │   └── useStore.js    # Zustand global state
    │   ├── styles/
    │   │   └── globals.css    # Dark theme CSS
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🛠 Setup Instructions

### Prerequisites
- **Node.js** 16+ & npm/yarn
- **MongoDB Atlas** account (free tier OK)
- **Anthropic API key** (Claude)
- **Git**

### 1. Clone & Install

```bash
git clone <repo-url> nexus-hub
cd nexus-hub

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Environment Setup

**Backend (`server/.env`):**
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/nexus-hub
JWT_SECRET=your_super_secret_key_change_this
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
```

**MongoDB Setup:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string: `mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/nexus-hub?retryWrites=true`
4. Copy to `MONGO_URI`

**Claude API Key:**
1. Visit [Anthropic Console](https://console.anthropic.com)
2. Create API key
3. Copy to `ANTHROPIC_API_KEY`

### 3. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
# API at http://localhost:5000/api
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Login

Demo credentials:
- **Email:** `demo@nexus.io`
- **Password:** `demo123`

Or create new account via register form.

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user
- `PUT /api/auth/profile` — Update profile

### Tools
- `GET /api/tools` — List all tools
- `POST /api/tools/:key/connect` — Connect tool
- `POST /api/tools/:key/disconnect` — Disconnect tool
- `GET /api/tools/stats` — Tool statistics

### Workflows
- `GET /api/workflows` — List workflows (supports query: `status`, `toolKey`, `search`)
- `POST /api/workflows` — Create workflow
- `GET /api/workflows/:id` — Get workflow
- `PUT /api/workflows/:id` — Update workflow
- `DELETE /api/workflows/:id` — Delete workflow
- `POST /api/workflows/:id/toggle` — Pause/Resume
- `POST /api/workflows/:id/execute` — Trigger manual run
- `GET /api/workflows/:id/executions` — Get execution history

### Dashboard
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/dashboard/activity` — Activity feed
- `GET /api/dashboard/chart` — 7-day chart data

### AI
- `POST /api/ai/generate` — Generate workflow from description
- `POST /api/ai/chat` — Chat with Claude
- `POST /api/ai/optimize` — Get optimization suggestions

---

## 🗄️ Database Models

### User
```javascript
{
  name, email, password (hashed), avatar, role, isActive, createdAt, updatedAt
}
```

### ConnectedTool
```javascript
{
  userId, toolKey, name, color, category, status (connected|inactive|pending),
  credentials, connectedAt, flowCount, createdAt, updatedAt
}
```

### Workflow
```javascript
{
  userId, name, description, toolKey, toolName, category, status,
  trigger, nodes (array), edges (array), deployTargets,
  runs, health, lastRun, nextRun, tags, isActive, createdAt, updatedAt
}
```

### Execution
```javascript
{
  workflowId, userId, status (running|success|failed|cancelled),
  startedAt, completedAt, duration, logs (array), error,
  inputData, outputData, createdAt, updatedAt
}
```

### Activity
```javascript
{
  userId, workflowId, message, tool, toolKey, type (success|warning|error|info), createdAt
}
```

---

## 🔌 Socket.io Events

### From Server → Client
```javascript
'activity:new'          // New activity item
'workflow:toggled'      // Workflow paused/resumed
'workflow:created'      // New workflow created
'workflow:updated'      // Workflow modified
'workflow:deleted'      // Workflow removed
'execution:complete'    // Run finished
'tool:connected'        // Tool connected
'tool:disconnected'     // Tool disconnected
```

### From Client → Server
```javascript
'workflow:subscribe'    // Subscribe to workflow events
'workflow:unsubscribe'  // Unsubscribe
'ping'                  // Keep-alive ping
```

---

## 🚀 Deployment

### Deploy Backend to Azure / AWS / Railway

**Railway (Recommended for quick deploy):**
```bash
npm install -g railway
railway login
railway init
railway up
```

**Azure App Service:**
```bash
az login
az webapp up --name nexus-hub --resource-group myResourceGroup --runtime "node|18-lts"
```

### Deploy Frontend to Vercel / Netlify

**Vercel:**
```bash
npm install -g vercel
cd client
vercel
```

**Netlify:**
```bash
npm run build
netlify deploy --prod --dir=client/dist
```

### Environment Variables for Production

Backend (`.env`):
```env
PORT=5000
NODE_ENV=production
MONGO_URI=<production-mongo-uri>
JWT_SECRET=<strong-random-secret>
ANTHROPIC_API_KEY=<api-key>
CLIENT_URL=https://yourdomain.com
```

Frontend (`client/.env`):
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Zustand, Socket.io, Axios |
| **Backend** | Node.js, Express, MongoDB, JWT, Socket.io |
| **AI/LLM** | Claude (Anthropic) |
| **Database** | MongoDB Atlas |
| **Styling** | CSS3 (custom dark theme) |
| **Real-time** | Socket.io |

---

## 🎯 Roadmap

- [ ] OAuth2 for tool connections (real API auth, not simulated)
- [ ] Workflow versioning & rollback
- [ ] Advanced analytics (cost tracking, ROI)
- [ ] Team collaboration & permissions
- [ ] Workflow marketplace/templates
- [ ] Mobile app (React Native)
- [ ] Audit logs & compliance reports
- [ ] Webhook tunnel for local tools
- [ ] Custom code nodes (Python, JavaScript)
- [ ] Scheduled reports via email

---

## 📝 Demo Walkthrough

1. **Login** → Create account or use demo creds
2. **Dashboard** → See stats, active workflows, real-time activity
3. **Tool Hub** → Connect/disconnect automation tools (demo mode simulates)
4. **Workflows** → View all workflows, search, filter, run, pause, delete
5. **Builder** → Drag nodes, create visual workflows, set deploy targets
6. **AI Assist** → Type descriptions, Claude generates complete workflows
7. **Analytics** → Track performance, view charts, optimize

---

## 🐛 Troubleshooting

**MongoDB connection fails:**
- Check internet connection
- Verify MONGO_URI in `.env`
- Whitelist IP in MongoDB Atlas (IP access)

**Claude API errors:**
- Verify `ANTHROPIC_API_KEY` is valid
- Check API key has sufficient credits
- Rate limit: Wait a few seconds between requests

**Socket.io not connecting:**
- Ensure backend is running
- Check `CLIENT_URL` matches frontend domain
- CORS might block connections (verify in browser console)

**Frontend blank page:**
- Check if API is reachable: `curl http://localhost:5000/api/health`
- Open browser DevTools → Console for errors
- Clear localStorage: `localStorage.clear()`

---

## 📄 License

MIT — Open source automation platform

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch (`git checkout -b feature/awesome`)
3. Commit changes (`git commit -m "Add awesome feature"`)
4. Push to branch (`git push origin feature/awesome`)
5. Open Pull Request

---

## 📞 Support

- **Issues:** GitHub Issues
- **Documentation:** See inline code comments & API docs above
- **Email:** naga@nexus.local

---

## 🎉 Credits

Built by Naga Kumar — Full MERN Stack Automation Hub  
Powered by Claude AI (Anthropic)

Happy automating! 🚀✨
