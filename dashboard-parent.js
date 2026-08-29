// ---- Loading Skeletons ----
function showDashboardSkeleton() {
  const statsGrid = document.querySelector('.ea-p-stats-grid');
  const childCard = document.querySelector('.ea-p-child-card');
  const announcementsList = document.querySelector('.ea-p-announcements-list');

  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="ea-sk-banner" style="grid-column: 1/-1;">
        <span class="ea-sk-pulse-dot"></span>
        <p class="ea-sk-banner-text">Loading your dashboard data...</p>
      </div>
      <div class="ea-sk-stat-card">
        <div class="ea-sk" style="height:11px; width:75%; margin-bottom:10px;"></div>
        <div class="ea-sk-dark" style="height:26px; width:45%;"></div>
      </div>
      <div class="ea-sk-stat-card">
        <div class="ea-sk" style="height:11px; width:75%; margin-bottom:10px;"></div>
        <div class="ea-sk-dark" style="height:26px; width:45%;"></div>
      </div>
      <div class="ea-sk-stat-card">
        <div class="ea-sk" style="height:11px; width:75%; margin-bottom:10px;"></div>
        <div class="ea-sk-dark" style="height:26px; width:45%;"></div>
      </div>
      <div class="ea-sk-stat-card">
        <div class="ea-sk" style="height:11px; width:75%; margin-bottom:10px;"></div>
        <div class="ea-sk-dark" style="height:26px; width:45%;"></div>
      </div>
    `;
  }

  if (childCard) {
    childCard.innerHTML = `
      <div class="ea-sk-child">
        <div class="ea-sk-dark" style="width:56px; height:56px; border-radius:50%; flex-shrink:0;"></div>
        <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
          <div class="ea-sk-dark" style="height:16px; width:45%;"></div>
          <div class="ea-sk" style="height:11px; width:65%;"></div>
          <div class="ea-sk" style="height:11px; width:50%;"></div>
        </div>
      </div>
    `;
  }

  if (announcementsList) {
    announcementsList.innerHTML = `
      <div class="ea-sk-ann">
        <div class="ea-sk-dark" style="height:13px; width:55%; margin-bottom:8px;"></div>
        <div class="ea-sk" style="height:10px; width:30%; margin-bottom:8px;"></div>
        <div class="ea-sk" style="height:10px; width:90%; margin-bottom:5px;"></div>
        <div class="ea-sk" style="height:10px; width:70%;"></div>
      </div>
      <div class="ea-sk-ann">
        <div class="ea-sk-dark" style="height:13px; width:45%; margin-bottom:8px;"></div>
        <div class="ea-sk" style="height:10px; width:30%; margin-bottom:8px;"></div>
        <div class="ea-sk" style="height:10px; width:85%; margin-bottom:5px;"></div>
        <div class="ea-sk" style="height:10px; width:65%;"></div>
      </div>
    `;
  }
}

function showResultsSkeleton() {
  const tbody = document.getElementById('ea-p-results-tbody');
  if (!tbody) return;
  tbody.innerHTML = Array(5).fill(`
    <tr>
      <td><div class="ea-sk" style="height:11px; width:80%;"></div></td>
      <td><div class="ea-sk" style="height:11px; width:60%;"></div></td>
      <td><div class="ea-sk" style="height:11px; width:60%;"></div></td>
      <td><div class="ea-sk" style="height:11px; width:60%;"></div></td>
      <td><div class="ea-sk" style="height:11px; width:70%;"></div></td>
    </tr>
  `).join('');
}

function showAttendanceSkeleton() {
  const rows = document.querySelectorAll('#section-attendance tbody tr');
  rows.forEach(row => {
    row.innerHTML = `
      <td><div class="ea-sk" style="height:11px; width:80%;"></div></td>
      <td><div class="ea-sk" style="height:11px; width:60%;"></div></td>
    `;
  });
}

function isPortalSessionActive() {
  return localStorage.getItem('ea-authenticated') === 'true';
}

// ---- Check Auth & Load User ----
async function checkParentAuth() {
  showDashboardSkeleton();

  const storedRole = localStorage.getItem('ea-user-role');
  const storedName = localStorage.getItem('ea-user-name');

  if (isPortalSessionActive() && storedRole === 'parent') {
    const pageTitle = document.getElementById('ea-parent-page-title');
    const userName = document.querySelector('.ea-user-name');
    const userAvatar = document.querySelector('.ea-user-avatar');
    const firstName = (storedName || 'Parent').split(' ')[0];

    if (pageTitle) pageTitle.textContent = `Welcome, ${firstName}`;
    if (userName) userName.textContent = storedName || 'Parent';
    if (userAvatar) userAvatar.textContent = (storedName || 'P').charAt(0).toUpperCase();

    const storedParentId = localStorage.getItem('ea-user-id');
    const storedStudentId = localStorage.getItem('ea-student-id');
    if (storedParentId || storedStudentId) {
      loadParentData(storedParentId, storedStudentId);
      return;
    }
  }

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const { data: userData } = await supabaseClient
    .from('users')
    .select('full_name, role, id')
    .eq('email', user.email)
    .single();

  if (!userData || userData.role !== 'parent') {
    window.location.href = 'login.html';
    return;
  }

 

  // Update UI with real user name
  const pageTitle = document.getElementById('ea-parent-page-title');
  const userName = document.querySelector('.ea-user-name');
  const userAvatar = document.querySelector('.ea-user-avatar');
  const firstName = userData.full_name.split(' ')[0];

  if (pageTitle) pageTitle.textContent = `Welcome, ${firstName}`;
  if (userName) userName.textContent = userData.full_name;
  if (userAvatar) userAvatar.textContent = userData.full_name.charAt(0).toUpperCase();

  localStorage.setItem('ea-user-name', userData.full_name);
  localStorage.setItem('ea-user-role', userData.role);
  localStorage.setItem('ea-user-id', userData.id);
  localStorage.setItem('ea-user-email', user.email);

  // Load parent specific data
  loadParentData(userData.id);
}

checkParentAuth();

let currentParentChild = null;

async function resolveEffectiveParentName(studentId = localStorage.getItem('ea-student-id')) {
  const sessionParentId = localStorage.getItem('ea-user-id');
  const fallbackName = localStorage.getItem('ea-parent-name') || localStorage.getItem('ea-user-name') || 'Parent';

  try {
    if (studentId) {
      const { data: studentRecord, error: studentError } = await supabaseClient
        .from('students')
        .select('parent_id, student_code')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError && studentError.code !== 'PGRST116') {
        console.warn('Student parent lookup warning:', studentError);
      }

      if (studentRecord?.parent_id) {
        const { data: parentRecord, error: parentError } = await supabaseClient
          .from('users')
          .select('full_name, id, role')
          .eq('id', studentRecord.parent_id)
          .eq('role', 'parent')
          .maybeSingle();

        if (parentError && parentError.code !== 'PGRST116') {
          console.warn('Parent lookup warning:', parentError);
        }

        if (parentRecord?.full_name) {
          localStorage.setItem('ea-parent-name', parentRecord.full_name);
          localStorage.setItem('ea-user-name', parentRecord.full_name);
          return parentRecord.full_name;
        }
      }
    }

    if (sessionParentId) {
      const { data: userRecord, error: userError } = await supabaseClient
        .from('users')
        .select('full_name, id, role')
        .eq('id', sessionParentId)
        .eq('role', 'parent')
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.warn('Stored parent lookup warning:', userError);
      }

      if (userRecord?.full_name) {
        localStorage.setItem('ea-parent-name', userRecord.full_name);
        localStorage.setItem('ea-user-name', userRecord.full_name);
        return userRecord.full_name;
      }
    }

    const studentCode = localStorage.getItem('ea-student-code');
    if (studentCode) {
      const { data: studentByCode, error: studentCodeError } = await supabaseClient
        .from('students')
        .select('parent_id')
        .eq('student_code', studentCode)
        .maybeSingle();

      if (studentCodeError && studentCodeError.code !== 'PGRST116') {
        console.warn('Student-code parent lookup warning:', studentCodeError);
      }

      if (studentByCode?.parent_id) {
        const { data: parentRecord, error: parentError } = await supabaseClient
          .from('users')
          .select('full_name')
          .eq('id', studentByCode.parent_id)
          .eq('role', 'parent')
          .maybeSingle();

        if (parentRecord?.full_name) {
          localStorage.setItem('ea-parent-name', parentRecord.full_name);
          localStorage.setItem('ea-user-name', parentRecord.full_name);
          return parentRecord.full_name;
        }
      }
    }

    if (fallbackName && fallbackName !== 'Parent') {
      localStorage.setItem('ea-parent-name', fallbackName);
      return fallbackName;
    }

    return 'Parent';
  } catch (error) {
    console.warn('Parent name resolution failed:', error);
    return fallbackName || 'Parent';
  }
}

async function resolveEffectiveClassTeacher(studentId = localStorage.getItem('ea-student-id')) {
  const fallbackName = localStorage.getItem('ea-class-teacher') || 'Not assigned';

  try {
    if (!studentId) return fallbackName;

    const { data: studentRecord, error: studentError } = await supabaseClient
      .from('students')
      .select('class_id')
      .eq('id', studentId)
      .maybeSingle();

    if (studentError && studentError.code !== 'PGRST116') {
      console.warn('Student class lookup warning:', studentError);
    }

    if (studentRecord?.class_id) {
      const { data: classRecord, error: classError } = await supabaseClient
        .from('classes')
        .select('teacher_id')
        .eq('id', studentRecord.class_id)
        .maybeSingle();

      if (classError && classError.code !== 'PGRST116') {
        console.warn('Class teacher lookup warning:', classError);
      }

      if (classRecord?.teacher_id) {
        const { data: teacherRecord, error: teacherError } = await supabaseClient
          .from('users')
          .select('full_name')
          .eq('id', classRecord.teacher_id)
          .maybeSingle();

        if (teacherError && teacherError.code !== 'PGRST116') {
          console.warn('Teacher lookup warning:', teacherError);
        }

        if (teacherRecord?.full_name) {
          localStorage.setItem('ea-class-teacher', teacherRecord.full_name);
          return teacherRecord.full_name;
        }
      }
    }

    if (fallbackName && fallbackName !== 'Not assigned') {
      localStorage.setItem('ea-class-teacher', fallbackName);
      return fallbackName;
    }

    return 'Not assigned';
  } catch (error) {
    console.warn('Teacher name resolution failed:', error);
    return fallbackName || 'Not assigned';
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderFeesSummary(child) {
  const summaryEl = document.getElementById('ea-fees-student-summary');

  const studentName = child?.full_name || localStorage.getItem('ea-student-name') || 'Student Name';
  const studentCode = child?.student_code || localStorage.getItem('ea-student-code') || 'N/A';
  const className = child?.classes?.name || 'N/A';
  const initials = (studentName || 'Student')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'ST';

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="ea-fees-profile-card">
        <div class="ea-fees-profile-badge">${escapeHtml(initials)}</div>
        <div class="ea-fees-profile-meta">
          <div class="ea-fees-profile-name">${escapeHtml(studentName)}</div>
          <div class="ea-fees-profile-subtitle">Fee account ready</div>
          <div class="ea-fees-profile-tags">
            <span class="ea-fees-tag"><i class="fas fa-id-card"></i> ID ${escapeHtml(studentCode)}</span>
            <span class="ea-fees-tag"><i class="fas fa-school"></i> Class ${escapeHtml(className)}</span>
          </div>
        </div>
      </div>
    `;
  }
}

