import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  // batchWindow is the idempotency key — prevents duplicate batches on cron re-run
  // Format: "YYYY-M-D-H-wholesalerId" (unique per wholesaler per time window)
  batchWindow:       { type: String, required: true, unique: true },
  orders:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  wholesalerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:            { type: String, enum: ['aggregating', 'dispatched'], default: 'aggregating' },
  totalOrders:       { type: Number, default: 0 },
  scheduledDispatch: Date,
  dispatchedAt:      Date,
}, { timestamps: true });

export default mongoose.model('Batch', batchSchema);
