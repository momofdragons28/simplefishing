// Получаем элементы DOM
const startButton = document.getElementById('start-button');
const catchButton = document.getElementById('catch-button');
const messageContainer = document.getElementById('result-message');
const indicator = document.querySelector('.indicator');
const targetZone = document.getElementById('target-zone');
const coinsDisplay = document.getElementById('coins');
const energyValue = document.getElementById('energy-value');
const energyBarFill = document.getElementById('energy-bar-fill');
const sidebar = document.getElementById('sidebar');
const panelBtns = document.querySelectorAll('.panel-btn');
const sidebarTitle = document.querySelector('.sidebar-title');
const tabPanes = document.querySelectorAll('.tab-pane');

// Игровые переменные
let isCatching = false;
let targetZoneStart = 0;
let targetZoneEnd = 0;
let coins = 0;
let maxEnergy = 100;
let currentEnergy = 5;
let currentFish = null;

// Настройки рыб
const fishSettings = {
  green: { color: '#76c7c0', zoneSize: 50 },
  blue: { color: '#0000ff', zoneSize: 40 },
  orange: { color: '#ffa500', zoneSize: 30 },
  red: { color: '#ff0000', zoneSize: 20 }
};

// Данные о рыбах
const fishData = {
  green: [
    { name: "Окунь", image: "img/green_fish1.png" },
    { name: "Карп", image: "img/green_fish2.png" },
    { name: "Плотва", image: "img/green_fish3.png" },
    { name: "Карась", image: "img/green_fish4.png" },
    { name: "Вьюн", image: "img/green_fish5.png" }
  ],
  blue: [
    { name: "Сом", image: "img/blue_fish1.png" },
    { name: "Судак", image: "img/blue_fish2.png" },
    { name: "Щука", image: "img/blue_fish3.png" }
  ],
  orange: [
    { name: "Форель", image: "img/orange_fish1.png" },
    { name: "Стерлядь", image: "img/orange_fish2.png" }
  ],
  red: [
    { name: "Краб", image: "img/red_fish1.png" }
  ]
};

// Статистика
let gameStats = {
  fishes: {},
  rarities: {
    green: 0,
    blue: 0,
    orange: 0,
    red: 0
  }
};

// Настройки магазина
const shopSettings = {
  maxEnergy: {
    baseCost: 1000,
    costMultiplier: 2,
    maxIncreases: 10
  },
  chances: {
    blue: { max: 25, cost: 5000 },
    orange: { max: 10, cost: 50000 },
    red: { max: 5, cost: 500000 }
  }
};

let energyUpgrades = 0;
let chanceUpgrades = {
  blue: 0,
  orange: 0,
  red: 0
};

// Инициализация статистики
function initStats() {
  for(const rarity in fishData) {
    for(const fish of fishData[rarity]) {
      gameStats.fishes[fish.name] = 0;
    }
  }
}

// Обновление статистики
function updateStats(fish) {
  gameStats.fishes[fish.name]++;
  gameStats.rarities[fish.quality]++;
  renderStats();
}

// Отрисовка статистики
function renderStats() {
  const statsContainer = document.querySelector('#stats');
  statsContainer.innerHTML = `
    <div class="stats-container">
      <div class="fish-stats"></div>
      <div class="stats-divider"></div>
      <div class="rarity-stats"></div>
    </div>
  `;

  // Рыбы
  const fishStats = statsContainer.querySelector('.fish-stats');
  for(const fishName in gameStats.fishes) {
    const rarity = Object.keys(fishData).find(r => 
      fishData[r].some(f => f.name === fishName)
    );
    const fish = fishData[rarity].find(f => f.name === fishName);
    
    fishStats.innerHTML += `
      <div class="fish-item">
        <img src="${fish.image}" class="fish-icon">
        <span class="fish-name">${fishName}</span>
        <span class="fish-count ${rarity}">${gameStats.fishes[fishName]}</span>
      </div>
    `;
  }

  // Редкости
  const rarityStats = statsContainer.querySelector('.rarity-stats');
  for(const rarity in gameStats.rarities) {
    const name = {
      green: "Зелёная рыба",
      blue: "Синяя рыба",
      orange: "Оранжевая рыба",
      red: "Красная рыба"
    }[rarity];

    rarityStats.innerHTML += `
      <div class="rarity-item">
        <span class="rarity-name ${rarity}">${name}</span>
        <span class="rarity-count">${gameStats.rarities[rarity]}</span>
      </div>
    `;
  }
}

