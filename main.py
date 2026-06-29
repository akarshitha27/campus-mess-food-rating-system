"""
Campus Mess Food Rating System — FastAPI Backend
Run: uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3, json
from datetime import datetime

app = FastAPI(title="Campus Mess API")

# ── Allow React frontend to call this API ──────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = "mess_ratings.db"

# ── Database setup ──────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS ratings (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  TEXT    NOT NULL,
            food_item   TEXT    NOT NULL,
            meal        TEXT    NOT NULL,
            rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            comment     TEXT,
            date        TEXT    NOT NULL,
            day         TEXT    NOT NULL,
            hostel      TEXT,
            branch      TEXT,
            year        INTEGER
        );

        CREATE TABLE IF NOT EXISTS menu_items (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT UNIQUE NOT NULL,
            meal     TEXT NOT NULL,
            category TEXT NOT NULL,
            emoji    TEXT
        );
    """)
    # Seed menu items if empty
    count = conn.execute("SELECT COUNT(*) FROM menu_items").fetchone()[0]
    if count == 0:
        items = [
            ("Idli Sambar",         "Breakfast", "Veg",     "🍱"),
            ("Poha",                "Breakfast", "Veg",     "🫕"),
            ("Bread Omelette",      "Breakfast", "Non-Veg", "🍳"),
            ("Dal Rice",            "Lunch",     "Veg",     "🍛"),
            ("Rajma Chawal",        "Lunch",     "Veg",     "🫘"),
            ("Chicken Curry",       "Lunch",     "Non-Veg", "🍗"),
            ("roti sabzi",          "Lunch",     "Veg",     "🫓"),
            ("Samosa",              "Snacks",    "Veg",     "🥟"),
            ("Masala Chai",         "Snacks",    "Veg",     "☕"),
            ("Dal Tadka",           "Dinner",    "Veg",     "🍲"),
            ("Paneer Butter Masala","Dinner",    "Veg",     "🧀"),
            ("Egg Curry",           "Dinner",    "Non-Veg", "🥚"),
            ("Jeera Rice",          "Dinner",    "Veg",     "🍚"),
            ("masala Dosa",         "Breakfast",  "veg",     "sd"),
        ]
        conn.executemany(
            "INSERT INTO menu_items (name, meal, category, emoji) VALUES (?,?,?,?)",
            items
        )
    conn.commit()
    conn.close()

init_db()

# ── Pydantic models ─────────────────────────────────────
class RatingIn(BaseModel):
    student_id: str
    food_item:  str
    meal:       str
    rating:     int
    comment:    Optional[str] = ""
    hostel:     Optional[str] = None
    branch:     Optional[str] = None
    year:       Optional[int] = None

# ── Routes ──────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Campus Mess API is running 🍽️"}


@app.get("/menu")
def get_menu():
    """Return all menu items."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM menu_items ORDER BY meal, name").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/rate")
def submit_rating(data: RatingIn):
    """Submit a new food rating."""
    if data.rating not in range(1, 6):
        raise HTTPException(400, "Rating must be 1–5")
    now = datetime.now()
    day = now.strftime("%A")
    conn = get_db()
    conn.execute(
        """INSERT INTO ratings
           (student_id, food_item, meal, rating, comment, date, day, hostel, branch, year)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (data.student_id, data.food_item, data.meal, data.rating,
         data.comment, now.date().isoformat(), day,
         data.hostel, data.branch, data.year)
    )
    conn.commit()
    conn.close()
    return {"status": "ok", "message": "Rating saved ✅"}


@app.get("/ratings")
def get_ratings(food_item: Optional[str] = None, limit: int = 100):
    """Get recent ratings, optionally filtered by food item.

    React frontend expects fields:
      - id
      - itemId
      - rating
      - comment
      - student
      - day
      - timestamp
    """
    conn = get_db()

    # Join ratings.food_item (name) with menu_items.name -> menu_items.id
    # so the frontend can map to its hardcoded MENU_ITEMS.
    base_query = """
        SELECT
          r.id,
          r.student_id      AS student,
          r.food_item       AS foodItem,
          m.id              AS itemId,
          r.meal,
          r.rating,
          r.comment,
          r.day,
          r.date,
          -- Use date + day as a sortable timestamp string React can parse
          r.date || 'T00:00:00Z' AS timestamp
        FROM ratings r
        JOIN menu_items m ON m.name = r.food_item
    """

    if food_item:
        query = base_query + " WHERE r.food_item = ? "
        query += " ORDER BY r.id DESC LIMIT ?"
        rows = conn.execute(query, (food_item, limit)).fetchall()
    else:
        query = base_query + " ORDER BY r.id DESC LIMIT ?"
        rows = conn.execute(query, (limit,)).fetchall()

    conn.close()
    return [dict(r) for r in rows]



@app.get("/analytics/summary")
def get_summary():
    """Dashboard summary stats."""
    conn = get_db()
    total    = conn.execute("SELECT COUNT(*) FROM ratings").fetchone()[0]
    avg      = conn.execute("SELECT ROUND(AVG(rating),2) FROM ratings").fetchone()[0]
    by_meal  = conn.execute(
        "SELECT meal, ROUND(AVG(rating),2) as avg, COUNT(*) as count FROM ratings GROUP BY meal"
    ).fetchall()
    by_item  = conn.execute(
        "SELECT food_item, ROUND(AVG(rating),2) as avg, COUNT(*) as count FROM ratings GROUP BY food_item ORDER BY avg DESC"
    ).fetchall()
    by_day   = conn.execute(
        "SELECT day, ROUND(AVG(rating),2) as avg FROM ratings GROUP BY day"
    ).fetchall()
    dist     = conn.execute(
        "SELECT rating, COUNT(*) as count FROM ratings GROUP BY rating ORDER BY rating"
    ).fetchall()
    conn.close()
    return {
        "total_reviews": total,
        "overall_avg":   avg or 0,
        "by_meal":       [dict(r) for r in by_meal],
        "by_item":       [dict(r) for r in by_item],
        "by_day":        [dict(r) for r in by_day],
        "rating_dist":   [dict(r) for r in dist],
    }


@app.get("/analytics/trend")
def get_trend(days: int = 30):
    """Daily average rating for the last N days."""
    conn = get_db()
    rows = conn.execute(
        """SELECT date, ROUND(AVG(rating),2) as avg, COUNT(*) as count
           FROM ratings
           GROUP BY date
           ORDER BY date DESC
           LIMIT ?""",
        (days,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.delete("/ratings/{rating_id}")
def delete_rating(rating_id: int):
    """Delete a rating by ID (admin use)."""
    conn = get_db()
    conn.execute("DELETE FROM ratings WHERE id=?", (rating_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}
