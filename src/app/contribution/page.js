// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'
// import {
//   UserPlus,
//   Languages,
//   FileText,
//   CheckCircle,
//   ArrowRight,
//   Globe,
//   BookOpen,
//   Users,
//   ChevronRight,
//   X,
//   Download,
//   ZoomIn,
// } from 'lucide-react'

// // ✅ Couleur principale : bleu sombre Komor-IA
// // const BRAND = '#1B3A6B'
// const BRAND = '#0f172a'

// const steps = [
//   {
//     number: '01',
//     icon: Globe,
//     title: 'Accéder à la plateforme',
//     description:
//       'Rendez-vous sur komor-ia.com depuis votre navigateur. La plateforme est accessible depuis tout appareil connecté à internet.',
//     action: { label: 'Accéder à komor-ia.com', href: 'https://komor-ia.com' },
//     image: '/contribution/step1.jpeg',
//     imageAlt: "Page d'accueil de Komor-IA",
//   },
//   {
//     number: '02',
//     icon: UserPlus,
//     title: 'Créer un compte',
//     description:
//       'Inscrivez-vous gratuitement en renseignant votre nom, adresse email et un mot de passe sécurisé. Vous pouvez également vous connecter via votre compte Google.',
//     action: { label: 'Créer un compte', href: 'https://komor-ia.com/signup' },
//     image: '/contribution/step2.jpeg',
//     imageAlt: "Page d'inscription Komor-IA",
//   },
//   {
//     number: '03',
//     icon: FileText,
//     title: 'Choisir un article à traduire',
//     description:
//       'Depuis le tableau de bord, accédez à l\'onglet "Articles & Traduction". Parcourez la liste des articles disponibles, filtrez par catégorie ou statut, puis cliquez sur "Lire →" pour sélectionner un article.',
//     image: '/contribution/step3.jpeg',
//     imageAlt: 'Liste des articles à traduire',
//   },
//   {
//     number: '04',
//     icon: Languages,
//     title: 'Choisir votre dialecte',
//     description:
//       'Avant de commencer, sélectionnez le dialecte comorien dans lequel vous allez traduire : Shingazidja (Grande Comore), Shindzuani (Anjouan), Shimwali (Mohéli) ou Shimaore (Mayotte). Par défaut, le Shingazidja est sélectionné.',
//     image: '/contribution/step4.jpeg',
//     imageAlt: 'Sélection du dialecte de traduction',
//   },
//   {
//     number: '05',
//     icon: BookOpen,
//     title: "Traduire l'article",
//     description:
//       "L'interface est divisée en deux panneaux. À gauche, le texte original en français. À droite, votre zone de saisie. Traduisez le texte progressivement — votre travail est sauvegardé automatiquement toutes les 2 secondes. Une barre de progression indique votre avancement.",
//     image: '/contribution/step5.jpeg',
//     imageAlt: 'Interface de traduction',
//   },
//   {
//     number: '06',
//     icon: CheckCircle,
//     title: 'Soumettre la traduction',
//     description:
//       'Lorsque la traduction est complète (100%), le bouton "Soumettre" devient actif. Cliquez dessus pour envoyer votre traduction. Elle sera ensuite examinée et validée par notre équipe de linguistes.',
//     image: '/contribution/step6.jpeg',
//     imageAlt: 'Soumission de la traduction',
//   },
// ]

// // ✅ Composant Modal image
// function ImageModal({ image, alt, onClose }) {
//   const handleDownload = async () => {
//     try {
//       const res = await fetch(image)
//       const blob = await res.blob()
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = alt.replace(/\s+/g, '-').toLowerCase() + '.png'
//       a.click()
//       URL.revokeObjectURL(url)
//     } catch {
//       window.open(image, '_blank')
//     }
//   }

//   return (
//     <div
//       className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
//       onClick={onClose}
//     >
//       <div
//         className="relative max-w-5xl w-full"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Barre d'actions */}
//         <div className="flex items-center justify-between mb-3">
//           <p className="text-white text-sm font-medium">{alt}</p>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={handleDownload}
//               className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
//             >
//               <Download className="w-4 h-4" />
//               <span>Télécharger</span>
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//         {/* Image */}
//         <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
//           <img
//             src={image}
//             alt={alt}
//             className="w-full h-auto max-h-[80vh] object-contain bg-white"
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

