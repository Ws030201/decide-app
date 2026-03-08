import { useState } from 'react'
import { MessageSquare, Flame, Users, MapPin, Wine, Crosshair } from 'lucide-react'
import TruthOrDare from '../components/games/TruthOrDare'
import TimeBomb from '../components/games/TimeBomb'
import RandomGroups from '../components/games/RandomGroups'
import ActivitySlot from '../components/games/ActivitySlot'
import ThirteenCards from '../components/games/ThirteenCards'
import BombNumber from '../components/games/BombNumber'
import { haptic } from '../utils/haptic'

const games = [
  { id: 'thirteen', label: '十三钗', icon: Wine, color: 'from-violet-500 to-purple-500', full: true },
  { id: 'bombnum', label: '猜数字', icon: Crosshair, color: 'from-red-500 to-orange-500', full: false },
  { id: 'truth', label: '真心话', icon: MessageSquare, color: 'from-pink-400 to-purple-400', full: false },
  { id: 'bomb', label: '炸弹人', icon: Flame, color: 'from-red-400 to-orange-400', full: false },
  { id: 'groups', label: '分组', icon: Users, color: 'from-sky to-primary-light', full: false },
  { id: 'activity', label: '去哪浪', icon: MapPin, color: 'from-emerald-400 to-green-400', full: false },
]

export default function Party() {
  const [activeGame, setActiveGame] = useState('thirteen')

  const handleTabChange = (id) => {
    haptic('light')
    setActiveGame(id)
  }

  const renderGame = () => {
    switch (activeGame) {
      case 'thirteen': return <ThirteenCards />
      case 'bombnum': return <BombNumber />
      case 'truth': return <TruthOrDare />
      case 'bomb': return <TimeBomb />
      case 'groups': return <RandomGroups />
      case 'activity': return <ActivitySlot />
      default: return <ThirteenCards />
    }
  }

  const activeConfig = games.find(g => g.id === activeGame)
  const isFullWidth = activeConfig?.full

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
          🎉 聚会游戏
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          氛围拉满，聚会必备神器
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {games.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeGame === id
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex-shrink-0 flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${color} text-white shadow-md scale-[1.02]`
                  : 'bg-white/80 text-text-secondary border border-purple-50 hover:border-primary/20'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>

      {isFullWidth ? (
        renderGame()
      ) : (
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-purple-50 min-h-[420px] flex flex-col items-center justify-center">
          {renderGame()}
        </div>
      )}
    </div>
  )
}
