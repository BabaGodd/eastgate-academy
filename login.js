/* =========================================================
   EASTGATE ACADEMY
   PREMIUM PORTAL LOGIN SYSTEM
========================================================= */


/* =========================================================
   SPLASH SCREEN
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    const splash = document.getElementById('ea-splash');

    if (!splash) return;


    /*
        Don't show splash repeatedly during the same session.
    */

    if (sessionStorage.getItem('ea-splash-shown')) {

        splash.style.display = 'none';

        document.body.style.overflow = '';

        return;
    }


    sessionStorage.setItem('ea-splash-shown', 'true');


    function hideSplash() {

        splash.classList.add('hidden');

        setTimeout(() => {

            splash.style.display = 'none';

            document.body.style.overflow = '';

        }, 650);
    }


    /*
        Prevent page scrolling while splash is visible.
    */

    document.body.style.overflow = 'hidden';


    /*
        Normal splash duration.
    */

    setTimeout(hideSplash, 2800);


    /*
        Emergency fallback.
        Prevents splash from getting stuck.
    */

    setTimeout(() => {

        if (splash.style.display !== 'none') {

            splash.classList.add('hidden');

            splash.style.display = 'none';

            document.body.style.overflow = '';
        }

    }, 4500);

});


/* =========================================================
   TAB SWITCHING
========================================================= */

