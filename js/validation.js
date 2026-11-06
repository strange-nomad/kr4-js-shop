/* Клиентская валидация формы заказа и обработка сообщений */
/* Реализовано в соответствии с разделом 9 методических указаний КР №4 (без alert()) */

document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.querySelector('#order-checkout-form');
  const successBox = document.querySelector('#order-success-message');

  if (!orderForm) return; // Не страница оформления заявки

  // Вспомогательная функция очистки предыдущих ошибок
  function clearErrors() {
    const errorElements = orderForm.querySelectorAll('.form-field-error');
    errorElements.forEach(el => el.remove());

    const invalidInputs = orderForm.querySelectorAll('.is-invalid');
    invalidInputs.forEach(input => input.classList.remove('is-invalid'));
  }

  // Вспомогательная функция вывода ошибки под конкретным полем
  function showFieldError(fieldInput, message) {
    fieldInput.classList.add('is-invalid');

    const errorEl = document.createElement('div');
    errorEl.className = 'form-field-error';
    errorEl.textContent = message; // Безопасный вывод через textContent

    // Вставляем ошибку сразу под полем
    fieldInput.parentElement.append(errorEl);
  }

  // Проверка формата электронной почты
  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Проверка формата телефона (минимум 10 цифр)
  function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  }

  // Обработка отправки формы
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();

    let hasErrors = false;

    // 1. Проверка имени
    const nameInput = orderForm.querySelector('#order-name');
    if (nameInput) {
      const nameVal = nameInput.value.trim();
      if (nameVal.length < 2) {
        showFieldError(nameInput, 'Пожалуйста, укажите ваше имя (не менее 2 символов).');
        hasErrors = true;
      }
    }

    // 2. Проверка email
    const emailInput = orderForm.querySelector('#order-email');
    if (emailInput) {
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        showFieldError(emailInput, 'Электронная почта обязательна для заполнения.');
        hasErrors = true;
      } else if (!isValidEmail(emailVal)) {
        showFieldError(emailInput, 'Введите корректный адрес почты (например, user@mail.ru).');
        hasErrors = true;
      }
    }

    // 3. Проверка телефона
    const phoneInput = orderForm.querySelector('#order-phone');
    if (phoneInput) {
      const phoneVal = phoneInput.value.trim();
      if (!phoneVal) {
        showFieldError(phoneInput, 'Номер телефона обязателен для связи.');
        hasErrors = true;
      } else if (!isValidPhone(phoneVal)) {
        showFieldError(phoneInput, 'Введите полный номер телефона (не менее 10 цифр).');
        hasErrors = true;
      }
    }

    // 4. Проверка согласия на обработку данных
    const consentInput = orderForm.querySelector('#order-consent');
    if (consentInput && !consentInput.checked) {
      showFieldError(consentInput.parentElement, 'Необходимо согласие на обработку персональных данных.');
      hasErrors = true;
    }

    // Если есть ошибки — прерываем отправку и фокусируемся на первом неверном поле
    if (hasErrors) {
      const firstInvalid = orderForm.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Успешная валидация: формируем красивое подтверждение прямо в DOM (без alert!)
    const customerName = nameInput ? nameInput.value.trim() : 'Клиент';
    orderForm.style.display = 'none';

    if (successBox) {
      successBox.style.display = 'block';

      const titleEl = successBox.querySelector('.order-success__title');
      if (titleEl) {
        titleEl.textContent = `Спасибо, ${customerName}! Заказ успешно оформлен.`;
      }

      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      const descEl = successBox.querySelector('.order-success__desc');
      if (descEl) {
        descEl.textContent = `Номер вашего заказа: #${orderNumber}. Наш менеджер перезвонит вам в течение 10 минут для подтверждения адреса доставки.`;
      }
    }

    // Очищаем корзину после успешного оформления
    if (typeof clearCart === 'function') {
      clearCart();
    }
  });

  // Очистка ошибки в реальном времени при вводе
  orderForm.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const err = input.parentElement.querySelector('.form-field-error');
      if (err) err.remove();
    });
  });
});
