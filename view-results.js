const results = JSON.parse(localStorage.getItem('ea-results')) || [];
const tbody = document.getElementById('ea-result-body');
const filterInput = document.getElementById('ea-result-filter');

// Function to display results
function displayResults(data) {
  tbody.innerHTML = '';
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No results found.</td></tr>';
    return;
  }

  data.forEach(r => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${r.name}</td>
      <td>${r.subject}</td>
      <td>${r.score}%</td>
      <td>${r.term}</td>
      <td>${r.date}</td>
    `;
    tbody.appendChild(row);
  });
}

// Initial display
displayResults(results);

// Filter by student name
filterInput.addEventListener('input', () => {
  const keyword = filterInput.value.toLowerCase();
  const filtered = results.filter(r => r.name.toLowerCase().includes(keyword));
  displayResults(filtered);
});