// // ✅ Composant image cliquable
// function ClickableImage({ src, alt, icon: Icon }) {
//   const [open, setOpen] = useState(false)
//   const [hasError, setHasError] = useState(false)

//   return (
//     <>
//       <div
//         onClick={() => !hasError && setOpen(true)}
//         className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 group ${
//           !hasError ? 'cursor-zoom-in' : ''
//         }`}
//       >
//         {!hasError ? (
//           <>
//             <img
//               src={src}
//               alt={alt}
//               className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
//               onError={() => setHasError(true)}
//             />
//             {/* Overlay au survol */}
//             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
//               <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
//                 <ZoomIn className="w-6 h-6 text-gray-800" />
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="w-full h-48 flex flex-col items-center justify-center text-gray-400 p-6">
//             <Icon className="w-10 h-10 mb-2 opacity-30" />
//             <p className="text-sm text-center">{alt}</p>
//           </div>
//         )}
//       </div>

//       {open && (
//         <ImageModal image={src} alt={alt} onClose={() => setOpen(false)} />
//       )}
//     </>
//   )
// }

// export default function ContributionPage() {
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Hero */}
//       <section
//         className="text-white py-20 px-6"
//         style={{ backgroundColor: BRAND }}
//       >
//         <div className="max-w-4xl mx-auto">
//           <div className="flex items-center space-x-2 text-blue-200 text-sm mb-6">
//             <Link href="/" className="hover:text-white transition-colors">
//               Komor-IA
//             </Link>
//             <ChevronRight className="w-4 h-4" />
//             <span className="text-white">Guide de contribution</span>
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
//             Comment contribuer à la traduction ?
//           </h1>
//           <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
//             Komor-IA développe des corpus linguistiques pour les dialectes
//             comoriens. Votre contribution, même modeste, est précieuse pour la
//             préservation et la promotion du shikomori.
//           </p>
//           <div className="mt-8 flex flex-wrap gap-4">
//             <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-3">
//               <Users className="w-5 h-5 text-blue-300" />
//               <span className="text-sm">Ouvert à tous</span>
//             </div>
//             <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-3">
//               <CheckCircle className="w-5 h-5 text-green-400" />
//               <span className="text-sm">Gratuit</span>
//             </div>
//             <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-3">
//               <Globe className="w-5 h-5 text-yellow-300" />
//               <span className="text-sm">4 dialectes supportés</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Navigation rapide */}
//       <section className="bg-gray-50 border-b border-gray-200 py-6 px-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex flex-wrap gap-3">
//             {steps.map((step, i) => (
//               <a
//                 key={i}
//                 href={`#step-${i + 1}`}
//                 className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-700 transition-all"
//               >
//                 <span className="font-mono text-xs text-gray-400">
//                   {step.number}
//                 </span>
//                 <span>{step.title}</span>
//               </a>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Étapes */}
//       <section className="py-16 px-6">
//         <div className="max-w-4xl mx-auto space-y-24">
//           {steps.map((step, index) => {
//             const Icon = step.icon
//             const isEven = index % 2 === 1

//             return (
//               <div key={index} id={`step-${index + 1}`} className="scroll-mt-8">
//                 {/* En-tête étape */}
//                 <div className="flex items-start space-x-4 mb-8">
//                   <div
//                     className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
//                     style={{ backgroundColor: BRAND }}
//                   >
//                     <Icon className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <p className="text-xs font-mono text-gray-400 mb-1">
//                       ÉTAPE {step.number}
//                     </p>
//                     <h2 className="text-2xl font-bold text-gray-900">
//                       {step.title}
//                     </h2>
//                   </div>
//                 </div>

