// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('hidden');
  }, 800);
});

// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== PRODUCT FILTERING =====
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card[data-cat]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    productCards.forEach(card => {
      const match = cat === 'all' || card.dataset.cat === cat;
      card.style.transition = 'opacity 0.35s, transform 0.35s';
      if (match) {
        card.style.opacity = '1';
        card.style.transform = '';
        card.style.display = '';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
        setTimeout(() => {
          if (card.style.opacity === '0') card.style.display = 'none';
        }, 360);
      }
    });
  });
});

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('glamCart') || '[]');

function saveCart() { localStorage.setItem('glamCart', JSON.stringify(cart)); }
function getTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.querySelector('.cart-badge');
  if (badge) { badge.textContent = total; badge.style.display = total ? 'flex' : 'none'; }
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;
  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="bi bi-bag"></i>
        <p>Your bag is empty</p>
      </div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:2rem;">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')} × ${item.qty}</div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem;">
            <button onclick="changeQty('${item.id}',-1)" style="width:24px;height:24px;border:1px solid var(--border);background:none;cursor:pointer;border-radius:2px;font-size:.9rem;display:flex;align-items:center;justify-content:center;">−</button>
            <span style="font-size:.9rem;min-width:20px;text-align:center;">${item.qty}</span>
            <button onclick="changeQty('${item.id}',1)" style="width:24px;height:24px;border:1px solid var(--border);background:none;cursor:pointer;border-radius:2px;font-size:.9rem;display:flex;align-items:center;justify-content:center;">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')"><i class="bi bi-x-lg"></i></button>
      </div>`).join('');
  }
  if (totalEl) totalEl.textContent = '₹' + getTotal().toLocaleString('en-IN');
  updateCartBadge();
}

function addToCart(id, name, price, emoji) {
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else { cart.push({ id, name, price, emoji, qty: 1 }); }
  saveCart(); renderCart(); openCart(); showToast(`✓ ${name} added to bag`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

// ===== CART SIDEBAR =====
const overlay = document.getElementById('cartOverlay');
const sidebar = document.getElementById('cartSidebar');

function openCart() {
  overlay.classList.add('open');
  sidebar.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  overlay.classList.remove('open');
  sidebar.classList.remove('open');
  document.body.style.overflow = '';
}

overlay?.addEventListener('click', closeCart);
document.getElementById('cartClose')?.addEventListener('click', closeCart);
document.getElementById('cartIcon')?.addEventListener('click', openCart);

// ===== WISHLIST =====
let wishlist = JSON.parse(localStorage.getItem('glamWishlist') || '[]');
function toggleWishlist(id, btn) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(i => i !== id);
    btn.innerHTML = '<i class="bi bi-heart"></i>';
    btn.style.color = '';
  } else {
    wishlist.push(id);
    btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    btn.style.color = '#D4A5A5';
    showToast('♡ Added to wishlist');
  }
  localStorage.setItem('glamWishlist', JSON.stringify(wishlist));
}

// ===== TOAST =====
function showToast(msg) {
  const wrap = document.getElementById('toastWrap');
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = msg;
  wrap.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
  const future = new Date();
  future.setDate(future.getDate() + 2);
  future.setHours(23, 59, 59);
  const now = new Date();
  const diff = future - now;
  if (diff <= 0) return;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const el = id => document.getElementById(id);
  if (el('cdHours')) el('cdHours').textContent = String(h).padStart(2, '0');
  if (el('cdMins'))  el('cdMins').textContent  = String(m).padStart(2, '0');
  if (el('cdSecs'))  el('cdSecs').textContent  = String(s).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ===== NEWSLETTER =====
document.getElementById('newsletterForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const inp = e.target.querySelector('input');
  if (inp.value) {
    showToast('✉ Subscribed! Welcome to Glamoura.');
    inp.value = '';
  }
});

// ===== CHECKOUT =====
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) { showToast('⚠ Your bag is empty!'); return; }
  showToast('🛍 Redirecting to checkout...');
  setTimeout(closeCart, 1500);
});

// Init
renderCart();
