/* ==========================================================
   TICKETS PAGE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadTickets
);

let exchangeRates = {
    USD: 1
};

async function loadExchangeRates() {

    try {

        const response =
            await fetch(
                "/api/exchange-rates"
            );

        exchangeRates =
            await response.json();

    }

    catch (error) {

        console.error(
            "Exchange rate error:",
            error
        );

    }

}

function getCurrency() {

    return (
        localStorage.getItem(
            "currency"
        ) || "USD"
    );

}

function getCurrencySymbol(currency) {

    const symbols = {

        USD: "$",
        GBP: "£",
        EUR: "€",
        CAD: "C$",
        AUD: "A$"

    };

    return symbols[currency] || "$";

}

function convertPrice(price) {

    const currency =
        getCurrency();

    const rate =
        exchangeRates[currency] || 1;

    return (
        Number(price) * rate
    ).toFixed(2);

}

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

        await loadExchangeRates();

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

    return listings.map(ticket => {

        const availableSeats =
            parseSeats(ticket.seats);

        const hasSeats =
            availableSeats.length > 0;

        return `

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

        ${
            hasSeats
                ? `
                <div class="seat-selection">

                    <p>
                        <strong>
                            Select your seats
                        </strong>
                    </p>

                    <div
                        class="seat-grid"
                        id="seat-grid-${ticket.id}"
                    >

                        ${availableSeats.map(
                            seat => `

                            <button
                                type="button"
                                class="seat-button"
                                data-listing-id="${ticket.id}"
                                data-seat="${escapeHtml(seat)}"
                                onclick="toggleSeat(
                                    ${ticket.id},
                                    '${escapeJs(seat)}',
                                    ${Number(ticket.quantity) || 0}
                                )"
                            >

                                ${escapeHtml(seat)}

                            </button>

                            `
                        ).join("")}

                    </div>

                    <p
                        id="seat-count-${ticket.id}"
                    >
                        0 seat(s) selected
                    </p>

                </div>
                `
                : ""
        }

    </div>

    <div class="ticket-price">

        <h2>

            ${getCurrencySymbol(
                getCurrency()
            )}

            ${convertPrice(
                ticket.price
            )}

        </h2>

        ${
            hasSeats
                ? `

                <button
                    type="button"
                    class="btn btn-primary"
                    id="buy-button-${ticket.id}"
                    onclick="buySelectedSeats(
                        ${ticket.id},
                        ${Number(ticket.quantity) || 0}
                    )"
                >

                    Buy Now

                </button>

                `
                : `

                <a
                    href="checkout.html?ticket=${ticket.id}"
                    class="btn btn-primary"
                >

                    Buy Now

                </a>

                `
        }

    </div>

</div>

`;

    }).join("");

}

/* ==========================================================
   PARSE AVAILABLE SEATS
========================================================== */

function parseSeats(seats) {

    if (!seats) {

        return [];

    }

    if (Array.isArray(seats)) {

        return seats
            .map(seat => String(seat).trim())
            .filter(Boolean);

    }

    return String(seats)
        .split(",")
        .map(seat => seat.trim())
        .filter(Boolean);

}

/* ==========================================================
   SEAT SELECTION
========================================================== */

const selectedSeats = {};

/**
 * Toggle a seat selection.
 */
function toggleSeat(
    listingId,
    seat,
    maximumSeats
) {

    if (!selectedSeats[listingId]) {

        selectedSeats[listingId] = [];

    }

    const seats =
        selectedSeats[listingId];

    const existingIndex =
        seats.indexOf(seat);

    /*
     * Seat already selected.
     * Remove it.
     */
    if (existingIndex !== -1) {

        seats.splice(
            existingIndex,
            1
        );

    }

    /*
     * Seat not selected.
     * Add it if the customer
     * has not reached the quantity.
     */
    else {

        if (
            seats.length >= maximumSeats
        ) {

            alert(
                `You can select a maximum of ${maximumSeats} seat(s).`
            );

            return;

        }

        seats.push(seat);

    }

    updateSeatDisplay(
        listingId
    );

}

/**
 * Update visual seat state
 * and selected-seat counter.
 */
function updateSeatDisplay(
    listingId
) {

    const seats =
        selectedSeats[listingId] || [];

    const buttons =
        document.querySelectorAll(
            `.seat-button[data-listing-id="${listingId}"]`
        );

    buttons.forEach(button => {

        const seat =
            button.dataset.seat;

        if (
            seats.includes(seat)
        ) {

            button.classList.add(
                "selected"
            );

        }

        else {

            button.classList.remove(
                "selected"
            );

        }

    });

    const counter =
        document.getElementById(
            `seat-count-${listingId}`
        );

    if (counter) {

        counter.textContent =
            `${seats.length} seat(s) selected`;

    }

}

/* ==========================================================
   BUY SELECTED SEATS
========================================================== */

function buySelectedSeats(
    listingId,
    maximumSeats
) {

    const seats =
        selectedSeats[listingId] || [];

    if (!seats.length) {

        alert(
            "Please select at least one seat."
        );

        return;

    }

    if (
        seats.length > maximumSeats
    ) {

        alert(
            `You can select a maximum of ${maximumSeats} seat(s).`
        );

        return;

    }

    /*
     * Pass the selected seats to checkout.
     *
     * The checkout/payment backend will later
     * verify that these seats are still available
     * before permanently removing them.
     */
    const seatParameter =
        encodeURIComponent(
            seats.join(",")
        );

    window.location.href =
        `checkout.html?ticket=${listingId}&seats=${seatParameter}`;

}

/* ==========================================================
   HTML SAFETY HELPERS
========================================================== */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

function escapeJs(value) {

    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

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