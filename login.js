// ============================================================
// EASTGATE ACADEMY — PREMIUM LOGIN SYSTEM
// ============================================================


// ============================================================
// SPLASH SCREEN
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const splash = document.getElementById("ea-splash");

    if (!splash) return;

    // Do not show splash repeatedly in the same session
    if (sessionStorage.getItem("ea-splash-shown")) {

        splash.style.display = "none";
        document.body.style.overflow = "";

        return;
    }

    sessionStorage.setItem("ea-splash-shown", "true");

    document.body.style.overflow = "hidden";

    function hideSplash() {

        splash.classList.add("hidden");

        setTimeout(() => {

            splash.style.display = "none";
            document.body.style.overflow = "";

        }, 650);
    }

    // Normal splash duration
    setTimeout(hideSplash, 2400);

    // Safety fallback
    setTimeout(() => {

        if (splash.style.display !== "none") {

            splash.classList.add("hidden");

            setTimeout(() => {

                splash.style.display = "none";
                document.body.style.overflow = "";

            }, 650);
        }

    }, 4000);

});


// ============================================================
// TAB SWITCHING
// ============================================================

function switchTab(tab) {

    const portalPanel = document.getElementById("panel-portal");
    const adminPanel = document.getElementById("panel-admin");

    const portalTab = document.getElementById("tab-portal");
    const adminTab = document.getElementById("tab-admin");

    if (!portalPanel || !adminPanel) return;

    const isPortal = tab === "portal";

    portalPanel.style.display = isPortal ? "block" : "none";
    adminPanel.style.display = isPortal ? "none" : "block";

    portalTab.classList.toggle("active", isPortal);
    adminTab.classList.toggle("active", !isPortal);

    // Clear errors when switching
    const portalError = document.getElementById("ea-portal-error");
    const adminError = document.getElementById("ea-admin-error");

    if (portalError) {
        portalError.style.display = "none";
    }

    if (adminError) {
        adminError.style.display = "none";
    }
}


// ============================================================
// PASSWORD VISIBILITY — PARENT / TEACHER
// ============================================================

document
    .getElementById("ea-toggle-pin")
    ?.addEventListener("click", function () {

        const input =
            document.getElementById("ea-portal-pin");

        const icon =
            this.querySelector("i");

        if (!input || !icon) return;

        if (input.type === "password") {

            input.type = "text";

            icon.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

            this.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            input.type = "password";

            icon.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

            this.setAttribute(
                "aria-label",
                "Show password"
            );
        }
    });


// ============================================================
// PASSWORD VISIBILITY — ADMIN
// ============================================================

document
    .getElementById("ea-toggle-password")
    ?.addEventListener("click", function () {

        const input =
            document.getElementById("ea-admin-password");

        const icon =
            this.querySelector("i");

        if (!input || !icon) return;

        if (input.type === "password") {

            input.type = "text";

            icon.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

            this.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            input.type = "password";

            icon.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

            this.setAttribute(
                "aria-label",
                "Show password"
            );
        }
    });


// ============================================================
// FORGOT PASSWORD — OPEN / CLOSE
// ============================================================

document
    .getElementById("ea-forgot-link")
    ?.addEventListener("click", function (e) {

        e.preventDefault();

        const forgotForm =
            document.getElementById("ea-forgot-form");

        if (!forgotForm) return;

        const isHidden =
            forgotForm.style.display === "none" ||
            forgotForm.style.display === "";

        forgotForm.style.display =
            isHidden ? "flex" : "none";

        if (isHidden) {

            setTimeout(() => {

                document
                    .getElementById("ea-forgot-id")
                    ?.focus();

            }, 100);
        }
    });


// ============================================================
// FORGOT PASSWORD — REQUEST
// ============================================================

