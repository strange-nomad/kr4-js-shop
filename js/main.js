/* Главный скрипт инициализации проекта SmartPulse */
/* Координирует работу мобильного меню, бейджей и глобальных состояний */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация счетчика корзины в шапке сайта
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  // 2. Инициализация страницы корзины (если находимся на cart.html)
  if (typeof renderCartPage === 'function') {
    renderCartPage();

    // Обработчик формы промокода в корзине
    const promoForm = document.querySelector('#cart-promo-form');
    if (promoForm) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = promoForm.querySelector('#cart-promo-input');
        if (input && typeof applyPromoCode === 'function') {
          applyPromoCode(input.value);
        }
      });
    }

    // Кнопка быстрой очистки корзины
    const clearBtn = document.querySelector('#cart-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (typeof clearCart === 'function') {
          clearCart();
        }
      });
    }
  }

  // 3. Управление адаптивным бургер-меню для мобильных устройств
  const burgerBtn = document.querySelector('.burger-btn');
  const navMenu = document.querySelector('.site-nav');

  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener('click', () => {
      const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
      burgerBtn.setAttribute('aria-expanded', String(!isExpanded));
      burgerBtn.classList.toggle('burger-btn--active');
      navMenu.classList.toggle('site-nav--open');
    });

    const navLinks = navMenu.querySelectorAll('.site-nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.classList.remove('burger-btn--active');
        navMenu.classList.remove('site-nav--open');
      });
    });
  }

  // 4. Кнопки добавления в корзину на статических страницах (например, на главной или в product.html)
  const directBuyButtons = document.querySelectorAll('[data-buy-id]');
  directBuyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(btn.getAttribute('data-buy-id'), 10);
      if (id && typeof addToCart === 'function') {
        addToCart(id);
      }
    });
  });
});
