// ---- Loading Skeleton ----
function showTeacherSkeleton() {
  const statValues = document.querySelectorAll('.ea-t-stat-value');
  statValues.forEach(val => {
    val.innerHTML = '<div class="ea-sk-dark" style="height:28px; width:60px;"></div>';
  });

  const classesGrid = document.querySelector('.ea-t-classes-grid');
  if (classesGrid) {
    classesGrid.innerHTML = `
      <div class="ea-sk-banner" style="grid-column: 1/-1;">
        <span class="ea-sk-pulse-dot"></span>
        <p class="ea-sk-banner-text">Loading your classes...</p>
      </div>
      ${Array(3).fill(`
        <div class="ea-sk-dark" style="height:90px; border-radius:10px;"></div>
      `).join('')}
    `;
  }
}



function isPortalSessionActive() {
  return localStorage.getItem('ea-authenticated') === 'true';
}

// ---- Check Auth & Load User ----

async function checkTeacherAuth() {
  showTeacherSkeleton();

  const storedRole = localStorage.getItem('ea-user-role');
  const storedName = localStorage.getItem('ea-user-name');

  if (isPortalSessionActive() && storedRole === 'teacher') {
    const pageTitle = document.getElementById('ea-teacher-page-title');
    const userName = document.querySelector('.ea-user-name');
    const userAvatar = document.querySelector('.ea-user-avatar');
    const firstName = (storedName || 'Teacher').split(' ')[0];

    if (pageTitle) pageTitle.textContent = `Welcome, ${firstName}`;
    if (userName) userName.textContent = storedName || 'Teacher';
    if (userAvatar) userAvatar.textContent = (storedName || 'T').charAt(0).toUpperCase();
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

  if (!userData || userData.role !== 'teacher') {
    window.location.href = 'login.html';
    return;
  }

  // Update UI with real user name
  const pageTitle = document.getElementById('ea-teacher-page-title');
  const userName = document.querySelector('.ea-user-name');
  const userAvatar = document.querySelector('.ea-user-avatar');
  const firstName = userData.full_name.split(' ')[0];

  if (pageTitle) pageTitle.textContent = `Welcome, ${firstName}`;
  if (userName) userName.textContent = userData.full_name;
  if (userAvatar) userAvatar.textContent = userData.full_name.charAt(0).toUpperCase();

  localStorage.setItem('ea-user-name', userData.full_name);
  localStorage.setItem('ea-user-role', userData.role);
  localStorage.setItem('ea-user-email', user.email);

  // Load teacher specific data
  loadTeacherData(user.email);
}

checkTeacherAuth();

// ---- Load Teacher Data ----
async function loadTeacherData(email) {
  // Get teacher record
  const { data: teacherData } = await supabaseClient
    .from('users')
    .select('id, full_name')
    .eq('email', email)
    .single();

  if (!teacherData) return;

  // Load classes assigned to this teacher
  const { data: classes } = await supabaseClient
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherData.id);

  // Update classes grid
  const classesGrid = document.querySelector('.ea-t-classes-grid');
  if (classesGrid && classes && classes.length > 0) {
    classesGrid.innerHTML = classes.map(cls => `
      <div class="ea-t-class-card">
        <p class="ea-t-class-name">${cls.name}</p>
        <p class="ea-t-class-info">Academic Year: ${cls.academic_year}</p>
        <span class="ea-t-class-badge">Active</span>
      </div>
    `).join('');
  }

  // Update stat cards
  const statValues = document.querySelectorAll('.ea-t-stat-value');

  // Count students across all teacher classes
  if (classes && classes.length > 0) {
    const classIds = classes.map(c => c.id);
    const { count: studentCount } = await supabaseClient
      .from('students')
      .select('*', { count: 'exact', head: true })
      .in('class_id', classIds);

    if (statValues[0]) statValues[0].textContent = studentCount || 0;
    if (statValues[1]) statValues[1].textContent = classes.length;
  }

  // Count assignments by this teacher
  const { count: assignmentCount } = await supabaseClient
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacherData.id);

  if (statValues[2]) statValues[2].textContent = assignmentCount || 0;

  // Load assignments into table
  loadTeacherAssignments(teacherData.id);

  // Load results
  loadTeacherResults(teacherData.id);

  // Load attendance
  loadTeacherAttendance(classes);

  // Load messages
  loadTeacherMessages(teacherData.id);
}

