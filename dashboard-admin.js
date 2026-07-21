// ---- Loading Skeleton ----
function showAdminSkeleton() {
  const statValues = document.querySelectorAll('.ea-stat-value');
  statValues.forEach(val => {
    val.innerHTML = '<div class="ea-sk-dark" style="height:28px; width:60px;"></div>';
  });

  const recentBox = document.querySelector('.ea-recent-box');
  if (recentBox) {
    recentBox.innerHTML = `
      <div class="ea-sk-banner">
        <span class="ea-sk-pulse-dot"></span>
        <p class="ea-sk-banner-text">Loading dashboard data...</p>
      </div>
      ${Array(4).fill(`
        <div class="ea-recent-item">
          <div class="ea-sk" style="height:14px; width:65%;"></div>
          <div class="ea-sk-dark" style="height:20px; width:55px; border-radius:20px;"></div>
        </div>
      `).join('')}
    `;
  }
}

showAdminSkeleton();
function isPortalSessionActive() {
  return localStorage.getItem('ea-authenticated') === 'true';
}

// ---- Check Auth & Load User ----
// ---- Check Auth & Load User ----
async function checkAuth() {
  showAdminSkeleton();

  const storedRole = localStorage.getItem('ea-user-role');
  const storedName = localStorage.getItem('ea-user-name');

  if (isPortalSessionActive() && storedRole === 'admin') {
    const pageTitle = document.getElementById('ea-page-title');
    const userName = document.querySelector('.ea-user-name');
    const userAvatar = document.querySelector('.ea-user-avatar');
    const firstName = (storedName || 'Admin').split(' ')[0];

    if (pageTitle) pageTitle.textContent = `Welcome, ${firstName}`;
    if (userName) userName.textContent = storedName || 'Admin';
    if (userAvatar) userAvatar.textContent = (storedName || 'A').charAt(0).toUpperCase();
    return;
  }

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const { data: userData } = await supabaseClient
    .from('users')
    .select('full_name, role')
    .eq('email', user.email)
    .single();

  if (!userData || userData.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  // Update welcome title
  const pageTitle = document.getElementById('ea-page-title');
  const userName = document.querySelector('.ea-user-name');
  const userAvatar = document.querySelector('.ea-user-avatar');
  const firstName = userData.full_name.split(' ')[0];

  if (pageTitle) pageTitle.textContent = `Welcome, ${firstName}`;
  if (userName) userName.textContent = userData.full_name;
  if (userAvatar) userAvatar.textContent = userData.full_name.charAt(0).toUpperCase();

  localStorage.setItem('ea-user-name', userData.full_name);
  localStorage.setItem('ea-user-role', userData.role);
}

checkAuth();

// ---- Sidebar Navigation ----
const navLinks = document.querySelectorAll('.ea-nav-link');
const sections = document.querySelectorAll('.ea-section');
const pageTitle = document.getElementById('ea-page-title');

navLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');

    const title = this.getAttribute('data-title');
    if (title) pageTitle.textContent = title;

    const target = this.getAttribute('data-section');
    sections.forEach(section => {
      section.style.display = section.id === 'section-' + target ? 'block' : 'none';
    });
  });
});

// ---- Logout ----
document.getElementById('ea-admin-logout').addEventListener('click', async function (e) {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  localStorage.clear();
  window.location.href = 'login.html';
});

// ---- Manage Users ----
document.getElementById('ea-add-user-btn').addEventListener('click', function () {
  const form = document.getElementById('ea-add-user-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('ea-cancel-user').addEventListener('click', function () {
  document.getElementById('ea-add-user-form').style.display = 'none';
});

document.getElementById('ea-submit-user').addEventListener('click', function () {
  const name = document.getElementById('new-name').value.trim();
  const role = document.getElementById('new-role').value;
  const email = document.getElementById('new-email').value.trim();
  const cls = document.getElementById('new-class').value.trim();

  if (!name || !role || !email || !cls) {
    alert('Please fill in all fields.');
    return;
  }

  const tbody = document.getElementById('ea-users-tbody');
  const badgeClass = role === 'Teacher' ? 'ea-role-teacher' : 'ea-role-student';
  const row = document.createElement('tr');
  row.setAttribute('data-role', role);
  row.innerHTML = `
    <td>${name}</td>
    <td><span class="ea-role-badge ${badgeClass}">${role}</span></td>
    <td>${email}</td>
    <td>${cls}</td>
    <td><button class="ea-del-btn">Delete</button></td>
  `;
  tbody.appendChild(row);
  attachDeleteListeners();

  document.getElementById('new-name').value = '';
  document.getElementById('new-role').value = '';
  document.getElementById('new-email').value = '';
  document.getElementById('new-class').value = '';
  document.getElementById('ea-add-user-form').style.display = 'none';
});

function attachDeleteListeners() {
  document.querySelectorAll('.ea-del-btn').forEach(btn => {
    btn.onclick = function () {
      if (confirm('Are you sure you want to delete this user?')) {
        this.closest('tr').remove();
      }
    };
  });
}
attachDeleteListeners();

document.querySelectorAll('.ea-filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.ea-filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.getAttribute('data-filter');
    document.querySelectorAll('#ea-users-tbody tr').forEach(row => {
      row.style.display = (filter === 'All' || row.getAttribute('data-role') === filter) ? '' : 'none';
    });
  });
});

