'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Save,
  Check,
  AlertCircle,
  Zap,
  Shield,
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  // ✅ States à ajouter
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [deletePassword,  setDeletePassword]  = useState('')
const [deleteLoading,   setDeleteLoading]   = useState(false)
const [deleteError,     setDeleteError]     = useState('')

// ✅ Composant formulaire mot de passe (dans le composant principal)
const ChangePasswordForm = () => {
  const [form,    setForm]    = useState({ current: '', newPwd: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [err,     setErr]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPwd !== form.confirm) { setErr('Les mots de passe ne correspondent pas'); return }
    if (form.newPwd.length < 8)       { setErr('Minimum 8 caractères'); return }
    setLoading(true); setErr(''); setSuccess('')
    try {
      const res  = await fetch('/api/user/password', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPwd }),
      })
      const data = await res.json()
      if (res.ok) { setSuccess('Mot de passe modifié !'); setForm({ current: '', newPwd: '', confirm: '' }) }
      else setErr(data.message)
    } catch { setErr('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>}
      {err     && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
      {[
        { label: 'Mot de passe actuel',           key: 'current' },
        { label: 'Nouveau mot de passe',           key: 'newPwd' },
        { label: 'Confirmer le nouveau mot de passe', key: 'confirm' },
      ].map(field => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
          <input type={showPwd ? 'text' : 'password'} required value={form[field.key]}
            onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <div className="flex items-center space-x-3">
        <button type="submit" disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium">
          {loading ? 'Modification...' : 'Mettre à jour'}
        </button>
        <label className="flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
          <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} className="rounded" />
          <span>Afficher</span>
        </label>
      </div>
    </form>
  )
}

// ✅ Fonction suppression à ajouter
const handleDeleteAccount = async () => {
  setDeleteLoading(true); setDeleteError('')
  try {
    const res  = await fetch('/api/user/account', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword }),
    })
    const data = await res.json()
    if (res.ok) await signOut({ callbackUrl: '/' })
    else setDeleteError(data.message)
  } catch { setDeleteError('Erreur réseau') }
  finally { setDeleteLoading(false) }
}

  // États séparés pour profil et settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    status: 'private',
  })

  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'fr',
    timezone: 'Africa/Moroni',
    emailNotifications: true,
    usageAlerts: true,
    monthlyReports: true,
    securityAlerts: true,
    dailyRequestLimit: null,
    monthlyBudgetLimit: null,
    quotaWarningThreshold: 80,
    defaultModel: '',
    defaultMaxTokens: 1000,
  })

  const [models, setModels] = useState([])

  useEffect(() => {
    fetchProfile()
    fetchSettings()
    fetchModels()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (response.ok) {
        setProfileData({
          name: data.user?.name || '',
          email: data.user?.email || '',
          bio: data.profil?.bio || '',
          location: data.profil?.location || '',
          website: data.profil?.website || '',
          phone: data.profil?.phone || '',
          status: data.profil?.status || 'private',
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      const data = await response.json()

      if (response.ok && data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()

      if (data.success) {
        setModels(data.models)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSaved(false)

      // Sauvegarder selon l'onglet actif
      if (activeTab === 'profile') {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde du profil')
        }

        // Mettre à jour la session si le nom a changé
        if (profileData.name !== session?.user?.name) {
          await updateSession({
            ...session,
            user: { ...session.user, name: profileData.name },
          })
        }
      } else {
        // Sauvegarder les settings
        const response = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde des paramètres')
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'preferences', label: 'Préférences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'Paramètres API', icon: Zap },
    { id: 'limits', label: 'Limites', icon: Shield },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ville, Pays"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        website: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+269 XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibilité du profil
                  </label>
                  <select
                    value={profileData.status}
                    onChange={(e) =>
                      setProfileData({ ...profileData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="private">Privé</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Préférences générales
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({ ...settings, language: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="sw">Kiswahili</option>
                    <option value="zdj">Shikomori</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thème
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings({ ...settings, theme: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Africa/Moroni">Moroni (GMT+3)</option>
                    <option value="Europe/Paris">Paris (GMT+1)</option>
                    <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notifications
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: 'emailNotifications',
                    label: 'Notifications par email',
                    description: 'Recevoir des mises à jour importantes',
                  },
                  {
                    key: 'usageAlerts',
                    label: "Alertes d'usage",
                    description: 'Alerte quand vous approchez de vos limites',
                  },
                  {
                    key: 'monthlyReports',
                    label: 'Rapports mensuels',
                    description: 'Résumé mensuel de votre utilisation',
                  },
                  {
                    key: 'securityAlerts',
                    label: 'Alertes de sécurité',
                    description: 'Connexions suspectes, changements, etc.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[item.key] ?? true}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Paramètres API par défaut
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle par défaut
                  </label>
                  <select
                    value={settings.defaultModel || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultModel: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun (choisir à chaque requête)</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.slug}>
                        {model.name} - {model.domaine}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max tokens par défaut
                  </label>
                  <input
                    type="number"
                    value={settings.defaultMaxTokens || 1000}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultMaxTokens: parseInt(e.target.value),
                      })
                    }
                    min="100"
                    max="10000"
                    step="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'limits':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Limites et budget
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de requêtes quotidiennes
                  </label>
                  <input
                    type="number"
                    value={settings.dailyRequestLimit || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dailyRequestLimit: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Aucune limite"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget mensuel maximum (€)
                  </label>
                  <input
                    type="number"
                    value={settings.monthlyBudgetLimit || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        monthlyBudgetLimit: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Aucune limite"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil d'alerte (%)
                  </label>
                  <input
                    type="number"
                    value={settings.quotaWarningThreshold || 80}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quotaWarningThreshold: parseInt(e.target.value),
                      })
                    }
                    min="50"
                    max="95"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      // case 'security':
      //   return (
      //     <div className="space-y-6">
      //       <div>
      //         <h3 className="text-lg font-medium text-gray-900 mb-4">
      //           Changer le mot de passe
      //         </h3>
      //         <div className="space-y-4 max-w-md">
      //           <div>
      //             <label className="block text-sm font-medium text-gray-700 mb-2">
      //               Mot de passe actuel
      //             </label>
      //             <input
      //               type="password"
      //               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      //             />
      //           </div>
      //           <div>
      //             <label className="block text-sm font-medium text-gray-700 mb-2">
      //               Nouveau mot de passe
      //             </label>
      //             <input
      //               type="password"
      //               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      //             />
      //           </div>
      //           <div>
      //             <label className="block text-sm font-medium text-gray-700 mb-2">
      //               Confirmer le mot de passe
      //             </label>
      //             <input
      //               type="password"
      //               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      //             />
      //           </div>
      //           <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      //             Mettre à jour
      //           </button>
      //         </div>
      //       </div>
      //     </div>
      //   )
      case 'security':
  return (
    <div className="space-y-8">

      {/* Changer le mot de passe */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
        <ChangePasswordForm />
      </div>

      {/* Zone danger */}
      <div className="border-t border-red-200 pt-8">
        <h3 className="text-lg font-medium text-red-600 mb-4">Zone de danger</h3>
        <div className="p-5 border border-red-200 rounded-xl bg-red-50">
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            La suppression de votre compte effacera définitivement votre profil,
            vos contributions, vos points et tous vos enregistrements.
            Cette action est <strong>irréversible</strong>.
          </p>
          <button onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 border border-red-400 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Confirmer la suppression</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Cette action est irréversible. Entrez votre mot de passe pour confirmer.
            </p>
            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            )}
            <input
              type="password" value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex space-x-3">
              <button onClick={handleDeleteAccount} disabled={deleteLoading || !deletePassword}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError('') }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Plan actuel
              </h3>
              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      Plan Gratuit
                    </h4>
                    <p className="text-gray-600">1000 requêtes / mois</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Actif
                  </span>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Passer au plan Pro
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-gray-900" />
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        </div>
        <p className="text-gray-600">Gérez vos préférences et votre compte</p>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Modifications enregistrées avec succès !
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {renderTabContent()}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