document
    .getElementById("ea-forgot-submit")
    ?.addEventListener("click", async function () {

        const idInput =
            document.getElementById("ea-forgot-id");

        const success =
            document.getElementById("ea-forgot-success");

        const button = this;

        if (!idInput || !success) return;

        const id =
            idInput.value.trim();

        if (!id) {

            idInput.focus();

            return;
        }

        button.disabled = true;

        try {

            await supabaseClient
                .from("messages")
                .insert({

                    sender_role: "parent",

                    content:
                        `Password reset request for ID: ${id}`,

                    created_at:
                        new Date().toISOString()

                });

            success.style.display = "flex";

            idInput.value = "";

            button.style.display = "none";

        } catch (error) {

            console.error(
                "Password reset request error:",
                error
            );

            button.disabled = false;

        }

    });


// ============================================================
// PARENT / TEACHER LOGIN
// ============================================================

document
    .getElementById("ea-portal-form")
    ?.addEventListener("submit", async function (e) {

        e.preventDefault();

        const id =
            document
                .getElementById("ea-portal-id")
                .value
                .trim();

        const password =
            document
                .getElementById("ea-portal-pin")
                .value
                .trim();

        const btn =
            document.getElementById("ea-portal-btn");

        const btnText =
            document.getElementById("ea-portal-btn-text");

        const errorEl =
            document.getElementById("ea-portal-error");

        const errorText =
            document.getElementById("ea-portal-error-text");


        errorEl.style.display = "none";

        btn.disabled = true;

        btnText.textContent = "Signing in...";


        try {

            // ====================================================
            // CHECK TEACHER
            // ====================================================

            const { data: teacher } =
                await supabaseClient

                    .from("users")

                    .select("*")

                    .eq("staff_id", id)

                    .eq("role", "teacher")

                    .single();


            if (teacher) {

                if (
                    password !==
                    teacher.portal_password
                ) {

                    showPortalError(
                        "Incorrect password. Please try again."
                    );

                    return;
                }


                // -----------------------------------------------
                // Existing authentication storage
                // -----------------------------------------------

                localStorage.setItem(
                    "ea-authenticated",
                    "true"
                );

                localStorage.setItem(
                    "ea-user-role",
                    "teacher"
                );

                localStorage.setItem(
                    "ea-user-id",
                    teacher.id
                );

                localStorage.setItem(
                    "ea-user-name",
                    teacher.full_name
                );

                localStorage.setItem(
                    "ea-staff-id",
                    teacher.staff_id
                );

                localStorage.setItem(
                    "ea-user-email",
                    teacher.email
                );


                // Supabase Auth

                const { error: authError } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email: teacher.email,

                            password: password

                        });


                if (authError) {

                    console.warn(
                        "Supabase auth sign-in optional warning:",
                        authError.message
                    );
                }


                // Existing destination
                window.location.href =
                    "dashboard-teacher.html";

                return;
            }


            // ====================================================
            // CHECK PARENT
            // ====================================================

            const { data: student } =
                await supabaseClient

                    .from("students")

                    .select("*, classes(name)")

                    .eq("student_code", id)

                    .single();


            if (student) {

                const familyName =
                    student.family_name || "";


                const passwordMatch =
                    password.toLowerCase() ===
                    familyName.toLowerCase();


                if (!passwordMatch) {

                    showPortalError(
                        "Incorrect password. Please use your child's family name."
                    );

                    return;
                }


                // -----------------------------------------------
                // Find linked parent
                // -----------------------------------------------

                let parentUser = null;


                if (student.parent_id) {

                    const {
                        data: linkedParent
                    } =
                        await supabaseClient

                            .from("users")

                            .select("*")

                            .eq(
                                "id",
                                student.parent_id
                            )

                            .eq(
                                "role",
                                "parent"
                            )

                            .single();


                    parentUser =
                        linkedParent || null;
                }


                // -----------------------------------------------
                // Supabase Auth
                // -----------------------------------------------

                if (parentUser?.email) {

                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                parentUser.email,

                            password:
                                password

                        })
                        .catch(() => {});
                }


                // -----------------------------------------------
                // Existing localStorage values
                // -----------------------------------------------

                localStorage.setItem(
                    "ea-authenticated",
                    "true"
                );

                localStorage.setItem(
                    "ea-user-role",
                    "parent"
                );

                localStorage.setItem(
                    "ea-user-id",
                    parentUser?.id ||
                    student.id
                );

                localStorage.setItem(
                    "ea-user-name",
                    parentUser?.full_name ||
                    student.full_name
                );

                localStorage.setItem(
                    "ea-student-id",
                    student.id
                );

                localStorage.setItem(
                    "ea-student-code",
                    student.student_code
                );

                localStorage.setItem(
                    "ea-student-name",
                    student.full_name
                );

                localStorage.setItem(
                    "ea-student-class",
                    student.classes?.name || ""
                );

                localStorage.setItem(
                    "ea-user-email",
                    parentUser?.email || ""
                );


                // Existing destination
                window.location.href =
                    "dashboard-parent.html";

                return;
            }


            showPortalError(
                "ID not found. Please check your Student ID or Staff ID."
            );


        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            showPortalError(
                "Something went wrong. Please try again."
            );
        }


        function showPortalError(message) {

            errorText.textContent =
                message;

            errorEl.style.display =
                "flex";

            btn.disabled =
                false;

            btnText.textContent =
                "Sign in";
        }


        btn.disabled = false;

        btnText.textContent =
            "Sign in";

    });


