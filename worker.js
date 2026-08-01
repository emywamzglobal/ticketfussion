export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // ==========================
    // API ROUTES
    // ==========================
    if (url.pathname === "/api/orders" && request.method === "POST") {

    const body = await request.json();

    const reference =
        crypto.randomUUID();

    const result = await env.DB.prepare(`
        INSERT INTO orders (
            order_reference,
            ticket_listing_id,
            event_id,
            category,
            customer_name,
            customer_email,
            customer_phone,
            customer_country,
            quantity,
            amount,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
        reference,
        body.ticket_listing_id,
        body.event_id,
        body.category,
        body.customer_name,
        body.customer_email,
        body.customer_phone,
        body.customer_country,
        body.quantity,
        body.amount,
        "pending"
    )
    .run();

    return Response.json({

        success: true,

        order_id: result.meta.last_row_id,

        reference: reference

    });

}

// ==========================
// EVENTS
// ==========================

// Create Event
if (url.pathname === "/api/events" && request.method === "POST") {

    const body = await request.json();

    const result = await createEvent(body, env);

    return Response.json(result);

}

// Get All Events
if (url.pathname === "/api/events" && request.method === "GET") {

    const events = await getEvents(env);

    return Response.json(events);

}

if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/events\/\d+\/occurrences$/)
) {

    const eventId = url.pathname.split("/")[3];

    const { results } = await env.DB
        .prepare(`
            SELECT *
            FROM occurrences
            WHERE event_id = ?
            ORDER BY event_date ASC,
                     event_time ASC
        `)
        .bind(eventId)
        .all();

    return Response.json(results);

}

// Get Single Event
if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/events\/\d+$/)
) {

    const id = url.pathname.split("/")[3];

    const event = await getEvent(id, env);

    return Response.json(event);

}

// Update Event
if (url.pathname.startsWith("/api/events/") && request.method === "PUT") {

    const id = url.pathname.split("/").pop();

    const body = await request.json();

    const result = await updateEvent(id, body, env);

    return Response.json(result);

}

// Delete Event
if (url.pathname.startsWith("/api/events/") && request.method === "DELETE") {

    const id = url.pathname.split("/").pop();

    const result = await deleteEvent(id, env);

    return Response.json(result);

}

// ==========================
// OCCURRENCES
// ==========================

// Create Occurrence
if (url.pathname === "/api/occurrences" && request.method === "POST") {

    const body = await request.json();

    const result = await createOccurrence(body, env);

    return Response.json(result);

}

// Get All Occurrences
if (url.pathname === "/api/occurrences" && request.method === "GET") {

    const occurrences = await getOccurrences(env);

    return Response.json(occurrences);

}

if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/occurrences\/\d+\/ticket-listings$/)
) {

    const occurrenceId = url.pathname.split("/")[3];

    const { results } = await env.DB
        .prepare(`
            SELECT *
            FROM ticket_listings
            WHERE occurrence_id = ?
            ORDER BY price ASC
        `)
        .bind(occurrenceId)
        .all();

    return Response.json(results);

}

// Get Single Occurrence
if (url.pathname.startsWith("/api/occurrences/") && request.method === "GET") {

    const id = url.pathname.split("/").pop();

    const occurrence = await getOccurrence(id, env);

    return Response.json(occurrence);

}

// Update Occurrence
if (url.pathname.startsWith("/api/occurrences/") && request.method === "PUT") {

    const id = url.pathname.split("/").pop();

    const body = await request.json();

    const result = await updateOccurrence(id, body, env);

    return Response.json(result);

}

// Delete Occurrence
if (url.pathname.startsWith("/api/occurrences/") && request.method === "DELETE") {

    const id = url.pathname.split("/").pop();

    const result = await deleteOccurrence(id, env);

    return Response.json(result);

}

// ==========================
// TICKET LISTINGS
// ==========================

// Create Ticket Listing
if (url.pathname === "/api/ticket-listings" && request.method === "POST") {

    const body = await request.json();

    const result = await createTicketListing(body, env);

    return Response.json(result);

}

// Get All Ticket Listings
if (url.pathname === "/api/ticket-listings" && request.method === "GET") {

    const listings = await getTicketListings(env);

    return Response.json(listings);

}

// Get Single Ticket Listing
if (url.pathname.startsWith("/api/ticket-listings/") && request.method === "GET") {

    const id = url.pathname.split("/").pop();

    const listing = await getTicketListing(id, env);

    return Response.json(listing);

}

// Update Ticket Listing
if (url.pathname.startsWith("/api/ticket-listings/") && request.method === "PUT") {

    const id = url.pathname.split("/").pop();

    const body = await request.json();

    const result = await updateTicketListing(id, body, env);

    return Response.json(result);

}

// Delete Ticket Listing
if (url.pathname.startsWith("/api/ticket-listings/") && request.method === "DELETE") {

    const id = url.pathname.split("/").pop();

    const result = await deleteTicketListing(id, env);

    return Response.json(result);

}

// ==========================================================
// CHECKOUT
// GET /api/checkout/:ticketId
// ==========================================================

if (
    request.method === "GET" &&
    url.pathname.match(/^\/api\/checkout\/\d+$/)
) {

    const ticketId = url.pathname.split("/")[3];

    const checkout = await getCheckoutTicket(
        ticketId,
        env
    );

    return Response.json(checkout);

}

// ==========================================================
// VERIFY PAYSTACK PAYMENT
// POST /api/payments/verify
// ==========================================================

if (
    url.pathname === "/api/payments/verify" &&
    request.method === "POST"
) {

    const { reference } = await request.json();

    const result = await verifyPayment(
        reference,
        env
    );

    return Response.json(result);

}

// ==========================================================
// GET ORDER
// GET /api/orders/:reference
// ==========================================================

if (
    request.method === "GET" &&
    url.pathname.startsWith("/api/orders/")
) {

    const reference =
        url.pathname.split("/").pop();

    const order =
        await getOrderByReference(
            reference,
            env
        );

    return Response.json(order);

}

// ==========================
// UPLOAD IMAGE TO R2
// ==========================

if (url.pathname === "/api/upload" && request.method === "POST") {

    const formData = await request.formData();

    const file = formData.get("file");

    if (!file) {
        return Response.json(
            { error: "No file uploaded." },
            { status: 400 }
        );
    }

    const key = `event-banners/${Date.now()}-${file.name}`;

    await env.ASSETS.put(key, file.stream(), {
        httpMetadata: {
            contentType: file.type
        }
    });

    return Response.json({
        success: true,
        url: `https://pub-1d8af21f3a8c45fcbbfdb4e95bb13a1f.r2.dev/${key}`
    });
}

    // ==========================
    // WEBSITE
    // ==========================
    return env.ASSETS.fetch(request);

  }
};


