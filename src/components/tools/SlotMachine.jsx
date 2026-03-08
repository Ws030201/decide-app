import { useState, useCallback, useRef } from 'react'
import { haptic } from '../../utils/haptic'

const CATEGORIES = [
  { emoji: '🍲', label: '火锅' },
  { emoji: '🥩', label: '烧烤' },
  { emoji: '🍣', label: '日料' },
  { emoji: '🥗', label: '轻食' },
  { emoji: '🍔', label: '快餐' },
  { emoji: '🍺', label: '大排档' },
  { emoji: '🧋', label: '奶茶' },
  { emoji: '🍝', label: '西餐' },
  { emoji: '🌶️', label: '麻辣烫' },
  { emoji: '🍗', label: '炸鸡' },
]

const FLAVORS = [
  { emoji: '🌶️', label: '重辣' },
  { emoji: '🍃', label: '清淡' },
  { emoji: '🍬', label: '甜口' },
  { emoji: '🤷', label: '随便' },
  { emoji: '🍋', label: '酸爽' },
  { emoji: '🧂', label: '咸香' },
]

const PAYERS = [
  { emoji: '💰', label: 'AA制' },
  { emoji: '🎉', label: 'E人请客' },
  { emoji: '🎲', label: '骰子最小请' },
  { emoji: '🎂', label: '寿星请客' },
  { emoji: '⏰', label: '迟到的请' },
  { emoji: '✊', label: '猜拳输的请' },
]

const REELS = [
  { label: '吃什么', items: CATEGORIES },
  { label: '口味', items: FLAVORS },
  { label: '谁请客', items: PAYERS },
]

const RESULT_MESSAGES = [
  '今晚的命运已被锁定 🔒',
  '天选之食就是它了 ✨',
  '就这么决定了，不许反悔 🎯',
  '命运的齿轮已经转动 ⚙️',
  '老虎机已宣判，全员服从 🎰',
]

function ReelCell({ items, displayIndex }) {
  const getItem = (offset) =>
    items[(displayIndex + offset + items.length) % items.length]

  return (
    <div className="flex-1 relative">
      <div className="flex flex-col items-center">
        <div className="h-11 flex flex-col items-center justify-center opacity-20">
          <span className="text-base leading-none">{getItem(-1).emoji}</span>
          <span className="text-[10px] mt-0.5">{getItem(-1).label}</span>
        </div>
        <div className="h-14 flex flex-col items-center justify-center">
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

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false)
  const [displays, setDisplays] = useState([0, 0, 0])
  const [showResult, setShowResult] = useState(false)
  const [resultMsg, setResultMsg] = useState('')
  const timersRef = useRef([])

  const pull = useCallback(() => {
    if (spinning) return
    haptic('spin')
    setSpinning(true)
    setShowResult(false)

    const finals = REELS.map((r) => Math.floor(Math.random() * r.items.length))

    REELS.forEach((reel, reelIdx) => {
      let speed = 50
      let steps = 0
      const totalSteps = 12 + reelIdx * 8 + Math.floor(Math.random() * 5)

      function tick() {
        setDisplays((prev) => {
          const next = [...prev]
          next[reelIdx] = Math.floor(Math.random() * reel.items.length)
          return next
        })
        steps++

        if (steps >= totalSteps) {
          setDisplays((prev) => {
            const next = [...prev]
            next[reelIdx] = finals[reelIdx]
            return next
          })
          haptic('medium')

          if (reelIdx === REELS.length - 1) {
            setTimeout(() => {
              setSpinning(false)
              setShowResult(true)
              setResultMsg(
                RESULT_MESSAGES[
                  Math.floor(Math.random() * RESULT_MESSAGES.length)
                ]
              )
              haptic('success')
            }, 200)
          }
          return
        }

        if (steps > totalSteps * 0.65) speed += 30
        timersRef.current[reelIdx] = setTimeout(tick, speed)
      }

      timersRef.current[reelIdx] = setTimeout(tick, speed)
    })
  }, [spinning])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-text-secondary text-sm">
        {spinning ? '命运正在转动…' : '拉下摇杆，今晚吃啥全看天意！'}
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
          {/* Center highlight bar */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-14 bg-primary/5 border-y-2 border-primary/20 pointer-events-none z-10" />
          {/* Top/bottom fade masks */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

          <div className="flex divide-x divide-gray-100">
            {REELS.map((reel, i) => (
              <ReelCell
                key={i}
                items={reel.items}
                displayIndex={displays[i]}
              />
            ))}
          </div>
        </div>

        <div className="flex mt-2">
          {REELS.map((reel, i) => (
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
      {showResult && !spinning && (
        <div className="animate-pop-in text-center space-y-1">
          <p className="text-sm font-bold text-text">{resultMsg}</p>
          <div className="flex items-center justify-center gap-1.5 text-xl">
            {REELS.map((reel, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-xs text-text-secondary">+</span>
                )}
                {reel.items[displays[i]].emoji}
              </span>
            ))}
          </div>
          <p className="text-sm text-text-secondary">
            {REELS.map((reel, i) => reel.items[displays[i]].label).join(
              ' · '
            )}
          </p>
        </div>
      )}

      {/* Pull Lever Button */}
      <button
        onClick={pull}
        disabled={spinning}
        className="px-8 py-3 bg-gradient-to-r from-accent to-accent-light text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
      >
        {spinning
          ? '命运转动中… 🌀'
          : showResult
            ? '不服？再来一把 🎰'
            : '🎰 拉下摇杆！'}
      </button>
    </div>
  )
}
