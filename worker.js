export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // ==========================
    // API ROUTES
    // ==========================
    if (url.pathname === "/api/orders") {

      const { results } = await env.DB
        .prepare("SELECT COUNT(*) AS total FROM orders")
        .all();

      return Response.json({
        success: true,
        orders: results[0].total
      });

    }

    // ==========================
    // WEBSITE
    // ==========================
    return env.ASSETS.fetch(request);

  }
};