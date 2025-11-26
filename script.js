/* --------------------------- A/L & O/L Exam Countdown - Enhanced Version --------------------------- */

// Configuration
const CONFIG = {
    BACKEND: {
        BIN_ID: '6925cbcad0ea881f40ff82ef',
        API_KEY: '$2a$10$FiJfon3yzXyaL8aqn0M.wOoFMXsTiXzsWSjUXTEVPFJ.dVbhphR6m',
        ACCESS_KEY: '$2a$10$eD7DG.b7Ngrpiz0peWnxsear8BVFZxBNDP0HpUig7HXXQ.cGbvn02'
    },
    WHATSAPP: {
        BOT: '94705179349',
        COMPLAINT: '94768164223'
    },
    EXAM_DATES: {
        '2025': new Date('2025-11-10T00:00:00'),
        '2026': new Date('2026-08-03T00:00:00'),
        '2027': new Date('2027-08-02T00:00:00'),
        'ol': new Date('2026-02-17T00:00:00')
    },
    STUDY_STARTS: {
        '2025': new Date('2024-01-01'),
        '2026': new Date('2025-01-01'),
        '2027': new Date('2026-01-01'),
        'ol': new Date('2024-01-01')
    }
};

// Backend URLs
const BACKEND_GET_URL = `https://api.jsonbin.io/v3/b/${CONFIG.BACKEND.BIN_ID}/latest`;
const BACKEND_PUT_URL = `https://api.jsonbin.io/v3/b/${CONFIG.BACKEND.BIN_ID}`;

// Global Variables
let currentBatch = '2026';
let comments = [];
let likedComments = new Set();
let currentUser = '';
let replyingTo = null;
let editingComment = null;

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

const DEFAULT_THEME = 'dark';
const THEME_KEY = 'theme';
const currentTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
htmlElement.setAttribute('data-theme', currentTheme);

if (themeIcon) {
    if (currentTheme === 'light') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

function toggleTheme() {
    const theme = htmlElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    if (themeIcon) {
        if (newTheme === 'light') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            showNotification('🌞', 'Light mode activated');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            showNotification('🌙', 'Dark mode activated');
        }
    }
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

// UI Helpers
function showNotification(icon, message) {
    const notificationToast = document.getElementById('notificationToast');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationMessage = document.getElementById('notificationMessage');
    if (!notificationToast || !notificationIcon || !notificationMessage) return;
    notificationIcon.textContent = icon;
    notificationMessage.textContent = message;
    notificationToast.classList.add('show');
    setTimeout(() => notificationToast.classList.remove('show'), 3000);
}

function showAlert(icon, title, message, callback = null) {
    const alertIcon = document.getElementById('alertIcon');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertPopup = document.getElementById('alertPopup');
    if (!alertPopup || !alertIcon || !alertTitle || !alertMessage) return;
    alertIcon.textContent = icon;
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertPopup.classList.add('show');
    document.body.style.overflow = 'hidden';
    window.alertCallback = callback;
}

function closeAlert() {
    const alertPopup = document.getElementById('alertPopup');
    if (!alertPopup) return;
    alertPopup.classList.remove('show');
    document.body.style.overflow = '';
    if (window.alertCallback) {
        window.alertCallback();
        window.alertCallback = null;
    }
}

// Disable Certain Keys & Context Menu
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.key.toLowerCase() === 'u')) {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'c')) {
        e.preventDefault();
    }
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Contact Popup
function openContactPopup() {
    const popup = document.getElementById('contactPopup');
    if (!popup) return;
    popup.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeContactPopup() {
    const popup = document.getElementById('contactPopup');
    if (!popup) return;
    popup.classList.remove('show');
    document.body.style.overflow = '';
}

const contactBtn = document.getElementById('contactBtn');
if (contactBtn) contactBtn.addEventListener('click', openContactPopup);

const contactPopup = document.getElementById('contactPopup');
if (contactPopup) {
    contactPopup.addEventListener('click', function(e) {
        if (e.target === this) closeContactPopup();
    });
}

// Auto Detect Default Batch
function detectDefaultBatch() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (currentYear === 2025) {
        return currentMonth < 12 ? 'ol' : '2025';
    } else if (currentYear === 2026) {
        return '2026';
    } else {
        return '2027';
    }
}

