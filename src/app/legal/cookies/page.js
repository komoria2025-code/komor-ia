import Link from 'next/link'

export const metadata = {
  title: 'Politique de cookies - Komor-IA',
  description: 'Comment Komor-IA utilise les cookies sur sa plateforme.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Komor-IA
          </Link>
          <span>/</span>
          <span className="text-gray-900">Politique de cookies</span>
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-gray-100">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Politique de cookies
          </h1>
          <p className="text-gray-500 text-sm">
            Dernière mise à jour : juin 2026
          </p>
        </div>

        <div className="space-y-10 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              1. Qu'est-ce qu'un cookie ?
            </h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil
              (ordinateur, téléphone, tablette) lors de votre visite sur un site
              web. Il permet de mémoriser des informations sur votre navigation
              afin d'améliorer votre expérience utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              2. Cookies utilisés par Komor-IA
            </h2>
            <div className="space-y-4">
              {[
                {
                  type: 'Cookies de session (essentiels)',
                  obligatoire: true,
                  desc: 'Nécessaires au fonctionnement de la plateforme. Ils gèrent votre authentification et maintiennent votre session active. Sans ces cookies, vous ne pouvez pas vous connecter.',
                  exemples: ['next-auth.session-token', 'next-auth.csrf-token'],
                  duree: 'Durée de la session',
                },
                {
                  type: 'Cookies de préférences',
                  obligatoire: false,
                  desc: "Mémorisent vos préférences d'affichage (thème, langue, dialecte sélectionné) pour personnaliser votre expérience.",
                  exemples: ['komoria-prefs'],
                  duree: '1 an',
                },
                {
                  type: 'Cookies analytiques',
                  obligatoire: false,
                  desc: "Nous aident à comprendre comment les utilisateurs naviguent sur la plateforme afin d'améliorer nos services. Les données sont anonymisées.",
                  exemples: ['Aucun tiers — analyse interne uniquement'],
                  duree: '12 mois',
                },
              ].map((cookie, i) => (
                <div key={i} className="p-5 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{cookie.type}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        cookie.obligatoire
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cookie.obligatoire ? 'Obligatoire' : 'Optionnel'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{cookie.desc}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Exemples : {cookie.exemples.join(', ')}</span>
                    <span>Durée : {cookie.duree}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              3. Cookies tiers
            </h2>
            <p className="mb-4">
              Komor-IA utilise des services tiers qui peuvent déposer leurs
              propres cookies :
            </p>
            <div className="space-y-3">
              {[
                {
                  service: 'Google OAuth',
                  usage: 'Authentification via compte Google',
                  politique: 'https://policies.google.com/privacy',
                },
                {
                  service: 'Cloudinary',
                  usage: 'Stockage et diffusion des fichiers audio et images',
                  politique: 'https://cloudinary.com/privacy',
                },
              ].map((tiers, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tiers.service}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tiers.usage}
                    </p>
                  </div>
                  <a
                    href={tiers.politique}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 flex-shrink-0 ml-4"
                  >
                    Politique
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              4. Gérer vos cookies
            </h2>
            <p className="mb-4">
              Vous pouvez contrôler et supprimer les cookies via les paramètres
              de votre navigateur :
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  name: 'Chrome',
                  url: 'https://support.google.com/chrome/answer/95647',
                },
                {
                  name: 'Firefox',
                  url: 'https://support.mozilla.org/fr/kb/cookies',
                },
                {
                  name: 'Safari',
                  url: 'https://support.apple.com/fr-fr/HT201265',
                },
                {
                  name: 'Edge',
                  url: 'https://support.microsoft.com/fr-fr/microsoft-edge',
                },
                {
                  name: 'Opera',
                  url: 'https://help.opera.com/en/latest/web-preferences/',
                },
              ].map((nav, i) => (
                <a
                  key={i}
                  href={nav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  {nav.name}
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ⚠️ La désactivation des cookies essentiels empêchera votre
              connexion à la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              5. Pas de publicité
            </h2>
            <p>
              Komor-IA n'utilise{' '}
              <strong className="text-gray-900">
                aucun cookie publicitaire ou de tracking marketing
              </strong>
              . Nous ne revendons pas vos données de navigation et nous
              n'utilisons pas de régies publicitaires tierces.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              6. Contact
            </h2>
            <p>
              Pour toute question relative à notre politique de cookies :{' '}
              <a
                href="mailto:komor.ia2025@gmail.com"
                className="text-gray-900 underline underline-offset-2"
              >
                komor.ia2025@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-6 text-sm text-gray-400">
          <Link
            href="/legal/privacy"
            className="hover:text-gray-600 transition-colors"
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/legal/terms"
            className="hover:text-gray-600 transition-colors"
          >
            Conditions d'utilisation
          </Link>
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