async function resolveLinkedStudentRecord(parentId = null, studentId = null) {
  const storedStudentId = studentId || localStorage.getItem('ea-student-id');
  const storedStudentCode = localStorage.getItem('ea-student-code');
  const storedParentId = parentId || localStorage.getItem('ea-user-id');
  const storedUserEmail = localStorage.getItem('ea-user-email');

  const studentQuery = '*, classes (name, teacher_id, users (full_name))';

  if (storedStudentId) {
    const { data: childById, error: childIdError } = await supabaseClient
      .from('students')
      .select(studentQuery)
      .eq('id', storedStudentId)
      .maybeSingle();

    if (childIdError && childIdError.code !== 'PGRST116') {
      console.warn('Student ID lookup warning:', childIdError);
    }

    if (childById) return childById;
  }

  if (storedStudentCode) {
    const { data: childByCode, error: childCodeError } = await supabaseClient
      .from('students')
      .select(studentQuery)
      .eq('student_code', storedStudentCode)
      .maybeSingle();

    if (childCodeError && childCodeError.code !== 'PGRST116') {
      console.warn('Student-code lookup warning:', childCodeError);
    }

    if (childByCode) return childByCode;
  }

  if (storedParentId) {
    const { data: childByParent, error: parentChildError } = await supabaseClient
      .from('students')
      .select(studentQuery)
      .eq('parent_id', storedParentId)
      .limit(1)
      .maybeSingle();

    if (parentChildError && parentChildError.code !== 'PGRST116') {
      console.warn('Parent-child lookup warning:', parentChildError);
    }

    if (childByParent) return childByParent;
  }

  if (storedUserEmail) {
    const { data: parentRecord, error: parentLookupError } = await supabaseClient
      .from('users')
      .select('id, full_name, email, role')
      .eq('email', storedUserEmail)
      .eq('role', 'parent')
      .maybeSingle();

    if (parentLookupError && parentLookupError.code !== 'PGRST116') {
      console.warn('User email parent lookup warning:', parentLookupError);
    }

    if (parentRecord?.id) {
      const { data: childByUser, error: userChildError } = await supabaseClient
        .from('students')
        .select(studentQuery)
        .eq('parent_id', parentRecord.id)
        .limit(1)
        .maybeSingle();

      if (userChildError && userChildError.code !== 'PGRST116') {
        console.warn('Parent email lookup student warning:', userChildError);
      }

      if (childByUser) return childByUser;
    }
  }

  return null;
}

