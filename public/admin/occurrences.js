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

    about_event:
        document.getElementById("about_event").value.trim(),

    event_gallery:
        "",

    event_information:
        document.getElementById("event_information").value.trim(),

    venue:
        document.getElementById("venue").value.trim(),

    venue_information:
        document.getElementById("venue_information").value.trim(),

    venue_layout:
        "",

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

/* ==========================================================
   LOAD OCCURRENCES LIST
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadOccurrencesList
);

async function loadOccurrencesList() {

    const container =
        document.getElementById(
            "occurrences-list"
        );

    if (!container) return;

    try {

        const response =
            await fetch(
                "/api/occurrences"
            );

        const occurrences =
            await response.json();

        if (!occurrences.length) {

            container.innerHTML =
                "<p>No occurrences found.</p>";

            return;

        }

        container.innerHTML =
            occurrences.map(
                occurrence => `

                <div class="admin-record">

                    <div class="record-info">

                        <strong>

                            ${occurrence.venue}

                        </strong>

                        <br>

                        ${occurrence.city},
                        ${occurrence.country}

                        <br>

                        ${occurrence.event_date}
                        ${occurrence.event_time}

                    </div>

                    <div class="record-actions">

                        <button
                            class="btn btn-outline"
                            onclick="editOccurrence(${occurrence.id})">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger"
                            onclick="deleteOccurrenceRecord(${occurrence.id})">

                            Delete

                        </button>

                    </div>

                </div>

            `
            ).join("");

    }

    catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load occurrences.</p>";

    }

}

/* ==========================================================
   DELETE OCCURRENCE
========================================================== */

async function deleteOccurrenceRecord(id) {

    if (
        !confirm(
            "Delete this occurrence?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/occurrences/${id}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            throw new Error();

        }

        await loadOccurrencesList();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete occurrence."
        );

    }

}