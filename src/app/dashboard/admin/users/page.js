'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Filter,
  Download,
  Coins,
  X,
  Eye,
  Activity,
} from 'lucide-react'

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [pointsUser, setPointsUser] = useState(null)
  const [pointsOperation, setPointsOperation] = useState('add')
  const [pointsForm, setPointsForm] = useState({ points: '', description: '', adminNote: '' })
  const [savingPoints, setSavingPoints] = useState(false)
  const [toast, setToast] = useState(null)
  const [detailsUser, setDetailsUser] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const showToast = (message, type = 'error') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 5000)
  }

  useEffect(() => {
    fetchUsers()
  }, [filterRole])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (filterRole !== 'all') params.append('role', filterRole)

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId))
        alert('Utilisateur supprimé avec succès')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        )
        alert('Rôle mis à jour avec succès')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleAddExternalPoints = async (event) => {
    event.preventDefault()
    setSavingPoints(true)

    try {
      const response = await fetch(
        `/api/admin/users/${pointsUser.id}/external-points`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...pointsForm, operation: pointsOperation }),
        },
      )
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Erreur serveur')

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === pointsUser.id
            ? {
                ...user,
                userGamification: {
                  totalPoints: data.result.totalPoints,
                },
              }
            : user,
        ),
      )
      setPointsUser(null)
      setPointsForm({ points: '', description: '', adminNote: '' })
      showToast(
        pointsOperation === 'remove'
          ? 'Points externes retirés avec succès'
          : 'Points externes ajoutés avec succès',
        'success',
      )
    } catch (error) {
      showToast(error.message || 'Impossible de modifier les points externes')
    } finally {
      setSavingPoints(false)
    }
  }

  const handleViewDetails = async (user) => {
    setDetailsLoading(true)
    setDetailsUser({ ...user, loading: true })
    try {
      const response = await fetch(`/api/admin/users/${user.id}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Impossible de charger les détails')
      setDetailsUser(data.user)
    } catch (error) {
      setDetailsUser(null)
      showToast(error.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-700',
      developer: 'bg-purple-100 text-purple-700',
      translator: 'bg-blue-100 text-blue-700',
      journaliste: 'bg-green-100 text-green-700',
      linguiste: 'bg-indigo-100 text-indigo-700',
      partner: 'bg-yellow-100 text-yellow-700',
      user: 'bg-gray-100 text-gray-700',
    }
    return badges[role] || badges.user
  }

  // const getRoleLabel = (role) => {
  //   const labels = {
  //     admin: 'Administrateur',
  //     developer: 'Développeur',
  //     translator: 'Traducteur',
  //     journaliste: 'Journaliste',
  //     user: 'Utilisateur',
  //   }
  //   return labels[role] || role
  // }
  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      developer: 'Développeur',
      translator: 'Traducteur',
      journaliste: 'Journaliste',
      linguiste: 'Linguiste',
      partner: 'Partenaire',
      user: 'Utilisateur',
    }
    return labels[role] || role
  }

  return (
    <div>
      {toast && (
        <div
          role="alert"
          className={`fixed right-4 top-4 z-[60] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <span className="font-semibold">{toast.type === 'success' ? 'Succès' : 'Action impossible'}</span>
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
            aria-label="Fermer la notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredUsers.length} utilisateur(s) trouvé(s)
          </p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Inviter un utilisateur</span>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="developer">Développeurs</option>
            <option value="translator">Traducteurs</option>
            <option value="journaliste">Journalistes</option>
            <option value="user">Utilisateurs</option>
            <option value="linguiste">Linguiste</option>
            <option value="partner">Partenaires</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <User className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'Sans nom'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user.id, e.target.value)
                        }
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadge(
                          user.role,
                        )}`}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="developer">Développeur</option>
                        <option value="translator">Traducteur</option>
                        <option value="journaliste">Journaliste</option>
                        <option value="linguiste">Linguiste</option>
                        <option value="partner">Partenaire</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                      {user.userGamification?.totalPoints || 0} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir les détails et l'utilisation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setPointsUser(user); setPointsOperation('add') }}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Ajouter des points externes"
                        >
                          <Coins className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pointsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleAddExternalPoints}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {pointsOperation === 'remove' ? 'Corriger des points externes' : 'Ajouter une contribution externe'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {pointsUser.name || pointsUser.email} ·{' '}
                  {pointsUser.userGamification?.totalPoints || 0} points actuels
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPointsUser(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {pointsOperation === 'remove' ? 'Points à retirer' : 'Points à ajouter'}
                <div className="mt-1 flex gap-2">
                <button type="button" onClick={() => setPointsOperation('add')} className={`rounded-lg border px-3 py-2 text-sm ${pointsOperation === 'add' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 text-gray-600'}`}>Ajouter</button>
                <button type="button" onClick={() => setPointsOperation('remove')} className={`rounded-lg border px-3 py-2 text-sm ${pointsOperation === 'remove' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-300 text-gray-600'}`}>Retirer</button>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  required
                  value={pointsForm.points}
                  onChange={(event) =>
                    setPointsForm({ ...pointsForm, points: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description obligatoire
                <input
                  type="text"
                  required
                  value={pointsForm.description}
                  onChange={(event) =>
                    setPointsForm({ ...pointsForm, description: event.target.value })
                  }
                  placeholder="Ex. Traduction de 100 phrases"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Note interne
                <textarea
                  value={pointsForm.adminNote}
                  onChange={(event) =>
                    setPointsForm({ ...pointsForm, adminNote: event.target.value })
                  }
                  placeholder="Détails utiles pour l’équipe"
                  rows="3"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPointsUser(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={savingPoints}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {savingPoints ? 'Enregistrement...' : pointsOperation === 'remove' ? 'Retirer les points' : 'Ajouter les points'}
              </button>
            </div>
          </form>
        </div>
      )}

      {detailsUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-8 w-full max-w-5xl rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Détails utilisateur</h2>
                <p className="mt-1 text-sm text-gray-500">{detailsUser.name || 'Sans nom'} · {detailsUser.email}</p>
              </div>
              <button type="button" onClick={() => setDetailsUser(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            {detailsLoading ? (
              <div className="p-12 text-center text-gray-500">Chargement des informations...</div>
            ) : (
              <div className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['Requêtes', detailsUser.usageSummary.requests],
                    ['Tokens', detailsUser.usageSummary.tokens.toLocaleString('fr-FR')],
                    ['Coût estimé', `${detailsUser.usageSummary.cost.toFixed(4)} €`],
                    ['Clés API', detailsUser._count.apiKeys],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
                      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900"><Activity className="h-4 w-4" /> Utilisation par modèle</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Modèle</th><th className="px-4 py-3 text-right font-medium text-gray-500">Requêtes</th><th className="px-4 py-3 text-right font-medium text-gray-500">Tokens</th></tr></thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {detailsUser.usageSummary.byModel.map((model) => <tr key={model.slug || model.name}><td className="px-4 py-3 text-gray-900">{model.name}</td><td className="px-4 py-3 text-right">{model.requests}</td><td className="px-4 py-3 text-right">{model.tokens.toLocaleString('fr-FR')}</td></tr>)}
                          {!detailsUser.usageSummary.byModel.length && <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-500">Aucune utilisation enregistrée.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <h3 className="mb-3 font-semibold text-gray-900">Informations du compte</h3>
                    <p><span className="text-gray-500">Rôle :</span> {getRoleLabel(detailsUser.role)}</p>
                    <p><span className="text-gray-500">Inscription :</span> {new Date(detailsUser.createdAt).toLocaleString('fr-FR')}</p>
                    <p><span className="text-gray-500">Email vérifié :</span> {detailsUser.emailVerified ? 'Oui' : 'Non'}</p>
                    <p><span className="text-gray-500">Traductions :</span> {detailsUser._count.translations}</p>
                    {detailsUser.profil?.location && <p><span className="text-gray-500">Localisation :</span> {detailsUser.profil.location}</p>}
                    {detailsUser.profil?.website && <p><span className="text-gray-500">Site web :</span> {detailsUser.profil.website}</p>}
                    {detailsUser.profil?.bio && <p><span className="text-gray-500">Bio :</span> {detailsUser.profil.bio}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">Dernières requêtes</h3>
                  <div className="max-h-64 overflow-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="sticky top-0 bg-gray-50"><tr><th className="px-4 py-3 text-left font-medium text-gray-500">Date</th><th className="px-4 py-3 text-left font-medium text-gray-500">Modèle</th><th className="px-4 py-3 text-left font-medium text-gray-500">Endpoint</th><th className="px-4 py-3 text-right font-medium text-gray-500">Statut</th></tr></thead><tbody className="divide-y divide-gray-200">{detailsUser.usageLogs.map((log) => <tr key={log.id}><td className="whitespace-nowrap px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString('fr-FR')}</td><td className="px-4 py-3">{log.displayModelName || log.modele?.name || 'Inconnu'}</td><td className="max-w-xs truncate px-4 py-3">{log.endpoint}</td><td className={`px-4 py-3 text-right font-medium ${log.statusCode >= 400 ? 'text-red-600' : 'text-green-600'}`}>{log.statusCode}</td></tr>)}</tbody></table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
