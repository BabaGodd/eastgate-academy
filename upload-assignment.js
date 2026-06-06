document.getElementById('ea-upload-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('ea-title').value.trim();
  const description = document.getElementById('ea-description').value.trim();
  const dueDate = document.getElementById('ea-due-date').value;
  const file = document.getElementById('ea-file').files[0];

  if (!title || !description || !dueDate || !file) return;

  const assignment = {
    title,
    description,
    dueDate,
    fileName: file.name,
  };

  let allAssignments = JSON.parse(localStorage.getItem('ea-assignments')) || [];
  allAssignments.push(assignment);
  localStorage.setItem('ea-assignments', JSON.stringify(allAssignments));

  document.getElementById('ea-upload-success').textContent = "Assignment uploaded successfully!";
  this.reset();
});
