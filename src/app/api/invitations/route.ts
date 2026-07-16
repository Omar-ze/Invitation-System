import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/invitations — list partner's invitations with registered users
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "PARTNER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const invitations = await prisma.invitation.findMany({
    where: { partnerId: session.userId },
    include: {
      registeredUser: {
        select: { id: true, fullName: true, email: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invitations });
}

// POST /api/invitations — generate a new invitation link
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "PARTNER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const invitation = await prisma.invitation.create({
    data: { partnerId: session.userId as string },
  });

  return NextResponse.json({ invitation }, { status: 201 });
}
