import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "./lib/session";

const publicRoutes = ["/login", "/register"];
const partnerRoutes = ["/partner"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  const isLoggedIn = session.isLoggedIn === true;

  // Allow public registration routes (/register/[code])
  if (pathname.startsWith("/register")) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(session.role === "PARTNER" ? "/partner" : "/dashboard", request.url)
      );
    }
    return response;
  }

  // Login page — redirect if already logged in
  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(session.role === "PARTNER" ? "/partner" : "/dashboard", request.url)
      );
    }
    return response;
  }

  // Protected routes — redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Partner-only routes
  if (partnerRoutes.some((r) => pathname.startsWith(r))) {
    if (session.role !== "PARTNER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Prevent regular users from accessing partner routes
  if (pathname === "/dashboard" && session.role === "PARTNER") {
    return NextResponse.redirect(new URL("/partner", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
