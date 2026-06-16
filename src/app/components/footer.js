'use client'

import {
  Brain,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Github,
  Facebook,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/logo3.svg"
                  alt="Komor-IA Logo"
                  width={24}
                  height={24}
                />
              </div>
              <span className="text-xl font-bold">Komor-IA</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Startup d'intelligence artificielle basée aux Comores, développant
              des solutions IA innovantes pour l'Afrique.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://x.com/komor_ia?s=20"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/komor-ia-7492573b9/?skipRedirect=true"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              {/* <a
                href="https://github.com/komoria"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a> */}
              <a
                href="https://web.facebook.com/profile.php?id=61578497709510"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nos Modèles</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  href="/models/press-ai"
                  className="hover:text-white transition-colors"
                >
                  Press-AI - Chatbot presse
                </Link>
              </li>
              <li>
                <Link
                  href="/models/wazir"
                  className="hover:text-white transition-colors"
                >
                  Wazir - Assistant général
                </Link>
              </li>
              <li>
                <Link
                  href="/models"
                  className="hover:text-white transition-colors"
                >
                  Tous les modèles
                </Link>
              </li>
              <li>
                <Link
                  href="/tarifs"
                  className="hover:text-white transition-colors"
                >
                  Tarifs & Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Ressources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/api"
                  className="hover:text-white transition-colors"
                >
                  API Reference
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  Blog & Actualités
                </Link>
              </li> */}
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-white transition-colors"
                >
                  Carrières
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:contact@komor-ia.com"
                  className="hover:text-white transition-colors"
                >
                  komor.ia2025@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>+212 774329751</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Moroni, Comores 🇰🇲</span>
              </li>
            </ul>

            <div className="mt-4">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        {/* Partenaires */}
        <div className="py-6 border-t border-slate-800">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-3">Nos partenaires</p>
            <div className="flex justify-center items-center space-x-6">
              <a
                href="https://km-news.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Km-news
              </a>
              <a
                href="https://dictionary.orelc.ac/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                ORELC
              </a>
              {/* Ajoutez d'autres partenaires ici */}
              <a
                href="https://dictionary.orelc.ac/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                ORELC
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {currentYear} Komor-IA. Tous droits réservés. Créons
              ensemble l'IA de demain.
            </p>
            <div className="flex space-x-6 text-gray-400 text-sm">
              <Link
                href="/legal/privacy"
                className="hover:text-white transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                href="/legal/terms"
                className="hover:text-white transition-colors"
              >
                Conditions d'utilisation
              </Link>
              <Link
                href="/legal/cookies"
                className="hover:text-white transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