// Выбор случайной рыбы
function getRandomFish() {
  const baseChances = {
    green: 60 - (chanceUpgrades.blue + chanceUpgrades.orange + chanceUpgrades.red),
    blue: 25 + chanceUpgrades.blue,
    orange: 10 + chanceUpgrades.orange,
    red: 5 + chanceUpgrades.red
  };

  const rand = Math.random() * 100;
  if(rand < baseChances.green) return getRandomFishByQuality('green');
  if(rand < baseChances.green + baseChances.blue) return getRandomFishByQuality('blue');
  if(rand < baseChances.green + baseChances.blue + baseChances.orange) return getRandomFishByQuality('orange');
  return getRandomFishByQuality('red');
}

function getRandomFishByQuality(quality) {
  const fishArray = fishData[quality];
  const fish = {...fishArray[Math.floor(Math.random() * fishArray.length)]};
  fish.quality = quality;
  return fish;
}

// Запуск игры
function startGame() {
  if(currentEnergy <= 0) {
    showEnergyMessage();
    return;
  }

  currentFish = getRandomFish();
  const settings = fishSettings[currentFish.quality];
  
  indicator.style.backgroundColor = settings.color;
  generateTargetZone(settings.zoneSize);

  startButton.style.display = 'none';
  catchButton.style.display = 'block';
  indicator.style.animationPlayState = 'running';
  
  currentEnergy--;
  updateEnergy();
}

// Завершение игры
function endGame(isSuccess) {
  indicator.style.animationPlayState = 'paused';
  clearMessageContainer();

  if(isSuccess) {
    const reward = {
      green: 10,
      blue: 30,
      orange: 100,
      red: 500
    }[currentFish.quality];

    messageContainer.innerHTML = `
      <p>Ура! Рыба поймана</p>
      <p style="color: ${fishSettings[currentFish.quality].color}">${currentFish.name}</p>
      <img src="${currentFish.image}" class="fish-image">
      <p>Награда: ${reward} монет</p>
    `;

    coins += reward;
    coinsDisplay.textContent = coins;
    updateStats(currentFish);
  } else {
    messageContainer.innerHTML = `
      <p>Упс... Рыба сорвалась!</p>
      <img src="img/sad_face.png" class="fish-image">
    `;
  }

  catchButton.style.display = 'none';
  startButton.style.display = 'block';
  isCatching = false;
}

// Вспомогательные функции
function generateTargetZone(size) {
  const progressBarWidth = 300;
  targetZoneStart = Math.random() * (progressBarWidth - size);
  targetZoneEnd = targetZoneStart + size;

  targetZone.style.left = `${targetZoneStart}px`;
  targetZone.style.width = `${size}px`;
}

function updateEnergy() {
  energyValue.textContent = currentEnergy;
  energyBarFill.style.width = `${(currentEnergy / maxEnergy) * 100}%`;
}

function showEnergyMessage() {
  messageContainer.innerHTML = `
    <p>Не хватает энергии!</p>
    ${coins >= 100 ? 
      `<button id="add-energy-button">Добавить энергии (100 монет)</button>` : 
      `<p style="color: red;">Недостаточно монет для восстановления энергии</p>`
    }
  `;
  
  const addEnergyButton = document.getElementById('add-energy-button');
  if (addEnergyButton) {
    addEnergyButton.addEventListener('click', () => {
      if (coins >= 100) {
        coins -= 100;
        currentEnergy = maxEnergy;
        coinsDisplay.textContent = coins;
        updateEnergy();
        clearMessageContainer();
      }
    });
  }
}

function clearMessageContainer() {
  messageContainer.innerHTML = '';
}

// Обработчики событий
startButton.addEventListener('click', startGame);

