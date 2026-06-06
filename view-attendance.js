const studentName = "Ama Agyemang"; // replace with logged-in student's name
const allAttendance = JSON.parse(localStorage.getItem('ea-attendance')) || [];
const tbody = document.getElementById('ea-att-body');
const stats = document.getElementById('ea-att-stats');

let presentCount = 0;
let totalCount = 0;

// Build table
allAttendance.forEach(record => {
  const date = record.date;
  let status = '';

  if (record.present.includes(studentName)) {
    status = 'Present';
    presentCount++;
  } else if (record.absent.includes(studentName)) {
    status = 'Absent';
  } else {
    return; // skip if not listed
  }

  totalCount++;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${date}</td>
    <td>${status}</td>
  `;
  tbody.appendChild(row);
});

// Stats
stats.textContent = totalCount > 0
  ? `You were present ${presentCount} out of ${totalCount} days.`
  : "No attendance records found.";


  document.getElementById('ea-export-att-pdf').addEventListener('click', () => {
  const rows = [];
  document.querySelectorAll('#ea-att-body tr').forEach(tr => {
    const cells = tr.querySelectorAll('td');
    rows.push([cells[0].textContent, cells[1].textContent]);
  });

  if (rows.length === 0) return alert("No attendance to export.");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Attendance Report - Eastgate Academy", 14, 15);
  doc.autoTable({
    startY: 25,
    head: [['Date', 'Status']],
    body: rows
  });
  doc.save("Attendance_Report.pdf");
});
