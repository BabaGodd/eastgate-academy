// ---- Sidebar Navigation ----
const studentLinks = document.querySelectorAll('.ea-student-link');
const studentSections = document.querySelectorAll('.ea-student-section');
const studentPageTitle = document.getElementById('ea-student-page-title');

function getFirstValue(obj, keys, fallback = '') {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return fallback;
}

function setStudentEmptyState(message) {
  const assignBody = document.getElementById('ea-s-assign-tbody');
  const resultsBody = document.getElementById('ea-s-results-tbody');
  const attendanceBody = document.querySelector('#section-attendance tbody');
  const messagesList = document.querySelector('.ea-s-messages-list');
  const announcementsList = document.querySelector('.ea-s-announcements-list');

  if (assignBody) assignBody.innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
  if (resultsBody) resultsBody.innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
  if (attendanceBody) attendanceBody.innerHTML = `<tr><td colspan="2">${message}</td></tr>`;
  if (messagesList) messagesList.innerHTML = `<div class="ea-s-message-card"><p class="ea-s-msg-body">${message}</p></div>`;
  if (announcementsList) announcementsList.innerHTML = `<div class="ea-s-announcement-card"><p class="ea-s-ann-body">${message}</p></div>`;
}

async function loadStudentDashboardData() {
  const studentId = localStorage.getItem('ea-student-id') || localStorage.getItem('ea-user-id');
  const studentCode = localStorage.getItem('ea-student-code') || '';

  if (!studentId && !studentCode) {
    setStudentEmptyState('No student session found. Please sign in again.');
    return;
  }

  try {
    let studentQuery = supabaseClient.from('students').select('*, classes(name)').limit(1);
    let student = null;

    if (studentId) {
      const { data } = await studentQuery.eq('id', studentId).single();
      student = data;
    }

    if (!student && studentCode) {
      const { data } = await supabaseClient.from('students').select('*, classes(name)').eq('student_code', studentCode).single();
      student = data;
    }

    if (!student) {
      setStudentEmptyState('No student record found in the portal.');
      return;
    }

    const firstName = (student.full_name || 'Student').split(' ')[0];
    if (studentPageTitle) studentPageTitle.textContent = `Welcome, ${firstName}`;
    const avatar = document.querySelector('.ea-s-user-avatar');
    const userName = document.querySelector('.ea-user-name');
    const userRole = document.querySelector('.ea-user-role');
    if (avatar) avatar.textContent = (student.full_name || 'S').charAt(0).toUpperCase();
    if (userName) userName.textContent = student.full_name || 'Student';
    if (userRole) userRole.textContent = 'Student';

    const classNameEl = document.querySelector('#section-dashboard .ea-s-stat-card:nth-child(1) .ea-s-stat-value');
    if (classNameEl) classNameEl.textContent = student.classes?.name || '—';

    const assignmentsTable = document.getElementById('ea-s-assign-tbody');
    let assignments = [];
    const assignmentQuery = supabaseClient.from('assignments').select('*');
    const { data: assignmentData } = await assignmentQuery.eq('student_id', student.id).order('created_at', { ascending: false });
    assignments = assignmentData || [];

    if (!assignments.length && student.class_id) {
      const { data: classAssignments } = await supabaseClient.from('assignments').select('*').eq('class_id', student.class_id).order('created_at', { ascending: false });
      assignments = classAssignments || [];
    }

    if (assignmentsTable) {
      if (assignments.length) {
        assignmentsTable.innerHTML = assignments.map(item => {
          const title = getFirstValue(item, ['title', 'name', 'assignment_title', 'assignment_name'], 'Untitled');
          const subject = getFirstValue(item, ['subject', 'subject_name', 'subject_title'], 'General');
          const dueDate = getFirstValue(item, ['due_date', 'due_at', 'deadline', 'date'], 'TBD');
          const status = getFirstValue(item, ['status', 'assignment_status'], 'Pending');
          return `
            <tr>
              <td>${title}</td>
              <td>${subject}</td>
              <td>${dueDate}</td>
              <td><span class="ea-s-status ea-s-status-${status.toLowerCase().replace(/\s+/g, '-') || 'pending'}">${status}</span></td>
              <td><a href="view-assignment.html" class="ea-s-view-btn">View</a></td>
            </tr>`;
        }).join('');
      } else {
        assignmentsTable.innerHTML = '<tr><td colspan="5">No assignments available yet.</td></tr>';
      }
    }

    const resultsBody = document.getElementById('ea-s-results-tbody');
    let results = [];
    const { data: resultsData } = await supabaseClient.from('results').select('*').eq('student_id', student.id).order('created_at', { ascending: false });
    results = resultsData || [];

    if (!results.length && student.student_code) {
      const { data: codeResults } = await supabaseClient.from('results').select('*').eq('student_code', student.student_code).order('created_at', { ascending: false });
      results = codeResults || [];
    }

    if (resultsBody) {
      if (results.length) {
        resultsBody.innerHTML = results.map(item => {
          const subject = getFirstValue(item, ['subject', 'subject_name', 'title', 'name'], 'General');
          const score = getFirstValue(item, ['score', 'marks', 'total_score'], '—');
          const grade = getFirstValue(item, ['grade', 'letter_grade'], '—');
          const term = getFirstValue(item, ['term', 'exam_term'], '—');
          const remark = getFirstValue(item, ['remark', 'comment'], '—');
          return `
            <tr>
              <td>${subject}</td>
              <td>${score}</td>
              <td><span class="ea-s-grade">${grade}</span></td>
              <td>${term}</td>
              <td>${remark}</td>
            </tr>`;
        }).join('');
      } else {
        resultsBody.innerHTML = '<tr><td colspan="5">No results available yet.</td></tr>';
      }
    }

    const attendanceBody = document.querySelector('#section-attendance tbody');
    let attendance = [];
    const { data: attendanceData } = await supabaseClient.from('attendance').select('*').eq('student_id', student.id).order('date', { ascending: false });
    attendance = attendanceData || [];

    if (!attendance.length && student.student_code) {
      const { data: studentAttendance } = await supabaseClient.from('attendance').select('*').eq('student_code', student.student_code).order('date', { ascending: false });
      attendance = studentAttendance || [];
    }

    if (attendanceBody) {
      if (attendance.length) {
        attendanceBody.innerHTML = attendance.map(item => {
          const date = getFirstValue(item, ['date', 'attendance_date', 'created_at'], '—');
          const status = getFirstValue(item, ['status', 'attendance_status'], 'Unknown');
          return `<tr><td>${date}</td><td><span class="ea-s-att-status">${status}</span></td></tr>`;
        }).join('');
      } else {
        attendanceBody.innerHTML = '<tr><td colspan="2">No attendance records yet.</td></tr>';
      }
    }

    const messagesList = document.querySelector('.ea-s-messages-list');
    let messages = [];
    const { data: messageData } = await supabaseClient.from('messages').select('*').eq('student_id', student.id).order('created_at', { ascending: false });
    messages = messageData || [];

    if (!messages.length) {
      const { data: fallbackMessages } = await supabaseClient.from('messages').select('*').order('created_at', { ascending: false }).limit(5);
      messages = fallbackMessages || [];
    }

    if (messagesList) {
      if (messages.length) {
        messagesList.innerHTML = messages.map(item => {
          const sender = getFirstValue(item, ['sender', 'sender_name', 'sender_role'], 'School');
          const content = getFirstValue(item, ['content', 'message', 'body'], 'No content');
          const time = getFirstValue(item, ['created_at', 'sent_at'], '');
          return `<div class="ea-s-message-card"><div class="ea-s-msg-top"><span class="ea-s-msg-sender">${sender}</span><span class="ea-s-msg-time">${time}</span></div><p class="ea-s-msg-body">${content}</p></div>`;
        }).join('');
      } else {
        messagesList.innerHTML = '<div class="ea-s-message-card"><p class="ea-s-msg-body">No messages yet.</p></div>';
      }
    }

    const notifBadge = document.getElementById('ea-s-notif-badge');
    if (notifBadge) notifBadge.textContent = messages.length ? messages.length : '0';
  } catch (error) {
    console.error('Student dashboard load error:', error);
    setStudentEmptyState('Unable to load data right now.');
  }
}

loadStudentDashboardData();

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