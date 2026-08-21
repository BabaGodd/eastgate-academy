// ============================================
// EASTGATE ACADEMY — POST ANNOUNCEMENT
// ============================================

// ---- Populate the "Send To" class dropdown ----
document.addEventListener('DOMContentLoaded', async function () {
  const classSelect = document.getElementById('ea-ann-class');
  if (!classSelect) return;

  const { data: classes, error } = await supabaseClient
    .from('classes')
    .select('id, name')
    .order('name');

  if (error || !classes) {
    console.error('Error loading classes:', error);
    return;
  }

  classes.forEach(cls => {
    const option = document.createElement('option');
    option.value = cls.id;
    option.textContent = cls.name;
    classSelect.appendChild(option);
  });
});

document.getElementById('ea-ann-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const titleInput = document.getElementById('ea-ann-title');
  const bodyInput = document.getElementById('ea-ann-body');
  const classInput = document.getElementById('ea-ann-class');
  const successEl = document.getElementById('ea-ann-success');
  const submitBtn = document.querySelector('.ea-inner-submit-btn');

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const classId = classInput.value || null; // empty selection = school-wide

  successEl.style.color = '';
  successEl.textContent = '';

  if (!title || !body) {
    successEl.style.color = '#c62828';
    successEl.textContent = 'Please fill in both the title and message.';
    return;
  }

  // Disable button while submitting to prevent double-posts
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

  const { data, error } = await supabaseClient
    .from('announcements')
    .insert({
      title: title,
      body: body,
      class_id: classId,
      created_at: new Date().toISOString()
    })
    .select();

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-bullhorn"></i> Post Announcement';

  if (error) {
    console.error('Error posting announcement:', error);
    successEl.style.color = '#c62828';

    if (error.code === '42501') {
      successEl.textContent = 'Permission denied. Please log out and log in again.';
    } else if (error.code === '23502') {
      successEl.textContent = 'Missing required field. Please check the form.';
    } else {
      successEl.textContent = `Error posting announcement: ${error.message || 'Please try again.'}`;
    }
    return;
  }

  const targetLabel = classId
    ? classInput.options[classInput.selectedIndex].textContent
    : 'all classes (school-wide)';

  successEl.style.color = '#2E7D32';
  successEl.textContent = `Announcement posted successfully to ${targetLabel}!`;

  titleInput.value = '';
  bodyInput.value = '';
  classInput.value = '';

  setTimeout(() => {
    successEl.textContent = '';
  }, 3000);
});