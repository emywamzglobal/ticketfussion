/* ==========================================================
   OCCURRENCES
========================================================== */

const form =
    document.getElementById("occurrence-form");

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadEvents();

    }
);

if (form) {

    form.addEventListener(
        "submit",
        createOccurrence
    );

}

/* ==========================================================
   LOAD EVENTS
========================================================== */

async function loadEvents() {

    const select =
        document.getElementById("event_id");

    try {

        const response =
            await fetch("/api/events");

        const events =
            await response.json();

        select.innerHTML =
            '<option value="">Select Event</option>';

        events.forEach(event => {

            const option =
                document.createElement("option");

            option.value =
                event.id;

            option.textContent =
                event.title;

            select.appendChild(option);

        });

    }

    catch (error) {

        console.error(error);

        select.innerHTML =
            '<option value="">Unable to load events</option>';

    }

}

/* ==========================================================
   CREATE OCCURRENCE
========================================================== */

async function createOccurrence(e) {

    e.preventDefault();

    const payload = {

        event_id:
            document.getElementById("event_id").value,

        venue:
            document.getElementById("venue").value.trim(),

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

        const response =
            await fetch(
                "/api/occurrences",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(payload)

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

        loadEvents();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}