// ---- Sidebar Navigation ----
const studentLinks = document.querySelectorAll('.ea-student-link');
const studentSections = document.querySelectorAll('.ea-student-section');
const studentPageTitle = document.getElementById('ea-student-page-title');

studentLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    studentLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    studentPageTitle.textContent = this.getAttribute('data-title');
    const target = this.getAttribute('data-section');
    studentSections.forEach(section => {
      section.style.display = section.id === 'section-' + target ? 'block' : 'none';
    });
  });
});

// ---- Logout ----
document.getElementById('ea-student-logout').addEventListener('click', function (e) {
  e.preventDefault();
  alert('Logging out...');
  window.location.href = 'login.html';
});

// ---- Assignment Filters ----
['ea-s-assign-subject', 'ea-s-assign-status'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', filterStudentAssignments);
});

function filterStudentAssignments() {
  const subject = document.getElementById('ea-s-assign-subject').value;
  const status = document.getElementById('ea-s-assign-status').value;
  document.querySelectorAll('#ea-s-assign-tbody tr').forEach(row => {
    const matchSubject = !subject || row.dataset.subject === subject;
    const matchStatus = !status || row.dataset.status === status;
    row.style.display = matchSubject && matchStatus ? '' : 'none';
  });
}

// ---- Results Filter ----
const resultsTermFilter = document.getElementById('ea-s-results-term');
if (resultsTermFilter) {
  resultsTermFilter.addEventListener('change', function () {
    const term = this.value;
    document.querySelectorAll('#ea-s-results-tbody tr').forEach(row => {
      row.style.display = !term || row.dataset.term === term ? '' : 'none';
    });
  });
}

// ---- Student Notification Bell ----
const sNotifBtn = document.getElementById('ea-s-notif-btn');
const sNotifDropdown = document.getElementById('ea-s-notif-dropdown');
const sNotifBadge = document.getElementById('ea-s-notif-badge');
const sNotifMarkAll = document.getElementById('ea-s-notif-mark-all');
const sUserChip = document.getElementById('ea-s-user-chip');

if (sNotifBtn) {
  sNotifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    sNotifDropdown.classList.toggle('open');
    sNotifBtn.classList.toggle('active');
    if (sUserChip) sUserChip.classList.remove('open');
  });
}

if (sNotifMarkAll) {
  sNotifMarkAll.addEventListener('click', function () {
    sNotifDropdown.querySelectorAll('.ea-notif-unread').forEach(item => {
      item.classList.remove('ea-notif-unread');
    });
    sNotifDropdown.querySelectorAll('.ea-notif-dot').forEach(dot => {
      dot.style.display = 'none';
    });
    sNotifBadge.classList.add('hidden');
  });
}

sNotifDropdown && sNotifDropdown.querySelectorAll('.ea-notif-item').forEach(item => {
  item.addEventListener('click', function () {
    this.classList.remove('ea-notif-unread');
    const dot = this.querySelector('.ea-notif-dot');
    if (dot) dot.style.display = 'none';
    const unreadCount = sNotifDropdown.querySelectorAll('.ea-notif-unread').length;
    sNotifBadge.textContent = unreadCount;
    if (unreadCount === 0) sNotifBadge.classList.add('hidden');
  });
});

// ---- Student User Chip ----
if (sUserChip) {
  sUserChip.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('open');
    if (sNotifDropdown) sNotifDropdown.classList.remove('open');
    if (sNotifBtn) sNotifBtn.classList.remove('active');
  });
}

const sLogoutChip = document.getElementById('ea-student-logout-chip');
if (sLogoutChip) {
  sLogoutChip.addEventListener('click', function (e) {
    e.preventDefault();
    alert('Logging out...');
    window.location.href = 'login.html';
  });
}

// ---- Student Mobile Sidebar ----
const studentHamburger = document.getElementById('ea-student-hamburger');
const studentSidebar = document.querySelector('.ea-student-sidebar');
const studentOverlay = document.getElementById('ea-student-sidebar-overlay');

function openStudentSidebar() {
  studentSidebar.classList.add('open');
  studentOverlay.classList.add('show');
  studentHamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeStudentSidebar() {
  studentSidebar.classList.remove('open');
  studentOverlay.classList.remove('show');
  studentHamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (studentHamburger) {
  studentHamburger.addEventListener('click', function () {
    studentSidebar.classList.contains('open') ? closeStudentSidebar() : openStudentSidebar();
  });
}

if (studentOverlay) {
  studentOverlay.addEventListener('click', closeStudentSidebar);
}

document.querySelectorAll('.ea-student-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeStudentSidebar();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeStudentSidebar();
});

// Close dropdowns when clicking outside
document.addEventListener('click', function () {
  if (sNotifDropdown) sNotifDropdown.classList.remove('open');
  if (sNotifBtn) sNotifBtn.classList.remove('active');
  if (sUserChip) sUserChip.classList.remove('open');
});