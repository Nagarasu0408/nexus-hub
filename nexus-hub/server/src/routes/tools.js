const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { ConnectedTool, Activity } = require('../models/index');

// GET /api/tools — list all tools for user
router.get('/', protect, async (req, res) => {
  try {
    const tools = await ConnectedTool.find({ userId: req.user._id }).sort({ name: 1 });
    res.json({ success: true, tools });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tools/connected — only connected tools
router.get('/connected', protect, async (req, res) => {
  try {
    const tools = await ConnectedTool.find({ userId: req.user._id, status: 'connected' });
    res.json({ success: true, tools });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tools/:toolKey/connect
router.post('/:toolKey/connect', protect, async (req, res) => {
  try {
    const tool = await ConnectedTool.findOneAndUpdate(
      { userId: req.user._id, toolKey: req.params.toolKey },
      { status: 'connected', connectedAt: new Date(), credentials: req.body.credentials || {} },
      { new: true }
    );
    if (!tool) return res.status(404).json({ success: false, message: 'Tool not found' });

    await Activity.create({
      userId: req.user._id,
      message: `${tool.name} connected successfully`,
      tool: tool.name, toolKey: tool.toolKey, type: 'success',
    });

    // Emit socket event (accessed via req.app)
    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('tool:connected', { toolKey: tool.toolKey, name: tool.name });

    res.json({ success: true, tool });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/tools/:toolKey/disconnect
router.post('/:toolKey/disconnect', protect, async (req, res) => {
  try {
    const tool = await ConnectedTool.findOneAndUpdate(
      { userId: req.user._id, toolKey: req.params.toolKey },
      { status: 'inactive', connectedAt: null, credentials: {} },
      { new: true }
    );
    if (!tool) return res.status(404).json({ success: false, message: 'Tool not found' });

    await Activity.create({
      userId: req.user._id,
      message: `${tool.name} disconnected`,
      tool: tool.name, toolKey: tool.toolKey, type: 'info',
    });

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('tool:disconnected', { toolKey: tool.toolKey });

    res.json({ success: true, tool });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tools/stats — tool stats summary
router.get('/stats', protect, async (req, res) => {
  try {
    const all = await ConnectedTool.find({ userId: req.user._id });
    const connected = all.filter(t => t.status === 'connected');
    const totalFlows = connected.reduce((sum, t) => sum + (t.flowCount || 0), 0);
    res.json({ success: true, stats: { total: all.length, connected: connected.length, inactive: all.length - connected.length, totalFlows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
