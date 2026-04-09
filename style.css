:root {
  --bg: #161411;
  --panel: #211d18;
  --panel-2: #2b241d;
  --text: #f0e6d2;
  --muted: #b9a98c;
  --accent: #b8893c;
  --accent-2: #6b9e87;
  --danger: #b85c5c;
  --border: #4b3f33;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

.hero {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(180deg, #241d16, #161411);
  border-bottom: 1px solid var(--border);
}

.layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
}

label, input, select, button { display: block; width: 100%; }
input, select {
  margin: 0.35rem 0 1rem;
  padding: 0.75rem;
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
}

button {
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #161411;
  font-weight: bold;
  cursor: pointer;
}

button:hover { opacity: 0.92; }
.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.filter-btn {
  width: auto;
  background: var(--panel-2);
  color: var(--text);
  border: 1px solid var(--border);
}
.filter-btn.active { background: var(--accent-2); color: #111; }

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.item-card {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem;
}
.item-card h3 { margin-top: 0; }
.tag {
  display: inline-block;
  margin-bottom: 0.75rem;
  padding: 0.25rem 0.6rem;
  background: #3b3127;
  border-radius: 999px;
  color: var(--muted);
  font-size: 0.85rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}
.muted { color: var(--muted); }
.gold-box, .cart-summary {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--panel-2);
  border-radius: 8px;
}
.buy-btn { margin-top: 1rem; background: var(--accent-2); }
.message { min-height: 1.5rem; margin-top: 0.8rem; color: var(--muted); }
.error { color: #ff9a9a; }
.success { color: #9fe3b5; }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
}
