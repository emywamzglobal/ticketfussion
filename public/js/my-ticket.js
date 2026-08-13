/*=========================================================
    MY TICKET
    TicketFussion
=========================================================*/

/*=========================================================
    TICKET CONTAINER
=========================================================*/

const ticketContainer =
    document.getElementById("ticket-page");


/*=========================================================
    GET TICKET REFERENCE FROM URL
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

    /*-----------------------------------------------
        Check ticket reference
    -----------------------------------------------*/

    if (!ticketReference) {

        ticketContainer.innerHTML = `

            <div class="container">

                <h2>Ticket Not Found</h2>

                <p>
                    No ticket reference was provided.
                </p>

            </div>

        `;

        return;

    }


    /*-----------------------------------------------
        Fetch ticket
    -----------------------------------------------*/

    try {

        const response =
            await fetch(
                `/api/tickets/reference/${encodeURIComponent(ticketReference)}`
            );


        if (!response.ok) {

            throw new Error(
                `Ticket request failed: ${response.status}`
            );

        }


        const ticket =
            await response.json();


        /*-------------------------------------------
            Ticket does not exist
        -------------------------------------------*/

        if (!ticket) {

            ticketContainer.innerHTML = `

                <div class="container">

                    <h2>Ticket Not Found</h2>

                    <p>
                        This ticket does not exist
                        or is no longer available.
                    </p>

                </div>

            `;

            return;

        }


        /*-------------------------------------------
            Render ticket
        -------------------------------------------*/

        renderTicket(ticket);

    }


    catch (error) {

        console.error(
            "LOAD TICKET ERROR:",
            error
        );


        ticketContainer.innerHTML = `

            <div class="container">

                <h2>
                    Something went wrong.
                </h2>

                <p>
                    We could not load your ticket.
                    Please try again.
                </p>

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


            <!--=========================================
                EVENT BANNER
            =========================================-->

            <div class="ticket-banner">

                <img
                    src="${ticket.banner_image || ""}"
                    alt="${ticket.title || "Event"}"
                >

                <div class="ticket-banner-overlay"></div>


                <!-- TicketFussion branding -->

                <div class="ticket-brand">

                    <div class="ticket-brand-name">
                        Ticket<span>Fussion</span>
                    </div>

                    <div class="ticket-brand-subtitle">
                        YOUR TICKET
                    </div>

                </div>


                <!-- Status -->

                <div
                    class="ticket-status status-${ticket.status || "active"}"
                >

                    <span class="status-icon">
                        ✓
                    </span>

                    ${(
                        ticket.status ||
                        "ACTIVE"
                    ).toUpperCase()}

                </div>


                <!-- Event title -->

                <div class="ticket-hero-title">

                    <h1>
                        ${ticket.title || "Event"}
                    </h1>

                </div>

            </div>


            <!--=========================================
                TICKET CONTENT
            =========================================-->

            <div class="ticket-content">


                <!--=====================================
                    EVENT INFORMATION
                =====================================-->

                <div class="ticket-event-header">

                    <h1>
                        ${ticket.title || "Event"}
                    </h1>

                </div>


                <p class="ticket-meta">

                    <span class="ticket-location">

                        ${ticket.venue || ""}
                        ${ticket.city ? ", " + ticket.city : ""}
                        ${ticket.country ? ", " + ticket.country : ""}

                    </span>


                    <span class="ticket-date">

                        ${ticket.event_date || ""}

                    </span>


                    <span class="ticket-time">

                        ${ticket.event_time || ""}

                    </span>

                </p>


                <!--=====================================
                    SEAT INFORMATION
                =====================================-->

                <div class="ticket-seat-card">


                    <div class="ticket-seat-item">

                        <span>
                            SECTION
                        </span>

                        <strong>
                            ${ticket.section || "-"}
                        </strong>

                    </div>


                    <div class="ticket-seat-divider"></div>


                    <div class="ticket-seat-item">

                        <span>
                            ROW
                        </span>

                        <strong>
                            ${ticket.row || "-"}
                        </strong>

                    </div>


                    <div class="ticket-seat-divider"></div>


                    <div class="ticket-seat-item">

                        <span>
                            SEAT
                        </span>

                        <strong>
                            ${ticket.seat_numbers || "-"}
                        </strong>

                    </div>

                </div>


                <!--=====================================
                    CUSTOMER DETAILS
                =====================================-->

                <div class="ticket-details-card">


                    <div class="ticket-grid">


                        <div class="ticket-item">

                            <span>
                                CUSTOMER
                            </span>

                            <strong>
                                ${ticket.customer_name || "-"}
                            </strong>

                        </div>


                        <div class="ticket-item">

                            <span>
                                EMAIL
                            </span>

                            <strong>
                                ${ticket.customer_email || "-"}
                            </strong>

                        </div>


                        <div class="ticket-item">

                            <span>
                                TICKET TYPE
                            </span>

                            <strong>
                                ${ticket.ticket_type || "-"}
                            </strong>

                        </div>


                        <div class="ticket-item">

                            <span>
                                CATEGORY
                            </span>

                            <strong>
                                ${ticket.category || "-"}
                            </strong>

                        </div>


                    </div>

                </div>


                <!--=====================================
                    TICKET REFERENCE
                =====================================-->

                <div class="ticket-reference-strip">

                    <div class="ticket-reference-label">
                        TICKET REFERENCE
                    </div>

                    <code>
                        ${ticket.ticket_reference || "-"}
                    </code>

                </div>


                <!--=====================================
                    QR CODE
                =====================================-->

                <div class="ticket-qr-panel">


                    <div class="ticket-qr-header">

                        <span class="ticket-qr-title">
                            SCAN AT VENUE ENTRY
                        </span>

                        <span class="ticket-qr-subtitle">
                            Present this QR code at the venue
                        </span>

                    </div>


                    <div class="ticket-qr-box">

                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                                ticket.qr_code ||
                                ticket.ticket_reference ||
                                ""
                            )}"
                            alt="Ticket QR Code"
                        >

                    </div>

                </div>


                <!--=====================================
                    ACTIONS
                =====================================-->

                <div class="ticket-actions">


                    <button
                        type="button"
                        class="btn btn-primary"
                        id="download-ticket-btn"
                    >
                        <span>↓</span>
                        Download PDF
                    </button>


                    <button
                        type="button"
                        class="btn btn-outline"
                        id="share-ticket-btn"
                    >
                        <span>↗</span>
                        Share Ticket
                    </button>


                </div>


            </div>

        </div>

    `;

    /*=====================================================
        DOWNLOAD BUTTON
    =====================================================*/

    const downloadButton =
        document.getElementById(
            "download-ticket-btn"
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            () => {

                downloadTicketPDF(ticket);

            }
        );

    }


    /*=====================================================
        SHARE BUTTON
    =====================================================*/

    const shareButton =
        document.getElementById(
            "share-ticket-btn"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            async () => {

                const shareData = {

                    title:
                        ticket.title ||
                        "TicketFussion Ticket",

                    text:
                        `My ticket for ${
                            ticket.title ||
                            "this event"
                        }`,

                    url:
                        window.location.href

                };


                try {

                    if (
                        navigator.share
                    ) {

                        await navigator.share(
                            shareData
                        );

                    } else {

                        await navigator.clipboard.writeText(
                            window.location.href
                        );

                        alert(
                            "Ticket link copied."
                        );

                    }

                }

                catch (error) {

                    console.error(
                        "SHARE FAILED:",
                        error
                    );

                }

            }
        );

    }

}

