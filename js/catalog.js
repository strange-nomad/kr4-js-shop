/* Логика каталога: генерация карточек, живой поиск, фильтрация и сортировка */
/* Реализовано в соответствии с разделами 6, 7 и 8 методических указаний КР №4 */

document.addEventListener('DOMContentLoaded', () => {
  const catalogGrid = document.querySelector('#catalog-products-grid');
  const searchInput = document.querySelector('#catalog-search-input');
  const categorySelect = document.querySelector('#catalog-category-filter');
  const sortSelect = document.querySelector('#catalog-sort-select');
  const inStockCheckbox = document.querySelector('#catalog-instock-checkbox');
  const countBadge = document.querySelector('#catalog-count-badge');
  const emptyState = document.querySelector('#catalog-empty-state');
  const resetBtn = document.querySelector('#catalog-reset-filters');

  // Если мы не на странице каталога, прекращаем выполнение без ошибок
  if (!catalogGrid) return;

  // Создание карточки одного товара через чистый DOM API (разделы 7 и 10)
  function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    if (product.badge === 'Хит') card.classList.add('product-card--featured');
    if (product.badge === 'Скидка') card.classList.add('product-card--discount');

    // Бейдж товара (если есть)
    if (product.badge) {
      const badge = document.createElement('span');
      badge.className = 'product-card__badge';
      if (product.badge === 'Хит') badge.classList.add('product-card__badge--hit');
      if (product.badge === 'Скидка') badge.classList.add('product-card__badge--discount');
      if (product.badge === 'Новинка') badge.classList.add('product-card__badge--new');
      badge.textContent = product.badge;
      card.append(badge);
    }

    // Блок изображения
    const imgBox = document.createElement('div');
    imgBox.className = 'product-card__image-box';
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    img.className = 'product-card__image';
    img.loading = 'lazy';
    img.width = 300;
    img.height = 200;
    imgBox.append(img);

    // Контент карточки
    const content = document.createElement('div');
    content.className = 'product-card__content';

    // Мета-строка (категория и рейтинг)
    const meta = document.createElement('div');
    meta.className = 'product-card__meta';

    const catSpan = document.createElement('span');
    const categoryLabels = {
      wearable: 'Смарт-часы',
      audio: 'Аудио',
      home: 'Умный дом',
      power: 'Питание'
    };
    catSpan.textContent = categoryLabels[product.category] || product.category;

    const ratingSpan = document.createElement('span');
    ratingSpan.className = 'product-card__rating';
    ratingSpan.textContent = `★ ${product.rating} (${product.reviewsCount})`;

    meta.append(catSpan, ratingSpan);

    // Заголовок карточки
    const title = document.createElement('h3');
    title.className = 'product-card__title';
    const link = document.createElement('a');
    link.href = 'product.html';
    link.textContent = product.title;
    title.append(link);

    // Описание
    const desc = document.createElement('p');
    desc.className = 'product-card__description';
    desc.textContent = product.description;

    // Цены
    const priceRow = document.createElement('div');
    priceRow.className = 'product-card__price-row';

    const price = document.createElement('span');
    price.className = 'product-card__price';
    price.textContent = `${product.price.toLocaleString('ru-RU')} ₽`;
    priceRow.append(price);

    if (product.oldPrice) {
      const oldPrice = document.createElement('span');
      oldPrice.className = 'product-card__old-price';
      oldPrice.textContent = `${product.oldPrice.toLocaleString('ru-RU')} ₽`;
      priceRow.append(oldPrice);
    }

    // Кнопки действий
    const actions = document.createElement('div');
    actions.className = 'product-card__actions';

    const detailBtn = document.createElement('a');
    detailBtn.href = 'product.html';
    detailBtn.className = 'button button--secondary';
    detailBtn.textContent = 'Подробнее';

    const buyBtn = document.createElement('button');
    buyBtn.type = 'button';
    buyBtn.className = 'button button--primary';
    buyBtn.textContent = product.isAvailable ? 'В корзину' : 'Под заказ';
    buyBtn.addEventListener('click', () => {
      addToCart(product.id);
    });

    actions.append(detailBtn, buyBtn);

    content.append(meta, title, desc, priceRow, actions);
    card.append(imgBox, content);

    return card;
  }

  // Главная функция фильтрации, поиска и сортировки
  function updateCatalog() {
    const searchQuery = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const selectedCategory = categorySelect ? categorySelect.value : 'all';
    const selectedSort = sortSelect ? sortSelect.value : 'default';
    const onlyAvailable = inStockCheckbox ? inStockCheckbox.checked : false;

    // 1. Фильтрация
    let result = products.filter(item => {
      // Поиск по названию (регистронезависимый)
      const matchesSearch = item.title.toLowerCase().includes(searchQuery) ||
                            item.description.toLowerCase().includes(searchQuery);

      // Фильтр по категории
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Фильтр наличия
      const matchesStock = !onlyAvailable || item.isAvailable;

      return matchesSearch && matchesCategory && matchesStock;
    });

    // 2. Сортировка (строго по копии массива через spread [...result], чтобы не мутировать исходный)
    const sorted = [...result];
    if (selectedSort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'title-asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'rating-desc') {
      sorted.sort((a, b) => b.rating - a.rating);
    }

    // 3. Вывод количества найденных позиций
    if (countBadge) {
      countBadge.textContent = `Найдено: ${sorted.length}`;
    }

    // 4. Очистка контейнера перед новым рендером
    catalogGrid.innerHTML = '';

    // 5. Обработка пустого состояния
    if (sorted.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // 6. Генерация и вставка карточек в DOM
    sorted.forEach(item => {
      const cardElement = createProductCard(item);
      catalogGrid.append(cardElement);
    });
  }

  // Навешивание обработчиков событий (раздел 11)
  if (searchInput) {
    searchInput.addEventListener('input', updateCatalog);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', updateCatalog);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', updateCatalog);
  }

  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', updateCatalog);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'all';
      if (sortSelect) sortSelect.value = 'default';
      if (inStockCheckbox) inStockCheckbox.checked = false;
      updateCatalog();
    });
  }

  // Первоначальный рендер каталога при загрузке
  updateCatalog();
});
