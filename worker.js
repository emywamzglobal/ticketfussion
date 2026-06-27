export default {
  async fetch(request, env) {

    const { results } = await env.DB
      .prepare("SELECT COUNT(*) AS total FROM orders")
      .all();

    return Response.json({
      success: true,
      orders: results[0].total
    });

  }
}