//                 {/* Contenu */}
//                 <div
//                   className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center`}
//                 >
//                   {/* Texte */}
//                   <div className={isEven ? 'lg:order-2' : ''}>
//                     <p className="text-gray-600 leading-relaxed text-base mb-6">
//                       {step.description}
//                     </p>
//                     {step.action && (
//                       <Link
//                         href={step.action.href}
//                         target={
//                           step.action.href.startsWith('http')
//                             ? '_blank'
//                             : undefined
//                         }
//                         className="inline-flex items-center space-x-2 px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90"
//                         style={{ backgroundColor: BRAND }}
//                       >
//                         <span>{step.action.label}</span>
//                         <ArrowRight className="w-4 h-4" />
//                       </Link>
//                     )}
//                   </div>

//                   {/* Image cliquable */}
//                   <div className={isEven ? 'lg:order-1' : ''}>
//                     <ClickableImage
//                       src={step.image}
//                       alt={step.imageAlt}
//                       icon={Icon}
//                     />
//                     <p className="text-xs text-gray-400 mt-2 text-center">
//                       Cliquez sur l'image pour l'agrandir
//                     </p>
//                   </div>
//                 </div>

//                 {/* Séparateur */}
//                 {index < steps.length - 1 && (
//                   <div className="mt-16 flex items-center space-x-4">
//                     <div className="flex-1 border-t border-gray-100"></div>
//                     <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center">
//                       <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
//                     </div>
//                     <div className="flex-1 border-t border-gray-100"></div>
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       </section>

//       {/* Dialectes */}
//       <section className="bg-gray-50 border-t border-b border-gray-200 py-16 px-6">
//         <div className="max-w-4xl mx-auto">
//           <h2 className="text-2xl font-bold text-gray-900 mb-3">
//             Les 4 dialectes comoriens
//           </h2>
//           <p className="text-gray-600 mb-8">
//             Komor-IA collecte des traductions dans les quatre variantes du
//             shikomori. Choisissez celui que vous maîtrisez le mieux.
//           </p>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {[
//               {
//                 name: 'Shingazidja',
//                 region: 'Grande Comore',
//                 flag: '🇰🇲',
//                 default: true,
//               },
//               {
//                 name: 'Shindzuani',
//                 region: 'Anjouan',
//                 flag: '🇰🇲',
//                 default: false,
//               },
//               {
//                 name: 'Shimwali',
//                 region: 'Mohéli',
//                 flag: '🇰🇲',
//                 default: false,
//               },
//               {
//                 name: 'Shimaore',
//                 region: 'Mayotte',
//                 flag: '🇰🇲',
//                 default: false,
//               },
//             ].map((d, i) => (
//               <div
//                 key={i}
//                 className={`bg-white rounded-xl p-5 border ${
//                   d.default ? 'ring-2' : 'border-gray-200'
//                 }`}
//                 style={
//                   d.default
//                     ? { borderColor: BRAND, '--tw-ring-color': BRAND }
//                     : {}
//                 }
//               >
//                 <span className="text-2xl mb-3 block">{d.flag}</span>
//                 <h3 className="font-semibold text-gray-900 mb-1">{d.name}</h3>
//                 <p className="text-sm text-gray-500">{d.region}</p>
//                 {d.default && (
//                   <span
//                     className="inline-block mt-3 text-xs text-white px-2 py-0.5 rounded"
//                     style={{ backgroundColor: BRAND }}
//                   >
//                     Par défaut
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ */}
//       <section className="py-16 px-6">
//         <div className="max-w-4xl mx-auto">
//           <h2 className="text-2xl font-bold text-gray-900 mb-8">
//             Questions fréquentes
//           </h2>
//           <div className="space-y-6">
//             {[
//               {
//                 q: 'Faut-il être linguiste pour contribuer ?',
//                 a: 'Non. Toute personne maîtrisant le shikomori peut contribuer. Les traductions sont ensuite vérifiées par notre équipe de linguistes avant validation.',
//               },
//               {
//                 q: 'Ma traduction est-elle sauvegardée automatiquement ?',
//                 a: 'Oui. La plateforme sauvegarde automatiquement votre progression toutes les 2 secondes. Vous pouvez reprendre là où vous vous êtes arrêté à tout moment.',
//               },
//               {
//                 q: 'Puis-je contribuer depuis un téléphone ?',
//                 a: 'Oui. La plateforme est accessible depuis tout navigateur, sur ordinateur, tablette ou smartphone.',
//               },
//               {
//                 q: 'Que se passe-t-il après la soumission ?',
//                 a: "Votre traduction est transmise à notre équipe de linguistes qui la vérifie et la valide. Elle intègre ensuite notre corpus linguistique utilisé pour l'entraînement de modèles d'IA.",
//               },
//             ].map((faq, i) => (
//               <div key={i} className="border-b border-gray-100 pb-6">
//                 <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
//                 <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Final */}
//       <section
//         className="text-white py-16 px-6"
//         style={{ backgroundColor: BRAND }}
//       >
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl font-bold mb-4">Prêt à contribuer ?</h2>
//           <p className="text-blue-100 mb-8 max-w-xl mx-auto">
//             Chaque traduction compte. Rejoignez la communauté Komor-IA et
//             participez à la construction de l'IA pour les langues comoriennes.
//           </p>
//           <div className="flex flex-wrap justify-center gap-4">
//             <Link
//               href="/signup"
//               className="px-8 py-3 bg-white font-semibold rounded-lg hover:bg-gray-100 transition-colors"
//               style={{ color: BRAND }}
//             >
//               Créer un compte
//             </Link>
//             <Link
//               href="/login"
//               className="px-8 py-3 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
//             >
//               Se connecter
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserPlus,
  Languages,
  FileText,
  CheckCircle,
  ArrowRight,
  Globe,
  BookOpen,
  Users,
  ChevronRight,
  X,
  Download,
  ZoomIn,
  Mic,
  Play,
  Send,
  RefreshCw,
} from 'lucide-react'

