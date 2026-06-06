document.getElementById('ea-ann-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('ea-ann-title').value.trim();
  const body = document.getElementById('ea-ann-body').value.trim();

  if (!title || !body) return;

  const announcement = {
    title,
    body,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  let announcements = JSON.parse(localStorage.getItem('ea-announcements')) || [];
  announcements.unshift(announcement);
  localStorage.setItem('ea-announcements', JSON.stringify(announcements));

  document.getElementById('ea-ann-success').textContent = 'Announcement posted!';
  this.reset();
});
