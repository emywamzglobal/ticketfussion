/* ==========================================================
   TICKETFUSSION CHECKOUT
========================================================== */


/* ==========================================================
   PAYSTACK
========================================================== */

const PAYSTACK_PUBLIC_KEY =
    "pk_live_4160c206082512a2d3c719c911b99d268db2ab37";


/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let checkoutData = null;

let orderId = null;

let orderReference = null;

const SERVICE_FEE = 10.00;

const DELIVERY_FEE = 0.00;

const TAX = 0.00;


/* ==========================================================
   START APPLICATION
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initialiseCheckout

);


/* ==========================================================
   INITIALISE CHECKOUT
========================================================== */

async function initialiseCheckout() {

    const params = new URLSearchParams(

        window.location.search

    );

    const ticketId = params.get("ticket");

    if (!ticketId) {

        alert("No ticket selected.");

        window.location.href = "index.html";

        return;

    }

    try {

        const response = await fetch(

            `/api/checkout/${ticketId}`

        );

        if (!response.ok) {

            throw new Error("Unable to load ticket.");

        }

        checkoutData = await response.json();

        renderCheckoutSummary();

        renderSelectedTicket();

        renderPricingSummary();

        bindEvents();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load checkout.");

    }

}


/* ==========================================================
   BUTTON EVENTS
========================================================== */

function bindEvents() {

    document

        .getElementById("complete-order")

        .addEventListener(

            "click",

            createOrder

        );

}


/* ==========================================================
   DATE FORMATTER
========================================================== */

function formatDate(date) {

    return new Date(date)

        .toLocaleDateString(

            undefined,

            {

                weekday: "long",

                year: "numeric",

                month: "long",

                day: "numeric"

            }

        );

}

/* ==========================================================
   CHECKOUT SUMMARY
========================================================== */

function renderCheckoutSummary() {

    const summary = document.getElementById(
        "checkout-summary"
    );

    summary.innerHTML = `

        <h2>${checkoutData.title}</h2>

        <p>

            ${checkoutData.venue},
            ${checkoutData.city},
            ${checkoutData.country}

        </p>

        <p>

            ${formatDate(checkoutData.event_date)}

        </p>

        <p>

            ${checkoutData.event_time}

        </p>

    `;

}


/* ==========================================================
   SELECTED TICKET
========================================================== */

function renderSelectedTicket() {

    const container = document.getElementById(
        "selected-ticket"
    );

    container.innerHTML = `

        <div class="selected-ticket-card">

            <h3>

                ${checkoutData.ticket_type}

            </h3>

            <p>

                <strong>Section:</strong>

                ${checkoutData.section || "-"}

            </p>

            <p>

                <strong>Row:</strong>

                ${checkoutData.row || "-"}

            </p>

            <p>

                <strong>Seats:</strong>

                ${checkoutData.seats || "-"}

            </p>

            <p>

                <strong>Delivery:</strong>

                ${checkoutData.delivery_method}

            </p>

        </div>

    `;

}


/* ==========================================================
   PRICING SUMMARY
========================================================== */

function renderPricingSummary() {

    const ticketPrice =
        Number(checkoutData.price);

    const subtotal =
        ticketPrice;

    const total =

        subtotal +

        SERVICE_FEE +

        DELIVERY_FEE +

        TAX;

    const pricing = document.getElementById(
        "pricing-summary"
    );

    pricing.innerHTML = `

        <div class="price-row">

            <span>

                Ticket

            </span>

            <span>

                $${subtotal.toFixed(2)}

            </span>

        </div>

        <div class="price-row">

            <span>

                Service Fee

            </span>

            <span>

                $${SERVICE_FEE.toFixed(2)}

            </span>

        </div>

        <div class="price-row">

            <span>

                Delivery

            </span>

            <span>

                $${DELIVERY_FEE.toFixed(2)}

            </span>

        </div>

        <div class="price-row">

            <span>

                Tax

            </span>

            <span>

                $${TAX.toFixed(2)}

            </span>

        </div>

        <hr>

        <div class="price-row total">

            <strong>

                Total

            </strong>

            <strong>

                $${total.toFixed(2)}

            </strong>

        </div>

    `;

}

/* ==========================================================
   CREATE ORDER
========================================================== */

async function createOrder() {

    const firstName = document
        .getElementById("first-name")
        .value
        .trim();

    const lastName = document
        .getElementById("last-name")
        .value
        .trim();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const phone = document
        .getElementById("phone")
        .value
        .trim();


    /* --------------------------
       VALIDATION
    -------------------------- */

    if (!firstName) {

        alert("Please enter your first name.");

        return;

    }

    if (!lastName) {

        alert("Please enter your last name.");

        return;

    }

    if (!email) {

        alert("Please enter your email address.");

        return;

    }

    if (!phone) {

        alert("Please enter your phone number.");

        return;

    }


    /* --------------------------
       CALCULATE TOTAL
    -------------------------- */

    const total =

        Number(checkoutData.price)

        + SERVICE_FEE

        + DELIVERY_FEE

        + TAX;


    /* --------------------------
       ORDER PAYLOAD
    -------------------------- */

    const payload = {

        ticket_listing_id:
            checkoutData.id,

        event_id:
            checkoutData.event_id,

        category:
            checkoutData.category,

        customer_name:
            `${firstName} ${lastName}`,

        customer_email:
            email,

        customer_phone:
            phone,

        customer_country:
            checkoutData.country,

        quantity:
            1,

        amount:
            total

    };


    /* --------------------------
       CREATE ORDER
    -------------------------- */

    try {

        const response = await fetch(

            "/api/orders",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(
                    payload
                )

            }

        );

        if (!response.ok) {

            throw new Error(
                "Unable to create order."
            );

        }

        const result =
            await response.json();

        orderId =
            result.order_id;

        orderReference =
            result.reference;

        launchPaystack(

            email,

            total

        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to create your order."
        );

    }

}

/* ==========================================================
   PAYSTACK PAYMENT
========================================================== */

function launchPaystack(email, amount) {

    if (!window.PaystackPop) {

        alert("Paystack failed to load.");

        return;

    }

    const handler = PaystackPop.setup({

        key: PAYSTACK_PUBLIC_KEY,

        email: email,

        amount: Math.round(amount * 100),

        currency: "USD",

        ref: orderReference,

        metadata: {

            custom_fields: [

                {

                    display_name: "Event",

                    variable_name: "event",

                    value: checkoutData.title

                },

                {

                    display_name: "Ticket",

                    variable_name: "ticket",

                    value: checkoutData.ticket_type

                },

                {

                    display_name: "Venue",

                    variable_name: "venue",

                    value: checkoutData.venue

                },

                {

                    display_name: "Customer",

                    variable_name: "customer",

                    value: email

                }

            ]

        },

        callback: async function (response) {

            try {

                const verify = await fetch(

                    "/api/payments/verify",

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            reference:
                                response.reference

                        })

                    }

                );

                const result =
                    await verify.json();

                if (result.success) {

                    alert(
                        "Payment successful!"
                    );

                    window.location.href =
                        `success.html?reference=${response.reference}`;

                }

                else {

                    alert(

                        result.message ||

                        "Payment verification failed."

                    );

                }

            }

            catch (error) {

                console.error(error);

                alert(

                    "Unable to verify payment."

                );

            }

        },

        onClose: function () {

            alert(

                "Payment cancelled."

            );

        }

    });

    handler.openIframe();

}