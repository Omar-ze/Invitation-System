import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ isLoggedIn: false });
  }
  return NextResponse.json({
    isLoggedIn: true,
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
  });
}