catchButton.addEventListener('click', () => {
  if(isCatching) return;
  isCatching = true;

  const indicatorRect = indicator.getBoundingClientRect();
  const progressBarRect = indicator.parentElement.getBoundingClientRect();
  const indicatorPosition = indicatorRect.left - progressBarRect.left;
  const indicatorWidth = indicatorRect.width;

  const isSuccess = (
    indicatorPosition + indicatorWidth >= targetZoneStart &&
    indicatorPosition <= targetZoneEnd
  );

  endGame(isSuccess);
});

function switchTab(tabId) {
  // Сбрасываем все вкладки
  tabPanes.forEach(pane => {
    pane.classList.remove('active');
    pane.style.display = 'none';
  });

  // Устанавливаем активную вкладку
  const activePane = document.getElementById(tabId);
  if (activePane) {
    activePane.classList.add('active');
    activePane.style.display = 'block';
  }

  // Обновляем заголовок
  const targetButton = document.querySelector(`[data-target="${tabId}"]`);
  if (targetButton) {
    sidebarTitle.textContent = targetButton.textContent;
  }

  // Загружаем контент для вкладок
  if (tabId === 'stats') {
    renderStats();
  } else if (tabId === 'shop') {
    renderShop();
  } else if (tabId === 'info') {
    // Оставляем существующий HTML без изменений
  } else {
    activePane.innerHTML = `<p class="empty-tab">Раздел в разработке 🛠️</p>`;
  }
}

// Управление панелью
panelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    sidebar.classList.add('active');
    panelBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchTab(target);
  });
});

document.getElementById('closeBtn').addEventListener('click', () => {
  sidebar.classList.remove('active');
  panelBtns.forEach(b => b.classList.remove('active'));
});

document.addEventListener('click', (e) => {
  if(!sidebar.contains(e.target) && !e.target.closest('.panel-buttons')) {
    sidebar.classList.remove('active');
    panelBtns.forEach(b => b.classList.remove('active'));
  }
});

