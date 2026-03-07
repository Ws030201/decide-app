import { useState, useCallback } from 'react'
import { haptic } from '../../utils/haptic'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const RESULT_QUIPS = [
  ['1 点… 今天的运气留给明天了 😅', '最小值也是一种天选！'],
  ['2 点，至少不是 1 🤷', '比倒数第一强一丢丢'],
  ['3 点，中规中矩', '安全区域，稳如老狗 🐕'],
  ['4 点，运气还不错嘛', '老天爷今天给面子了 ✨'],
  ['5 点！差一点就封顶了', '遗憾也是一种美 🥹'],
  ['6 点！！欧皇降临！！', '你就是今晚最靓的仔 👑'],
]

export default function DiceRoller() {
  const [value, setValue] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [displayFace, setDisplayFace] = useState(null)

  const roll = useCallback(() => {
    if (rolling) return
    haptic('dice')
    setRolling(true)

    let count = 0
    const maxCount = 15
    const interval = setInterval(() => {
      const randomVal = Math.floor(Math.random() * 6)
      setDisplayFace(DICE_FACES[randomVal])
      count++
      if (count >= maxCount) {
        clearInterval(interval)
        const finalVal = Math.floor(Math.random() * 6)
        setValue(finalVal + 1)
        setDisplayFace(DICE_FACES[finalVal])
        haptic('success')
        setRolling(false)
      }
    }, 80)
  }, [rolling])

  const quip = value ? RESULT_QUIPS[value - 1] : null

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-text-secondary text-sm">
        {rolling ? '骰子在空中翻滚… 🎲' : '戳它！让命运来做决定'}
      </p>

      <button
        onClick={roll}
        disabled={rolling}
        className={`w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95 ${
          rolling ? 'animate-shake' : 'hover:scale-105'
        }`}
      >
        <span className="text-6xl">
          {displayFace || '🎲'}
        </span>
      </button>

      {value !== null && !rolling && (
        <div className="animate-pop-in text-center space-y-1.5">
          <div className="text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {value}
          </div>
          {quip && (
            <>
              <p className="text-sm font-medium text-text">{quip[0]}</p>
              <p className="text-xs text-text-secondary">{quip[1]}</p>
            </>
          )}
        </div>
      )}

      <button
        onClick={roll}
        disabled={rolling}
        className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
      >
        {rolling ? '命运正在翻滚… 🌀' : value ? '不服？再来一把！🎲' : '🎲 投掷骰子'}
      </button>
    </div>
  )
}
