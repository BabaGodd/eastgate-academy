const studentName = "Ama Agyemang"; // replace dynamically based on logged-in user
const attendance = JSON.parse(localStorage.getItem('ea-attendance')) || [];
const container = document.getElementById('ea-dash-att-container');

const recent = attendance.slice(-5); // show last 5 days
let html = '<ul>';

recent.forEach(r => {
  let status = r.present.includes(studentName)
    ? '✅ Present'
    : r.absent.includes(studentName)
    ? '❌ Absent'
    : '—';

  html += `<li><strong>${r.date}</strong> — ${status}</li>`;
});

html += '</ul>';
container.innerHTML = html;
