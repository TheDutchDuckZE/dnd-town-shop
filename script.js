const towns = [
  { name: 'Greenhollow', file: 'data/greenhollow.json' },
  { name: 'Ashport', file: 'data/ashport.json' },
  { name: 'Mooncliff', file: 'data/mooncliff.json' },
  { name: 'Ironford', file: 'data/ironford.json' }
];

let shopData = [];
let baseShopData = [];
let cart = [];
let selectedCategory = 'all';
let currentTown = '';

const playerNameInput = document.getElementById('playerName');
const playerGoldInput = document.getElementById('playerGold');
const displayName = document.getElementById('displayName');
const displayGold = document.getElementById('displayGold');
const townSelect = document.getElementById('townSelect');
const shopItems = document.getElementById('shopItems');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const goldAfter = document.getElementById('goldAfter');
const sheetUrl = document.getElementById('sheetUrl');
const message = document.getElementById('message');

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function populateTowns() {
  townSelect.innerHTML = towns.map(t => `<option value="${t.file}">${t.name}</option>`).join('');
}

function getGold() { return Number(playerGoldInput.value) || 0; }

function updatePlayerBox() {
  displayName.textContent = playerNameInput.value || '-';
  displayGold.textContent = getGold();
  updateCartSummary();
}

function updateCartSummary() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = total;
  goldAfter.textContent = Math.max(getGold() - total, 0);
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = '<p class="muted">Nog geen items gekozen.</p>';
    updateCartSummary();
    return;
  }
  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <span>${item.name} (${item.price} gp)</span>
      <button onclick="removeFromCart(${index})">Verwijder</button>
    </div>
  `).join('');
  updateCartSummary();
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  renderCart();
};

window.addToCart = function(itemId) {
  const item = shopData.find(i => i.id === itemId);
  if (!item) return;
  cart.push(item);
  renderCart();
};

function renderShop() {
  const filtered = selectedCategory === 'all' ? shopData : shopData.filter(i => i.category === selectedCategory);
  if (!filtered.length) {
    shopItems.innerHTML = '<p class="muted">Geen items in deze categorie.</p>';
    return;
  }
  shopItems.innerHTML = filtered.map(item => `
    <article class="item-card">
      <span class="tag">${item.category}</span>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>${item.price} gp</strong></p>
      <button onclick="addToCart(${item.id})">In mandje</button>
    </article>
  `).join('');
}

async function loadTown() {
  const response = await fetch(townSelect.value);
  const data = await response.json();
  currentTown = data.town;
  baseShopData = data.items.map(i => ({ ...i }));
  shopData = data.items.map(i => ({ ...i }));
  cart = [];
  renderShop();
  renderCart();
  showMessage(`${data.town} geladen.`);
}

function savePlayerLocal() {
  const payload = {
    name: playerNameInput.value.trim(),
    gold: getGold(),
    town: currentTown
  };
  if (!payload.name) return showMessage('Vul een spelersnaam in.', 'error');
  localStorage.setItem(`dnd-player-${payload.name}`, JSON.stringify(payload));
  showMessage(`Speler ${payload.name} lokaal opgeslagen.`);
}

function loadPlayerLocal() {
  const name = playerNameInput.value.trim();
  if (!name) return showMessage('Vul eerst een spelersnaam in om te laden.', 'error');
  const raw = localStorage.getItem(`dnd-player-${name}`);
  if (!raw) return showMessage('Geen lokale save gevonden.', 'error');
  const data = JSON.parse(raw);
  playerNameInput.value = data.name;
  playerGoldInput.value = data.gold;
  updatePlayerBox();
  showMessage(`Lokale save van ${data.name} geladen.`);
}

async function savePlayerOnline() {
  const url = sheetUrl.value.trim();
  if (!url) return showMessage('Vul een sheet/API URL in.', 'error');
  const payload = {
    name: playerNameInput.value.trim(),
    gold: getGold(),
    town: currentTown,
    updated_at: new Date().toISOString()
  };
  if (!payload.name) return showMessage('Vul een spelersnaam in.', 'error');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) return showMessage('Online opslaan mislukt.', 'error');
  showMessage(`Speler ${payload.name} opgeslagen naar online sheet.`);
}

async function loadPlayerOnline() {
  const url = sheetUrl.value.trim();
  const name = playerNameInput.value.trim();
  if (!url || !name) return showMessage('Vul spelersnaam en sheet/API URL in.', 'error');

  const response = await fetch(url);
  const data = await response.json();
  const row = Array.isArray(data) ? data.find(r => r.name === name) : null;
  if (!row) return showMessage('Speler niet gevonden in online sheet.', 'error');

  playerNameInput.value = row.name;
  playerGoldInput.value = row.gold;
  updatePlayerBox();
  showMessage(`Speler ${row.name} geladen uit online sheet.`);
}

function exportTownJson() {
  const blob = new Blob([JSON.stringify({ town: currentTown, items: shopData }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentTown.toLowerCase()}-custom.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showMessage(`JSON voor ${currentTown} geëxporteerd.`);
}

function addItemToTown() {
  const name = document.getElementById('newItemName').value.trim();
  const price = Number(document.getElementById('newItemPrice').value);
  const category = document.getElementById('newItemCategory').value;
  const description = document.getElementById('newItemDescription').value.trim();
  if (!name || !description || Number.isNaN(price)) return showMessage('Vul alle itemvelden correct in.', 'error');

  const nextId = shopData.length ? Math.max(...shopData.map(i => i.id)) + 1 : 1;
  shopData.push({ id: nextId, name, price, category, description });
  renderShop();
  showMessage(`${name} toegevoegd aan ${currentTown}.`);
}

function resetTown() {
  shopData = baseShopData.map(i => ({ ...i }));
  renderShop();
  showMessage(`${currentTown} teruggezet naar bestand.`);
}

document.getElementById('loadTownBtn').addEventListener('click', loadTown);
document.getElementById('saveLocalBtn').addEventListener('click', savePlayerLocal);
document.getElementById('loadLocalBtn').addEventListener('click', loadPlayerLocal);
document.getElementById('saveOnlineBtn').addEventListener('click', savePlayerOnline);
document.getElementById('loadOnlineBtn').addEventListener('click', loadPlayerOnline);
document.getElementById('exportTownBtn').addEventListener('click', exportTownJson);
document.getElementById('addItemBtn').addEventListener('click', addItemToTown);
document.getElementById('resetTownBtn').addEventListener('click', resetTown);
document.getElementById('buyBtn').addEventListener('click', () => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const gold = getGold();
  if (!playerNameInput.value.trim()) return showMessage('Vul eerst een spelersnaam in.', 'error');
  if (!cart.length) return showMessage('Je mandje is leeg.', 'error');
  if (total > gold) return showMessage('Niet genoeg gold.', 'error');
  playerGoldInput.value = gold - total;
  cart = [];
  updatePlayerBox();
  renderCart();
  showMessage('Aankoop voltooid en gold aangepast.');
});

playerNameInput.addEventListener('input', updatePlayerBox);
playerGoldInput.addEventListener('input', updatePlayerBox);
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedCategory = btn.dataset.category;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
    renderShop();
  });
});

populateTowns();
updatePlayerBox();
loadTown();
