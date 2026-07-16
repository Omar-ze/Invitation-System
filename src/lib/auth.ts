import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./session";

export async function requireAuth(role?: "PARTNER") {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return { redirect: "/login" };
  }

  if (role === "PARTNER" && session.role !== "PARTNER") {
    return { redirect: "/dashboard" };
  }

  return { session };
}

export async function requireGuest() {
  const session = await getSession();

  if (session.isLoggedIn) {
    if (session.role === "PARTNER") return { redirect: "/partner" };
    return { redirect: "/dashboard" };
  }

  return { session };
}
