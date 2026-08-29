// ============================================
// EASTGATE ACADEMY — ENTER RESULTS
// ============================================

// Subjects by class level
const SUBJECTS_BY_LEVEL = {
  creche: ['Pre-Literacy', 'Pre-Numeracy', 'Language Development', 'Creative Play', 'Music and Movement', 'Social Skills', 'Physical Development'],
  nursery: ['Language and Literacy', 'Numeracy', 'Creative Arts', 'Physical Development', 'Psychomotor Skills'],
  kg: ['Language and Literacy', 'Numeracy', 'Creative Arts', 'Physical Development', 'Psychomotor Skills'],
  lower: ['English Language', 'Mathematics', 'Science', 'History', 'Creative Arts', 'Religious and Moral Education', 'Ghanaian Language', 'Physical Education'],
  upper: ['English Language', 'Mathematics', 'Science', 'History', 'Creative Arts', 'Religious and Moral Education', 'Ghanaian Language', 'Physical Education', 'French', 'Computing'],
  jhs: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Computing', 'Career Technology', 'Creative Arts and Design', 'Religious and Moral Education', 'Ghanaian Language', 'French', 'Physical and Health Education'],
};

// Map class name to subject level
function getSubjectLevel(className) {
  const name = className.toLowerCase();
  if (name.includes('creche')) return 'creche';
  if (name.includes('pre-nursery') || name.includes('nursery') || name.includes('pre-reception') || name.includes('reception')) return 'nursery';
  if (name.includes('kg')) return 'kg';
  if (name.includes('basic 1') || name.includes('basic 2') || name.includes('basic 3')) return 'lower';
  if (name.includes('basic 4') || name.includes('basic 5') || name.includes('basic 6')) return 'upper';
  if (name.includes('jhs')) return 'jhs';
  return 'lower';
}

// Auto calculate grade from score
function calculateGrade(score) {
  if (score >= 80) return { grade: 'A', color: '#388E3C', bg: '#e8f5e9' };
  if (score >= 70) return { grade: 'B', color: '#1976D2', bg: '#e3f2fd' };
  if (score >= 60) return { grade: 'C', color: '#F57C00', bg: '#fff3e0' };
  if (score >= 50) return { grade: 'D', color: '#7B1FA2', bg: '#f3e5f5' };
  return { grade: 'F', color: '#c62828', bg: '#ffebee' };
}

// Auto calculate remark from score
function calculateRemark(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Average';
  return 'Needs Improvement';
}

const sessionResults = [];

