// 預設資料結構
const initialData = {
    categories: [
        {
            id: 'cat-1',
            name: '醫院紀錄',
            icon: '🏥',
            subcategories: [
                { id: 'sub-101', name: '眼科', records: [{ date: '2026-03-15', note: '視力檢查與開眼藥水' }] },
                { id: 'sub-102', name: '牙科', records: [{ date: '2026-07-20', note: '定期洗牙與補牙' }] }
            ]
        },
        {
            id: 'cat-2',
            name: '醫美紀錄',
            icon: '✨',
            subcategories: [
                { id: 'sub-201', name: '皮秒雷射', records: [{ date: '2026-02-10', note: '全臉保養雷射' }] }
            ]
        },
        { id: 'cat-3', name: '自訂項目 1', icon: '💊', subcategories: [] },
        { id: 'cat-4', name: '自訂項目 2', icon: '🩺', subcategories: [] },
        { id: 'cat-5', name: '自訂項目 3', icon: '📝', subcategories: [] }
    ]
};

// 狀態管理
let appData = loadData();
let currentCatId = null;
let currentSubcatId = null;

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    displayTodayDate();
    renderHome();

    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('input-record-date').value = todayStr;

    document.getElementById('back-btn').addEventListener('click', handleBack);
});

function displayTodayDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('today-date-display').innerText = now.toLocaleDateString('zh-TW', options);
}

function loadData() {
    const saved = localStorage.getItem('my_med_tracker_data');
    return saved ? JSON.parse(saved) : initialData;
}

function saveData() {
    localStorage.setItem('my_med_tracker_data', JSON.stringify(appData));
}

function switchView(viewName) {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-category').classList.add('hidden');
    document.getElementById('view-records').classList.add('hidden');

    const backBtn = document.getElementById('back-btn');

    if (viewName === 'home') {
        document.getElementById('view-home').classList.remove('hidden');
        backBtn.classList.add('hidden');
        currentCatId = null;
        currentSubcatId = null;
    } else if (viewName === 'category') {
        document.getElementById('view-category').classList.remove('hidden');
        backBtn.classList.remove('hidden');
        currentSubcatId = null;
    } else if (viewName === 'records') {
        document.getElementById('view-records').classList.remove('hidden');
        backBtn.classList.remove('hidden');
    }
}

function handleBack() {
    if (currentSubcatId) {
        openCategory(currentCatId);
    } else {
        switchView('home');
    }
}

function renderHome() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = '';

    appData.categories.forEach(cat => {
        const totalItems = cat.subcategories.length;
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-36 group';
        card.onclick = () => openCategory(cat.id);

        card.innerHTML = `
      <div class="flex justify-between items-start">
        <span class="text-3xl">${cat.icon}</span>
        <span class="text-xs bg-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 text-slate-500 font-medium px-2.5 py-1 rounded-full transition">
          ${totalItems} 個項目
        </span>
      </div>
      <div>
        <h3 class="font-bold text-slate-800 text-base group-hover:text-teal-700 transition">${cat.name}</h3>
        <p class="text-xs text-slate-400 mt-1">點擊查看或編輯紀錄</p>
      </div>
    `;
        grid.appendChild(card);
    });

    switchView('home');
}

function openCategory(catId) {
    currentCatId = catId;
    const cat = appData.categories.find(c => c.id === catId);
    if (!cat) return;

    document.getElementById('cat-title-display').innerText = cat.name;
    document.getElementById('cat-icon-display').innerText = cat.icon;

    const list = document.getElementById('subcategories-list');
    list.innerHTML = '';

    if (cat.subcategories.length === 0) {
        list.innerHTML = `
      <div class="text-center py-10 text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
        目前還沒有項目，點擊右上角「+ 新增項目」來建立吧！
      </div>
    `;
    } else {
        cat.subcategories.forEach(sub => {
            const lastRecord = sub.records && sub.records.length > 0 ? sub.records[0].date : '尚無紀錄';

            const item = document.createElement('div');
            item.className = 'bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-teal-200 transition cursor-pointer';
            item.onclick = () => openSubcategoryRecords(sub.id);

            item.innerHTML = `
        <div class="space-y-1">
          <h4 class="font-bold text-slate-800 text-sm">${sub.name}</h4>
          <div class="text-xs text-slate-500">
            上次看診：<span class="font-semibold ${lastRecord === '尚無紀錄' ? 'text-slate-400' : 'text-teal-700'}">${lastRecord}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg font-medium">查看</span>
          <button onclick="event.stopPropagation(); deleteSubcategory('${sub.id}')" class="text-xs text-slate-300 hover:text-red-500 p-1">🗑️</button>
        </div>
      `;
            list.appendChild(item);
        });
    }

    switchView('category');
}