// ---- Load Assignments ----
async function loadTeacherAssignments(teacherId) {
  const { data: assignments } = await supabaseClient
    .from('assignments')
    .select(`
      *,
      subjects (name),
      classes (name)
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  const tbody = document.getElementById('ea-t-assign-tbody');
  if (!tbody || !assignments) return;

  if (assignments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:2rem; color:#aaa;">
          No assignments uploaded yet.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = assignments.map(a => {
    const dueDate = a.due_date
      ? new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'No date';
    const isOverdue = a.due_date && new Date(a.due_date) < new Date();
    const statusClass = isOverdue ? 'ea-t-status-due' : 'ea-t-status-active';
    const statusText = isOverdue ? 'Due Soon' : 'Active';

    return `
      <tr data-class="${a.classes?.name || ''}" data-subject="${a.subjects?.name || ''}">
        <td>${a.title}</td>
        <td>${a.classes?.name || 'N/A'}</td>
        <td>${a.subjects?.name || 'N/A'}</td>
        <td>${dueDate}</td>
        <td><span class="ea-t-status ${statusClass}">${statusText}</span></td>
        <td>
          <a href="view-assignment.html" class="ea-t-view-btn">View</a>
          <button class="ea-t-del-btn ea-t-assign-del" data-id="${a.id}">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  attachTeacherAssignmentDelete();
}

// ---- Load Results ----
async function loadTeacherResults(teacherId) {
  const { data: results } = await supabaseClient
    .from('results')
    .select(`
      *,
      students (full_name, class_id, classes (name)),
      subjects (name)
    `)
    .order('created_at', { ascending: false });

  const tbody = document.getElementById('ea-t-results-tbody');
  if (!tbody || !results) return;

  if (results.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:2rem; color:#aaa;">
          No results entered yet.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = results.map(r => {
    const gradeClass = r.grade === 'A' ? 'ea-t-grade-a'
      : r.grade === 'B' ? 'ea-t-grade-b'
      : r.grade === 'C' ? 'ea-t-grade-c'
      : 'ea-t-grade-d';

    return `
      <tr data-class="${r.students?.classes?.name || ''}" data-term="${r.term || ''}">
        <td>${r.students?.full_name || 'N/A'}</td>
        <td>${r.students?.classes?.name || 'N/A'}</td>
        <td>${r.subjects?.name || 'N/A'}</td>
        <td>${r.score}/100</td>
        <td><span class="ea-t-grade ${gradeClass}">${r.grade}</span></td>
        <td>${r.term}</td>
      </tr>
    `;
  }).join('');
}

// ---- Load Attendance ----
async function loadTeacherAttendance(classes) {
  if (!classes || classes.length === 0) return;

  const classIds = classes.map(c => c.id);

  const { data: attendance } = await supabaseClient
    .from('attendance')
    .select(`
      *,
      students (full_name),
      classes (name)
    `)
    .in('class_id', classIds)
    .order('date', { ascending: false })
    .limit(20);

  const tbody = document.getElementById('ea-t-att-tbody');
  if (!tbody || !attendance) return;

  if (attendance.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:2rem; color:#aaa;">
          No attendance records yet.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = attendance.map(a => {
    const statusClass = a.status === 'Present' ? 'ea-t-att-present'
      : a.status === 'Absent' ? 'ea-t-att-absent'
      : 'ea-t-att-late';
    const date = new Date(a.date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return `
      <tr data-class="${a.classes?.name || ''}">
        <td>${a.students?.full_name || 'N/A'}</td>
        <td>${a.classes?.name || 'N/A'}</td>
        <td>${date}</td>
        <td><span class="ea-t-att-status ${statusClass}">${a.status}</span></td>
      </tr>
    `;
  }).join('');
}

// ---- Load Messages ----
async function loadTeacherMessages(teacherId) {
  const { data: messages } = await supabaseClient
    .from('messages')
    .select(`
      *,
      sender:sender_id (full_name)
    `)
    .eq('receiver_id', teacherId)
    .order('created_at', { ascending: false });

  const messagesList = document.querySelector('.ea-t-messages-list');
  if (!messagesList || !messages) return;

  if (messages.length === 0) {
    messagesList.innerHTML = `
      <div style="text-align:center; padding:2rem; color:#aaa;">
        <i class="fas fa-envelope" style="font-size:2rem; display:block; margin-bottom:0.5rem;"></i>
        No messages yet.
      </div>`;
    return;
  }

  messagesList.innerHTML = messages.map(m => {
    const date = new Date(m.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    const unreadClass = !m.is_read ? 'ea-t-msg-unread' : '';
    const badgeClass = !m.is_read ? 'ea-t-badge-unread' : 'ea-t-badge-read';
    const badgeText = !m.is_read ? 'Unread' : 'Read';

    return `
      <div class="ea-t-message-card ${unreadClass}" data-id="${m.id}">
        <div class="ea-t-msg-top">
          <span class="ea-t-msg-sender">${m.sender?.full_name || 'Unknown'}</span>
          <span class="ea-t-msg-time">${date}</span>
        </div>
        <p class="ea-t-msg-body">${m.body}</p>
        <span class="ea-t-msg-badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  }).join('');
}

// ---- Sidebar Navigation ----
const teacherLinks = document.querySelectorAll('.ea-teacher-link');
const teacherSections = document.querySelectorAll('.ea-teacher-section');
const teacherPageTitle = document.getElementById('ea-teacher-page-title');

teacherLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    teacherLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    const title = this.getAttribute('data-title');
    if (title) teacherPageTitle.textContent = title;
    const target = this.getAttribute('data-section');
    teacherSections.forEach(section => {
      section.style.display = section.id === 'section-' + target ? 'block' : 'none';
    });
  });
});

// ---- Logout ----
document.getElementById('ea-teacher-logout').addEventListener('click', async function (e) {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  localStorage.clear();
  window.location.href = 'login.html';
});

// ---- Assignment Filters ----
['ea-t-assign-class', 'ea-t-assign-subject'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', filterTeacherAssignments);
});

function filterTeacherAssignments() {
  const cls = document.getElementById('ea-t-assign-class').value;
  const subject = document.getElementById('ea-t-assign-subject').value;
  document.querySelectorAll('#ea-t-assign-tbody tr').forEach(row => {
    const matchClass = !cls || row.dataset.class === cls;
    const matchSubject = !subject || row.dataset.subject === subject;
    row.style.display = matchClass && matchSubject ? '' : 'none';
  });
}

// ---- Assignment Delete ----
function attachTeacherAssignmentDelete() {
  document.querySelectorAll('.ea-t-assign-del').forEach(btn => {
    btn.onclick = async function () {
      if (confirm('Delete this assignment?')) {
        const id = this.getAttribute('data-id');
        if (id) {
          await supabaseClient.from('assignments').delete().eq('id', id);
        }
        this.closest('tr').remove();
      }
    };
  });
}
attachTeacherAssignmentDelete();

// ---- Results Filters ----
['ea-t-results-class', 'ea-t-results-term'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', filterTeacherResults);
});

function filterTeacherResults() {
  const cls = document.getElementById('ea-t-results-class').value;
  const term = document.getElementById('ea-t-results-term').value;
  document.querySelectorAll('#ea-t-results-tbody tr').forEach(row => {
    const matchClass = !cls || row.dataset.class === cls;
    const matchTerm = !term || row.dataset.term === term;
    row.style.display = matchClass && matchTerm ? '' : 'none';
  });
}

// ---- Attendance Filter ----
const attClassFilter = document.getElementById('ea-t-att-class');
if (attClassFilter) {
  attClassFilter.addEventListener('change', function () {
    const cls = this.value;
    document.querySelectorAll('#ea-t-att-tbody tr').forEach(row => {
      row.style.display = !cls || row.dataset.class === cls ? '' : 'none';
    });
  });
}

// ---- Teacher Notification Bell ----
const tNotifBtn = document.getElementById('ea-t-notif-btn');
const tNotifDropdown = document.getElementById('ea-t-notif-dropdown');
const tNotifBadge = document.getElementById('ea-t-notif-badge');
const tNotifMarkAll = document.getElementById('ea-t-notif-mark-all');
const tUserChip = document.getElementById('ea-t-user-chip');

if (tNotifBtn) {
  tNotifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    tNotifDropdown.classList.toggle('open');
    tNotifBtn.classList.toggle('active');
    if (tUserChip) tUserChip.classList.remove('open');
  });
}

if (tNotifMarkAll) {
  tNotifMarkAll.addEventListener('click', function () {
    tNotifDropdown.querySelectorAll('.ea-notif-unread').forEach(item => {
      item.classList.remove('ea-notif-unread');
    });
    tNotifDropdown.querySelectorAll('.ea-notif-dot').forEach(dot => {
      dot.style.display = 'none';
    });
    tNotifBadge.classList.add('hidden');
  });
}

tNotifDropdown && tNotifDropdown.querySelectorAll('.ea-notif-item').forEach(item => {
  item.addEventListener('click', function () {
    this.classList.remove('ea-notif-unread');
    const dot = this.querySelector('.ea-notif-dot');
    if (dot) dot.style.display = 'none';
    const unreadCount = tNotifDropdown.querySelectorAll('.ea-notif-unread').length;
    tNotifBadge.textContent = unreadCount;
    if (unreadCount === 0) tNotifBadge.classList.add('hidden');
  });
});

// ---- Teacher User Chip ----
if (tUserChip) {
  tUserChip.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('open');
    if (tNotifDropdown) tNotifDropdown.classList.remove('open');
    if (tNotifBtn) tNotifBtn.classList.remove('active');
  });
}

const tLogoutChip = document.getElementById('ea-teacher-logout-chip');
if (tLogoutChip) {
  tLogoutChip.addEventListener('click', async function (e) {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

// ---- Teacher Mobile Sidebar ----
const teacherHamburger = document.getElementById('ea-teacher-hamburger');
const teacherSidebar = document.querySelector('.ea-teacher-sidebar');
const teacherOverlay = document.getElementById('ea-teacher-sidebar-overlay');

function openTeacherSidebar() {
  teacherSidebar.classList.add('open');
  teacherOverlay.classList.add('show');
  teacherHamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTeacherSidebar() {
  teacherSidebar.classList.remove('open');
  teacherOverlay.classList.remove('show');
  teacherHamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (teacherHamburger) {
  teacherHamburger.addEventListener('click', function () {
    teacherSidebar.classList.contains('open') ? closeTeacherSidebar() : openTeacherSidebar();
  });
}

if (teacherOverlay) {
  teacherOverlay.addEventListener('click', closeTeacherSidebar);
}

document.querySelectorAll('.ea-teacher-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeTeacherSidebar();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeTeacherSidebar();
});

document.addEventListener('click', function () {
  if (tNotifDropdown) tNotifDropdown.classList.remove('open');
  if (tNotifBtn) tNotifBtn.classList.remove('active');
  if (tUserChip) tUserChip.classList.remove('open');
});

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

// ---- Teacher Settings ----

// Load profile info
async function loadTeacherProfile() {
  const email = localStorage.getItem('ea-user-email');
  const name = localStorage.getItem('ea-user-name');

  if (name) {
    const nameEl = document.getElementById('ea-t-profile-name');
    if (nameEl) nameEl.textContent = name;
  }

  if (email) {
    const emailEl = document.getElementById('ea-t-profile-email');
    if (emailEl) emailEl.textContent = email;

    const { data } = await supabaseClient
      .from('users')
      .select('staff_id')
      .eq('email', email)
      .single();

    if (data) {
      const staffEl = document.getElementById('ea-t-profile-staffid');
      if (staffEl) staffEl.textContent = data.staff_id || 'Not assigned';
    }
  }
}

// Load profile when settings section opens
document.querySelectorAll('.ea-teacher-link').forEach(link => {
  link.addEventListener('click', function () {
    if (this.getAttribute('data-section') === 'settings') {
      loadTeacherProfile();
    }
  });
});

// Password visibility toggles
document.querySelectorAll('.ea-t-eye-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input) {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      this.querySelector('i').classList.toggle('fa-eye');
      this.querySelector('i').classList.toggle('fa-eye-slash');
    }
  });
});

// Save new password
const savePasswordBtn = document.getElementById('ea-t-save-password');
if (savePasswordBtn) {
  savePasswordBtn.addEventListener('click', async function () {
    const currentPassword = document.getElementById('ea-t-current-password').value.trim();
    const newPassword = document.getElementById('ea-t-new-password').value.trim();
    const confirmPassword = document.getElementById('ea-t-confirm-password').value.trim();
    const errorDiv = document.getElementById('ea-t-settings-error');
    const errorText = document.getElementById('ea-t-settings-error-text');
    const successDiv = document.getElementById('ea-t-settings-success');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      errorText.textContent = 'Please fill in all fields.';
      errorDiv.style.display = 'flex';
      return;
    }

    if (newPassword.length < 6) {
      errorText.textContent = 'New password must be at least 6 characters.';
      errorDiv.style.display = 'flex';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorText.textContent = 'New passwords do not match.';
      errorDiv.style.display = 'flex';
      return;
    }

    const email = localStorage.getItem('ea-user-email');

    // Verify current password
    const { data: teacherData } = await supabaseClient
      .from('users')
      .select('portal_password, id')
      .eq('email', email)
      .single();

    if (!teacherData || teacherData.portal_password !== currentPassword) {
      errorText.textContent = 'Current password is incorrect.';
      errorDiv.style.display = 'flex';
      return;
    }

    // Update password
    const { error } = await supabaseClient
      .from('users')
      .update({ portal_password: newPassword })
      .eq('id', teacherData.id);

    if (error) {
      errorText.textContent = 'Error saving password. Please try again.';
      errorDiv.style.display = 'flex';
      return;
    }

    // Clear fields
    document.getElementById('ea-t-current-password').value = '';
    document.getElementById('ea-t-new-password').value = '';
    document.getElementById('ea-t-confirm-password').value = '';

    successDiv.style.display = 'flex';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
  });
}