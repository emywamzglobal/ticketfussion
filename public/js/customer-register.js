import { hashPassword } from "../utils/password.js";

export async function customerRegister(request, env) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      password
    } = await request.json();

    if (!first_name || !last_name || !email || !password) {
      return Response.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await env.DB.prepare(`
      SELECT id
      FROM customers
      WHERE email = ?
    `)
      .bind(email.toLowerCase())
      .first();

    if (existing) {
      return Response.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await env.DB.prepare(`
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
        email.toLowerCase(),
        phone || null,
        passwordHash
      )
      .run();

    return Response.json({
      success: true,
      customer_id: result.meta.last_row_id
    });

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}