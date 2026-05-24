const express = require('express');
const router  = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');
const { ConnectedTool } = require('../models/index');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/generate — generate workflow from natural language
router.post('/generate', protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt required' });

    const connectedTools = await ConnectedTool.find({ userId: req.user._id, status: 'connected' });
    const toolNames = connectedTools.map(t => t.name).join(', ') || 'Power Automate, n8n, Zapier';

    const systemPrompt = `You are NEXUS AI, an expert automation workflow architect. 
The user has these tools connected: ${toolNames}.
Generate a detailed, practical automation workflow plan.
Respond ONLY with valid JSON in this exact format:
{
  "title": "Workflow Name",
  "description": "Brief description",
  "recommendedTool": "tool name",
  "toolKey": "pa|ui|zp|mk|n8|wk",
  "trigger": "Trigger type and description",
  "steps": [
    { "step": 1, "label": "Step name", "description": "What happens", "type": "trigger|action|condition" }
  ],
  "deployTargets": ["Tool1", "Tool2"],
  "nodes": [
    { "id": "n1", "label": "⏰ Step Label", "sub": "Config detail", "type": "trigger", "x": 40, "y": 110, "color": "#00D4FF" }
  ],
  "edges": [
    { "from": "n1", "to": "n2" }
  ],
  "estimatedTimeSaved": "X hours/week"
}
Make nodes.x positions increase by 180 for each sequential node. y=110 for linear, branch up/down by 80 for conditions.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Build an automation workflow for: "${prompt}"` }],
    });

    const raw = message.content[0].text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ success: false, message: 'AI response parsing failed' });

    const workflow = JSON.parse(jsonMatch[0]);
    res.json({ success: true, workflow });
  } catch (err) {
    console.error('AI generate error:', err.message);
    res.status(500).json({ success: false, message: 'AI generation failed: ' + err.message });
  }
});

// POST /api/ai/chat — conversational AI assistant
router.post('/chat', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ success: false, message: 'Messages required' });

    const connectedTools = await ConnectedTool.find({ userId: req.user._id, status: 'connected' });
    const toolNames = connectedTools.map(t => t.name).join(', ') || 'Power Automate, n8n, Zapier';

    const systemPrompt = `You are NEXUS AI, an expert automation consultant embedded in the NEXUS Automation Hub platform.
The user has these tools connected: ${toolNames}.
You help users: design workflows, troubleshoot issues, suggest optimizations, explain automation concepts.
Be concise, practical, and mention specific steps. Use → for step lists. Keep responses under 200 words unless a detailed workflow is requested.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    res.json({ success: true, message: response.content[0].text });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ success: false, message: 'AI chat failed: ' + err.message });
  }
});

// POST /api/ai/optimize — analyze and suggest workflow improvements
router.post('/optimize', protect, async (req, res) => {
  try {
    const { nodes, edges, name } = req.body;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Analyze this automation workflow called "${name}" with ${nodes?.length} nodes and ${edges?.length} connections. Suggest 3 specific optimizations to improve reliability, performance, or coverage. Be concise and actionable.`,
      }],
    });

    res.json({ success: true, suggestions: message.content[0].text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
