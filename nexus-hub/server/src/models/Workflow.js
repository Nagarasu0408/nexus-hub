const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id:     { type: String, required: true },
  label:  { type: String, required: true },
  sub:    { type: String, default: '' },
  type:   { type: String, enum: ['trigger','action','condition','logic'], default: 'action' },
  x:      { type: Number, default: 100 },
  y:      { type: Number, default: 100 },
  color:  { type: String, default: '#3B82F6' },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to:   { type: String, required: true },
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  toolKey:     { type: String, required: true },   // 'pa', 'ui', 'zp', etc.
  toolName:    { type: String, required: true },
  category:    { type: String, default: 'General' },
  status:      { type: String, enum: ['running','paused','scheduled','warning','stopped'], default: 'stopped' },
  trigger:     { type: String, default: 'Manual' },
  nodes:       [nodeSchema],
  edges:       [edgeSchema],
  deployTargets: [{ type: String }],
  runs:        { type: Number, default: 0 },
  health:      { type: Number, default: 100, min: 0, max: 100 },
  lastRun:     { type: Date, default: null },
  nextRun:     { type: Date, default: null },
  tags:        [{ type: String }],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// Index for fast queries
workflowSchema.index({ userId: 1, status: 1 });
workflowSchema.index({ userId: 1, toolKey: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
