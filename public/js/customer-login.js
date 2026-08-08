import { verifyPassword } from "../utils/password.js";

export async function customerLogin(request, env) {
  try {
    const { email, password } = await request.json();

    const customer = await env.DB.prepare(`
      SELECT *
      FROM customers
      WHERE email = ?
      LIMIT 1
    `)
      .bind(email.toLowerCase())
      .first();

    if (!customer) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(
      password,
      customer.password_hash
    );

    if (!valid) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO customer_sessions (
        customer_id,
        session_token,
        expires_at
      )
      VALUES (
        ?,
        ?,
        datetime('now','+30 days')
      )
    `)
      .bind(customer.id, token)
      .run();

    await env.DB.prepare(`
      UPDATE customers
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
      .bind(customer.id)
      .run();

    return Response.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email
      }
    });

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}