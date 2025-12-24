// إعدادات الربط مع Supabase
const SB_URL = 'https://xwbdeeeujmokouevvvod.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3YmRlZWV1am1va291ZXZ2dm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODU3MDMsImV4cCI6MjA4MjA2MTcwM30.tIVa9AcJ3B7JDo7kZCr95-z4TEf5eWNtZiXhXxJH8po';
const client = supabase.createClient(SB_URL, SB_KEY);

const buildings = ['B1', 'B2', 'B4', 'D1', 'D2', 'D3', 'D4'];
const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const tasks = [
    { id: 1, n: "مراقبة أحزمة البيض", d: "08:30-10:30" },
    { id: 2, n: "جمع النافق + العلف", d: "08:30-09:30" },
    { id: 3, n: "كشط الزبل", d: "09:30-10:30" }
];

let db = {};
let curB = 'B1';
let curKey = null;

// تشغيل النظام
async function startApp() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('navbar').style.display = 'block';
    document.getElementById('mainApp').style.display = 'block';
    await loadData();
}

// تحميل البيانات من السحابة
async function loadData() {
    const { data } = await client.from('farm_db').select('data').eq('id', 1).single();
    if (data && data.data && Object.keys(data.data).length > 0) {
        db = data.data;
    } else {
        buildings.forEach(b => db[b] = { workers: [], ass: {} });
    }
    render();
}

// مزامنة البيانات (حفظ في السحابة)
async function sync() {
    render();
    await client.from('farm_db').update({ data: db }).eq('id', 1);
}

function showPage(p) {
    document.querySelectorAll('.page').forEach(pg => pg.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.getElementById('page-' + p).classList.add('active');
    document.getElementById('link-' + p).classList.add('active');
}

function addWorker() {
    const n = document.getElementById('wName').value;
    const o = document.getElementById('wOff').value;
    const c = document.getElementById('wColor').value;
    if (!n) return;
    db[curB].workers.push({ id: Date.now(), name: n, off: o, color: c });
    document.getElementById('wName').value = '';
    sync();
}

function openModal(k) {
    curKey = k;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    const ass = db[curB].ass[k] || [];
    document.getElementById('checklist').innerHTML = db[curB].workers.map(w => `
        <div class="w-opt ${ass.includes(w.name)?'selected':''}" onclick="this.classList.toggle('selected')">
            ${w.name}
        </div>
    `).join('');
}

function saveAss() {
    const sel = Array.from(document.querySelectorAll('.w-opt.selected')).map(el => el.innerText.trim());
    db[curB].ass[curKey] = sel;
    closeModal();
    sync();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function render() {
    const data = db[curB] || { workers: [], ass: {} };
    document.getElementById('currentBTitle').innerText = `جدول مبنى: ${curB}`;
    
    document.getElementById('buildingBtns').innerHTML = buildings.map(b => 
        `<button class="btn" style="margin:2px; background:${b===curB?'#4361ee':'#ddd'}; color:${b===curB?'#fff':'#000'}" onclick="curB='${b}'; render();">${b}</button>`
    ).join('');

    document.getElementById('staffList').innerHTML = data.workers.map(w => 
        `<div class="card" style="border-right: 10px solid ${w.color}; display:flex; justify-content:space-between;">
            <span>${w.name} (راحة: ${w.off})</span>
            <button onclick="db[curB].workers = db[curB].workers.filter(x=>x.id!==${w.id}); sync();" style="color:red; background:none; border:none; cursor:pointer;">حذف</button>
        </div>`
    ).join('');

    const tableContent = `
        <table>
            <thead><tr><th>المهمة</th>${days.map(d=>`<th>${d}</th>`).join('')}</tr></thead>
            <tbody>
                ${tasks.map(t => `
                    <tr>
                        <td><b>${t.n}</b><br><small>${t.d}</small></td>
                        ${days.map((d, i) => {
                            const k = `${t.id}_${i}`;
                            const names = data.ass[k] || [];
                            return `<td onclick="openModal('${k}')" style="cursor:pointer">
                                ${names.map(n => {
                                    const w = data.workers.find(x => x.name === n);
                                    const isOff = w && w.off === d;
                                    return `<span class="worker-tag" style="background:${isOff?'#ccc':(w?w.color:'#333')}; ${isOff?'text-decoration:line-through':''}">${n}</span>`;
                                }).join('')}
                            </td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