// ---- Load Parent Data ----
async function loadParentData(parentId, studentId = null) {
  const child = await resolveLinkedStudentRecord(parentId, studentId);

  if (!child) {
    const statsGrid = document.querySelector('.ea-p-stats-grid');
    const childCard = document.querySelector('.ea-p-child-card');

    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="ea-p-stat-card ea-p-purple">
          <p class="ea-p-stat-label">Child's Class</p>
          <p class="ea-p-stat-value">—</p>
        </div>
        <div class="ea-p-stat-card ea-p-green">
          <p class="ea-p-stat-label">Average Grade</p>
          <p class="ea-p-stat-value">—</p>
        </div>
        <div class="ea-p-stat-card ea-p-blue">
          <p class="ea-p-stat-label">Attendance Rate</p>
          <p class="ea-p-stat-value">—</p>
        </div>
        <div class="ea-p-stat-card ea-p-orange">
          <p class="ea-p-stat-label">Fees Status</p>
          <p class="ea-p-stat-value ea-p-fees-due">Pending</p>
        </div>
      `;
    }

    if (childCard) {
      childCard.innerHTML = `
        <div class="ea-p-child-avatar">—</div>
        <div class="ea-p-child-info">
          <p class="ea-p-child-name">No linked student found</p>
          <p class="ea-p-child-detail">Please contact the school to link your account.</p>
        </div>
      `;
    }

    loadParentAnnouncements(null);
    return;
  }

  currentParentChild = child;
  localStorage.setItem('ea-student-id', child.id);
  localStorage.setItem('ea-student-name', child.full_name);
  localStorage.setItem('ea-student-code', child.student_code || 'N/A');

  let parentName = 'Parent';

  if (child.parent_id) {
    const { data: parentRecord, error: parentError } = await supabaseClient
      .from('users')
      .select('full_name')
      .eq('id', child.parent_id)
      .eq('role', 'parent')
      .maybeSingle();

    if (parentError && parentError.code !== 'PGRST116') {
      console.warn('Linked parent lookup warning:', parentError);
    }

    if (parentRecord?.full_name) {
      parentName = parentRecord.full_name;
    }
  }

  if (!parentName || parentName === 'Parent') {
    parentName = await resolveEffectiveParentName(child.id);
  }

  localStorage.setItem('ea-parent-name', parentName);
  localStorage.setItem('ea-user-name', parentName);

  const resolvedTeacherName = await resolveEffectiveClassTeacher(child.id);
  localStorage.setItem('ea-class-teacher', resolvedTeacherName);

  renderFeesSummary(child);

  const initials = (child.full_name || 'Student')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'ST';

  // ---- Rebuild the Child's Overview card with real data ----
  const childCard = document.querySelector('.ea-p-child-card');
  if (childCard) {
    childCard.innerHTML = `
      <div class="ea-p-child-avatar">${escapeHtml(initials)}</div>
      <div class="ea-p-child-info">
        <p class="ea-p-child-name">${escapeHtml(child.full_name)}</p>
        <p class="ea-p-child-detail">${escapeHtml(child.classes?.name || 'N/A')} &nbsp;|&nbsp; Student ID: ${escapeHtml(child.student_code || 'N/A')}</p>
        <p class="ea-p-child-detail">Class Teacher: ${escapeHtml(child.classes?.users?.full_name || 'N/A')}</p>
      </div>
    `;
  }

  // ---- Rebuild the stat cards with real data ----
  const statsGrid = document.querySelector('.ea-p-stats-grid');
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="ea-p-stat-card ea-p-purple">
        <p class="ea-p-stat-label">Child's Class</p>
        <p class="ea-p-stat-value">${escapeHtml(child.classes?.name || 'N/A')}</p>
      </div>
      <div class="ea-p-stat-card ea-p-green">
        <p class="ea-p-stat-label">Average Grade</p>
        <p class="ea-p-stat-value">—</p>
      </div>
      <div class="ea-p-stat-card ea-p-blue">
        <p class="ea-p-stat-label">Attendance Rate</p>
        <p class="ea-p-stat-value">—</p>
      </div>
      <div class="ea-p-stat-card ea-p-orange">
        <p class="ea-p-stat-label">Fees Status</p>
        <p class="ea-p-stat-value ea-p-fees-due">Pending</p>
      </div>
    `;
  }

  showResultsSkeleton();
  loadChildResults(child.id);

  showAttendanceSkeleton();
  loadChildAttendance(child.id, child.class_id);

  loadChildFees(child.id);
  loadParentMessages(parentId);

  // Load announcements — school-wide ones plus any targeted at this child's class
  loadParentAnnouncements(child.class_id);
}


