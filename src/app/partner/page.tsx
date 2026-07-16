import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import InvitationManager from "@/components/InvitationManager";
import LogoutButton from "@/components/LogoutButton";

export default async function PartnerPage() {
  const session = await getSession();

  if (!session.isLoggedIn) redirect("/login");
  if (session.role !== "PARTNER") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Espace Partenaire</h1>
              <p className="text-xs text-gray-400">{session.fullName}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des invitations</h2>
          <p className="mt-1 text-gray-500">
            Générez des liens d&apos;invitation uniques et suivez les inscriptions.
          </p>
        </div>

        <InvitationManager />
      </main>
    </div>
  );
}
