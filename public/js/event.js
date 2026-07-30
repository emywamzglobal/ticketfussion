/* ==========================================================
   EVENT PAGE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadEvent
);

/* ==========================================================
   LOAD EVENT
========================================================== */

async function loadEvent() {

    const eventId = new URLSearchParams(
        window.location.search
    ).get("event");

    if (!eventId) {

        document.getElementById("event-page").innerHTML = `
            <div class="container">
                <h2>Event not found.</h2>
            </div>
        `;

        return;

    }

    try {

        const eventResponse =
            await fetch(`/api/events/${eventId}`);

        const event =
            await eventResponse.json();

        const occurrenceResponse =
            await fetch(`/api/events/${eventId}/occurrences`);

        const occurrences =
            await occurrenceResponse.json();

        renderEvent(event, occurrences);

    }

    catch (error) {

        console.error(error);

        document.getElementById("event-page").innerHTML = `
            <div class="container">
                <h2>Unable to load event.</h2>
            </div>
        `;

    }

}

/* ==========================================================
   RENDER EVENT
========================================================== */

function renderEvent(event, occurrences) {

    const container =
        document.getElementById("event-page");

    container.innerHTML = `

<section class="event-hero">

    <img
        src="${event.banner_image}"
        alt="${event.title}"
        class="event-banner">

</section>

<section class="event-details container">

    <span class="event-category">
        ${event.category}
    </span>

    <h1>
        ${event.title}
    </h1>

    <p class="event-description">
        ${event.description}
    </p>

</section>

<section class="event-occurrences container">

    <h2>
        Available Dates
    </h2>

    ${renderOccurrences(occurrences)}

</section>

`;

}

/* ==========================================================
   OCCURRENCES
========================================================== */

function renderOccurrences(occurrences) {

    if (!occurrences.length) {

        return `

<p>

No occurrences available.

</p>

`;

    }

    return occurrences.map(occurrence => `

<div class="occurrence-card">

    <div>

        <h3>

            ${formatDate(occurrence.event_date)}

        </h3>

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

    </div>

    <a
        href="tickets.html?occurrence=${occurrence.id}"
        class="btn btn-primary">

        Buy Tickets

    </a>

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