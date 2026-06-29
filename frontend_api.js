// api.js — drop this file into your React project's src/ folder
// Every function talks to the FastAPI backend at localhost:8000

const BASE = "http://localhost:8000";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Menu ────────────────────────────────────────────────
export const getMenu = () => req("/menu");

// ── Ratings ─────────────────────────────────────────────
export const getRatings = (foodItem, limit = 100) =>
  req(`/ratings${foodItem ? `?food_item=${encodeURIComponent(foodItem)}` : ""}${
    foodItem ? `&limit=${limit}` : `?limit=${limit}`
  }`);

export const submitRating = ({ studentId, foodItem, meal, rating, comment, hostel, branch, year }) =>
  req("/rate", {
    method: "POST",
    body: JSON.stringify({
      student_id: studentId,
      food_item:  foodItem,
      meal,
      rating,
      comment: comment || "",
      hostel,
      branch,
      year,
    }),
  });

// ── Analytics ───────────────────────────────────────────
export const getSummary = () => req("/analytics/summary");
export const getTrend   = (days = 30) => req(`/analytics/trend?days=${days}`);
