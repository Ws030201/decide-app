import { useState, useCallback } from 'react'
import { haptic } from '../../utils/haptic'

const ACTIVITIES = [
  {
    emoji: '🔍', label: '密室逃脱',
    styles: [
      { emoji: '👻', label: '恐怖主题' },
      { emoji: '🧩', label: '烧脑推理' },
      { emoji: '⚙️', label: '机关解谜' },
      { emoji: '🎭', label: '沉浸演绎' },
      { emoji: '🌟', label: '新手友好' },
    ],
    budgets: [
      { emoji: '💰', label: '人均80' },
      { emoji: '💰', label: '人均120' },
      { emoji: '💎', label: '人均180' },
      { emoji: '💎', label: '人均250+' },
    ],
  },
  {
    emoji: '🎤', label: 'KTV',
    styles: [
      { emoji: '🎵', label: '怀旧金曲' },
      { emoji: '🔥', label: '嗨歌蹦迪' },
      { emoji: '💕', label: '情歌对唱' },
      { emoji: '🎤', label: '说唱Battle' },
      { emoji: '🎶', label: '随便唱唱' },
    ],
    budgets: [
      { emoji: '💰', label: '人均50' },
      { emoji: '💰', label: '人均80' },
      { emoji: '💎', label: '人均150' },
      { emoji: '💎', label: '人均200+' },
    ],
  },
  {
    emoji: '🎭', label: '剧本杀',
    styles: [
      { emoji: '😱', label: '恐怖' },
      { emoji: '💔', label: '情感沉浸' },
      { emoji: '🔎', label: '硬核推理' },
      { emoji: '😄', label: '欢乐搞笑' },
      { emoji: '🏰', label: '古风' },
    ],
    budgets: [
      { emoji: '💰', label: '人均60' },
      { emoji: '💰', label: '人均100' },
      { emoji: '💎', label: '人均160' },
      { emoji: '💎', label: '人均200+' },
    ],
  },
  {
    emoji: '🎬', label: '看电影',
    styles: [
      { emoji: '😂', label: '喜剧' },
      { emoji: '💥', label: '动作大片' },
      { emoji: '😱', label: '恐怖惊悚' },
      { emoji: '💕', label: '浪漫爱情' },
      { emoji: '🎬', label: '新上映的' },
    ],
    budgets: [
      { emoji: '💰', label: '人均40' },
      { emoji: '💰', label: '人均60' },
      { emoji: '💎', label: '人均80 IMAX' },
      { emoji: '💎', label: '人均120 VIP' },
    ],
  },
  {
    emoji: '🎲', label: '桌游',
    styles: [
      { emoji: '🤔', label: '策略烧脑' },
      { emoji: '😄', label: '欢乐派对' },
      { emoji: '🃏', label: '卡牌对战' },
      { emoji: '🎯', label: '阵营对抗' },
      { emoji: '🌟', label: '新手友好' },
    ],
    budgets: [
      { emoji: '💰', label: '人均30' },
      { emoji: '💰', label: '人均50' },
      { emoji: '💎', label: '人均80' },
      { emoji: '💎', label: '人均120+' },
    ],
  },
  {
    emoji: '⛺', label: '露营',
    styles: [
      { emoji: '🏕️', label: '精致露营' },
      { emoji: '🌲', label: '野外探险' },
      { emoji: '🌙', label: '夜观星空' },
      { emoji: '🔥', label: '篝火烧烤' },
      { emoji: '📸', label: '拍照打卡' },
    ],
    budgets: [
      { emoji: '💰', label: '人均100' },
      { emoji: '💰', label: '人均200' },
      { emoji: '💎', label: '人均350' },
      { emoji: '💎', label: '人均500+' },
    ],
  },
  {
    emoji: '🛍️', label: '逛街',
    styles: [
      { emoji: '☕', label: '咖啡探店' },
      { emoji: '🛒', label: '疯狂购物' },
      { emoji: '📸', label: '网红打卡' },
      { emoji: '🍰', label: '甜品巡礼' },
      { emoji: '🚶', label: '随便走走' },
    ],
    budgets: [
      { emoji: '💰', label: '只看不买' },
      { emoji: '💰', label: '人均100' },
      { emoji: '💎', label: '人均300' },
      { emoji: '💎', label: '随心所欲' },
    ],
  },
  {
    emoji: '🏀', label: '运动',
    styles: [
      { emoji: '🏀', label: '篮球' },
      { emoji: '🏸', label: '羽毛球' },
      { emoji: '🎳', label: '保龄球' },
      { emoji: '🧗', label: '攀岩' },
      { emoji: '🏊', label: '游泳' },
    ],
    budgets: [
      { emoji: '💰', label: '人均30' },
      { emoji: '💰', label: '人均60' },
      { emoji: '💎', label: '人均100' },
      { emoji: '💎', label: '人均200+' },
    ],
  },
  {
    emoji: '🎡', label: '游乐园',
    styles: [
      { emoji: '🎢', label: '刺激过山车' },
      { emoji: '🎠', label: '梦幻浪漫' },
      { emoji: '💧', label: '水上项目' },
      { emoji: '🌙', label: '夜场' },
      { emoji: '📸', label: '打卡拍照' },
    ],
    budgets: [
      { emoji: '💰', label: '人均150' },
      { emoji: '💰', label: '人均250' },
      { emoji: '💎', label: '人均400' },
      { emoji: '💎', label: '人均500+' },
    ],
  },
  {
    emoji: '♨️', label: '泡温泉',
    styles: [
      { emoji: '🧖', label: '养生放松' },
      { emoji: '🎉', label: '温泉派对' },
      { emoji: '🏊', label: '水上乐园' },
      { emoji: '🍶', label: '日式汤屋' },
      { emoji: '🌸', label: '户外温泉' },
    ],
    budgets: [
      { emoji: '💰', label: '人均100' },
      { emoji: '💰', label: '人均200' },
      { emoji: '💎', label: '人均350' },
      { emoji: '💎', label: '人均500+' },
    ],
  },
]

