import { useState } from 'react'
import { MessageSquare, Flame, Users, MapPin } from 'lucide-react'
import TruthOrDare from '../components/games/TruthOrDare'
import TimeBomb from '../components/games/TimeBomb'
import RandomGroups from '../components/games/RandomGroups'
import ActivitySlot from '../components/games/ActivitySlot'
import { haptic } from '../utils/haptic'

const games = [
  { id: 'truth', label: '真心话', icon: MessageSquare, color: 'from-pink-400 to-purple-400' },
  { id: 'bomb', label: '炸弹人', icon: Flame, color: 'from-red-400 to-orange-400' },
  { id: 'groups', label: '分组', icon: Users, color: 'from-sky to-primary-light' },
  { id: 'activity', label: '去哪浪', icon: MapPin, color: 'from-emerald-400 to-green-400' },
]

export default function Party() {
  const [activeGame, setActiveGame] = useState('truth')

  const handleTabChange = (id) => {
    haptic('light')
    setActiveGame(id)
  }

  const renderGame = () => {
    switch (activeGame) {
      case 'truth': return <TruthOrDare />
      case 'bomb': return <TimeBomb />
      case 'groups': return <RandomGroups />
      case 'activity': return <ActivitySlot />
      default: return <TruthOrDare />
    }
  }

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

      <div className="flex gap-2">
        {games.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeGame === id
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${color} text-white shadow-md scale-[1.02]`
                  : 'bg-white/80 text-text-secondary border border-purple-50 hover:border-primary/20'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-sm border border-purple-50 min-h-[420px] flex flex-col items-center justify-center">
        {renderGame()}
      </div>
    </div>
  )
}
