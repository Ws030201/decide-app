import { useState } from 'react'
import { Dice5, Hash, Club, CircleDot, UtensilsCrossed } from 'lucide-react'
import DiceRoller from '../components/tools/DiceRoller'
import RandomNumber from '../components/tools/RandomNumber'
import CardDraw from '../components/tools/CardDraw'
import SpinWheel from '../components/tools/SpinWheel'
import SlotMachine from '../components/tools/SlotMachine'
import { haptic } from '../utils/haptic'

const tools = [
  { id: 'slot', label: '吃啥', icon: UtensilsCrossed, color: 'from-sunny to-accent' },
  { id: 'dice', label: '骰子', icon: Dice5, color: 'from-primary to-primary-light' },
  { id: 'wheel', label: '转盘', icon: CircleDot, color: 'from-accent to-accent-light' },
  { id: 'random', label: '随机数', icon: Hash, color: 'from-sky to-primary-light' },
  { id: 'card', label: '扑克', icon: Club, color: 'from-sky to-mint' },
]

export default function Tools() {
  const [activeTool, setActiveTool] = useState('slot')

  const handleTabChange = (id) => {
    haptic('light')
    setActiveTool(id)
  }

  const renderTool = () => {
    switch (activeTool) {
      case 'slot': return <SlotMachine />
      case 'dice': return <DiceRoller />
      case 'wheel': return <SpinWheel />
      case 'random': return <RandomNumber />
      case 'card': return <CardDraw />
      default: return <SlotMachine />
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
          🎯 聚会小工具
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          选择困难？直接交给命运吧
        </p>
      </div>

      {/* Tool Tabs */}
      <div className="flex gap-2">
        {tools.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTool === id
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

      {/* Tool Content */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-purple-50 min-h-[420px] flex flex-col items-center justify-center">
        {renderTool()}
      </div>
    </div>
  )
}