const BRAND = '#0f172a'

// ─── ÉTAPES TRADUCTION ────────────────────────────────
const stepsTraduction = [
  {
    number: '01',
    icon: Globe,
    title: 'Accéder à la plateforme',
    description:
      'Rendez-vous sur komor-ia.com depuis votre navigateur. La plateforme est accessible depuis tout appareil connecté à internet.',
    action: { label: 'Accéder à komor-ia.com', href: 'https://komor-ia.com' },
    image: '/contribution/step1.jpeg',
    imageAlt: "Page d'accueil de Komor-IA",
  },
  {
    number: '02',
    icon: UserPlus,
    title: 'Créer un compte',
    description:
      'Inscrivez-vous gratuitement en renseignant votre nom, adresse email et un mot de passe sécurisé. Vous pouvez également vous connecter via votre compte Google.',
    action: { label: 'Créer un compte', href: 'https://komor-ia.com/signup' },
    image: '/contribution/step2.jpeg',
    imageAlt: "Page d'inscription Komor-IA",
  },
  {
    number: '03',
    icon: FileText,
    title: 'Choisir un article à traduire',
    description:
      'Depuis le tableau de bord, accédez à l\'onglet "Articles & Traduction". Parcourez la liste des articles disponibles, filtrez par catégorie ou statut, puis cliquez sur "Lire →" pour sélectionner un article.',
    image: '/contribution/step3.jpeg',
    imageAlt: 'Liste des articles à traduire',
  },
  {
    number: '04',
    icon: Languages,
    title: 'Choisir votre dialecte',
    description:
      'Avant de commencer, sélectionnez le dialecte comorien dans lequel vous allez traduire : Shingazidja (Grande Comore), Shindzuani (Anjouan), Shimwali (Mohéli) ou Shimaore (Mayotte). Par défaut, le Shingazidja est sélectionné.',
    image: '/contribution/step4.jpeg',
    imageAlt: 'Sélection du dialecte de traduction',
  },
  {
    number: '05',
    icon: BookOpen,
    title: "Traduire l'article",
    description:
      "L'interface est divisée en deux panneaux. À gauche, le texte original en français. À droite, votre zone de saisie. Traduisez le texte progressivement — votre travail est sauvegardé automatiquement. Une barre de progression indique votre avancement.",
    image: '/contribution/step5.jpeg',
    imageAlt: 'Interface de traduction',
  },
  {
    number: '06',
    icon: CheckCircle,
    title: 'Soumettre la traduction',
    description:
      'Lorsque la traduction est complète (100%), le bouton "Soumettre" devient actif. Cliquez dessus pour envoyer votre traduction. Elle sera examinée et validée par notre équipe de linguistes.',
    image: '/contribution/step6.jpeg',
    imageAlt: 'Soumission de la traduction',
  },
]