function editCategoryName() {
    const cat = appData.categories.find(c => c.id === currentCatId);
    if (!cat) return;

    const newName = prompt('請輸入新的類別名稱：', cat.name);
    if (newName && newName.trim() !== '') {
        cat.name = newName.trim();
        saveData();
        openCategory(currentCatId);
    }
}

function addNewSubcategory() {
    const cat = appData.categories.find(c => c.id === currentCatId);
    if (!cat) return;

    const name = prompt('請輸入新項目名稱 (例如：眼科、皮膚科、皮秒雷射)：');
    if (name && name.trim() !== '') {
        const newSub = {
            id: 'sub-' + Date.now(),
            name: name.trim(),
            records: []
        };
        cat.subcategories.push(newSub);
        saveData();
        openCategory(currentCatId);
    }
}

function deleteSubcategory(subId) {
    if (!confirm('確定要刪除這個項目嗎？相關紀錄也會一併被移除喔！')) return;

    const cat = appData.categories.find(c => c.id === currentCatId);
    if (cat) {
        cat.subcategories = cat.subcategories.filter(s => s.id !== subId);
        saveData();
        openCategory(currentCatId);
    }
}

function openSubcategoryRecords(subId) {
    currentSubcatId = subId;
    const cat = appData.categories.find(c => c.id === currentCatId);
    const sub = cat ? cat.subcategories.find(s => s.id === subId) : null;
    if (!sub) return;

    document.getElementById('subcat-title-display').innerText = `${cat.name} ▸ ${sub.name}`;

    sub.records.sort((a, b) => new Date(b.date) - new Date(a.date));

    const lastDate = sub.records.length > 0 ? sub.records[0].date : '尚無紀錄';
    document.getElementById('last-visit-date').innerText = lastDate;

    const historyList = document.getElementById('records-history-list');
    historyList.innerHTML = '';

    if (sub.records.length === 0) {
        historyList.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-xs bg-white rounded-xl border border-slate-100">
        還沒有看診紀錄，請在上方輸入日期並點擊儲存！
      </div>
    `;
    } else {
        sub.records.forEach((rec, idx) => {
            const card = document.createElement('div');
            card.className = 'bg-white p-3.5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center text-sm';

            card.innerHTML = `
        <div>
          <div class="font-bold text-slate-700">${rec.date} ${idx === 0 ? '<span class="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded ml-1">最新</span>' : ''}</div>
          ${rec.note ? `<div class="text-xs text-slate-500 mt-0.5">${rec.note}</div>` : ''}
        </div>
        <button onclick="deleteRecord(${idx})" class="text-xs text-slate-300 hover:text-red-500 p-1">🗑️</button>
      `;
            historyList.appendChild(card);
        });
    }

    switchView('records');
}

function saveNewRecord() {
    const dateInput = document.getElementById('input-record-date').value;
    const noteInput = document.getElementById('input-record-note').value;

    if (!dateInput) {
        alert('請選擇看診日期！');
        return;
    }

    const cat = appData.categories.find(c => c.id === currentCatId);
    const sub = cat ? cat.subcategories.find(s => s.id === currentSubcatId) : null;

    if (sub) {
        sub.records.push({
            date: dateInput,
            note: noteInput.trim()
        });

        saveData();
        document.getElementById('input-record-note').value = '';
        openSubcategoryRecords(currentSubcatId);
    }
}

function deleteRecord(index) {
    if (!confirm('確定要刪除這筆看診紀錄嗎？')) return;

    const cat = appData.categories.find(c => c.id === currentCatId);
    const sub = cat ? cat.subcategories.find(s => s.id === currentSubcatId) : null;

    if (sub) {
        sub.records.splice(index, 1);
        saveData();
        openSubcategoryRecords(currentSubcatId);
    }
}