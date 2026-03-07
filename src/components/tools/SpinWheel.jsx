import { useState, useRef, useCallback } from 'react'
import { Plus, X, RotateCcw } from 'lucide-react'
import { haptic } from '../../utils/haptic'

const WHEEL_COLORS = [
  '#6c5ce7', '#fd79a8', '#00b894', '#fdcb6e',
  '#e17055', '#0984e3', '#e84393', '#55efc4',
  '#a29bfe', '#fab1a0', '#74b9ff', '#ffeaa7',
]

const PRESET_TOPICS = [
  '谁请喝奶茶 🧋',
  '谁来选餐厅 🍕',
  '谁先开麦唱歌 🎤',
  '谁来当摄影师 📸',
]

export default function SpinWheel() {
  const [names, setNames] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)
  const [topic, setTopic] = useState(PRESET_TOPICS[0])
  const [showTopics, setShowTopics] = useState(false)
  const wheelRef = useRef(null)

  const addName = useCallback(() => {
    const trimmed = inputVal.trim()
    if (!trimmed || names.length >= 12) return
    haptic('light')
    setNames(prev => [...prev, trimmed])
    setInputVal('')
    setResult(null)
  }, [inputVal, names.length])

  const removeName = (idx) => {
    haptic('light')
    setNames(prev => prev.filter((_, i) => i !== idx))
    setResult(null)
  }

  const spin = useCallback(() => {
    if (spinning || names.length < 2) return
    haptic('spin')
    setSpinning(true)
    setResult(null)

    const winnerIdx = Math.floor(Math.random() * names.length)
    const segAngle = 360 / names.length
    const targetAngle = 360 - (winnerIdx * segAngle + segAngle / 2)
    const spins = 5 + Math.floor(Math.random() * 3)
    const finalRotation = rotation + spins * 360 + targetAngle - (rotation % 360)

    setRotation(finalRotation)

    setTimeout(() => {
      haptic('success')
      setResult(names[winnerIdx])
      setSpinning(false)
    }, 4200)
  }, [spinning, names, rotation])

  const reset = () => {
    haptic('medium')
    setNames([])
    setResult(null)
    setRotation(0)
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Topic Selector */}
      <div className="w-full">
        <button
          onClick={() => setShowTopics(!showTopics)}
          className="w-full text-center py-2 px-4 bg-accent/10 rounded-xl text-sm font-medium text-accent border border-accent/20 transition-all hover:bg-accent/15"
        >
          {topic}
          <span className="ml-1 text-xs opacity-60">▼</span>
        </button>
        {showTopics && (
          <div className="mt-1 bg-white rounded-xl border border-purple-100 shadow-lg p-2 animate-slide-up">
            {PRESET_TOPICS.map(t => (
              <button
                key={t}
                onClick={() => { setTopic(t); setShowTopics(false); haptic('light') }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  t === topic ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name Input */}
      <div className="w-full flex gap-2">
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addName()}
          placeholder="输入名字，回车添加"
          maxLength={10}
          className="flex-1 px-4 py-2.5 rounded-xl border border-purple-100 text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
        />
        <button
          onClick={addName}
          disabled={!inputVal.trim() || names.length >= 12}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Names Tags */}
      {names.length > 0 && (
        <div className="w-full flex flex-wrap gap-1.5">
          {names.map((name, idx) => (
            <span
              key={idx}
              className="animate-pop-in inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: WHEEL_COLORS[idx % WHEEL_COLORS.length] }}
            >
              {name}
              <button onClick={() => removeName(idx)} className="hover:bg-white/20 rounded-full p-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
          <button onClick={reset} className="text-xs text-text-secondary hover:text-accent flex items-center gap-0.5 px-2">
            <RotateCcw size={10} /> 清空
          </button>
        </div>
      )}

      {/* Wheel */}
      {names.length >= 2 ? (
        <div className="relative w-64 h-64 my-2">
          {/* Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md" />

          {/* Wheel */}
          <svg
            ref={wheelRef}
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-lg"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {names.map((name, idx) => {
              const n = names.length
              const angle = 360 / n
              const startAngle = idx * angle - 90
              const endAngle = startAngle + angle
              const startRad = (startAngle * Math.PI) / 180
              const endRad = (endAngle * Math.PI) / 180
              const x1 = 100 + 95 * Math.cos(startRad)
              const y1 = 100 + 95 * Math.sin(startRad)
              const x2 = 100 + 95 * Math.cos(endRad)
              const y2 = 100 + 95 * Math.sin(endRad)
              const largeArc = angle > 180 ? 1 : 0
              const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180
              const textX = 100 + 60 * Math.cos(midAngle)
              const textY = 100 + 60 * Math.sin(midAngle)
              const textRotation = (startAngle + endAngle) / 2 + 90

              return (
                <g key={idx}>
                  <path
                    d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={WHEEL_COLORS[idx % WHEEL_COLORS.length]}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize={n > 8 ? '7' : n > 5 ? '8' : '10'}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  >
                    {name.length > 4 ? name.slice(0, 4) + '…' : name}
                  </text>
                </g>
              )
            })}
            <circle cx="100" cy="100" r="18" fill="white" />
            <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="#6c5ce7">
              GO
            </text>
          </svg>
        </div>
      ) : (
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border-4 border-dashed border-primary/20 flex items-center justify-center my-2">
          <div className="text-center text-text-secondary">
            <span className="text-4xl block mb-2">🎡</span>
            <p className="text-sm">至少添加 2 个人</p>
            <p className="text-xs opacity-60">才能开始转动转盘</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !spinning && (
        <div className="animate-pop-in text-center bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-4 w-full border border-accent/20">
          <p className="text-sm text-text-secondary mb-1">{topic}</p>
          <p className="text-3xl font-extrabold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            {result}
          </p>
          <p className="text-xs text-text-secondary mt-2">
            命运的齿轮开始转动… 🎉
          </p>
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={spinning || names.length < 2}
        className="w-full px-8 py-3 bg-gradient-to-r from-accent to-primary text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-40 text-sm"
      >
        {spinning ? '命运正在抉择中… 🌀' : names.length < 2 ? '至少需要 2 个人哦' : '🎡 转！谁是天选之人？'}
      </button>
    </div>
  )
}