// ---- Announcements ----
async function loadAnnouncements() {
  const { data: announcements, error } = await supabaseClient
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading announcements:', error);
    return;
  }

  const list = document.getElementById('ea-an-list');
  const empty = document.getElementById('ea-an-empty');

  if (!list) return;

  if (!announcements || announcements.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  list.innerHTML = announcements.map(ann => `
    <div class="ea-an-card" data-id="${ann.id}">
      <div class="ea-an-card-top">
        <div>
          <p class="ea-an-title">${ann.title}</p>
          <p class="ea-an-date">Posted: ${new Date(ann.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p class="ea-an-body">${ann.body}</p>
        </div>
        <button class="ea-del-btn ea-an-del" data-id="${ann.id}">Delete</button>
      </div>
    </div>
  `).join('');

  attachAnnouncementDeleteListeners();
}

loadAnnouncements();

function attachAnnouncementDeleteListeners() {
  document.querySelectorAll('.ea-an-del').forEach(btn => {
    btn.onclick = async function () {
      if (confirm('Delete this announcement?')) {
        const id = this.getAttribute('data-id');
        const { error } = await supabaseClient
          .from('announcements')
          .delete()
          .eq('id', id);

        if (error) {
          alert('Error deleting announcement. Please try again.');
          return;
        }

        this.closest('.ea-an-card').remove();
        checkAnnouncementsEmpty();
      }
    };
  });
}

function checkAnnouncementsEmpty() {
  const list = document.getElementById('ea-an-list');
  const empty = document.getElementById('ea-an-empty');
  if (empty) empty.style.display = list.children.length === 0 ? 'block' : 'none';
}

// ---- Results Filtering ----
['ea-results-class', 'ea-results-subject', 'ea-results-term'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', filterResults);
});

function filterResults() {
  const cls = document.getElementById('ea-results-class').value;
  const subject = document.getElementById('ea-results-subject').value;
  const term = document.getElementById('ea-results-term').value;

  document.querySelectorAll('#ea-results-tbody tr').forEach(row => {
    const matchClass = !cls || row.dataset.class === cls;
    const matchSubject = !subject || row.dataset.subject === subject;
    const matchTerm = !term || row.dataset.term === term;
    row.style.display = matchClass && matchSubject && matchTerm ? '' : 'none';
  });
}

// ---- Assignments Filtering ----
['ea-assign-class', 'ea-assign-subject'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', filterAssignments);
});

function filterAssignments() {
  const cls = document.getElementById('ea-assign-class').value;
  const subject = document.getElementById('ea-assign-subject').value;

  document.querySelectorAll('#ea-assign-tbody tr').forEach(row => {
    const matchClass = !cls || row.dataset.class === cls;
    const matchSubject = !subject || row.dataset.subject === subject;
    row.style.display = matchClass && matchSubject ? '' : 'none';
  });
}

function attachAssignmentDeleteListeners() {
  document.querySelectorAll('.ea-assign-del').forEach(btn => {
    btn.onclick = function () {
      if (confirm('Delete this assignment?')) {
        this.closest('tr').remove();
      }
    };
  });
}
attachAssignmentDeleteListeners();

// ---- Load Dashboard Stats ----
async function loadStats() {
  const { count: studentCount } = await supabaseClient
    .from('students')
    .select('*', { count: 'exact', head: true });

  const { count: teacherCount } = await supabaseClient
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'teacher');

  const { count: classCount } = await supabaseClient
    .from('classes')
    .select('*', { count: 'exact', head: true });

  const { count: announcementCount } = await supabaseClient
    .from('announcements')
    .select('*', { count: 'exact', head: true });

  const statValues = document.querySelectorAll('.ea-stat-value');
  if (statValues[0]) statValues[0].textContent = studentCount || 0;
  if (statValues[1]) statValues[1].textContent = teacherCount || 0;
  if (statValues[2]) statValues[2].textContent = classCount || 0;
  if (statValues[3]) statValues[3].textContent = announcementCount || 0;
}

loadStats();

