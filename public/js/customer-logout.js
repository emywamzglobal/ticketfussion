export async function customerLogout(request, env) {
  const token =
    request.headers.get("Authorization")
      ?.replace("Bearer ", "");

  if (!token) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  await env.DB.prepare(`
    DELETE FROM customer_sessions
    WHERE session_token = ?
  `)
    .bind(token)
    .run();

  return Response.json({
    success: true,
    message: "Logged out"
  });
}