// Quotes
const quotes = {
  "01": "ජීවිතය එය මත රඳා පවතිනවාක් මෙන් ඔබේ සිහින හඹා යන්න ✨",
  "02": "සාර්ථකත්වය කව්රුත් ලබා දෙන්නේ නැත, එබැවින් එය උපයා ගැනීමට උත්සාහ කරන්න! 🌟",
  "03": "ඔබට හැකි බව විශ්වාස කරන්න 🌟",
  "04": "ගමන දුෂ්කර විය හැක, නමුත් ඉහළින් ඇති දසුන සුන්දර වනු ඇත 🏔",
  "05": "ඔබ තුළ තියෙන දේ විශ්වාස කරන්න 💫",
  "06": "ඔබ දන්නා ප්‍රමාණයට වඩා ඔබට හැකියාව ඇත 🍀⭐️",
  "07": "අභියෝග ජීවිතය රසවත් කරයි. ඒවා ජය ගැනීම ජීවිතය අර්ථවත් කරයි 🔥💫",
  "08": "සෑම දිනකම ඔබට දියුණු වීමට අවස්ථාව. උපරිම ප්‍රයෝජන ගන්න 😎💪",
  "09": "සෑම දුෂ්කරතාවක්ම මැද අවස්ථාවක් තිබේ 🤛",
  "10": "ජයග්‍රහණයේ උද්යෝගයට වඩා පරාජයේ බිය වැඩි වීමට ඉඩ නොදෙන්න 🫵",
  "11": "අගෝස්තු 2026 ඔබේ ජයග්‍රහණයේ මාසයයි! සූදානම් වන්න 🎯",
  "12": "A/L 2026 සිසුවෙකු ලෙස ඔබ අද ඉතිහාසයක් රචනා කරනවා 📚",
  "13": "කාලය සීමිතයි, නමුත් ඔබේ හැකියාව අසීමිතයි 🚀",
  "14": "පිටු අධ්‍යයනය නොවෙයි, අර්ථය අවබෝධ කර ගැනීම වැදගත් 🧠",
  "15": "සෑම විභාගයකම ඔබේ අනාගතයේ දොරක් විවෘත වේ 🚪✨"
};

const quotes2026 = {
  "01": "අනාගතය ඔබට අයත්! මේ මොහොතේ සිට පටන් ගන්න ✨",
  "02": "2026 A/L ජයග්‍රහණය සඳහා ඔබේ ගමන ආරම්භ කරන්න! 🎯",
  "03": "සාර්ථකත්වයට කාලය තිබේ, නමුත් කුසලතාව අවශ්‍යයි 🌟",
  "04": "ඔබේ ඉලක්කය 2026, නමුත් සූදානම අදම ආරම්භ කරන්න 🚀",
  "05": "මීට වර්ෂයකට වඩා කාලයක් තිබේ, නමුත් සෑම දිනම වැදගත් 💫",
  "06": "2026 batch එකේ champion කෙනෙක් වන්න! 🏆",
  "07": "වැඩි කාලයක් = වැඩි හැකියාවන්. නිසියාකාරව භාවිතා කරන්න 📚",
  "08": "ඔබේ අනාගතය ඔබේ අතේ. 2026 ජයග්‍රහණය කරන්න! 🔥",
  "09": "සෑම දිනකම අද වඳා හොඳ කෙනෙක් වන්න. 2026 සඳහා සූදානම් වන්න ⭐",
  "10": "කාලය ඔබේ මිත්‍රයා. එය නිසියාකාරව පරිහරණය කරන්න 💪",
  "11": "2026 අගෝස්තු මාසය ඔබේ ජයග්‍රහණයේ මාසයයි! 🎯",
  "12": "අද ආරම්භ කරන අධ්‍යයනය හෙට විශ්වවිද්‍යාලයේ අවස්ථාව බවට පත්වේ 🎓",
  "13": "කාලය ඔබේ පාර්ශ්වයේ ඇත. හොඳින් සැලසුම් කරන්න 📋",
  "14": "ප්‍රබල මූලික පදනමක් තනා ගන්න. A/L සඳහා ඒක වැදගත් 🏗️",
  "15": "සෑම විභාගයටම සූදානම් වන්න, නමුත් 2026 A/L ප්‍රමුඛත්වය දෙන්න 🥇"
};

const quotes2027 = {
  "01": "ප්‍රථම පියවර තමයි වඩාම වැදගත්! ආරම්භ කරන්න 🎯",
  "02": "2027 A/L සඳහා දිගු ගමනක් ආරම්භ කරන්න. සෑම පියවරකම වැදගත් ✨",
  "03": "අවුරුදු දෙකක් කාලයක් ඇත - මෙය ඔබේ හොඳම වාසියයි! 🌟",
  "04": "මුල සිටම සැලසුම් කරන්න. 2027 ජයග්‍රහණය අද ආරම්භ වේ! 📋",
  "05": "කාලය ඔබේ පාර්ශ්වයේ ඇත. එය සාර්ථකව භාවිතා කරන්න ⏰",
  "06": "සෑම දිනකම ඉදිරියට පියවරක්. 2027 ඔබේ වර්ෂයයි! 🚀",
  "07": "දිගු ගමන අඩු වේගයෙන් ගත යුතුයි. ස්ථායී වන්න 🐢",
  "08": "අනාගත ජයග්‍රාහකයා අදම ආරම්භ කරයි 🏆",
  "09": "වර්ෂ දෙකක කාලය = අනන්ත හැකියාවන්. ඒවා පරිහරණය කරන්න 💎",
  "10": "2027 A/L batch ප්‍රමුඛයා වන්න! ඔබට පුළුවන් 👑",
  "11": "කාලය ප්‍රමාණවත්, නමුත් සැලසුම් අත්‍යවශ්‍යයි 📅",
  "12": "මුල සිට හොඳ පුරුදු ගොඩ නගන්න. ඒක 2027 දක්වා උදව් කරයි 🌱",
  "13": "දිනයන්ට කල් දාන්න එපා ⚠️",
  "14": "සෑම දිනකම අලුත් දෙයක් ඉගෙන ගන්න. 📚",
  "15": "2027 අගෝස්තු වන විටට ඔබ සම්පූර්ණයෙන් සූදානම් වී සිටිය යුතුයි 🎯"
};

