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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
        reference,
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
    // WEBSITE
    // ==========================
    return env.ASSETS.fetch(request);

  }
};