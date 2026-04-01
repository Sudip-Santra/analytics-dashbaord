import { apiFetch } from "./api";

const FLUSH_INTERVAL_MS = 5000; // flush every 5 seconds
const MAX_BATCH_SIZE = 10;      // flush when queue hits 10

let queue: string[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flush() {
  if (queue.length === 0) return;

  const batch = queue.splice(0); // take all and clear
  try {
    await apiFetch("/track", {
      method: "POST",
      body: { clicks: batch.map((feature_name) => ({ feature_name })) },
    });
  } catch {
    // Put them back at the front so they retry on next flush
    queue.unshift(...batch);
  }
}

export function enqueueClick(featureName: string) {
  queue.push(featureName);
  if (queue.length >= MAX_BATCH_SIZE) {
    flush();
  }
}

export function startTracker() {
  if (flushTimer) return;
  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);

  // Flush remaining clicks when user leaves the page
  window.addEventListener("beforeunload", () => {
    if (queue.length === 0) return;
    const body = JSON.stringify({ clicks: queue.map((feature_name) => ({ feature_name })) });
    // keepalive fetch sends credentials (cookies) unlike sendBeacon cross-origin
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body,
    });
    queue = [];
  });
}

export function stopTracker() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  // Final flush
  flush();
}
