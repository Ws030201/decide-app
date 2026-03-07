import { useState, useCallback } from 'react'
import { haptic } from '../../utils/haptic'

const QUIPS = [
  '这个数字有什么特殊含义吗？🤔',
  '命运说了算！不许赖账 😤',
  '数字已定，拒绝申诉 ⚖️',
  '欧皇之选 👑',
  '就它了！别想了 🎯',
  '这是宇宙给你的暗号 🌌',
]

export default function RandomNumber() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [result, setResult] = useState(null)
  const [animating, setAnimating] = useState(false)
  const [quip, setQuip] = useState('')

  const generate = useCallback(() => {
    if (animating) return
    haptic('medium')
    const lo = Math.min(min, max)
    const hi = Math.max(min, max)
    setAnimating(true)

    let count = 0
    const maxCount = 20
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * (hi - lo + 1)) + lo)
      count++
      if (count >= maxCount) {
        clearInterval(interval)
        const final = Math.floor(Math.random() * (hi - lo + 1)) + lo
        setResult(final)
        setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)])
        haptic('success')
        setAnimating(false)
      }
    }, 60)
  }, [min, max, animating])

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-text-secondary text-sm">
        {animating ? '数字在疯狂跳动… 🔢' : '设定范围，交给天意'}
      </p>

      <div className="flex items-center gap-3 w-full max-w-[280px]">
        <div className="flex-1">
          <label className="text-[10px] text-text-secondary mb-1 block">最小值</label>
          <input
            type="number"
            value={min}
            onChange={e => setMin(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-purple-100 text-center text-lg font-bold text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
          />
        </div>
        <span className="text-text-secondary font-bold mt-4">~</span>
        <div className="flex-1">
          <label className="text-[10px] text-text-secondary mb-1 block">最大值</label>
          <input
            type="number"
            value={max}
            onChange={e => setMax(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-purple-100 text-center text-lg font-bold text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
          />
        </div>
      </div>

      <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 border-4 border-accent/30 flex items-center justify-center transition-all duration-300 ${
        animating ? 'scale-110 border-accent' : ''
      }`}>
        <span className={`font-extrabold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent transition-all duration-200 ${
          result !== null ? 'text-5xl' : 'text-3xl opacity-30'
        }`}>
          {result !== null ? result : '?'}
        </span>
      </div>

      {result !== null && !animating && quip && (
        <p className="animate-pop-in text-xs text-text-secondary text-center">{quip}</p>
      )}

      <button
        onClick={generate}
        disabled={animating}
        className="px-8 py-3 bg-gradient-to-r from-accent to-accent-light text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
      >
        {animating ? '命运正在计算… 🌀' : result !== null ? '不满意？再来！✨' : '✨ 生成随机数'}
      </button>
    </div>
  )
}
