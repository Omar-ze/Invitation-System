"use client";

import { useState, useEffect, useCallback } from "react";

interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  code: string;
  status: "ACTIVE" | "USED" | "REVOKED";
  createdAt: string;
  registeredUser: RegisteredUser | null;
}

function StatusBadge({ status }: { status: Invitation["status"] }) {
  const cls =
    status === "ACTIVE"
      ? "badge-active"
      : status === "USED"
      ? "badge-used"
      : "badge-revoked";
  const label = status === "ACTIVE" ? "Active" : status === "USED" ? "Utilisée" : "Révoquée";
  return <span className={cls}>{label}</span>;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function InvitationManager() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch {
      setError("Erreur lors du chargement des invitations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/invitations", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création");
      } else {
        setInvitations((prev) => [data.invitation, ...prev]);
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Révoquer cette invitation ? Elle ne pourra plus être utilisée.")) return;
    setRevoking(id);
    setError("");
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la révocation");
      } else {
        setInvitations((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, status: "REVOKED" } : inv))
        );
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setRevoking(null);
    }
  };

  const getInviteUrl = (code: string) => `${window.location.origin}/register/${code}`;

  const handleCopy = (id: string, code: string) => {
    copyToClipboard(getInviteUrl(code));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = {
    total: invitations.length,
    active: invitations.filter((i) => i.status === "ACTIVE").length,
    used: invitations.filter((i) => i.status === "USED").length,
    revoked: invitations.filter((i) => i.status === "REVOKED").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Actives", value: stats.active, color: "text-green-700" },
          { label: "Utilisées", value: stats.used, color: "text-blue-700" },
          { label: "Révoquées", value: stats.revoked, color: "text-red-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Mes invitations</h3>
        <button onClick={handleCreate} disabled={creating} className="btn-primary">
          {creating ? (
            "Création…"
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Générer une invitation
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card text-center text-gray-400 py-12">Chargement…</div>
      ) : invitations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-sm">Aucune invitation générée pour l&apos;instant.</p>
          <p className="text-gray-400 text-xs mt-1">Cliquez sur « Générer une invitation » pour commencer.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lien d&apos;invitation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur inscrit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créée le
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded truncate max-w-[160px]">
                          {inv.code}
                        </code>
                        {inv.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCopy(inv.id, inv.code)}
                            className="text-xs text-blue-600 hover:underline flex-shrink-0"
                            title="Copier le lien"
                          >
                            {copiedId === inv.id ? "✓ Copié" : "Copier"}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3">
                      {inv.registeredUser ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{inv.registeredUser.fullName}</p>
                          <p className="text-xs text-gray-400">{inv.registeredUser.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(inv.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === "ACTIVE" && (
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          disabled={revoking === inv.id}
                          className="btn-danger"
                        >
                          {revoking === inv.id ? "…" : "Révoquer"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
