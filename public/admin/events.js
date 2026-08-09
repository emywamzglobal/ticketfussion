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

    const file =
        document.getElementById("banner_image").files[0];

    if (!file) {

        alert("Please select a banner image.");

        return;

    }

    try {

        // Upload image to R2
        const formData = new FormData();

        formData.append("file", file);

        const uploadResponse = await fetch(
            "/api/upload",
            {
                method: "POST",
                body: formData
            }
        );

        if (!uploadResponse.ok) {

            throw new Error("Image upload failed.");

        }

        const uploadResult =
            await uploadResponse.json();

        // Save event
        const payload = {

            title,
            category,
            description,
            banner_image: uploadResult.url

        };

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

/* ==========================================================
   LOAD EVENTS
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadEventsList
);

async function loadEventsList() {

    const container =
        document.getElementById(
            "events-list"
        );

    if (!container) return;

    try {

        const response =
            await fetch("/api/events");

        const events =
            await response.json();

        if (!events.length) {

            container.innerHTML =
                "<p>No events found.</p>";

            return;

        }

        container.innerHTML =
            events.map(event => `
                        <div class="admin-record">

            <div class="record-info">

                <strong>
                    ${event.title}
                </strong>

                <br>

                ${event.category}

            </div>

            <div class="record-actions">

                <button
                    class="btn btn-outline"
                    onclick="editEvent(${event.id})">

                    Edit

                </button>

                <button
                    class="btn btn-danger"
                    onclick="deleteEventRecord(${event.id})">

                    Delete

                </button>

            </div>

        </div>

    `).join("");

    }

    catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load events.</p>";

    }

}

/* ==========================================================
   DELETE EVENT
========================================================== */

async function deleteEventRecord(id) {

    if (
        !confirm(
            "Delete this event?"
        )
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/events/${id}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            throw new Error();

        }

        loadEventsList();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete event."
        );

    }

}