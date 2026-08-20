// ============================================
// EASTGATE ACADEMY — TEACHER ANNOUNCEMENTS
// Read-only view of announcements posted by admin.
// This file is self-contained: it does not depend on
// anything inside dashboard-teacher.js.
// ============================================

async function loadTeacherAnnouncements() {
  const list = document.getElementById('ea-t-announcements-list');
  if (!list) return;

  const { data: announcements, error } = await supabaseClient
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading announcements:', error);
    list.innerHTML = `
      <div style="text-align:center; padding:2rem; color:#c62828;">
        Error loading announcements. Please try again.
      </div>`;
    return;
  }

  if (!announcements || announcements.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding:2rem; color:#aaa;">
        <i class="fas fa-bullhorn" style="font-size:2rem; display:block; margin-bottom:0.5rem; color:#ddd;"></i>
        No announcements posted yet.
      </div>`;
    return;
  }

  list.innerHTML = announcements.map(a => {
    const date = new Date(a.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    return `
      <div style="background:white; border:1px solid #f1e3da; border-left:4px solid #D94E2A; border-radius:8px; padding:1rem 1.2rem; margin-bottom:1rem; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
          <p style="font-weight:700; color:#7A1E0A; margin:0; font-size:1rem;">${a.title}</p>
          <span style="font-size:0.78rem; color:#999; white-space:nowrap;">${date}</span>
        </div>
        <p style="margin:0.6rem 0 0 0; color:#444; font-size:0.92rem; line-height:1.6;">${a.body}</p>
      </div>
    `;
  }).join('');
}

// Load announcements as soon as the page is ready, regardless of which
// section is currently visible — matches the pattern used elsewhere
// in this project (e.g. loadStats(), loadAnnouncements() on admin side).
loadTeacherAnnouncements();

// Also reload whenever the teacher clicks into the Announcements tab,
// so the list is always fresh if a new one was just posted.
const teacherAnnouncementsLink = document.getElementById('ea-t-announcements-link');
if (teacherAnnouncementsLink) {
  teacherAnnouncementsLink.addEventListener('click', function () {
    loadTeacherAnnouncements();
  });
}