document.addEventListener('DOMContentLoaded', async function () {

  const classSelect = document.getElementById('ea-class');
  const studentSelect = document.getElementById('ea-student');
  const subjectSelect = document.getElementById('ea-subject');
  const scoreInput = document.getElementById('ea-score');
  const gradeBadge = document.getElementById('ea-grade-badge');
  const gradeDisplay = document.getElementById('ea-grade-display');
  const remarkInput = document.getElementById('ea-remark');

  // ---- Load Classes ----
  const { data: classes } = await supabaseClient
    .from('classes')
    .select('*')
    .order('name');

  if (classes) {
    classes.forEach(cls => {
      const option = document.createElement('option');
      option.value = cls.id;
      option.textContent = cls.name;
      option.setAttribute('data-name', cls.name);
      classSelect.appendChild(option);
    });
  }

  // ---- When class changes load students and subjects ----
  classSelect.addEventListener('change', async function () {
    const classId = this.value;
    const className = this.options[this.selectedIndex]?.getAttribute('data-name') || '';

    studentSelect.innerHTML = '<option value="">Loading students...</option>';
    studentSelect.disabled = true;
    subjectSelect.innerHTML = '<option value="">Loading subjects...</option>';
    subjectSelect.disabled = true;

    if (!classId) {
      studentSelect.innerHTML = '<option value="">Select class first</option>';
      subjectSelect.innerHTML = '<option value="">Select class first</option>';
      return;
    }

    // Load students for this class
    const { data: students } = await supabaseClient
      .from('students')
      .select('id, full_name, student_code')
      .eq('class_id', classId)
      .order('full_name');

    studentSelect.innerHTML = '<option value="">Select Student</option>';
    if (students && students.length > 0) {
      students.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.full_name} (${s.student_code})`;
        studentSelect.appendChild(option);
      });
      studentSelect.disabled = false;
    } else {
      studentSelect.innerHTML = '<option value="">No students in this class</option>';
    }

    // Load subjects for this class level
    const level = getSubjectLevel(className);
    const subjects = SUBJECTS_BY_LEVEL[level] || SUBJECTS_BY_LEVEL.lower;

    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectSelect.appendChild(option);
    });
    subjectSelect.disabled = false;
  });

  // ---- Auto calculate grade when score changes ----
  scoreInput.addEventListener('input', function () {
    const score = parseInt(this.value);
    if (isNaN(score) || score < 0 || score > 100) {
      gradeDisplay.style.display = 'none';
      return;
    }

    const { grade, color, bg } = calculateGrade(score);
    gradeBadge.textContent = grade;
    gradeBadge.style.color = color;
    gradeBadge.style.background = bg;
    gradeBadge.style.borderColor = color;
    gradeDisplay.style.display = 'block';

    // Auto fill remark if empty
    if (!remarkInput.value) {
      remarkInput.value = calculateRemark(score);
    }
  });

  // ---- Submit Form ----
  document.getElementById('ea-results-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const successEl = document.getElementById('ea-results-success');
    const errorEl = document.getElementById('ea-results-error');
    const errorText = document.getElementById('ea-results-error-text');

    successEl.style.display = 'none';
    errorEl.style.display = 'none';

    const classId = classSelect.value;
    const className = classSelect.options[classSelect.selectedIndex]?.getAttribute('data-name') || '';
    const studentId = studentSelect.value;
    const studentName = studentSelect.options[studentSelect.selectedIndex]?.textContent || '';
    const subjectName = subjectSelect.value;
    const score = parseInt(scoreInput.value);
    const term = document.getElementById('ea-term').value;
    const remark = remarkInput.value.trim();
    const academicYear = new Date().getFullYear().toString();

    // Validation
    if (!term) { errorText.textContent = 'Please select a term.'; errorEl.style.display = 'block'; return; }
    if (!classId) { errorText.textContent = 'Please select a class.'; errorEl.style.display = 'block'; return; }
    if (!studentId) { errorText.textContent = 'Please select a student.'; errorEl.style.display = 'block'; return; }
    if (!subjectName) { errorText.textContent = 'Please select a subject.'; errorEl.style.display = 'block'; return; }
    if (isNaN(score) || score < 0 || score > 100) { errorText.textContent = 'Please enter a valid score between 0 and 100.'; errorEl.style.display = 'block'; return; }

    const { grade } = calculateGrade(score);

    // ---- GET TEACHER ID ----
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      errorText.textContent = 'You must be logged in to save results.';
      errorEl.style.display = 'block';
      return;
    }

    const { data: teacherData, error: teacherError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (teacherError || !teacherData) {
      console.error('Teacher lookup error:', teacherError);
      errorText.textContent = 'Could not verify teacher account. Please log out and try again.';
      errorEl.style.display = 'block';
      return;
    }

    // ---- GET SUBJECT ID FROM DATABASE ----
    const { data: subjectData, error: subjectError } = await supabaseClient
      .from('subjects')
      .select('id')
      .eq('name', subjectName)
      .single();

    if (subjectError || !subjectData) {
      console.error('Subject lookup error:', subjectError);
      errorText.textContent = `Subject "${subjectName}" not found in database. Please contact admin.`;
      errorEl.style.display = 'block';
      return;
    }

    const subjectId = subjectData.id;

    // ---- INSERT WITH CORRECT COLUMN NAME ----
    const { data, error } = await supabaseClient
      .from('results')
      .insert({
        student_id: studentId,
        subject_id: subjectId,
        score: score,
        grade: grade,
        term: term,
        academic_year: academicYear,
        remark: remark || calculateRemark(score),
        class_id: classId,
        teacher_id: teacherData.id,
        published: true,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Supabase error saving result:', error);

      if (error.code === '23505') {
        errorText.textContent = `A result for ${studentName.split(' (')[0]} in ${subjectName} (${term}, ${academicYear}) already exists. Please edit the existing entry instead of creating a new one.`;
      } else if (error.code === '23503') {
        errorText.textContent = 'Foreign key error: The selected student, subject, or class may not exist.';
      } else if (error.code === '23502') {
        errorText.textContent = 'Missing required field. Please check all fields.';
      } else if (error.code === '42501') {
        errorText.textContent = 'Permission denied. Please log out and log in again.';
      } else {
        errorText.textContent = `Error saving result: ${error.message || 'Please try again.'}`;
      }
      errorEl.style.display = 'block';
      return;
    }

    // Show success
    successEl.style.display = 'block';

    // Add to session results table
    sessionResults.push({ studentName, subject: subjectName, score, grade, term });
    updateSessionTable();

    // Reset student and subject but keep class and term
    studentSelect.value = '';
    subjectSelect.value = '';
    scoreInput.value = '';
    remarkInput.value = '';
    gradeDisplay.style.display = 'none';

    setTimeout(() => { successEl.style.display = 'none'; }, 3000);
  });

  function updateSessionTable() {
    const tbody = document.getElementById('ea-session-results-tbody');
    const container = document.getElementById('ea-session-results');
    container.style.display = 'block';

    tbody.innerHTML = sessionResults.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? 'white' : '#FDF0EC'};">
        <td style="padding:8px 12px;">${r.studentName}</td>
        <td style="padding:8px 12px;">${r.subject}</td>
        <td style="padding:8px 12px;">${r.score}%</td>
        <td style="padding:8px 12px; font-weight:700; color:${calculateGrade(r.score).color};">${r.grade}</td>
        <td style="padding:8px 12px;">${r.term}</td>
      </tr>
    `).join('');
  }

});