import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.isLoggedIn) redirect("/login");
  if (session.role === "PARTNER") redirect("/partner");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Mon espace</h1>
              <p className="text-xs text-gray-400">Membre</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {session.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bonjour, {session.fullName} !</h2>
              <p className="text-sm text-gray-500">{session.email}</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                Utilisateur
              </span>
            </div>
          </div>

          <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Bienvenue sur la plateforme</p>
                <p className="mt-1 text-sm text-blue-700">
                  Vous avez rejoint la plateforme via une invitation. Votre compte est actif.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
