import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/invitations/[id]/info — get public info about an invitation (for registration page)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { code: id },
    include: {
      partner: { select: { fullName: true } },
    },
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    code: invitation.code,
    status: invitation.status,
    partnerName: invitation.partner.fullName,
  });
}