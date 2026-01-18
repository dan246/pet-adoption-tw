/**
 * 浪浪找家 - 台灣流浪動物領養平台
 * 資料來源：行政院農業部 動物認領養開放資料
 * API: https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL
 */

// ===== 全域變數 =====
let allAnimals = [];
let filteredAnimals = [];
let currentPage = 1;
const itemsPerPage = 12;

// API 端點 (政府開放資料)
const API_URL = 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL&IsTransData=1';

// 台灣縣市代碼對照表
const cityCodeMap = {
    '2': '臺北市',
    '3': '新北市',
    '4': '基隆市',
    '5': '宜蘭縣',
    '6': '桃園市',
    '7': '新竹縣',
    '8': '新竹市',
    '9': '苗栗縣',
    '10': '臺中市',
    '11': '彰化縣',
    '12': '南投縣',
    '13': '雲林縣',
    '14': '嘉義縣',
    '15': '嘉義市',
    '16': '臺南市',
    '17': '高雄市',
    '18': '屏東縣',
    '19': '花蓮縣',
    '20': '臺東縣',
    '21': '澎湖縣',
    '22': '金門縣',
    '23': '連江縣'
};

// ===== DOM 元素 =====
const elements = {
    petGrid: document.getElementById('pet-grid'),
    loading: document.getElementById('loading'),
    pagination: document.getElementById('pagination'),
    modal: document.getElementById('pet-modal'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.querySelector('.modal-close'),
    filterBtn: document.getElementById('filter-btn'),
    resetBtn: document.getElementById('reset-btn'),
    resultsCount: document.getElementById('results-count'),
    totalCount: document.getElementById('total-count'),
    dogCount: document.getElementById('dog-count'),
    catCount: document.getElementById('cat-count'),
    citySelect: document.getElementById('city'),
    animalType: document.getElementById('animal-type'),
    gender: document.getElementById('gender'),
    bodyType: document.getElementById('body-type'),
    sterilized: document.getElementById('sterilized'),
    search: document.getElementById('search'),
    viewBtns: document.querySelectorAll('.view-btn'),
    hamburger: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu')
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await fetchAnimals();
    setupEventListeners();
    populateCityFilter();
    animateStats();
}

// ===== API 呼叫 =====
async function fetchAnimals() {
    try {
        showLoading(true);

        // 使用 CORS proxy 或直接呼叫 (視環境而定)
        // 政府開放資料 API 通常支援 CORS
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 過濾只保留開放領養的動物
        allAnimals = data.filter(animal =>
            animal.animal_status === 'OPEN' || animal.animal_status === '開放認養'
        );

        // 如果沒有過濾結果，使用全部資料
        if (allAnimals.length === 0) {
            allAnimals = data;
        }

        filteredAnimals = [...allAnimals];
        updateStats();
        renderAnimals();

    } catch (error) {
        console.error('載入資料失敗:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

// ===== 渲染功能 =====
function renderAnimals() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);

    if (paginatedAnimals.length === 0) {
        elements.petGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <i class="fas fa-search" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666;">找不到符合條件的動物</h3>
                <p style="color: #999;">請嘗試調整篩選條件</p>
            </div>
        `;
        elements.pagination.innerHTML = '';
        return;
    }

    elements.petGrid.innerHTML = paginatedAnimals.map(animal => createPetCard(animal)).join('');

    // 加入點擊事件
    document.querySelectorAll('.pet-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            showModal(paginatedAnimals[index]);
        });
    });

    renderPagination();
    updateResultsCount();
}

function createPetCard(animal) {
    const animalType = getAnimalType(animal.animal_kind);
    const typeClass = animalType === '狗' ? 'dog' : animalType === '貓' ? 'cat' : 'other';
    const genderText = getGenderText(animal.animal_sex);
    const bodyTypeText = getBodyTypeText(animal.animal_bodytype);
    const cityName = cityCodeMap[animal.animal_area_pkid] || animal.shelter_name || '未知地區';

    const imageHtml = animal.album_file
        ? `<img src="${animal.album_file}" alt="${animal.animal_kind}" class="pet-image" onerror="this.parentElement.innerHTML='<div class=\\'pet-image-placeholder\\'><i class=\\'fas fa-${animalType === '狗' ? 'dog' : animalType === '貓' ? 'cat' : 'paw'}\\'></i></div>'">`
        : `<div class="pet-image-placeholder"><i class="fas fa-${animalType === '狗' ? 'dog' : animalType === '貓' ? 'cat' : 'paw'}"></i></div>`;

    return `
        <div class="pet-card" data-id="${animal.animal_id}">
            ${imageHtml}
            <div class="pet-info">
                <div class="pet-header">
                    <h3 class="pet-name">${animal.animal_Variety || animalType}</h3>
                    <span class="pet-type-badge ${typeClass}">${animalType}</span>
                </div>
                <div class="pet-details">
                    <span class="pet-detail"><i class="fas fa-venus-mars"></i> ${genderText}</span>
                    <span class="pet-detail"><i class="fas fa-ruler"></i> ${bodyTypeText}</span>
                    <span class="pet-detail"><i class="fas fa-palette"></i> ${animal.animal_colour || '未知'}</span>
                </div>
                <div class="pet-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${cityName}</span>
                </div>
            </div>
        </div>
    `;
}

function renderPagination() {
    const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);

    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }

    let html = '';

    // 上一頁按鈕
    html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
    </button>`;

    // 頁碼按鈕
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span style="padding: 0 10px;">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span style="padding: 0 10px;">...</span>`;
        }
        html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // 下一頁按鈕
    html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
    </button>`;

    elements.pagination.innerHTML = html;
}

// ===== 篩選功能 =====
function applyFilters() {
    const animalType = elements.animalType.value;
    const city = elements.citySelect.value;
    const gender = elements.gender.value;
    const bodyType = elements.bodyType.value;
    const sterilized = elements.sterilized.value;
    const searchText = elements.search.value.toLowerCase().trim();

    filteredAnimals = allAnimals.filter(animal => {
        // 動物類型篩選
        if (animalType && getAnimalType(animal.animal_kind) !== animalType) {
            return false;
        }

        // 縣市篩選
        if (city && animal.animal_area_pkid !== city) {
            return false;
        }

        // 性別篩選
        if (gender && animal.animal_sex !== gender) {
            return false;
        }

        // 體型篩選
        if (bodyType && animal.animal_bodytype !== bodyType) {
            return false;
        }

        // 絕育狀態篩選
        if (sterilized && animal.animal_sterilization !== sterilized) {
            return false;
        }

        // 關鍵字搜尋
        if (searchText) {
            const searchFields = [
                animal.animal_Variety,
                animal.animal_colour,
                animal.shelter_name,
                animal.animal_place,
                animal.animal_remark
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchFields.includes(searchText)) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderAnimals();
}

function resetFilters() {
    elements.animalType.value = '';
    elements.citySelect.value = '';
    elements.gender.value = '';
    elements.bodyType.value = '';
    elements.sterilized.value = '';
    elements.search.value = '';

    filteredAnimals = [...allAnimals];
    currentPage = 1;
    renderAnimals();
}

function populateCityFilter() {
    // 從資料中取得所有縣市
    const cities = new Set();
    allAnimals.forEach(animal => {
        if (animal.animal_area_pkid && cityCodeMap[animal.animal_area_pkid]) {
            cities.add(animal.animal_area_pkid);
        }
    });

    // 排序並建立選項
    const sortedCities = Array.from(cities).sort((a, b) => parseInt(a) - parseInt(b));

    sortedCities.forEach(cityCode => {
        const option = document.createElement('option');
        option.value = cityCode;
        option.textContent = cityCodeMap[cityCode];
        elements.citySelect.appendChild(option);
    });
}

// ===== 彈窗功能 =====
function showModal(animal) {
    const animalType = getAnimalType(animal.animal_kind);
    const typeClass = animalType === '狗' ? 'dog' : animalType === '貓' ? 'cat' : 'other';

    const imageHtml = animal.album_file
        ? `<img src="${animal.album_file}" alt="${animal.animal_kind}" class="modal-image" onerror="this.parentElement.innerHTML='<div class=\\'modal-image-placeholder\\'><i class=\\'fas fa-${animalType === '狗' ? 'dog' : animalType === '貓' ? 'cat' : 'paw'}\\'></i></div>'">`
        : `<div class="modal-image-placeholder"><i class="fas fa-${animalType === '狗' ? 'dog' : animalType === '貓' ? 'cat' : 'paw'}"></i></div>`;

    elements.modalBody.innerHTML = `
        ${imageHtml}
        <div class="modal-info">
            <div class="modal-header">
                <h2 class="modal-title">${animal.animal_Variety || animalType}</h2>
                <span class="pet-type-badge ${typeClass}">${animalType}</span>
            </div>

            <div class="modal-grid">
                <div class="modal-detail">
                    <span class="modal-detail-label">性別</span>
                    <span class="modal-detail-value">${getGenderText(animal.animal_sex)}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-detail-label">體型</span>
                    <span class="modal-detail-value">${getBodyTypeText(animal.animal_bodytype)}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-detail-label">毛色</span>
                    <span class="modal-detail-value">${animal.animal_colour || '未知'}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-detail-label">年紀</span>
                    <span class="modal-detail-value">${getAgeText(animal.animal_age)}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-detail-label">絕育狀態</span>
                    <span class="modal-detail-value">${getSterilizationText(animal.animal_sterilization)}</span>
                </div>
                <div class="modal-detail">
                    <span class="modal-detail-label">狂犬病疫苗</span>
                    <span class="modal-detail-value">${getBacterinText(animal.animal_bacterin)}</span>
                </div>
            </div>

            ${animal.animal_remark ? `
                <div style="margin-bottom: 20px;">
                    <span class="modal-detail-label">備註</span>
                    <p style="margin-top: 8px; color: var(--dark-color);">${animal.animal_remark}</p>
                </div>
            ` : ''}

            <div class="modal-shelter">
                <h4><i class="fas fa-building" style="margin-right: 10px; color: var(--primary-color);"></i>收容所資訊</h4>
                <div class="shelter-info">
                    <p><i class="fas fa-home"></i> ${animal.shelter_name || '未知收容所'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${animal.shelter_address || animal.animal_place || '地址未提供'}</p>
                    <p><i class="fas fa-phone"></i> ${animal.shelter_tel || '電話未提供'}</p>
                </div>
            </div>

            <div class="modal-actions">
                <a href="tel:${animal.shelter_tel || ''}" class="btn btn-primary" ${!animal.shelter_tel ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
                    <i class="fas fa-phone"></i> 聯繫收容所
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(animal.shelter_address || animal.shelter_name || '')}"
                   target="_blank" class="btn btn-secondary">
                    <i class="fas fa-map"></i> 查看地圖
                </a>
            </div>
        </div>
    `;

    elements.modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modal.classList.remove('show');
    document.body.style.overflow = '';
}

// ===== 輔助函數 =====
function getAnimalType(kind) {
    if (!kind) return '其他';
    kind = kind.toLowerCase();
    if (kind.includes('狗') || kind.includes('dog') || kind.includes('犬')) return '狗';
    if (kind.includes('貓') || kind.includes('cat')) return '貓';
    return '其他';
}

function getGenderText(sex) {
    switch (sex) {
        case 'M': return '公';
        case 'F': return '母';
        default: return '未知';
    }
}

function getBodyTypeText(bodyType) {
    switch (bodyType) {
        case 'SMALL': return '小型';
        case 'MEDIUM': return '中型';
        case 'BIG': return '大型';
        default: return '未知';
    }
}

function getAgeText(age) {
    if (!age) return '未知';
    if (age === 'ADULT') return '成年';
    if (age === 'CHILD') return '幼年';
    return age;
}

function getSterilizationText(status) {
    switch (status) {
        case 'T': return '已絕育';
        case 'F': return '未絕育';
        default: return '未知';
    }
}

function getBacterinText(status) {
    switch (status) {
        case 'T': return '已施打';
        case 'F': return '未施打';
        default: return '未知';
    }
}

function showLoading(show) {
    if (show) {
        elements.loading.classList.remove('hidden');
        elements.petGrid.style.display = 'none';
    } else {
        elements.loading.classList.add('hidden');
        elements.petGrid.style.display = '';
    }
}

function showError() {
    elements.petGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 60px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--warning-color); margin-bottom: 20px;"></i>
            <h3 style="color: #666; margin-bottom: 10px;">資料載入失敗</h3>
            <p style="color: #999; margin-bottom: 20px;">無法連接到政府開放資料 API，請稍後再試</p>
            <button class="btn btn-primary" onclick="fetchAnimals()">
                <i class="fas fa-redo"></i> 重新載入
            </button>
        </div>
    `;
}

function updateStats() {
    const dogCount = allAnimals.filter(a => getAnimalType(a.animal_kind) === '狗').length;
    const catCount = allAnimals.filter(a => getAnimalType(a.animal_kind) === '貓').length;

    elements.totalCount.textContent = allAnimals.length;
    elements.dogCount.textContent = dogCount;
    elements.catCount.textContent = catCount;
}

function updateResultsCount() {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredAnimals.length);
    elements.resultsCount.textContent = `顯示 ${start}-${end} 筆，共 ${filteredAnimals.length} 筆結果`;
}

function animateStats() {
    // 數字動畫效果
    const animateNumber = (element, target) => {
        const duration = 1500;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    };

    // 當數字更新時觸發動畫
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const target = parseInt(mutation.target.textContent || mutation.target.innerText);
                if (!isNaN(target) && target > 0) {
                    // 已經設定了數字，不需要重複動畫
                }
            }
        });
    });
}

// ===== 事件監聽 =====
function setupEventListeners() {
    // 篩選按鈕
    elements.filterBtn.addEventListener('click', applyFilters);
    elements.resetBtn.addEventListener('click', resetFilters);

    // Enter 鍵搜尋
    elements.search.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // 彈窗關閉
    elements.modalClose.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            closeModal();
        }
    });

    // ESC 關閉彈窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // 檢視切換
    elements.viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.dataset.view;
            if (view === 'list') {
                elements.petGrid.classList.add('list-view');
            } else {
                elements.petGrid.classList.remove('list-view');
            }
        });
    });

    // 漢堡選單
    elements.hamburger.addEventListener('click', () => {
        elements.hamburger.classList.toggle('active');
        elements.navMenu.classList.toggle('active');
    });

    // 點擊導航連結關閉選單
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.hamburger.classList.remove('active');
            elements.navMenu.classList.remove('active');
        });
    });

    // 滾動時更新導航
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${section.id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

// ===== 全域函數 (分頁) =====
window.goToPage = function(page) {
    const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderAnimals();

    // 滾動到領養區塊頂部
    document.getElementById('adopt').scrollIntoView({ behavior: 'smooth', block: 'start' });
};