/* ==========================================================
   EVENTS
========================================================== */

/**
 * Create Event
 */
async function createEvent(request, env) {

    const {
        title,
        category,
        description,
        banner_image
    } = request;

    const result = await env.DB
        .prepare(`
            INSERT INTO events (

                title,
                category,
                description,
                banner_image

            )

            VALUES (?, ?, ?, ?)
        `)
        .bind(

            title,
            category,
            description,
            banner_image

        )
        .run();

    return result;

}

/**
 * Get All Events
 */
async function getEvents(env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM events

            ORDER BY created_at DESC
        `)
        .all();

    return result.results;

}

/**
 * Get Event
 */
async function getEvent(id, env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM events

            WHERE id = ?
        `)
        .bind(id)
        .first();

    return result;

}

/**
 * Update Event
 */
async function updateEvent(id, request, env) {

    const {
        title,
        category,
        description,
        banner_image
    } = request;

    const result = await env.DB
        .prepare(`
            UPDATE events

            SET

                title = ?,
                category = ?,
                description = ?,
                banner_image = ?

            WHERE id = ?
        `)
        .bind(

            title,
            category,
            description,
            banner_image,
            id

        )
        .run();

    return result;

}

/**
 * Delete Event
 */
async function deleteEvent(id, env) {

    const result = await env.DB
        .prepare(`
            DELETE FROM events

            WHERE id = ?
        `)
        .bind(id)
        .run();

    return result;

}


/* ==========================================================
   OCCURRENCES
========================================================== */

/**
 * Create Occurrence
 */
async function createOccurrence(request, env) {

    const {
        event_id,
        about_event,
        event_gallery,
        event_information,
        venue,
        venue_information,
        venue_layout,
        city,
        country,
        event_date,
        event_time
    } = request;

    const result = await env.DB
        .prepare(`
            INSERT INTO occurrences (

                event_id,
                about_event,
                event_gallery,
                event_information,
                venue,
                venue_information,
                venue_layout,
                city,
                country,
                event_date,
                event_time

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(

            event_id,
            about_event,
            event_gallery,
            event_information,
            venue,
            venue_information,
            venue_layout,
            city,
            country,
            event_date,
            event_time

        )
        .run();

    return result;

}

/**
 * Get All Occurrences
 */
async function getOccurrences(env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM occurrences

            ORDER BY event_date ASC
        `)
        .all();

    return result.results;

}

/**
 * Get Single Occurrence
 */