const RESULT_MESSAGES = [
  '今晚的行程安排上了 🗓️',
  '命运之轮已经转动 ✨',
  '就这么定了，谁也别想跑 🎯',
  '完美计划已生成 🔒',
  '这安排，绝了 👏',
]

const PHASE_MESSAGES = {
  idle: '拉下摇杆，今晚去哪全看天意！',
  activity: '今晚玩什么… 🤔',
  style: '什么风格呢… 🧐',
  budget: '预算多少合适… 💸',
}

function spinReel(items, onTick, totalSteps = 15) {
  return new Promise((resolve) => {
    let speed = 50
    let steps = 0
    const finalIndex = Math.floor(Math.random() * items.length)

    function tick() {
      onTick(Math.floor(Math.random() * items.length))
      steps++
      if (steps >= totalSteps) {
        onTick(finalIndex)
        haptic('medium')
        resolve(finalIndex)
        return
      }
      if (steps > totalSteps * 0.65) speed += 30
      setTimeout(tick, speed)
    }

    setTimeout(tick, speed)
  })
}

function pause(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function ReelCell({ items, displayIndex, state }) {
  if (state === 'waiting') {
    return (
      <div className="flex-1">
        <div className="flex flex-col items-center">
          <div className="h-11" />
          <div className="h-14 flex flex-col items-center justify-center opacity-25">
            <span className="text-2xl leading-none">❓</span>
            <span className="text-[10px] font-medium mt-1">待揭晓</span>
          </div>
          <div className="h-11" />
        </div>
      </div>
    )
  }

  const getItem = (offset) =>
    items[(displayIndex + offset + items.length) % items.length]

  return (
    <div className="flex-1">
      <div className="flex flex-col items-center">
        <div className="h-11 flex flex-col items-center justify-center opacity-20">
          <span className="text-base leading-none">{getItem(-1).emoji}</span>
          <span className="text-[10px] mt-0.5">{getItem(-1).label}</span>
        </div>
        <div
          className={`h-14 flex flex-col items-center justify-center transition-transform duration-300 ${
            state === 'stopped' ? 'scale-110' : ''
          }`}
        >
          <span className="text-2xl leading-none">{getItem(0).emoji}</span>
          <span className="text-xs font-semibold mt-1">{getItem(0).label}</span>
        </div>
        <div className="h-11 flex flex-col items-center justify-center opacity-20">
          <span className="text-base leading-none">{getItem(1).emoji}</span>
          <span className="text-[10px] mt-0.5">{getItem(1).label}</span>
        </div>
      </div>
    </div>
  )
}

export default function ActivitySlot() {
  const [phase, setPhase] = useState('idle')
  const [actDisplay, setActDisplay] = useState(0)
  const [styleDisplay, setStyleDisplay] = useState(0)
  const [budgetDisplay, setBudgetDisplay] = useState(0)
  const [currentStyles, setCurrentStyles] = useState(ACTIVITIES[0].styles)
  const [currentBudgets, setCurrentBudgets] = useState(ACTIVITIES[0].budgets)
  const [resultMsg, setResultMsg] = useState('')

  const pull = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'done') return
    haptic('spin')

    setPhase('activity')
    const actIdx = await spinReel(ACTIVITIES, setActDisplay, 15)
    await pause(500)

    const act = ACTIVITIES[actIdx]
    setCurrentStyles(act.styles)
    setStyleDisplay(0)
    setPhase('style')
    await spinReel(act.styles, setStyleDisplay, 15)
    await pause(500)

    setCurrentBudgets(act.budgets)
    setBudgetDisplay(0)
    setPhase('budget')
    await spinReel(act.budgets, setBudgetDisplay, 15)
    await pause(300)

    setPhase('done')
    setResultMsg(RESULT_MESSAGES[Math.floor(Math.random() * RESULT_MESSAGES.length)])
    haptic('success')
  }, [phase])

  const getReelState = (reelIndex) => {
    if (phase === 'idle') return 'idle'
    if (phase === 'done') return 'stopped'
    const activeIdx = { activity: 0, style: 1, budget: 2 }[phase]
    if (reelIndex < activeIdx) return 'stopped'
    if (reelIndex === activeIdx) return 'spinning'
    return 'waiting'
  }

  const reels = [
    { label: '玩什么', items: ACTIVITIES, display: actDisplay },
    { label: '风格', items: currentStyles, display: styleDisplay },
    { label: '预算', items: currentBudgets, display: budgetDisplay },
  ]

  const isSpinning = !['idle', 'done'].includes(phase)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-text-secondary text-sm text-center min-h-[20px]">
        {PHASE_MESSAGES[phase] || ''}
      </p>

      <div className="w-full bg-gradient-to-b from-emerald-800 to-emerald-950 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.6s]" />
          <span className="text-[10px] text-emerald-300/60 font-bold tracking-widest mx-2">
            GO WHERE
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.6s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        </div>

        <div className="relative bg-white rounded-xl overflow-hidden">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-14 bg-emerald-500/5 border-y-2 border-emerald-400/20 pointer-events-none z-10" />
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

          <div className="flex divide-x divide-gray-100">
            {reels.map((reel, i) => (
              <ReelCell
                key={i}
                items={reel.items}
                displayIndex={reel.display}
                state={getReelState(i) === 'idle' ? 'spinning' : getReelState(i)}
              />
            ))}
          </div>
        </div>

        <div className="flex mt-2">
          {reels.map((reel, i) => (
            <div
              key={i}
              className="flex-1 text-center text-[10px] text-emerald-300/50 font-medium tracking-wide"
            >
              {reel.label}
            </div>
          ))}
        </div>
      </div>

      {phase === 'done' && (
        <div className="animate-pop-in text-center space-y-1.5">
          <p className="text-sm font-bold text-text">{resultMsg}</p>
          <div className="flex items-center justify-center gap-1.5 text-xl">
            {reels.map((reel, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-xs text-text-secondary">+</span>}
                {reel.items[reel.display].emoji}
              </span>
            ))}
          </div>
          <p className="text-sm text-text-secondary">
            {reels.map((reel, i) => reel.items[reel.display].label).join(' · ')}
          </p>
        </div>
      )}

      <button
        onClick={pull}
        disabled={isSpinning}
        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
      >
        {isSpinning
          ? '命运转动中… 🌀'
          : phase === 'done'
            ? '不服？再来一把 🎰'
            : '🎰 今晚去哪浪！'}
      </button>
    </div>
  )
}