const quotesOL = {
  "01": "O/L තමයි ඔබේ අනාගතේ පදනම! දැන්ම ආරම්භ කරන්න 📚",
  "02": "හොඳ මූලික පදනමක් A/L සඳහා වැදගත්. O/L වලින් ජයගන්න! 🎯",
  "03": "සාමාන්‍ය පෙර විභාගය - ඔබේ සාර්ථකත්වයේ ප්‍රථම පියවර ✨",
  "04": "O/L ප්‍රතිඵල හොඳ නම්, A/L වලට සූදානම් වීම පහසු වේ 🌟",
  "05": "සෑම විෂයකටම සමාන අවධානයක් දෙන්න. O/L වල සියල්ල වැදගත් 📖",
  "06": "2025 O/L batch ප්‍රමුඛයා වන්න! ඔබේ කාලයයි 🏆",
  "07": "ප්‍රථම වරට සම්මත වෙන්න. නැවත සඳුදා තරගයක් නෙවෙයි 💪",
  "08": "O/L සාර්ථකත්වය A/L සාර්ථකත්වයට මග පාදයි 🚀",
  "09": "පළමු විශාල ජයග්‍රහණය O/L වලින් ආරම්භ වේ 🎊",
  "10": "හොඳ ප්‍රතිලයක් ලබා ගෙන ඔබේ පවුලේ ගෞරවය වර්ධනය කරන්න 💎",
  "11": "O/L සම්මත වීම අනිවාර්යයි, A/L යාම අභිලාෂයයි 🎓",
  "12": "9 විෂයටම සමානව අවධානය දෙන්න. සියල්ල වැදගත් ⚖️",
  "13": "2025 දෙසැම්බර් මාසය ඔබේ පළමු විශාල ජයග්‍රහණයේ මාසයයි 🎯",
  "14": "grade 6-9 දක්වා ඉගෙන ගත් සියල්ල O/L වලට අදාළයි 📝",
  "15": "පරීක්ෂණ ප්‍රශ්න වලට වැඩිපුර කාලය වෙන් කරන්න 🔬"
};

// Batch Switch UI
function switchBatch(batch) {
    currentBatch = batch;
    document.querySelectorAll('.batch-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`[data-batch="${batch}"]`);
    if (btn) btn.classList.add('active');

    ['2025','2026','2027','ol'].forEach(b => {
        const section = document.getElementById(`section${b === 'ol' ? 'OL' : b}`);
        if (section) section.classList.toggle('hidden', b !== batch);
    });

    const subjectCard = document.getElementById('subjectSelectionCard');
    if (subjectCard) {
        subjectCard.classList.toggle('hidden', batch === 'ol');
    }

    const mainLogo = document.getElementById('mainLogo');
    if (mainLogo) {
        mainLogo.className = 'logo';
        if (batch === '2026') mainLogo.classList.add('logo-2026');
        if (batch === '2027') {
            mainLogo.classList.add('logo-2027');
            showAlert('🎓', '2027 A/L Batch', '2027 exam dates have not been gazetted yet. We will update when released.');
        }
        if (batch === 'ol') mainLogo.classList.add('logo-ol');
    }

    showBatchToast(batch);
    updateCountdown();
    getDailyQuote();
}

// Show batch toast notification
function showBatchToast(batch) {
    const toast = document.getElementById('batchToast');
    const icon = document.getElementById('batchToastIcon');
    const title = document.getElementById('batchToastTitle');
    const current = document.getElementById('batchToastCurrent');
    const date = document.getElementById('batchToastDate');
    const days = document.getElementById('batchToastDays');

    if (!toast) return;

    icon.className = 'batch-toast-icon';
    if (batch === '2026') {
        icon.classList.add('batch-toast-icon-2026');
        title.textContent = '2026 A/L Batch';
        current.textContent = '2026 A/L';
        date.textContent = 'August 2026';
    } else if (batch === '2027') {
        icon.classList.add('batch-toast-icon-2027');
        title.textContent = '2027 A/L Batch';
        current.textContent = '2027 A/L';
        date.textContent = 'August 2027';
    } else if (batch === 'ol') {
        icon.classList.add('batch-toast-icon-ol');
        title.textContent = '2025 O/L Batch';
        current.textContent = '2025 O/L';
        date.textContent = 'December 2025';
    } else {
        title.textContent = '2025 A/L Batch';
        current.textContent = '2025 A/L';
        date.textContent = 'November 2025';
    }

    const now = new Date();
    const targetDate = CONFIG.EXAM_DATES[batch];
    const diff = targetDate - now;
    const daysRemaining = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    days.textContent = `${daysRemaining} days`;

    toast.classList.add('show');
    setTimeout(() => closeBatchToast(), 4000);
}

function closeBatchToast() {
    const toast = document.getElementById('batchToast');
    if (toast) toast.classList.remove('show');
}

document.querySelectorAll('.batch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!btn.classList.contains('disabled')) switchBatch(btn.dataset.batch);
    });
});

