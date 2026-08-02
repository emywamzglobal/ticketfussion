/* ==========================================================
   TICKETS PAGE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadTickets
);

/* ==========================================================
   LOAD PAGE
========================================================== */

async function loadTickets() {

    const occurrenceId = new URLSearchParams(
        window.location.search
    ).get("occurrence");

    if (!occurrenceId) {

        document.getElementById("event-page").innerHTML = `
            <div class="container">
                <h2>Occurrence not found.</h2>
            </div>
        `;

        return;

    }

    try {

        const occurrenceResponse =
            await fetch(`/api/occurrences/${occurrenceId}`);

        const occurrence =
            await occurrenceResponse.json();

        const listingResponse =
            await fetch(
                `/api/occurrences/${occurrenceId}/ticket-listings`
            );

        const listings =
            await listingResponse.json();

        renderPage(
            occurrence,
            listings
        );

    }

    catch (error) {

        console.error(error);

        document.getElementById("event-page").innerHTML = `
            <div class="container">
                <h2>Unable to load tickets.</h2>
            </div>
        `;

    }

}

/* ==========================================================
   RENDER PAGE
========================================================== */

function renderPage(
    occurrence,
    listings
) {

    document.getElementById("event-page").innerHTML = `

<section class="tickets-header container">

    <h1>

        Tickets

    </h1>

    <p>

        ${formatDate(occurrence.event_date)}

    </p>

    <p>

        ${occurrence.event_time}

    </p>

    <p>

        ${occurrence.venue}

    </p>

    <p>

        ${occurrence.city},
        ${occurrence.country}

    </p>

</section>

<section class="ticket-list container">

    ${renderListings(listings)}

</section>

`;

}

/* ==========================================================
   TICKET LISTINGS
========================================================== */

function renderListings(listings) {

    if (!listings.length) {

        return `

<p>

No tickets available.

</p>

`;

    }

    return listings.map(ticket => `

<div class="ticket-card">

    <div>

        <h3>

            ${ticket.ticket_type}

        </h3>

        <p>

            Section:
            ${ticket.section || "-"}

        </p>

        <p>

            Row:
            ${ticket.row || "-"}

        </p>

        <p>

            Quantity:
            ${ticket.quantity}

        </p>

        <p>

            Delivery:
            ${ticket.delivery_method}

        </p>

    </div>

    <div class="ticket-price">

        <h2>

            $${Number(ticket.price).toFixed(2)}

        </h2>

        <a
            href="checkout.html?ticket=${ticket.id}"
            class="btn btn-primary">

            Buy Now

        </a>

    </div>

</div>

`).join("");

}

/* ==========================================================
   DATE FORMAT
========================================================== */

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        undefined,
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}