// ---- Load Child Results ----
// NOTE: Only published results are shown to parents. Results a teacher has
// entered but admin has not yet approved/published stay hidden here.
async function loadChildResults(studentId) {
  const { data: results, error } = await supabaseClient
    .from('results')
    .select(`*, subjects (name)`)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Parent results load error:', error);
    const tbody = document.getElementById('ea-p-results-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:2rem; color:#c62828;">
            Unable to load results right now.
          </td>
        </tr>`;
    }
    return;
  }

  const visibleResults = (results || []).filter(r => r.published === true || r.published === null || r.published === undefined);

  allReportRows = visibleResults.map(r => [
    r.subjects?.name || 'N/A',
    `${r.score}/100`,
    r.grade || '—',
    r.term || '—',
    r.remark || 'N/A'
  ]);

  const termSelect = document.getElementById('ea-p-results-term');
  if (termSelect && !termSelect.value && allReportRows.length) {
    const knownTerms = [...new Set(allReportRows.map(row => String(row[3] || '').trim()).filter(Boolean))];
    if (knownTerms.length) {
      termSelect.value = knownTerms[0];
    }
  }

  const tbody = document.getElementById('ea-p-results-tbody');
  if (!tbody) return;

  if (visibleResults.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:2rem; color:#aaa;">
          No results available yet.
        </td>
      </tr>`;
    return;
  }

  const scores = visibleResults.map(r => r.score).filter(value => value !== null && value !== undefined && value !== '');
  const avg = scores.length > 0 ? (scores.reduce((a, b) => Number(a) + Number(b), 0) / scores.length).toFixed(1) : 0;
  const avgDisplay = Number(avg) >= 80 ? 'A' : Number(avg) >= 70 ? 'B+' : Number(avg) >= 60 ? 'B' : 'C';

  const statValues = document.querySelectorAll('.ea-p-stat-value');
  if (statValues[1]) statValues[1].textContent = avgDisplay;

  tbody.innerHTML = visibleResults.map(r => {
    const gradeClass = r.grade === 'A' ? 'ea-p-grade-a'
      : r.grade === 'B' ? 'ea-p-grade-b'
      : r.grade === 'C' ? 'ea-p-grade-c'
      : 'ea-p-grade-d';

    return `
      <tr data-term="${r.term || ''}">
        <td>${r.subjects?.name || 'N/A'}</td>
        <td>${r.score}/100</td>
        <td><span class="ea-p-grade ${gradeClass}">${r.grade}</span></td>
        <td>${r.term}</td>
        <td>${r.remark || 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

// ---- Load Child Attendance ----
async function loadChildAttendance(studentId, classId) {
  const { data: attendance } = await supabaseClient
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false });

  if (!attendance) return;

  const present = attendance.filter(a => a.status === 'Present').length;
  const absent = attendance.filter(a => a.status === 'Absent').length;
  const late = attendance.filter(a => a.status === 'Late').length;
  const total = attendance.length;

  const attCounts = document.querySelectorAll('.ea-p-att-count');
  if (attCounts[0]) attCounts[0].textContent = present;
  if (attCounts[1]) attCounts[1].textContent = absent;
  if (attCounts[2]) attCounts[2].textContent = late;

  const statValues = document.querySelectorAll('.ea-p-stat-value');
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  if (statValues[2]) statValues[2].textContent = rate + '%';

  const tables = document.querySelectorAll('.ea-p-table');
  if (tables.length < 1) return;

  const attTable = tables[0].querySelector('tbody');
  if (!attTable) return;

  if (attendance.length === 0) {
    attTable.innerHTML = `
      <tr>
        <td colspan="2" style="text-align:center; padding:2rem; color:#aaa;">
          No attendance records yet.
        </td>
      </tr>`;
    return;
  }

  attTable.innerHTML = attendance.slice(0, 10).map(a => {
    const statusClass = a.status === 'Present' ? 'ea-p-att-p'
      : a.status === 'Absent' ? 'ea-p-att-a'
      : 'ea-p-att-l';
    const date = new Date(a.date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return `
      <tr>
        <td>${date}</td>
        <td><span class="ea-p-att-status ${statusClass}">${a.status}</span></td>
      </tr>
    `;
  }).join('');
}

// ---- Load Fees ----
async function loadChildFees(studentId) {
  const { data: fees } = await supabaseClient
    .from('fees')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (!fees) return;

  const statValues = document.querySelectorAll('.ea-p-stat-value');
  const latestFee = fees[0];
  if (latestFee && statValues[3]) {
    const feeStatus = document.querySelector('.ea-p-fees-due');
    if (feeStatus) {
      feeStatus.textContent = latestFee.status;
      if (latestFee.status === 'Paid') {
        feeStatus.style.color = '#388E3C';
        feeStatus.classList.remove('ea-p-fees-due');
      }
    }
  }

  const payHistoryTbody = document.getElementById('ea-p-payment-history');
  if (!payHistoryTbody || fees.length === 0) return;

  payHistoryTbody.innerHTML = fees.map(f => {
    const date = f.paid_at
      ? new Date(f.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Pending';
    const statusClass = f.status === 'Paid' ? 'ea-p-pay-success' : 'ea-p-pay-pending';

    return `
      <tr>
        <td>${date}</td>
        <td>${f.term} ${f.academic_year}</td>
        <td>GHS ${parseFloat(f.amount).toFixed(2)}</td>
        <td>${f.payment_method || 'N/A'}</td>
        <td>${f.payment_reference || 'N/A'}</td>
        <td><span class="ea-p-pay-status ${statusClass}">${f.status}</span></td>
      </tr>
    `;
  }).join('');
}

// ---- Load Parent Messages ----
async function loadParentMessages(parentId) {
  const { data: messages } = await supabaseClient
    .from('messages')
    .select(`*, sender:sender_id (full_name)`)
    .eq('receiver_id', parentId)
    .order('created_at', { ascending: false });

  const messagesList = document.querySelector('.ea-p-messages-list');
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
    const unreadClass = !m.is_read ? 'ea-p-msg-unread' : '';
    const badgeClass = !m.is_read ? 'ea-p-badge-unread' : 'ea-p-badge-read';
    const badgeText = !m.is_read ? 'Unread' : 'Read';

    return `
      <div class="ea-p-message-card ${unreadClass}">
        <div class="ea-p-msg-top">
          <span class="ea-p-msg-sender">${m.sender?.full_name || 'Unknown'}</span>
          <span class="ea-p-msg-time">${date}</span>
        </div>
        <p class="ea-p-msg-body">${m.body}</p>
        <span class="ea-p-msg-badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  }).join('');
}

// ---- Load Announcements ----
// Shows school-wide announcements (class_id is null) plus any announcement
// targeted specifically at this child's class.
async function loadParentAnnouncements(classId) {
  const annList = document.querySelector('.ea-p-announcements-list');
  if (!annList) return;

  let query = supabaseClient
    .from('announcements')
    .select('*, classes(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  query = classId
    ? query.or(`class_id.is.null,class_id.eq.${classId}`)
    : query.is('class_id', null);

  const { data: announcements, error } = await query;

  if (error) {
    console.error('Error loading announcements:', error);
    annList.innerHTML = `
      <div style="text-align:center; padding:1rem; color:#c62828;">
        Error loading announcements.
      </div>`;
    return;
  }

  if (!announcements || announcements.length === 0) {
    annList.innerHTML = `
      <div style="text-align:center; padding:1rem; color:#aaa;">
        No announcements yet.
      </div>`;
    return;
  }

  annList.innerHTML = announcements.map(a => {
    const date = new Date(a.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const audienceLabel = a.class_id
      ? `${a.classes?.name || 'Your class'}`
      : 'School-wide';
    const audienceColor = a.class_id ? '#1976D2' : '#7A1E0A';

    return `
      <div class="ea-p-announcement-card">
        <div class="ea-p-ann-top">
          <p class="ea-p-ann-title">${a.title}</p>
          <span class="ea-p-ann-date">${date}</span>
        </div>
        <span style="display:inline-block; background:${audienceColor}15; color:${audienceColor}; font-size:0.72rem; font-weight:700; padding:2px 9px; border-radius:20px; margin-bottom:6px;">
          ${audienceLabel}
        </span>
        <p class="ea-p-ann-body">${a.body}</p>
      </div>
    `;
  }).join('');
}

// ---- Change Parent Password ----
async function changeParentPassword(studentId, newPassword, confirmPassword) {
  const successEl = document.getElementById('ea-parent-pwd-success');
  const errorEl = document.getElementById('ea-parent-pwd-error');

  if (successEl) successEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  if (!newPassword) {
    if (errorEl) {
      errorEl.textContent = 'Please enter a new password.';
      errorEl.style.display = 'block';
    }
    return;
  }

  if (newPassword.length < 6) {
    if (errorEl) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      errorEl.style.display = 'block';
    }
    return;
  }

  if (newPassword !== confirmPassword) {
    if (errorEl) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.style.display = 'block';
    }
    return;
  }

  const { error } = await supabaseClient
    .from('students')
    .update({ family_name: newPassword })
    .eq('id', studentId);

  if (error) {
    if (errorEl) {
      errorEl.textContent = 'Something went wrong. Please try again.';
      errorEl.style.display = 'block';
    }
    return;
  }

  if (successEl) {
    successEl.textContent = '✅ Password changed successfully! Use your new password next time you log in.';
    successEl.style.display = 'block';
  }

  const newPwdInput = document.getElementById('ea-new-parent-pwd');
  const confirmPwdInput = document.getElementById('ea-confirm-parent-pwd');
  if (newPwdInput) newPwdInput.value = '';
  if (confirmPwdInput) confirmPwdInput.value = '';
}

// ---- Attach password change listener ----
document.getElementById('ea-change-parent-pwd-btn')?.addEventListener('click', function () {
  const studentId = sessionStorage.getItem('ea-student-id') || localStorage.getItem('ea-student-id');
  const newPassword = document.getElementById('ea-new-parent-pwd')?.value.trim() || '';
  const confirmPassword = document.getElementById('ea-confirm-parent-pwd')?.value.trim() || '';
  changeParentPassword(studentId, newPassword, confirmPassword);
});

// ---- Sidebar Navigation ----
const parentLinks = document.querySelectorAll('.ea-parent-link');
const parentSections = document.querySelectorAll('.ea-parent-section');
const parentPageTitle = document.getElementById('ea-parent-page-title');

parentLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    parentLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    const title = this.getAttribute('data-title');
    if (title) parentPageTitle.textContent = title;
    const target = this.getAttribute('data-section');
    parentSections.forEach(section => {
      section.style.display = section.id === 'section-' + target ? 'block' : 'none';
    });

    if (target === 'fees') {
      renderFeesSummary(currentParentChild);
    }
  });
});

