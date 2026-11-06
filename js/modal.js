/* Управление модальными окнами (<dialog>) */
/* Реализовано в соответствии с разделом 12 методических указаний КР №4 */

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('#modal-feedback');
  if (!modal) return;

  // Открытие модального окна по кнопкам с атрибутом data-modal-open
  const openButtons = document.querySelectorAll('[data-modal-open]');
  openButtons.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', 'true');
      }
    });
  });

  // Закрытие модального окна по кнопкам с атрибутом data-modal-close
  const closeButtons = document.querySelectorAll('[data-modal-close]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
    });
  });

  // Закрытие при клике по затемненному фону (backdrop)
  modal.addEventListener('click', (event) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
    }
  });

  // Закрытие по клавише Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.hasAttribute('open')) {
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
    }
  });
});
