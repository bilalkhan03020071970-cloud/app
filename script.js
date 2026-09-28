/**
 * script.js — UI Logic & Real FFmpeg Processor Integration
 * Connects all UI controls to the VideoProcessor (FFmpeg.wasm) engine.
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   GLOBAL STATE
═══════════════════════════════════════════════════════ */
let selectedFile        = null;
let processedBlob       = null;
let selectedFormat      = 'mp4';
let processingStartTime = null;

let USER_LOGGED_IN   = false;
let USER_HAS_PLAN    = false;
let CURRENT_PHONE    = '';
let isLoginMode      = false;
let paymentTimerInt  = null;

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initDropZone();
    initOptionsPanel();
    initProcessButton();
    initFaq();
    initModals();
    restoreSession();

    // Show YouTube trial popup once per session
    if (!sessionStorage.getItem('yt_shown')) {
        setTimeout(() => { openYoutubeTrial(); sessionStorage.setItem('yt_shown', '1'); }, 1800);
    }

    // Wire up processor callbacks
    videoProcessor.onProgress = (pct) => updateProgress(pct);
    videoProcessor.onLog      = (msg) => appendLog(msg);
    videoProcessor.onStatus   = (msg) => setStatus(msg);
});

/* ═══════════════════════════════════════════════════════
   1. NAVIGATION
═══════════════════════════════════════════════════════ */
function initNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('modal-open');
    });

    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    });
}

/* ═══════════════════════════════════════════════════════
   2. FILE DROP ZONE
═══════════════════════════════════════════════════════ */
function initDropZone() {
    const dropArea  = document.getElementById('dropArea');
    const fileInput = document.getElementById('videoFileInput');
    if (!dropArea || !fileInput) return;

    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) pickFile(fileInput.files[0]);
    });

    ['dragenter', 'dragover'].forEach(ev => {
        dropArea.addEventListener(ev, e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
    });
    ['dragleave', 'drop'].forEach(ev => {
        dropArea.addEventListener(ev, e => { e.preventDefault(); dropArea.classList.remove('drag-over'); });
    });
    dropArea.addEventListener('drop', e => {
        if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
    });

    // Clear button
    document.getElementById('clearFileBtn')?.addEventListener('click', clearFile);
}

function pickFile(file) {
    if (!file.type.startsWith('video/')) {
        showToast('⚠️ Please select a valid video file.'); return;
    }

    selectedFile   = file;
    processedBlob  = null;

    const sizeMB  = (file.size / 1048576).toFixed(2);
    const sizeGB  = (file.size / 1073741824).toFixed(2);
    const isLarge = file.size > 500 * 1024 * 1024; // > 500 MB
    const displaySize = isLarge ? `${sizeGB} GB` : `${sizeMB} MB`;

    document.getElementById('chipName').textContent = file.name;
    document.getElementById('chipSize').textContent = displaySize;
    document.getElementById('fileInfoRow').style.display = 'flex';

    // Show video preview
    const vid = document.getElementById('videoPreview');
    vid.src = URL.createObjectURL(file);
    vid.style.display = 'block';
    document.getElementById('emptyState').style.display  = 'none';
    document.getElementById('downloadOverlay').classList.add('hidden');
    document.getElementById('aiOverlay').classList.add('hidden');

    vid.muted = true; vid.loop = true;
    vid.play().catch(() => {});

    // Reset stats
    document.getElementById('statsPanel').classList.add('hidden');
    document.getElementById('logTerminal').style.display = 'none';

    // Reset process button
    resetProcessBtn();

    if (isLarge) {
        showToast(`🎬 Movie loaded: ${file.name} (${sizeGB} GB) — Processing may take 30–90 mins`);
        setTimeout(() => showToast('⚠️ Large movie: Keep browser tab open & active during processing!'), 2000);
    } else {
        showToast(`📹 ${file.name} (${sizeMB} MB) loaded`);
    }
}

function clearFile() {
    selectedFile = null; processedBlob = null;
    document.getElementById('videoFileInput').value = '';
    document.getElementById('fileInfoRow').style.display = 'none';

    const vid = document.getElementById('videoPreview');
    vid.pause(); vid.src = ''; vid.style.display = 'none';

    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('downloadOverlay').classList.add('hidden');
    document.getElementById('aiOverlay').classList.add('hidden');
    document.getElementById('statsPanel').classList.add('hidden');
    document.getElementById('logTerminal').style.display = 'none';
    resetProcessBtn();
}

