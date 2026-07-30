/* ==========================================================
   EVENTS
========================================================== */

const form =
    document.getElementById("event-form");

if (form) {

    form.addEventListener(
        "submit",
        createEvent
    );

}

/* ==========================================================
   CREATE EVENT
========================================================== */

async function createEvent(e) {

    e.preventDefault();

    const title =
        document.getElementById("title").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const banner =
        document.getElementById("banner_image").value.trim();

    const payload = {

        title,
        category,
        description,
        banner_image: banner

    };

    try {

        const response = await fetch(
            "/api/events",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(payload)

            }
        );

        if (!response.ok) {

            throw new Error(
                "Unable to save event."
            );

        }

        alert("Event published successfully.");

        form.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}