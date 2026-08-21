/* ==========================================================
   EVENTS
========================================================== */

let editingEventId = null;
let existingBannerImage = "";


/* ==========================================================
   FORM
========================================================== */

const form =
    document.getElementById("event-form");

if (form) {

    form.addEventListener(
        "submit",
        handleEventSubmit
    );

}


/* ==========================================================
   SUBMIT EVENT
========================================================== */

async function handleEventSubmit(e) {

    e.preventDefault();

    if (editingEventId) {

        await updateEventRecord();

    } else {

        await createEvent(e);

    }

}


/* ==========================================================
   CREATE EVENT
========================================================== */

async function createEvent(e) {

    e.preventDefault();

    const title =
        document
            .getElementById("title")
            .value
            .trim();

    const category =
        document
            .getElementById("category")
            .value
            .trim();

    const description =
        document
            .getElementById("description")
            .value
            .trim();

    const file =
        document
            .getElementById("banner_image")
            .files[0];


    if (!file) {

        alert(
            "Please select a banner image."
        );

        return;

    }


    try {

        /* ==========================================
           UPLOAD IMAGE
        ========================================== */

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );


        const uploadResponse =
            await fetch(
                "/api/upload",
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!uploadResponse.ok) {

            throw new Error(
                "Image upload failed."
            );

        }


        const uploadResult =
            await uploadResponse.json();


        /* ==========================================
           CREATE EVENT
        ========================================== */

        const payload = {

            title,

            category,

            description,

            banner_image:
                uploadResult.url

        };


        const response =
            await fetch(
                "/api/events",
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


        if (!response.ok) {

            throw new Error(
                "Unable to save event."
            );

        }


        alert(
            "Event published successfully."
        );


        form.reset();

        await loadEventsList();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to create event."
        );

    }

}


/* ==========================================================
   EDIT EVENT
========================================================== */

async function editEvent(id) {

    try {

        const response =
            await fetch(
                `/api/events/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load event."
            );

        }


        const event =
            await response.json();


        if (!event) {

            throw new Error(
                "Event not found."
            );

        }


        /* ==========================================
           STORE EDIT STATE
        ========================================== */

        editingEventId =
            id;

        existingBannerImage =
            event.banner_image || "";


        /* ==========================================
           FILL FORM
        ========================================== */

        document
            .getElementById("title")
            .value =
                event.title || "";


        document
            .getElementById("category")
            .value =
                event.category || "";


        document
            .getElementById("description")
            .value =
                event.description || "";


        /* ==========================================
           CHANGE BUTTON
        ========================================== */

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.textContent =
                "Update Event";

        }


        /* ==========================================
           ADD CANCEL BUTTON
        ========================================== */

        addCancelEditButton();


        /* ==========================================
           SCROLL TO FORM
        ========================================== */

        form.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to load event."
        );

    }

}


/* ==========================================================
   UPDATE EVENT
========================================================== */

async function updateEventRecord() {

    const title =
        document
            .getElementById("title")
            .value
            .trim();

    const category =
        document
            .getElementById("category")
            .value
            .trim();

    const description =
        document
            .getElementById("description")
            .value
            .trim();

    const file =
        document
            .getElementById("banner_image")
            .files[0];


    try {

        let bannerImage =
            existingBannerImage;


        /* ==========================================
           UPLOAD NEW IMAGE ONLY IF SELECTED
        ========================================== */

        if (file) {

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );


            const uploadResponse =
                await fetch(
                    "/api/upload",
                    {

                        method: "POST",

                        body:
                            formData

                    }
                );


            if (!uploadResponse.ok) {

                throw new Error(
                    "Image upload failed."
                );

            }


            const uploadResult =
                await uploadResponse.json();


            bannerImage =
                uploadResult.url;

        }


        /* ==========================================
           UPDATE EVENT
        ========================================== */

        const payload = {

            title,

            category,

            description,

            banner_image:
                bannerImage

        };


        const response =
            await fetch(
                `/api/events/${editingEventId}`,
                {

                    method: "PUT",

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


        if (!response.ok) {

            throw new Error(
                "Unable to update event."
            );

        }


        alert(
            "Event updated successfully."
        );


        resetEventForm();

        await loadEventsList();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to update event."
        );

    }

}


/* ==========================================================
   CANCEL EDIT
========================================================== */

function addCancelEditButton() {

    if (
        document.getElementById(
            "cancel-event-edit"
        )
    ) {

        return;

    }


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (!submitButton) return;


    const cancelButton =
        document.createElement(
            "button"
        );


    cancelButton.type =
        "button";

    cancelButton.id =
        "cancel-event-edit";

    cancelButton.className =
        "btn btn-outline";

    cancelButton.textContent =
        "Cancel Edit";


    cancelButton.addEventListener(
        "click",
        resetEventForm
    );


    submitButton.parentElement
        .insertBefore(
            cancelButton,
            submitButton
        );

}


/* ==========================================================
   RESET FORM
========================================================== */

function resetEventForm() {

    editingEventId =
        null;

    existingBannerImage =
        "";


    form.reset();


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Publish Event";

    }


    const cancelButton =
        document.getElementById(
            "cancel-event-edit"
        );


    if (cancelButton) {

        cancelButton.remove();

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
            await fetch(
                "/api/events"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load events."
            );

        }


        const events =
            await response.json();


        if (!events.length) {

            container.innerHTML =
                "<p>No events found.</p>";

            return;

        }


        container.innerHTML =
            events.map(
                event => `

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

            `
            ).join("");

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


        await loadEventsList();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete event."
        );

    }

}