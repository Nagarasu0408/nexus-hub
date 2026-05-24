const mongoose = require('mongoose');

// ── ConnectedTool ────────────────────────────────────────────
const connectedToolSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toolKey:     { type: String, required: true },  // 'pa','ui','zp','mk','n8','wk' etc.
  name:        { type: String, required: true },
  short:       { type: String, required: true },
  color:       { type: String, required: true },
  category:    { type: String, required: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['connected','inactive','pending'], default: 'inactive' },
  credentials: { type: mongoose.Schema.Types.Mixed, default: {} },  // encrypted in prod
  connectedAt: { type: Date, default: null },
  flowCount:   { type: Number, default: 0 },
}, { timestamps: true });

connectedToolSchema.index({ userId: 1, toolKey: 1 }, { unique: true });

// ── Execution ────────────────────────────────────────────────
const logSchema = new mongoose.Schema({
  ts:      { type: Date, default: Date.now },
  level:   { type: String, enum: ['info','warn','error','success'], default: 'info' },
  message: { type: String },
}, { _id: false });

const executionSchema = new mongoose.Schema({
  workflowId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['running','success','failed','cancelled'], default: 'running' },
  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  duration:    { type: Number, default: null },  // ms
  logs:        [logSchema],
  error:       { type: String, default: null },
  inputData:   { type: mongoose.Schema.Types.Mixed, default: {} },
  outputData:  { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

executionSchema.index({ workflowId: 1, status: 1 });
executionSchema.index({ userId: 1, createdAt: -1 });

// ── Activity ─────────────────────────────────────────────────
const activitySchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', default: null },
  message:    { type: String, required: true },
  tool:       { type: String, default: '' },
  toolKey:    { type: String, default: '' },
  type:       { type: String, enum: ['success','warning','error','info'], default: 'info' },
}, { timestamps: true });

activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = {
  ConnectedTool: mongoose.model('ConnectedTool', connectedToolSchema),
  Execution:     mongoose.model('Execution', executionSchema),
  Activity:      mongoose.model('Activity', activitySchema),
};