/* ═══════════════════════════════════════════════════════
   3. OPTIONS PANEL
═══════════════════════════════════════════════════════ */
function initOptionsPanel() {
    // CRF Slider
    const slider = document.getElementById('crfSlider');
    const label  = document.getElementById('crfLabel');
    if (slider && label) {
        slider.addEventListener('input', () => {
            const v = parseInt(slider.value);
            const desc = v <= 19 ? 'Best Quality' : v <= 22 ? 'High Quality' : v <= 24 ? 'Balanced' : v <= 26 ? 'Compressed' : 'Small File';
            label.textContent = `${v} — ${desc}`;
        });
    }

    // Re-encode video checkbox → show/hide CRF slider
    document.getElementById('optReencodeVideo')?.addEventListener('change', (e) => {
        document.getElementById('crfGroup').style.opacity = e.target.checked ? '1' : '0.4';
    });

    // Format buttons
    document.querySelectorAll('.fmt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFormat = btn.dataset.fmt;
        });
    });
}

function getOptions() {
    return {
        stripMetadata : document.getElementById('optStripMeta')?.checked    ?? true,
        reencodeVideo : document.getElementById('optReencodeVideo')?.checked ?? true,
        reencodeAudio : document.getElementById('optReencodeAudio')?.checked ?? true,
        crf           : parseInt(document.getElementById('crfSlider')?.value ?? '23'),
        outputFormat  : selectedFormat,
    };
}

/* ═══════════════════════════════════════════════════════
   4. PROCESS BUTTON → REAL FFMPEG
═══════════════════════════════════════════════════════ */
function initProcessButton() {
    document.getElementById('startProcessBtn')?.addEventListener('click', startRealProcessing);
    document.getElementById('downloadTriggerBtn')?.addEventListener('click', handleDownloadRequest);
}

async function startRealProcessing() {
    if (!selectedFile) {
        showToast('🚨 Please drop or select a video first!');
        document.getElementById('dropArea').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // UI: show AI overlay
    document.getElementById('aiOverlay').classList.remove('hidden');
    document.getElementById('downloadOverlay').classList.add('hidden');
    document.getElementById('statsPanel').classList.add('hidden');
    document.getElementById('videoPreview').classList.add('video-blurred');

    const btn = document.getElementById('startProcessBtn');
    btn.disabled = true;
    btn.querySelector('#processBtnIcon').textContent = '⏳';
    btn.querySelector('#processBtnText').textContent = 'Processing...';

    // Show log terminal
    document.getElementById('logTerminal').style.display = 'block';

    processingStartTime = Date.now();
    const isLargeMovie = selectedFile.size > 500 * 1024 * 1024;

    appendLog('▶ Starting real FFmpeg processing...', 'sys');
    if (isLargeMovie) {
        const sizeGB = (selectedFile.size / 1073741824).toFixed(2);
        appendLog(`⚠️ Large movie detected: ${sizeGB} GB — Do NOT close this tab!`, 'sys');
        appendLog('⏳ Estimated time: 30–90 minutes depending on your CPU...', 'sys');
    }

    try {
        const opts = getOptions();
        appendLog(`  Options: crf=${opts.crf}, format=${opts.outputFormat}, stripMeta=${opts.stripMetadata}`, 'sys');

        const result = await videoProcessor.process(selectedFile, opts);
        processedBlob = result.blob;

        // Hide overlay, show download
        document.getElementById('aiOverlay').classList.add('hidden');
        document.getElementById('downloadOverlay').classList.remove('hidden');
        document.getElementById('videoPreview').classList.remove('video-blurred');

        // Show stats
        renderStats(result.stats);

        btn.querySelector('#processBtnIcon').textContent = '✓';
        btn.querySelector('#processBtnText').textContent = 'Processing Complete';
        btn.disabled = false;

        const elapsedSec = (Date.now() - processingStartTime) / 1000;
        const elapsedStr = elapsedSec > 60
            ? `${Math.floor(elapsedSec / 60)}m ${Math.round(elapsedSec % 60)}s`
            : `${elapsedSec.toFixed(1)}s`;
        appendLog(`✓ Done in ${elapsedStr}. Output: ${(result.blob.size / 1048576).toFixed(2)} MB`, 'info');
        showToast(`✅ Video processed in ${elapsedStr}!`);

    } catch (err) {
        document.getElementById('aiOverlay').classList.add('hidden');
        document.getElementById('videoPreview').classList.remove('video-blurred');
        setStatus('❌ Processing failed');

        btn.disabled = false;
        btn.querySelector('#processBtnIcon').textContent = '⚡';
        btn.querySelector('#processBtnText').textContent = 'Retry Processing';

        appendLog(`✗ Error: ${err.message}`, 'error');
        appendLog('💡 Tip: For very large movies (>3GB), try reducing CRF or use a different browser.', 'info');
        showToast('❌ Processing failed. Check the terminal log for details.');
        console.error('[Processing Error]', err);
    }
}

/* ═══════════════════════════════════════════════════════
   5. PROGRESS, LOG, STATUS CALLBACKS
═══════════════════════════════════════════════════════ */
function updateProgress(pct) {
    document.getElementById('progressFill').style.width = `${pct}%`;
    document.getElementById('progressPercent').textContent = `${pct}%`;
}

function setStatus(msg) {
    document.getElementById('aiStepText').textContent = msg;
    document.getElementById('aiMainStatus').textContent = 'Processing...';
}

function appendLog(msg, type = '') {
    const out = document.getElementById('logOutput');
    if (!out) return;
    const div = document.createElement('div');
    div.className = `log-line ${type}`;
    div.textContent = msg;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
}

/* ═══════════════════════════════════════════════════════
   6. STATS PANEL
═══════════════════════════════════════════════════════ */
function renderStats(stats) {
    const fmt = bytes => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576)    return (bytes / 1048576).toFixed(2) + ' MB';
        return (bytes / 1024).toFixed(1) + ' KB';
    };

    document.getElementById('statOrigSize').textContent  = fmt(stats.originalSize);
    document.getElementById('statNewSize').textContent   = fmt(stats.processedSize);
    const reduction = parseFloat(stats.reduction);
    document.getElementById('statReduction').textContent = (reduction > 0 ? '-' : '+') + Math.abs(reduction) + '%';
    document.getElementById('statTags').textContent      = stats.strippedTags.length;

    // Tag chips
    const list = document.getElementById('strippedTagsList');
    list.innerHTML = '';
    stats.strippedTags.forEach(tag => {
        const chip = document.createElement('span');
        chip.className = 'tag-chip';
        chip.textContent = tag;
        list.appendChild(chip);
    });

    document.getElementById('statsPanel').classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════
   7. DOWNLOAD GATEKEEPER
