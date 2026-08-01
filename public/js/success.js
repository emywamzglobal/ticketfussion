/* ==========================================================
   TICKETFUSSION
   SUCCESS PAGE
========================================================== */


/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initialiseSuccess

);


/* ==========================================================
   INITIALISE
========================================================== */

async function initialiseSuccess() {

    const reference =

        new URLSearchParams(

            window.location.search

        ).get("reference");


    if (!reference) {

        alert("Invalid order.");

        window.location.href = "index.html";

        return;

    }

    try {

        const response = await fetch(

            `/api/orders/${reference}`

        );

        if (!response.ok) {

            throw new Error("Unable to load order.");

        }

        const order = await response.json();

        if (!order) {

            throw new Error("Order not found.");

        }

        renderOrder(order);

    }

    catch (error) {

        console.error(error);

        alert("Unable to load order.");

    }

}


/* ==========================================================
   RENDER ORDER
========================================================== */

function renderOrder(order) {

    const container =

        document.getElementById(

            "order-details"

        );

    container.innerHTML = `

        <div class="order-row">

            <strong>

                Order Reference

            </strong>

            <span>

                ${order.order_reference}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Customer

            </strong>

            <span>

                ${order.customer_name}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Email

            </strong>

            <span>

                ${order.customer_email}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Phone

            </strong>

            <span>

                ${order.customer_phone}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Event

            </strong>

            <span>

                ${order.title}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Venue

            </strong>

            <span>

                ${order.venue}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Location

            </strong>

            <span>

                ${order.city}, ${order.country}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Event Date

            </strong>

            <span>

                ${formatDate(order.event_date)}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Event Time

            </strong>

            <span>

                ${order.event_time}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Ticket Type

            </strong>

            <span>

                ${order.ticket_type}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Quantity

            </strong>

            <span>

                ${order.quantity}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Delivery

            </strong>

            <span>

                ${order.delivery_method}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Amount Paid

            </strong>

            <span>

                $${Number(order.amount).toFixed(2)}

            </span>

        </div>

        <div class="order-row">

            <strong>

                Payment Status

            </strong>

            <span>

                ${order.status.toUpperCase()}

            </span>

        </div>

    `;

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