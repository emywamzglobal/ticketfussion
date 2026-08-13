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

const purple = [125, 55, 255];

const purpleLight = [165, 95, 255];

const dark = [7, 12, 22];

const darkCard = [12, 19, 31];

const textDark = [245, 245, 250];

const muted = [165, 170, 185];

const border = [42, 48, 65];

const white = [255, 255, 255];


/*=====================================================
    PAGE BACKGROUND
=====================================================*/

pdf.setFillColor(
    ...dark
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
    ...darkCard
);

pdf.roundedRect(
    8,
    8,
    132,
    194,
    7,
    7,
    "F"
);


/*=====================================================
    PREMIUM CARD BORDER
=====================================================*/

pdf.setDrawColor(
    ...border
);

pdf.setLineWidth(
    0.5
);

pdf.roundedRect(
    8,
    8,
    132,
    194,
    7,
    7,
    "S"
);
   /*=====================================================
    EVENT HERO / BANNER
=====================================================*/

if (ticket.banner_image) {

    try {

        const banner =
            await loadImage(
                ticket.banner_image
            );

            console.log("BANNER URL:", ticket.banner_image);


        /*---------------------------------------------
    FETCH BANNER FOR jsPDF
---------------------------------------------*/

const response = await fetch(ticket.banner_image);

if (!response.ok) {
    throw new Error("Banner fetch failed: " + response.status);
}

const blob = await response.blob();

const bannerUrl = URL.createObjectURL(blob);

const banner = await loadImage(bannerUrl);

/*---------------------------------------------
    RENDER EVENT BANNER
---------------------------------------------*/

pdf.addImage(
    banner,
    "JPEG",
    8,
    8,
    132,
    65
);

URL.revokeObjectURL(bannerUrl);

        /*---------------------------------------------
            RENDER EVENT BANNER
        ---------------------------------------------*/

        pdf.addImage(
            bannerData,
            "JPEG",
            8,
            8,
            132,
            65
        );

    }

    catch (error) {
    console.error("PDF BANNER FAILED:", error);
    alert("BANNER FAILED: " + error.message);
}

}

/*---------------------------------------------
    TICKETFUSSION BRAND
---------------------------------------------*/

pdf.setTextColor(
    ...white
);

pdf.setFont(
    "helvetica",
    "bold"
);

pdf.setFontSize(16);

pdf.text(
    "TicketFussion",
    17,
    25
);


pdf.setFont(
    "helvetica",
    "normal"
);

pdf.setFontSize(7);

pdf.text(
    "YOUR TICKET",
    17,
    32
);


/*---------------------------------------------
    TICKET STATUS
---------------------------------------------*/

const status =
    (
        ticket.status ||
        "ACTIVE"
    ).toUpperCase();


pdf.setFillColor(
    ...purple
);

pdf.roundedRect(
    112,
    16,
    28,
    12,
    6,
    6,
    "F"
);


pdf.setTextColor(
    ...white
);

pdf.setFont(
    "helvetica",
    "bold"
);

pdf.setFontSize(7);

pdf.text(
    status,
    126,
    23.5,
    {
        align: "center"
    }
);


/*---------------------------------------------
    EVENT TITLE
---------------------------------------------*/

pdf.setTextColor(
    ...white
);

pdf.setFont(
    "helvetica",
    "bold"
);

pdf.setFontSize(18);


const title =
    ticket.title ||
    "Event";


pdf.text(
    title,
    17,
    61,
    {
        maxWidth: 114
    }
);
/*=====================================================
    EVENT DETAILS
=====================================================*/

pdf.setFont(
    "helvetica",
    "normal"
);

pdf.setFontSize(8.5);

pdf.setTextColor(
    ...muted
);


pdf.text(
    `VENUE`,
    14,
    96
);

pdf.setTextColor(
    ...textDark
);

pdf.setFont(
    "helvetica",
    "bold"
);

pdf.text(
    `${ticket.venue || ""}${ticket.city ? ", " + ticket.city : ""}`,
    14,
    102,
    {
        maxWidth: 120
    }
);


pdf.setFont(
    "helvetica",
    "normal"
);

pdf.setFontSize(8);

pdf.setTextColor(
    ...muted
);

pdf.text(
    `DATE`,
    14,
    110
);

pdf.setTextColor(
    ...textDark
);

pdf.setFont(
    "helvetica",
    "bold"
);

pdf.text(
    ticket.event_date || "-",
    14,
    116
);


pdf.setFont(
    "helvetica",
    "normal"
);

pdf.setTextColor(
    ...muted
);

pdf.text(
    `TIME`,
    78,
    110
);

pdf.setTextColor(
    ...textDark
);

pdf.setFont(
    "helvetica",
    "bold"
);

pdf.text(
    ticket.event_time || "-",
    78,
    116
);


/*=====================================================
    SEAT INFORMATION
=====================================================*/

pdf.setFillColor(
    ...purple
);

pdf.roundedRect(
    14,
    123,
    120,
    30,
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

pdf.setFontSize(6.5);


pdf.text(
    "SECTION",
    28,
    133
);

pdf.text(
    "ROW",
    68,
    133
);

pdf.text(
    "SEAT",
    108,
    133
);


pdf.setFont(
    "helvetica",
    "bold"
);

pdf.setFontSize(11);


pdf.text(
    ticket.section || "-",
    28,
    144
);

pdf.text(
    ticket.row || "-",
    68,
    144
);

pdf.text(
    ticket.seat_numbers || "-",
    108,
    144
);
    /*=====================================================
    CUSTOMER DETAILS
=====================================================*/

pdf.setFont(
    "helvetica",
    "normal"
);

pdf.setFontSize(6.5);

pdf.setTextColor(
    ...muted
);


pdf.text(
    "CUSTOMER",
    14,
    163
);

pdf.text(
    "TICKET TYPE",
    82,
    163
);


pdf.setFont(
    "helvetica",
    "bold"
);

pdf.setFontSize(9);

pdf.setTextColor(
    ...textDark
);


pdf.text(
    ticket.customer_name || "-",
    14,
    170,
    {
        maxWidth: 58
    }
);


pdf.text(
    ticket.ticket_type || "-",
    82,
    170,
    {
        maxWidth: 52
    }
);


/*=====================================================
    REFERENCE
=====================================================*/

pdf.setFillColor(
    ...purple
);

pdf.roundedRect(
    14,
    176,
    120,
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

pdf.setFontSize(6);


pdf.text(
    "TICKET REFERENCE",
    74,
    184,
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
    191,
    {
        align: "center",
        maxWidth: 108
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


    pdf.addImage(
        qrImage,
        "PNG",
        112,
        153,
        18,
        18
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

pdf.setFontSize(5);


pdf.text(
    "SCAN AT VENUE ENTRY",
    121,
    173,
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