// Daily Quote
function getDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    let quoteSet = quotes;
    let batchSuffix = '2025';
    switch (currentBatch) {
        case '2025': quoteSet = quotes; batchSuffix = '2025'; break;
        case '2026': quoteSet = quotes2026; batchSuffix = '2026'; break;
        case '2027': quoteSet = quotes2026; batchSuffix = '2027'; break;
        case 'ol':   quoteSet = quotes; batchSuffix = 'OL';   break;
    }
    const quoteKeys = Object.keys(quoteSet);
    const quoteIndex = (dayOfYear - 1) % quoteKeys.length;
    const quoteKey = quoteKeys[quoteIndex];
    const quoteElement = document.getElementById(`dailyQuote${batchSuffix}`);
    const quoteNumberElement = document.getElementById(`quoteNumber${batchSuffix}`);
    if (quoteElement) quoteElement.textContent = quoteSet[quoteKey];
    if (quoteNumberElement) {
        const examType = currentBatch === 'ol' ? 'O/L' : 'A/L';
        const year = currentBatch === 'ol' ? '2025' : currentBatch;
        quoteNumberElement.textContent = `Quote #${quoteKey} • ${examType} ${year} • ${today.toLocaleDateString()}`;
    }
}

// Tile animation
function addTileAnimation(tileId) {
    const tile = document.getElementById(tileId);
    if (!tile) return;
    tile.classList.add('tile-animate');
    setTimeout(() => tile.classList.remove('tile-animate'), 2000);
}

// Countdown
function updateCountdown() {
    const now = new Date();
    
    Object.keys(CONFIG.EXAM_DATES).forEach(batch => {
        const year = batch === 'ol' ? 'OL' : batch;
        const target = CONFIG.EXAM_DATES[batch];
        const studyStart = CONFIG.STUDY_STARTS[batch];
        
        let diff = target - now;
        if (diff < 0) diff = 0;
        const secs = Math.floor(diff / 1000) % 60;
        const mins = Math.floor(diff / (1000 * 60)) % 60;
        const hrs  = Math.floor(diff / (1000 * 60 * 60)) % 24;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        const newValues = {
            [`days${year}`]: String(days).padStart(2,'0'),
            [`hours${year}`]: String(hrs).padStart(2,'0'),
            [`minutes${year}`]: String(mins).padStart(2,'0'),
            [`seconds${year}`]: String(secs).padStart(2,'0')
        };
        
        Object.keys(newValues).forEach(key => {
            const element = document.getElementById(key);
            if (element && element.textContent !== newValues[key]) {
                element.textContent = newValues[key];
                const tileId = key.replace(key.slice(-4), `Tile${year}`);
                addTileAnimation(tileId);
            }
        });
        
        const daysPassedElem = document.getElementById(`daysPassed${year}`);
        if (daysPassedElem) {
            const daysPassed = Math.floor((now - studyStart) / (1000 * 60 * 60 * 24));
            daysPassedElem.textContent = Math.max(0, daysPassed);
        }
    });
}

// Current Time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const el = document.getElementById('currentTime');
    if (el) el.textContent = timeString;
}

// Subject Selection for A/L
document.addEventListener('change', function(e) {
    if (e.target && e.target.matches('input[type="checkbox"].subject-checkbox')) {
        updateSelectedCount();
    }
});

function updateSelectedCount() {
    const selected = document.querySelectorAll('input[type="checkbox"].subject-checkbox:checked');
    const count = selected.length;
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = `${count} subjects selected`;
    const showBtn = document.getElementById('showExamDatesBtn');
    if (showBtn) {
        if (count >= 3) showBtn.classList.remove('disabled'); else showBtn.classList.add('disabled');
    }
}

function clearSelection() {
    document.querySelectorAll('input[type="checkbox"].subject-checkbox').forEach(cb => cb.checked = false);
    updateSelectedCount();
}

// Subject Selection for O/L
function updateSelectedCountOL() {
    const selected = document.querySelectorAll('#sectionOL input[type="checkbox"]:checked');
    const count = selected.length;
    const el = document.getElementById('selectedCountOL');
    if (el) el.textContent = `${count} subjects selected`;
    const showBtn = document.getElementById('showExamDatesBtnOL');
    if (showBtn) {
        if (count >= 1) showBtn.classList.remove('disabled'); else showBtn.classList.add('disabled');
    }
}

function clearSelectionOL() {
    document.querySelectorAll('#sectionOL input[type="checkbox"]').forEach(cb => cb.checked = false);
    updateSelectedCountOL();
}

function showMyExamDatesOL() {
    showAlert('📅', 'O/L Exam Schedule', 'Your personal O/L exam schedule will be displayed here!');
}

