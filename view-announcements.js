const list = document.getElementById('ea-ann-list');
const announcements = JSON.parse(localStorage.getItem('ea-announcements')) || [];

if (announcements.length === 0) {
  list.innerHTML = '<p>No announcements yet.</p>';
} else {
  announcements.forEach(a => {
    const card = document.createElement('div');
    card.className = 'ea-ann-card';
    card.innerHTML = `
      <h3>${a.title}</h3>
      <p>${a.body}</p>
      <small><strong>${a.date}</strong> @ ${a.time}</small>
    `;
    list.appendChild(card);
  });
}

const isAdmin = true; // set to true if admin is logged in

announcements.forEach((a, i) => {
  const card = document.createElement('div');
  card.className = 'ea-ann-card';
  card.innerHTML = `
    <h3 contenteditable="${isAdmin}">${a.title}</h3>
    <p contenteditable="${isAdmin}">${a.body}</p>
    <small><strong>${a.date}</strong> @ ${a.time}</small>
    ${isAdmin ? `
      <button onclick="deleteAnnouncement(${i})">Delete</button>
      <button onclick="updateAnnouncement(${i})">Update</button>
    ` : ''}
  `;
  list.appendChild(card);
});

function deleteAnnouncement(index) {
  if (confirm("Delete this announcement?")) {
    announcements.splice(index, 1);
    localStorage.setItem('ea-announcements', JSON.stringify(announcements));
    location.reload();
  }
}

function updateAnnouncement(index) {
  const cards = document.querySelectorAll('.ea-ann-card');
  const title = cards[index].querySelector('h3').innerText.trim();
  const body = cards[index].querySelector('p').innerText.trim();

  announcements[index].title = title;
  announcements[index].body = body;
  localStorage.setItem('ea-announcements', JSON.stringify(announcements));
  alert("Announcement updated!");
}
