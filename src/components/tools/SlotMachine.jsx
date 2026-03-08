import { useState, useCallback } from 'react'
import { haptic } from '../../utils/haptic'

const CATEGORIES = [
  {
    emoji: '🍲', label: '火锅',
    flavors: [
      { emoji: '🌶️', label: '重辣' },
      { emoji: '🍅', label: '番茄锅' },
      { emoji: '🍄', label: '菌汤' },
      { emoji: '🥜', label: '麻辣' },
      { emoji: '🫧', label: '清汤' },
    ],
  },
  {
    emoji: '🥩', label: '烧烤',
    flavors: [
      { emoji: '🧂', label: '咸香' },
      { emoji: '🌶️', label: '微辣' },
      { emoji: '🧄', label: '蒜香' },
      { emoji: '🫚', label: '孜然' },
      { emoji: '🍯', label: '蜜汁' },
    ],
  },
  {
    emoji: '🍣', label: '日料',
    flavors: [
      { emoji: '🍃', label: '清淡' },
      { emoji: '🫘', label: '酱油' },
      { emoji: '🟢', label: '芥末' },
      { emoji: '🍬', label: '甜口' },
      { emoji: '🍋', label: '酸爽' },
    ],
  },
  {
    emoji: '🥗', label: '轻食',
    flavors: [
      { emoji: '🍃', label: '清淡' },
      { emoji: '🍋', label: '酸爽' },
      { emoji: '🍬', label: '甜口' },
      { emoji: '🥑', label: '低脂' },
      { emoji: '🧂', label: '咸鲜' },
    ],
  },
  {
    emoji: '🍔', label: '快餐',
    flavors: [
      { emoji: '🧂', label: '咸香' },
      { emoji: '🌶️', label: '重辣' },
      { emoji: '🍬', label: '甜辣' },
      { emoji: '🧀', label: '芝士' },
      { emoji: '🤷', label: '随便' },
    ],
  },
  {
    emoji: '🍺', label: '大排档',
    flavors: [
      { emoji: '🌶️', label: '重辣' },
      { emoji: '🧂', label: '咸香' },
      { emoji: '🧄', label: '蒜香' },
      { emoji: '🍺', label: '配啤酒' },
      { emoji: '🤷', label: '随便' },
    ],
  },
  {
    emoji: '🧋', label: '奶茶',
    flavors: [
      { emoji: '🍬', label: '全糖' },
      { emoji: '🍃', label: '半糖' },
      { emoji: '🧊', label: '去冰' },
      { emoji: '🥛', label: '加奶盖' },
      { emoji: '🫧', label: '加珍珠' },
    ],
  },
  {
    emoji: '🍝', label: '西餐',
    flavors: [
      { emoji: '🍃', label: '清淡' },
      { emoji: '🫑', label: '黑椒' },
      { emoji: '🧈', label: '奶油' },
      { emoji: '🍬', label: '甜口' },
      { emoji: '🧂', label: '咸鲜' },
    ],
  },
  {
    emoji: '🌶️', label: '麻辣烫',
    flavors: [
      { emoji: '🌶️', label: '重辣' },
      { emoji: '🌶️', label: '微辣' },
      { emoji: '🍅', label: '番茄' },
      { emoji: '🫧', label: '清汤' },
      { emoji: '🥜', label: '麻酱' },
    ],
  },
  {
    emoji: '🍗', label: '炸鸡',
    flavors: [
      { emoji: '🧂', label: '原味' },
      { emoji: '🌶️', label: '香辣' },
      { emoji: '🧄', label: '蒜香' },
      { emoji: '🍯', label: '蜜汁' },
      { emoji: '🍬', label: '甜辣' },
    ],
  },
]

const PAYERS = [
  { emoji: '💰', label: 'AA制' },
  { emoji: '🎉', label: 'E人请客' },
  { emoji: '🎲', label: '骰子最小请' },
  { emoji: '🎂', label: '寿星请客' },
  { emoji: '⏰', label: '迟到的请' },
  { emoji: '✊', label: '猜拳输的请' },
]

const RESULT_MESSAGES = [
  '今晚的命运已被锁定 🔒',
  '天选之食就是它了 ✨',
  '就这么决定了，不许反悔 🎯',
  '命运的齿轮已经转动 ⚙️',
  '老虎机已宣判，全员服从 🎰',
]

