import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from "recharts";
import {
  Star, TrendingUp, TrendingDown, MessageSquare, Users,
  ChefHat, ThumbsUp, Filter, Clock, Award, Utensils, BarChart2, BookOpen
} from "lucide-react";

const MENU_ITEMS = [
  { id: 1, name: "Idli Sambar", meal: "breakfast", category: "veg", emoji: "🍱" },
  { id: 2, name: "Poha", meal: "breakfast", category: "veg", emoji: "🫕" },
  { id: 3, name: "Bread Omelette", meal: "breakfast", category: "non-veg", emoji: "🍳" },
  { id: 4, name: "Dal Rice", meal: "lunch", category: "veg", emoji: "🍛" },
  { id: 5, name: "Rajma Chawal", meal: "lunch", category: "veg", emoji: "🫘" },
  { id: 6, name: "Chicken Curry", meal: "lunch", category: "non-veg", emoji: "🍗" },
  { id: 7, name: "roti sabzi", meal: "lunch", category: "veg", emoji: "🫓" },
  { id: 8, name: "Samosa", meal: "snacks", category: "veg", emoji: "🥟" },
  { id: 9, name: "Masala Chai", meal: "snacks", category: "veg", emoji: "☕" },
  { id: 10, name: "Dal Tadka", meal: "dinner", category: "veg", emoji: "🍲" },
  { id: 11, name: "Paneer Butter Masala", meal: "dinner", category: "veg", emoji: "🧀" },
  { id: 12, name: "Egg Curry", meal: "dinner", category: "non-veg", emoji: "🥚" },
  { id: 13, name: "Jeera Rice", meal: "dinner", category: "veg", emoji: "🍚" },
  { id: 14, name:"masala Dosa",meal:"breakfast", category:"veg", emoji:" "}
];

const MEAL_COLORS = { breakfast: "#F59E0B", lunch: "#10B981", dinner: "#6366F1", snacks: "#F97316" };
const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks" };

const COMMENTS = {
  5: ["Absolutely delicious! Best meal this week.", "Perfect seasoning and so fresh!", "Loved it, please make this more often.", "Outstanding quality today!"],
  4: ["Pretty good today, well cooked.", "Tasty as usual, slight improvement needed.", "Good portion size and great taste.", "Enjoyed it, minor tweaks would make it perfect."],
  3: ["Average today, could be better.", "Okay-ish, nothing special.", "Edible but not great quality.", "Mediocre compared to usual."],
  2: ["Too salty today, please check.", "Slightly undercooked today.", "Not fresh enough sadly.", "Disappointing compared to usual."],
  1: ["Terrible quality today, please improve.", "Very disappointed with this.", "Not acceptable for a campus mess."]
};
const NAMES = ["Rahul K.", "Priya S.", "Amit P.", "Sneha R.", "Vikram M.", "Ananya T.", "Rohan G.", "Divya N.", "Arjun L.", "Meera B.", "Karan V.", "Ishaan D."];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateRatings() {
  const BIAS = {
    1: [5,5,4,4,3], 2: [5,4,4,3,3], 3: [4,4,3,3,2], 4: [5,5,5,4,4],
    5: [5,4,4,4,3], 6: [4,4,3,3,2], 7: [5,5,4,4,3], 8: [5,5,5,4,4],
    9: [5,5,4,4,3], 10:[4,4,3,3,2], 11:[5,5,5,4,4], 12:[4,4,3,3,2], 13:[4,4,3,2,2]
  };
  const ratings = [];
  let id = 1;
  MENU_ITEMS.forEach(item => {
    const n = Math.floor(Math.random() * 12) + 10;
    for (let i = 0; i < n; i++) {
      const pool = BIAS[item.id] || [4,3,3,2];
      const rating = pool[Math.floor(Math.random() * pool.length)];
      const dayIdx = Math.floor(Math.random() * 7);
      ratings.push({
        id: id++, itemId: item.id, rating,
        comment: COMMENTS[rating][Math.floor(Math.random() * COMMENTS[rating].length)],
        student: NAMES[Math.floor(Math.random() * NAMES.length)],
        day: DAYS[dayIdx], dayIdx,
        timestamp: new Date(Date.now() - Math.random() * 7 * 86400000)
      });
    }
  });
  return ratings;
}

