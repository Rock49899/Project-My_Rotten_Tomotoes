import { getCurrentUser, requireAdmin } from "../../lib/authMiddleware";
import { redirect } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard - Tomato Reviews",
  description: "Panneau d'administration",
};

export default async function AdminLayout({ children }) {
  // Vérifier les droits admin
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
