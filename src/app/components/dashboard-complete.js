'use client'

import { useState, useEffect } from 'react'
import Sidebar from './sidebar-new'
import HorizontalNavbar from './horizontal-navbar'
import HomePage from './home-page'
import ApiKeysPage from './api-keys-page'
import UsagePage from './usage-page'
import SettingsPage from './settings-page'
import ArticlesListPage from './articles-list-page'
import TranslatePage from './translate-page'

import ModelInfo from './ModelInfo'
import VoicePage from './voice-page'
// SUPPRIME l'import ModelPage

export default function DashboardComplete() {
  const [activeSection, setActiveSection] = useState('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedArticleSlug, setSelectedArticleSlug] = useState(null)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleSectionChange = (section) => {
    setActiveSection(section)
    setSelectedArticleSlug(null)
  }

  const handleArticleClick = (slug) => {
    setSelectedArticleSlug(slug)
    setActiveSection('translate')
  }

  const renderContent = () => {
    if (activeSection === 'translate' && selectedArticleSlug) {
      return (
        <TranslatePage
          slug={selectedArticleSlug}
          onBack={() => {
            setActiveSection('articles')
            setSelectedArticleSlug(null)
          }}
        />
      )
    }

    switch (activeSection) {
      case 'home':
        return <HomePage />
      case 'api-keys':
        return <ApiKeysPage />
      case 'articles':
        return <ArticlesListPage onArticleClick={handleArticleClick} />
      case 'voice':
        return <VoicePage />
      case 'usage':
        return <UsagePage />

      case 'settings':
        return <SettingsPage />
      case 'docs':
        return (
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Documentation</h2>
            <p>Documentation à venir...</p>
          </div>
        )
      default:
        if (activeSection?.startsWith('model-')) {
          const slug = activeSection.replace('model-', '')
          return <ModelInfo slug={slug} />
        }
        return <HomePage />
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-[#F5F3EF]">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />
      <div
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-300
          // {isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
          ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        `}
      >
        {/* <HorizontalNavbar
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          showSidebarToggle={false}
          onSidebarToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        /> */}
        <HorizontalNavbar
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex-1 p-6 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  )
}

// 'use client'

// import { useState } from 'react'
// import Sidebar from './sidebar-new'
// import HorizontalNavbar from './horizontal-navbar'
// import HomePage from './home-page'
// import ApiKeysPage from './api-keys-page'
// import UsagePage from './usage-page'
// import SettingsPage from './settings-page'
// import ArticlesListPage from './articles-list-page'
// import TranslatePage from './translate-page'

// export default function DashboardComplete() {
//   const [activeSection, setActiveSection] = useState('home')
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true)
//   const [selectedArticleSlug, setSelectedArticleSlug] = useState(null)

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen)
//   }

//   const handleSectionChange = (section) => {
//     setActiveSection(section)
//     setSelectedArticleSlug(null) // Reset article sélectionné
//   }

//   const handleArticleClick = (slug) => {
//     setSelectedArticleSlug(slug)
//     setActiveSection('translate')
//   }

//   const renderContent = () => {
//     // Si on est en mode traduction
//     if (activeSection === 'translate' && selectedArticleSlug) {
//       return (
//         <TranslatePage
//           slug={selectedArticleSlug}
//           onBack={() => {
//             setActiveSection('articles')
//             setSelectedArticleSlug(null)
//           }}
//         />
//       )
//     }

//     // Sinon afficher selon la section
//     switch (activeSection) {
//       case 'home':
//         return <HomePage />

//       case 'api-keys':
//         return <ApiKeysPage />

//       case 'articles':
//         return <ArticlesListPage onArticleClick={handleArticleClick} />

//       case 'usage':
//         return <UsagePage />

//       case 'settings':
//         return <SettingsPage />

//       case 'docs':
//         return (
//           <div className="p-6 bg-white rounded-lg">
//             <h2 className="text-2xl font-bold mb-4">Documentation</h2>
//             <p>Documentation à venir...</p>
//           </div>
//         )

//       // Modèles
//       case 'model-press-ai':
//         return (
//           <div className="p-6 bg-white rounded-lg">
//             <h2 className="text-2xl font-bold mb-4">Press-AI</h2>
//             <p>Interface Press-AI à venir...</p>
//           </div>
//         )

//       case 'model-wazir':
//         return (
//           <div className="p-6 bg-white rounded-lg">
//             <h2 className="text-2xl font-bold mb-4">Wazir</h2>
//             <p>Interface Wazir à venir...</p>
//           </div>
//         )

//       default:
//         return <HomePage />
//     }
//   }

//   return (
//     <div className="flex w-full min-h-screen bg-[#F5F3EF]">
//       {/* Sidebar - Desktop */}
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onToggle={toggleSidebar}
//         activeSection={activeSection}
//         setActiveSection={handleSectionChange}
//       />

//       {/* Main Content */}
//       <div
//         className={`
//           flex-1 flex flex-col min-h-screen
//           transition-all duration-300
//           ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
//         `}
//       >
//         {/* Navbar */}
//         <HorizontalNavbar
//           activeSection={activeSection}
//           setActiveSection={handleSectionChange}
//           showSidebarToggle={false}
//           onSidebarToggle={toggleSidebar}
//           isSidebarOpen={isSidebarOpen}
//         />

//         {/* Content Area */}
//         <div className="flex-1 p-6 overflow-auto">{renderContent()}</div>
//       </div>
//     </div>
//   )
// }