function switchTab(tab) {

    const portalPanel =
        document.getElementById('panel-portal');

    const adminPanel =
        document.getElementById('panel-admin');

    const portalTab =
        document.getElementById('tab-portal');

    const adminTab =
        document.getElementById('tab-admin');


    if (!portalPanel || !adminPanel) return;


    if (tab === 'portal') {

        portalPanel.style.display = 'block';

        adminPanel.style.display = 'none';

        portalTab?.classList.add('active');

        adminTab?.classList.remove('active');

    } else {

        portalPanel.style.display = 'none';

        adminPanel.style.display = 'block';

        portalTab?.classList.remove('active');

        adminTab?.classList.add('active');
    }
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

document
    .getElementById('ea-toggle-pin')
    ?.addEventListener('click', function () {

        const input =
            document.getElementById('ea-portal-pin');

        const icon =
            this.querySelector('i');

        if (!input || !icon) return;


        if (input.type === 'password') {

            input.type = 'text';

            icon.classList.replace(
                'fa-eye',
                'fa-eye-slash'
            );

        } else {

            input.type = 'password';

            icon.classList.replace(
                'fa-eye-slash',
                'fa-eye'
            );
        }
    });


document
    .getElementById('ea-toggle-password')
    ?.addEventListener('click', function () {

        const input =
            document.getElementById('ea-admin-password');

        const icon =
            this.querySelector('i');

        if (!input || !icon) return;


        if (input.type === 'password') {

            input.type = 'text';

            icon.classList.replace(
                'fa-eye',
                'fa-eye-slash'
            );

        } else {

            input.type = 'password';

            icon.classList.replace(
                'fa-eye-slash',
                'fa-eye'
            );
        }
    });


/* =========================================================
   FORGOT PASSWORD
========================================================= */

document
    .getElementById('ea-forgot-link')
    ?.addEventListener('click', function (e) {

        e.preventDefault();

        const forgotForm =
            document.getElementById('ea-forgot-form');

        if (!forgotForm) return;


        if (
            forgotForm.style.display === 'none' ||
            !forgotForm.style.display
        ) {

            forgotForm.style.display = 'flex';

        } else {

            forgotForm.style.display = 'none';
        }
    });


document
    .getElementById('ea-forgot-submit')
    ?.addEventListener('click', async function () {

        const idInput =
            document.getElementById('ea-forgot-id');

        const success =
            document.getElementById('ea-forgot-success');

        const button = this;

        if (!idInput || !success) return;


        const id =
            idInput.value.trim();


        if (!id) {

            idInput.focus();

            return;
        }


        const originalText =
            button.innerHTML;


        button.disabled = true;

        button.innerHTML =
            '<span>Sending request...</span>' +
            '<span class="ea-login-btn-icon">' +
            '<i class="fas fa-spinner fa-spin"></i>' +
            '</span>';


        try {

            const { error } =
                await supabaseClient
                    .from('messages')
                    .insert({

                        sender_role: 'parent',

                        content:
                            `Password reset request for ID: ${id}`,

                        created_at:
                            new Date().toISOString()

                    });


            if (error) {

                console.error(
                    'Password reset request error:',
                    error
                );

                alert(
                    'Unable to send your request. Please try again.'
                );

                button.disabled = false;

                button.innerHTML = originalText;

                return;
            }


            success.style.display = 'flex';

            idInput.value = '';

            button.style.display = 'none';


        } catch (error) {

            console.error(
                'Forgot password error:',
                error
            );

            alert(
                'Something went wrong. Please try again.'
            );

            button.disabled = false;

            button.innerHTML = originalText;
        }

    });


/* =========================================================
   PARENT / TEACHER LOGIN
========================================================= */

document
    .getElementById('ea-portal-form')
    ?.addEventListener('submit', async function (e) {

        e.preventDefault();


        const id =
            document
                .getElementById('ea-portal-id')
                .value
                .trim();


        const password =
            document
                .getElementById('ea-portal-pin')
                .value
                .trim();


        const btn =
            document.getElementById('ea-portal-btn');


        const btnText =
            document.getElementById('ea-portal-btn-text');


        const errorEl =
            document.getElementById('ea-portal-error');


        const errorText =
            document.getElementById('ea-portal-error-text');


        if (!id || !password) {

            showPortalError(
                'Please enter your ID and password.'
            );

            return;
        }


        errorEl.style.display = 'none';

        btn.disabled = true;

        btnText.textContent = 'Signing in...';


        try {


            /* =================================================
               CHECK TEACHER
            ================================================= */

            const { data: teacher, error: teacherError } =
                await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('staff_id', id)
                    .eq('role', 'teacher')
                    .single();


            /*
                PGRST116 means no matching record.
                It is not treated as a fatal login error.
            */

            if (teacherError &&
                teacherError.code !== 'PGRST116') {

                console.warn(
                    'Teacher lookup warning:',
                    teacherError
                );
            }


            if (teacher) {

                if (
                    password !==
                    teacher.portal_password
                ) {

                    showPortalError(
                        'Incorrect password. Please try again.'
                    );

                    return;
                }


                /*
                    Store teacher session information.
                */

                localStorage.setItem(
                    'ea-authenticated',
                    'true'
                );

                localStorage.setItem(
                    'ea-user-role',
                    'teacher'
                );

                localStorage.setItem(
                    'ea-user-id',
                    teacher.id
                );

                localStorage.setItem(
                    'ea-user-name',
                    teacher.full_name
                );

                localStorage.setItem(
                    'ea-staff-id',
                    teacher.staff_id
                );

                localStorage.setItem(
                    'ea-user-email',
                    teacher.email
                );


                /*
                    Optional Supabase Auth session.
                */

                if (teacher.email) {

                    const {
                        error: authError
                    } =
                        await supabaseClient.auth
                            .signInWithPassword({

                                email: teacher.email,

                                password: password

                            });


                    if (authError) {

                        console.warn(
                            'Supabase auth sign-in optional warning:',
                            authError.message
                        );
                    }
                }


                window.location.href =
                    'dashboard-teacher.html';

                return;
            }


            /* =================================================
               CHECK PARENT / STUDENT
            ================================================= */

            const {
                data: student,
                error: studentError
            } =
                await supabaseClient
                    .from('students')
                    .select('*, classes(name)')
                    .eq('student_code', id)
                    .single();


            if (
                studentError &&
                studentError.code !== 'PGRST116'
            ) {

                console.warn(
                    'Student lookup warning:',
                    studentError
                );
            }


            if (student) {

                const familyName =
                    student.family_name || '';


                const passwordMatch =
                    password.toLowerCase() ===
                    familyName.toLowerCase();


                if (!passwordMatch) {

                    showPortalError(
                        "Incorrect password. Please use your child's family name."
                    );

                    return;
                }


                /* =============================================
                   FIND LINKED PARENT
                ============================================== */

                let parentUser = null;


                if (student.parent_id) {

                    const {
                        data: linkedParent,
                        error: parentError
                    } =
                        await supabaseClient
                            .from('users')
                            .select('*')
                            .eq('id', student.parent_id)
                            .eq('role', 'parent')
                            .single();


                    if (
                        parentError &&
                        parentError.code !== 'PGRST116'
                    ) {

                        console.warn(
                            'Parent lookup warning:',
                            parentError
                        );
                    }


                    parentUser =
                        linkedParent || null;
                }


                /* =============================================
                   OPTIONAL SUPABASE AUTH
                ============================================== */

                if (parentUser?.email) {

                    try {

                        await supabaseClient.auth
                            .signInWithPassword({

                                email:
                                    parentUser.email,

                                password:
                                    password

                            });

                    } catch (authError) {

                        console.warn(
                            'Parent Supabase auth warning:',
                            authError
                        );
                    }
                }


                /* =============================================
                   STORE PARENT SESSION
                ============================================== */

                localStorage.setItem(
                    'ea-authenticated',
                    'true'
                );

                localStorage.setItem(
                    'ea-user-role',
                    'parent'
                );

                localStorage.setItem(
                    'ea-user-id',
                    parentUser?.id || student.id
                );

                const parentDisplayName =
                    parentUser?.full_name ||
                    'Parent';

                localStorage.setItem(
                    'ea-user-name',
                    parentDisplayName
                );

                localStorage.setItem(
                    'ea-parent-name',
                    parentDisplayName
                );

                localStorage.setItem(
                    'ea-student-id',
                    student.id
                );

                localStorage.setItem(
                    'ea-student-code',
                    student.student_code
                );

                localStorage.setItem(
                    'ea-student-name',
                    student.full_name
                );

                localStorage.setItem(
                    'ea-student-class',
                    student.classes?.name || ''
                );

                localStorage.setItem(
                    'ea-user-email',
                    parentUser?.email || ''
                );


                window.location.href =
                    'dashboard-parent.html';

                return;
            }


            showPortalError(
                'ID not found. Please check your Student ID or Staff ID.'
            );


        } catch (err) {

            console.error(
                'Login error:',
                err
            );

            showPortalError(
                'Something went wrong. Please try again.'
            );

        }


        /*
            Restore button state.
        */

        btn.disabled = false;

        btnText.textContent = 'Sign In';


        /* =====================================================
           ERROR HANDLER
        ====================================================== */

        function showPortalError(message) {

            errorText.textContent = message;

            errorEl.style.display = 'flex';

            btn.disabled = false;

            btnText.textContent = 'Sign In';
        }

    });


/* =========================================================
   ADMIN LOGIN
========================================================= */

document
    .getElementById('ea-admin-form')
    ?.addEventListener('submit', async function (e) {

        e.preventDefault();


        const email =
            document
                .getElementById('ea-admin-email')
                .value
                .trim();


        const password =
            document
                .getElementById('ea-admin-password')
                .value
                .trim();


        const btn =
            document.getElementById('ea-admin-btn');


        const btnText =
            document.getElementById('ea-admin-btn-text');


        const errorEl =
            document.getElementById('ea-admin-error');


        const errorText =
            document.getElementById('ea-admin-error-text');


        if (!email || !password) {

            errorText.textContent =
                'Please enter your email and password.';

            errorEl.style.display = 'flex';

            return;
        }


        errorEl.style.display = 'none';

        btn.disabled = true;

        btnText.textContent = 'Signing in...';


        try {


            /* =================================================
               SUPABASE AUTHENTICATION
            ================================================= */

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            if (error) {

                errorText.textContent =
                    'Invalid email or password. Please try again.';

                errorEl.style.display = 'flex';

                btn.disabled = false;

                btnText.textContent =
                    'Sign In as Admin';

                return;
            }


            /* =================================================
               VERIFY ADMIN ROLE
            ================================================= */

            const {
                data: adminUser,
                error: adminError
            } =
                await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .eq('role', 'admin')
                    .single();


            if (adminError || !adminUser) {

                errorText.textContent =
                    'Access denied. Admin only.';

                errorEl.style.display = 'flex';


                await supabaseClient.auth.signOut();


                btn.disabled = false;

                btnText.textContent =
                    'Sign In as Admin';

                return;
            }


            /* =================================================
               STORE ADMIN SESSION
            ================================================= */

            localStorage.setItem(
                'ea-authenticated',
                'true'
            );

            localStorage.setItem(
                'ea-user-role',
                'admin'
            );

            localStorage.setItem(
                'ea-user-name',
                adminUser.full_name
            );

            localStorage.setItem(
                'ea-user-id',
                adminUser.id
            );

            localStorage.setItem(
                'ea-user-email',
                email
            );


            /* =================================================
               REDIRECT
            ================================================= */

            window.location.href =
                'dashboard-admin.html';


        } catch (err) {

            console.error(
                'Admin login error:',
                err
            );


            errorText.textContent =
                'Something went wrong. Please try again.';

            errorEl.style.display = 'flex';


            btn.disabled = false;

            btnText.textContent =
                'Sign In as Admin';
        }

    });