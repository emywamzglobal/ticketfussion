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

    <div class="premium-ticket">

        <!-- HERO / EVENT BANNER -->
        <div class="ticket-hero"
             style="background-image:
             linear-gradient(90deg, rgba(4,8,20,.95) 0%, rgba(4,8,20,.55) 55%, rgba(4,8,20,.25) 100%),
             url('${ticket.banner_image}');">

            <div class="ticket-brand">
                <strong>Ticket<span>Fussion</span></strong>
                <small>YOUR TICKET</small>
            </div>

            <div class="ticket-confirmed">
                ✓ CONFIRMED
            </div>

            <div class="ticket-event-title">
                <span>${ticket.category || "EVENT"}</span>
                <h1>${ticket.title}</h1>
            </div>

            <div class="ticket-event-info">

                <div>
                    <b>📅</b>
                    <strong>${ticket.event_date}</strong>
                    <small>DATE</small>
                </div>

                <div>
                    <b>◷</b>
                    <strong>${ticket.event_time}</strong>
                    <small>TIME</small>
                </div>

                <div>
                    <b>⌖</b>
                    <strong>${ticket.venue}</strong>
                    <small>${ticket.city}, ${ticket.country}</small>
                </div>

            </div>

        </div>


        <!-- SEATING -->
        <div class="ticket-seat-panel">

            <div>
                <span>SECTION</span>
                <strong>${ticket.section || "-"}</strong>
            </div>

            <div>
                <span>ROW</span>
                <strong>${ticket.row || "-"}</strong>
            </div>

            <div>
                <span>SEAT</span>
                <strong>${ticket.seat_numbers || "-"}</strong>
            </div>

        </div>


        <!-- CUSTOMER + QR -->
        <div class="ticket-main-panel">

            <div class="ticket-details">

                <div>
                    <span>CUSTOMER</span>
                    <strong>${ticket.customer_name || "-"}</strong>
                </div>

                <div>
                    <span>EMAIL</span>
                    <strong>${ticket.customer_email || "-"}</strong>
                </div>

                <div>
                    <span>TICKET TYPE</span>
                    <strong>${ticket.ticket_type || "-"}</strong>
                </div>

                <div>
                    <span>CATEGORY</span>
                    <strong>${ticket.category || "-"}</strong>
                </div>

                <div>
                    <span>TICKET REFERENCE</span>
                    <strong class="ticket-reference">
                        ${ticket.ticket_reference}
                    </strong>
                </div>

            </div>


            <div class="ticket-qr">

                <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qr_code || ticket.ticket_reference)}"
                    alt="Ticket QR Code"
                >

                <strong>SCAN AT VENUE ENTRY</strong>

                <small>
                    This QR code is unique to this ticket.
                </small>

            </div>

        </div>


        <!-- ACTIONS -->
        <div class="ticket-actions">

            <button
                class="btn btn-primary"
                id="download-ticket-btn">

                ↓ DOWNLOAD PDF

            </button>

            <button
                class="btn btn-outline"
                id="share-ticket-btn">

                ↗ SHARE TICKET

            </button>

        </div>


        <!-- FOOTER -->
        <div class="ticket-footer">

            <div>
                <strong>✓ Secure Ticket</strong>
                <small>
                    This ticket is unique and non-transferable.
                </small>
            </div>

            <div>
                <strong>Need help?</strong>
                <small>support@ticketfussion.com</small>
            </div>

        </div>

    </div>

    `;


    /* DOWNLOAD */

    const downloadButton =
        document.getElementById("download-ticket-btn");

    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            () => downloadTicketPDF(ticket)
        );

    }


    /* SHARE */

    const shareButton =
        document.getElementById("share-ticket-btn");

    if (shareButton) {

        shareButton.addEventListener(
            "click",
            async () => {

                const shareData = {
                    title: ticket.title,
                    text: `My ticket for ${ticket.title}`,
                    url: window.location.href
                };

                if (navigator.share) {

                    await navigator.share(shareData);

                } else {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );

                    alert("Ticket link copied.");

                }

            }
        );

    }

}

/*=========================================================
    DOWNLOAD PREMIUM TICKET PDF
=========================================================*/

async function downloadTicketPDF(ticket) {

    /* LOAD html2canvas */
    if (!window.html2canvas) {

        await new Promise((resolve, reject) => {

            const script =
                document.createElement("script");

            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

            script.onload = resolve;
            script.onerror = reject;

            document.head.appendChild(script);

        });

    }


    /* LOAD jsPDF */
    if (!window.jspdf) {

        await new Promise((resolve, reject) => {

            const script =
                document.createElement("script");

            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

            script.onload = resolve;
            script.onerror = reject;

            document.head.appendChild(script);

        });

    }


    const { jsPDF } = window.jspdf;


    /* FIND PREMIUM TICKET */

    const ticketElement =
        document.querySelector(".premium-ticket");

    if (!ticketElement) {

        alert("Ticket could not be prepared.");

        return;

    }


    /* TEMPORARILY HIDE ACTION BUTTONS */

    const actions =
        ticketElement.querySelector(".ticket-actions");

    const originalDisplay =
        actions ? actions.style.display : "";

    if (actions) {

        actions.style.display = "none";

    }


    try {

        /* CAPTURE TICKET */

        const canvas =
            await html2canvas(
                ticketElement,
                {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: "#050914",
                    logging: false
                }
            );


        const image =
            canvas.toDataURL(
                "image/jpeg",
                0.95
            );


        /* CREATE PDF */

        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();


        /* IMAGE DIMENSIONS */

        const imageWidth =
            pageWidth - 12;

        const imageHeight =
            (canvas.height / canvas.width)
            * imageWidth;


        /* CENTER VERTICALLY IF POSSIBLE */

        let y =
            6;

        if (imageHeight < pageHeight - 12) {

            y =
                (pageHeight - imageHeight) / 2;

        }


        /* ADD PREMIUM TICKET */

        pdf.addImage(
            image,
            "JPEG",
            6,
            y,
            imageWidth,
            imageHeight
        );


        /* SAVE */

        pdf.save(
            `${ticket.ticket_reference || "ticket"}-TicketFussion.pdf`
        );


    }

    catch (error) {

        console.error(
            "Ticket PDF error:",
            error
        );

        alert(
            "Unable to generate the ticket PDF."
        );

    }


    finally {

        /* RESTORE BUTTONS */

        if (actions) {

            actions.style.display =
                originalDisplay;

        }

    }

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