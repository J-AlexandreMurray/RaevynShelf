import { createClient } from "@supabase/supabase-js";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return Response.json({ error: "Authentication required." }, { status: 401 });

  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    return Response.json({ error: "Account deletion is not configured." }, { status: 503 });
  }

  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return Response.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const { error } = await admin.auth.admin.deleteUser(userData.user.id);
  if (error) return Response.json({ error: "Could not delete account." }, { status: 500 });

  return Response.json({ ok: true });
};