═══════════════════════════════════════════════════════ */
function handleDownloadRequest() {
    triggerDownload();
}

function triggerDownload() {
    if (!processedBlob) return;
    const filename = videoProcessor.generateFilename(selectedFile.name, selectedFormat);
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 Download started!');
}

/* ═══════════════════════════════════════════════════════
   8. AUTH MODAL
═══════════════════════════════════════════════════════ */
function openAuthModal(mode = 'register') {
    const modal = document.getElementById('authModal');
    isLoginMode = (mode === 'login');

    document.getElementById('authModalTitle').textContent = isLoginMode ? 'Login to Account' : 'Create Account';
    document.getElementById('authSubmitBtn').textContent  = isLoginMode ? 'Login & Continue' : 'Register & Continue';
    document.getElementById('authToggleBtn').textContent  = isLoginMode ? 'Need an account? Register here.' : 'Already have an account? Login here.';
    document.getElementById('confirmPassGroup').style.display = isLoginMode ? 'none' : 'block';

    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    document.body.classList.remove('modal-open');
}

function toggleAuthMode() { openAuthModal(isLoginMode ? 'register' : 'login'); }

function handleAuthSubmit(e) {
    e.preventDefault();
    const mobile      = document.getElementById('authMobile').value.trim();
    const pass        = document.getElementById('authPassword').value;
    const confirmPass = document.getElementById('authConfirmPassword').value;
    const btn         = document.getElementById('authSubmitBtn');

    if (!/^[0-9]{10}$/.test(mobile)) { showToast('🚨 Enter a valid 10-digit mobile number!'); return; }
    if (!isLoginMode && pass !== confirmPass) { showToast('🚨 Passwords do not match!'); return; }

    const origText = btn.textContent;
    btn.textContent = 'Authenticating...';
    btn.disabled = true;

    setTimeout(() => {
        USER_LOGGED_IN = true;
        CURRENT_PHONE  = mobile;
        localStorage.setItem('vcp_logged', 'true');
        localStorage.setItem('vcp_phone', mobile);

        btn.textContent = origText;
        btn.disabled = false;
        closeAuthModal();
        updateNavUser();
        showToast(`✅ Welcome, ${mobile}!`);

        if (processedBlob && USER_HAS_PLAN) triggerDownload();
        else if (processedBlob && !USER_HAS_PLAN) {
            showToast('⚡ Choose a plan to download your file.');
            document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
        }
    }, 700);
}

