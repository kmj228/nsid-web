/* ══════════════════════════════════════════
   assets/js/contact.js
   문의 폼 · 파일 첨부 · 모달 제어
   — initContact()를 contact 탭 로드 후 호출
══════════════════════════════════════════ */

/* ── 첨부파일 상태 ── */
let attachedFiles = [];

/* ── 초기화 (contact 탭 DOM 삽입 후 main.js에서 호출) ── */
function initContact() {
  attachedFiles = [];

  /* 체크박스 → 버튼 연동 */
  const checkbox  = document.getElementById('privacyAgree');
  const submitBtn = document.getElementById('contactSubmitBtn');
  if (checkbox && submitBtn) {
    checkbox.addEventListener('change', () => {
      submitBtn.disabled = !checkbox.checked;
    });
  }

  /* 입력 시 에러 해제 */
  ['fName','fTel','fEmail','fType','fTitle','fContent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => el.classList.remove('cf-input--error'));
  });

  /* 제목 글자수 카운터 */
  const fTitle      = document.getElementById('fTitle');
  const fTitleCount = document.getElementById('fTitleCount');
  if (fTitle && fTitleCount) {
    fTitle.addEventListener('input', () => {
      const len = fTitle.value.length;
      fTitleCount.textContent = len;
      fTitleCount.style.color = len >= 30 ? '#EF4444' : '';
    });
  }

  /* 문의 내용 글자수 카운터 */
  const fContent      = document.getElementById('fContent');
  const fContentCount = document.getElementById('fContentCount');
  if (fContent && fContentCount) {
    fContent.addEventListener('input', () => {
      const len = fContent.value.length;
      fContentCount.textContent = len;
      fContentCount.style.color = len >= 280 ? '#EF4444' : '';
    });
  }

  /* 첨부파일 드래그 앤 드롭 */
  const fileBox = document.getElementById('fileLabelBox');
  if (fileBox) {
    fileBox.addEventListener('dragover',  e => { e.preventDefault(); fileBox.style.borderColor = 'var(--blue)'; });
    fileBox.addEventListener('dragleave', ()  => { fileBox.style.borderColor = ''; });
    fileBox.addEventListener('drop', e => {
      e.preventDefault();
      fileBox.style.borderColor = '';
      handleFileChange(document.getElementById('fileInput'), e.dataTransfer.files);
    });
  }

  /* 문의 보내기 버튼 */
  const submitBtn2 = document.getElementById('contactSubmitBtn');
  if (submitBtn2) {
    submitBtn2.addEventListener('click', () => {
      if (validateForm()) openSendModal();
    });
  }
}

/* ── 유효성 검사 ── */
function validateForm() {
  document.querySelectorAll('.cf-input--error').forEach(e => e.classList.remove('cf-input--error'));
  let firstError = null;

  ['fName', 'fTel', 'fType', 'fTitle', 'fContent'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.value.trim()) return;
    el.classList.add('cf-input--error');
    if (!firstError) firstError = el;
  });

  const tel = document.getElementById('fTel');
  if (tel && tel.value.trim()) {
    if (!/^\d{9,11}$/.test(tel.value.replace(/-/g, ''))) {
      tel.classList.add('cf-input--error');
      if (!firstError) firstError = tel;
    }
  }

  const email = document.getElementById('fEmail');
  if (email && email.value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.classList.add('cf-input--error');
      if (!firstError) firstError = email;
    }
  }

  if (firstError) { firstError.focus(); return false; }
  return true;
}

/* ── 전송 완료 팝업 ── */
function openSendModal() {
  const modal = document.getElementById('sendModal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeSendModal() {
  const modal = document.getElementById('sendModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ── 경고 토스트 ── */
let warnTimer = null;
function showWarnToast(msg) {
  const toast = document.getElementById('warnToast');
  if (!toast) return;
  document.getElementById('warnToastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(warnTimer);
  warnTimer = setTimeout(() => closeWarnToast(), 4000);
}
function closeWarnToast() {
  document.getElementById('warnToast')?.classList.remove('show');
}

/* ── 개인정보 모달 ── */
function openPrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closePrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
function agreePrivacy() {
  const checkbox  = document.getElementById('privacyAgree');
  const submitBtn = document.getElementById('contactSubmitBtn');
  if (checkbox)  checkbox.checked  = true;
  if (submitBtn) submitBtn.disabled = false;
  closePrivacyModal();
}

/* ESC 키로 모달 닫기 (전역 1회 등록) */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closePrivacyModal(); closeSendModal(); }
});

/* ── 첨부파일 처리 ── */
function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function renderFileList() {
  const list = document.getElementById('fileList');
  if (!list) return;
  list.innerHTML = attachedFiles.map((f, i) => `
    <div class="contact-form__file-item">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span title="${f.name}">${f.name}</span>
      <span class="contact-form__file-size">${formatBytes(f.size)}</span>
      <button class="contact-form__file-remove" onclick="removeFile(${i})" aria-label="삭제">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');
}

function handleFileChange(input, fileList) {
  const files     = Array.from(fileList || input.files);
  const remaining = 3 - attachedFiles.length;

  if (files.length > remaining) {
    showWarnToast('파일은 최대 3개까지 첨부할 수 있습니다.');
    if (input) input.value = '';
    return;
  }

  files.forEach(f => {
    if (!attachedFiles.find(e => e.name === f.name && e.size === f.size)) attachedFiles.push(f);
  });
  renderFileList();

  const zone     = document.getElementById('fileLabelBox');
  const fileText = document.getElementById('fileText');
  if (zone) {
    const full = attachedFiles.length >= 3;
    zone.style.opacity       = full ? '0.5' : '';
    zone.style.pointerEvents = full ? 'none' : '';
    if (fileText) fileText.textContent = full ? '최대 3개까지 첨부 가능합니다' : '파일을 여기에 드래그하거나 클릭해서 선택하세요';
  }
  if (input) input.value = '';
}

function removeFile(idx) {
  attachedFiles.splice(idx, 1);
  renderFileList();
  const zone     = document.getElementById('fileLabelBox');
  const fileText = document.getElementById('fileText');
  if (zone && attachedFiles.length < 3) {
    zone.style.opacity = '';
    zone.style.pointerEvents = '';
    if (fileText) fileText.textContent = '파일을 여기에 드래그하거나 클릭해서 선택하세요';
  }
}
