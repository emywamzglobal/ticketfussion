/*=========================================================
    MY TICKET
=========================================================*/

const ticketContainer =
    document.getElementById(
        "ticket-page"
    );

/*=========================================================
    REQUIRE LOGIN
=========================================================*/

async function requireCustomer() {

    const customer =
        await checkCustomerSession();

    if (!customer) {

        window.location.href =
            "/login.html";

        return null;

    }

    return customer;

}

/*=========================================================
    GET TICKET REFERENCE
=========================================================*/

const params =
    new URLSearchParams(
        window.location.search
    );

const ticketReference =
    params.get("ticket");

/*=========================================================
    LOAD TICKET
=========================================================*/

async function loadTicket() {

    if (!ticketReference) {

        ticketContainer.innerHTML = `

            <div class="container">

                <h2>
                    Ticket Not Found
                </h2>

                <p>
                    No ticket reference
                    was provided.
                </p>

            </div>

        `;

        return;

    }

    try {

        const response =
            await fetch(

                `/api/tickets/reference/${ticketReference}`

            );

        const ticket =
            await response.json();

        if (!ticket) {

            ticketContainer.innerHTML = `

                <div class="container">

                    <h2>
                        Ticket Not Found
                    </h2>

                    <p>
                        This ticket does
                        not exist.
                    </p>

                </div>

            `;

            return;

        }

        renderTicket(ticket);

    }

    catch (error) {

        console.error(error);

        ticketContainer.innerHTML = `

            <div class="container">

                <h2>
                    Something went wrong.
                </h2>

            </div>

        `;

    }

}

/*=========================================================
    RENDER TICKET
=========================================================*/

function renderTicket(ticket) {

    ticketContainer.innerHTML = `

<div class="ticket-card">

    <div class="ticket-banner">

        <img
            src="${ticket.banner_image}"
            alt="${ticket.title}"
        >

    </div>

    <div class="ticket-content">

        <div class="ticket-event-header">

            <h1>

                ${ticket.title}

            </h1>

            <div class="ticket-status status-${ticket.status}">

                ${ticket.status}

            </div>

        </div>

        <p class="ticket-meta">

            📍 ${ticket.venue},
            ${ticket.city},
            ${ticket.country}

            <br>

            📅 ${ticket.event_date}

            &nbsp;&nbsp;|&nbsp;&nbsp;

            🕒 ${ticket.event_time}

        </p>

        <div class="ticket-seat-card">

            <div>

                <span>SECTION</span>

                <strong>

                    ${ticket.section || "-"}

                </strong>

            </div>

            <div>

                <span>ROW</span>

                <strong>

                    ${ticket.row || "-"}

                </strong>

            </div>

            <div>

                <span>SEAT</span>

                <strong>

                    ${ticket.seat_numbers || "-"}

                </strong>

            </div>

        </div>

        <div class="ticket-grid">

            <div class="ticket-item">

                <span>Customer</span>

                <strong>

                    ${ticket.customer_name}

                </strong>

            </div>

            <div class="ticket-item">

                <span>Email</span>

                <strong>

                    ${ticket.customer_email}

                </strong>

            </div>

            <div class="ticket-item">

                <span>Ticket Type</span>

                <strong>

                    ${ticket.ticket_type}

                </strong>

            </div>

            <div class="ticket-item">

                <span>Category</span>

                <strong>

                    ${ticket.category}

                </strong>

            </div>

        </div>

        <div class="ticket-reference-strip">

            <span>

                TICKET REFERENCE

            </span>

            <code>

                ${ticket.ticket_reference}

            </code>

        </div>

        <div class="ticket-qr-panel">

            <img

                src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(ticket.qr_code)}"

                alt="QR Code"

            >

            <p>

                Present this QR code at the venue entrance.

            </p>

        </div>

        <div class="ticket-actions">

            <button
                class="btn btn-primary">

                Download PDF

            </button>

            <button
                class="btn btn-outline">

                Share Ticket

            </button>

        </div>

    </div>

</div>

    `;

}
/*=========================================================
    START
=========================================================*/

(async () => {

    const customer =
        await requireCustomer();

    if (!customer) {

        return;

    }

    await loadTicket();

})();