function restoreSession() {
    const logged = localStorage.getItem('vcp_logged');
    const phone  = localStorage.getItem('vcp_phone');
    const plan   = localStorage.getItem('vcp_plan');
    if (logged === 'true' && phone) {
        USER_LOGGED_IN = true; CURRENT_PHONE = phone;
        if (plan === 'true') USER_HAS_PLAN = true;
        updateNavUser();
    }
}

function updateNavUser() {
    const btn = document.getElementById('navLoginBtn');
    if (btn && USER_LOGGED_IN) {
        btn.textContent = `👤 ${CURRENT_PHONE.slice(0, 5)}***`;
        btn.onclick = () => {
            if (confirm('Logout?')) {
                localStorage.clear(); USER_LOGGED_IN = false; USER_HAS_PLAN = false;
                location.reload();
            }
        };
    }
}

/* ═══════════════════════════════════════════════════════
   9. PAYMENT MODAL
═══════════════════════════════════════════════════════ */
function handlePlanSelection(name, amount) {
    if (!USER_LOGGED_IN) {
        showToast('🔒 Please login first.');
        openAuthModal('login'); return;
    }
    openPaymentModal(name, amount);
}

function openPaymentModal(name, amount) {
    document.getElementById('paymentPlanName').textContent    = name;
    document.getElementById('paymentAmountDisplay').textContent = `₹${amount}`;
    document.getElementById('paymentModal').classList.add('active');
    document.body.classList.add('modal-open');
    startCountdown(300);
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.body.classList.remove('modal-open');
    if (paymentTimerInt) clearInterval(paymentTimerInt);
}

function startCountdown(sec) {
    if (paymentTimerInt) clearInterval(paymentTimerInt);
    let rem = sec;
    const el = document.getElementById('paymentTimer');
    paymentTimerInt = setInterval(() => {
        const m = Math.floor(rem / 60), s = rem % 60;
        el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if (--rem < 0) { clearInterval(paymentTimerInt); el.textContent = 'Expired'; }
    }, 1000);
}

function simulatePaymentSuccess() {
    closePaymentModal();
    USER_HAS_PLAN = true;
    localStorage.setItem('vcp_plan', 'true');
    showToast('🎉 Plan activated! You can now download your processed videos.');
    if (processedBlob) setTimeout(triggerDownload, 500);
}

/* ═══════════════════════════════════════════════════════
   10. YOUTUBE TRIAL POPUP
═══════════════════════════════════════════════════════ */
function openYoutubeTrial() {
    document.getElementById('youtubeTrialModal').classList.add('active');
    document.body.classList.add('modal-open');
}
function closeYoutubeTrial() {
    document.getElementById('youtubeTrialModal').classList.remove('active');
    document.body.classList.remove('modal-open');
}
function onYoutubeJoinClicked() {
    localStorage.setItem('yt_joined', 'true');
    closeYoutubeTrial();
    showToast('✅ Free trial unlocked! Upload a video (max 50 MB).');
}

/* ═══════════════════════════════════════════════════════
   11. FAQ ACCORDION + LIVE SEARCH
═══════════════════════════════════════════════════════ */
function initFaq() {
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const was  = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!was) item.classList.add('active');
        });
    });

    const searchInput = document.getElementById('faqSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            document.querySelectorAll('.faq-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = (!q || text.includes(q)) ? '' : 'none';
            });
            document.querySelectorAll('.faq-category-block').forEach(block => {
                const visible = [...block.querySelectorAll('.faq-item')].some(i => i.style.display !== 'none');
                block.style.display = visible ? '' : 'none';
            });
        });
    }
}

/* ═══════════════════════════════════════════════════════
   12. MODAL OUTSIDE CLICK CLOSE
═══════════════════════════════════════════════════════ */
function initModals() {
    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
            document.body.classList.remove('modal-open');
            if (paymentTimerInt) clearInterval(paymentTimerInt);
        }
    });
}

/* ═══════════════════════════════════════════════════════
   13. TOAST NOTIFICATION SYSTEM
═══════════════════════════════════════════════════════ */
function showToast(msg, duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.cssText = 'opacity:0;transform:translateX(100%);transition:all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/* ═══════════════════════════════════════════════════════
   14. HELPERS
═══════════════════════════════════════════════════════ */
function resetProcessBtn() {
    const btn = document.getElementById('startProcessBtn');
    if (btn) {
        btn.disabled = false;
        btn.querySelector('#processBtnIcon').textContent = '⚡';
        btn.querySelector('#processBtnText').textContent = 'Start Real Processing';
    }
}
