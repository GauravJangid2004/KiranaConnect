const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    // e.g. "2026-04-18T12:00:00.000Z" — the start of the 6-hour window
    batchWindow: {
      type: Date,
      required: true,
      unique: true, // ← THE IDEMPOTENCY KEY
      // If the cron fires twice (server restart, etc.), the second insert
      // throws a duplicate-key error (E11000). We catch & silently skip it.
      // No double-batching ever happens.
    },

    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    // Aggregated per-wholesaler so dispatch is O(1) lookup
    wholesalerGroups: [
      {
        wholesaler: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        orderIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
          },
        ],
        totalItems: { type: Number, default: 0 },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "dispatched", "cancelled"],
      default: "pending",
    },

    dispatchedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for quick range queries (e.g. "batches in last 24 hrs")
batchSchema.index({ createdAt: -1 });
batchSchema.index({ status: 1 });

module.exports = mongoose.model("Batch", batchSchema);