// ============================================================
// ADMIN LOGIN
// ============================================================

document
    .getElementById("ea-admin-form")
    ?.addEventListener("submit", async function (e) {

        e.preventDefault();


        const email =
            document
                .getElementById("ea-admin-email")
                .value
                .trim();


        const password =
            document
                .getElementById("ea-admin-password")
                .value
                .trim();


        const btn =
            document.getElementById("ea-admin-btn");


        const btnText =
            document.getElementById("ea-admin-btn-text");


        const errorEl =
            document.getElementById("ea-admin-error");


        const errorText =
            document.getElementById("ea-admin-error-text");


        errorEl.style.display =
            "none";


        btn.disabled =
            true;


        btnText.textContent =
            "Signing in...";


        try {

            // ====================================================
            // SUPABASE AUTH
            // ====================================================

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
                    "Invalid email or password. Please try again.";

                errorEl.style.display =
                    "flex";

                btn.disabled =
                    false;

                btnText.textContent =
                    "Sign in securely";

                return;
            }


            // ====================================================
            // VERIFY ADMIN ROLE
            // ====================================================

            const {
                data: adminUser
            } =
                await supabaseClient

                    .from("users")

                    .select("*")

                    .eq("email", email)

                    .eq("role", "admin")

                    .single();


            if (!adminUser) {

                errorText.textContent =
                    "Access denied. Admin only.";

                errorEl.style.display =
                    "flex";


                await supabaseClient
                    .auth
                    .signOut();


                btn.disabled =
                    false;

                btnText.textContent =
                    "Sign in securely";

                return;
            }


            // ====================================================
            // EXISTING LOCAL STORAGE
            // ====================================================

            localStorage.setItem(
                "ea-authenticated",
                "true"
            );

            localStorage.setItem(
                "ea-user-role",
                "admin"
            );

            localStorage.setItem(
                "ea-user-name",
                adminUser.full_name
            );

            localStorage.setItem(
                "ea-user-id",
                adminUser.id
            );

            localStorage.setItem(
                "ea-user-email",
                email
            );


            // Existing destination
            window.location.href =
                "dashboard-admin.html";


        } catch (err) {

            console.error(
                "Admin login error:",
                err
            );


            errorText.textContent =
                "Something went wrong. Please try again.";


            errorEl.style.display =
                "flex";


            btn.disabled =
                false;


            btnText.textContent =
                "Sign in securely";
        }

    });