import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/invitations/[id] — revoke an invitation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "PARTNER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { id } });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  if (invitation.partnerId !== session.userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  if (invitation.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Seules les invitations actives peuvent être révoquées" },
      { status: 400 }
    );
  }

  const updated = await prisma.invitation.update({
    where: { id },
    data: { status: "REVOKED" },
  });

  return NextResponse.json({ invitation: updated });
}
