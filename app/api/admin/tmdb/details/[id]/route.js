import { getMovieDetails, getMovieCredits } from "../../../../../../lib/tmdb";
import { requireAdmin } from "../../../../../../lib/auth";

export async function GET(request, ctx) {
  await requireAdmin(request);

  let params = ctx?.params;
  if (params && typeof params.then === "function") {
    try {
      params = await params;
    } catch (e) {
      params = undefined;
    }
  }

  const id =
    params?.id ||
    (() => {
      try {
        const url = new URL(request.url);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1];
      } catch (e) {
        return null;
      }
    })();
  if (!id)
    return new Response(JSON.stringify({ error: "Missing id param" }), {
      status: 400,
    });
  try {
    const details = await getMovieDetails(id);
    const credits = await getMovieCredits(id);
    return new Response(JSON.stringify({ details, credits }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
