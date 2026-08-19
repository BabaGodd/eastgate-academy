// ============================================
// EASTGATE ACADEMY — POST ANNOUNCEMENT
// ============================================

document.getElementById('ea-ann-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const titleInput = document.getElementById('ea-ann-title');
  const bodyInput = document.getElementById('ea-ann-body');
  const successEl = document.getElementById('ea-ann-success');
  const submitBtn = document.querySelector('.ea-inner-submit-btn');

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

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

  successEl.style.color = '#2E7D32';
  successEl.textContent = 'Announcement posted successfully!';

  titleInput.value = '';
  bodyInput.value = '';

  setTimeout(() => {
    successEl.textContent = '';
  }, 3000);
});