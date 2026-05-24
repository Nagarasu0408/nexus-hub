const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const { Execution, Activity, ConnectedTool } = require('../models/index');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const uid = req.user._id;

    const [workflows, executions, tools] = await Promise.all([
      Workflow.find({ userId: uid, isActive: true }),
      Execution.find({ userId: uid, createdAt: { $gte: new Date(Date.now() - 86400000) } }),
      ConnectedTool.find({ userId: uid }),
    ]);

    const active   = workflows.filter(w => w.status === 'running').length;
    const totalRuns = executions.length;
    const successRuns = executions.filter(e => e.status === 'success').length;
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;
    const avgDuration = executions.filter(e => e.duration).reduce((s, e) => s + e.duration, 0) / (executions.filter(e => e.duration).length || 1);
    const hoursSaved  = Math.round((totalRuns * avgDuration) / 3600000);
    const connected   = tools.filter(t => t.status === 'connected').length;

    res.json({
      success: true,
      stats: {
        totalRuns, active, successRate, hoursSaved,
        totalWorkflows: workflows.length,
        connectedTools: connected,
        warnings: workflows.filter(w => w.status === 'warning').length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/activity
router.get('/activity', protect, async (req, res) => {
  try {
    const activity = await Activity.find({ userId: req.user._id })
      .sort('-createdAt').limit(20);
    res.json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/chart — last 7 days run counts
router.get('/chart', protect, async (req, res) => {
  try {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0,0,0,0);
      const end   = new Date(start); end.setHours(23,59,59,999);
      const count = await Execution.countDocuments({ userId: req.user._id, createdAt: { $gte: start, $lte: end } });
      result.push({ date: start.toLocaleDateString('en-US',{weekday:'short'}), count });
    }
    res.json({ success: true, chart: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
