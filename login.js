document.addEventListener('DOMContentLoaded', function () {

  // ---- Tab Switching ----
  window.switchTab = function(tab) {
    const portalPanel = document.getElementById('panel-portal');
    const adminPanel = document.getElementById('panel-admin');
    const portalTab = document.getElementById('tab-portal');
    const adminTab = document.getElementById('tab-admin');

    if (tab === 'portal') {
      portalPanel.style.display = 'block';
      adminPanel.style.display = 'none';
      portalTab.classList.add('active');
      adminTab.classList.remove('active');
    } else {
      portalPanel.style.display = 'none';
      adminPanel.style.display = 'block';
      adminTab.classList.add('active');
      portalTab.classList.remove('active');
    }
  }

  // ---- PIN visibility toggle ----
  const togglePin = document.getElementById('ea-toggle-pin');
  const pinInput = document.getElementById('ea-portal-pin');

  if (togglePin && pinInput) {
    togglePin.addEventListener('click', function () {
      const isPassword = pinInput.type === 'password';
      pinInput.type = isPassword ? 'text' : 'password';
      this.querySelector('i').classList.toggle('fa-eye');
      this.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }

  // ---- Password visibility toggle ----
  const togglePassword = document.getElementById('ea-toggle-password');
  const passwordInput = document.getElementById('ea-admin-password');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      this.querySelector('i').classList.toggle('fa-eye');
      this.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }

  // ---- Portal Login (Parent & Teacher) ----
  const portalForm = document.getElementById('ea-portal-form');
  const portalError = document.getElementById('ea-portal-error');
  const portalErrorText = document.getElementById('ea-portal-error-text');
  const portalBtn = document.getElementById('ea-portal-btn');
  const portalBtnText = document.getElementById('ea-portal-btn-text');

  if (portalForm) {
    portalForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      portalError.style.display = 'none';

      const id = document.getElementById('ea-portal-id').value.trim().toUpperCase();
      const password = document.getElementById('ea-portal-pin').value.trim();

      if (!id || !password) {
        portalErrorText.textContent = 'Please enter both your ID and password.';
        portalError.style.display = 'flex';
        return;
      }

      portalBtn.disabled = true;
      portalBtnText.textContent = 'Signing in...';

      try {

        // ---- TEACHER LOGIN ----
        if (id.startsWith('EAT-')) {

          const { data: teacherData, error: teacherError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('staff_id', id)
            .eq('role', 'teacher');

          console.log('Teacher lookup:', teacherData, teacherError);

          if (teacherError || !teacherData || teacherData.length === 0) {
            portalErrorText.textContent = 'Staff ID not found. Please check and try again.';
            portalError.style.display = 'flex';
            portalBtn.disabled = false;
            portalBtnText.textContent = 'Sign In';
            return;
          }

          const teacher = teacherData[0];

          if (teacher.portal_password !== password) {
            portalErrorText.textContent = 'Incorrect password. Please try again.';
            portalError.style.display = 'flex';
            portalBtn.disabled = false;
            portalBtnText.textContent = 'Sign In';
            return;
          }

          // Sign in with Supabase Auth for RLS
          await supabaseClient.auth.signInWithPassword({
            email: teacher.email,
            password: 'Teacher@2026'
          });

          localStorage.setItem('ea-user-role', 'teacher');
          localStorage.setItem('ea-user-name', teacher.full_name);
          localStorage.setItem('ea-user-email', teacher.email);
          localStorage.setItem('ea-user-id', teacher.id);

          window.location.href = 'dashboard-teacher.html';

        } else {

          // ---- PARENT LOGIN ----
          // ID is Student ID — password is student's last name

          const { data: studentData, error: studentError } = await supabaseClient
            .from('students')
            .select('*')
            .eq('student_code', id);

          console.log('Student lookup:', studentData, studentError);

          if (studentError || !studentData || studentData.length === 0) {
            portalErrorText.textContent = 'Student ID not found. Please check and try again.';
            portalError.style.display = 'flex';
            portalBtn.disabled = false;
            portalBtnText.textContent = 'Sign In';
            return;
          }

          const student = studentData[0];

          // Get student last name
          const studentLastName = student.full_name.split(' ').pop().toLowerCase();
          const enteredPassword = password.toLowerCase();

          console.log('Student last name:', studentLastName, 'Entered:', enteredPassword);

          if (studentLastName !== enteredPassword) {
            portalErrorText.textContent = 'Incorrect password. Your password is your child\'s last name.';
            portalError.style.display = 'flex';
            portalBtn.disabled = false;
            portalBtnText.textContent = 'Sign In';
            return;
          }

          if (!student.parent_id) {
            portalErrorText.textContent = 'No parent account linked to this student. Contact the school.';
            portalError.style.display = 'flex';
            portalBtn.disabled = false;
            portalBtnText.textContent = 'Sign In';
            return;
          }

          // Get parent details
          const { data: parentData, error: parentError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', student.parent_id)
            .eq('role', 'parent');

          console.log('Parent lookup:', parentData, parentError);

          if (parentError || !parentData || parentData.length === 0) {
            portalErrorText.textContent = 'Parent account not found. Contact the school.';
            portalError.style.display = 'flex';
            portalBtn.disabled = false;
            portalBtnText.textContent = 'Sign In';
            return;
          }

          const parent = parentData[0];

          // Sign in with Supabase Auth for RLS
          await supabaseClient.auth.signInWithPassword({
            email: parent.email,
            password: 'Parent@2026'
          });

          localStorage.setItem('ea-user-role', 'parent');
          localStorage.setItem('ea-user-name', parent.full_name);
          localStorage.setItem('ea-user-email', parent.email);
          localStorage.setItem('ea-user-id', parent.id);
          localStorage.setItem('ea-student-id', student.id);

          window.location.href = 'dashboard-parent.html';
        }

      } catch (err) {
        console.error('Login error:', err);
        portalErrorText.textContent = 'Something went wrong. Please try again.';
        portalError.style.display = 'flex';
        portalBtn.disabled = false;
        portalBtnText.textContent = 'Sign In';
      }
    });
  }

  // ---- Admin Login ----
  const adminForm = document.getElementById('ea-admin-form');
  const adminError = document.getElementById('ea-admin-error');
  const adminErrorText = document.getElementById('ea-admin-error-text');
  const adminBtn = document.getElementById('ea-admin-btn');
  const adminBtnText = document.getElementById('ea-admin-btn-text');

  if (adminForm) {
    adminForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      adminError.style.display = 'none';

      const email = document.getElementById('ea-admin-email').value.trim();
      const password = document.getElementById('ea-admin-password').value.trim();

      if (!email || !password) {
        adminErrorText.textContent = 'Please enter your email and password.';
        adminError.style.display = 'flex';
        return;
      }

      adminBtn.disabled = true;
      adminBtnText.textContent = 'Signing in...';

      try {
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          adminErrorText.textContent = 'Invalid email or password.';
          adminError.style.display = 'flex';
          adminBtn.disabled = false;
          adminBtnText.textContent = 'Sign In as Admin';
          return;
        }

        const { data: userData } = await supabaseClient
          .from('users')
          .select('full_name, role')
          .eq('email', email)
          .single();

        if (!userData || userData.role !== 'admin') {
          adminErrorText.textContent = 'You do not have admin access.';
          adminError.style.display = 'flex';
          adminBtn.disabled = false;
          adminBtnText.textContent = 'Sign In as Admin';
          await supabaseClient.auth.signOut();
          return;
        }

        localStorage.setItem('ea-user-role', 'admin');
        localStorage.setItem('ea-user-name', userData.full_name);
        localStorage.setItem('ea-user-email', email);

        window.location.href = 'dashboard-admin.html';

      } catch (err) {
        adminErrorText.textContent = 'Something went wrong. Please try again.';
        adminError.style.display = 'flex';
        adminBtn.disabled = false;
        adminBtnText.textContent = 'Sign In as Admin';
      }
    });
  }

});