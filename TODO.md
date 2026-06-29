- [ ] Fix FastAPI /ratings response shape to include fields React expects: itemId, student, timestamp (join ratings.food_item with menu_items.name -> id; derive timestamp from ratings.date)
- [ ] (Optional) Add defensive mapping in frontend if UI still blanks
- [ ] Run backend (uvicorn main:app --reload)
- [ ] Run frontend (cd frontend && npm run dev) and verify dashboard renders and DB writes work

