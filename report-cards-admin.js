// ============================================
// EASTGATE ACADEMY — ADMIN BULK REPORT CARD GENERATION
// Self-contained: doesn't depend on anything in dashboard-admin.js.
// Uses the shared eaBuildReportCard() function from
// report-card-generator.js, so bulk-generated cards look identical
// to the ones parents download individually.
// ============================================

let eaRcStudentsData = [];

// ---- Populate class dropdown ----
async function eaRcLoadClasses() {
  const select = document.getElementById('ea-rc-class');
  if (!select) return;

  const { data: classes, error } = await supabaseClient
    .from('classes')
    .select('id, name')
    .order('name');

  if (error || !classes) {
    console.error('Error loading classes for report cards:', error);
    return;
  }

  select.innerHTML = '<option value="">Select Class</option>' +
    classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

eaRcLoadClasses();

// ---- Load students button ----
document.getElementById('ea-rc-load-btn')?.addEventListener('click', async function () {
  const classId = document.getElementById('ea-rc-class').value;
  const term = document.getElementById('ea-rc-term').value;
  const tbody = document.getElementById('ea-rc-tbody');
  const summary = document.getElementById('ea-rc-summary');
  const countEl = document.getElementById('ea-rc-count');

  if (!classId || !term) {
    alert('Please select both a class and a term.');
    return;
  }

  tbody.innerHTML = `
    <tr>
      <td colspan="3" style="text-align:center; padding:2rem; color:#aaa;">
        <i class="fas fa-spinner fa-spin"></i> Loading...
      </td>
    </tr>`;
  summary.style.display = 'none';

  const { data: results, error } = await supabaseClient
    .from('results')
    .select(`
      score, grade, remark,
      students ( id, full_name, student_code ),
      subjects ( name )
    `)
    .eq('class_id', classId)
    .eq('term', term)
    .eq('published', true);

  if (error) {
    console.error('Error loading results for report cards:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:2rem; color:#c62828;">
          Error loading results. Please try again.
        </td>
      </tr>`;
    return;
  }

  if (!results || results.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:2rem; color:#aaa;">
          No published results found for this class and term.
        </td>
      </tr>`;
    return;
  }

  // Group results by student
  const byStudent = {};
  results.forEach(r => {
    const sid = r.students?.id;
    if (!sid) return;
    if (!byStudent[sid]) {
      byStudent[sid] = {
        id: sid,
        name: r.students.full_name,
        code: r.students.student_code,
        results: []
      };
    }
    byStudent[sid].results.push({
      subject: r.subjects?.name || 'N/A',
      score: r.score,
      grade: r.grade,
      remark: r.remark
    });
  });

  eaRcStudentsData = Object.values(byStudent).sort((a, b) => a.name.localeCompare(b.name));

  tbody.innerHTML = eaRcStudentsData.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.code}</td>
      <td>${s.results.length} subject${s.results.length > 1 ? 's' : ''}</td>
    </tr>
  `).join('');

  countEl.textContent = eaRcStudentsData.length;
  summary.style.display = 'block';
});

// ---- Generate & download ZIP ----
document.getElementById('ea-rc-generate-btn')?.addEventListener('click', async function () {
  if (!eaRcStudentsData || eaRcStudentsData.length === 0) {
    alert('Load students first.');
    return;
  }

  if (typeof eaBuildReportCard !== 'function') {
    alert('Report card generator not loaded. Please refresh the page and try again.');
    return;
  }

  if (typeof JSZip === 'undefined') {
    alert('ZIP library not loaded. Please refresh the page and try again.');
    return;
  }

  const classSelect = document.getElementById('ea-rc-class');
  const className = classSelect.options[classSelect.selectedIndex]?.textContent || 'Class';
  const term = document.getElementById('ea-rc-term').value;
  const progressEl = document.getElementById('ea-rc-progress');
  const btn = this;

  btn.disabled = true;
  const zip = new JSZip();
  const { jsPDF } = window.jspdf;

  for (let i = 0; i < eaRcStudentsData.length; i++) {
    const student = eaRcStudentsData[i];
    progressEl.textContent = `Generating ${i + 1} of ${eaRcStudentsData.length}...`;

    const doc = new jsPDF();
    eaBuildReportCard(doc, {
      studentName: student.name,
      studentId: student.code,
      className: className,
      term: term,
      academicYear: '2025/2026',
      results: student.results
    });

    const pdfBlob = doc.output('blob');
    const safeName = student.name.replace(/[^a-z0-9]/gi, '_');
    zip.file(`${safeName}_${student.code}.pdf`, pdfBlob);

    // Small yield so the UI can update the progress text between PDFs
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  progressEl.textContent = 'Zipping files...';
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  const zipUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = zipUrl;
  a.download = `Eastgate_${className.replace(/ /g, '_')}_${term.replace(/ /g, '_')}_Report_Cards.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(zipUrl);

  progressEl.textContent = `Done — ${eaRcStudentsData.length} report card(s) downloaded.`;
  btn.disabled = false;
});