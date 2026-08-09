/* ==========================================================
   CUSTOMER AUTH
========================================================== */

const CUSTOMER_SESSION_KEY =
    "customer_session";

/* ==========================================================
   GET SESSION
========================================================== */

function getCustomerSession() {

    return localStorage.getItem(
        CUSTOMER_SESSION_KEY
    );

}

/* ==========================================================
   SAVE SESSION
========================================================== */

function saveCustomerSession(token) {

    localStorage.setItem(
        CUSTOMER_SESSION_KEY,
        token
    );

}

/* ==========================================================
   CLEAR SESSION
========================================================== */

function clearCustomerSession() {

    localStorage.removeItem(
        CUSTOMER_SESSION_KEY
    );

}

/* ==========================================================
   REGISTER
========================================================== */

async function registerCustomer(event) {

    event.preventDefault();

    const password =
        document.getElementById(
            "signup-password"
        ).value;

    const confirmPassword =
        document.getElementById(
            "confirm-password"
        ).value;

    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;

    }

    const payload = {

        first_name:
            document.getElementById(
                "first-name"
            ).value,

        last_name:
            document.getElementById(
                "last-name"
            ).value,

        email:
            document.getElementById(
                "signup-email"
            ).value,

        phone:
            document.getElementById(
                "signup-phone"
            ).value,

        password

    };

    try {

        const response =
            await fetch(

                "/api/customer/register",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }

            );

        const result =
            await response.json();

        if (!result.success) {

            alert(
                result.message
            );

            return;

        }

        alert(
            "Account created successfully."
        );

        window.location.href =
            "/login.html";

    }

    catch (error) {

        console.error(error);

        alert(
            "Registration failed."
        );

    }

}

/* ==========================================================
   LOGIN
========================================================== */

async function loginCustomer(event) {

    event.preventDefault();

    try {

        const response =
            await fetch(

                "/api/customer/login",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            email:
                                document
                                .getElementById(
                                    "login-email"
                                )
                                .value,

                            password:
                                document
                                .getElementById(
                                    "login-password"
                                )
                                .value

                        })

                }

            );

        const result =
            await response.json();

        if (!result.success) {

            alert(
                result.message
            );

            return;

        }

        saveCustomerSession(
            result.session_token
        );

        window.location.href =
            "/";

    }

    catch (error) {

        console.error(error);

        alert(
            "Login failed."
        );

    }

}

/* ==========================================================
   CHECK SESSION
========================================================== */

async function checkCustomerSession() {

    const token =
        getCustomerSession();

    if (!token) {

        return null;

    }

    try {

        const response =
            await fetch(

                "/api/customer/session",

                {

                    headers: {

                        Authorization:
                            token

                    }

                }

            );

        const result =
            await response.json();

        if (!result.success) {

            clearCustomerSession();

            return null;

        }

        return result.customer;

    }

    catch (error) {

        console.error(error);

        clearCustomerSession();

        return null;

    }

}

/* ==========================================================
   LOGOUT
========================================================== */

async function logoutCustomer() {

    const token =
        getCustomerSession();

    if (!token) {

        return;

    }

    try {

        await fetch(

            "/api/customer/logout",

            {

                method: "POST",

                headers: {

                    Authorization:
                        `Bearer ${token}`

                }

            }

        );

    }

    catch (error) {

        console.error(error);

    }

    clearCustomerSession();

    window.location.href =
        "/";

}

/* ==========================================================
   NAVBAR
========================================================== */

async function updateNavbar() {

    const customer =
        await checkCustomerSession();

    const loginLink =
        document.getElementById(
            "nav-login"
        );

    const registerLink =
        document.getElementById(
            "nav-register"
        );

    const logoutLink =
        document.getElementById(
            "logout-btn"
        );

    if (customer) {

        if (loginLink)
            loginLink.style.display =
                "none";

        if (registerLink)
            registerLink.style.display =
                "none";

        if (logoutLink)
            logoutLink.style.display =
                "inline-flex";

    }

    else {

        if (loginLink)
            loginLink.style.display =
                "inline-flex";

        if (registerLink)
            registerLink.style.display =
                "inline-flex";

        if (logoutLink)
            logoutLink.style.display =
                "none";

    }

}

/* ==========================================================
   INIT
========================================================== */

const signupForm =
    document.getElementById(
        "signup-form"
    );

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        registerCustomer
    );

}

const loginForm =
    document.getElementById(
        "login-form"
    );

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        loginCustomer
    );

}

const logoutButton =
    document.getElementById(
        "logout-btn"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutCustomer
    );

}

updateNavbar();