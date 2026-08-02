/* ==========================================================
   ADMIN LOGIN
========================================================== */

const loginForm =
    document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener(

        "submit",

        async (e) => {

            e.preventDefault();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            try {

                const response = await fetch(

                    "/api/admin/login",

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            email,

                            password

                        })

                    }

                );

                const result =
                    await response.json();

                if (!result.success) {

                    alert(result.message);

                    return;

                }

                window.location.href =
                    "/admin/events.html";

            }

            catch (error) {

                console.error(error);

                alert(
                    "Unable to login. Please try again."
                );

            }

        }

    );

}