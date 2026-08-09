/* ==========================================================
   HOME
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadFeaturedEvents
);

/* ==========================================================
   LOAD TOP SELLING EVENTS
========================================================== */

async function loadFeaturedEvents() {

    const grid =
        document.getElementById("featured-events-grid");

    if (!grid) return;

    try {

        const response =
            await fetch("/api/events");

        if (!response.ok) {

            throw new Error(
                "Unable to load events."
            );

        }

        const events =
            await response.json();

        if (!events.length) {

            grid.innerHTML = `

                <p class="empty-state">

                    No events available.

                </p>

            `;

            return;

        }

        grid.innerHTML = "";

        events.forEach(event => {

            grid.innerHTML += createEventCard(event);

        });

    }

    catch (error) {

        console.error(error);

        grid.innerHTML = `

            <p class="empty-state">

                Failed to load events.

            </p>

        `;

    }

}

/* ==========================================================
   EVENT CARD
========================================================== */

function createEventCard(event) {

    return `

        <article class="event-card">

            <div class="event-image">

                <img
                    src="${event.banner_image}"
                    alt="${event.title}">

            </div>

            <div class="event-content">

                <span class="event-category">

                    ${event.category}

                </span>

                <h3>

                    ${event.title}

                </h3>

                <p>

                    ${event.description.substring(0,80)}...

                </p>

                <div class="availability-badge">
                   🔥 Limited Availability
                </div>

                <a
                    href="event.html?event=${event.id}"
                    class="btn btn-primary">

                    View Event

                </a>

            </div>

        </article>

    `;

}