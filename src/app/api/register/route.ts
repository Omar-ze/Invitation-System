import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/register — register via invitation code
export async function POST(request: NextRequest) {
  try {
    const { code, fullName, email, password } = await request.json();

    if (!code || !fullName || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Validate the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: { partner: { select: { fullName: true } } },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Lien d'invitation invalide" },
        { status: 400 }
      );
    }

    if (invitation.status === "REVOKED") {
      return NextResponse.json(
        { error: "Ce lien d'invitation a été révoqué" },
        { status: 400 }
      );
    }

    if (invitation.status === "USED") {
      return NextResponse.json(
        { error: "Ce lien d'invitation a déjà été utilisé" },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Cette adresse email est déjà utilisée" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and mark invitation as used in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          fullName,
          password: hashedPassword,
          role: "USER",
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "USED",
          registeredUserId: newUser.id,
        },
      });

      return newUser;
    });

    return NextResponse.json(
      { success: true, message: "Compte créé avec succès" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