async function getOccurrence(id, env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM occurrences

            WHERE id = ?
        `)
        .bind(id)
        .first();

    return result;

}

/**
 * Update Occurrence
 */
async function updateOccurrence(id, request, env) {

    const {
        event_id,
        about_event,
        event_gallery,
        event_information,
        venue,
        venue_information,
        venue_layout,
        city,
        country,
        event_date,
        event_time
    } = request;

    const result = await env.DB
        .prepare(`
            UPDATE occurrences

            SET

                event_id = ?,
                about_event = ?,
                event_gallery = ?,
                event_information = ?,
                venue = ?,
                venue_information = ?,
                venue_layout = ?,
                city = ?,
                country = ?,
                event_date = ?,
                event_time = ?

            WHERE id = ?
        `)
        .bind(

            event_id,
            about_event,
            event_gallery,
            event_information,
            venue,
            venue_information,
            venue_layout,
            city,
            country,
            event_date,
            event_time,
            id

        )
        .run();

    return result;

}

/**
 * Delete Occurrence
 */
async function deleteOccurrence(id, env) {

    const result = await env.DB
        .prepare(`
            DELETE FROM occurrences

            WHERE id = ?
        `)
        .bind(id)
        .run();

    return result;

}

/* ==========================================================
   TICKET LISTINGS
========================================================== */

/**
 * Create Ticket Listing
 */
async function createTicketListing(request, env) {

    const {
        occurrence_id,
        ticket_type,
        section,
        row,
        seats,
        quantity,
        price,
        delivery_method
    } = request;

    const result = await env.DB
        .prepare(`
            INSERT INTO ticket_listings (

                occurrence_id,
                ticket_type,
                section,
                row,
                seats,
                quantity,
                price,
                delivery_method

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(

            occurrence_id,
            ticket_type,
            section,
            row,
            seats,
            quantity,
            price,
            delivery_method

        )
        .run();

    return result;

}

/**
 * Get All Ticket Listings
 */
async function getTicketListings(env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM ticket_listings

            ORDER BY created_at DESC
        `)
        .all();

    return result.results;

}

/**
 * Get Single Ticket Listing
 */
async function getTicketListing(id, env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM ticket_listings

            WHERE id = ?
        `)
        .bind(id)
        .first();

    return result;

}

/**
 * Update Ticket Listing
 */
async function updateTicketListing(id, request, env) {

    const {
        occurrence_id,
        ticket_type,
        section,
        row,
        seats,
        quantity,
        price,
        delivery_method
    } = request;

    const result = await env.DB
        .prepare(`
            UPDATE ticket_listings

            SET

                occurrence_id = ?,
                ticket_type = ?,
                section = ?,
                row = ?,
                seats = ?,
                quantity = ?,
                price = ?,
                delivery_method = ?

            WHERE id = ?
        `)
        .bind(

            occurrence_id,
            ticket_type,
            section,
            row,
            seats,
            quantity,
            price,
            delivery_method,
            id

        )
        .run();

    return result;

}

/**
 * Delete Ticket Listing
 */
async function deleteTicketListing(id, env) {

    const result = await env.DB
        .prepare(`
            DELETE FROM ticket_listings

            WHERE id = ?
        `)
        .bind(id)
        .run();

    return result;

}


/* ==========================================================
   CHECKOUT
========================================================== */

async function getCheckoutTicket(id, env) {

    const result = await env.DB
        .prepare(`

SELECT

    tl.id,
    tl.ticket_type,
    tl.section,
    tl.row,
    tl.seats,
    tl.quantity,
    tl.price,
    tl.delivery_method,

    o.id AS occurrence_id,
    o.event_date,
    o.event_time,
    o.venue,
    o.city,
    o.country,

    e.id AS event_id,
    e.title,
    e.category,
    e.banner_image

FROM ticket_listings tl

INNER JOIN occurrences o
    ON tl.occurrence_id = o.id

INNER JOIN events e
    ON o.event_id = e.id

WHERE tl.id = ?

LIMIT 1

        `)
        .bind(id)
        .first();

    return result;

}

/* ==========================================================
   VERIFY PAYMENT
========================================================== */

async function verifyPayment(reference, env) {

    const response = await fetch(

        `https://api.paystack.co/transaction/verify/${reference}`,

        {

            headers: {

                Authorization:
                    `Bearer ${env.PAYSTACK_SECRET_KEY}`

            }

        }

    );

    const data = await response.json();

    if (
        !data.status ||
        data.data.status !== "success"
    ) {

        return {

            success: false,

            message:
                "Payment not verified."

        };

    }

    await env.DB.prepare(`

        UPDATE orders

        SET

            status = 'paid'

        WHERE order_reference = ?

    `)
    .bind(reference)
    .run();

    return {

        success: true,

        payment: data.data

    };

}

/* ==========================================================
   GET ORDER BY REFERENCE
========================================================== */

async function getOrderByReference(reference, env) {

    const result = await env.DB.prepare(`

SELECT

    o.order_reference,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.quantity,
    o.amount,
    o.status,

    e.title,

    oc.venue,
    oc.city,
    oc.country,
    oc.event_date,
    oc.event_time,

    tl.ticket_type,
    tl.delivery_method

FROM orders o

INNER JOIN ticket_listings tl
ON tl.id = o.ticket_listing_id

INNER JOIN occurrences oc
ON oc.id = tl.occurrence_id

INNER JOIN events e
ON e.id = oc.event_id

WHERE o.order_reference = ?

LIMIT 1

    `)
    .bind(reference)
    .first();

    return result;

}