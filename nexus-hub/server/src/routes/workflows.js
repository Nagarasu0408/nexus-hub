const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const { Execution, Activity, ConnectedTool } = require('../models/index');

// GET /api/workflows
router.get('/', protect, async (req, res) => {
  try {
    const { status, toolKey, search, sort = '-createdAt' } = req.query;
    const query = { userId: req.user._id, isActive: true };

    if (status && status !== 'all')  query.status = status;
    if (toolKey && toolKey !== 'all') query.toolKey = toolKey;
    if (search) query.name = { $regex: search, $options: 'i' };

    const workflows = await Workflow.find(query).sort(sort);
    res.json({ success: true, count: workflows.length, workflows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/workflows
router.post('/', protect, async (req, res) => {
  try {
    const workflow = await Workflow.create({ ...req.body, userId: req.user._id });

    // Update tool's flow count
    await ConnectedTool.findOneAndUpdate(
      { userId: req.user._id, toolKey: workflow.toolKey },
      { $inc: { flowCount: 1 } }
    );

    await Activity.create({
      userId: req.user._id,
      workflowId: workflow._id,
      message: `Workflow "${workflow.name}" created`,
      tool: workflow.toolName, toolKey: workflow.toolKey, type: 'info',
    });

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('workflow:created', workflow);

    res.status(201).json({ success: true, workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workflows/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });
    res.json({ success: true, workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/workflows/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('workflow:updated', workflow);

    res.json({ success: true, workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/workflows/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    await ConnectedTool.findOneAndUpdate(
      { userId: req.user._id, toolKey: workflow.toolKey },
      { $inc: { flowCount: -1 } }
    );

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('workflow:deleted', { id: req.params.id });

    res.json({ success: true, message: 'Workflow deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/workflows/:id/toggle — pause / resume
router.post('/:id/toggle', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) return res.status(404).json({ success: false, message: 'Not found' });

    const newStatus = workflow.status === 'running' ? 'paused' : 'running';
    workflow.status = newStatus;
    await workflow.save();

    await Activity.create({
      userId: req.user._id, workflowId: workflow._id,
      message: `Workflow "${workflow.name}" ${newStatus === 'running' ? 'resumed' : 'paused'}`,
      tool: workflow.toolName, toolKey: workflow.toolKey,
      type: newStatus === 'running' ? 'success' : 'info',
    });

    const io = req.app.get('io');
    if (io) io.to(req.user._id.toString()).emit('workflow:toggled', { id: workflow._id, status: newStatus });

    res.json({ success: true, workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/workflows/:id/execute — trigger a manual run
router.post('/:id/execute', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!workflow) return res.status(404).json({ success: false, message: 'Not found' });

    // Create execution record
    const execution = await Execution.create({
      workflowId: workflow._id,
      userId: req.user._id,
      status: 'running',
      logs: [{ level: 'info', message: 'Execution started manually' }],
    });

    // Simulate async execution (real integration would call the actual tool API)
    simulateExecution(execution._id, workflow, req.user._id, req.app.get('io'));

    res.json({ success: true, execution });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/workflows/:id/executions
router.get('/:id/executions', protect, async (req, res) => {
  try {
    const executions = await Execution.find({ workflowId: req.params.id, userId: req.user._id })
      .sort('-createdAt').limit(20);
    res.json({ success: true, executions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Simulate execution ────────────────────────────────────────
async function simulateExecution(execId, workflow, userId, io) {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  try {
    await delay(800);
    const steps = workflow.nodes?.length || 3;
    const logs = [{ level: 'info', message: 'Execution started' }];

    for (let i = 0; i < steps; i++) {
      await delay(600);
      const node = workflow.nodes[i];
      logs.push({ level: 'success', message: `Step ${i+1} complete: ${node?.label || 'Processing'}` });
    }

    const failed = Math.random() < 0.1; // 10% chance fail
    const duration = 800 + steps * 600;

    const updated = await Execution.findByIdAndUpdate(execId, {
      status: failed ? 'failed' : 'success',
      completedAt: new Date(),
      duration,
      logs: [...logs, { level: failed ? 'error' : 'success', message: failed ? 'Execution failed — retrying...' : 'Execution completed successfully' }],
      error: failed ? 'Simulated failure' : null,
    }, { new: true });

    // Update workflow stats
    await Workflow.findByIdAndUpdate(workflow._id, {
      $inc: { runs: 1 },
      lastRun: new Date(),
      health: failed ? Math.max(0, workflow.health - 5) : Math.min(100, workflow.health + 1),
      status: 'running',
    });

    await Activity.create({
      userId,
      workflowId: workflow._id,
      message: failed
        ? `"${workflow.name}" execution failed`
        : `"${workflow.name}" completed run #${workflow.runs + 1}`,
      tool: workflow.toolName,
      toolKey: workflow.toolKey,
      type: failed ? 'warning' : 'success',
    });

    if (io) {
      io.to(userId.toString()).emit('execution:complete', {
        workflowId: workflow._id, executionId: execId, status: updated.status,
      });
      io.to(userId.toString()).emit('activity:new', {
        message: `"${workflow.name}" run ${failed ? 'failed' : 'completed'}`,
        tool: workflow.toolName, type: failed ? 'warning' : 'success', time: 'just now',
      });
    }
  } catch (e) {
    await Execution.findByIdAndUpdate(execId, { status: 'failed', error: e.message });
  }
}

module.exports = router;
