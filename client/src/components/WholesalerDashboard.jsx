// components/WholesalerDashboard.jsx
// Member 4 — Real-time dashboard for wholesalers
// Receives live "newBatch" + "newOrder" events via Socket.io

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import BatchTimer from "./BatchTimer";
import api from "../services/api";
import { socket } from "../services/socket";

export default function WholesalerDashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch initial dashboard data ──────────────────────────
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get("/wholesaler/dashboard");
        setStats(data.stats || []);
        setPendingOrders(data.pendingOrders || []);
        if (data.latestBatch) setBatches([data.latestBatch]);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ── Socket.io — join room + listen for events ─────────────
  useEffect(() => {
    if (!user?._id) return;

    // Join the wholesaler's private room
    // Server-side: io.to(`wholesaler:${id}`).emit(...)
    socket.emit("joinRoom", { userId: user._id, role: "wholesaler" });

    // New order placed by a shop owner — arrives in real time
    socket.on("newOrder", (order) => {
      setPendingOrders((prev) => [order, ...prev]);
      addAlert(`📦 New order from ${order.shopOwner?.shopName || "a shop"}`, "info");
    });

    // Cron job completed — a new batch was created
    socket.on("newBatch", ({ batchId, orderCount, message }) => {
      addAlert(`🚚 ${message}`, "success");
      setBatches((prev) => [{ _id: batchId, orderCount, status: "pending" }, ...prev]);
    });

    return () => {
      socket.off("newOrder");
      socket.off("newBatch");
    };
  }, [user]);

  function addAlert(message, type = "info") {
    const id = Date.now();
    setLiveAlerts((prev) => [{ id, message, type }, ...prev].slice(0, 5));
    // Auto-dismiss after 6s
    setTimeout(() => setLiveAlerts((prev) => prev.filter((a) => a.id !== id)), 6000);
  }

  async function handleDispatch(batchId) {
    try {
      await api.patch(`/wholesaler/batches/${batchId}/dispatch`);
      setBatches((prev) =>
        prev.map((b) => (b._id === batchId ? { ...b, status: "dispatched" } : b))
      );
      addAlert("✅ Batch marked as dispatched!", "success");
    } catch (err) {
      addAlert("❌ Dispatch failed. Try again.", "error");
    }
  }

  // ── Derived stat helpers ───────────────────────────────────
  const getStatCount = (statusName) =>
    stats.find((s) => s._id === statusName)?.count || 0;
  const getStatValue = (statusName) =>
    stats.find((s) => s._id === statusName)?.totalValue || 0;

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading dashboard…
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Wholesaler Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.name} · Live updates via Socket.io
          </p>
        </div>
        {/* Batch Countdown Timer — updates from socket events */}
        <BatchTimer />
      </div>

      {/* ── Live Alerts ── */}
      {liveAlerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {liveAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`px-4 py-3 rounded-lg text-sm font-medium shadow transition-all
                ${alert.type === "success" ? "bg-green-100 text-green-800 border border-green-300" : ""}
                ${alert.type === "error" ? "bg-red-100 text-red-800 border border-red-300" : ""}
                ${alert.type === "info" ? "bg-blue-100 text-blue-800 border border-blue-300" : ""}
              `}
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending Orders", status: "pending", color: "yellow" },
          { label: "Batched", status: "batched", color: "blue" },
          { label: "Dispatched", status: "dispatched", color: "green" },
          { label: "Cancelled", status: "cancelled", color: "red" },
        ].map(({ label, status, color }) => (
          <div key={status} className="bg-white rounded-xl shadow p-4 border-l-4"
            style={{ borderColor: colorMap[color] }}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color: colorMap[color] }}>
              {getStatCount(status)}
            </p>
            {getStatValue(status) > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                ₹{getStatValue(status).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Pending Orders ── */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Pending Orders
            {pendingOrders.length > 0 && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </h2>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">
              No pending orders right now.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pendingOrders.map((order) => (
                <li key={order._id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {order.shopOwner?.shopName || "Shop Owner"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.items?.length || 0} item(s) ·{" "}
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      ₹{order.totalAmount?.toLocaleString("en-IN") || "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Batches ── */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Recent Batches
          </h2>
          {batches.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">
              No batches yet. The cron runs every 6 hours.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <li key={batch._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Batch #{String(batch._id).slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {batch.orderCount || batch.orders?.length || 0} order(s) ·{" "}
                      <span
                        className={`font-medium ${
                          batch.status === "dispatched"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {batch.status}
                      </span>
                    </p>
                  </div>
                  {batch.status === "pending" && (
                    <button
                      onClick={() => handleDispatch(batch._id)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      Mark Dispatched
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const colorMap = {
  yellow: "#D97706",
  blue: "#2563EB",
  green: "#16A34A",
  red: "#DC2626",
};