// ---- Charts ----
window.addEventListener('load', function () {

  const attendanceCtx = document.getElementById('ea-attendance-chart');
  if (attendanceCtx) {
    new Chart(attendanceCtx, {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Attendance (%)',
          data: [92, 88, 95, 91, 87, 93, 90, 96, 89, 94],
          backgroundColor: 'rgba(56, 142, 60, 0.75)',
          borderColor: '#388E3C',
          borderWidth: 2,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        layout: { padding: { top: 20, bottom: 0 } },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: { font: { size: 12 }, boxWidth: 14, padding: 8 }
          },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.parsed.y}% attendance` }
          },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#388E3C',
            font: { weight: 'bold', size: 11 },
            formatter: val => val + '%'
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 75,
            max: 102,
            ticks: { callback: val => val + '%', stepSize: 5 },
            grid: { color: '#f0f0f0' },
            title: { display: true, text: 'Attendance Rate (%)', color: '#666', font: { size: 12 } }
          },
          x: {
            grid: { display: false },
            title: { display: true, text: 'Month', color: '#666', font: { size: 12 } }
          }
        }
      }
    });
  }

  const gradesCtx = document.getElementById('ea-grades-chart');
  if (gradesCtx) {
    const gradeData = [35, 30, 20, 10, 5];
    const totalStudents = 320;

    new Chart(gradesCtx, {
      type: 'doughnut',
      plugins: [ChartDataLabels, {
        id: 'centerText',
        beforeDraw(chart) {
          const { width, height, ctx } = chart;
          ctx.save();
          const centerX = width / 2;
          const centerY = height / 2;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#333';
          ctx.font = 'bold 22px Segoe UI';
          ctx.fillText(totalStudents, centerX, centerY - 10);
          ctx.fillStyle = '#888';
          ctx.font = '12px Segoe UI';
          ctx.fillText('Total Students', centerX, centerY + 12);
          ctx.restore();
        }
      }],
      data: {
        labels: ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade F'],
        datasets: [{
          data: gradeData,
          backgroundColor: ['#388E3C', '#1976D2', '#F57C00', '#7B1FA2', '#c62828'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 14,
              font: { size: 12 },
              generateLabels: chart => {
                const data = chart.data;
                return data.labels.map((label, i) => ({
                  text: `${label} — ${data.datasets[0].data[i]}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: '#fff',
                  lineWidth: 2,
                  index: i
                }));
              }
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const count = Math.round((ctx.parsed / 100) * totalStudents);
                return ` ${ctx.label}: ${ctx.parsed}% (${count} students)`;
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 12 },
            formatter: val => val + '%',
            display: ctx => ctx.dataset.data[ctx.dataIndex] > 8
          }
        }
      }
    });
  }

});

// ---- Notification Bell ----
const notifBtn = document.getElementById('ea-notif-btn');
const notifDropdown = document.getElementById('ea-notif-dropdown');
const notifBadge = document.getElementById('ea-notif-badge');
const notifMarkAll = document.getElementById('ea-notif-mark-all');
const userChip = document.getElementById('ea-user-chip');

if (notifBtn) {
  notifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    notifDropdown.classList.toggle('open');
    notifBtn.classList.toggle('active');
    if (userChip) userChip.classList.remove('open');
  });
}

if (notifMarkAll) {
  notifMarkAll.addEventListener('click', function () {
    document.querySelectorAll('.ea-notif-unread').forEach(item => {
      item.classList.remove('ea-notif-unread');
    });
    document.querySelectorAll('.ea-notif-dot').forEach(dot => {
      dot.style.display = 'none';
    });
    notifBadge.classList.add('hidden');
  });
}

document.querySelectorAll('.ea-notif-item').forEach(item => {
  item.addEventListener('click', function () {
    this.classList.remove('ea-notif-unread');
    const dot = this.querySelector('.ea-notif-dot');
    if (dot) dot.style.display = 'none';
    const unreadCount = document.querySelectorAll('.ea-notif-unread').length;
    if (unreadCount === 0) {
      notifBadge.classList.add('hidden');
    } else {
      notifBadge.textContent = unreadCount;
    }
  });
});

// ---- User Profile Chip ----
if (userChip) {
  userChip.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('open');
    if (notifDropdown) notifDropdown.classList.remove('open');
    if (notifBtn) notifBtn.classList.remove('active');
  });
}

