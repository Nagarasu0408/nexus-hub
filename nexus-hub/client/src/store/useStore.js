import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────
  user: null,
  token: localStorage.getItem('nexus_token') || null,
  setAuth: (user, token) => {
    localStorage.setItem('nexus_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('nexus_token');
    set({ user: null, token: null });
  },

  // ── Toast ─────────────────────────────────────────────────
  toast: null,
  showToast: (msg, type = 'success') => {
    set({ toast: { msg, type } });
    setTimeout(() => set({ toast: null }), 2800);
  },

  // ── Tools ─────────────────────────────────────────────────
  tools: [],
  setTools: (tools) => set({ tools }),
  updateToolStatus: (toolKey, status) =>
    set((s) => ({
      tools: s.tools.map((t) => t.toolKey === toolKey ? { ...t, status } : t),
    })),

  // ── Workflows ─────────────────────────────────────────────
  workflows: [],
  setWorkflows: (workflows) => set({ workflows }),
  addWorkflow: (wf) => set((s) => ({ workflows: [wf, ...s.workflows] })),
  updateWorkflow: (updated) =>
    set((s) => ({ workflows: s.workflows.map((w) => w._id === updated._id ? updated : w) })),
  removeWorkflow: (id) =>
    set((s) => ({ workflows: s.workflows.filter((w) => w._id !== id) })),

  // ── Activity ──────────────────────────────────────────────
  activity: [],
  setActivity: (activity) => set({ activity }),
  prependActivity: (item) =>
    set((s) => ({ activity: [item, ...s.activity].slice(0, 20) })),

  // ── Dashboard stats ───────────────────────────────────────
  stats: { totalRuns: 0, active: 0, successRate: 100, hoursSaved: 0, connectedTools: 0 },
  setStats: (stats) => set({ stats }),

  // ── Chart ─────────────────────────────────────────────────
  chartData: [],
  setChartData: (chartData) => set({ chartData }),
}));

export default useStore;