// ---- Logout ----
document.getElementById('ea-parent-logout').addEventListener('click', async function (e) {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  localStorage.clear();
  window.location.href = 'login.html';
});

// ---- Results Filter ----
const parentResultsTerm = document.getElementById('ea-p-results-term');
if (parentResultsTerm) {
  parentResultsTerm.addEventListener('change', function () {
    const term = this.value;
    document.querySelectorAll('#ea-p-results-tbody tr').forEach(row => {
      row.style.display = !term || row.dataset.term === term ? '' : 'none';
    });

    if (document.getElementById('ea-report-preview-overlay')?.style.display !== 'none') {
      openReportPreview();
    }
  });
}

// ---- Mobile Money Payment ----
let selectedNetwork = '';

document.querySelectorAll('.ea-p-network-card').forEach(card => {
  card.addEventListener('click', function () {
    document.querySelectorAll('.ea-p-network-card').forEach(c => c.classList.remove('selected'));
    this.classList.add('selected');
    selectedNetwork = this.getAttribute('data-network');
    document.getElementById('ea-p-selected-network').value = selectedNetwork + ' Mobile Money';
    document.getElementById('ea-p-payment-form').style.display = 'block';
    document.getElementById('ea-p-payment-form').scrollIntoView({ behavior: 'smooth' });
  });
});

