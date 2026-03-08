import { useState } from 'react'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Plan from './pages/Plan'
import Party from './pages/Party'
import Tools from './pages/Tools'

const tabs = ['home', 'plan', 'party', 'tools']

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={setActiveTab} />
      case 'plan': return <Plan />
      case 'party': return <Party />
      case 'tools': return <Tools />
      default: return <Home onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="flex justify-center min-h-dvh">
      <div className="relative w-full max-w-[480px] min-h-dvh bg-bg flex flex-col">
        <main className="flex-1 overflow-y-auto pb-20 px-4 pt-4">
          {renderPage()}
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