const logoutChip = document.getElementById('ea-admin-logout-chip');
if (logoutChip) {
  logoutChip.addEventListener('click', async function (e) {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

document.addEventListener('click', function () {
  if (notifDropdown) notifDropdown.classList.remove('open');
  if (notifBtn) notifBtn.classList.remove('active');
  if (userChip) userChip.classList.remove('open');
});

// ---- Mobile Sidebar ----
const adminHamburger = document.getElementById('ea-admin-hamburger');
const adminSidebar = document.querySelector('.ea-admin-sidebar');
const sidebarOverlay = document.getElementById('ea-sidebar-overlay');

function openSidebar() {
  adminSidebar.classList.add('open');
  sidebarOverlay.classList.add('show');
  adminHamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  adminSidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
  adminHamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (adminHamburger) {
  adminHamburger.addEventListener('click', function () {
    adminSidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

document.querySelectorAll('.ea-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeSidebar();
});

// ---- Dashboard Search Bar ----
const searchToggle = document.getElementById('ea-search-toggle');
const searchBox = document.getElementById('ea-search-box');
const searchInput = document.getElementById('ea-search-input');
const searchClear = document.getElementById('ea-search-clear');

if (searchToggle) {
  searchToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    searchBox.classList.toggle('open');
    if (searchBox.classList.contains('open')) {
      setTimeout(() => searchInput.focus(), 300);
    } else {
      clearSearch();
    }
  });
}

if (searchClear) {
  searchClear.addEventListener('click', function () {
    clearSearch();
    searchInput.focus();
  });
}

document.addEventListener('click', function (e) {
  if (searchBox && !searchBox.contains(e.target) && e.target !== searchToggle) {
    searchBox.classList.remove('open');
    clearSearch();
  }
});

if (searchInput) {
  searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    if (query.length === 0) {
      clearSearch();
      return;
    }
    runSearch(query);
  });
}

function clearSearch() {
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('#ea-users-tbody tr').forEach(r => r.style.display = '');
  document.querySelectorAll('#ea-results-tbody tr').forEach(r => r.style.display = '');
  document.querySelectorAll('#ea-assign-tbody tr').forEach(r => r.style.display = '');
  document.querySelectorAll('.ea-search-highlight').forEach(el => {
    el.outerHTML = el.textContent;
  });
  document.querySelectorAll('.ea-search-no-results').forEach(el => el.remove());
}

function runSearch(query) {
  searchTable('ea-users-tbody', query);
  searchTable('ea-results-tbody', query);
  searchTable('ea-assign-tbody', query);
}

function searchTable(tbodyId, query) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let visibleCount = 0;

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(query)) {
      row.style.display = '';
      visibleCount++;
      highlightCells(row, query);
    } else {
      row.style.display = 'none';
    }
  });

  const existingMsg = tbody.parentElement.querySelector('.ea-search-no-results');
  if (existingMsg) existingMsg.remove();

  if (visibleCount === 0) {
    const msg = document.createElement('tr');
    msg.className = 'ea-search-no-results';
    msg.innerHTML = `
      <td colspan="10" style="text-align:center; padding:2rem; color:#aaa;">
        <i class="fas fa-search" style="font-size:1.5rem; display:block; margin-bottom:0.5rem; color:#ddd;"></i>
        No results found for "<strong>${query}</strong>"
      </td>
    `;
    tbody.appendChild(msg);
    msg.style.display = 'table-row';
  }
}

function highlightCells(row, query) {
  row.querySelectorAll('.ea-search-highlight').forEach(el => {
    el.outerHTML = el.textContent;
  });

  row.querySelectorAll('td').forEach(td => {
    if (td.querySelector('button, a, span.ea-role-badge, span.ea-grade, span.ea-assign-status')) return;
    const text = td.textContent;
    const lower = text.toLowerCase();
    if (lower.includes(query)) {
      const regex = new RegExp(`(${query})`, 'gi');
      td.innerHTML = text.replace(regex, '<span class="ea-search-highlight">$1</span>');
    }
  });
}

// ---- Session Timeout Warning ----
(function () {
  const INACTIVE_LIMIT = 10 * 60 * 1000;
  const COUNTDOWN_START = 60;

  const overlay = document.getElementById('ea-timeout-overlay');
  const countdownEl = document.getElementById('ea-timeout-countdown');
  const stayBtn = document.getElementById('ea-timeout-stay');
  const logoutBtn = document.getElementById('ea-timeout-logout');

  if (!overlay) return;

  let inactivityTimer;
  let countdownTimer;
  let secondsLeft = COUNTDOWN_START;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showTimeoutWarning, INACTIVE_LIMIT);
  }

  function showTimeoutWarning() {
    secondsLeft = COUNTDOWN_START;
    countdownEl.textContent = secondsLeft;
    overlay.classList.add('show');
    startCountdown();
  }

  function startCountdown() {
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      secondsLeft--;
      countdownEl.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        logoutUser();
      }
    }, 1000);
  }

  function dismissWarning() {
    overlay.classList.remove('show');
    clearInterval(countdownTimer);
    resetInactivityTimer();
  }

  async function logoutUser() {
    overlay.classList.remove('show');
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = 'login.html';
  }

  if (stayBtn) stayBtn.addEventListener('click', dismissWarning);
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
  });

  resetInactivityTimer();
})();


