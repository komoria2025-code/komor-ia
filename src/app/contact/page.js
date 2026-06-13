import { Mail, Phone, MapPin, Facebook, Clock } from 'lucide-react'

export default function page() {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'komor.ia2025@gmail.com',
      href: 'mailto:komor.ia2025@gmail.com',
      description: 'Écrivez-nous à tout moment',
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+212 774 329 751',
      href: 'tel:+212774329751',
      description: 'Disponible les jours ouvrés',
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Oujda, Maroc',
      href: null,
      description: 'Notre siège social',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: 'Komor-IA',
      href: 'https://www.facebook.com/profile.php?id=61578497709510',
      description: 'Suivez-nous sur Facebook',
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: 'Lun - Ven, 8h - 18h',
      href: null,
      description: 'Heure locale des Comores (EAT)',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Contactez-nous</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions.
            N'hésitez pas à nous contacter via l'un de nos canaux.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon

            const cardInner = (
              <div
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col items-center text-center transition-all duration-200 h-full ${info.href ? 'hover:shadow-lg hover:border-blue-300' : ''}`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200 ${info.href ? 'bg-blue-100 group-hover:bg-blue-600' : 'bg-gray-100'}`}
                >
                  <Icon
                    className={`w-8 h-8 transition-colors duration-200 ${info.href ? 'text-blue-600 group-hover:text-white' : 'text-gray-500'}`}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {info.label}
                </p>
                <p className="text-lg font-bold text-gray-900 mb-2">
                  {info.value}
                </p>
                <p className="text-sm text-gray-500">{info.description}</p>
              </div>
            )

            if (info.href) {
              return (
                <a
                  key={index}
                  href={info.href}
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    info.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  className="group"
                >
                  {cardInner}
                </a>
              )
            }

            return <div key={index}>{cardInner}</div>
          })}
        </div>

        {/* Délai de réponse */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-3">
            ⏱️ Délai de réponse
          </h3>
          <p className="text-blue-800">
            Nous répondons généralement sous <strong>24 à 48 heures</strong> les
            jours ouvrés. Pour les urgences, privilégiez le téléphone.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Une question technique ?</h2>
          <p className="text-gray-300 mb-8">
            Consultez notre documentation pour des réponses rapides
          </p>
          <a
            href="/docs"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Voir la documentation
          </a>
        </div>
      </section>
    </div>
  )
}