const PHASE_MESSAGES = {
  idle: '拉下摇杆，今晚吃啥全看天意！',
  food: '先看今晚吃什么… 🤔',
  flavor: '什么口味呢… 🧐',
  payer: '最关键的来了，谁请客… 💸',
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
  return new Promise((resolve) => setTimeout(resolve, ms))
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
          <span className="text-xs font-semibold mt-1">
            {getItem(0).label}
          </span>
        </div>
        <div className="h-11 flex flex-col items-center justify-center opacity-20">
          <span className="text-base leading-none">{getItem(1).emoji}</span>
          <span className="text-[10px] mt-0.5">{getItem(1).label}</span>
        </div>
      </div>
    </div>
  )
}

export default function SlotMachine() {
  const [phase, setPhase] = useState('idle')
  const [foodDisplay, setFoodDisplay] = useState(0)
  const [flavorDisplay, setFlavorDisplay] = useState(0)
  const [payerDisplay, setPayerDisplay] = useState(0)
  const [currentFlavors, setCurrentFlavors] = useState(CATEGORIES[0].flavors)
  const [resultMsg, setResultMsg] = useState('')

  const pull = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'done') return
    haptic('spin')

    setPhase('food')
    const foodIdx = await spinReel(CATEGORIES, setFoodDisplay, 15)

    await pause(500)

    const flavors = CATEGORIES[foodIdx].flavors
    setCurrentFlavors(flavors)
    setFlavorDisplay(0)
    setPhase('flavor')
    const flavorIdx = await spinReel(flavors, setFlavorDisplay, 15)

    await pause(500)

    setPhase('payer')
    await spinReel(PAYERS, setPayerDisplay, 15)

    await pause(300)

    setPhase('done')
    setResultMsg(
      RESULT_MESSAGES[Math.floor(Math.random() * RESULT_MESSAGES.length)]
    )
    haptic('success')
  }, [phase])

  const getReelState = (reelIndex) => {
    if (phase === 'idle') return 'idle'
    if (phase === 'done') return 'stopped'
    const activeIdx = { food: 0, flavor: 1, payer: 2 }[phase]
    if (reelIndex < activeIdx) return 'stopped'
    if (reelIndex === activeIdx) return 'spinning'
    return 'waiting'
  }

  const reels = [
    { label: '吃什么', items: CATEGORIES, display: foodDisplay },
    { label: '口味', items: currentFlavors, display: flavorDisplay },
    { label: '谁请客', items: PAYERS, display: payerDisplay },
  ]

  const isSpinning = !['idle', 'done'].includes(phase)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-text-secondary text-sm text-center min-h-[20px]">
        {PHASE_MESSAGES[phase] || ''}
      </p>

      {/* Slot Machine Frame */}
      <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse [animation-delay:0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:0.6s]" />
          <span className="text-[10px] text-gray-400 font-bold tracking-widest mx-2">
            SLOT MACHINE
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse [animation-delay:0.6s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse [animation-delay:0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        </div>

        <div className="relative bg-white rounded-xl overflow-hidden">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-14 bg-primary/5 border-y-2 border-primary/20 pointer-events-none z-10" />
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

          <div className="flex divide-x divide-gray-100">
            {reels.map((reel, i) => {
              const state = getReelState(i)
              return (
                <ReelCell
                  key={i}
                  items={reel.items}
                  displayIndex={reel.display}
                  state={state === 'idle' ? 'spinning' : state}
                />
              )
            })}
          </div>
        </div>

        <div className="flex mt-2">
          {reels.map((reel, i) => (
            <div
              key={i}
              className="flex-1 text-center text-[10px] text-gray-400 font-medium tracking-wide"
            >
              {reel.label}
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {phase === 'done' && (
        <div className="animate-pop-in text-center space-y-1.5">
          <p className="text-sm font-bold text-text">{resultMsg}</p>
          <div className="flex items-center justify-center gap-1.5 text-xl">
            {reels.map((reel, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-xs text-text-secondary">+</span>
                )}
                {reel.items[reel.display].emoji}
              </span>
            ))}
          </div>
          <p className="text-sm text-text-secondary">
            {reels.map((reel, i) => reel.items[reel.display].label).join(
              ' · '
            )}
          </p>
        </div>
      )}

      {/* Pull Lever Button */}
      <button
        onClick={pull}
        disabled={isSpinning}
        className="px-8 py-3 bg-gradient-to-r from-accent to-accent-light text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
      >
        {isSpinning
          ? '命运转动中… 🌀'
          : phase === 'done'
            ? '不服？再来一把 🎰'
            : '🎰 拉下摇杆！'}
      </button>
    </div>
  )
}