// Функция для рендера магазина
function renderShop() {
  const shopContainer = document.querySelector('#shop');
  const energyCost = shopSettings.maxEnergy.baseCost * Math.pow(shopSettings.maxEnergy.costMultiplier, energyUpgrades);
  const greenChance = 60 - (chanceUpgrades.blue + chanceUpgrades.orange + chanceUpgrades.red);

  shopContainer.innerHTML = `
    <div class="shop-grid">
      <!-- Энергия -->
      <div class="shop-item">
        <img src="img/energy.png" class="shop-icon" alt="Энергия">
        <span class="shop-name">Максимальная энергия</span>
        <span class="shop-value">${maxEnergy}</span>
        ${energyUpgrades < shopSettings.maxEnergy.maxIncreases ? 
          `<span class="shop-button" title="Стоимость: ${energyCost} монет">🛒</span>` : ''}
      </div>

      <!-- Зеленая рыба -->
      <div class="shop-item">
        <img src="img/green.png" class="shop-icon" alt="Зеленая рыба">
        <span class="shop-name">Зеленая рыба</span>
        <span class="shop-value">${greenChance}%</span>
      </div>

      <!-- Остальные рыбы -->
      ${['blue', 'orange', 'red'].map(quality => {
        const cost = shopSettings.chances[quality].cost;
        return `
          <div class="shop-item">
            <img src="img/${quality}.png" class="shop-icon" alt="${qualityToName(quality)}">
            <span class="shop-name">${qualityToName(quality)}</span>
            <span class="shop-value">${getBaseChance(quality) + chanceUpgrades[quality]}%</span>
            ${chanceUpgrades[quality] < shopSettings.chances[quality].max ? 
              `<span class="shop-button" title="Стоимость: ${cost} монет">🛒</span>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Обработчики для кнопок
  document.querySelectorAll('.shop-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const parent = e.target.closest('.shop-item');
      const type = parent.querySelector('.shop-name').textContent;
      
      if(type.includes('энергия')) {
        showEnergyUpgradeModal(energyCost);
      } 
      else if(type.includes('Синяя')) {
        showChanceUpgradeModal('blue', 5000);
      }
      else if(type.includes('Оранжевая')) {
        showChanceUpgradeModal('orange', 50000);
      }
      else if(type.includes('Красная')) {
        showChanceUpgradeModal('red', 500000);
      }
    });
  });
}

// Вспомогательные функции
function qualityToName(quality) {
  const names = {
    green: "Зеленая рыба",
    blue: "Синяя рыба",
    orange: "Оранжевая рыба",
    red: "Красная рыба"
  };
  return names[quality];
}

function getBaseChance(quality) {
  const base = {
    green: 60,
    blue: 25,
    orange: 10,
    red: 5
  };
  return base[quality];
}

// Модальные окна
function showEnergyUpgradeModal(cost) {
  const missingCoins = coins < cost ? cost - coins : 0;
  const modalContent = coins >= cost 
    ? `
      <p>Вы действительно хотите увеличить максимальную энергию на 5 единиц за ${cost} монет?</p>
      <div class="modal-buttons">
        <button class="confirm-btn">Купить</button>
        <button class="close-modal-btn">Закрыть</button>
      </div>
    `
    : `
      <p class="error-message">Не хватает монет для покупки улучшения</p>
      <p class="error-message">Необходимо еще ${missingCoins} монет</p>
      <div class="modal-buttons">
        <button class="close-modal-btn">Закрыть</button>
      </div>
    `;

  const modal = createModal(modalContent);

  // Обработчик для кнопки "Купить"
  const confirmBtn = modal.querySelector('.confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (coins >= cost) {
        coins -= cost;
        maxEnergy += 5;
        currentEnergy = maxEnergy;
        energyUpgrades++;
        updateEnergy();
        coinsDisplay.textContent = coins;
        renderShop();

        // Показываем сообщение об успешной покупке
        modal.querySelector('.modal-content').innerHTML = `
          <p>Вы увеличили энергию на 5 единиц, потратив ${cost} монет</p>
          <div class="modal-buttons">
            <button class="close-modal-btn">Закрыть</button>
          </div>
        `;

        // Добавляем обработчик для новой кнопки "Закрыть"
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
          modal.remove();
        });
      }
    });
  }

  // Обработчик для кнопки "Закрыть"
  modal.querySelector('.close-modal-btn').addEventListener('click', () => {
    modal.remove();
  });
}

function showChanceUpgradeModal(quality, cost) {
  const missingCoins = coins < cost ? cost - coins : 0;
  const modalContent = coins >= cost 
    ? `
      <p>Вы действительно хотите увеличить шанс поимки ${qualityToName(quality)} на 1% за ${cost} монет?</p>
      <div class="modal-buttons">
        <button class="confirm-btn">Купить</button>
        <button class="close-modal-btn">Закрыть</button>
      </div>
    `
    : `
      <p class="error-message">Не хватает монет для покупки улучшения</p>
      <p class="error-message">Необходимо еще ${missingCoins} монет</p>
      <div class="modal-buttons">
        <button class="close-modal-btn">Закрыть</button>
      </div>
    `;

  const modal = createModal(modalContent);

  // Обработчик для кнопки "Купить"
  const confirmBtn = modal.querySelector('.confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (coins >= cost) {
        coins -= cost;
        chanceUpgrades[quality]++;
        coinsDisplay.textContent = coins;
        renderShop();

        // Показываем сообщение об успешной покупке
        modal.querySelector('.modal-content').innerHTML = `
          <p>Вы увеличили шанс поимки ${qualityToName(quality)} на 1%, потратив ${cost} монет</p>
          <div class="modal-buttons">
            <button class="close-modal-btn">Закрыть</button>
          </div>
        `;

        // Добавляем обработчик для новой кнопки "Закрыть"
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
          modal.remove();
        });
      }
    });
  }

  // Обработчик для кнопки "Закрыть"
  modal.querySelector('.close-modal-btn').addEventListener('click', () => {
    modal.remove();
  });
}

function createModal(content) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      ${content}
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// Инициализация
initStats();
renderStats();
updateEnergy();
coinsDisplay.textContent = coins; // Отображаем количество монет при загрузке

// Восстановление энергии каждую минуту
setInterval(() => {
	if(currentEnergy < maxEnergy) {
	  currentEnergy++;
	  updateEnergy();
	}
  }, 60000); // 60 000 мс = 1 минута