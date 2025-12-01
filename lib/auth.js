export async function requireAdmin(request) {
  // Par défaut, la valeur 'admin' fonctionne en dev (process.env.ADMIN_BEARER).
  const auth = request.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.ADMIN_BEARER || "admin"}`;
  if (auth === expected) return;
  throw new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  });
}