const SEED_RATINGS = generateRatings();

function DisplayStars({ rating, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size}
          fill={s <= Math.round(rating) ? "#F59E0B" : "none"}
          stroke={s <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"} />
      ))}
    </span>
  );
}

function sentimentBadge(r) {
  if (r >= 4.5) return { bg: "#D1FAE5", text: "#065F46", label: "Excellent" };
  if (r >= 3.5) return { bg: "#FEF3C7", text: "#92400E", label: "Good" };
  if (r >= 2.5) return { bg: "#FED7AA", text: "#9A3412", label: "Average" };
  return { bg: "#FEE2E2", text: "#991B1B", label: "Poor" };
}

export default function MessRatingApp() {
  const [tab, setTab] = useState("dashboard");
  const [ratings, setRatings] = useState(SEED_RATINGS);
  const [mealFilter, setMealFilter] = useState("all");
  const [hover, setHover] = useState({});
  const [newRating, setNewRating] = useState({});
  const [newComment, setNewComment] = useState({});
  const [submitted, setSubmitted] = useState(new Set());
  const [reviewFilter, setReviewFilter] = useState("all");

  const avgRating = useMemo(() => (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1), [ratings]);
  const totalReviews = ratings.length;

  const itemStats = useMemo(() => MENU_ITEMS.map(item => {
    const rs = ratings.filter(r => r.itemId === item.id);
    const avg = rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
    return { ...item, avgRating: avg, count: rs.length };
  }).sort((a, b) => b.avgRating - a.avgRating), [ratings]);

  const weeklyTrend = useMemo(() => DAYS.map(day => {
    const rs = ratings.filter(r => r.day === day);
    const avg = rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
    return { day, avg: parseFloat(avg.toFixed(2)), count: rs.length };
  }), [ratings]);

  const mealStats = useMemo(() => ["breakfast","lunch","dinner","snacks"].map(meal => {
    const ids = MENU_ITEMS.filter(i => i.meal === meal).map(i => i.id);
    const rs = ratings.filter(r => ids.includes(r.itemId));
    const avg = rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
    return { meal: MEAL_LABELS[meal], avg: parseFloat(avg.toFixed(2)), count: rs.length, color: MEAL_COLORS[meal] };
  }), [ratings]);

  const ratingDist = useMemo(() => [5,4,3,2,1].map(star => ({
    star, count: ratings.filter(r => r.rating === star).length,
    pct: Math.round(ratings.filter(r => r.rating === star).length / ratings.length * 100)
  })), [ratings]);

  const topItems = itemStats.slice(0, 3);
  const worstItems = [...itemStats].sort((a, b) => a.avgRating - b.avgRating).slice(0, 3);
  const recentReviews = useMemo(() =>
    [...ratings].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6)
      .map(r => ({ ...r, item: MENU_ITEMS.find(i => i.id === r.itemId) }))
  , [ratings]);
  const filteredReviews = useMemo(() => {
    let f = [...ratings].sort((a, b) => b.timestamp - a.timestamp);
    if (reviewFilter !== "all") f = f.filter(r => r.itemId === parseInt(reviewFilter));
    return f.map(r => ({ ...r, item: MENU_ITEMS.find(i => i.id === r.itemId) }));
  }, [ratings, reviewFilter]);

  const menuToShow = mealFilter === "all" ? MENU_ITEMS : MENU_ITEMS.filter(i => i.meal === mealFilter);

  function submitRating(itemId) {
    if (!newRating[itemId]) return;
    setRatings(prev => [...prev, {
      id: prev.length + 1, itemId, rating: newRating[itemId],
      comment: newComment[itemId] || "", student: "You",
      day: DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
      dayIdx: new Date().getDay(), timestamp: new Date()
    }]);
    setSubmitted(prev => new Set([...prev, itemId]));
  }

  const NAV = [
    { key: "dashboard", label: "Dashboard", icon: <BarChart2 size={14} /> },
    { key: "rate", label: "Rate Today", icon: <Star size={14} /> },
    { key: "analytics", label: "Analytics", icon: <TrendingUp size={14} /> },
    { key: "reviews", label: "Reviews", icon: <MessageSquare size={14} /> },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "var(--color-background-tertiary)", minHeight: "100vh", paddingBottom: 48 }}>
      {/* Top bar */}
      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "14px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "7px 9px", display: "inline-flex" }}>
            <ChefHat size={20} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>Campus Mess</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)", marginTop: 1 }}>Food Rating & Analytics</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", fontFamily: "var(--font-sans)" }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{totalReviews} total reviews</span>
            <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>● Live</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, fontFamily: "var(--font-sans)" }}>
          {NAV.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 14px", fontSize: 12, cursor: "pointer", borderRadius: "6px 6px 0 0",
              background: tab === key ? "var(--color-background-tertiary)" : "transparent",
              color: tab === key ? "#D97706" : "var(--color-text-secondary)",
              border: tab === key ? "0.5px solid var(--color-border-tertiary)" : "0.5px solid transparent",
              borderBottom: tab === key ? "0.5px solid var(--color-background-tertiary)" : "0.5px solid transparent",
              fontWeight: tab === key ? 500 : 400, marginBottom: tab === key ? -1 : 0
            }}>{icon}{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
              {[
                { label: "Avg Rating", value: avgRating, sub: "out of 5.0", icon: <Star size={15} color="#F59E0B" fill="#F59E0B" />, accent: "#FEF3C7" },
                { label: "Total Reviews", value: totalReviews, sub: "this week", icon: <MessageSquare size={15} color="#6366F1" />, accent: "#EEF2FF" },
                { label: "Menu Items", value: MENU_ITEMS.length, sub: "on today's menu", icon: <Utensils size={15} color="#10B981" />, accent: "#D1FAE5" },
                { label: "Participation", value: "73%", sub: "students rated", icon: <Users size={15} color="#F97316" />, accent: "#FFF7ED" },
              ].map(({ label, value, sub, icon, accent }) => (
                <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>{label}</span>
                    <span style={{ background: accent, borderRadius: 6, padding: "3px 5px", display: "inline-flex" }}>{icon}</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)", marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Top Rated */}
              <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <TrendingUp size={15} color="#10B981" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Top Rated This Week</span>
                </div>
                {topItems.map((item, i) => (
                  <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < 2 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <DisplayStars rating={item.avgRating} />
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>{item.avgRating.toFixed(1)} · {item.count} reviews</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, background: "#D1FAE5", color: "#065F46", padding: "2px 9px", borderRadius: 12, fontFamily: "var(--font-sans)" }}>#{i + 1}</span>
                  </div>
                ))}
              </div>

              {/* Needs Improvement */}
              <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <TrendingDown size={15} color="#EF4444" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Needs Improvement</span>
                </div>
                {worstItems.map((item, i) => (
                  <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < 2 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <DisplayStars rating={item.avgRating} />
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>{item.avgRating.toFixed(1)} · {item.count} reviews</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, background: "#FEE2E2", color: "#991B1B", padding: "2px 9px", borderRadius: 12, fontFamily: "var(--font-sans)" }}>Low</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly mini chart + recent reviews */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14 }}>
              <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px" }}>
                <span style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 14 }}>Rating Trend — This Week</span>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.12)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "sans-serif" }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} width={24} />
                    <Tooltip formatter={v => v.toFixed(1)} contentStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                    <Line type="monotone" dataKey="avg" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px" }}>
                <span style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 12 }}>Latest Feedback</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentReviews.slice(0, 4).map(r => {
                    const s = sentimentBadge(r.rating);
                    return (
                      <div key={r.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
                        <span style={{ fontSize: 16 }}>{r.item?.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, fontWeight: 500 }}>{r.item?.name}</span>
                            <span style={{ fontSize: 10, background: s.bg, color: s.text, padding: "1px 7px", borderRadius: 10, fontFamily: "sans-serif" }}>{s.label}</span>
                          </div>
                          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "sans-serif" }}>{r.student} · {r.day}</span>
                        </div>
                        <DisplayStars rating={r.rating} size={11} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RATE TODAY ── */}
        {tab === "rate" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {[["all","All Meals","#6B7280"], ...Object.entries(MEAL_LABELS).map(([k, v]) => [k, v, MEAL_COLORS[k]])].map(([val, label, color]) => (
                <button key={val} onClick={() => setMealFilter(val)} style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "sans-serif",
                  background: mealFilter === val ? color : "var(--color-background-secondary)",
                  color: mealFilter === val ? "#fff" : "var(--color-text-secondary)",
                  border: `0.5px solid ${mealFilter === val ? color : "var(--color-border-tertiary)"}`,
                  fontWeight: mealFilter === val ? 500 : 400,
                }}>{label}</button>
              ))}
            </div>

            {["breakfast","lunch","snacks","dinner"].filter(m => mealFilter === "all" || mealFilter === m).map(meal => {
              const items = menuToShow.filter(i => i.meal === meal);
              if (!items.length) return null;
              return (
                <div key={meal} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: MEAL_COLORS[meal] }} />
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{MEAL_LABELS[meal]}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {items.map(item => {
                      const stats = itemStats.find(i => i.id === item.id);
                      const done = submitted.has(item.id);
                      const cur = newRating[item.id] || 0;
                      const hov = hover[item.id] || 0;
                      return (
                        <div key={item.id} style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: done ? "1px solid #6EE7B7" : "0.5px solid var(--color-border-tertiary)", padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <span style={{ fontSize: 28 }}>{item.emoji}</span>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontFamily: "sans-serif", background: item.category === "veg" ? "#D1FAE5" : "#FEE2E2", color: item.category === "veg" ? "#065F46" : "#991B1B" }}>{item.category}</span>
                          </div>
                          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{item.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                            <DisplayStars rating={stats?.avgRating || 0} size={11} />
                            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "sans-serif" }}>{(stats?.avgRating || 0).toFixed(1)} avg</span>
                          </div>
                          {!done ? (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "sans-serif" }}>Your rating:</span>
                                <span style={{ display: "inline-flex", gap: 2 }}>
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={18}
                                      fill={s <= (hov || cur) ? "#F59E0B" : "none"}
                                      stroke={s <= (hov || cur) ? "#F59E0B" : "#D1D5DB"}
                                      style={{ cursor: "pointer" }}
                                      onMouseEnter={() => setHover(p => ({...p, [item.id]: s}))}
                                      onMouseLeave={() => setHover(p => ({...p, [item.id]: 0}))}
                                      onClick={() => setNewRating(p => ({...p, [item.id]: s}))}
                                    />
                                  ))}
                                </span>
                              </div>
                              <textarea
                                placeholder="Comment (optional)…"
                                value={newComment[item.id] || ""}
                                onChange={e => setNewComment(p => ({...p, [item.id]: e.target.value}))}
                                style={{ width: "100%", height: 44, fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", resize: "none", fontFamily: "sans-serif", boxSizing: "border-box", background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}
                              />
                              <button onClick={() => submitRating(item.id)} disabled={!cur} style={{
                                marginTop: 8, width: "100%", padding: "7px 0", borderRadius: 6, fontSize: 12, cursor: cur ? "pointer" : "not-allowed", fontFamily: "sans-serif",
                                background: cur ? "#FEF3C7" : "var(--color-background-secondary)",
                                color: cur ? "#D97706" : "var(--color-text-tertiary)",
                                border: `0.5px solid ${cur ? "#FCD34D" : "var(--color-border-tertiary)"}`,
                                fontWeight: cur ? 500 : 400
                              }}>Submit Rating</button>
                            </>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", background: "#D1FAE5", borderRadius: 8 }}>
                              <ThumbsUp size={14} color="#065F46" />
                              <span style={{ fontSize: 12, color: "#065F46", fontFamily: "sans-serif" }}>Thanks for rating!</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Weekly trend */}
              <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px" }}>
                <span style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 14 }}>Weekly Rating Trend</span>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.12)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "sans-serif" }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} width={22} />
                    <Tooltip formatter={v => v.toFixed(1)} contentStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                    <Line type="monotone" dataKey="avg" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 3 }} activeDot={{ r: 5 }} name="Avg Rating" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Meal radar */}
              <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px" }}>
                <span style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 14 }}>Meal Quality Radar</span>
                <ResponsiveContainer width="100%" height={190}>
                  <RadarChart data={mealStats}>
                    <PolarGrid stroke="rgba(107,114,128,0.2)" />
                    <PolarAngleAxis dataKey="meal" tick={{ fontSize: 11, fontFamily: "sans-serif" }} />
                    <Radar name="Avg" dataKey="avg" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                    <Tooltip formatter={v => v.toFixed(1)} contentStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rating Distribution */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 14 }}>Rating Distribution</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {ratingDist.map(({ star, count, pct }) => (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "sans-serif" }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", width: 28 }}>{star}★</span>
                    <div style={{ flex: 1, height: 13, background: "var(--color-background-secondary)", borderRadius: 7, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: star >= 4 ? "#F59E0B" : star === 3 ? "#FCD34D" : "#FCA5A5", borderRadius: 7 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)", width: 70, textAlign: "right" }}>{pct}% ({count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal breakdown bar */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 14 }}>Average Rating by Meal</span>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, fontFamily: "sans-serif" }}>
                {mealStats.map(m => (
                  <span key={m.meal} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-secondary)" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: m.color, display: "inline-block" }} />
                    {m.meal}
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={mealStats} barSize={44}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.1)" />
                  <XAxis dataKey="meal" tick={{ fontSize: 11, fontFamily: "sans-serif" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} width={22} />
                  <Tooltip formatter={v => v.toFixed(1)} contentStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                  <Bar dataKey="avg" radius={[5, 5, 0, 0]} name="Avg Rating">
                    {mealStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Food item leaderboard */}
            <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "16px 18px" }}>
              <span style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 14 }}>Food Item Leaderboard</span>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={itemStats} layout="vertical" barSize={13} margin={{ left: 10, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10, fontFamily: "sans-serif" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: "sans-serif" }} width={110} />
                  <Tooltip formatter={v => v.toFixed(2)} contentStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                  <Bar dataKey="avgRating" radius={[0, 5, 5, 0]} name="Avg Rating">
                    {itemStats.map((entry, i) => (
                      <Cell key={i} fill={MEAL_COLORS[entry.meal]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontFamily: "sans-serif" }}>
              <Filter size={14} color="var(--color-text-secondary)" />
              <select value={reviewFilter} onChange={e => setReviewFilter(e.target.value)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer" }}>
                <option value="all">All Items</option>
                {MENU_ITEMS.map(i => <option key={i.id} value={i.id}>{i.emoji} {i.name}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{filteredReviews.length} reviews</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {filteredReviews.map(r => {
                const s = sentimentBadge(r.rating);
                return (
                  <div key={r.id} style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 22 }}>{r.item?.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{r.item?.name}</span>
                        <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", fontFamily: "sans-serif", textTransform: "capitalize" }}>{r.item?.meal}</span>
                        <DisplayStars rating={r.rating} size={12} />
                        <span style={{ fontSize: 10, background: s.bg, color: s.text, padding: "1px 8px", borderRadius: 10, fontFamily: "sans-serif" }}>{s.label}</span>
                      </div>
                      {r.comment && (
                        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "sans-serif", fontStyle: "italic" }}>
                          "{r.comment}"
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "sans-serif" }}>— {r.student}</span>
                        <Clock size={10} color="var(--color-text-tertiary)" />
                        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "sans-serif" }}>{r.day}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
