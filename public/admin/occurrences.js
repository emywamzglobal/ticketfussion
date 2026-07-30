/* ==========================================================
   OCCURRENCES
========================================================== */

const form =
    document.getElementById("occurrence-form");

if (form) {

    form.addEventListener(
        "submit",
        createOccurrence
    );

}

/* ==========================================================
   CREATE OCCURRENCE
========================================================== */

async function createOccurrence(e) {

    e.preventDefault();

    const payload = {

        event_id:
            document.getElementById("event_id").value,

        about_event:
            document.getElementById("about_event").value.trim(),

        event_gallery:
            document.getElementById("event_gallery").value.trim(),

        event_information:
            document.getElementById("event_information").value.trim(),

        venue:
            document.getElementById("venue").value.trim(),

        venue_information:
            document.getElementById("venue_information").value.trim(),

        venue_layout:
            document.getElementById("venue_layout").value.trim(),

        city:
            document.getElementById("city").value.trim(),

        country:
            document.getElementById("country").value.trim(),

        event_date:
            document.getElementById("event_date").value,

        event_time:
            document.getElementById("event_time").value

    };

    try {

        const response = await fetch(
            "/api/occurrences",
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
                "Unable to create occurrence."
            );

        }

        alert(
            "Occurrence created successfully."
        );

        form.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}