const townFiles = [
  { name: 'Human Resource', file: 'data/human-resource.json' }
];

let shopData = [];
let cart = [];
let purchaseHistory = [];
let selectedCategory = 'all';
let currentTown = null;

const playerNameInput = document.getElementById('playerName');
const playerPpInput = document.getElementById('playerPp');
const playerGpInput = document.getElementById('playerGp');
const playerSpInput = document.getElementById('playerSp');
const playerCpInput = document.getElementById('playerCp');
const townSelect = document.getElementById('townSelect');
const loadTownBtn = document.getElementById('loadTownBtn');
const shopItems = document.getElementById('shopItems');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const fundsDisplay = document.getElementById('displayFunds');
const goldAfter = document.getElementById('goldAfter');
const displayName = document.getElementById('displayName');
const displayTown = document.getElementById('displayTown');
const buyBtn = document.getElementById('buyBtn');
const message = document.getElementById('message');
const filters = document.getElementById('filters');
const townDescription = document.getElementById('townDescription');
const purchaseHistoryBox = document.getElementById('purchaseHistory');
const coin = document.getElementById('coin');

function populateTownSelect() {
  townSelect.innerHTML = townFiles
    .map(town => `<option value="${town.file}">${town.name}</option>`)
    .join('');
}

function currencyToCopper(pp, gp, sp, cp) {
  return (Number(pp) || 0) * 1000 +
         (Number(gp) || 0) * 100 +
         (Number(sp) || 0) * 10 +
         (Number(cp) || 0);
}

function copperToCurrency(totalCp) {
  const pp = Math.floor(totalCp / 1000);
  totalCp %= 1000;
  const gp = Math.floor(totalCp / 100);
  totalCp %= 100;
  const sp = Math.floor(totalCp / 10);
  const cp = totalCp % 10;
  return { pp, gp, sp, cp };
}

function formatCurrency(totalCp) {
  const { pp, gp, sp, cp } = copperToCurrency(totalCp);
  return `${pp} pp, ${gp} gp, ${sp} sp, ${cp} cp`;
}

function getPlayerCopper() {
  return currencyToCopper(
    playerPpInput.value,
    playerGpInput.value,
    playerSpInput.value,
    playerCpInput.value
  );
}

function setPlayerCopper(totalCp) {
  const { pp, gp, sp, cp } = copperToCurrency(Math.max(0, totalCp));
  playerPpInput.value = pp;
  playerGpInput.value = gp;
  playerSpInput.value = sp;
  playerCpInput.value = cp;
}

function updatePlayerBox() {
  displayName.textContent = playerNameInput.value || '-';
  displayTown.textContent = currentTown?.town || '-';
  fundsDisplay.textContent = formatCurrency(getPlayerCopper());
  updateCartSummary();
}

function updateCartSummary() {
  const totalCp = cart.reduce((sum, item) => sum + item.priceCp, 0);
  const remainingCp = Math.max(getPlayerCopper() - totalCp, 0);
  cartTotal.textContent = formatCurrency(totalCp);
  goldAfter.textContent = formatCurrency(remainingCp);
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
        <span class="muted">${entry.town} · Total spent: ${formatCurrency(entry.totalCp)}</span>
      </div>
      <span>${formatCurrency(entry.remainingCp)} left</span>
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
        <span class="muted">${item.category} · ${formatCurrency(item.priceCp)}</span>
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
  const categories = currentTown?.categories?.length
    ? currentTown.categories
    : ['Common', 'Local', 'Special'];

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
        <strong>${formatCurrency(item.priceCp)}</strong>
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
  const playerCp = getPlayerCopper();
  const totalCp = cart.reduce((sum, item) => sum + item.priceCp, 0);

  if (!playerNameInput.value.trim()) {
    showMessage('Enter a player name first.', 'message error');
    return;
  }

  if (cart.length === 0) {
    showMessage('Your cart is empty.', 'message error');
    return;
  }

  if (totalCp > playerCp) {
    showMessage('Not enough money for this purchase.', 'message error');
    return;
  }

  const remainingCp = playerCp - totalCp;
  setPlayerCopper(remainingCp);

  purchaseHistory.unshift({
    player: playerNameInput.value.trim(),
    town: currentTown?.town || 'Unknown town',
    itemNames: cart.map(item => item.name),
    totalCp,
    remainingCp
  });

  cart = [];
  updatePlayerBox();
  renderCart();
  renderPurchaseHistory();
  flashCoin();
  flashBuyButton();
  showMessage('Purchase complete. Funds updated.', 'message success');
});

[playerPpInput, playerGpInput, playerSpInput, playerCpInput, playerNameInput].forEach(input => {
  input.addEventListener('input', updatePlayerBox);
});

loadTownBtn.addEventListener('click', loadTown);

populateTownSelect();
renderPurchaseHistory();
updatePlayerBox();
loadTown();
