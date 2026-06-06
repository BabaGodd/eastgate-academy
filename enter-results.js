document.getElementById('ea-results-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('ea-student-name').value.trim();
  const subject = document.getElementById('ea-subject').value.trim();
  const score = document.getElementById('ea-score').value.trim();
  const term = document.getElementById('ea-term').value;

  if (!name || !subject || !score || !term) return;

  const result = {
    name,
    subject,
    score: parseInt(score),
    term,
    date: new Date().toLocaleDateString()
  };

  let allResults = JSON.parse(localStorage.getItem('ea-results')) || [];
  allResults.push(result);
  localStorage.setItem('ea-results', JSON.stringify(allResults));

  document.getElementById('ea-results-success').textContent = "Result saved successfully!";
  this.reset();
});
