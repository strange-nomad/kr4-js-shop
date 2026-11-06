/* Управление корзиной покупок и расчетами */
/* Реализовано с сохранением состояния в localStorage и расчетом суммы через reduce() */

const CART_STORAGE_KEY = 'smartpulse_cart';
let currentDiscount = 0; // Размер скидки в процентах при активации промокода

// Получение списка товаров в корзине из localStorage
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Сохранение состояния корзины в localStorage
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    // Игнорируем ошибки квоты
  }
  updateCartBadge();
}

// Добавление товара в корзину по id
function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  showToastNotification('Товар добавлен в корзину!');
}

// Удаление товара из корзины
function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  if (typeof renderCartPage === 'function') {
    renderCartPage();
  }
}

// Изменение количества товара
function updateQuantity(productId, newQty) {
  let cart = getCart();
  if (newQty <= 0) {
    cart = cart.filter(item => item.id !== productId);
  } else {
    const target = cart.find(item => item.id === productId);
    if (target) {
      target.quantity = newQty;
    }
  }
  saveCart(cart);
  if (typeof renderCartPage === 'function') {
    renderCartPage();
  }
}

// Очистка корзины
function clearCart() {
  saveCart([]);
  if (typeof renderCartPage === 'function') {
    renderCartPage();
  }
}

// Расчет общего количества позиций для бейджа
function getCartItemsCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Расчет итоговой стоимости через reduce() (требование методички)
function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    if (!product) return sum;
    return sum + (product.price * item.quantity);
  }, 0);
}

// Обновление бейджа-счетчика в шапке сайта
function updateCartBadge() {
  const count = getCartItemsCount();
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = count > 0 ? String(count) : '';
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// Всплывающее уведомление о добавлении в корзину
function showToastNotification(message) {
  let toast = document.querySelector('.toast-notify');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notify';
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('toast-notify--visible');

  setTimeout(() => {
    toast.classList.remove('toast-notify--visible');
  }, 2200);
}

// Отрисовка страницы cart.html
function renderCartPage() {
  const container = document.querySelector('#cart-items-container');
  const emptyState = document.querySelector('#cart-empty-state');
  const summaryBlock = document.querySelector('#cart-summary-block');
  const totalSubtotalEl = document.querySelector('#cart-subtotal');
  const totalDiscountEl = document.querySelector('#cart-discount');
  const totalFinalEl = document.querySelector('#cart-final-total');

  if (!container) return; // Не страница корзины

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (summaryBlock) summaryBlock.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summaryBlock) summaryBlock.style.display = 'block';

  // Очищаем контейнер перед генерацией (требование КР №4)
  container.innerHTML = '';

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;

    const row = document.createElement('div');
    row.className = 'cart-item';

    // Изображение
    const imgCol = document.createElement('div');
    imgCol.className = 'cart-item__image-col';
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    img.className = 'cart-item__image';
    imgCol.append(img);

    // Описание и название
    const infoCol = document.createElement('div');
    infoCol.className = 'cart-item__info-col';
    const title = document.createElement('h3');
    title.className = 'cart-item__title';
    title.textContent = product.title;
    const price = document.createElement('div');
    price.className = 'cart-item__unit-price';
    price.textContent = `${product.price.toLocaleString('ru-RU')} ₽ за шт.`;
    infoCol.append(title, price);

    // Блок количества
    const qtyCol = document.createElement('div');
    qtyCol.className = 'cart-item__qty-col';

    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'cart-item__btn-qty';
    decBtn.textContent = '−';
    decBtn.setAttribute('aria-label', 'Уменьшить количество');
    decBtn.addEventListener('click', () => updateQuantity(product.id, item.quantity - 1));

    const qtySpan = document.createElement('span');
    qtySpan.className = 'cart-item__qty-value';
    qtySpan.textContent = String(item.quantity);

    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'cart-item__btn-qty';
    incBtn.textContent = '+';
    incBtn.setAttribute('aria-label', 'Увеличить количество');
    incBtn.addEventListener('click', () => updateQuantity(product.id, item.quantity + 1));

    qtyCol.append(decBtn, qtySpan, incBtn);

    // Итоговая сумма позиции
    const sumCol = document.createElement('div');
    sumCol.className = 'cart-item__sum-col';
    sumCol.textContent = `${(product.price * item.quantity).toLocaleString('ru-RU')} ₽`;

    // Кнопка удаления
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'cart-item__btn-remove';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', `Удалить ${product.title} из корзины`);
    delBtn.addEventListener('click', () => removeFromCart(product.id));

    row.append(imgCol, infoCol, qtyCol, sumCol, delBtn);
    container.append(row);
  });

  // Расчет итогов с использованием reduce
  const subtotal = calculateCartTotal(cart);
  const discountAmount = Math.round(subtotal * (currentDiscount / 100));
  const finalTotal = subtotal - discountAmount;

  if (totalSubtotalEl) totalSubtotalEl.textContent = `${subtotal.toLocaleString('ru-RU')} ₽`;
  if (totalDiscountEl) totalDiscountEl.textContent = `${discountAmount.toLocaleString('ru-RU')} ₽ (${currentDiscount}%)`;
  if (totalFinalEl) totalFinalEl.textContent = `${finalTotal.toLocaleString('ru-RU')} ₽`;
}

// Применение промокода
function applyPromoCode(code) {
  const feedbackEl = document.querySelector('#promo-feedback');
  if (!feedbackEl) return;

  const cleanCode = (code || '').trim().toUpperCase();
  if (cleanCode === 'MIREA2026' || cleanCode === 'SMART10') {
    currentDiscount = 10;
    feedbackEl.textContent = 'Промокод применен: скидка 10%!';
    feedbackEl.className = 'form-feedback form-feedback--success';
  } else if (cleanCode === '') {
    currentDiscount = 0;
    feedbackEl.textContent = 'Введите промокод.';
    feedbackEl.className = 'form-feedback form-feedback--error';
  } else {
    currentDiscount = 0;
    feedbackEl.textContent = 'Неверный промокод.';
    feedbackEl.className = 'form-feedback form-feedback--error';
  }

  renderCartPage();
}