// ─── ÉTAPES VOCAL ─────────────────────────────────────
const stepsVocal = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Se connecter ou créer un compte',
    description:
      "Rendez-vous sur komor-ia.com et connectez-vous à votre compte. Si vous n'en avez pas encore, l'inscription est gratuite et prend moins d'une minute.",
    action: { label: 'Créer un compte', href: 'https://komor-ia.com/signup' },
    image: '/contribution/vocal-step1.jpeg',
    imageAlt: 'Connexion ou inscription Komor-IA',
  },
  {
    number: '02',
    icon: Mic,
    title: "Accéder à l'onglet Enregistrement vocal",
    description:
      'Une fois connecté, rendez-vous dans votre tableau de bord et cliquez sur l\'onglet "Enregistrement vocal" dans le menu de gauche. Cet espace est dédié à la collecte de données audio en shikomori.',
    image: '/contribution/vocal-step2.jpeg',
    imageAlt: 'Onglet Enregistrement vocal dans le dashboard',
  },
  {
    number: '03',
    icon: Languages,
    title: 'Choisir votre dialecte',
    description:
      "Sélectionnez votre dialecte parmi les quatre variantes comoriennes : Shingazidja, Shindzuani, Shimwali ou Shimaore. Par défaut, le Shingazidja est sélectionné. Une phrase en shikomori s'affiche automatiquement à l'écran.",
    image: '/contribution/vocal-step3.jpeg',
    imageAlt: 'Sélection du dialecte et affichage de la phrase',
  },
  {
    number: '04',
    icon: Mic,
    title: 'Enregistrer la phrase',
    description:
      "Cliquez sur le bouton microphone et lisez la phrase affichée à voix haute, clairement et naturellement. L'enregistrement est limité à 30 secondes. Cliquez à nouveau pour arrêter.",
    image: '/contribution/vocal-step4.jpeg',
    imageAlt: "Bouton d'enregistrement microphone",
  },
  {
    number: '05',
    icon: Play,
    title: 'Réécouter et recommencer si besoin',
    description:
      'Avant de soumettre, vous pouvez réécouter votre enregistrement. Si la qualité n\'est pas satisfaisante (bruit de fond, hésitation, mauvaise lecture), cliquez sur "Recommencer" pour enregistrer à nouveau.',
    image: '/contribution/vocal-step5.jpeg',
    imageAlt: 'Réécoute et option de recommencer',
  },
  // ✅ NOUVELLE ÉTAPE
  {
    number: '06',
    icon: Users,
    title: 'Renseigner vos informations (optionnel)',
    description:
      "Pour enrichir le corpus, vous pouvez renseigner quelques informations sur votre profil : genre, tranche d'âge, île d'origine et zone (urbain/rural). Vous pouvez également indiquer si vous êtes locuteur natif du dialecte. Ces informations sont entièrement anonymisées et permettent d'améliorer la diversité du corpus audio.",
    image: '/contribution/vocal-step6.jpeg',
    imageAlt: 'Formulaire informations contributeur',
  },
  {
    number: '07',
    icon: Send,
    title: 'Soumettre et continuer',
    description:
      "Si l'enregistrement est bon, cliquez sur \"Soumettre\". Votre contribution sera examinée par notre équipe de linguistes. Une nouvelle phrase s'affiche automatiquement, vous pouvez enchaîner autant d'enregistrements que vous le souhaitez !",
    image: '/contribution/vocal-step7.jpeg',
    imageAlt: 'Soumission et passage à la phrase suivante',
  },
]

