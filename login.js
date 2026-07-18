// ============================================
// EASTGATE ACADEMY — LOGIN SYSTEM
// ============================================

// ---- Splash Screen ----
document.addEventListener('DOMContentLoaded', function () {
  const splash = document.getElementById('ea-splash');
  if (!splash) return;

  if (sessionStorage.getItem('ea-splash-shown')) {
    splash.style.display = 'none';
    document.body.style.overflow = '';
    return;
  }

  sessionStorage.setItem('ea-splash-shown', 'true');

  function hideSplash() {
    splash.classList.add('ea-splash-hide');
    setTimeout(() => {
      splash.style.display = 'none';
      document.body.style.overflow = '';
    }, 600);
  }

  setTimeout(hideSplash, 2800);

  setTimeout(() => {
    splash.style.display = 'none';
    document.body.style.overflow = '';
  }, 4000);
});

// ---- Tab Switching ----
function switchTab(tab) {
  document.getElementById('panel-portal').style.display = tab === 'portal' ? 'block' : 'none';
  document.getElementById('panel-admin').style.display = tab === 'admin' ? 'block' : 'none';
  document.getElementById('tab-portal').classList.toggle('active', tab === 'portal');
  document.getElementById('tab-admin').classList.toggle('active', tab === 'admin');
}

// ---- Toggle Password Visibility ----
document.getElementById('ea-toggle-pin')?.addEventListener('click', function () {
  const input = document.getElementById('ea-portal-pin');
  const icon = this.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
});

document.getElementById('ea-toggle-password')?.addEventListener('click', function () {
  const input = document.getElementById('ea-admin-password');
  const icon = this.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
});

// ---- Forgot Password ----
document.getElementById('ea-forgot-link')?.addEventListener('click', function (e) {
  e.preventDefault();
  const forgotForm = document.getElementById('ea-forgot-form');
  forgotForm.style.display = forgotForm.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('ea-forgot-submit')?.addEventListener('click', async function () {
  const id = document.getElementById('ea-forgot-id').value.trim();
  if (!id) return;

  await supabaseClient
    .from('messages')
    .insert({
      sender_role: 'parent',
      content: `Password reset request for ID: ${id}`,
      created_at: new Date().toISOString()
    });

  document.getElementById('ea-forgot-success').style.display = 'block';
});

// ============================================
// PARENT / TEACHER LOGIN
// ============================================
document.getElementById('ea-portal-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('ea-portal-id').value.trim();
  const password = document.getElementById('ea-portal-pin').value.trim();
  const btn = document.getElementById('ea-portal-btn');
  const btnText = document.getElementById('ea-portal-btn-text');
  const errorEl = document.getElementById('ea-portal-error');
  const errorText = document.getElementById('ea-portal-error-text');

  errorEl.style.display = 'none';
  btn.disabled = true;
  btnText.textContent = 'Signing in...';

  try {

    // ---- Check if TEACHER ----
    const { data: teacher } = await supabaseClient
      .from('users')
      .select('*')
      .eq('staff_id', id)
      .eq('role', 'teacher')
      .single();

    if (teacher) {
      if (password !== teacher.portal_password) {
        showPortalError('Incorrect password. Please try again.');
        return;
      }

      localStorage.setItem('ea-authenticated', 'true');
      localStorage.setItem('ea-user-role', 'teacher');
      localStorage.setItem('ea-user-id', teacher.id);
      localStorage.setItem('ea-user-name', teacher.full_name);
      localStorage.setItem('ea-staff-id', teacher.staff_id);
      localStorage.setItem('ea-user-email', teacher.email);

      const { error: authError } = await supabaseClient.auth.signInWithPassword({
        email: teacher.email,
        password: password
      });

      if (authError) {
        console.warn('Supabase auth sign-in optional warning:', authError.message);
      }

      window.location.href = 'dashboard-teacher.html';
      return;
    }

    // ---- Check if PARENT (via student family_name) ----
    const { data: student } = await supabaseClient
      .from('students')
      .select('*, classes(name)')
      .eq('student_code', id)
      .single();

    if (student) {
      const familyName = student.family_name || '';
      const passwordMatch = password.toLowerCase() === familyName.toLowerCase();

      if (!passwordMatch) {
        showPortalError('Incorrect password. Please use your child\'s family name.');
        return;
      }

      // Find linked parent user
      const { data: parentUser } = await supabaseClient
        .from('users')
        .select('*')
        .eq('pin', student.pin)
        .eq('role', 'parent')
        .single();

      if (parentUser?.email) {
        await supabaseClient.auth.signInWithPassword({
          email: parentUser.email,
          password: password
        }).catch(() => {});
      }

      localStorage.setItem('ea-authenticated', 'true');
      localStorage.setItem('ea-user-role', 'parent');
      localStorage.setItem('ea-user-id', parentUser?.id || student.id);
      localStorage.setItem('ea-user-name', parentUser?.full_name || student.full_name);
      localStorage.setItem('ea-student-id', student.id);
      localStorage.setItem('ea-student-code', student.student_code);
      localStorage.setItem('ea-student-name', student.full_name);
      localStorage.setItem('ea-student-class', student.classes?.name || '');
      localStorage.setItem('ea-user-email', parentUser?.email || '');

      window.location.href = 'dashboard-parent.html';
      return;
    }

    showPortalError('ID not found. Please check your Student ID or Staff ID.');

  } catch (err) {
    console.error('Login error:', err);
    showPortalError('Something went wrong. Please try again.');
  }

  function showPortalError(message) {
    errorText.textContent = message;
    errorEl.style.display = 'flex';
    btn.disabled = false;
    btnText.textContent = 'Sign In';
  }

  btn.disabled = false;
  btnText.textContent = 'Sign In';
});

// ============================================
// ADMIN LOGIN
// ============================================
document.getElementById('ea-admin-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('ea-admin-email').value.trim();
  const password = document.getElementById('ea-admin-password').value.trim();
  const btn = document.getElementById('ea-admin-btn');
  const btnText = document.getElementById('ea-admin-btn-text');
  const errorEl = document.getElementById('ea-admin-error');
  const errorText = document.getElementById('ea-admin-error-text');

  errorEl.style.display = 'none';
  btn.disabled = true;
  btnText.textContent = 'Signing in...';

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      errorText.textContent = 'Invalid email or password. Please try again.';
      errorEl.style.display = 'flex';
      btn.disabled = false;
      btnText.textContent = 'Sign In as Admin';
      return;
    }

    const { data: adminUser } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin')
      .single();

    if (!adminUser) {
      errorText.textContent = 'Access denied. Admin only.';
      errorEl.style.display = 'flex';
      await supabaseClient.auth.signOut();
      btn.disabled = false;
      btnText.textContent = 'Sign In as Admin';
      return;
    }

    localStorage.setItem('ea-authenticated', 'true');
    localStorage.setItem('ea-user-role', 'admin');
    localStorage.setItem('ea-user-name', adminUser.full_name);
    localStorage.setItem('ea-user-id', adminUser.id);
    localStorage.setItem('ea-user-email', email);

    window.location.href = 'dashboard-admin.html';

  } catch (err) {
    console.error('Admin login error:', err);
    errorText.textContent = 'Something went wrong. Please try again.';
    errorEl.style.display = 'flex';
    btn.disabled = false;
    btnText.textContent = 'Sign In as Admin';
  }
});