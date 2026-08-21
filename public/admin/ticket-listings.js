/* ==========================================================
   TICKET LISTINGS
========================================================== */

let editingTicketListingId = null;
let existingVenueLayout = "";


document.addEventListener(
    "DOMContentLoaded",
    initialise
);


/* ==========================================================
   INITIALISE
========================================================== */

async function initialise() {

    await loadOccurrences();

    document
        .getElementById("ticket-listing-form")
        .addEventListener(
            "submit",
            handleTicketListingSubmit
        );

}


/* ==========================================================
   SUBMIT TICKET LISTING
========================================================== */

async function handleTicketListingSubmit(event) {

    event.preventDefault();

    if (editingTicketListingId) {

        await updateTicketListing();

    } else {

        await publishTicketListing(event);

    }

}


/* ==========================================================
   LOAD OCCURRENCES
========================================================== */

async function loadOccurrences() {

    try {

        const response =
            await fetch("/api/occurrences");

        const occurrences =
            await response.json();

        const select =
            document.getElementById("occurrence_id");

        select.innerHTML =
            '<option value="">Select Occurrence</option>';

        occurrences.forEach(occurrence => {

            select.innerHTML += `
                <option value="${occurrence.id}">
                    ${occurrence.venue} •
                    ${occurrence.city} •
                    ${occurrence.event_date} •
                    ${occurrence.event_time}
                </option>
            `;

        });

    }

    catch (error) {

        console.error(error);

        alert("Unable to load occurrences.");

    }

}


/* ==========================================================
   PUBLISH TICKET LISTING
========================================================== */

async function publishTicketListing(event) {

    event.preventDefault();

    try {

        /* ==========================================
           UPLOAD VENUE LAYOUT TO R2
        ========================================== */

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
           TICKET LISTING PAYLOAD
        ========================================== */

        const payload = {

            occurrence_id:
                Number(
                    document
                        .getElementById("occurrence_id")
                        .value
                ),

            ticket_type:
                document
                    .getElementById("ticket_type")
                    .value,

            section:
                document
                    .getElementById("section")
                    .value,

            row:
                document
                    .getElementById("row")
                    .value,

            seats:
                document
                    .getElementById("seats")
                    .value,

            quantity:
                Number(
                    document
                        .getElementById("quantity")
                        .value
                ),

            price:
                Number(
                    document
                        .getElementById("price")
                        .value
                ),

            delivery_method:
                document
                    .getElementById("delivery_method")
                    .value,

            venue_layout:
                venueLayoutUrl

        };


        /* ==========================================
           CREATE TICKET LISTING
        ========================================== */

        const response =
            await fetch(
                "/api/ticket-listings",
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
                "Unable to publish ticket listing."
            );

        }


        /* ==========================================
           SUCCESS
        ========================================== */

        alert(
            "Ticket listing published successfully."
        );


        document
            .getElementById(
                "ticket-listing-form"
            )
            .reset();


        await loadOccurrences();

        await loadTicketListingsList();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to publish ticket listing."
        );

    }

}


/* ==========================================================
   EDIT TICKET LISTING
========================================================== */

