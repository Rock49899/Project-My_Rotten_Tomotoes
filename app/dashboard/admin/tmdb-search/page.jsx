import TmdbSearchClient from "../../../components/admin/TmdbSearchClient";
import { requireAdmin } from "../../../../lib/authMiddleware";
import { redirect } from "next/navigation"

export default async function Page() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Import films depuis TMDB</h1>
      <div className="bg-white rounded shadow p-4 text-black">
        <TmdbSearchClient />
      </div>
    </main>
  );
}
