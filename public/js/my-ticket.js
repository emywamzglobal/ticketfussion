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
                EVENT HERO / BANNER
            =========================================-->

            <div class="ticket-banner">

                <img
                    src="${ticket.banner_image || ""}"
                    alt="${ticket.title || "Event"}"
                >


                <!-- Dark overlay for readability -->
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


                <!-- Ticket status -->
                <div
                    class="ticket-status status-${ticket.status || "active"}"
                >

                    <span class="status-icon">✓</span>

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


            <!--=====================================
    EVENT INFORMATION
=====================================-->

<div class="ticket-meta">

    <div class="ticket-meta-item">

        <span class="ticket-meta-label">
            VENUE
        </span>

        <strong>
            ${ticket.venue || ""}
            ${ticket.city ? ", " + ticket.city : ""}
            ${ticket.country ? ", " + ticket.country : ""}
        </strong>

    </div>


    <div class="ticket-meta-item">

        <span class="ticket-meta-label">
            DATE
        </span>

        <strong>
            ${ticket.event_date || ""}
        </strong>

    </div>


    <div class="ticket-meta-item">

        <span class="ticket-meta-label">
            TIME
        </span>

        <strong>
            ${ticket.event_time || ""}
        </strong>

    </div>

</div>
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
    /*-----------------------------------------------
        DOWNLOAD BUTTON
    -----------------------------------------------*/

    const downloadButton =
        document.getElementById(
            "download-ticket-btn"
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            () => downloadTicketPDF(ticket)
        );

    }


    /*-----------------------------------------------
        SHARE BUTTON
    -----------------------------------------------*/

    const shareButton =
        document.getElementById(
            "share-ticket-btn"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            () => shareTicket(ticket)
        );

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

                script.onload = resolve;

                script.onerror = reject;

                document.head.appendChild(script);

            }
        );

    }


    /*=====================================================
        LOAD QR CODE LIBRARY
    =====================================================*/

    if (!window.QRCode) {

        await new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement("script");

                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";

                script.onload = resolve;

                script.onerror = reject;

                document.head.appendChild(script);

            }
        );

    }


    const { jsPDF } = window.jspdf;


    /*=====================================================
        CREATE PDF
    =====================================================*/

    const pdf =
        new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "A5"

        });


    const pageWidth = 148;


    /*=====================================================
        COLORS
    =====================================================*/

    const purple = [88, 48, 255];

    const dark = [17, 17, 17];

    const textDark = [20, 35, 60];

    const muted = [105, 105, 105];

    const light = [245, 247, 251];

    const white = [255, 255, 255];


    /*=====================================================
        PAGE BACKGROUND
    =====================================================*/

    pdf.setFillColor(
        ...light
    );

    pdf.rect(
        0,
        0,
        148,
        210,
        "F"
    );


    /*=====================================================
        PREMIUM TICKET CARD
    =====================================================*/

    pdf.setFillColor(
        ...white
    );

    pdf.roundedRect(
        12,
        12,
        124,
        273,
        7,
        7,
        "F"
    );


    /*=====================================================
        EVENT BANNER
    =====================================================*/

    if (ticket.banner_image) {

        try {

            const banner =
                await loadImage(
                    ticket.banner_image
                );

            pdf.addImage(
                banner,
                "JPEG",
                12,
                12,
                124,
                65
            );

        }

        catch (error) {

            console.warn(
                "BANNER IMAGE FAILED:",
                error
            );

        }

    }


    /*=====================================================
        BANNER OVERLAY
    =====================================================*/

    pdf.setFillColor(
        0,
        0,
        0,
        0.35
    );


    /*=====================================================
        TICKET BRAND
    =====================================================*/

    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(18);

    pdf.text(
        "TicketFussion",
        24,
        30
    );


    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(9);

    pdf.text(
        "OFFICIAL EVENT TICKET",
        24,
        38
    );


    /*=====================================================
        EVENT TITLE
    =====================================================*/

    pdf.setTextColor(
        ...textDark
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(20);


    const title =
        ticket.title ||
        "Event";


    pdf.text(
        title,
        24,
        94,
        {
            maxWidth: 170
        }
    );

/*=====================================================
    EVENT DETAILS
=====================================================*/

pdf.setFont(
    "helvetica",
    "normal"
);

pdf.setFontSize(10);

pdf.setTextColor(
    ...muted
);


pdf.text(
    `VENUE: ${ticket.venue || ""}, ${ticket.city || ""}`,
    24,
    104
);


pdf.text(
    `DATE: ${ticket.event_date || ""}`,
    24,
    112
);


pdf.text(
    `TIME: ${ticket.event_time || ""}`,
    24,
    120
);

    /*=====================================================
        SEAT INFORMATION
    =====================================================*/

    pdf.setFillColor(
        ...purple
    );

    pdf.roundedRect(
        24,
        130,
        162,
        32,
        5,
        5,
        "F"
    );


    pdf.setTextColor(
        ...white
    );

    pdf.setFontSize(8);


    pdf.text(
        "SECTION",
        35,
        141
    );

    pdf.text(
        "ROW",
        92,
        141
    );

    pdf.text(
        "SEAT",
        145,
        141
    );


    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(12);


    pdf.text(
        ticket.section || "-",
        35,
        153
    );

    pdf.text(
        ticket.row || "-",
        92,
        153
    );

    pdf.text(
        ticket.seat_numbers || "-",
        145,
        153
    );


    /*=====================================================
        CUSTOMER DETAILS
    =====================================================*/

    pdf.setTextColor(
        ...muted
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(8);


    pdf.text(
        "CUSTOMER",
        24,
        175
    );

    pdf.text(
        "TICKET TYPE",
        108,
        175
    );


    pdf.setTextColor(
        ...dark
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(10);


    pdf.text(
        ticket.customer_name || "-",
        24,
        182
    );


    pdf.text(
        ticket.ticket_type || "-",
        108,
        182
    );


    /*=====================================================
        REFERENCE
    =====================================================*/

    pdf.setFillColor(
        ...dark
    );

    pdf.roundedRect(
        24,
        192,
        162,
        25,
        5,
        5,
        "F"
    );


    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(7);


    pdf.text(
        "TICKET REFERENCE",
        105,
        201,
        {
            align: "center"
        }
    );


    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(13);


    pdf.text(
        ticket.ticket_reference || "-",
        105,
        211,
        {
            align: "center"
        }
    );


    /*=====================================================
        QR CODE
    =====================================================*/

    const qrContainer =
        document.createElement("div");


    new QRCode(
        qrContainer,
        {

            text:
                ticket.qr_code ||
                ticket.ticket_reference,

            width: 180,

            height: 180

        }
    );


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                300
            )
    );


    const qrCanvas =
        qrContainer.querySelector(
            "canvas"
        );


    if (qrCanvas) {

        const qrImage =
            qrCanvas.toDataURL(
                "image/png"
            );


        pdf.addImage(
            qrImage,
            "PNG",
            75,
            225,
            60,
            60
        );

    }


    /*=====================================================
        QR INSTRUCTION
    =====================================================*/

    pdf.setTextColor(
        ...muted
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(8);


    pdf.text(
        "Present this QR code at the venue entrance.",
        105,
        278,
        {
            align: "center"
        }
    );


    /*=====================================================
        SAVE
    =====================================================*/

    pdf.save(
        `${
            ticket.ticket_reference ||
            "ticket"
        }-TicketFussion.pdf`
    );

}


/*=========================================================
    LOAD IMAGE HELPER
=========================================================*/

function loadImage(url) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();

            img.crossOrigin =
                "Anonymous";

            img.onload =
                () => resolve(img);

            img.onerror =
                reject;

            img.src = url;

        }
    );

}


/*=========================================================
    START
=========================================================*/

loadTicket();