// Add event listeners for O/L checkboxes
document.addEventListener('change', function(e) {
    if (e.target && e.target.matches('#sectionOL input[type="checkbox"]')) {
        updateSelectedCountOL();
    }
});

// Show/Copy/Download placeholders
function showMyExamDates() {
    showAlert('📅', 'A/L Schedule', 'Official A/L schedule has not been released yet.');
}

function copyMySchedule() {
    showAlert('📅', 'No Schedule', 'A/L schedule has not been released yet.');
}

async function downloadScheduleImage() {
    showAlert('📷', 'No Schedule', 'A/L schedule has not been released yet.');
}

// Popup close handlers
function closeExamDatesPopup() {
    const popup = document.getElementById('examDatesPopup');
    if (!popup) popup.classList.remove('show');
}

document.addEventListener('click', function(e) {
    if (e.target.classList && e.target.classList.contains('popup-overlay')) {
        closeExamDatesPopup();
        closeContactPopup();
    }
    if (e.target.classList && e.target.classList.contains('alert-overlay')) {
        closeAlert();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeExamDatesPopup();
        closeAlert();
        closeContactPopup();
    }
});

// WhatsApp integration
function openWhatsApp(number, message) {
    const webLink = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(webLink, '_blank');
}

// Enable WhatsApp Button
function enableWhatsAppButton() {
    const waBtn = document.getElementById('waChat');
    if (waBtn) {
        waBtn.classList.remove('disabled');
        const btnText = waBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = '💬 Connect with WhatsApp Bot';
        }
        waBtn.style.opacity = '1';
        waBtn.style.cursor = 'pointer';
        
        waBtn.addEventListener('click', function() {
            const message = `Hi 👋\nWelcome to A/L Exam Countdown Bot!\nPlease click the "activate" button.`;
            openWhatsApp(CONFIG.WHATSAPP.BOT, message);
        });
    }
}

function openComplaintWhatsApp() {
    const message = `📝 Subject/Time Complaint Report 📝\n🎯 A/L 2026 Exam Timetable Complaint\n\nPlease state your complaint:\n❗ Missing Subject\n⏰ Wrong Time\n📅 Wrong Date\n🔄 Other Issues\n\n- Team Sadeepa & Shamika`;
    openWhatsApp(CONFIG.WHATSAPP.COMPLAINT, message);
}

// Admin user identification and display name
function isAdmin(user) {
    return user === 'sadeepa@12';
}

function getDisplayName(user) {
    if (user === 'sadeepa@12') {
        return 'sadeepa';
    }
    return user;
}

// User Name Management
function getUserName() {
    let userName = localStorage.getItem('exam_countdown_username');
    
    if (!userName) {
        showUserInputSection();
        return '';
    }
    
    currentUser = userName;
    showCommentForm();
    return userName;
}

function showUserInputSection() {
    const userInputSection = document.getElementById('userNameSection');
    const commentForm = document.getElementById('commentForm');
    if (userInputSection) userInputSection.style.display = 'block';
    if (commentForm) commentForm.style.display = 'none';
}

function showCommentForm() {
    const userInputSection = document.getElementById('userNameSection');
    const commentForm = document.getElementById('commentForm');
    if (userInputSection) userInputSection.style.display = 'none';
    if (commentForm) commentForm.style.display = 'block';
}

function saveUserName() {
    const input = document.getElementById('userNameInput');
    if (!input) return;
    
    const name = input.value.trim();
    if (!name) {
        showAlert('⚠️', 'Invalid Input', 'Please enter a name');
        return;
    }
    
    currentUser = name;
    localStorage.setItem('exam_countdown_username', name);
    showCommentForm();
    const displayName = getDisplayName(name);
    showNotification('👋', `Welcome ${displayName}!`);
}

function changeUserName() {
    const newName = prompt('Enter new name:', currentUser);
    if (newName && newName.trim() !== '') {
        const trimmedName = newName.trim();
        localStorage.setItem('exam_countdown_username', trimmedName);
        currentUser = trimmedName;
        const displayName = getDisplayName(trimmedName);
        showNotification('✅', `Name changed to: ${displayName}`);
    }
}