async function editTicketListing(id) {

    try {

        const response =
            await fetch(
                `/api/ticket-listings/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load ticket listing."
            );

        }


        const listing =
            await response.json();


        if (!listing) {

            throw new Error(
                "Ticket listing not found."
            );

        }


        /* ==========================================
           STORE EDIT STATE
        ========================================== */

        editingTicketListingId =
            id;

        existingVenueLayout =
            listing.venue_layout || "";


        /* ==========================================
           FILL FORM
        ========================================== */

        document
            .getElementById("occurrence_id")
            .value =
                listing.occurrence_id || "";


        document
            .getElementById("ticket_type")
            .value =
                listing.ticket_type || "";


        document
            .getElementById("section")
            .value =
                listing.section || "";


        document
            .getElementById("row")
            .value =
                listing.row || "";


        document
            .getElementById("seats")
            .value =
                listing.seats || "";


        document
            .getElementById("quantity")
            .value =
                listing.quantity || "";


        document
            .getElementById("price")
            .value =
                listing.price || "";


        document
            .getElementById("delivery_method")
            .value =
                listing.delivery_method || "";


        /* ==========================================
           CHANGE BUTTON
        ========================================== */

        const form =
            document.getElementById(
                "ticket-listing-form"
            );


        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.textContent =
                "Update Ticket Listing";

        }


        /* ==========================================
           ADD CANCEL BUTTON
        ========================================== */

        addCancelTicketListingButton();


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
            "Unable to load ticket listing."
        );

    }

}


/* ==========================================================
   UPDATE TICKET LISTING
========================================================== */

async function updateTicketListing() {

    try {

        let venueLayoutUrl =
            existingVenueLayout;


        /* ==========================================
           UPLOAD NEW VENUE LAYOUT IF SELECTED
        ========================================== */

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

            occurrence_id:
                Number(
                    document
                        .getElementById("occurrence_id")
                        .value
                ),

            ticket_type:
                document
                    .getElementById("ticket_type")
                    .value,

            section:
                document
                    .getElementById("section")
                    .value,

            row:
                document
                    .getElementById("row")
                    .value,

            seats:
                document
                    .getElementById("seats")
                    .value,

            quantity:
                Number(
                    document
                        .getElementById("quantity")
                        .value
                ),

            price:
                Number(
                    document
                        .getElementById("price")
                        .value
                ),

            delivery_method:
                document
                    .getElementById("delivery_method")
                    .value,

            venue_layout:
                venueLayoutUrl

        };


        /* ==========================================
           SEND UPDATE
        ========================================== */

        const response =
            await fetch(
                `/api/ticket-listings/${editingTicketListingId}`,
                {

                    method: "PUT",

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
                "Unable to update ticket listing."
            );

        }


        /* ==========================================
           SUCCESS
        ========================================== */

        alert(
            "Ticket listing updated successfully."
        );


        resetTicketListingForm();


        await loadOccurrences();

        await loadTicketListingsList();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to update ticket listing."
        );

    }

}


/* ==========================================================
   CANCEL EDIT
========================================================== */

function addCancelTicketListingButton() {

    if (
        document.getElementById(
            "cancel-ticket-listing-edit"
        )
    ) {

        return;

    }


    const form =
        document.getElementById(
            "ticket-listing-form"
        );


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
        "cancel-ticket-listing-edit";

    cancelButton.className =
        "btn btn-outline";

    cancelButton.textContent =
        "Cancel Edit";


    cancelButton.addEventListener(
        "click",
        resetTicketListingForm
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

function resetTicketListingForm() {

    editingTicketListingId =
        null;

    existingVenueLayout =
        "";


    const form =
        document.getElementById(
            "ticket-listing-form"
        );


    form.reset();


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Publish Ticket Listing";

    }


    const cancelButton =
        document.getElementById(
            "cancel-ticket-listing-edit"
        );


    if (cancelButton) {

        cancelButton.remove();

    }

}


/* ==========================================================
   LOAD TICKET LISTINGS
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadTicketListingsList
);


async function loadTicketListingsList() {

    const container =
        document.getElementById(
            "ticket-listings-list"
        );


    if (!container) return;


    try {

        const response =
            await fetch(
                "/api/ticket-listings"
            );


        const listings =
            await response.json();


        if (!listings.length) {

            container.innerHTML =
                "<p>No ticket listings found.</p>";

            return;

        }


        container.innerHTML =
            listings.map(
                listing => `

                <div class="admin-record">

                    <div class="record-info">

                        <strong>

                            ${listing.ticket_type}

                        </strong>

                        <br>

                        ${listing.section || "General"}

                        ${listing.row ? `• Row ${listing.row}` : ""}

                        <br>

                        Qty:
                        ${listing.quantity}

                        •

                        $${listing.price}

                    </div>

                    <div class="record-actions">

                        <button
                            class="btn btn-outline"
                            onclick="editTicketListing(${listing.id})">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger"
                            onclick="deleteTicketListingRecord(${listing.id})">

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
            "<p>Unable to load ticket listings.</p>";

    }

}


/* ==========================================================
   DELETE TICKET LISTING
========================================================== */

async function deleteTicketListingRecord(id) {

    if (
        !confirm(
            "Delete this ticket listing?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/ticket-listings/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error();

        }


        await loadTicketListingsList();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to delete ticket listing."
        );

    }

}