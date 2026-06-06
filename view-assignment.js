const listContainer = document.getElementById('ea-assignment-list');
const assignments = JSON.parse(localStorage.getItem('ea-assignments')) || [];

if (assignments.length === 0) {
  listContainer.innerHTML = '<p>No assignments available.</p>';
} else {
  assignments.forEach((a) => {
    const card = document.createElement('div');
    card.className = 'assignment-card';
    card.innerHTML = `
      <h3>${a.title}</h3>
      <p>${a.description}</p>
      <p><strong>Due:</strong> ${a.dueDate}</p>
      <p><strong>File:</strong> ${a.fileName}</p>
    `;
    listContainer.appendChild(card);
  });
}