// Enhanced Backend Functions with Edit/Delete Support
async function updateBackendWithComment(newComment) {
    try {
        console.log('🔄 Updating backend with new comment...');
        
        const getResponse = await fetch(BACKEND_GET_URL, {
            headers: {
                'X-Master-Key': CONFIG.BACKEND.API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!getResponse.ok) {
            throw new Error(`Failed to fetch: ${getResponse.status}`);
        }
        
        const existingData = await getResponse.json();
        let currentComments = existingData.comments || [];
        
        currentComments.unshift(newComment);
        
        if (currentComments.length > 1000) {
            currentComments = currentComments.slice(0, 500);
        }
        
        const updateResponse = await fetch(BACKEND_PUT_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.BACKEND.API_KEY,
                'X-Bin-Versioning': false
            },
            body: JSON.stringify({
                ...existingData,
                comments: currentComments,
                lastUpdated: new Date().toISOString(),
                totalComments: currentComments.length
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error(`Failed to update: ${updateResponse.status}`);
        }
        
        console.log('✅ Backend updated successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Backend update error:', error);
        return false;
    }
}

async function loadCommentsFromBackend() {
    try {
        console.log('🔄 Loading comments from backend...');
        
        const response = await fetch(BACKEND_GET_URL + '?t=' + Date.now(), {
            headers: {
                'X-Master-Key': CONFIG.BACKEND.API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        comments = data.comments || [];
        
        localStorage.setItem('exam_countdown_comments', JSON.stringify(comments));
        
        renderComments();
        updateCommentsCount();
        console.log(`✅ Loaded ${comments.length} comments from backend`);
        return true;
        
    } catch (error) {
        console.error('❌ Error loading comments:', error);
        
        const stored = localStorage.getItem('exam_countdown_comments');
        if (stored) {
            try {
                comments = JSON.parse(stored);
            } catch (e) {
                comments = [];
            }
        } else {
            comments = [];
        }
        
        renderComments();
        updateCommentsCount();
        return false;
    }
}

// Enhanced Comment System with Edit, Delete & Admin Reply
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="empty-comments">No comments yet. Be the first to comment!</div>';
        return;
    }

    commentsList.innerHTML = comments.map(comment => {
        const isAuthor = comment.author === currentUser;
        const isAdminUser = isAdmin(currentUser);
        const isEdited = comment.lastEdited && comment.lastEdited !== comment.timestamp;
        const displayName = getDisplayName(comment.author);
        
        // Check if current user is admin for reply permissions
        const canReply = isAdminUser;
        
        return `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-header">
                <span class="comment-author">
                    ${displayName}
                    ${isAdmin(comment.author) ? '<span class="admin-badge">👑 ADMIN</span>' : ''}
                </span>
                <span class="comment-time">
                    ${formatTime(comment.timestamp)}
                    ${isEdited ? ' (edited)' : ''}
                </span>
            </div>
            <div class="comment-content">${comment.content}</div>
            
            <!-- Display replies if any -->
            ${comment.replies && comment.replies.length > 0 ? `
                <div class="comment-replies">
                    <div class="replies-header">
                        <i class="fas fa-reply"></i>
                        <span>Replies</span>
                    </div>
                    ${comment.replies.map(reply => {
                        const replyDisplayName = getDisplayName(reply.author);
                        return `
                        <div class="comment-reply">
                            <div class="reply-header">
                                <span class="reply-author">
                                    ${replyDisplayName}
                                    ${isAdmin(reply.author) ? '<span class="admin-badge">👑 ADMIN</span>' : ''}
                                </span>
                                <span class="reply-time">${formatTime(reply.timestamp)}</span>
                            </div>
                            <div class="reply-content">${reply.content}</div>
                        </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}
            
            <div class="comment-footer">
                <button class="comment-action ${likedComments.has(comment.id) ? 'liked' : ''}" onclick="toggleLike(${comment.id})">
                    <i class="fas fa-heart"></i>
                    <span>${comment.likes}</span>
                </button>
                
                <!-- Reply button - only for admin -->
                ${canReply ? `
                    <button class="comment-action reply-btn" onclick="startReply(${comment.id}, '${displayName}')">
                        <i class="fas fa-reply"></i>
                        <span>Reply</span>
                    </button>
                ` : ''}
                
                ${(isAuthor || isAdminUser) ? `
                    <button class="comment-action edit-btn" onclick="startEdit(${comment.id})">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button class="comment-action delete-btn" onclick="deleteComment(${comment.id})">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
}

function updateCommentsCount() {
    const countElement = document.getElementById('commentsCount');
    if (countElement) {
        countElement.textContent = `${comments.length} Comments`;
    }
}

function toggleLike(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (likedComments.has(commentId)) {
        comment.likes--;
        likedComments.delete(commentId);
    } else {
        comment.likes++;
        likedComments.add(commentId);
    }

    renderComments();
    localStorage.setItem('exam_countdown_comments', JSON.stringify(comments));
}

// Start replying to a comment (admin only)
function startReply(commentId, authorName) {
    if (!isAdmin(currentUser)) {
        showNotification('⚠️', 'You are not authorized to reply');
        return;
    }
    
    replyingTo = commentId;
    const commentInput = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmit');
    
    if (commentInput && submitBtn) {
        commentInput.placeholder = `Replying to ${authorName}...`;
        commentInput.focus();
        commentInput.classList.add('comment-input-reply-mode');
        submitBtn.textContent = 'Post Reply';
        submitBtn.classList.add('submit-btn-reply-mode');
    }
    showNotification('↩️', `Replying to ${authorName}`);
}

// Start editing a comment
function startEdit(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    editingComment = commentId;
    const commentInput = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmit');
    
    if (commentInput && submitBtn) {
        commentInput.value = comment.content;
        commentInput.focus();
        submitBtn.textContent = 'Update';
        submitBtn.style.background = 'var(--warning)';
    }
    
    showNotification('✏️', 'Editing your comment...');
}

// Cancel edit mode
function cancelEdit() {
    editingComment = null;
    const commentInput = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmit');
    
    if (commentInput && submitBtn) {
        commentInput.value = '';
        commentInput.placeholder = 'Write your thoughts about this website here...';
        submitBtn.textContent = 'Submit Comment';
        submitBtn.style.background = '';
    }
    
    showNotification('❌', 'Edit cancelled');
}

// Cancel reply
function cancelReply() {
    replyingTo = null;
    const commentInput = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmit');
    
    if (commentInput && submitBtn) {
        commentInput.placeholder = 'Write your thoughts about this website here...';
        commentInput.value = '';
        commentInput.classList.remove('comment-input-reply-mode');
        submitBtn.textContent = 'Submit Comment';
        submitBtn.classList.remove('submit-btn-reply-mode');
    }
}

// Delete a comment
async function deleteComment(commentId) {
    if (!confirm('Are you sure? Delete this comment?')) {
        return;
    }

    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;

    // Remove from local array
    comments.splice(commentIndex, 1);
    
    // Update local storage
    localStorage.setItem('exam_countdown_comments', JSON.stringify(comments));
    
    // Update display
    renderComments();
    updateCommentsCount();
    
    // Update backend
    const backendSuccess = await updateBackendAfterDelete();
    
    if (backendSuccess) {
        showNotification('✅', 'Comment deleted successfully!');
    } else {
        showNotification('⚠️', 'Comment deleted locally (Backend issue)');
    }
}

// Update backend after delete
async function updateBackendAfterDelete() {
    try {
        const getResponse = await fetch(BACKEND_GET_URL, {
            headers: {
                'X-Master-Key': CONFIG.BACKEND.API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!getResponse.ok) return false;
        
        const existingData = await getResponse.json();
        
        const updateResponse = await fetch(BACKEND_PUT_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.BACKEND.API_KEY
            },
            body: JSON.stringify({
                ...existingData,
                comments: comments,
                lastUpdated: new Date().toISOString(),
                totalComments: comments.length
            })
        });
        
        return updateResponse.ok;
        
    } catch (error) {
        console.error('Backend delete update error:', error);
        return false;
    }
}

// Enhanced submit function with edit and reply support
async function submitComment() {
    const input = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmit');

    if (!input || !submitBtn) return;

    const content = input.value.trim();
    if (!content) {
        showAlert('⚠️', 'Empty Comment', 'Please write a comment!');
        return;
    }

    if (content.length > 500) {
        showAlert('⚠️', 'Comment Too Long', 'Comment must be less than 500 characters!');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';

    try {
        if (editingComment) {
            // Edit existing comment
            await editExistingComment(editingComment, content);
        } else if (replyingTo && isAdmin(currentUser)) {
            // Admin reply to comment
            await submitAdminReply(replyingTo, content);
        } else {
            // New comment
            await submitNewComment(content);
        }
        
        input.value = '';
        updateCharCount();
        cancelEdit();
        cancelReply();
        
    } catch (error) {
        console.error('Submit comment error:', error);
        showNotification('❌', 'Error submitting comment');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Comment';
        submitBtn.style.background = '';
        submitBtn.classList.remove('submit-btn-reply-mode');
    }
}

// Edit existing comment
async function editExistingComment(commentId, newContent) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // Update comment
    comment.content = newContent;
    comment.lastEdited = new Date().toISOString();
    
    // Update local storage
    localStorage.setItem('exam_countdown_comments', JSON.stringify(comments));
    
    // Update display
    renderComments();
    
    // Update backend
    const backendSuccess = await updateBackendAfterEdit();
    
    if (backendSuccess) {
        showNotification('✅', 'Comment updated successfully!');
    } else {
        showNotification('⚠️', 'Comment updated locally (Backend issue)');
    }
}

// Submit admin reply
async function submitAdminReply(commentId, content) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const reply = {
        id: Date.now(),
        author: currentUser,
        content: content,
        timestamp: new Date().toISOString(),
        isAdminReply: true
    };

    // Initialize replies array if it doesn't exist
    if (!comment.replies) {
        comment.replies = [];
    }

    // Add reply
    comment.replies.push(reply);
    
    // Update local storage
    localStorage.setItem('exam_countdown_comments', JSON.stringify(comments));
    
    // Update display
    renderComments();
    
    // Update backend
    const backendSuccess = await updateBackendAfterReply();
    
    if (backendSuccess) {
        showNotification('✅', 'Reply posted successfully! 🎉');
    } else {
        showNotification('⚠️', 'Reply saved locally (Backend issue)');
    }
}

// Update backend after edit
async function updateBackendAfterEdit() {
    try {
        const getResponse = await fetch(BACKEND_GET_URL, {
            headers: {
                'X-Master-Key': CONFIG.BACKEND.API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!getResponse.ok) return false;
        
        const existingData = await getResponse.json();
        
        const updateResponse = await fetch(BACKEND_PUT_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.BACKEND.API_KEY
            },
            body: JSON.stringify({
                ...existingData,
                comments: comments,
                lastUpdated: new Date().toISOString()
            })
        });
        
        return updateResponse.ok;
        
    } catch (error) {
        console.error('Backend edit update error:', error);
        return false;
    }
}

// Update backend after reply
async function updateBackendAfterReply() {
    try {
        const getResponse = await fetch(BACKEND_GET_URL, {
            headers: {
                'X-Master-Key': CONFIG.BACKEND.API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!getResponse.ok) return false;
        
        const existingData = await getResponse.json();
        
        const updateResponse = await fetch(BACKEND_PUT_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.BACKEND.API_KEY
            },
            body: JSON.stringify({
                ...existingData,
                comments: comments,
                lastUpdated: new Date().toISOString()
            })
        });
        
        return updateResponse.ok;
        
    } catch (error) {
        console.error('Backend reply update error:', error);
        return false;
    }
}

// Submit new comment
async function submitNewComment(content) {
    const newComment = {
        id: Date.now(),
        author: currentUser,
        content: content,
        timestamp: new Date().toISOString(),
        likes: 0
    };

    comments.unshift(newComment);
    localStorage.setItem('exam_countdown_comments', JSON.stringify(comments));
    
    renderComments();
    updateCommentsCount();
    
    const backendSuccess = await updateBackendWithComment(newComment);
    
    if (backendSuccess) {
        showNotification('✅', 'Comment submitted successfully! 🎉');
    } else {
        showNotification('⚠️', 'Comment saved locally (Backend issue)');
    }
}

function updateCharCount() {
    const input = document.getElementById('commentInput');
    const charCount = document.getElementById('charCount');

    if (!input || !charCount) return;

    const count = input.value.length;
    charCount.textContent = count;

    if (count > 450) {
        charCount.style.color = 'var(--error)';
    } else if (count > 400) {
        charCount.style.color = 'var(--warning)';
    } else {
        charCount.style.color = 'var(--text-secondary)';
    }
}

function scrollToComments() {
    const commentsSection = document.querySelector('.comments-section');
    if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Character count listener
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'commentInput') {
        updateCharCount();
    }
});

// Contact form
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
        if (statusMessage) statusMessage.classList.remove('show','success','error');
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {'Content-Type':'application/json','Accept':'application/json'},
                body: json
            });
            const result = await response.json();
            if (result.success) {
                if (statusMessage) { statusMessage.textContent = '✓ Message sent successfully!'; statusMessage.classList.add('success','show'); }
                form.reset();
            } else {
                if (statusMessage) { statusMessage.textContent = '✗ Something went wrong. Please try again.'; statusMessage.classList.add('error','show'); }
            }
        } catch (error) {
            if (statusMessage) { statusMessage.textContent = '✗ Network error. Please check your connection.'; statusMessage.classList.add('error','show'); }
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
            setTimeout(() => { if (statusMessage) statusMessage.classList.remove('show'); }, 5000);
        }
    });
}

