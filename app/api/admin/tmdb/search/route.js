import { searchMovies } from "../../../../../lib/tmdb";
import { requireAdmin } from "../../../../../lib/auth";

export async function GET(request) {
  await requireAdmin(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  if (!q) {
    return new Response(JSON.stringify({ results: [], total_results: 0 }), {
      status: 200,
    });
  }
  try {
    const data = await searchMovies(q, page);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
