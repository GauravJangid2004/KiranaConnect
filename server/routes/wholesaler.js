const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const Order = require("../models/Order");

// Middleware imported from Member 1 (auth + role guard)
const { requireRole } = require("../middleware/auth");

// ─────────────────────────────────────────────
// GET /api/wholesaler/dashboard
// Returns live stats for the WholesalerDashboard
// Protected: wholesaler role only
// ─────────────────────────────────────────────
router.get("/dashboard", requireRole("wholesaler"), async (req, res) => {
  try {
    const wholesalerId = req.user.id;

    // Single $lookup pipeline — avoids N+1 (Member 2's concept, applied here too)
    const stats = await Order.aggregate([
      {
        $match: {
          wholesaler: new mongoose.Types.ObjectId(wholesalerId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Pending orders list (for live feed)
    const pendingOrders = await Order.find({
      wholesaler: wholesalerId,
      status: "pending",
    })
      .populate("shopOwner", "name shopName")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 })
      .limit(20);

    // Latest batch for this wholesaler
    const latestBatch = await Batch.findOne({
      "wholesalerGroups.wholesaler": wholesalerId,
    })
      .sort({ createdAt: -1 })
      .populate("wholesalerGroups.orderIds");

    res.json({
      stats,
      pendingOrders,
      latestBatch,
    });
  } catch (err) {
    console.error("[wholesaler/dashboard]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/wholesaler/batches
// All batches that include this wholesaler's orders
// ─────────────────────────────────────────────
router.get("/batches", requireRole("wholesaler"), async (req, res) => {
  try {
    const wholesalerId = req.user.id;

    const batches = await Batch.find({
      "wholesalerGroups.wholesaler": wholesalerId,
    })
      .sort({ batchWindow: -1 })
      .limit(30);

    res.json(batches);
  } catch (err) {
    console.error("[wholesaler/batches]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/wholesaler/batches/:batchId
// Detail view of a single batch
// ─────────────────────────────────────────────
router.get("/batches/:batchId", requireRole("wholesaler"), async (req, res) => {
  try {
    const wholesalerId = req.user.id;
    const batch = await Batch.findOne({
      _id: req.params.batchId,
      "wholesalerGroups.wholesaler": wholesalerId,
    }).populate({
      path: "wholesalerGroups.orderIds",
      populate: [
        { path: "shopOwner", select: "name shopName phone" },
        { path: "items.product", select: "name sku price unit" },
      ],
    });

    if (!batch) return res.status(404).json({ message: "Batch not found" });

    res.json(batch);
  } catch (err) {
    console.error("[wholesaler/batches/:id]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/wholesaler/batches/:batchId/dispatch
// Wholesaler marks a batch as dispatched
// ─────────────────────────────────────────────
router.patch(
  "/batches/:batchId/dispatch",
  requireRole("wholesaler"),
  async (req, res) => {
    try {
      const wholesalerId = req.user.id;

      const batch = await Batch.findOneAndUpdate(
        {
          _id: req.params.batchId,
          "wholesalerGroups.wholesaler": wholesalerId,
          status: "pending",
        },
        { status: "dispatched", dispatchedAt: new Date() },
        { new: true }
      );

      if (!batch)
        return res
          .status(404)
          .json({ message: "Batch not found or already dispatched" });

      // Notify all connected shop owners in this batch via Socket.io
      // req.io is attached in server.js
      batch.orders.forEach((orderId) => {
        req.io.to(`order:${orderId}`).emit("orderDispatched", {
          batchId: batch._id,
          dispatchedAt: batch.dispatchedAt,
        });
      });

      res.json({ message: "Batch marked as dispatched", batch });
    } catch (err) {
      console.error("[wholesaler/dispatch]", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
