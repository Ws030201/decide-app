import { Sparkles, Brain, Dice5, MapPin, Users, Zap, CircleDot } from 'lucide-react'
import { haptic } from '../utils/haptic'

const TIPS = [
  { emoji: '💡', title: '冷知识', text: '研究表明，和性格互补的朋友出门，往往能获得更多意想不到的乐趣。试试用 MBTI 规划下一次聚会吧！' },
  { emoji: '🧠', title: '你知道吗', text: 'ENFP 和 INTJ 被称为"黄金搭档"，一个负责天马行空，一个负责落地执行——下次组队试试？' },
  { emoji: '🎲', title: '选择困难？', text: '心理学家说，当选择太多时，随机反而能带来更高的满意度。所以…直接掷骰子吧！' },
  { emoji: '🎡', title: '推卸责任指南', text: '不想做决定？用大转盘让命运来选！输了的人请喝奶茶，赢了的人… 也请喝奶茶。' },
]

export default function Home({ onNavigate }) {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)]

  return (
    <div className="space-y-6 pb-4">
      <div className="text-center pt-6 pb-2">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-4xl animate-bounce-soft">🎲</span>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">
            帮你决定
          </h1>
        </div>
        <p className="text-text-secondary text-sm mt-1">
          别想了，交给命运吧 ✨
        </p>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-light p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} />
            <span className="text-sm font-medium opacity-90">MBTI 性格匹配</span>
          </div>
          <h2 className="text-xl font-bold mb-1">周末不知道去哪？</h2>
          <p className="text-sm opacity-80 mb-4">
            输入大家的 MBTI，AI 帮你匹配最合拍的活动 🎯
          </p>
          <button
            onClick={() => { haptic('light'); onNavigate('plan') }}
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            <Brain size={16} />
            开始匹配
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
          <Zap size={18} className="text-accent" />
          快捷入口
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard
            icon={<Brain className="text-primary" size={24} />}
            title="MBTI 匹配"
            desc="性格匹配最佳活动"
            color="bg-primary/5 border-primary/10"
            onClick={() => { haptic('light'); onNavigate('plan') }}
          />
          <QuickCard
            icon={<CircleDot className="text-accent" size={24} />}
            title="命运转盘"
            desc="谁来买单？转！"
            color="bg-accent/5 border-accent/10"
            onClick={() => { haptic('light'); onNavigate('tools') }}
          />
          <QuickCard
            icon={<Dice5 className="text-sky" size={24} />}
            title="掷骰子"
            desc="让天意来决定"
            color="bg-sky/5 border-sky/10"
            onClick={() => { haptic('light'); onNavigate('tools') }}
          />
          <QuickCard
            icon={<MapPin className="text-mint" size={24} />}
            title="附近探索"
            desc="即将上线 🚧"
            color="bg-mint/5 border-mint/10"
            disabled
          />
        </div>
      </div>

      {/* Fun Tips */}
      <div className="rounded-2xl bg-sunny/30 border border-sunny/50 p-4">
        <p className="text-sm font-medium text-text mb-1">{tip.emoji} {tip.title}</p>
        <p className="text-xs text-text-secondary leading-relaxed">
          {tip.text}
        </p>
      </div>
    </div>
  )
}

function QuickCard({ icon, title, desc, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all duration-300 text-left ${color} ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
      }`}
    >
      <div className="p-2 rounded-xl bg-white/80 shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="text-[11px] text-text-secondary">{desc}</p>
      </div>
    </button>
  )
}
