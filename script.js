// نظام إدارة مزارع B&D - مبرمج بواسطة SAAD BOURHILA
const buildings = ['B1', 'B2', 'B4', 'D1', 'D2', 'D3', 'D4'];
const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

// المهام الافتراضية الأولية
const dailyTasks = [
    { n: "مراقبة أحزمة البيض", d: "08:30-10:30", f: "daily" },
    { n: "جمع النافق + مراقبة الماء والعلف", d: "08:30-09:30", f: "daily" },
    { n: "كشط الزبل", d: "09:30-10:30", f: "daily" },
    { n: "مراقبة أحزمة البيض (جولة 2)", d: "10:30-12:00", f: "daily" },
    { n: "تنظيف كاشطات الزبل", d: "10:30-12:00", f: "daily" },
    { n: "أعمال يومية عامة", d: "12:00-13:00", f: "daily" },
    { n: "استراحة الغداء", d: "13:00-14:00", f: "daily" },
    { n: "تنظيف المداخل ومغطس الأرجل", d: "17:00-18:00", f: "daily" }
];

const weeklyTasks = [
    { n: "تنظيف أنابيب نياجرا", d: "14:00-17:00", f: "weekly" },
    { n: "وزن الدجاج", d: "14:00-18:00", f: "weekly" },
    { n: "التنظيف الشامل للمبنى", d: "14:00-18:00", f: "weekly" },
    { n: "كنس الممرات وتحت الأقفاص", d: "14:00-18:00", f: "weekly" }
];

const monthlyTasks = [
    { n: "تطهير المحيط الخارجي للمبنى", d: "الأسبوع 3", f: "monthly" }
];

// قاعدة البيانات
let db = JSON.parse(localStorage.getItem('sb_final_v5')) || {};

buildings.forEach(b => {
    if (!db[b]) {
        db[b] = {
            workers: b === 'B1' ? [
                { id: 1, name: "أسامة", role: "عامل", off: "السبت", color: "#4361ee" },
                { id: 2, name: "نورا", role: "عاملة", off: "الجمعة", color: "#e91e63" },
                { id: 3, name: "ياسين", role: "مسؤول", off: "الأحد", color: "#2ec4b6" }
            ] : [],
            tasks: [...dailyTasks, ...weeklyTasks, ...monthlyTasks].map(t => ({...t, id: Math.random().toString(36).substr(2, 9) })),
            ass: {}
        };
    }
});

let curB = 'B1';
let curKey = null;

// دالة تشغيل الصوت المحدثة
const snd = () => {
    const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    clickSound.volume = 0.1;
    clickSound.play().catch(() => {});
};

// --- وظائف النظام الأساسية ---
function enterSystem() {
    snd();
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('navbar').style.display = 'block';
    document.getElementById('mainApp').style.display = 'block';
    render();
}

function showPage(p) {
    snd();
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.getElementById('page-' + p).classList.add('active');
    document.getElementById('link-' + p).classList.add('active');
    render();
}

function switchB(b) {
    curB = b;
    snd();
    render();
}

function save() {
    localStorage.setItem('sb_final_v5', JSON.stringify(db));
    render();
}

// --- ميزة نسخ مهام B1 لجميع المباني ---
window.copyTasksToAll = function() {
    if (confirm("هل تريد نسخ جميع مهام المبنى B1 إلى كافة المباني الأخرى؟ (سيتم استبدال المهام القديمة في تلك المباني)")) {
        const sourceTasks = JSON.parse(JSON.stringify(db['B1'].tasks));
        buildings.forEach(b => {
            if (b !== 'B1') {
                db[b].tasks = sourceTasks.map(t => ({...t, id: Math.random().toString(36).substr(2, 9) }));
                db[b].ass = {};
            }
        });
        save();
        alert("تم توحيد المهام في جميع المباني بنجاح ✓");
    }
};

// --- إدارة المهام ---
window.delTask = function(id) {
    if (confirm('حذف هذه المهمة نهائياً؟')) {
        db[curB].tasks = db[curB].tasks.filter(t => t.id !== id);
        save();
    }
};

