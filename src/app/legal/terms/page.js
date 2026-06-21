import Link from 'next/link'

export const metadata = {
  title: "Conditions d'utilisation - Komor-IA",
  description: "Conditions générales d'utilisation de la plateforme Komor-IA.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-10">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Komor-IA
          </Link>
          <span>/</span>
          <span className="text-gray-900">Conditions d'utilisation</span>
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-gray-100">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Conditions d'utilisation
          </h1>
          <p className="text-gray-500 text-sm">
            Dernière mise à jour : juin 2026
          </p>
        </div>

        <div className="space-y-10 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              1. Présentation
            </h2>
            <p>
              La plateforme Komor-IA (accessible à l'adresse{' '}
              <strong className="text-gray-900">komor-ia.com</strong>) est
              éditée par la SARL Komor-IA, dont le siège est à Moroni, Comores.
              En accédant à la plateforme, vous acceptez les présentes
              conditions sans réserve.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              2. Services proposés
            </h2>
            <p className="mb-3">Komor-IA propose :</p>
            <ul className="space-y-2">
              {[
                "Accès à des modèles d'intelligence artificielle via API",
                'Une plateforme de traduction collaborative français → shikomori',
                'Un module de collecte de données vocales en shikomori',
                "Des outils de gestion de clés API et de suivi d'utilisation",
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              3. Création de compte
            </h2>
            <p>
              L'accès aux fonctionnalités de contribution nécessite la création
              d'un compte. Vous vous engagez à fournir des informations exactes
              et à maintenir la confidentialité de vos identifiants. Komor-IA ne
              saurait être tenue responsable d'une utilisation non autorisée de
              votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              4. Contributions et propriété intellectuelle
            </h2>
            <p className="mb-3">
              En soumettant une traduction ou un enregistrement vocal sur la
              plateforme, vous accordez à Komor-IA une{' '}
              <strong className="text-gray-900">
                licence mondiale, non exclusive, irrévocable et gratuite
              </strong>{' '}
              d'utilisation de cette contribution aux fins suivantes :
            </p>
            <ul className="space-y-2">
              {[
                'Constitution et enrichissement de corpus linguistiques',
                "Entraînement de modèles d'intelligence artificielle",
                'Publication à des fins de recherche scientifique',
                'Amélioration des services Komor-IA',
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Vous garantissez que vos contributions sont originales et ne
              violent aucun droit de tiers. Komor-IA se réserve le droit de
              refuser ou supprimer toute contribution jugée inappropriée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              5. Utilisation de l'API
            </h2>
            <p className="mb-3">
              L'accès à notre API est soumis aux limites de votre plan
              tarifaire. Il est interdit de :
            </p>
            <ul className="space-y-2">
              {[
                'Partager ou revendre vos clés API',
                "Utiliser l'API à des fins illégales ou contraires aux bonnes mœurs",
                'Tenter de contourner les limitations de débit',
                'Utiliser nos modèles pour générer du contenu trompeur ou nuisible',
              ].map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Tout abus entraînera la suspension immédiate du compte sans
              préavis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              6. Disponibilité du service
            </h2>
            <p>
              Komor-IA s'efforce d'assurer une disponibilité maximale de la
              plateforme. Cependant, des interruptions pour maintenance ou force
              majeure peuvent survenir. Komor-IA ne saurait être tenue
              responsable des pertes liées à une indisponibilité temporaire du
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              7. Limitation de responsabilité
            </h2>
            <p>
              Les modèles d'IA de Komor-IA sont fournis "en l'état". Les
              réponses générées peuvent contenir des inexactitudes. Komor-IA
              décline toute responsabilité quant aux décisions prises sur la
              base des résultats produits par ses modèles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              8. Résiliation
            </h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment en nous
              contactant. Komor-IA se réserve le droit de suspendre ou supprimer
              tout compte en cas de violation des présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              9. Droit applicable
            </h2>
            <p>
              Les présentes conditions sont régies par le droit comorien. En cas
              de litige, les parties s'engagent à rechercher une solution
              amiable avant tout recours judiciaire. À défaut, les tribunaux de
              Moroni seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              10. Contact
            </h2>
            <p>
              Pour toute question relative aux présentes conditions :{' '}
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
