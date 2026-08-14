import bcrypt from "bcryptjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

/* ==========================================================
   OCCURRENCE TIMEZONE HELPERS
========================================================== */

/**
 * Convert an occurrence's local date/time + IANA timezone
 * into the correct UTC Date.
 *
 * Example:
 * 2026-08-14 20:00
 * America/New_York
 *
 * becomes the corresponding UTC instant.
 */
function occurrenceDateToUTC(
    eventDate,
    eventTime,
    timezone
) {

    if (!eventDate || !eventTime || !timezone) {
        return null;
    }

    const [year, month, day] =
        eventDate.split("-").map(Number);

    const [hour, minute, second = 0] =
        eventTime.split(":").map(Number);

    /*
     * Start by treating the local occurrence time
     * as if it were UTC.
     */
    let timestamp =
        Date.UTC(
            year,
            month - 1,
            day,
            hour,
            minute,
            second
        );

    /*
     * Correct the timestamp using the actual IANA
     * timezone offset.
     */
    for (let i = 0; i < 3; i++) {

        const parts =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone: timezone,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hourCycle: "h23"
                }
            ).formatToParts(
                new Date(timestamp)
            );

        const values = {};

        for (const part of parts) {

            if (
                part.type !== "literal"
            ) {
                values[part.type] =
                    Number(part.value);
            }

        }

        const timezoneLocalTimestamp =
            Date.UTC(
                values.year,
                values.month - 1,
                values.day,
                values.hour,
                values.minute,
                values.second
            );

        const requestedLocalTimestamp =
            Date.UTC(
                year,
                month - 1,
                day,
                hour,
                minute,
                second
            );

        const difference =
            requestedLocalTimestamp -
            timezoneLocalTimestamp;

        timestamp += difference;

    }

    return new Date(timestamp);

}
export default {
  async fetch(request, env) {

    const url = new URL(request.url);

if (url.pathname === "/sitemap.xml") {

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>https://www.ticketfussion.com/</loc>
<changefreq>daily</changefreq>
<priority>1.0</priority>
</url>

<url>
<loc>https://www.ticketfussion.com/about.html</loc>
<changefreq>monthly</changefreq>
<priority>0.7</priority>
</url>

<url>
<loc>https://www.ticketfussion.com/contact.html</loc>
<changefreq>monthly</changefreq>
<priority>0.7</priority>
</url>

<url>
<loc>https://www.ticketfussion.com/faq.html</loc>
<changefreq>monthly</changefreq>
<priority>0.7</priority>
</url>

<url>
<loc>https://www.ticketfussion.com/event.html</loc>
<changefreq>daily</changefreq>
<priority>0.9</priority>
</url>

</urlset>`;

    return new Response(sitemap, {

        headers: {

            "Content-Type": "application/xml"

        }

    });

}

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
            seats,
            amount,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
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
        body.seats,
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
            AND status != 'archived'
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
            AND status != 'archived'
            AND status != 'closed'
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

// ==========================
// TICKETS
// ==========================

// Create Ticket
if (url.pathname === "/api/tickets" && request.method === "POST") {

    const body = await request.json();

    const result = await createTicket(body, env);

    return Response.json(result);

}

// Get All Tickets
if (url.pathname === "/api/tickets" && request.method === "GET") {

    const tickets = await getTickets(env);

    return Response.json(tickets);

}

// Get Ticket By Reference
if (
    request.method === "GET" &&
    url.pathname.startsWith("/api/tickets/reference/")
) {

    const reference = url.pathname.split("/").pop();

    const ticket = await getTicketByReference(
        reference,
        env
    );

    return Response.json(ticket);

}


// Get Single Ticket
if (url.pathname.startsWith("/api/tickets/") && request.method === "GET") {

    const id = url.pathname.split("/").pop();

    const ticket = await getTicket(id, env);

    return Response.json(ticket);

}

// Update Ticket
if (url.pathname.startsWith("/api/tickets/") && request.method === "PUT") {

    const id = url.pathname.split("/").pop();

    const body = await request.json();

    const result = await updateTicket(id, body, env);

    return Response.json(result);

}

// Delete Ticket
if (url.pathname.startsWith("/api/tickets/") && request.method === "DELETE") {

    const id = url.pathname.split("/").pop();

    const result = await deleteTicket(id, env);

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

// ==========================================================
// ADMIN LOGIN
// POST /api/admin/login
// ==========================================================

if (
    url.pathname === "/api/admin/login" &&
    request.method === "POST"
) {

    const body = await request.json();

    const result = await loginAdmin(

        body,

        env

    );

    return Response.json(result);

}

// ==========================================================
// ADMIN SESSION
// GET /api/admin/session
// ==========================================================

if (

    url.pathname === "/api/admin/session" &&
    request.method === "GET"

) {

    const sessionToken =

        request.headers.get("Authorization");

    const result = await getAdminSession(

        sessionToken,

        env

    );

    return Response.json(result);

}

// ==========================================================
// ADMIN LOGOUT
// POST /api/admin/logout
// ==========================================================

if (

    url.pathname === "/api/admin/logout" &&
    request.method === "POST"

) {

    const body = await request.json();

    const result = await logoutAdmin(

        body.session_token,

        env

    );

    return Response.json(result);

}

// ==========================================================
// CUSTOMER REGISTER
// POST /api/customer/register
// ==========================================================

if (
    url.pathname === "/api/customer/register" &&
    request.method === "POST"
) {

    const body = await request.json();

    const result = await registerCustomer(
        body,
        env
    );

    return Response.json(result);

}

// ==========================================================
// CUSTOMER LOGIN
// POST /api/customer/login
// ==========================================================

if (
    url.pathname === "/api/customer/login" &&
    request.method === "POST"
) {

    const body = await request.json();

    const result = await loginCustomer(
        body,
        env
    );

    return Response.json(result);

}

// ==========================================================
// CUSTOMER SESSION
// GET /api/customer/session
// ==========================================================

if (
    url.pathname === "/api/customer/session" &&
    request.method === "GET"
) {

    const sessionToken =
        request.headers.get("Authorization");

    const result =
        await getCustomerSession(
            sessionToken,
            env
        );

    return Response.json(result);

}

// ==========================================================
// CUSTOMER LOGOUT
// POST /api/customer/logout
// ==========================================================

if (
    url.pathname === "/api/customer/logout" &&
    request.method === "POST"
) {

    const body = await request.json();

    const result =
        await logoutCustomer(
            body.session_token,
            env
        );

    return Response.json(result);

}

// ==========================================================
// EXCHANGE RATES
// GET /api/exchange-rates
// ==========================================================

if (
    url.pathname === "/api/exchange-rates" &&
    request.method === "GET"
) {

    const response = await fetch(
        "https://api.frankfurter.app/latest?from=USD&to=GBP,EUR,CAD,AUD"
    );

    const data = await response.json();

    return Response.json({

        USD: 1,

        GBP: data.rates.GBP,

        EUR: data.rates.EUR,

        CAD: data.rates.CAD,

        AUD: data.rates.AUD

    });

}



// ==========================
// WEBSITE
// ==========================
return env.ASSETS.fetch(request);

},

async scheduled(event, env, ctx) {

    const now = new Date();

    /*
     * Get all occurrences.
     *
     * Each occurrence has its own:
     * event_date
     * event_time
     * timezone
     */
    const { results: occurrences } =
        await env.DB
            .prepare(`
                SELECT
                    id,
                    event_date,
                    event_time,
                    timezone,
                    status
                FROM occurrences
            `)
            .all();


    /*
     * Process every occurrence according
     * to its own local timezone.
     */
    for (const occurrence of occurrences) {

        const eventUTC =
            occurrenceDateToUTC(
                occurrence.event_date,
                occurrence.event_time,
                occurrence.timezone
            );


        /*
         * Never guess if timezone is missing.
         */
        if (!eventUTC) {

            console.error(
                `Occurrence ${occurrence.id} has no valid timezone.`
            );

            continue;

        }


        /*
         * Hours remaining until the event.
         */
        const millisecondsUntilEvent =
            eventUTC.getTime() -
            now.getTime();

        const hoursUntilEvent =
            millisecondsUntilEvent /
            (1000 * 60 * 60);


        /* ======================================================
           EVENT HAS PASSED
        ====================================================== */

        if (hoursUntilEvent <= 0) {

            /*
             * 24+ hours after event
             * → ARCHIVED
             */
            if (hoursUntilEvent <= -24) {

                await env.DB
                    .prepare(`
                        UPDATE occurrences

                        SET status = 'archived'

                        WHERE id = ?
                    `)
                    .bind(
                        occurrence.id
                    )
                    .run();


                await env.DB
                    .prepare(`
                        UPDATE ticket_listings

                        SET status = 'archived'

                        WHERE occurrence_id = ?
                    `)
                    .bind(
                        occurrence.id
                    )
                    .run();

            }


            /*
             * Event has passed but is less
             * than 24 hours old
             * → COMPLETED
             */
            else {

                await env.DB
                    .prepare(`
                        UPDATE occurrences

                        SET status = 'completed'

                        WHERE id = ?
                    `)
                    .bind(
                        occurrence.id
                    )
                    .run();

            }


            continue;

        }


        /* ======================================================
           LESS THAN 12 HOURS BEFORE EVENT
        ====================================================== */

        if (hoursUntilEvent <= 12) {

            await env.DB
                .prepare(`
                    UPDATE occurrences

                    SET status = 'closed'

                    WHERE id = ?
                `)
                .bind(
                    occurrence.id
                )
                .run();


            await env.DB
                .prepare(`
                    UPDATE ticket_listings

                    SET status = 'closed'

                    WHERE occurrence_id = ?
                `)
                .bind(
                    occurrence.id
                )
                .run();


            continue;

        }


        /* ======================================================
           12–24 HOURS BEFORE EVENT
        ====================================================== */

        if (hoursUntilEvent <= 24) {

            await env.DB
                .prepare(`
                    UPDATE occurrences

                    SET status = 'limited'

                    WHERE id = ?
                `)
                .bind(
                    occurrence.id
                )
                .run();


            await env.DB
                .prepare(`
                    UPDATE ticket_listings

                    SET status = 'limited'

                    WHERE occurrence_id = ?
                `)
                .bind(
                    occurrence.id
                )
                .run();


            continue;

        }


        /* ======================================================
           MORE THAN 24 HOURS BEFORE EVENT
        ====================================================== */

        await env.DB
            .prepare(`
                UPDATE occurrences

                SET status = 'active'

                WHERE id = ?
            `)
            .bind(
                occurrence.id
            )
            .run();

    }


    /* ==========================================================
       DELETE DATA 30 DAYS AFTER THE EVENT
    ========================================================== */

    /*
     * We do this separately because the 30-day calculation
     * must also use the occurrence's actual timezone.
     */

    const { results: archivedOccurrences } =
        await env.DB
            .prepare(`
                SELECT
                    id,
                    event_date,
                    event_time,
                    timezone
                FROM occurrences
                WHERE status = 'archived'
            `)
            .all();


    for (const occurrence of archivedOccurrences) {

        const eventUTC =
            occurrenceDateToUTC(
                occurrence.event_date,
                occurrence.event_time,
                occurrence.timezone
            );


        if (!eventUTC) {

            console.error(
                `Archived occurrence ${occurrence.id} has no valid timezone.`
            );

            continue;

        }


        /*
         * 30 days after the actual event time.
         */
        const thirtyDaysAfterEvent =
            new Date(
                eventUTC.getTime() +
                (30 * 24 * 60 * 60 * 1000)
            );


        if (now >= thirtyDaysAfterEvent) {

            /*
             * Delete ticket listings first.
             */
            await env.DB
                .prepare(`
                    DELETE FROM ticket_listings

                    WHERE occurrence_id = ?
                `)
                .bind(
                    occurrence.id
                )
                .run();


            /*
             * Then delete the occurrence.
             */
            await env.DB
                .prepare(`
                    DELETE FROM occurrences

                    WHERE id = ?
                `)
                .bind(
                    occurrence.id
                )
                .run();

        }

    }

}
}
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
        event_time,
        timezone
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
                event_time,
                timezone,
                status

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            timezone,
            "active"

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
        event_time,
        timezone
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
                event_time = ?,
                timezone = ?

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
            timezone,
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
   TICKETS
========================================================== */

/**
 * Create Ticket
 */
async function createTicket(request, env) {

    const {
        ticket_reference,
        order_id,
        ticket_listing_id,
        occurrence_id,
        event_id,
        customer_name,
        customer_email,
        section,
        row,
        seat_numbers,
        qr_code,
        status
    } = request;

    const result = await env.DB
        .prepare(`
            INSERT INTO tickets (

                ticket_reference,
                order_id,
                ticket_listing_id,
                occurrence_id,
                event_id,
                customer_name,
                customer_email,
                section,
                row,
                seat_numbers,
                qr_code,
                status

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(

            ticket_reference,
            order_id,
            ticket_listing_id,
            occurrence_id,
            event_id,
            customer_name,
            customer_email,
            section,
            row,
            seat_numbers,
            qr_code,
            status

        )
        .run();

    return result;

}

/**
 * Get All Tickets
 */
async function getTickets(env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM tickets

            ORDER BY created_at DESC
        `)
        .all();

    return result.results;

}

/**
 * Get Single Ticket
 */
async function getTicket(id, env) {

    const result = await env.DB
        .prepare(`
            SELECT *

            FROM tickets

            WHERE id = ?
        `)
        .bind(id)
        .first();

    return result;

}

/* ==========================================================
   GET TICKET BY REFERENCE
========================================================== */

async function getTicketByReference(reference, env) {

    const result = await env.DB
        .prepare(`

SELECT

    t.ticket_reference,
    t.customer_name,
    t.customer_email,
    t.section,
    t.row,
    t.seat_numbers,
    t.qr_code,
    t.status,

    tl.ticket_type,

    o.event_date,
    o.event_time,
    o.venue,
    o.city,
    o.country,

    e.title,
    e.category,
    e.banner_image

FROM tickets t

INNER JOIN ticket_listings tl
ON tl.id = t.ticket_listing_id

INNER JOIN occurrences o
ON o.id = t.occurrence_id

INNER JOIN events e
ON e.id = t.event_id

WHERE t.ticket_reference = ?

LIMIT 1

        `)
        .bind(reference)
        .first();

    return result;

}

/**
 * Update Ticket
 */
async function updateTicket(id, request, env) {

    const {
        ticket_reference,
        order_id,
        ticket_listing_id,
        occurrence_id,
        event_id,
        customer_name,
        customer_email,
        section,
        row,
        seat_numbers,
        qr_code,
        status
    } = request;

    const result = await env.DB
        .prepare(`
            UPDATE tickets

            SET

                ticket_reference = ?,
                order_id = ?,
                ticket_listing_id = ?,
                occurrence_id = ?,
                event_id = ?,
                customer_name = ?,
                customer_email = ?,
                section = ?,
                row = ?,
                seat_numbers = ?,
                qr_code = ?,
                status = ?

            WHERE id = ?
        `)
        .bind(

            ticket_reference,
            order_id,
            ticket_listing_id,
            occurrence_id,
            event_id,
            customer_name,
            customer_email,
            section,
            row,
            seat_numbers,
            qr_code,
            status,
            id

        )
        .run();

    return result;

}

/**
 * Delete Ticket
 */
async function deleteTicket(id, env) {

    const result = await env.DB
        .prepare(`
            DELETE FROM tickets

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
   Paystack → Order → Payment → Ticket → Email
========================================================== */

async function verifyPayment(reference, env) {

    try {

        /* ------------------------------------------------------
           1. VERIFY PAYMENT WITH PAYSTACK
        ------------------------------------------------------ */

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
            !data.data ||
            data.data.status !== "success"
        ) {
            return {
                success: false,
                message: "Payment not verified."
            };
        }


        /* ------------------------------------------------------
           2. GET ORDER
        ------------------------------------------------------ */

        const order = await getOrderByReference(
            reference,
            env
        );

        if (!order) {
            return {
                success: false,
                message:
                    "Payment verified, but order was not found."
            };
        }


        /* ------------------------------------------------------
           3. MARK ORDER AS PAID
        ------------------------------------------------------ */

        await env.DB.prepare(`
            UPDATE orders
            SET status = 'paid'
            WHERE order_reference = ?
        `)
        .bind(reference)
        .run();


        /* ------------------------------------------------------
           4. RECORD PAYMENT
           
           INSERT OR IGNORE is important because
           payment_reference is UNIQUE.

           If Paystack verification runs twice,
           it will NOT stop the ticket process.
        ------------------------------------------------------ */

        await env.DB.prepare(`
            INSERT OR IGNORE INTO payments (
                payment_reference,
                order_id,
                gateway,
                gateway_reference,
                amount,
                currency,
                payment_method,
                payment_status,
                paid_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)
        .bind(
            reference,
            order.id,
            "Paystack",
            data.data.reference,
            data.data.amount / 100,
            data.data.currency,
            data.data.channel || "card",
            "success"
        )
        .run();


/* ------------------------------------------------------
   5. CHECK IF TICKET ALREADY EXISTS
------------------------------------------------------ */

let existingTicket = await env.DB
    .prepare(`
        SELECT
            ticket_reference,
            email_sent_at
        FROM tickets
        WHERE order_id = ?
        LIMIT 1
    `)
    .bind(order.id)
    .first();


/* ------------------------------------------------------
   6. CREATE TICKET IF IT DOES NOT EXIST
------------------------------------------------------ */

if (!existingTicket) {

    const selectedSeats =
    String(order.seats || "")
        .split(",")
        .map(seat => seat.trim())
        .filter(Boolean);

if (
    selectedSeats.length !== Number(order.quantity)
) {
    throw new Error(
        "Selected seats do not match ticket quantity."
    );
}

const listing =
    await env.DB
        .prepare(`
            SELECT
                seats,
                quantity
            FROM ticket_listings
            WHERE id = ?
        `)
        .bind(order.ticket_listing_id)
        .first();

if (!listing) {
    throw new Error(
        "Ticket listing not found."
    );
}

const availableSeats =
    String(listing.seats || "")
        .split(",")
        .map(seat => seat.trim())
        .filter(Boolean);

const unavailableSeats =
    selectedSeats.filter(
        seat => !availableSeats.includes(seat)
    );

if (unavailableSeats.length) {
    throw new Error(
        `Seat(s) no longer available: ${unavailableSeats.join(", ")}`
    );
}

const remainingSeats =
    availableSeats.filter(
        seat => !selectedSeats.includes(seat)
    );

await env.DB
    .prepare(`
        UPDATE ticket_listings
        SET
            seats = ?,
            quantity = ?
        WHERE id = ?
    `)
    .bind(
        remainingSeats.join(", "),
        remainingSeats.length,
        order.ticket_listing_id
    )
    .run();

    const ticketReference =
        "TF-" +
        crypto.randomUUID()
            .replace(/-/g, "")
            .substring(0, 10)
            .toUpperCase();

    const qrCode =
        ticketReference;

    try {

        await createTicket(
            {
                ticket_reference:
                    ticketReference,

                order_id:
                    order.id,

                ticket_listing_id:
                    order.ticket_listing_id,

                occurrence_id:
                    order.occurrence_id,

                event_id:
                    order.event_id,

                customer_name:
                    order.customer_name,

                customer_email:
                    order.customer_email,

                section:
                    order.section,

                row:
                    order.row,

                seat_numbers:
                    order.seats,

                qr_code:
                    qrCode,

                status:
                    "active"
            },
            env
        );

    } catch (ticketError) {

        /*
         * Another request may have created
         * the ticket at the same time.
         *
         * Re-read it instead of creating
         * a duplicate ticket.
         */

        console.error(
            "TICKET CREATION ERROR:",
            ticketError
        );
    }


    /* --------------------------------------------------
       RE-READ TICKET
    -------------------------------------------------- */

    existingTicket =
        await env.DB
            .prepare(`
                SELECT
                    ticket_reference,
                    email_sent_at
                FROM tickets
                WHERE order_id = ?
                LIMIT 1
            `)
            .bind(order.id)
            .first();


    if (!existingTicket) {

        throw new Error(
            "Payment verified, but ticket could not be created."
        );

    }

}


/* ------------------------------------------------------
   7. SEND TICKET EMAIL
------------------------------------------------------ */

if (!existingTicket.email_sent_at) {

    try {

        console.log(
            "ABOUT TO SEND TICKET EMAIL:",
            order.id,
            existingTicket.ticket_reference,
            order.customer_email
        );


        await sendTicketEmail(
            order,
            existingTicket.ticket_reference,
            env
        );


        /* ----------------------------------------------
           MARK EMAIL AS SENT
        ---------------------------------------------- */

        await env.DB
            .prepare(`
                UPDATE tickets
                SET email_sent_at = CURRENT_TIMESTAMP
                WHERE order_id = ?
            `)
            .bind(order.id)
            .run();


        console.log(
            "TICKET EMAIL SENT:",
            existingTicket.ticket_reference
        );

    }

    catch (emailError) {

        /*
         * Ticket exists and payment is valid.
         *
         * Do NOT turn a successful payment into
         * a failed payment just because email failed.
         *
         * email_sent_at remains NULL so a later
         * verification/retry can send it.
         */

        console.error(
            "TICKET EMAIL FAILED:",
            emailError
        );

    }

}

/* ------------------------------------------------------
   8. SUCCESS
------------------------------------------------------ */

return {

    success:
        true,

    payment:
        data.data,

    ticket_reference:
        existingTicket.ticket_reference,

    order

    };

} catch (error) {

    console.error(
        "PAYMENT VERIFICATION ERROR:",
        error
    );

    return {

        success:
            false,

        message:
            "Payment was received, but ticket processing failed.",

        error:
            error?.message || String(error)

    };

}

}
/* ==========================================================
   GET ORDER BY REFERENCE
========================================================== */

async function getOrderByReference(reference, env) {

    const result = await env.DB
        .prepare(`

SELECT

    o.id,
    o.order_reference,
    o.ticket_listing_id,
    o.event_id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.customer_country,
    o.quantity,
    o.seats,
    o.amount,
    o.status,

    tl.ticket_type,
    tl.section,
    tl.row,
    tl.delivery_method,
    tl.occurrence_id,

    oc.event_date,
    oc.event_time,
    oc.venue,
    oc.city,
    oc.country,

    e.title

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

/* ==========================================================
   GENERATE TICKET PDF
   TicketFussion
   A5 PDF
   Cloudflare Worker safe
   No Canvas
   No browser APIs
========================================================== */

async function generateTicketPdf(
    ticketReference,
    env
) {

    /* ======================================================
       1. GET THE ACTUAL TICKET
    ====================================================== */

    const ticket =
        await getTicketByReference(
            ticketReference,
            env
        );


    if (!ticket) {

        throw new Error(
            "Ticket not found for PDF generation."
        );

    }


    /* ======================================================
       2. CREATE QR MATRIX
    ====================================================== */

    const qr =
        QRCode.create(
            ticketReference,
            {
                errorCorrectionLevel: "M"
            }
        );


    const qrSize =
        qr.modules.size;


    /* ======================================================
       3. CREATE A5 PDF
       A5 = 148 × 210 mm
       PDF points = 419.53 × 595.28
    ====================================================== */

    const pdf =
        await PDFDocument.create();


    const pageWidth =
        419.53;

    const pageHeight =
        595.28;


    const page =
        pdf.addPage([
            pageWidth,
            pageHeight
        ]);


    /* ======================================================
       4. FONTS
    ====================================================== */

    const regularFont =
        await pdf.embedFont(
            StandardFonts.Helvetica
        );


    const boldFont =
        await pdf.embedFont(
            StandardFonts.HelveticaBold
        );


    /* ======================================================
       5. COLORS
    ====================================================== */

    const purple =
        rgb(
            91 / 255,
            46 / 255,
            255 / 255
        );


    const dark =
        rgb(
            7 / 255,
            12 / 255,
            22 / 255
        );


    const darkCard =
        rgb(
            12 / 255,
            19 / 255,
            31 / 255
        );


    const textLight =
        rgb(
            245 / 255,
            245 / 255,
            250 / 255
        );


    const muted =
        rgb(
            165 / 255,
            170 / 255,
            185 / 255
        );


    const border =
        rgb(
            42 / 255,
            48 / 255,
            65 / 255
        );


    const white =
        rgb(
            1,
            1,
            1
        );


    const black =
        rgb(
            0,
            0,
            0
        );


    /* ======================================================
       6. PAGE BACKGROUND
    ====================================================== */

    page.drawRectangle({

        x: 0,
        y: 0,

        width:
            pageWidth,

        height:
            pageHeight,

        color:
            dark

    });


    /* ======================================================
       7. MAIN TICKET CARD
    ====================================================== */

    const margin =
        22;


    const cardWidth =
        pageWidth -
        (margin * 2);


    page.drawRectangle({

        x:
            margin,

        y:
            margin,

        width:
            cardWidth,

        height:
            pageHeight -
            (margin * 2),

        color:
            darkCard

    });


    /* ======================================================
       8. EVENT BANNER
    ====================================================== */

    const bannerX =
        margin;

    const bannerY =
        pageHeight -
        margin -
        155;

    const bannerWidth =
        cardWidth;

    const bannerHeight =
        155;


    let bannerEmbedded =
        false;


    if (ticket.banner_image) {

        try {

            const bannerResponse =
                await fetch(
                    ticket.banner_image
                );


            if (
                bannerResponse.ok
            ) {

                const bannerBytes =
                    await bannerResponse.arrayBuffer();


                const contentType =
                    (
                        bannerResponse.headers.get(
                            "content-type"
                        ) ||
                        ""
                    ).toLowerCase();


                let bannerImage;


                if (
                    contentType.includes(
                        "png"
                    ) ||
                    ticket.banner_image
                        .toLowerCase()
                        .includes(".png")
                ) {

                    bannerImage =
                        await pdf.embedPng(
                            bannerBytes
                        );

                }

                else {

                    bannerImage =
                        await pdf.embedJpg(
                            bannerBytes
                        );

                }


                const imageWidth =
                    bannerImage.width;

                const imageHeight =
                    bannerImage.height;


                const imageRatio =
                    imageWidth /
                    imageHeight;


                const bannerRatio =
                    bannerWidth /
                    bannerHeight;


                let drawWidth =
                    bannerWidth;

                let drawHeight =
                    bannerHeight;


                if (
                    imageRatio >
                    bannerRatio
                ) {

                    drawHeight =
                        bannerHeight;

                    drawWidth =
                        drawHeight *
                        imageRatio;

                }

                else {

                    drawWidth =
                        bannerWidth;

                    drawHeight =
                        drawWidth /
                        imageRatio;

                }


                const imageX =
                    bannerX +
                    (
                        bannerWidth -
                        drawWidth
                    ) / 2;


                const imageY =
                    bannerY +
                    (
                        bannerHeight -
                        drawHeight
                    ) / 2;


                page.drawImage(
                    bannerImage,
                    {
                        x:
                            imageX,

                        y:
                            imageY,

                        width:
                            drawWidth,

                        height:
                            drawHeight
                    }
                );


                bannerEmbedded =
                    true;

            }

        }

        catch (error) {

            console.error(
                "PDF BANNER FAILED:",
                error
            );

        }

    }


    /* ======================================================
       9. BANNER FALLBACK
    ====================================================== */

    if (!bannerEmbedded) {

        page.drawRectangle({

            x:
                bannerX,

            y:
                bannerY,

            width:
                bannerWidth,

            height:
                bannerHeight,

            color:
                purple

        });

    }


    /* ======================================================
       10. BANNER DARK OVERLAY
    ====================================================== */

    page.drawRectangle({

        x:
            bannerX,

        y:
            bannerY,

        width:
            bannerWidth,

        height:
            bannerHeight,

        color:
            black,

        opacity:
            0.35

    });


    /* ======================================================
       11. TICKETFUSSION BRAND
    ====================================================== */

    page.drawText(
        "TicketFussion",
        {

            x:
                bannerX + 16,

            y:
                bannerY +
                bannerHeight -
                30,

            size:
                17,

            font:
                boldFont,

            color:
                white

        }
    );


    page.drawText(
        "YOUR TICKET",
        {

            x:
                bannerX + 16,

            y:
                bannerY +
                bannerHeight -
                44,

            size:
                7,

            font:
                regularFont,

            color:
                white

        }
    );


    /* ======================================================
       12. STATUS
    ====================================================== */

    const status =
        (
            ticket.status ||
            "ACTIVE"
        ).toUpperCase();


    page.drawRectangle({

        x:
            bannerX +
            bannerWidth -
            82,

        y:
            bannerY +
            bannerHeight -
            42,

        width:
            66,

        height:
            24,

        color:
            purple

    });


    page.drawText(
        status,
        {

            x:
                bannerX +
                bannerWidth -
                49,

            y:
                bannerY +
                bannerHeight -
                34,

            size:
                7,

            font:
                boldFont,

            color:
                white

        }
    );


    /* ======================================================
       13. EVENT TITLE
    ====================================================== */

    const eventTitle =
        ticket.title ||
        "Event";


    page.drawText(
        eventTitle,
        {

            x:
                bannerX + 16,

            y:
                bannerY + 27,

            size:
                19,

            font:
                boldFont,

            color:
                white,

            maxWidth:
                bannerWidth - 32

        }
    );


    /* ======================================================
       14. EVENT DETAILS
    ====================================================== */

    let currentY =
        bannerY -
        25;


    page.drawText(
        "EVENT DETAILS",
        {

            x:
                margin + 14,

            y:
                currentY,

            size:
                8,

            font:
                boldFont,

            color:
                purple

        }
    );


    currentY -= 18;


    page.drawText(
        "VENUE",
        {

            x:
                margin + 14,

            y:
                currentY,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        `${
            ticket.venue || "-"
        }${
            ticket.city
                ? ", " + ticket.city
                : ""
        }`,
        {

            x:
                margin + 14,

            y:
                currentY - 13,

            size:
                10,

            font:
                regularFont,

            color:
                textLight

        }
    );


    page.drawText(
        "DATE",
        {

            x:
                margin + 210,

            y:
                currentY,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticket.event_date ||
        "-",
        {

            x:
                margin + 210,

            y:
                currentY - 13,

            size:
                10,

            font:
                regularFont,

            color:
                textLight

        }
    );


    currentY -= 42;


    page.drawText(
        "TIME",
        {

            x:
                margin + 14,

            y:
                currentY,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticket.event_time ||
        "-",
        {

            x:
                margin + 14,

            y:
                currentY - 13,

            size:
                10,

            font:
                regularFont,

            color:
                textLight

        }
    );


    /* ======================================================
       15. SEAT INFORMATION CARD
    ====================================================== */

    const seatCardY =
        currentY -
        58;


    page.drawRectangle({

        x:
            margin + 10,

        y:
            seatCardY,

        width:
            cardWidth - 20,

        height:
            62,

        color:
            dark

    });


    page.drawText(
        "SECTION",
        {

            x:
                margin + 22,

            y:
                seatCardY + 43,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticket.section ||
        "-",
        {

            x:
                margin + 22,

            y:
                seatCardY + 23,

            size:
                14,

            font:
                boldFont,

            color:
                white

        }
    );


    page.drawText(
        "ROW",
        {

            x:
                margin + 135,

            y:
                seatCardY + 43,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticket.row ||
        "-",
        {

            x:
                margin + 135,

            y:
                seatCardY + 23,

            size:
                14,

            font:
                boldFont,

            color:
                white

        }
    );


    page.drawText(
        "SEAT",
        {

            x:
                margin + 245,

            y:
                seatCardY + 43,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticket.seat_numbers ||
        "-",
        {

            x:
                margin + 245,

            y:
                seatCardY + 23,

            size:
                14,

            font:
                boldFont,

            color:
                white

        }
    );


    /* ======================================================
       16. CUSTOMER DETAILS
    ====================================================== */

    const detailsY =
        seatCardY -
        24;


    page.drawText(
        "CUSTOMER",
        {

            x:
                margin + 14,

            y:
                detailsY,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticket.customer_name ||
        "-",
        {

            x:
                margin + 14,

            y:
                detailsY - 14,

            size:
                10,

            font:
                boldFont,

            color:
                textLight

        }
    );


    page.drawText(
        "TICKET TYPE",
        {

            x:
                margin + 210,

            y:
                detailsY,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticket.ticket_type ||
        "-",
        {

            x:
                margin + 210,

            y:
                detailsY - 14,

            size:
                10,

            font:
                regularFont,

            color:
                textLight

        }
    );


    /* ======================================================
       17. TICKET REFERENCE
    ====================================================== */

    const referenceY =
        detailsY -
        65;


    page.drawRectangle({

        x:
            margin + 10,

        y:
            referenceY,

        width:
            cardWidth - 20,

        height:
            34,

        color:
            dark

    });


    page.drawText(
        "TICKET REFERENCE",
        {

            x:
                margin + 20,

            y:
                referenceY + 21,

            size:
                7,

            font:
                boldFont,

            color:
                muted

        }
    );


    page.drawText(
        ticketReference,
        {

            x:
                margin + 20,

            y:
                referenceY + 8,

            size:
                11,

            font:
                boldFont,

            color:
                white

        }
    );


    /* ======================================================
       18. QR CODE
    ====================================================== */

    const qrDisplaySize =
        105;


    const qrX =
        pageWidth -
        margin -
        qrDisplaySize -
        14;


    const qrY =
        margin + 18;


    page.drawRectangle({

        x:
            qrX - 10,

        y:
            qrY - 10,

        width:
            qrDisplaySize + 20,

        height:
            qrDisplaySize + 20,

        color:
            white

    });


    const moduleSize =
        qrDisplaySize /
        qrSize;


    for (
        let row = 0;
        row < qrSize;
        row++
    ) {

        for (
            let col = 0;
            col < qrSize;
            col++
        ) {

            if (
                qr.modules.get(
                    row,
                    col
                )
            ) {

                page.drawRectangle({

                    x:
                        qrX +
                        (
                            col *
                            moduleSize
                        ),

                    y:
                        qrY +
                        (
                            (
                                qrSize -
                                1 -
                                row
                            ) *
                            moduleSize
                        ),

                    width:
                        moduleSize +
                        0.2,

                    height:
                        moduleSize +
                        0.2,

                    color:
                        black

                });

            }

        }

    }


    /* ======================================================
       19. QR LABEL
    ====================================================== */

    page.drawText(
        "SCAN AT VENUE ENTRY",
        {

            x:
                margin + 14,

            y:
                qrY + 62,

            size:
                9,

            font:
                boldFont,

            color:
                purple

        }
    );


    page.drawText(
        "Present this QR code",
        {

            x:
                margin + 14,

            y:
                qrY + 47,

            size:
                8,

            font:
                regularFont,

            color:
                muted

        }
    );


    page.drawText(
        "at the venue.",
        {

            x:
                margin + 14,

            y:
                qrY + 35,

            size:
                8,

            font:
                regularFont,

            color:
                muted

        }
    );


    /* ======================================================
       20. SAVE PDF
    ====================================================== */

    const pdfBytes =
        await pdf.save();


    /* ======================================================
       21. CONVERT TO BASE64
    ====================================================== */

    let binary = "";


    for (
        const byte of pdfBytes
    ) {

        binary +=
            String.fromCharCode(
                byte
            );

    }


    return btoa(
        binary
    );

}
/* ==========================================================
   SEND TICKET EMAIL
========================================================== */
async function sendTicketEmail(
    order,
    ticketReference,
    env
) {

    const ticketUrl =
        `https://www.ticketfussion.com/my-ticket.html?ticket=${ticketReference}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 20px;">

<table width="650" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;">

<tr>
<td style="background:#5B2EFF;padding:30px;text-align:center;color:#fff;">

<h1 style="margin:0;">TicketFussion</h1>

<p style="margin-top:10px;">
Your ticket is ready 🎉
</p>

</td>
</tr>

<tr>
<td style="padding:35px;">

<h2>Hi ${order.customer_name},</h2>

<p>
Thank you for purchasing with <strong>TicketFussion</strong>.
</p>

<p>
Your payment has been confirmed.
</p>

<hr>

<h2>${order.title || "Your Event"}</h2>

<p>
📍 ${order.venue || ""}, ${order.city || ""}, ${order.country || ""}
</p>

<p>
📅 ${order.event_date || ""}
</p>

<p>
🕗 ${order.event_time || ""}
</p>

<p>🎫 Ticket Reference</p>

<h3>${ticketReference}</h3>

<p>
Your ticket is securely stored on TicketFussion.
Click below to access your QR code and entry details.
</p>

<p style="text-align:center;margin:40px 0;">

<a
href="${ticketUrl}"
style="background:#5B2EFF;
color:#fff;
padding:15px 35px;
text-decoration:none;
border-radius:8px;
font-weight:bold;">

View My Ticket

</a>

</p>

<hr>

<p style="color:#666;">
Need help?<br>
support@ticketfussion.com
</p>

<p style="color:#999;font-size:13px;">
© 2026 TicketFussion
<br>
The Global Ticket Marketplace
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

    let pdfBase64;

    try {

        pdfBase64 =
            await generateTicketPdf(
                ticketReference,
                env
            );

            console.log(
    "PDF DONE:",
    ticketReference
);

    } catch (error) {

        console.error(
            "TICKET PDF GENERATION FAILED:",
            error
        );

        throw new Error(
            "Ticket created, but PDF generation failed."
        );

    }

    console.log(
    "CALLING RESEND:",
    order.customer_email
);

    const response = await fetch(
        "https://api.resend.com/emails",
        {
            method: "POST",

            headers: {
                Authorization:
                    `Bearer ${env.RESEND_API_KEY}`,

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                from:
                    "TicketFussion <tickets@ticketfussion.com>",

                to:
                    [order.customer_email],

                subject:
                    `Your Ticket for ${order.title || "Your Event"}`,

                html,

                attachments: [
                    {
                        filename:
                            `${ticketReference}.pdf`,

                        content:
                            pdfBase64
                    }
                ]

            })
        }
    );

    const result =
        await response.json();

    console.log(
        "RESEND RESPONSE:",
        JSON.stringify(result)
    );

    if (!response.ok) {

        console.error(
            "RESEND EMAIL FAILED:",
            response.status,
            JSON.stringify(result)
        );

        throw new Error(
            `Resend rejected email: ${JSON.stringify(result)}`
        );

    }

    /*
     * IMPORTANT:
     * Only mark the ticket email as sent after
     * Resend has accepted the request.
     */

    await env.DB.prepare(`
        UPDATE tickets
        SET email_sent_at = CURRENT_TIMESTAMP
        WHERE ticket_reference = ?
    `)
    .bind(ticketReference)
    .run();

    console.log(
        "TICKET EMAIL ACCEPTED BY RESEND:",
        ticketReference,
        result
    );

    return result;
}

/* ==========================================================
   ADMIN LOGIN
========================================================== */

async function loginAdmin(body, env) {

    const {

        email,

        password

    } = body;

    const admin = await env.DB
        .prepare(`

            SELECT *

            FROM admin_users

            WHERE email = ?

            LIMIT 1

        `)
        .bind(email)
        .first();

    if (!admin) {

        return {

            success: false,

            message: "Invalid email or password."

        };

    }

    const validPassword = await bcrypt.compare(

        password,

        admin.password_hash

    );

    if (!validPassword) {

        return {

            success: false,

            message: "Invalid email or password."

        };

    }

    await env.DB.prepare(`

        UPDATE admin_users

        SET last_login = datetime('now')

        WHERE id = ?

    `)
    .bind(admin.id)
    .run();

    const sessionToken = crypto.randomUUID();

const expiresAt = new Date(
    Date.now() + (24 * 60 * 60 * 1000)
).toISOString();

await env.DB.prepare(`

    INSERT INTO admin_sessions (

        admin_id,

        session_token,

        expires_at

    )

    VALUES (?, ?, ?)

`)
.bind(

    admin.id,

    sessionToken,

    expiresAt

)
.run();

return {

    success: true,

    session_token: sessionToken,

    message: "Login successful."

};
}

/* ==========================================================
   GET ADMIN SESSION
========================================================== */

async function getAdminSession(

    sessionToken,

    env

) {

    if (!sessionToken) {

        return {

            success: false,

            message: "No session."

        };

    }

    const session = await env.DB.prepare(`

        SELECT

            admin_users.id,
            admin_users.email,
            admin_sessions.expires_at

        FROM admin_sessions

        INNER JOIN admin_users
        ON admin_users.id = admin_sessions.admin_id

        WHERE admin_sessions.session_token = ?

        LIMIT 1

    `)
    .bind(sessionToken)
    .first();

    if (!session) {

        return {

            success: false,

            message: "Invalid session."

        };

    }

    if (

        new Date(session.expires_at) < new Date()

    ) {

        return {

            success: false,

            message: "Session expired."

        };

    }

    return {

        success: true,

        admin: {

            id: session.id,

            email: session.email

        }

    };

}

/* ==========================================================
   LOGOUT ADMIN
========================================================== */

async function logoutAdmin(

    sessionToken,

    env

) {

    await env.DB.prepare(`

        DELETE FROM admin_sessions

        WHERE session_token = ?

    `)
    .bind(sessionToken)
    .run();

    return {

        success: true,

        message: "Logged out."

    };

}

async function registerCustomer(
    body,
    env
) {

    const {
        first_name,
        last_name,
        email,
        phone,
        password
    } = body;

    const existingCustomer =
        await env.DB.prepare(`

            SELECT id

            FROM customers

            WHERE email = ?

            LIMIT 1

        `)
        .bind(email)
        .first();

    if (existingCustomer) {

        return {
            success: false,
            message:
                "Email already registered."
        };

    }

    const passwordHash =
        await bcrypt.hash(
            password,
            10
        );

    const result =
        await env.DB.prepare(`

            INSERT INTO customers (

                first_name,
                last_name,
                email,
                phone,
                password_hash

            )

            VALUES (?, ?, ?, ?, ?)

        `)
        .bind(

            first_name,
            last_name,
            email,
            phone,
            passwordHash

        )
        .run();

    return {

        success: true,

        customer_id:
            result.meta.last_row_id,

        message:
            "Account created successfully."

    };

}

async function loginCustomer(
    body,
    env
) {

    const {
        email,
        password
    } = body;

    const customer =
        await env.DB.prepare(`

            SELECT *

            FROM customers

            WHERE email = ?

            LIMIT 1

        `)
        .bind(email)
        .first();

    if (!customer) {

        return {

            success: false,

            message:
                "Invalid email or password."

        };

    }

    const validPassword =
        await bcrypt.compare(
            password,
            customer.password_hash
        );

    if (!validPassword) {

        return {

            success: false,

            message:
                "Invalid email or password."

        };

    }

    await env.DB.prepare(`

        UPDATE customers

        SET last_login = datetime('now')

        WHERE id = ?

    `)
    .bind(customer.id)
    .run();

    const sessionToken =
        crypto.randomUUID();

    const expiresAt =
        new Date(
            Date.now() +
            (30 * 24 * 60 * 60 * 1000)
        ).toISOString();

    await env.DB.prepare(`

        INSERT INTO customer_sessions (

            customer_id,
            session_token,
            expires_at

        )

        VALUES (?, ?, ?)

    `)
    .bind(

        customer.id,
        sessionToken,
        expiresAt

    )
    .run();

    return {

        success: true,

        session_token:
            sessionToken,

        customer: {

            id: customer.id,
            first_name:
                customer.first_name,
            last_name:
                customer.last_name,
            email:
                customer.email

        }

    };

}

async function getCustomerSession(
    sessionToken,
    env
) {

    if (!sessionToken) {

        return {

            success: false,

            message:
                "No session."

        };

    }

    const session =
        await env.DB.prepare(`

SELECT

    c.id,
    c.first_name,
    c.last_name,
    c.email,
    cs.expires_at

FROM customer_sessions cs

INNER JOIN customers c
ON c.id = cs.customer_id

WHERE cs.session_token = ?

LIMIT 1

        `)
        .bind(sessionToken)
        .first();

    if (!session) {

        return {

            success: false,

            message:
                "Invalid session."

        };

    }

    if (
        new Date(session.expires_at)
        < new Date()
    ) {

        return {

            success: false,

            message:
                "Session expired."

        };

    }

    return {

        success: true,

        customer: {

            id: session.id,
            first_name:
                session.first_name,
            last_name:
                session.last_name,
            email:
                session.email

        }

    };

}

async function logoutCustomer(
    sessionToken,
    env
) {

    await env.DB.prepare(`

        DELETE FROM customer_sessions

        WHERE session_token = ?

    `)
    .bind(sessionToken)
    .run();

    return {

        success: true,

        message:
            "Logged out."

    };

}
