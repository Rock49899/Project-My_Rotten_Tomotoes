import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

export async function requireAuthPage() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentification requise");
  }
  return user;
}

export async function requireAdminPage() {
  const user = await requireAuthPage();
  if (user.role !== "ADMIN") {
    throw new Error("Droits administrateur requis");
  }
  return user;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json({ message: "Non authentifié" }, { status: 401 }),
    };
  }

  return { session };
}

export async function requireAdmin() {
  const { session, error } = await requireAuth();

  if (error) return { error };

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { message: "Accès refusé - Admin uniquement" },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function checkOwnership(userId) {
  const { session, error } = await requireAuth();

  if (error) return { error };

  const isOwner = session.user.id === userId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return {
      error: NextResponse.json(
        {
          message:
            "Accès refusé - Vous ne pouvez pas accéder à cette ressource",
        },
        { status: 403 }
      ),
    };
  }

  return { session, isAdmin, isOwner };
}

export async function requireConfirmedEmail() {
  const { session, error } = await requireAuth();

  if (error) return { error };

  if (!session.user.isConfirmed) {
    return {
      error: NextResponse.json(
        {
          message: "Veuillez confirmer votre email pour effectuer cette action",
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}