// ---- Manage Teachers ----
let selectedTeacherId = null;

async function loadParentPasswords() {
  const { data: students, error } = await supabaseClient
    .from('students')
    .select('full_name, student_code, family_name, class_id, classes(name)')
    .order('student_code');

  if (error || !students) return;

  const tbody = document.getElementById('ea-parent-pwd-tbody');
  if (!tbody) return;

  tbody.innerHTML = students.map(s => `
    <tr>
      <td>${s.full_name || '-'}</td>
      <td>${s.student_code || '-'}</td>
      <td>${s.classes?.name || '-'}</td>
      <td>${s.family_name || '-'}</td>
      <td>
        <button class="ea-view-btn reset-parent-pwd-btn"
          data-student-code="${s.student_code || ''}"
          data-family-name="${(s.family_name || '').replace(/"/g, '&quot;')}">
          Reset
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.reset-parent-pwd-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const studentCode = this.getAttribute('data-student-code');
      const familyName = this.getAttribute('data-family-name');
      resetParentPassword(studentCode, familyName);
    });
  });
}

async function resetParentPassword(studentCode, familyName) {
  if (!confirm(`Reset password for ${studentCode} back to "${familyName}"?`)) return;

  const { error } = await supabaseClient
    .from('students')
    .update({ family_name: familyName })
    .eq('student_code', studentCode);

  if (!error) {
    alert('Password reset successfully!');
    loadParentPasswords();
  } else {
    alert('Failed to reset password. Please try again.');
  }
}

async function loadTeachers() {
  const { data: teachers, error } = await supabaseClient
    .from('users')
    .select('id, full_name, email, staff_id, portal_password')
    .eq('role', 'teacher')
    .order('full_name');

  const tbody = document.getElementById('ea-teachers-tbody');
  if (!tbody) return;

  if (error || !teachers || teachers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:2rem; color:#aaa;">
          No teachers found.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = teachers.map(t => `
    <tr>
      <td>${t.full_name}</td>
      <td><strong>${t.staff_id || 'Not set'}</strong></td>
      <td>${t.email}</td>
      <td>${t.portal_password || 'Not set'}</td>
      <td>
        <button class="ea-view-btn ea-set-password-btn"
          data-id="${t.id}"
          data-name="${t.full_name}">
          Set Password
        </button>
      </td>
    </tr>
  `).join('');

  // Attach set password listeners
  document.querySelectorAll('.ea-set-password-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      selectedTeacherId = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      document.getElementById('ea-modal-teacher-name').textContent = `Setting password for: ${name}`;
      document.getElementById('ea-new-teacher-password').value = '';
      document.getElementById('ea-modal-success').style.display = 'none';
      document.getElementById('ea-password-modal').style.display = 'flex';
    });
  });
}

// Load teachers when section is shown
document.querySelectorAll('.ea-nav-link').forEach(link => {
  link.addEventListener('click', function () {
    const section = this.getAttribute('data-section');
    if (section === 'teachers') {
      loadTeachers();
    }
    if (section === 'parent-passwords') {
      loadParentPasswords();
    }
  });
});

// Close modal
document.getElementById('ea-modal-close')?.addEventListener('click', function () {
  document.getElementById('ea-password-modal').style.display = 'none';
});

document.getElementById('ea-modal-cancel')?.addEventListener('click', function () {
  document.getElementById('ea-password-modal').style.display = 'none';
});

// Save password
document.getElementById('ea-save-password-btn')?.addEventListener('click', async function () {
  const newPassword = document.getElementById('ea-new-teacher-password').value.trim();

  if (!newPassword) {
    alert('Please enter a password.');
    return;
  }

  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }

  const { error } = await supabaseClient
    .from('users')
    .update({ portal_password: newPassword })
    .eq('id', selectedTeacherId);

  if (error) {
    alert('Error saving password. Please try again.');
    return;
  }

  document.getElementById('ea-modal-success').style.display = 'block';
  setTimeout(() => {
    document.getElementById('ea-password-modal').style.display = 'none';
    loadTeachers();
  }, 1500);
});

// ---- Add Student ----
const addStudentBtn = document.getElementById('ea-add-student-btn');
const addStudentModal = document.getElementById('ea-add-student-modal');
const closeStudentModal = document.getElementById('ea-close-student-modal');
const cancelStudentModal = document.getElementById('ea-cancel-student-modal');
const saveStudentBtn = document.getElementById('ea-save-student-btn');

if (addStudentBtn) {
  addStudentBtn.addEventListener('click', () => {
    addStudentModal.style.display = 'flex';
  });
}

if (closeStudentModal) {
  closeStudentModal.addEventListener('click', () => {
    addStudentModal.style.display = 'none';
  });
}

if (cancelStudentModal) {
  cancelStudentModal.addEventListener('click', () => {
    addStudentModal.style.display = 'none';
  });
}

if (saveStudentBtn) {
  saveStudentBtn.addEventListener('click', async function () {
    const firstName = document.getElementById('ea-student-firstname')?.value.trim() || '';
    const lastName = document.getElementById('ea-student-lastname')?.value.trim() || '';
    const middleName = document.getElementById('ea-student-middlename')?.value.trim() || '';
    const gender = document.getElementById('ea-student-gender')?.value || '';
    const dob = document.getElementById('ea-new-student-dob')?.value || '';
    const classId = document.getElementById('ea-new-student-class')?.value || '';
    const enrollment = document.getElementById('ea-student-enrollment')?.value || '';
    const prevSchool = document.getElementById('ea-student-prevschool')?.value.trim() || '';
    const parentName = document.getElementById('ea-student-parentname')?.value.trim() || '';
    const relationship = document.getElementById('ea-student-relationship')?.value || '';
    const phone1 = document.getElementById('ea-student-phone1')?.value.trim() || '';
    const phone2 = document.getElementById('ea-student-phone2')?.value.trim() || '';
    const parentEmail = document.getElementById('ea-student-parentemail')?.value.trim() || '';
    const address = document.getElementById('ea-student-address')?.value.trim() || '';
    const emergName = document.getElementById('ea-student-emergname')?.value.trim() || '';
    const emergPhone = document.getElementById('ea-student-emergphone')?.value.trim() || '';
    const medical = document.getElementById('ea-student-medical')?.value.trim() || '';

    const successMsg = document.getElementById('ea-student-success');
    const errorMsg = document.getElementById('ea-student-error');
    const errorText = document.getElementById('ea-student-error-text');

    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';

    if (!firstName) {
      if (errorText) errorText.textContent = "Please enter the student's first name.";
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (!lastName) {
      if (errorText) errorText.textContent = "Please enter the student's last name.";
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (!gender) {
      if (errorText) errorText.textContent = 'Please select a gender.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (!dob) {
      if (errorText) errorText.textContent = 'Please enter date of birth.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (!classId) {
      if (errorText) errorText.textContent = 'Please select a class.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (!parentName) {
      if (errorText) errorText.textContent = 'Please enter parent or guardian name.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (!relationship) {
      if (errorText) errorText.textContent = 'Please select relationship to child.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (!phone1) {
      if (errorText) errorText.textContent = 'Please enter a primary phone number.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    const fullName = middleName
      ? `${lastName} ${firstName} ${middleName}`
      : `${lastName} ${firstName}`;

    const { count } = await supabaseClient
      .from('students')
      .select('*', { count: 'exact', head: true });

    const nextNum = String((count || 0) + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const studentCode = `EA-${year}-${nextNum}`;

    const { error: studentError } = await supabaseClient
      .from('students')
      .insert({
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName || null,
        gender: gender,
        date_of_birth: dob,
        class_id: classId,
        student_code: studentCode,
        family_name: lastName,
        enrollment_date: enrollment || null,
        previous_school: prevSchool || null,
        parent_name: parentName,
        parent_relationship: relationship,
        parent_phone: phone1,
        parent_phone2: phone2 || null,
        parent_email: parentEmail || null,
        home_address: address || null,
        emergency_contact_name: emergName || null,
        emergency_contact_phone: emergPhone || null,
        medical_notes: medical || null,
      })
      .select()
      .single();

    if (studentError) {
      console.error('Error adding student:', studentError);
      if (errorText) errorText.textContent = 'Error adding student. Please try again.';
      if (errorMsg) errorMsg.style.display = 'block';
      return;
    }

    if (successMsg) {
      successMsg.innerHTML = `<i class="fas fa-check-circle"></i> Student added! ID: <strong>${studentCode}</strong> — Password: <strong>${lastName}</strong>`;
      successMsg.style.display = 'block';
    }

    const clearField = (id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    };

    clearField('ea-student-firstname');
    clearField('ea-student-lastname');
    clearField('ea-student-middlename');
    clearField('ea-student-gender');
    clearField('ea-new-student-dob');
    clearField('ea-new-student-class');
    clearField('ea-student-enrollment');
    clearField('ea-student-prevschool');
    clearField('ea-student-parentname');
    clearField('ea-student-relationship');
    clearField('ea-student-phone1');
    clearField('ea-student-phone2');
    clearField('ea-student-parentemail');
    clearField('ea-student-address');
    clearField('ea-student-emergname');
    clearField('ea-student-emergphone');
    clearField('ea-student-medical');

    loadStats();

    setTimeout(() => {
      if (addStudentModal) addStudentModal.style.display = 'none';
      if (successMsg) successMsg.style.display = 'none';
    }, 5000);
  });
}

// ---- Add Parent ----
const addParentBtn = document.getElementById('ea-add-parent-btn');
const addParentModal = document.getElementById('ea-add-parent-modal');
const closeParentModal = document.getElementById('ea-close-parent-modal');
const cancelParentModal = document.getElementById('ea-cancel-parent-modal');
const saveParentBtn = document.getElementById('ea-save-parent-btn');

if (addParentBtn) {
  addParentBtn.addEventListener('click', () => {
    addParentModal.style.display = 'flex';
  });
}

if (closeParentModal) {
  closeParentModal.addEventListener('click', () => {
    addParentModal.style.display = 'none';
  });
}

if (cancelParentModal) {
  cancelParentModal.addEventListener('click', () => {
    addParentModal.style.display = 'none';
  });
}

if (saveParentBtn) {
  saveParentBtn.addEventListener('click', async function () {
    const name = document.getElementById('ea-new-parent-name').value.trim();
    const email = document.getElementById('ea-new-parent-email').value.trim();
    const phone = document.getElementById('ea-new-parent-phone').value.trim();
    const studentCode = document.getElementById('ea-new-parent-student').value.trim().toUpperCase();
    const successMsg = document.getElementById('ea-parent-success');
    const errorMsg = document.getElementById('ea-parent-error');
    const errorText = document.getElementById('ea-parent-error-text');

    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    if (!name || !email || !phone) {
      errorText.textContent = 'Please fill in name, email and phone.';
      errorMsg.style.display = 'block';
      return;
    }

    // Insert parent into users table
    const { data: parentData, error: parentError } = await supabaseClient
      .from('users')
      .insert({
        full_name: name,
        email: email,
        role: 'parent',
        phone: phone
      })
      .select()
      .single();

    if (parentError) {
      errorText.textContent = 'Error adding parent. Email may already exist.';
      errorMsg.style.display = 'block';
      return;
    }

    // Link parent to student if student code provided
    if (studentCode) {
      const { data: studentData } = await supabaseClient
        .from('students')
        .select('id')
        .eq('student_code', studentCode)
        .single();

      if (studentData) {
        await supabaseClient
          .from('students')
          .update({ parent_id: parentData.id })
          .eq('id', studentData.id);
      }
    }

    successMsg.innerHTML = `
      <i class="fas fa-check-circle"></i> Parent added successfully!<br>
      <small>They can log in using Student ID: <strong>${studentCode || 'Not linked'}</strong> and their child's last name as password.</small>
    `;
    successMsg.style.display = 'block';

    // Clear form
    document.getElementById('ea-new-parent-name').value = '';
    document.getElementById('ea-new-parent-email').value = '';
    document.getElementById('ea-new-parent-phone').value = '';
    document.getElementById('ea-new-parent-student').value = '';

    setTimeout(() => {
      addParentModal.style.display = 'none';
      successMsg.style.display = 'none';
    }, 4000);
  });
}

// ---- Load Admissions ----
async function loadAdmissions() {
  const tbody = document.getElementById('ea-adm-tbody');
  const countEl = document.getElementById('ea-adm-count');
  if (!tbody) return;

  const { data: admissions, error } = await supabaseClient
    .from('admissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !admissions) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:2rem; color:#aaa;">
          Error loading applications. Please try again.
        </td>
      </tr>`;
    return;
  }

  if (admissions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:2rem; color:#aaa;">
          <i class="fas fa-file-alt" style="font-size:2rem; display:block; margin-bottom:0.5rem; color:#ddd;"></i>
          No admission applications yet.
        </td>
      </tr>`;
    if (countEl) countEl.textContent = '0 applications';
    return;
  }

  if (countEl) countEl.textContent = `${admissions.length} application${admissions.length > 1 ? 's' : ''}`;

  tbody.innerHTML = admissions.map(a => {
    const date = new Date(a.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const statusColor = a.status === 'Accepted' ? '#388E3C'
      : a.status === 'Rejected' ? '#c62828'
      : a.status === 'Reviewed' ? '#1976D2'
      : '#D94E2A';

    const statusBg = a.status === 'Accepted' ? '#e8f5e9'
      : a.status === 'Rejected' ? '#ffebee'
      : a.status === 'Reviewed' ? '#e3f2fd'
      : '#FDF0EC';

    return `
      <tr>
        <td><strong>${a.child_full_name}</strong></td>
        <td>${a.class_applying_for}</td>
        <td>${a.parent_name}</td>
        <td>${a.phone}</td>
        <td>${date}</td>
        <td>
          <span style="
            background:${statusBg};
            color:${statusColor};
            padding:4px 10px;
            border-radius:20px;
            font-size:0.8rem;
            font-weight:700;
          ">${a.status}</span>
        </td>
        <td>
          <button class="ea-view-btn" onclick="viewAdmission('${a.id}')">View</button>
          <button class="ea-view-btn" style="background:#388E3C; color:white; border:none;" onclick="updateAdmissionStatus('${a.id}', 'Accepted')">Accept</button>
          <button class="ea-del-btn" onclick="updateAdmissionStatus('${a.id}', 'Rejected')">Reject</button>
        </td>
      </tr>
    `;
  }).join('');

  // Filter by status
  const statusFilter = document.getElementById('ea-adm-filter-status');
  if (statusFilter) {
    statusFilter.addEventListener('change', function () {
      const status = this.value;
      document.querySelectorAll('#ea-adm-tbody tr').forEach(row => {
        if (!status) {
          row.style.display = '';
        } else {
          row.style.display = row.textContent.includes(status) ? '' : 'none';
        }
      });
    });
  }
}

// ---- View Admission Details ----
async function viewAdmission(id) {
  const modal = document.getElementById('ea-adm-modal');
  const modalBody = document.getElementById('ea-adm-modal-body');

  const { data: a } = await supabaseClient
    .from('admissions')
    .select('*')
    .eq('id', id)
    .single();

  if (!a) return;

  const date = new Date(a.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  modalBody.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem;">

      <div style="background:#FDF0EC; border-radius:8px; padding:1rem;">
        <p style="font-size:0.75rem; text-transform:uppercase; color:#D94E2A; font-weight:700; margin-bottom:0.8rem;">
          <i class="fas fa-child"></i> Child Information
        </p>
        <p><strong>Name:</strong> ${a.child_full_name}</p>
        <p><strong>Date of Birth:</strong> ${a.date_of_birth}</p>
        <p><strong>Gender:</strong> ${a.gender}</p>
        <p><strong>Class Applying For:</strong> ${a.class_applying_for}</p>
        <p><strong>Previous School:</strong> ${a.previous_school || 'None'}</p>
      </div>

      <div style="background:#f5f5f5; border-radius:8px; padding:1rem;">
        <p style="font-size:0.75rem; text-transform:uppercase; color:#D94E2A; font-weight:700; margin-bottom:0.8rem;">
          <i class="fas fa-user"></i> Parent / Guardian Information
        </p>
        <p><strong>Name:</strong> ${a.parent_name}</p>
        <p><strong>Relationship:</strong> ${a.relationship}</p>
        <p><strong>Phone:</strong> ${a.phone}</p>
        <p><strong>Email:</strong> ${a.email}</p>
        <p><strong>Address:</strong> ${a.home_address || 'Not provided'}</p>
        <p><strong>Heard About Us:</strong> ${a.heard_from || 'Not specified'}</p>
      </div>

      ${a.additional_info ? `
      <div style="background:#fff; border:1px solid #eee; border-radius:8px; padding:1rem;">
        <p style="font-size:0.75rem; text-transform:uppercase; color:#D94E2A; font-weight:700; margin-bottom:0.5rem;">
          <i class="fas fa-info-circle"></i> Additional Information
        </p>
        <p style="color:#555; font-size:0.9rem;">${a.additional_info}</p>
      </div>` : ''}

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <p style="font-size:0.82rem; color:#999;">Submitted: ${date}</p>
        <div style="display:flex; gap:0.5rem;">
          <button class="ea-view-btn" style="background:#388E3C; color:white; border:none;" onclick="updateAdmissionStatus('${a.id}', 'Accepted'); document.getElementById('ea-adm-modal').style.display='none';">
            <i class="fas fa-check"></i> Accept
          </button>
          <button class="ea-view-btn" style="background:#1976D2; color:white; border:none;" onclick="updateAdmissionStatus('${a.id}', 'Reviewed'); document.getElementById('ea-adm-modal').style.display='none';">
            <i class="fas fa-eye"></i> Mark Reviewed
          </button>
          <button class="ea-del-btn" onclick="updateAdmissionStatus('${a.id}', 'Rejected'); document.getElementById('ea-adm-modal').style.display='none';">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </div>

    </div>
  `;

  modal.style.display = 'flex';
}

// ---- Update Admission Status ----
async function updateAdmissionStatus(id, status) {
  const { error } = await supabaseClient
    .from('admissions')
    .update({ status: status })
    .eq('id', id);

  if (!error) {
    loadAdmissions();
  }
}

// ---- Close Admission Modal ----
document.getElementById('ea-adm-modal-close')?.addEventListener('click', function () {
  document.getElementById('ea-adm-modal').style.display = 'none';
});

// ---- Load admissions when section is clicked ----
document.querySelectorAll('.ea-nav-link').forEach(link => {
  link.addEventListener('click', function () {
    if (this.getAttribute('data-section') === 'admissions') {
      loadAdmissions();
    }
  });
});

