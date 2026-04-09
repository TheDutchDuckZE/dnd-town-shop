let shopData = [];
let cart = [];
let selectedCategory = 'all';

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
const buyBtn = document.getElementById('buyBtn');
const message = document.getElementById('message');

function getGold() {
  return Number(playerGoldInput.value) || 0;
}

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
  if (cart.length === 0) {
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

function addToCart(itemId) {
  const item = shopData.find(i => i.id === itemId);
  if (!item) return;
  cart.push(item);
  renderCart();
}

window.addToCart = addToCart;

function renderShop() {
  const filtered = selectedCategory === 'all'
    ? shopData
    : shopData.filter(item => item.category === selectedCategory);

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
  shopData = data.items;
  cart = [];
  message.textContent = `${data.town} geladen.`;
  message.className = 'message';
  renderShop();
  renderCart();
}

function setCategory(category) {
  selectedCategory = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  renderShop();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => setCategory(btn.dataset.category));
});

buyBtn.addEventListener('click', () => {
  const gold = getGold();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (!playerNameInput.value.trim()) {
    message.textContent = 'Vul eerst een spelersnaam in.';
    message.className = 'message error';
    return;
  }

  if (cart.length === 0) {
    message.textContent = 'Je mandje is leeg.';
    message.className = 'message error';
    return;
  }

  if (total > gold) {
    message.textContent = 'Niet genoeg gold voor deze aankoop.';
    message.className = 'message error';
    return;
  }

  playerGoldInput.value = gold - total;
  cart = [];
  updatePlayerBox();
  renderCart();
  message.textContent = 'Aankoop voltooid. Gold is bijgewerkt.';
  message.className = 'message success';
});

playerNameInput.addEventListener('input', updatePlayerBox);
playerGoldInput.addEventListener('input', updatePlayerBox);
loadTownBtn.addEventListener('click', loadTown);

updatePlayerBox();
loadTown();
