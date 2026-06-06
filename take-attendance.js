const studentNames = [
  "Ama Agyemang",
  "Kwame Mensah",
  "Efua Asante",
  "Kojo Boateng",
  "Yaw Owusu"
]; // You can replace this with your real student list

const listContainer = document.getElementById('ea-student-list');
const form = document.getElementById('ea-att-form');
const msg = document.getElementById('ea-att-msg');

// Render checkboxes
studentNames.forEach(name => {
  const wrapper = document.createElement('div');
  wrapper.className = 'ea-att-checkbox';
  wrapper.innerHTML = `
    <input type="checkbox" id="${name}" value="${name}" />
    <label for="${name}">${name}</label>
  `;
  listContainer.appendChild(wrapper);
});

// Save attendance
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const date = document.getElementById('ea-date').value;
  if (!date) return;

  const present = studentNames.filter(name => document.getElementById(name).checked);
  const absent = studentNames.filter(name => !document.getElementById(name).checked);

  const attendance = {
    date,
    present,
    absent,
    timestamp: new Date().toLocaleString()
  };

  let allAttendance = JSON.parse(localStorage.getItem('ea-attendance')) || [];
  allAttendance.push(attendance);
  localStorage.setItem('ea-attendance', JSON.stringify(allAttendance));

  msg.textContent = "Attendance saved!";
  this.reset();
});