// ─── Modal image ──────────────────────────────────────
function ImageModal({ image, alt, onClose }) {
  const handleDownload = async () => {
    try {
      const res = await fetch(image)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = alt.replace(/\s+/g, '-').toLowerCase() + '.png'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(image, '_blank')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-sm font-medium">{alt}</p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={image}
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain bg-white"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Image cliquable ──────────────────────────────────
function ClickableImage({ src, alt, icon: Icon }) {
  const [open, setOpen] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <>
      <div
        onClick={() => !hasError && setOpen(true)}
        className={`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 group ${!hasError ? 'cursor-zoom-in' : ''}`}
      >
        {!hasError ? (
          <>
            <img
              src={src}
              alt={alt}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onError={() => setHasError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                <ZoomIn className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-48 flex flex-col items-center justify-center text-gray-400 p-6">
            <Icon className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm text-center">{alt}</p>
          </div>
        )}
      </div>
      {open && (
        <ImageModal image={src} alt={alt} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

// ─── Liste d'étapes ───────────────────────────────────
function StepsList({ steps }) {
  return (
    <div className="max-w-4xl mx-auto space-y-24">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isEven = index % 2 === 1
        return (
          <div key={index} id={`step-${index + 1}`} className="scroll-mt-8">
            <div className="flex items-start space-x-4 mb-8">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: BRAND }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-mono text-gray-400 mb-1">
                  ÉTAPE {step.number}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {step.title}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className={isEven ? 'lg:order-2' : ''}>
                <p className="text-gray-600 leading-relaxed text-base mb-6">
                  {step.description}
                </p>
                {step.action && (
                  <Link
                    href={step.action.href}
                    target={
                      step.action.href.startsWith('http') ? '_blank' : undefined
                    }
                    className="inline-flex items-center space-x-2 px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: BRAND }}
                  >
                    <span>{step.action.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <div className={isEven ? 'lg:order-1' : ''}>
                <ClickableImage
                  src={step.image}
                  alt={step.imageAlt}
                  icon={Icon}
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Cliquez sur l'image pour l'agrandir
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="mt-16 flex items-center space-x-4">
                <div className="flex-1 border-t border-gray-100"></div>
                <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex-1 border-t border-gray-100"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────
export default function ContributionPage() {
  const [activeTab, setActiveTab] = useState('traduction') // 'traduction' | 'vocal'

  const isVocal = activeTab === 'vocal'
  const currentSteps = isVocal ? stepsVocal : stepsTraduction

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="text-white py-20 px-6"
        style={{ backgroundColor: BRAND }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 text-blue-200 text-sm mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Komor-IA
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Guide de contribution</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Comment contribuer à Komor-IA ?
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl leading-relaxed mb-8">
            Komor-IA développe des corpus linguistiques pour les dialectes
            comoriens. Contribuez à la traduction d'articles ou à la collecte de
            données vocales — chaque contribution compte.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-3">
              <Users className="w-5 h-5 text-blue-300" />
              <span className="text-sm">Ouvert à tous</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm">Gratuit</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-3">
              <Globe className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">4 dialectes supportés</span>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Sélecteur de module — onglets */}
      <section className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('traduction')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                !isVocal
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>Module Traduction</span>
            </button>
            <button
              onClick={() => setActiveTab('vocal')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                isVocal
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Module Vocal</span>
              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Nouveau
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Description du module actif */}
      <section className="bg-gray-50 border-b border-gray-200 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {isVocal ? (
            <div className="flex items-start space-x-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: BRAND }}
              >
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Collecte de données vocales
                </h2>
                <p className="text-gray-600 text-sm">
                  Enregistrez des phrases en shikomori pour constituer le
                  premier corpus audio des langues comoriennes. Vos
                  enregistrements serviront à entraîner des modèles de
                  reconnaissance et synthèse vocale.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: BRAND }}
              >
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Traduction d'articles
                </h2>
                <p className="text-gray-600 text-sm">
                  Traduisez des articles de presse du français vers le shikomori
                  pour constituer le premier corpus textuel des langues
                  comoriennes. Vos traductions serviront à entraîner des modèles
                  de traduction automatique.
                </p>
              </div>
            </div>
          )}

          {/* Navigation rapide */}
          <div className="flex flex-wrap gap-2 mt-6">
            {currentSteps.map((step, i) => (
              <a
                key={i}
                href={`#step-${i + 1}`}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all"
              >
                <span className="font-mono text-gray-400">{step.number}</span>
                <span>{step.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Étapes */}
      <section className="py-16 px-6">
        <StepsList steps={currentSteps} />
      </section>

      {/* Dialectes */}
      <section className="bg-gray-50 border-t border-b border-gray-200 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Les 4 dialectes comoriens
          </h2>
          <p className="text-gray-600 mb-8">
            Komor-IA collecte des données dans les quatre variantes du
            shikomori. Choisissez celui que vous maîtrisez le mieux.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Shingazidja',
                region: 'Grande Comore',
                flag: '🇰🇲',
                default: true,
              },
              {
                name: 'Shindzuani',
                region: 'Anjouan',
                flag: '🇰🇲',
                default: false,
              },
              {
                name: 'Shimwali',
                region: 'Mohéli',
                flag: '🇰🇲',
                default: false,
              },
              {
                name: 'Shimaore',
                region: 'Mayotte',
                flag: '🇰🇲',
                default: false,
              },
            ].map((d, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl p-5 border ${d.default ? 'ring-2' : 'border-gray-200'}`}
                style={d.default ? { borderColor: BRAND } : {}}
              >
                <span className="text-2xl mb-3 block">{d.flag}</span>
                <h3 className="font-semibold text-gray-900 mb-1">{d.name}</h3>
                <p className="text-sm text-gray-500">{d.region}</p>
                {d.default && (
                  <span
                    className="inline-block mt-3 text-xs text-white px-2 py-0.5 rounded"
                    style={{ backgroundColor: BRAND }}
                  >
                    Par défaut
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {(isVocal
              ? [
                  {
                    q: 'Quel matériel est nécessaire pour enregistrer ?',
                    a: "Aucun matériel spécial n'est requis. Le microphone intégré de votre ordinateur ou smartphone suffit. Pour une meilleure qualité, privilégiez un environnement calme.",
                  },
                  {
                    q: 'Combien de phrases puis-je enregistrer ?',
                    a: "Autant que vous le souhaitez ! Une nouvelle phrase s'affiche automatiquement après chaque soumission. Vous pouvez contribuer en plusieurs sessions.",
                  },
                  {
                    q: 'Que se passe-t-il si mon enregistrement est rejeté ?',
                    a: "Notre équipe vous en informera via votre tableau de bord. Vous pourrez alors supprimer l'enregistrement et recommencer la même phrase ou en choisir une autre.",
                  },
                  {
                    q: 'Faut-il parler couramment le shikomori ?',
                    a: 'Oui. Pour la qualité du corpus, il est préférable que vous soyez locuteur natif ou ayez une bonne maîtrise du dialecte que vous enregistrez.',
                  },
                ]
              : [
                  {
                    q: 'Faut-il être linguiste pour contribuer ?',
                    a: 'Non. Toute personne maîtrisant le shikomori peut contribuer. Les traductions sont ensuite vérifiées par notre équipe de linguistes avant validation.',
                  },
                  {
                    q: 'Ma traduction est-elle sauvegardée automatiquement ?',
                    a: 'Oui. La plateforme sauvegarde automatiquement votre progression. Vous pouvez reprendre là où vous vous êtes arrêté à tout moment.',
                  },
                  {
                    q: 'Puis-je contribuer depuis un téléphone ?',
                    a: 'Oui. La plateforme est accessible depuis tout navigateur, sur ordinateur, tablette ou smartphone.',
                  },
                  {
                    q: 'Que se passe-t-il après la soumission ?',
                    a: "Votre traduction est transmise à notre équipe de linguistes qui la vérifie et la valide. Elle intègre ensuite notre corpus linguistique utilisé pour l'entraînement de modèles d'IA.",
                  },
                ]
            ).map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="text-white py-16 px-6"
        style={{ backgroundColor: BRAND }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à contribuer ?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Chaque contribution compte. Rejoignez la communauté Komor-IA et
            participez à la construction de l'IA pour les langues comoriennes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 bg-white font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: BRAND }}
            >
              Créer un compte
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
