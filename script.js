const townFiles = [
{ name: 'test', file: 'data/test.json' },
{ name: 'Human Resource', file: 'data/human-resource.json' },
];

let shopData = [];
let cart = [];
let purchaseHistory = [];
let selectedCategory = 'all';
let currentTown = null;

const playerNameInput = document.getElementById('playerName');
const playerGoldInput = document.getElementById('playerGold');
const townSelect = document.getElementById('townSelect');
const loadTownBtn = document.getElementById('loadTownBtn');
const shopItems = document.getElementById('shopItems');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const goldAfter = document.getElementById('goldAfter');
const displayName = document.getElementById('displayName');
const displayGold = document.getElementById('displayGold');
const displayTown = document.getElementById('displayTown');
const buyBtn = document.getElementById('buyBtn');
const message = document.getElementById('message');
const filters = document.getElementById('filters');
const townDescription = document.getElementById('townDescription');
const purchaseHistoryBox = document.getElementById('purchaseHistory');
const coin = document.getElementById('coin');

function populateTownSelect() {
  townSelect.innerHTML = townFiles.map(town => `<option value="${town.file}">${town.name}</option>`).join('');
}

function getGold() {
  return Number(playerGoldInput.value) || 0;
}

function updatePlayerBox() {
  displayName.textContent = playerNameInput.value || '-';
  displayGold.textContent = getGold();
  displayTown.textContent = currentTown?.town || '-';
  updateCartSummary();
}

function updateCartSummary() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = total;
  goldAfter.textContent = Math.max(getGold() - total, 0);
}

function flashCoin() {
  coin.classList.remove('coin-spin');
  void coin.offsetWidth;
  coin.classList.add('coin-spin');
}

function flashBuyButton() {
  buyBtn.classList.remove('purchase-pop');
  void buyBtn.offsetWidth;
  buyBtn.classList.add('purchase-pop');
}

function showMessage(text, type = 'message') {
  message.textContent = text;
  message.className = `${type} flash`;
}

function renderPurchaseHistory() {
  if (purchaseHistory.length === 0) {
    purchaseHistoryBox.innerHTML = '<p class="muted">No purchases yet.</p>';
    return;
  }

  purchaseHistoryBox.innerHTML = purchaseHistory.map(entry => `
    <div class="history-item row-drop">
      <div class="item-meta">
        <strong>${entry.player}</strong>
        <span>${entry.itemNames.join(', ')}</span>
        <span class="muted">${entry.town} · Total spent: ${entry.total} gp</span>
      </div>
      <span>${entry.remainingGold} gp left</span>
    </div>
  `).join('');
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="muted">No items selected yet.</p>';
    updateCartSummary();
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item row-drop">
      <div class="item-meta">
        <strong>${item.name}</strong>
        <span class="muted">${item.category} · ${item.price} gp</span>
      </div>
      <button onclick="removeFromCart(${index})">Remove</button>
    </div>
  `).join('');
  updateCartSummary();
}

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  renderCart();
};

function addToCart(itemId) {
  const item = shopData.find(i => i.id === itemId);
  if (!item) return;
  cart.push(item);
  renderCart();
  flashCoin();
  showMessage(`${item.name} added to cart.`);
}

window.addToCart = addToCart;

function renderFilters() {
  const categories = currentTown?.categories?.length ? currentTown.categories : ['Common', 'Local', 'Special'];
  const allCategories = ['all', ...categories];
  filters.innerHTML = allCategories.map(category => `
    <button class="filter-btn ${selectedCategory === category ? 'active' : ''}" data-category="${category}">
      ${category === 'all' ? 'All' : category}
    </button>
  `).join('');

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setCategory(btn.dataset.category));
  });
}

function renderShop() {
  const filtered = selectedCategory === 'all'
    ? shopData
    : shopData.filter(item => item.category === selectedCategory);

  if (!filtered.length) {
    shopItems.innerHTML = '<p class="muted">No items found in this category.</p>';
    return;
  }

  shopItems.innerHTML = filtered.map(item => `
    <article class="item-card row-drop">
      <span class="tag">${item.category}</span>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="card-footer">
        <strong>${item.price} gp</strong>
        <button onclick="addToCart(${item.id})">Add to cart</button>
      </div>
    </article>
  `).join('');
}

async function loadTown() {
  const response = await fetch(townSelect.value);
  const data = await response.json();
  currentTown = data;
  shopData = data.items;
  cart = [];
  selectedCategory = 'all';
  townDescription.textContent = data.description || `${data.town} offers practical goods and local trade items.`;
  showMessage(`${data.town} loaded.`);
  renderFilters();
  renderShop();
  renderCart();
  updatePlayerBox();
}

function setCategory(category) {
  selectedCategory = category;
  renderFilters();
  renderShop();
}

buyBtn.addEventListener('click', () => {
  const gold = getGold();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (!playerNameInput.value.trim()) {
    showMessage('Enter a player name first.', 'message error');
    return;
  }

  if (cart.length === 0) {
    showMessage('Your cart is empty.', 'message error');
    return;
  }

  if (total > gold) {
    showMessage('Not enough gold for this purchase.', 'message error');
    return;
  }

  const remainingGold = gold - total;
  playerGoldInput.value = remainingGold;

  purchaseHistory.unshift({
    player: playerNameInput.value.trim(),
    town: currentTown?.town || 'Unknown town',
    itemNames: cart.map(item => item.name),
    total,
    remainingGold
  });

  cart = [];
  updatePlayerBox();
  renderCart();
  renderPurchaseHistory();
  flashCoin();
  flashBuyButton();
  showMessage('Purchase complete. Gold updated.', 'message success');
});

playerNameInput.addEventListener('input', updatePlayerBox);
playerGoldInput.addEventListener('input', updatePlayerBox);
loadTownBtn.addEventListener('click', loadTown);

populateTownSelect();
renderPurchaseHistory();
updatePlayerBox();
loadTown();
