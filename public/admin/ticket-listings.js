/* ==========================================================
   TICKET LISTINGS
========================================================== */

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
            publishTicketListing
        );

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

    const payload = {

        occurrence_id:
            Number(document.getElementById("occurrence_id").value),

        ticket_type:
            document.getElementById("ticket_type").value,

        section:
            document.getElementById("section").value,

        row:
            document.getElementById("row").value,

        seats:
            document.getElementById("seats").value,

        quantity:
            Number(document.getElementById("quantity").value),

        price:
            Number(document.getElementById("price").value),

        delivery_method:
            document.getElementById("delivery_method").value

    };

    try {

        const response =
            await fetch("/api/ticket-listings", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(payload)

            });

        if (!response.ok) {

            throw new Error();

        }

        alert("Ticket listing published successfully.");

        document
            .getElementById("ticket-listing-form")
            .reset();

        await loadOccurrences();

    }

    catch (error) {

        console.error(error);

        alert("Unable to publish ticket listing.");

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