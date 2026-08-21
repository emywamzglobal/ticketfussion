/* ==========================================================
   OCCURRENCES
========================================================== */

let editingOccurrenceId = null;
let existingVenueLayout = "";
let existingEventGallery = "";


const form =
    document.getElementById("occurrence-form");


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadEvents();
        loadOccurrencesList();

    }
);


if (form) {

    form.addEventListener(
        "submit",
        handleOccurrenceSubmit
    );

}


/* ==========================================================
   SUBMIT OCCURRENCE
========================================================== */

async function handleOccurrenceSubmit(e) {

    e.preventDefault();

    if (editingOccurrenceId) {

        await updateOccurrence();

    } else {

        await createOccurrence(e);

    }

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
   LOAD IANA TIMEZONES
========================================================== */

const timezones =
    Intl.supportedValuesOf("timeZone");


const timezoneInput =
    document.getElementById("timezone");


const timezoneSuggestions =
    document.getElementById(
        "timezone-suggestions"
    );


if (
    timezoneInput &&
    timezoneSuggestions
) {

    function showTimezoneSuggestions(
        search = ""
    ) {

        const query =
            search
                .trim()
                .toLowerCase();

        const matches =
            timezones
                .filter(timezone =>
                    timezone
                        .toLowerCase()
                        .includes(query)
                )
                .slice(0, 20);

        timezoneSuggestions.innerHTML =
            matches.map(
                timezone => `
                    <div
                        class="timezone-option"
                        data-timezone="${timezone}"
                    >
                        ${timezone}
                    </div>
                `
            ).join("");

        timezoneSuggestions.style.display =
            matches.length
                ? "block"
                : "none";

    }


    timezoneInput.addEventListener(
        "focus",
        () => {

            showTimezoneSuggestions(
                timezoneInput.value
            );

        }
    );


    timezoneInput.addEventListener(
        "input",
        () => {

            showTimezoneSuggestions(
                timezoneInput.value
            );

        }
    );


    timezoneSuggestions.addEventListener(
        "click",
        event => {

            const option =
                event.target.closest(
                    ".timezone-option"
                );

            if (!option) return;

            timezoneInput.value =
                option.dataset.timezone;

            timezoneSuggestions.style.display =
                "none";

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    ".timezone-picker"
                )
            ) {

                timezoneSuggestions.style.display =
                    "none";

            }

        }
    );

}


/* ==========================================================
   CREATE OCCURRENCE
========================================================== */