// Notification close handler
const notificationClose = document.getElementById('notificationClose');
if (notificationClose) {
    notificationClose.addEventListener('click', () => {
        const notificationToast = document.getElementById('notificationToast');
        if (notificationToast) notificationToast.classList.remove('show');
    });
}

// Scroll to top button
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load Comments Function
async function loadComments() {
    try {
        const storedComments = localStorage.getItem('exam_countdown_comments');
        if (storedComments) {
            comments = JSON.parse(storedComments);
            renderComments();
            updateCommentsCount();
        }
        
        setTimeout(async () => {
            try {
                await loadCommentsFromBackend();
            } catch (error) {
                console.error('Background sync failed:', error);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Load comments error:', error);
    }
}

// Auto-refresh comments
function startCommentRefresh() {
    setInterval(async () => {
        try {
            await loadCommentsFromBackend();
        } catch (error) {
            console.error('Auto-refresh failed:', error);
        }
    }, 30000);
}

// Backend Connection Test
async function testBackendConnection() {
    try {
        console.log('🧪 Testing backend connection...');
        
        const response = await fetch(BACKEND_GET_URL, {
            headers: {
                'X-Master-Key': CONFIG.BACKEND.API_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connection successful!', data);
            showNotification('✅', 'Backend connection successful!');
            return true;
        } else {
            console.log('❌ Backend connection failed:', response.status);
            showNotification('⚠️', 'Backend connection failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Backend test error:', error);
        showNotification('❌', 'Backend connection error');
        return false;
    }
}

// Initialize App
async function initializeApp() {
    currentUser = getUserName();
    const defaultBatch = detectDefaultBatch();
    switchBatch(defaultBatch);
    
    await testBackendConnection();
    
    loadComments();
    startCommentRefresh();
    
    getDailyQuote();
    updateCountdown();
    updateCurrentTime();
    
    enableWhatsAppButton();
    
    console.log('🚀 App initialized with UPDATED JSONBIN BACKEND!');
    console.log('Bin ID:', CONFIG.BACKEND.BIN_ID);
    console.log('Using API Key:', CONFIG.BACKEND.API_KEY);
}

// Start timers
setInterval(updateCountdown, 1000);
setInterval(updateCurrentTime, 1000);
setInterval(getDailyQuote, 3600000);

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('🚀 A/L & O/L Exam Countdown - ENHANCED WITH EDIT/DELETE & ADMIN REPLY');