window.editTask = function(id) {
    const task = db[curB].tasks.find(t => t.id === id);
    if (!task) return;
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('tNameInput').value = task.n;
    document.getElementById('tTimeInput').value = task.d;
    document.getElementById('tTypeInput').value = task.f;
    document.getElementById('btnSaveTask').innerText = "تحديث المهمة ✓";
    document.getElementById('btnCancelTask').style.display = "inline-block";
    showPage('tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.saveNewTask = function() {
    const name = document.getElementById('tNameInput').value;
    const time = document.getElementById('tTimeInput').value;
    const type = document.getElementById('tTypeInput').value;
    const editId = document.getElementById('editTaskId').value;
    if (!name) return alert("الاسم مطلوب");
    if (editId) {
        const index = db[curB].tasks.findIndex(t => t.id === editId);
        if (index !== -1) db[curB].tasks[index] = {...db[curB].tasks[index], n: name, d: time, f: type };
    } else {
        db[curB].tasks.push({ id: Math.random().toString(36).substr(2, 9), n: name, d: time, f: type });
    }
    resetTaskForm();
    save();
};

window.resetTaskForm = function() {
    document.getElementById('editTaskId').value = '';
    document.getElementById('tNameInput').value = '';
    document.getElementById('tTimeInput').value = '';
    document.getElementById('btnSaveTask').innerText = "حفظ المهمة ✓";
    document.getElementById('btnCancelTask').style.display = "none";
};

// --- إدارة العمال ---
function addWorker() {
    const n = document.getElementById('wName').value;
    const r = document.getElementById('wRole').value;
    const o = document.getElementById('wOff').value;
    const c = document.getElementById('wColor').value;
    if (!n || !o) return alert("الاسم ويوم الراحة مطلوبان");
    db[curB].workers.push({ id: Date.now(), name: n, role: r, off: o, color: c });
    save();
    document.getElementById('wName').value = '';
}

function delW(id) {
    if (confirm('حذف هذا العامل؟')) {
        db[curB].workers = db[curB].workers.filter(w => w.id !== id);
        save();
    }
}

// --- التكليفات (Modal) المحدثة مع تأثير الماوس والضغط ---
function openModal(k) {
    curKey = k;
    const [taskId, dayIdx] = k.split('_');
    const data = db[curB];
    const currentTask = data.tasks.find(t => t.id === taskId);

    let busyWorkers = [];
    if (currentTask.f !== 'daily') {
        data.tasks.forEach(t => {
            if (t.f === 'daily' && t.d === currentTask.d) {
                const dailyAss = data.ass[t.id + '_' + dayIdx] || [];
                busyWorkers = [...busyWorkers, ...dailyAss];
            }
        });
    }

    document.getElementById('modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    const ass = data.ass[k] || [];

    // توليد خيارات العمال مع كلاس w-opt لتفعيل الـ CSS (اليد والضغط)
    document.getElementById('checklist').innerHTML = data.workers.map(w => {
        const isBusy = busyWorkers.includes(w.name) && !ass.includes(w.name);
        return `<div class="w-opt ${ass.includes(w.name)?'selected':''} ${isBusy?'disabled':''}" 
                style="${isBusy?'opacity:0.3; pointer-events:none; background:#eee;':''}"
                onclick="handleWorkerSelection(this)">${w.name} ${isBusy?'(مشغول)':''}</div>`;
    }).join('') || "أضف عمالاً أولاً";
}

// دالة وسيطة لتشغيل الصوت عند اختيار عامل
function handleWorkerSelection(el) {
    snd();
    el.classList.toggle('selected');
}

function saveAss() {
    const sel = Array.from(document.querySelectorAll('.w-opt.selected:not(.disabled)')).map(el => el.innerText.replace('(مشغول)', '').trim());
    db[curB].ass[curKey] = sel;
    closeModal();
    save();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// بقية الدوال (toggleWorkerTask, renderWorkerSchedules, render) تظل كما هي في كودك الأصلي...
window.toggleWorkerTask = function(workerName, key) {
    let ass = db[curB].ass[key] || [];
    const [taskId, dayIdx] = key.split('_');
    const task = db[curB].tasks.find(t => t.id === taskId);

    if (ass.includes(workerName)) {
        db[curB].ass[key] = ass.filter(n => n !== workerName);
    } else {
        let isBusy = false;
        if (task.f !== 'daily') {
            db[curB].tasks.forEach(t => {
                if (t.f === 'daily' && t.d === task.d) {
                    if ((db[curB].ass[t.id + '_' + dayIdx] || []).includes(workerName)) isBusy = true;
                }
            });
        }
        if (isBusy) return alert("هذا العامل مشغول بمهمة يومية في نفس الوقت!");
        db[curB].ass[key] = [...ass, workerName];
    }
    save();
}

function renderWorkerSchedules() {
    const data = db[curB];
    let workerHtml = '';
    data.workers.forEach(worker => {
                let hasTasks = false;
                let tableRows = '';
                data.tasks.forEach(task => {
                    let rowDays = '';
                    let inTask = false;
                    days.forEach((day, i) => {
                        const k = task.id + '_' + i;
                        const isAssigned = (data.ass[k] || []).includes(worker.name);
                        const isOff = worker.off === day;
                        if (isAssigned) {
                            inTask = true;
                            hasTasks = true;
                        }

                        rowDays += `<td onclick="toggleWorkerTask('${worker.name}', '${k}')" 
                    style="border:1px solid #000; text-align:center; cursor:pointer; height:30px; background:${isOff ? '#ffebee' : (isAssigned?'#e3f2fd':'#fff')};">
                    ${isAssigned ? '✅' : (isOff ? '<small style="color:red">راحة</small>' : '-')}
                </td>`;
                    });
                    if (inTask) {
                        tableRows += `<tr>
                    <td style="border:1px solid #000; padding:5px; font-size:11px;"><b>${task.n}</b></td>
                    ${rowDays}
                    <td style="border:1px solid #000; width:70px;"></td>
                </tr>`;
                    }
                });
                if (hasTasks) {
                    workerHtml += `<div class="report-section" style="page-break-before: always; border:2px solid #333; padding:10px; margin-top:20px;">
                <h3 style="text-align:center; margin-bottom:10px; background:#f0f0f0; padding:5px;">جدول مهام العامل: ${worker.name}</h3>
                <table style="width:100%; border-collapse:collapse; table-layout: fixed;">
                    <thead><tr style="background:#eee;"><th style="font-size:10px; border:1px solid #000; width:120px;">المهمة</th>${days.map(d=>`<th style="font-size:9px; border:1px solid #000;">${d}</th>`).join('')}<th style="font-size:10px; border:1px solid #000; width:70px;">توقيع</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>`;
        }
    });
    return workerHtml;
}

function render() {
    const data = db[curB];
    let farmName = (['B1', 'B2', 'B4'].includes(curB)) ? "COPROGAL" : (['D1', 'D2', 'D3', 'D4'].includes(curB) ? "GALIPRO" : "S.B System");

    document.getElementById('curBLabel').innerText = farmName + " - " + curB;
    document.getElementById('pb').innerText = curB;
    document.getElementById('s-w').innerText = data.workers.length;
    document.getElementById('s-t').innerText = data.tasks.filter(t => t.f === 'daily').length;

    let selectorsHtml = buildings.map(b =>
        `<button class="btn" style="margin:2px; background:${b===curB?'#4361ee':'#ddd'}; color:${b===curB?'white':'black'}" onclick="switchB('${b}')">${b}</button>`
    ).join('');
    
    if(curB === 'B1') {
        selectorsHtml += `<button class="btn no-print" style="background:#2ecc71; color:white; margin-right:15px;" onclick="copyTasksToAll()">نسخ مهام B1 للكل 📋</button>`;
    }
    document.getElementById('buildingSelectors').innerHTML = selectorsHtml;

    document.getElementById('staffList').innerHTML = data.workers.map(w => `
        <div class="worker-card" style="border-right:5px solid ${w.color};">
            <div><b>${w.name}</b><br><small>${w.role} | راحة: ${w.off}</small></div>
            <button class="btn" style="color:red; background:none; border:none;" onclick="delW(${w.id})">🗑</button>
        </div>
    `).join('');

    const types = { daily: 'المهام اليومية', weekly: 'المهام الأسبوعية', monthly: 'المهام الشهرية' };
    let finalHtml = '';

    for (let type in types) {
        const filtered = data.tasks.filter(t => t.f === type);
        if (filtered.length === 0) continue;

        let tableHtml = `<div class="report-section" style="page-break-after: always; margin-bottom: 20px;">
            <div style="text-align:center; margin-bottom:10px;" class="print-only"><h2>${farmName}</h2><h4>مبنى: ${curB} - ${types[type]}</h4></div>
            <h3 class="no-print" style="border-right:4px solid #4361ee; padding-right:10px;">📌 ${types[type]}</h3>
            <table style="width:100%; border-collapse:collapse; border:2px solid #000; table-layout: fixed;">
                <thead><tr style="background:#f1f5f9;"><th style="border:1px solid #000; padding:6px; width:130px; font-size:11px;">المهمة والوقت</th>`;
        days.forEach(d => tableHtml += `<th style="border:1px solid #000; padding:6px; font-size:10px;">${d}</th>`);
        tableHtml += `</tr></thead><tbody>`;

        filtered.forEach(t => {
            tableHtml += `<tr>
                <td style="border:1px solid #000; padding:5px; text-align:center; font-size:11px;">
                    <b>${t.n}</b><br><span style="color:#e63946;">⏰ ${t.d}</span>
                    <div class="no-print" style="margin-top:5px; display:flex; gap:10px; justify-content:center;">
                        <span title="تعديل" style="cursor:pointer;" onclick="editTask('${t.id}')">📝</span>
                        <span title="حذف" style="cursor:pointer; color:red" onclick="delTask('${t.id}')">🗑</span>
                    </div>
                </td>`;
            days.forEach((day, i) => {
                const k = t.id + '_' + i;
                let ass = data.ass[k] || [];
                
                if (t.f !== 'daily') {
                    const busyNames = [];
                    data.tasks.forEach(dt => { if(dt.f === 'daily' && dt.d === t.d) busyNames.push(...(data.ass[dt.id + '_' + i] || [])) });
                    ass = ass.filter(n => !busyNames.includes(n));
                }

                const tags = ass.map(n => {
                    const w = data.workers.find(x => x.name === n);
                    const isOff = w && w.off === day;
                    return `<div style="margin-bottom:2px;"><span style="display:block; background:${isOff ? '#d1d1d1' : (w ? w.color : '#333')}; color:${isOff ? '#777' : 'white'}; text-decoration:${isOff ? 'line-through' : 'none'}; padding:2px; border-radius:2px; font-size:9px; font-weight:bold;">${n}</span></div>`;
                }).join('');
                tableHtml += `<td onclick="openModal('${k}')" style="border:1px solid #000; padding:2px; text-align:center; vertical-align:top; cursor:pointer;">${tags || ''}</td>`;
            });
            tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table></div>`;
        finalHtml += tableHtml;
    }

    let absenceLog = `<div class="report-section" style="page-break-before: always;"><h3 style="text-align:center;">📑 سجل الحضور والغياب والملاحظات</h3><table style="width:100%; border-collapse:collapse; border:2px solid #000;"><thead><tr style="background:#eee;"><th style="border:1px solid #000; padding:8px;">العامل</th><th style="border:1px solid #000; padding:8px;">يوم الراحة</th><th style="border:1px solid #000; padding:8px;">سبب الغياب / ملاحظات</th><th style="border:1px solid #000; padding:8px;">التوقيع</th></tr></thead><tbody>${data.workers.map(w => `<tr><td style="border:1px solid #000; padding:10px;"><b>${w.name}</b></td><td style="border:1px solid #000; padding:10px;">${w.off}</td><td style="border:1px solid #000; padding:10px; height:40px;"></td><td style="border:1px solid #000; padding:10px;"></td></tr>`).join('')}</tbody></table></div>`;

    document.getElementById('taskManagerView').innerHTML = finalHtml;
    document.getElementById('finalReportContainer').innerHTML = finalHtml + absenceLog + renderWorkerSchedules();
}