// ╔══════════════════════════════════════════════════════════╗
// ║  server.js  —  KiranaConnect Backend Entry Point         ║
// ║  Member 4 owns: cron setup + Socket.io room management   ║
// ╚══════════════════════════════════════════════════════════╝

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cron = require("node-cron");
const cors = require("cors");

// ── Route imports (each member's routes) ──────────────────
const authRoutes = require("./routes/auth");           // Member 1
const productRoutes = require("./routes/products");    // Member 2
const orderRoutes = require("./routes/orders");        // Member 3
const wholesalerRoutes = require("./routes/wholesaler"); // Member 4 ← this file

// ── Models ─────────────────────────────────────────────────
const Order = require("./models/Order");
const Batch = require("./models/Batch");

// ── App + HTTP server setup ────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Socket.io setup ────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach io to every request so routes can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wholesaler", wholesalerRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── MongoDB connection ─────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ════════════════════════════════════════════════════════════
//  SOCKET.IO — Room management
//  Wholesalers join "wholesaler:<id>" rooms on connect.
//  This lets us do targeted pushes: io.to('wholesaler:abc').emit(...)
// ════════════════════════════════════════════════════════════
io.on("connection", (socket) => {
  console.log(`[socket] client connected: ${socket.id}`);

  // Client sends { userId, role } after connecting
  socket.on("joinRoom", ({ userId, role }) => {
    if (!userId) return;

    if (role === "wholesaler") {
      socket.join(`wholesaler:${userId}`);
      console.log(`[socket] wholesaler ${userId} joined room wholesaler:${userId}`);
    } else if (role === "shopOwner") {
      socket.join(`shopOwner:${userId}`);
      console.log(`[socket] shopOwner ${userId} joined room shopOwner:${userId}`);
    }
  });

  // Shop owners subscribe to a specific order's updates
  socket.on("watchOrder", ({ orderId }) => {
    socket.join(`order:${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log(`[socket] client disconnected: ${socket.id}`);
  });
});

// ════════════════════════════════════════════════════════════
//  NODE-CRON — Batch aggregation every 6 hours
//
//  Expression: "0 0,6,12,18 * * *"
//  Breakdown:
//    0          → minute 0
//    0,6,12,18  → hours 0, 6, 12, 18 (midnight, 6am, noon, 6pm)
//    * * *      → every day, every month, every weekday
//
//  HOW LIBUV FIRES THIS:
//  node-cron registers a setInterval with libuv's timer API.
//  libuv's event loop checks timers at the start of each tick.
//  When the wall clock matches the expression, the callback is
//  pushed onto the Node.js call stack — single-threaded, non-blocking.
//
//  IDEMPOTENCY (why the unique index matters):
//  If the server restarts at 06:00:01 and cron fires again,
//  it computes the same batchWindow (truncated to 6hr boundary).
//  Batch.create() throws E11000 duplicate key → we catch & skip.
//  No double-batch. No lost orders. Safe to restart anytime.
// ════════════════════════════════════════════════════════════
cron.schedule("0 0,6,12,18 * * *", async () => {
  console.log(`[cron] Batch job triggered at ${new Date().toISOString()}`);
  await runBatchJob(io);
});

async function runBatchJob(io) {
  // Compute the start of the current 6-hour window
  const now = new Date();
  const hour = now.getUTCHours();
  const windowHour = Math.floor(hour / 6) * 6; // 0, 6, 12, or 18
  const batchWindow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), windowHour, 0, 0, 0)
  );

  try {
    // Fetch all pending orders placed before this batch window
    const pendingOrders = await Order.find({
      status: "pending",
      createdAt: { $lt: batchWindow },
    }).populate("wholesaler", "_id");

    if (pendingOrders.length === 0) {
      console.log("[cron] No pending orders — skipping batch creation");
      return;
    }

    // Group orders by wholesaler
    const wholesalerMap = {};
    pendingOrders.forEach((order) => {
      const wId = order.wholesaler._id.toString();
      if (!wholesalerMap[wId]) wholesalerMap[wId] = { orderIds: [], totalItems: 0 };
      wholesalerMap[wId].orderIds.push(order._id);
      wholesalerMap[wId].totalItems += order.items?.length || 0;
    });

    const wholesalerGroups = Object.entries(wholesalerMap).map(([wId, data]) => ({
      wholesaler: wId,
      orderIds: data.orderIds,
      totalItems: data.totalItems,
    }));

    // ── IDEMPOTENT INSERT ──────────────────────────────────
    // If batchWindow already exists → duplicate key error → silent skip
    const batch = await Batch.create({
      batchWindow,
      orders: pendingOrders.map((o) => o._id),
      wholesalerGroups,
      status: "pending",
    });

    console.log(`[cron] ✅ Batch created: ${batch._id} | orders: ${pendingOrders.length}`);

    // Mark orders as "batched"
    await Order.updateMany(
      { _id: { $in: pendingOrders.map((o) => o._id) } },
      { status: "batched", batchId: batch._id }
    );

    // ── SOCKET.IO — notify each wholesaler in their private room ──
    wholesalerGroups.forEach(({ wholesaler, orderIds }) => {
      io.to(`wholesaler:${wholesaler}`).emit("newBatch", {
        batchId: batch._id,
        batchWindow,
        orderCount: orderIds.length,
        message: `New batch of ${orderIds.length} order(s) ready for dispatch`,
      });
    });

    // Broadcast next batch window time to ALL connected clients
    // Used by BatchTimer.jsx countdown
    const nextWindow = new Date(batchWindow.getTime() + 6 * 60 * 60 * 1000);
    io.emit("nextBatchWindow", { nextWindow: nextWindow.toISOString() });

  } catch (err) {
    if (err.code === 11000) {
      // ── IDEMPOTENCY: duplicate key → batch already exists → skip ──
      console.log(`[cron] ⚠️  Batch for window ${batchWindow.toISOString()} already exists — skipping (idempotent)`);
    } else {
      console.error("[cron] ❌ Batch job error:", err);
    }
  }
}

// Expose runBatchJob for manual testing
app.post("/api/admin/trigger-batch", async (req, res) => {
  await runBatchJob(io);
  res.json({ message: "Batch job triggered manually" });
});

// ── Start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 KiranaConnect server running on port ${PORT}`);
  // Emit initial next-batch-window on startup so BatchTimer initializes
  const now = new Date();
  const hour = now.getUTCHours();
  const nextWindowHour = (Math.floor(hour / 6) + 1) * 6;
  const nextWindow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), nextWindowHour % 24, 0, 0, 0)
  );
  if (nextWindowHour >= 24) nextWindow.setUTCDate(nextWindow.getUTCDate() + 1);
  console.log(`[cron] Next batch window: ${nextWindow.toISOString()}`);
});

module.exports = { app, server, io };
