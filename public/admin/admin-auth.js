/* ==========================================================
   ADMIN AUTH
========================================================== */

const ADMIN_SESSION_KEY = "admin_session";

/* ==========================================================
   GET SESSION
========================================================== */

function getAdminSession() {

    return localStorage.getItem(
        ADMIN_SESSION_KEY
    );

}

/* ==========================================================
   SAVE SESSION
========================================================== */

function saveAdminSession(token) {

    localStorage.setItem(

        ADMIN_SESSION_KEY,

        token

    );

}

/* ==========================================================
   CLEAR SESSION
========================================================== */

function clearAdminSession() {

    localStorage.removeItem(

        ADMIN_SESSION_KEY

    );

}

/* ==========================================================
   REQUIRE ADMIN
========================================================== */

async function requireAdmin() {

    const token = getAdminSession();

    if (!token) {

        window.location.href =
            "/admin/login.html";

        return;

    }

    try {

        const response = await fetch(

            "/api/admin/session",

            {

                headers: {

                    Authorization: token

                }

            }

        );

        const result = await response.json();

        if (!result.success) {

            clearAdminSession();

            window.location.href =
                "/admin/login.html";

            return;

        }

    }

    catch (error) {

        console.error(error);

        clearAdminSession();

        window.location.href =
            "/admin/login.html";

    }

}

/* ==========================================================
   LOGOUT
========================================================== */

async function logoutAdmin() {

    const token = getAdminSession();

    if (!token) {

        window.location.href =
            "/admin/login.html";

        return;

    }

    try {

        await fetch(

            "/api/admin/logout",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    session_token: token

                })

            }

        );

    }

    catch (error) {

        console.error(error);

    }

    clearAdminSession();

    window.location.href =
        "/admin/login.html";

}

/* ==========================================================
   INITIALIZE
========================================================== */

requireAdmin();

const logoutButton =
    document.getElementById("logout-btn");

if (logoutButton) {

    logoutButton.addEventListener(

        "click",

        logoutAdmin

    );

}