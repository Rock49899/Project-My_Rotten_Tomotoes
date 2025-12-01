const TMDB_BASE = "https://api.themoviedb.org/3";

const API_KEY = process.env.TMDB_API_KEY;
const AUTH_TOKEN =
  process.env.TMDB_AUTHORIZATION 

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`TMDB error ${res.status}: ${txt}`);
  }
  return res.json();
}

function buildOpts() {
  const apiKeyLooksLikeJwt =
    typeof API_KEY === "string" && API_KEY.startsWith("eyJ");
  if (API_KEY && apiKeyLooksLikeJwt)
    return {
      headers: { Authorization: `Bearer ${API_KEY}` },
      useQueryApiKey: false,
    };
  if (API_KEY) return { useQueryApiKey: true };
  if (AUTH_TOKEN)
    return {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      useQueryApiKey: false,
    };
  return null;
}

export async function searchMovies(query, page = 1) {
  const opts = buildOpts();
  if (opts === null)
    throw new Error("TMDB_API_KEY or TMDB_AUTHORIZATION not set");
  let url = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(
    query
  )}&page=${page}`;

  if (API_KEY && opts.useQueryApiKey) url += `&api_key=${API_KEY}`;
  const fetchOpts = Object.assign({}, opts);
  delete fetchOpts.useQueryApiKey;
  return fetchJson(url, fetchOpts);
}

export async function getMovieDetails(id) {
  const opts = buildOpts();
  if (opts === null)
    throw new Error("TMDB_API_KEY or TMDB_AUTHORIZATION not set");
  let url = `${TMDB_BASE}/movie/${id}`;
  if (API_KEY && opts.useQueryApiKey) url += `?api_key=${API_KEY}`;
  const fetchOpts = Object.assign({}, opts);
  delete fetchOpts.useQueryApiKey;
  return fetchJson(url, fetchOpts);
}

export async function getMovieCredits(id) {
  const opts = buildOpts();
  if (opts === null)
    throw new Error("TMDB_API_KEY or TMDB_AUTHORIZATION not set");
  let url = `${TMDB_BASE}/movie/${id}/credits`;
  if (API_KEY && opts.useQueryApiKey) url += `?api_key=${API_KEY}`;
  const fetchOpts = Object.assign({}, opts);
  delete fetchOpts.useQueryApiKey;
  return fetchJson(url, fetchOpts);
}

export async function getPopularMovies(page = 1) {
  const opts = buildOpts();
  if (opts === null)
    throw new Error("TMDB_API_KEY or TMDB_AUTHORIZATION not set");
  let url = `${TMDB_BASE}/movie/popular?page=${page}`;
  if (API_KEY && opts.useQueryApiKey) url += `&api_key=${API_KEY}`;
  const fetchOpts = Object.assign({}, opts);
  delete fetchOpts.useQueryApiKey;
  return fetchJson(url, fetchOpts);
}

export function getImageUrl(path, size = "w500") {
  if (!path) return null;
  if (typeof path !== "string") return null;

  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const clean = path.startsWith("/") ? path : `/${path}`;
  return `https://image.tmdb.org/t/p/${size}${clean}`;
}
