import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialité - Komor-IA',
  description:
    'Comment Komor-IA collecte, utilise et protège vos données personnelles.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Komor-IA
          </Link>
          <span>/</span>
          <span className="text-gray-900">Politique de confidentialité</span>
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-gray-100">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-gray-500 text-sm">
            Dernière mise à jour : juin 2026
          </p>
        </div>

        {/* Contenu */}
        <div className="prose-legal">
          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              1. Responsable du traitement
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Komor-IA (SARL), est responsable du traitement de vos données
              personnelles collectées via la plateforme komor-ia.com.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Contact :{' '}
              <a
                href="mailto:komor.ia2025@gmail.com"
                className="text-gray-900 underline underline-offset-2"
              >
                komor.ia2025@gmail.com
              </a>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              2. Données collectées
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Dans le cadre de l'utilisation de nos services, nous collectons
              les données suivantes :
            </p>
            <div className="space-y-3">
              {[
                {
                  titre: "Données d'identification",
                  desc: 'Nom, adresse email, mot de passe (chiffré), photo de profil (si connexion Google).',
                },
                {
                  titre: 'Données de contribution — Traduction',
                  desc: 'Textes traduits, dialecte sélectionné, temps passé, progression, notes.',
                },
                {
                  titre: 'Données de contribution — Vocal',
                  desc: "Enregistrements audio, durée, dialecte, et métadonnées optionnelles (genre, tranche d'âge, île d'origine, zone géographique, statut de locuteur natif).",
                },
                {
                  titre: 'Données de navigation',
                  desc: "Clés API générées, logs d'utilisation (endpoints appelés, temps de réponse, nombre de tokens).",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.titre}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              3. Finalités du traitement
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Vos données sont utilisées pour :
            </p>
            <ul className="space-y-2 text-gray-600">
              {[
                'Gérer votre compte et authentifier votre identité',
                "Constituer des corpus linguistiques en shikomori pour l'entraînement de modèles d'IA",
                'Analyser et améliorer la qualité de nos services',
                'Vous envoyer des notifications liées à votre activité (validation de contributions)',
                'Assurer la sécurité de la plateforme',
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              4. Données vocales et anonymisation
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Les métadonnées associées à vos enregistrements vocaux (genre,
              tranche d'âge, île, zone géographique) sont{' '}
              <strong className="text-gray-900">
                entièrement facultatives
              </strong>{' '}
              et sont collectées uniquement pour améliorer la diversité de notre
              corpus audio.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Ces données sont dissociées de votre identité dans notre corpus
              final et ne sont jamais utilisées à des fins de profilage
              commercial.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              5. Conservation des données
            </h2>
            <div className="space-y-2 text-gray-600">
              {[
                {
                  type: 'Données de compte',
                  duree: '3 ans après la dernière activité',
                },
                {
                  type: 'Contributions textuelles',
                  duree: 'Durée indéterminée (corpus linguistique)',
                },
                {
                  type: 'Enregistrements audio validés',
                  duree: 'Durée indéterminée (corpus audio)',
                },
                {
                  type: 'Enregistrements audio rejetés',
                  duree: 'Supprimés immédiatement après rejet',
                },
                { type: "Logs d'utilisation API", duree: '12 mois' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-gray-100"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {item.type}
                  </span>
                  <span className="text-sm text-gray-500">{item.duree}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              6. Partage des données
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Komor-IA ne vend jamais vos données personnelles. Elles peuvent
              être partagées uniquement avec :
            </p>
            <ul className="space-y-2 text-gray-600 mt-3">
              {[
                'Nos prestataires techniques (hébergement : Vercel, base de données : Aiven, stockage médias : Cloudinary)',
                "Les autorités compétentes en cas d'obligation légale",
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              7. Vos droits
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Vous disposez des droits suivants concernant vos données
              personnelles :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  droit: 'Accès',
                  desc: 'Consulter les données que nous détenons sur vous',
                },
                {
                  droit: 'Rectification',
                  desc: 'Corriger des données inexactes',
                },
                {
                  droit: 'Suppression',
                  desc: 'Demander la suppression de votre compte et données',
                },
                {
                  droit: 'Portabilité',
                  desc: 'Recevoir vos données dans un format lisible',
                },
                {
                  droit: 'Opposition',
                  desc: 'Vous opposer à certains traitements',
                },
                {
                  droit: 'Limitation',
                  desc: 'Limiter le traitement de vos données',
                },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {item.droit}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Pour exercer vos droits, contactez-nous à{' '}
              <a
                href="mailto:komor.ia2025@gmail.com"
                className="text-gray-900 underline underline-offset-2"
              >
                komor.ia2025@gmail.com
              </a>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              8. Sécurité
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles
              appropriées pour protéger vos données : chiffrement des mots de
              passe, connexions HTTPS, accès restreints aux bases de données, et
              sauvegardes régulières.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              9. Modifications
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Cette politique peut être mise à jour. Toute modification
              significative sera notifiée par email ou via une notification sur
              la plateforme.
            </p>
          </section>
        </div>

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-6 text-sm text-gray-400">
          <Link
            href="/legal/terms"
            className="hover:text-gray-600 transition-colors"
          >
            Conditions d'utilisation
          </Link>
          <Link
            href="/legal/cookies"
            className="hover:text-gray-600 transition-colors"
          >
            Politique de cookies
          </Link>
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
