"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface InvitationInfo {
  code: string;
  status: string;
  partnerName: string;
}

export default function RegisterPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();

  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [infoError, setInfoError] = useState("");
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch(`/api/invitations/${code}/info`);
        const data = await res.json();
        if (!res.ok) {
          setInfoError(data.error || "Invitation introuvable");
        } else {
          setInfo(data);
          if (data.status !== "ACTIVE") {
            setInfoError(
              data.status === "USED"
                ? "Ce lien d'invitation a déjà été utilisé."
                : "Ce lien d'invitation a été révoqué."
            );
          }
        }
      } catch {
        setInfoError("Impossible de vérifier l'invitation.");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, fullName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Erreur réseau, veuillez réessayer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-500 text-sm animate-pulse">Vérification de l&apos;invitation…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Créer un compte</h1>
          {info && info.status === "ACTIVE" && (
            <p className="mt-2 text-gray-500">
              Invité par <span className="font-semibold text-indigo-600">{info.partnerName}</span>
            </p>
          )}
        </div>

        <div className="card">
          {infoError && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {infoError}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              Compte créé avec succès ! Redirection vers la connexion…
            </div>
          )}

          {!infoError && !success && (
            <>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="label">Nom complet</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="Jean Dupont"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="label">Adresse email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="vous@exemple.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">Mot de passe</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="Min. 6 caractères"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? "Création en cours..." : "Créer mon compte"}
                </button>
              </form>
            </>
          )}

          <div className="mt-5 text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              J&apos;ai déjà un compte — Se connecter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