async function createOccurrence(e) {

    e.preventDefault();

    let venueLayoutUrl = "";

    const venueLayoutFile =
        document
            .getElementById("venue_layout")
            .files[0];


    if (venueLayoutFile) {

        const uploadFormData =
            new FormData();

        uploadFormData.append(
            "file",
            venueLayoutFile
        );


        const uploadResponse =
            await fetch(
                "/api/upload",
                {
                    method: "POST",
                    body: uploadFormData
                }
            );


        const uploadResult =
            await uploadResponse.json();


        venueLayoutUrl =
            uploadResult.url;

    }


    const payload = {

        event_id:
            document
                .getElementById("event_id")
                .value,

        about_event:
            document
                .getElementById("about_event")
                .value
                .trim(),

        event_gallery:
            "",

        event_information:
            document
                .getElementById("event_information")
                .value
                .trim(),

        venue:
            document
                .getElementById("venue")
                .value
                .trim(),

        venue_information:
            document
                .getElementById("venue_information")
                .value
                .trim(),

        venue_layout:
            venueLayoutUrl,

        city:
            document
                .getElementById("city")
                .value
                .trim(),

        country:
            document
                .getElementById("country")
                .value
                .trim(),

        event_date:
            document
                .getElementById("event_date")
                .value,

        event_time:
            document
                .getElementById("event_time")
                .value,

        timezone:
            document
                .getElementById("timezone")
                .value

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
                        JSON.stringify(
                            payload
                        )

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


        resetOccurrenceForm();

        await loadEvents();

        await loadOccurrencesList();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


/* ==========================================================
   EDIT OCCURRENCE
========================================================== */

async function editOccurrence(id) {

    try {

        const response =
            await fetch(
                `/api/occurrences/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load occurrence."
            );

        }


        const occurrence =
            await response.json();


        if (!occurrence) {

            throw new Error(
                "Occurrence not found."
            );

        }


        /* ==========================================
           STORE EDIT STATE
        ========================================== */

        editingOccurrenceId =
            id;

        existingVenueLayout =
            occurrence.venue_layout || "";

        existingEventGallery =
            occurrence.event_gallery || "";


        /* ==========================================
           FILL FORM
        ========================================== */

        document
            .getElementById("event_id")
            .value =
                occurrence.event_id || "";


        document
            .getElementById("venue")
            .value =
                occurrence.venue || "";


        document
            .getElementById("city")
            .value =
                occurrence.city || "";


        document
            .getElementById("country")
            .value =
                occurrence.country || "";


        document
            .getElementById("event_date")
            .value =
                occurrence.event_date || "";


        document
            .getElementById("event_time")
            .value =
                occurrence.event_time || "";


        document
            .getElementById("timezone")
            .value =
                occurrence.timezone || "";


        document
            .getElementById("about_event")
            .value =
                occurrence.about_event || "";


        document
            .getElementById("event_information")
            .value =
                occurrence.event_information || "";


        document
            .getElementById("venue_information")
            .value =
                occurrence.venue_information || "";


        /* ==========================================
           CHANGE BUTTON
        ========================================== */

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.textContent =
                "Update Occurrence";

        }


        /* ==========================================
           ADD CANCEL BUTTON
        ========================================== */

        addCancelOccurrenceButton();


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
            "Unable to load occurrence."
        );

    }

}


/* ==========================================================
   UPDATE OCCURRENCE
========================================================== */

async function updateOccurrence() {

    try {

        let venueLayoutUrl =
            existingVenueLayout;


        const venueLayoutFile =
            document
                .getElementById("venue_layout")
                .files[0];


        /* ==========================================
           UPLOAD NEW VENUE LAYOUT IF SELECTED
        ========================================== */

        if (venueLayoutFile) {

            const uploadFormData =
                new FormData();

            uploadFormData.append(
                "file",
                venueLayoutFile
            );


            const uploadResponse =
                await fetch(
                    "/api/upload",
                    {

                        method: "POST",

                        body:
                            uploadFormData

                    }
                );


            if (!uploadResponse.ok) {

                throw new Error(
                    "Venue layout upload failed."
                );

            }


            const uploadResult =
                await uploadResponse.json();


            venueLayoutUrl =
                uploadResult.url;

        }


        /* ==========================================
           UPDATE PAYLOAD
        ========================================== */

        const payload = {

            event_id:
                document
                    .getElementById("event_id")
                    .value,

            about_event:
                document
                    .getElementById("about_event")
                    .value
                    .trim(),

            event_gallery:
                existingEventGallery,

            event_information:
                document
                    .getElementById("event_information")
                    .value
                    .trim(),

            venue:
                document
                    .getElementById("venue")
                    .value
                    .trim(),

            venue_information:
                document
                    .getElementById("venue_information")
                    .value
                    .trim(),

            venue_layout:
                venueLayoutUrl,

            city:
                document
                    .getElementById("city")
                    .value
                    .trim(),

            country:
                document
                    .getElementById("country")
                    .value
                    .trim(),

            event_date:
                document
                    .getElementById("event_date")
                    .value,

            event_time:
                document
                    .getElementById("event_time")
                    .value,

            timezone:
                document
                    .getElementById("timezone")
                    .value

        };


        /* ==========================================
           SEND UPDATE
        ========================================== */

        const response =
            await fetch(
                `/api/occurrences/${editingOccurrenceId}`,
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
                "Unable to update occurrence."
            );

        }


        alert(
            "Occurrence updated successfully."
        );


        /* ==========================================
           RESET
        ========================================== */

        resetOccurrenceForm();


        await loadEvents();

        await loadOccurrencesList();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to update occurrence."
        );

    }

}


/* ==========================================================
   CANCEL EDIT
========================================================== */

function addCancelOccurrenceButton() {

    if (
        document.getElementById(
            "cancel-occurrence-edit"
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
        "cancel-occurrence-edit";

    cancelButton.className =
        "btn btn-outline";

    cancelButton.textContent =
        "Cancel Edit";


    cancelButton.addEventListener(
        "click",
        resetOccurrenceForm
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

function resetOccurrenceForm() {

    editingOccurrenceId =
        null;

    existingVenueLayout =
        "";

    existingEventGallery =
        "";


    form.reset();


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Publish Occurrence";

    }


    const cancelButton =
        document.getElementById(
            "cancel-occurrence-edit"
        );


    if (cancelButton) {

        cancelButton.remove();

    }

}


/* ==========================================================
   LOAD OCCURRENCES LIST
========================================================== */

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

                        <br>

                        ${occurrence.timezone || ""}

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