document.getElementById('ea-p-cancel-payment').addEventListener('click', function () {
  document.getElementById('ea-p-payment-form').style.display = 'none';
  document.querySelectorAll('.ea-p-network-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('ea-p-momo-number').value = '';
  document.getElementById('ea-p-momo-name').value = '';
  selectedNetwork = '';
});

document.getElementById('ea-p-pay-btn').addEventListener('click', async function () {
  const number = document.getElementById('ea-p-momo-number').value.trim();
  const name = document.getElementById('ea-p-momo-name').value.trim();

  if (!number || number.length < 10) {
    alert('Please enter a valid 10-digit mobile money number.');
    return;
  }

  if (!name) {
    alert('Please enter the account name.');
    return;
  }

  this.textContent = 'Processing...';
  this.disabled = true;

  const ref = 'EA-TXN-' + Math.floor(Math.random() * 90000 + 10000);
  const today = new Date();

  const studentId = localStorage.getItem('ea-student-id');
  if (studentId) {
    await supabaseClient.from('fees').insert({
      student_id: studentId,
      term: 'Term 2',
      academic_year: '2026',
      amount: 850.00,
      status: 'Paid',
      payment_method: selectedNetwork + ' MoMo',
      payment_reference: ref,
      paid_at: today.toISOString()
    });
  }

  setTimeout(() => {
    const tbody = document.getElementById('ea-p-payment-history');
    const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${dateStr}</td>
      <td>Term 2 2026</td>
      <td>GHS 850.00</td>
      <td>${selectedNetwork} MoMo</td>
      <td>${ref}</td>
      <td><span class="ea-p-pay-status ea-p-pay-success">Paid</span></td>
    `;
    tbody.insertBefore(row, tbody.firstChild);

    const feesDue = document.querySelector('.ea-p-fees-due');
    if (feesDue) {
      feesDue.textContent = 'Paid';
      feesDue.classList.remove('ea-p-fees-due');
      feesDue.style.color = '#388E3C';
    }

    const unpaidBadge = document.querySelector('.ea-p-fees-unpaid');
    if (unpaidBadge) {
      unpaidBadge.textContent = 'Paid';
      unpaidBadge.classList.remove('ea-p-fees-unpaid');
      unpaidBadge.classList.add('ea-p-fees-paid');
    }

    document.getElementById('ea-p-payment-form').style.display = 'none';
    document.querySelectorAll('.ea-p-network-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('ea-p-momo-number').value = '';
    document.getElementById('ea-p-momo-name').value = '';
    this.textContent = 'Confirm & Pay GHS 850.00';
    this.disabled = false;
    selectedNetwork = '';

    alert(`✅ Payment Successful!\n\nGHS 850.00 paid via ${selectedNetwork} Mobile Money.\nReference: ${ref}\n\nThank you!`);
  }, 2500);
});

// ---- Parent Notification Bell ----
const pNotifBtn = document.getElementById('ea-p-notif-btn');
const pNotifDropdown = document.getElementById('ea-p-notif-dropdown');
const pNotifBadge = document.getElementById('ea-p-notif-badge');
const pNotifMarkAll = document.getElementById('ea-p-notif-mark-all');
const pUserChip = document.getElementById('ea-p-user-chip');

if (pNotifBtn) {
  pNotifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    pNotifDropdown.classList.toggle('open');
    pNotifBtn.classList.toggle('active');
    if (pUserChip) pUserChip.classList.remove('open');
  });
}

if (pNotifMarkAll) {
  pNotifMarkAll.addEventListener('click', function () {
    pNotifDropdown.querySelectorAll('.ea-notif-unread').forEach(item => {
      item.classList.remove('ea-notif-unread');
    });
    pNotifDropdown.querySelectorAll('.ea-notif-dot').forEach(dot => {
      dot.style.display = 'none';
    });
    pNotifBadge.classList.add('hidden');
  });
}

pNotifDropdown && pNotifDropdown.querySelectorAll('.ea-notif-item').forEach(item => {
  item.addEventListener('click', function () {
    this.classList.remove('ea-notif-unread');
    const dot = this.querySelector('.ea-notif-dot');
    if (dot) dot.style.display = 'none';
    const unreadCount = pNotifDropdown.querySelectorAll('.ea-notif-unread').length;
    pNotifBadge.textContent = unreadCount;
    if (unreadCount === 0) pNotifBadge.classList.add('hidden');
  });
});

// ---- Parent User Chip ----
if (pUserChip) {
  pUserChip.addEventListener('click', function (e) {
    e.stopPropagation();
    this.classList.toggle('open');
    if (pNotifDropdown) pNotifDropdown.classList.remove('open');
    if (pNotifBtn) pNotifBtn.classList.remove('active');
  });
}

const pLogoutChip = document.getElementById('ea-parent-logout-chip');
if (pLogoutChip) {
  pLogoutChip.addEventListener('click', async function (e) {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

// ---- Parent Mobile Sidebar ----
const parentHamburger = document.getElementById('ea-parent-hamburger');
const parentSidebar = document.querySelector('.ea-parent-sidebar');
const parentOverlay = document.getElementById('ea-parent-sidebar-overlay');

function openParentSidebar() {
  parentSidebar.classList.add('open');
  parentOverlay.classList.add('show');
  parentHamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeParentSidebar() {
  parentSidebar.classList.remove('open');
  parentOverlay.classList.remove('show');
  parentHamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (parentHamburger) {
  parentHamburger.addEventListener('click', function () {
    parentSidebar.classList.contains('open') ? closeParentSidebar() : openParentSidebar();
  });
}

if (parentOverlay) {
  parentOverlay.addEventListener('click', closeParentSidebar);
}

document.querySelectorAll('.ea-parent-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeParentSidebar();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeParentSidebar();
});

document.addEventListener('click', function () {
  if (pNotifDropdown) pNotifDropdown.classList.remove('open');
  if (pNotifBtn) pNotifBtn.classList.remove('active');
  if (pUserChip) pUserChip.classList.remove('open');
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

// ---- Report Preview + Download ----
async function loadLogoAsPngDataUrl(imagePath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Could not load report logo.'));
    img.src = imagePath;
  });
}

let allReportRows = [];

function safeText(value, fallback = 'N/A') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function getSelectedReportTerm() {
  const termSelect = document.getElementById('ea-p-results-term');
  const selectedTerm = termSelect?.value?.trim() || '';

  if (selectedTerm) return selectedTerm;

  const knownTerms = [...new Set(allReportRows.map(row => String(row[3] || '').trim()).filter(Boolean))];
  return knownTerms[0] || 'All Terms';
}

function getReportPreviewRows() {
  const selectedTerm = getSelectedReportTerm();
  const rows = allReportRows.length ? allReportRows : [];

  if (!selectedTerm || selectedTerm === 'All Terms') return rows;
  return rows.filter(row => String(row[3] || '').trim() === selectedTerm);
}

async function openReportPreview() {
  const previewOverlay = document.getElementById('ea-report-preview-overlay');
  const previewTbody = document.getElementById('ea-report-preview-tbody');

  if (!previewOverlay || !previewTbody) return;

  const studentName = safeText(localStorage.getItem('ea-student-name'), 'Student');
  const parentName = safeText(await resolveEffectiveParentName(localStorage.getItem('ea-student-id')), 'Parent');
  const classTeacher = safeText(await resolveEffectiveClassTeacher(localStorage.getItem('ea-student-id')), 'Not assigned');
  const studentId = safeText(localStorage.getItem('ea-student-code'), 'N/A');
  const studentClass = safeText(document.querySelector('.ea-p-stat-value')?.textContent, 'N/A');
  const academicTerm = getSelectedReportTerm();
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  document.getElementById('ea-preview-student-name').textContent = studentName;
  document.getElementById('ea-preview-student-id').textContent = studentId;
  document.getElementById('ea-preview-student-class').textContent = studentClass;
  document.getElementById('ea-preview-term').textContent = academicTerm;
  document.getElementById('ea-preview-parent-name').textContent = parentName;
  document.getElementById('ea-preview-date-issued').textContent = today;
  document.getElementById('ea-preview-teacher-name')?.textContent = classTeacher;

  const rows = getReportPreviewRows();
  previewTbody.innerHTML = rows.length
    ? rows.map(row => `
        <tr>
          <td>${safeText(row[0], '—')}</td>
          <td>${safeText(row[1], '—')}</td>
          <td>${safeText(row[2], '—')}</td>
          <td>${safeText(row[3], '—')}</td>
          <td>${safeText(row[4], '—')}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5">No results available for the selected term.</td></tr>';

  previewOverlay.style.display = 'flex';
}

function closeReportPreview() {
  const previewOverlay = document.getElementById('ea-report-preview-overlay');
  if (previewOverlay) previewOverlay.style.display = 'none';
}

async function generateOfficialReportPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const logoDataUrl = await loadLogoAsPngDataUrl('images/eastgateLogo.webp');

  const studentName = safeText(localStorage.getItem('ea-student-name'), 'Student');
  const parentName = safeText(await resolveEffectiveParentName(localStorage.getItem('ea-student-id')), 'Parent');
  const classTeacher = safeText(await resolveEffectiveClassTeacher(localStorage.getItem('ea-student-id')), 'Not assigned');
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  doc.setFillColor(217, 78, 42);
  doc.rect(0, 0, 210, 34, 'F');

  doc.setFillColor(122, 30, 10);
  doc.rect(0, 34, 210, 15, 'F');

  doc.addImage(logoDataUrl, 'PNG', 14, 5, 22, 22);
  doc.setDrawColor(255, 255, 255);
  doc.setFillColor(255, 255, 255);
  doc.circle(25, 16, 12, 'F');
  doc.addImage(logoDataUrl, 'PNG', 18, 9, 14, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(21);
  doc.setFont('helvetica', 'bold');
  doc.text('EASTGATE ACADEMY', 105, 13, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Dawenya, Tema, Ghana   |   +233 244 512 123   |   info@eastgateacademy.edu.gh', 105, 21, { align: 'center' });
  doc.text('Nurturing Future Leaders', 105, 27, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL ACADEMIC REPORT CARD', 105, 43, { align: 'center' });

  doc.setDrawColor(173, 185, 201);
  doc.setLineWidth(0.4);
  doc.line(14, 52, 196, 52);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const studentId = safeText(localStorage.getItem('ea-student-code'), 'N/A');
  const studentClass = safeText(document.querySelector('.ea-p-stat-value')?.textContent, 'N/A');
  const academicTerm = getSelectedReportTerm();

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 58, 182, 28, 3, 3, 'F');
  doc.setDrawColor(204, 216, 229);
  doc.roundedRect(14, 58, 182, 28, 3, 3, 'S');

  doc.setFont('helvetica', 'normal');
  doc.text('Student Name:', 18, 67);
  doc.setFont('helvetica', 'bold');
  doc.text(studentName, 62, 67);

  doc.setFont('helvetica', 'normal');
  doc.text('Student ID:', 18, 75);
  doc.setFont('helvetica', 'bold');
  doc.text(studentId, 62, 75);

  doc.setFont('helvetica', 'normal');
  doc.text('Class:', 120, 67);
  doc.setFont('helvetica', 'bold');
  doc.text(studentClass, 151, 67);

  doc.setFont('helvetica', 'normal');
  doc.text('Term:', 120, 75);
  doc.setFont('helvetica', 'bold');
  doc.text(academicTerm || 'All Terms', 151, 75);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 90, 182, 20, 3, 3, 'F');
  doc.setDrawColor(204, 216, 229);
  doc.roundedRect(14, 90, 182, 20, 3, 3, 'S');

  doc.setFont('helvetica', 'normal');
  doc.text('Parent/Guardian:', 18, 99);
  doc.setFont('helvetica', 'bold');
  doc.text(parentName, 62, 99);

  doc.setFont('helvetica', 'normal');
  doc.text('Class Teacher:', 120, 99);
  doc.setFont('helvetica', 'bold');
  doc.text(classTeacher, 161, 99);

  doc.setFont('helvetica', 'normal');
  doc.text('Academic Year:', 18, 107);
  doc.setFont('helvetica', 'bold');
  doc.text('2026', 62, 107);

  doc.setFont('helvetica', 'normal');
  doc.text('Date Issued:', 120, 107);
  doc.setFont('helvetica', 'bold');
  doc.text(today, 161, 107);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, 114, 196, 114);

  doc.setTextColor(217, 78, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Academic Results', 14, 122);

  const rows = getReportPreviewRows();

  doc.autoTable({
    startY: 126,
    head: [['Subject', 'Score', 'Grade', 'Term', 'Remark']],
    body: rows.length > 0 ? rows.map(row => row.map(value => safeText(value, '—'))) : [['No results available', '', '', '', '']],
    headStyles: {
      fillColor: [217, 78, 42],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: [253, 240, 236]
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 45 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setTextColor(217, 78, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Summary', 14, finalY);

  const presentCount = document.querySelector('.ea-p-att-present .ea-p-att-count')?.textContent || '0';
  const absentCount = document.querySelector('.ea-p-att-absent .ea-p-att-count')?.textContent || '0';
  const lateCount = document.querySelector('.ea-p-att-late .ea-p-att-count')?.textContent || '0';
  const attRate = document.querySelector('.ea-p-stat-value:nth-child(3)')?.textContent || 'N/A';

  doc.autoTable({
    startY: finalY + 4,
    head: [['Days Present', 'Days Absent', 'Days Late', 'Attendance Rate']],
    body: [[presentCount, absentCount, lateCount, attRate]],
    headStyles: {
      fillColor: [122, 30, 10],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 50],
      halign: 'center'
    },
    margin: { left: 14, right: 14 }
  });

  const footerY = doc.lastAutoTable.finalY + 20;

  doc.setDrawColor(217, 78, 42);
  doc.setLineWidth(0.5);
  doc.line(14, footerY, 196, footerY);

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is an official report card generated from the Eastgate Academy portal.', 105, footerY + 6, { align: 'center' });
  doc.text('For queries contact: info@eastgateacademy.edu.gh  |  0244 512 123', 105, footerY + 11, { align: 'center' });
  doc.text(`Generated on ${today} by Eastgate Academy Portal`, 105, footerY + 16, { align: 'center' });

  const fileName = `Eastgate_Report_Card_${studentName.replace(/ /g, '_')}_2026.pdf`;
  doc.save(fileName);
}

const downloadReportBtn = document.getElementById('ea-p-download-report');
const closeReportPreviewBtn = document.getElementById('ea-report-close-btn');
const cancelReportPreviewBtn = document.getElementById('ea-report-cancel-btn');
const keepReportBtn = document.getElementById('ea-report-keep-btn');

if (downloadReportBtn) {
  downloadReportBtn.addEventListener('click', async function () {
    await openReportPreview();
  });
}

if (closeReportPreviewBtn) {
  closeReportPreviewBtn.addEventListener('click', closeReportPreview);
}

if (cancelReportPreviewBtn) {
  cancelReportPreviewBtn.addEventListener('click', closeReportPreview);
}

const reportPreviewOverlay = document.getElementById('ea-report-preview-overlay');
if (reportPreviewOverlay) {
  reportPreviewOverlay.addEventListener('click', function (event) {
    if (event.target === reportPreviewOverlay) closeReportPreview();
  });
}

if (keepReportBtn) {
  keepReportBtn.addEventListener('click', async function () {
    this.textContent = 'Generating...';
    this.disabled = true;

    try {
      if (allReportRows.length === 0) {
        alert('No results are available for this student yet.');
        return;
      }

      await generateOfficialReportPdf();
      closeReportPreview();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating report card. Please try again.');
    }

    this.textContent = 'Keep & Download';
    this.disabled = false;
  });
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeReportPreview();
  }
});

