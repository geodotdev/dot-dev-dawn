async function fetchCartTotalDollars() {
  const resp = await fetch('/cart.js', { headers: { Accept: 'application/json' } });
  const cart = await resp.json();
  return (cart.total_price || 0) / 100; // cents -> dollars
}

async function fetchGoalStatus(apiBaseUrl, cartTotal) {
  const url = `${apiBaseUrl.replace(/\/$/, '')}/goal-status?cart_total=${encodeURIComponent(cartTotal)}`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  return resp.json();
}

async function updateCartGoalMessage() {
  const el = document.getElementById('cart-goal-message');
  if (!el) return;

  try {
    el.textContent = 'Checking your cart...';
    const cartTotal = await fetchCartTotalDollars();

    const cfg = window.__CART_GOAL_CONFIG__ || {};
    const apiBaseUrl = cfg.apiUrl || 'http://localhost:3000';

    const data = await fetchGoalStatus(apiBaseUrl, cartTotal);
    el.textContent = data?.message || 'No message available.';
  } catch (err) {
    console.error('Cart goal error:', err);
    el.textContent = 'Unable to check cart right now.';
  }
}

// Initial run on page load
document.addEventListener('DOMContentLoaded', updateCartGoalMessage);

// Re-run shortly after potential cart changes
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button, input[type="submit"], a[href*="cart"], form[action*="cart"]');
  if (!btn) return;
  const cfg = window.__CART_GOAL_CONFIG__ || {};
  const delay = typeof cfg.pollDelay === 'number' ? cfg.pollDelay : 800;
  setTimeout(updateCartGoalMessage, delay);
});

// Optional: re-run when the drawer/cart opens (Dawn often uses details elements)
document.addEventListener('toggle', (e) => {
  const isCartDrawer = e.target && e.target.id && e.target.id.toLowerCase().includes('cart');
  if (isCartDrawer && e.target.open) {
    setTimeout(updateCartGoalMessage, 300);
  }
});
