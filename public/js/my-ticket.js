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

    /*=====================================================
        PREMIUM A5 PAGE
    =====================================================*/

    const pageWidth = 148;
    const pageHeight = 210;

    const purple = [88, 48, 255];
    const purpleLight = [145, 82, 255];

    const pageDark = [5, 9, 18];
    const cardDark = [10, 16, 28];
    const cardBorder = [35, 43, 58];

    const white = [255, 255, 255];
    const softWhite = [225, 229, 238];
    const muted = [155, 163, 178];


    /*=====================================================
        PAGE BACKGROUND
    =====================================================*/

    pdf.setFillColor(
        ...pageDark
    );

    pdf.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
    );


    /*=====================================================
        MAIN TICKET CARD
    =====================================================*/

    pdf.setFillColor(
        ...cardDark
    );

    pdf.roundedRect(
        6,
        6,
        136,
        198,
        6,
        6,
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
                6,
                6,
                136,
                58
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
        BANNER DARK OVERLAY
    =====================================================*/

    pdf.setFillColor(
        5,
        9,
        18
    );

    pdf.rect(
        6,
        6,
        136,
        58,
        "F"
    );


    /*=====================================================
        TICKETFUSSION BRAND
    =====================================================*/

    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(15);

    pdf.text(
        "TicketFussion",
        14,
        20
    );


    pdf.setTextColor(
        ...purpleLight
    );

    pdf.text(
        "Fussion",
        14 + pdf.getTextWidth("Ticket"),
        20
    );


    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(6.5);

    pdf.text(
        "YOUR TICKET",
        14,
        27
    );


    /*=====================================================
        STATUS PILL
    =====================================================*/

    pdf.setFillColor(
        ...purple
    );

    pdf.roundedRect(
        105,
        13,
        28,
        10,
        5,
        5,
        "F"
    );


    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(6.5);

    pdf.text(
        (
            ticket.status ||
            "ACTIVE"
        ).toUpperCase(),
        119,
        19.5,
        {
            align: "center"
        }
    );


    /*=====================================================
        EVENT TITLE
    =====================================================*/

    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(21);


    const title =
        ticket.title ||
        "Event";


    pdf.text(
        title,
        14,
        50,
        {
            maxWidth: 115
        }
    );


    /*=====================================================
        EVENT DETAILS
    =====================================================*/

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(7);

    pdf.setTextColor(
        ...softWhite
    );


    /* VENUE */

    pdf.text(
        `${ticket.venue || ""}${ticket.city ? ", " + ticket.city : ""}`,
        14,
        57,
        {
            maxWidth: 70
        }
    );


    /* DATE */

    pdf.text(
        ticket.event_date || "",
        91,
        57,
        {
            maxWidth: 42
        }
    );


    /* TIME */

    pdf.text(
        ticket.event_time || "",
        91,
        62
    );


    /*=====================================================
        SEAT INFORMATION CARD
    =====================================================*/

    pdf.setFillColor(
        14,
        21,
        34
    );

    pdf.roundedRect(
        12,
        70,
        124,
        29,
        5,
        5,
        "F"
    );


    pdf.setDrawColor(
        ...cardBorder
    );

    pdf.setLineWidth(
        0.3
    );

    pdf.roundedRect(
        12,
        70,
        124,
        29,
        5,
        5,
        "S"
    );


    /* DIVIDERS */

    pdf.setDrawColor(
        45,
        53,
        68
    );

    pdf.line(
        53,
        76,
        53,
        93
    );

    pdf.line(
        94,
        76,
        94,
        93
    );


    /* LABELS */

    pdf.setTextColor(
        ...purpleLight
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(6);


    pdf.text(
        "SECTION",
        32.5,
        79,
        {
            align: "center"
        }
    );

    pdf.text(
        "ROW",
        73.5,
        79,
        {
            align: "center"
        }
    );

    pdf.text(
        "SEAT",
        115,
        79,
        {
            align: "center"
        }
    );


    /* VALUES */

    pdf.setTextColor(
        ...white
    );

    pdf.setFontSize(12);


    pdf.text(
        ticket.section || "-",
        32.5,
        91,
        {
            align: "center"
        }
    );

    pdf.text(
        ticket.row || "-",
        73.5,
        91,
        {
            align: "center"
        }
    );

    pdf.text(
        ticket.seat_numbers || "-",
        115,
        91,
        {
            align: "center"
        }
    );


    /*=====================================================
        CUSTOMER INFORMATION CARD
    =====================================================*/

    pdf.setFillColor(
        14,
        21,
        34
    );

    pdf.roundedRect(
        12,
        104,
        124,
        45,
        5,
        5,
        "F"
    );


    pdf.setDrawColor(
        ...cardBorder
    );

    pdf.roundedRect(
        12,
        104,
        124,
        45,
        5,
        5,
        "S"
    );


    /* CUSTOMER */

    pdf.setTextColor(
        ...muted
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(6);


    pdf.text(
        "CUSTOMER",
        18,
        112
    );


    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(8.5);


    pdf.text(
        ticket.customer_name || "-",
        18,
        118,
        {
            maxWidth: 65
        }
    );


    /* EMAIL */

    pdf.setTextColor(
        ...muted
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(6);

    pdf.text(
        "EMAIL",
        18,
        127
    );


    pdf.setTextColor(
        ...softWhite
    );

    pdf.setFontSize(7);

    pdf.text(
        ticket.customer_email || "-",
        18,
        133,
        {
            maxWidth: 65
        }
    );


    /* TICKET TYPE */

    pdf.setTextColor(
        ...muted
    );

    pdf.setFontSize(6);

    pdf.text(
        "TICKET TYPE",
        18,
        142
    );


    pdf.setTextColor(
        ...white
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(7.5);

    pdf.text(
        ticket.ticket_type || "-",
        18,
        147,
        {
            maxWidth: 65
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
                ticket.ticket_reference ||
                "",

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


        /* WHITE QR BOX */

        pdf.setFillColor(
            ...white
        );

        pdf.roundedRect(
            99,
            108,
            30,
            30,
            3,
            3,
            "F"
        );


        /* QR */

        pdf.addImage(
            qrImage,
            "PNG",
            101,
            110,
            26,
            26
        );


        /* PURPLE ACCENT */

        pdf.setFillColor(
            ...purple
        );

        pdf.roundedRect(
            99,
            138,
            30,
            7,
            2,
            2,
            "F"
        );


        pdf.setTextColor(
            ...white
        );

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(4.5);

        pdf.text(
            "SCAN AT VENUE",
            114,
            142.5,
            {
                align: "center"
            }
        );

    }


    /*=====================================================
        TICKET REFERENCE
    =====================================================*/

    pdf.setFillColor(
        ...purple
    );

    pdf.roundedRect(
        12,
        154,
        124,
        20,
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

    pdf.setFontSize(5.5);

    pdf.text(
        "TICKET REFERENCE",
        74,
        161,
        {
            align: "center"
        }
    );


    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(9);

    pdf.text(
        ticket.ticket_reference || "-",
        74,
        169,
        {
            align: "center",
            maxWidth: 108
        }
    );


    /*=====================================================
        FOOTER
    =====================================================*/

    pdf.setTextColor(
        ...muted
    );

    pdf.setFont(
        "helvetica",
        "normal"
    );

    pdf.setFontSize(5.5);

    pdf.text(
        "Present this ticket and QR code at the venue entrance.",
        74,
        184,
        {
            align: "center"
        }
    );


    pdf.setTextColor(
        ...purpleLight
    );

    pdf.setFont(
        "helvetica",
        "bold"
    );

    pdf.setFontSize(6);

    pdf.text(
        "TicketFussion • Official Event Ticket",
        74,
        193,
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