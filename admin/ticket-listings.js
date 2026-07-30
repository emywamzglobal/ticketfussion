/* ==========================================================
   TICKET LISTINGS
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initialiseTicketListingForm
);

/* ==========================================================
   INITIALISE
========================================================== */

async function initialiseTicketListingForm() {

    await loadOccurrences();

    document
        .getElementById("ticket-listing-form")
        .addEventListener(
            "submit",
            saveTicketListing
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
                    ${occurrence.venue}
                    -
                    ${occurrence.city}
                    -
                    ${occurrence.event_date}
                    (${occurrence.event_time})
                </option>
            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================================
   SAVE TICKET LISTING
========================================================== */

async function saveTicketListing(event) {

    event.preventDefault();

    const payload = {

        occurrence_id:
            document.getElementById("occurrence_id").value,

        ticket_type:
            document.getElementById("ticket_type").value,

        section:
            document.getElementById("section").value,

        row:
            document.getElementById("row").value,

        seats:
            document.getElementById("seats").value,

        quantity:
            Number(
                document.getElementById("quantity").value
            ),

        price:
            Number(
                document.getElementById("price").value
            ),

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

            throw new Error("Unable to save ticket listing.");

        }

        alert("Ticket listing created successfully.");

        document
            .getElementById("ticket-listing-form")
            .reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}