/*=========================================================
    DOWNLOAD TICKET PDF
=========================================================*/

async function downloadTicketPDF(ticket) {

    try {

        /*=====================================================
            LOAD jsPDF
        =====================================================*/

        if (!window.jspdf) {

            await new Promise(
                (resolve, reject) => {

                    const script =
                        document.createElement("script");

                    script.src =
                        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

                    script.onload =
                        resolve;

                    script.onerror =
                        reject;

                    document.head.appendChild(
                        script
                    );

                }
            );

        }


        /*=====================================================
            LOAD html2canvas
        =====================================================*/

        if (!window.html2canvas) {

            await new Promise(
                (resolve, reject) => {

                    const script =
                        document.createElement("script");

                    script.src =
                        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

                    script.onload =
                        resolve;

                    script.onerror =
                        reject;

                    document.head.appendChild(
                        script
                    );

                }
            );

        }


        /*=====================================================
            GET THE ACTUAL VIEW TICKET
        =====================================================*/

        const ticketCard =
            document.querySelector(
                ".ticket-card"
            );


        if (!ticketCard) {

            throw new Error(
                "Ticket card not found."
            );

        }


        /*=====================================================
            RENDER EXACT VIEW TICKET
        =====================================================*/

        const canvas =
            await html2canvas(
                ticketCard,
                {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: null
                }
            );


        /*=====================================================
            CONVERT TO IMAGE
        =====================================================*/

        const ticketImage =
            canvas.toDataURL(
                "image/png"
            );


        /*=====================================================
            CREATE A5 PDF
        =====================================================*/

        const {
            jsPDF
        } = window.jspdf;


        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a5"
            });


        /*=====================================================
            PDF DIMENSIONS
        =====================================================*/

        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();


        /*=====================================================
            PRESERVE TICKET PROPORTIONS
        =====================================================*/

        const ratio =
            canvas.height /
            canvas.width;


        const margin = 8;


        let imageWidth =
            pageWidth -
            (margin * 2);


        let imageHeight =
            imageWidth *
            ratio;


        /*=====================================================
            FIT TICKET ON A5 PAGE
        =====================================================*/

        if (
            imageHeight >
            pageHeight -
            (margin * 2)
        ) {

            imageHeight =
                pageHeight -
                (margin * 2);

            imageWidth =
                imageHeight /
                ratio;

        }


        /*=====================================================
            CENTER TICKET
        =====================================================*/

        const x =
            (pageWidth -
                imageWidth) /
            2;


        const y =
            (pageHeight -
                imageHeight) /
            2;


        /*=====================================================
            ADD EXACT VIEW TICKET
        =====================================================*/

        pdf.addImage(
            ticketImage,
            "PNG",
            x,
            y,
            imageWidth,
            imageHeight
        );


        /*=====================================================
            DOWNLOAD
        =====================================================*/

        pdf.save(
            (
                ticket.ticket_reference ||
                "TicketFussion-Ticket"
            ) +
            ".pdf"
        );

    }

    catch (error) {

        console.error(
            "PDF DOWNLOAD FAILED:",
            error
        );

        alert(
            "Could not create PDF: " +
            error.message
        );

    }

    }
    
/*=========================================================
    LOAD IMAGE HELPER
=========================================================*/

function loadImage(url) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();

            img.onload =
                () => resolve(img);

            img.onerror =
                (error) => {

                    console.error(
                        "IMAGE LOAD FAILED:",
                        url,
                        error
                    );

                    reject(error);

                };

            img.src = url;

        }
    );

}


/*=========================================================
    START
=========================================================*/

loadTicket();