// components/BatchTimer.jsx
// Member 4 — Countdown timer to the next 6-hour batch window
//
// HOW IT WORKS:
//  1. On mount, calculates the next batch window from the client clock.
//  2. Listens for "nextBatchWindow" Socket.io events from the server
//     (emitted right after each cron job runs) to stay in sync.
//  3. A setInterval ticks every second to update the countdown.

import { useEffect, useState } from "react";
import { socket } from "../services/socket";

// Compute milliseconds until the next 0/6/12/18 UTC hour boundary
function msUntilNextBatchWindow() {
  const now = new Date();
  const hour = now.getUTCHours();
  const nextWindowHour = (Math.floor(hour / 6) + 1) * 6;

  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      nextWindowHour % 24,
      0,
      0,
      0
    )
  );

  // If nextWindowHour overflows to next day
  if (nextWindowHour >= 24) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  return next.getTime() - Date.now();
}

function formatCountdown(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function BatchTimer() {
  const [msLeft, setMsLeft] = useState(msUntilNextBatchWindow);
  const [justBatched, setJustBatched] = useState(false);

  // ── Countdown tick ─────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setMsLeft(msUntilNextBatchWindow());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Socket.io sync — server tells us when a batch just ran ──
  useEffect(() => {
    socket.on("nextBatchWindow", ({ nextWindow }) => {
      const ms = new Date(nextWindow).getTime() - Date.now();
      setMsLeft(ms > 0 ? ms : 0);

      // Flash the "Just batched!" indicator
      setJustBatched(true);
      setTimeout(() => setJustBatched(false), 4000);
    });

    return () => socket.off("nextBatchWindow");
  }, []);

  // Color feedback: red when < 30 min, yellow < 1 hr, green otherwise
  const urgency =
    msLeft < 30 * 60 * 1000
      ? "text-red-600 border-red-200 bg-red-50"
      : msLeft < 60 * 60 * 1000
      ? "text-yellow-600 border-yellow-200 bg-yellow-50"
      : "text-green-700 border-green-200 bg-green-50";

  return (
    <div className={`flex flex-col items-center px-5 py-3 rounded-xl border-2 shadow-sm ${urgency}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
        Next Batch In
      </p>
      <p className="text-3xl font-mono font-bold tabular-nums leading-none">
        {formatCountdown(msLeft)}
      </p>
      <p className="text-xs mt-1 opacity-60">Runs at 00:00 · 06:00 · 12:00 · 18:00 UTC</p>

      {justBatched && (
        <span className="mt-2 text-xs font-medium bg-green-600 text-white px-3 py-0.5 rounded-full animate-pulse">
          ✅ Batch just ran!
        </span>
      )}
    </div>
  );
}
