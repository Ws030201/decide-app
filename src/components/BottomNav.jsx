import { Home, Brain, PartyPopper, Wrench } from 'lucide-react'

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'plan', label: 'MBTI规划', icon: Brain },
  { id: 'party', label: '聚会', icon: PartyPopper },
  { id: 'tools', label: '小工具', icon: Wrench },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/80 backdrop-blur-xl border-t border-purple-100 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-primary scale-105'
                  : 'text-text-secondary hover:text-primary/70'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary/10' : ''
              }`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium transition-all duration-300 ${
                isActive ? 'font-semibold' : ''
              }`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
